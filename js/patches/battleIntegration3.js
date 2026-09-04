/* ============================================================
   Battle Integration 3.0 — tactical information loop
   ------------------------------------------------------------
   Connects systems that already exist instead of adding a new combat axis:
   - Element hits -> Codex knowledge
   - Codex role/skill knowledge -> battle enemy cards
   - Known element results -> technique menu recommendations
   - Existing Break / Boss telegraph / Companion tactics remain authoritative
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { ensureCodexEntry } from '../data/codex.js';
import { elementLabel } from '../data/combat2Elements.js';

function enemyId(enemy){ return enemy?.type || enemy?.enemyType || enemy?.typeId || null; }

export function elementObservationClass(multiplier){
  const mult=Number(multiplier);
  if(!Number.isFinite(mult)) return 'unknown';
  if(mult>1.05) return 'weak';
  if(mult<0.95) return 'resist';
  return 'neutral';
}

function ensureElementKnowledge(enemy){
  const id=enemyId(enemy);
  if(!id) return null;
  state.data.monsterCodex ||= {};
  const entry=ensureCodexEntry(state.data.monsterCodex,id,enemy?.name||id);
  entry.elementKnowledge ||= {};
  return entry;
}

state.markEnemyElementObserved=function markEnemyElementObserved(enemy,element,multiplier){
  if(!enemy||!element||element==='random'||!Number.isFinite(Number(multiplier))) return false;
  const entry=ensureElementKnowledge(enemy);
  if(!entry) return false;
  const rounded=Math.round(Number(multiplier)*100)/100;
  if(entry.elementKnowledge[element]===rounded) return false;
  entry.elementKnowledge[element]=rounded;
  this.save();
  return true;
};

state.enemyElementKnowledge=function enemyElementKnowledge(enemyType){
  const entry=this.data.monsterCodex?.[enemyType];
  return {...(entry?.elementKnowledge||{})};
};

const previousCalculateDamage=BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage=function battleIntegration3Damage(atk,target,opts={}){
  const result=previousCalculateDamage.call(this,atk,target,opts);
  if(result?.element&&target){
    const mult=Number(result.elementMultiplier ?? this.combat2ElementMultiplier?.(result.element,target) ?? 1);
    state.markEnemyElementObserved(target,result.element,mult);
  }
  return result;
};

function tacticalKnowledge(enemy){
  const id=enemyId(enemy);
  if(!id) return {role:null,skill:null,elements:[]};
  const knowledge=state.enemyKnowledge?.(id);
  const elements=Object.entries(state.enemyElementKnowledge?.(id)||{}).map(([element,multiplier])=>({
    element,multiplier,className:elementObservationClass(multiplier),
  }));
  return {
    role:knowledge?.roleKnown?knowledge.role:null,
    skill:knowledge?.behaviorKnown?(knowledge.observedSkills?.at(-1)||knowledge.skill?.name||null):null,
    elements,
  };
}

function elementKnowledgeText(rows){
  const weak=rows.filter(r=>r.className==='weak').map(r=>`${elementLabel(r.element)}×${r.multiplier.toFixed(2)}`);
  const resist=rows.filter(r=>r.className==='resist').map(r=>`${elementLabel(r.element)}×${r.multiplier.toFixed(2)}`);
  const neutral=rows.filter(r=>r.className==='neutral').map(r=>`${elementLabel(r.element)}×${r.multiplier.toFixed(2)}`);
  const parts=[];
  if(weak.length) parts.push(`弱点 ${weak.join(' ')}`);
  if(resist.length) parts.push(`耐性 ${resist.join(' ')}`);
  if(neutral.length&&parts.length===0) parts.push(`確認 ${neutral.join(' ')}`);
  return parts.join(' / ');
}

function enrichEnemyCards(screen){
  const cards=[...(screen.el.enemyList?.querySelectorAll('.tb-enemy-card')||[])];
  cards.forEach((card,index)=>{
    const enemy=screen.engine?.enemies?.[index];
    if(!enemy||enemy.dead) return;
    let line=card.querySelector('.tb-tactical-line');
    if(!line){
      line=document.createElement('div');
      line.className='tb-tactical-line';
      line.style.cssText='font-size:11px;opacity:.82;margin-top:3px;line-height:1.35';
      card.appendChild(line);
    }
    const known=tacticalKnowledge(enemy);
    const parts=[];
    if(known.role) parts.push(`ROLE ${known.role.name||known.role.id||''}`);
    const elementText=elementKnowledgeText(known.elements);
    if(elementText) parts.push(elementText);
    if(enemy.pendingSpecial) parts.push('特殊行動の予兆');
    else if(known.skill) parts.push(`観測技 ${known.skill}`);
    line.textContent=parts.length?parts.join(' / '):'攻略情報：未解析';
  });
}

function enrichTechniqueMenu(screen){
  if(!screen.techMenuKind||!screen.engine) return;
  const list=screen.techMenuKind==='spell'?screen.engine.availableSpells():screen.engine.availableSkills();
  const target=screen.engine.aliveEnemies.find(e=>e.id===screen.selectedTargetId)||null;
  const known=target?state.enemyElementKnowledge?.(enemyId(target))||{}:{};
  const rows=[...(screen.el.techList?.querySelectorAll('.tb-tech-item')||[])];
  rows.forEach((row,index)=>{
    const tech=list[index];
    if(!tech?.element||tech.element==='random') return;
    if(row.querySelector('.tb-tech-tactical')) return;
    const mult=known[tech.element];
    const badge=document.createElement('small');
    badge.className='tb-tech-tactical';
    badge.style.cssText='margin-left:auto;opacity:.8;font-size:10px';
    badge.textContent=Number.isFinite(mult)
      ? `${elementLabel(tech.element)} ×${Number(mult).toFixed(2)}`
      : `${elementLabel(tech.element)} ?`;
    row.appendChild(badge);
  });
}

const previousRender=TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render=function battleIntegration3Render(){
  previousRender.call(this);
  if(!this.engine) return;
  enrichEnemyCards(this);
  enrichTechniqueMenu(this);
};

export { tacticalKnowledge, elementKnowledgeText };
