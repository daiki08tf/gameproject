/* System Deepening Pack B — Companion individuality / Codex Field Guide / Rare presentation */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { enemyCombatProfile, enemyRole } from '../data/enemyCombat3.js';
import {
  companionRareTrait,rollCompanionRareTrait,rollCompanionEpithet,
  codexKnowledgeLevel,rareEncounterLines,
} from '../data/systemDeepeningPackB.js';

function ensureIndividuality(inst){
  if(!inst)return null;
  inst.rareTrait??=null;
  inst.epithet??=null;
  return inst;
}

// New recruits can occasionally gain a modest rare trait / cosmetic epithet.
// Old saves get safe null defaults lazily; they are never rerolled into inferiority.
if(state.createCompanion){
  const previousCreate=state.createCompanion.bind(state);
  state.createCompanion=function packBCreateCompanion(speciesId,opts={}){
    const id=previousCreate(speciesId,opts);
    const inst=id&&this.data.companionInstances?.[id];
    if(inst){
      inst.rareTrait=opts.rareTrait??rollCompanionRareTrait();
      inst.epithet=opts.epithet??rollCompanionEpithet();
      this.save();
    }
    return id;
  };
}

if(state.getCompanion){
  const previousGet=state.getCompanion.bind(state);
  state.getCompanion=function packBGetCompanion(id){
    const result=previousGet(id); if(!result)return result;
    const inst=ensureIndividuality(result.instance),trait=companionRareTrait(inst.rareTrait);
    if(trait?.statMult){
      result.stats={...result.stats};
      for(const [stat,mult] of Object.entries(trait.statMult)) if(result.stats[stat]!=null) result.stats[stat]=Math.max(1,Math.round(result.stats[stat]*mult));
    }
    result.individuality={rareTrait:trait,epithet:inst.epithet||null};
    return result;
  };
}

if(state.gainCompanionExp){
  const previousGain=state.gainCompanionExp.bind(state);
  state.gainCompanionExp=function packBGainCompanionExp(amount,id=this.activeCompanionId?.()){
    const inst=id&&this.data.companionInstances?.[id],trait=companionRareTrait(ensureIndividuality(inst)?.rareTrait);
    return previousGain(amount*(trait?.expMult||1),id);
  };
}

state.companionIndividuality=function companionIndividuality(id){
  const inst=this.data.companionInstances?.[id]; if(!inst)return null;
  ensureIndividuality(inst);
  return {trait:companionRareTrait(inst.rareTrait),epithet:inst.epithet||null};
};

// Existing Codex data remains authoritative; this is a derived semantic layer.
state.codexFieldGuide=function codexFieldGuide(enemyId){
  const entry=this.data.monsterCodex?.[enemyId]||{};
  const level=codexKnowledgeLevel(entry),profile=enemyCombatProfile(enemyId),role=enemyRole(enemyId);
  return {
    level,seen:!!entry.seen,kills:entry.kills||0,analyzed:!!entry.analyzed,
    role:level.rank>=2?role:null,
    behavior:level.rank>=2?(profile.skill?.name||'通常攻撃中心'):null,
    tacticalHint:level.rank>=3?(profile.skill?.kind?`特殊行動：${profile.skill.kind}`:'明確な特殊行動は未確認'):null,
    habitatHint:level.rank>=4?'遭遇記録と地域探索ログから生息域を追跡できる。':null,
    ecologyHint:level.rank>=5?(entry.rareEncounterSeen?'希少遭遇の観測記録あり。':'十分な観測記録が蓄積されている。'):null,
  };
};

function decorateCompanionCards(){
  const root=document.getElementById('companionContent'); if(!root)return;
  root.querySelectorAll('[data-companion-id]').forEach(card=>{
    if(card.querySelector('.packb-individuality'))return;
    const id=card.dataset.companionId,info=state.companionIndividuality?.(id); if(!info)return;
    const line=document.createElement('div'); line.className='forge-card-sub packb-individuality';
    const trait=info.trait?`◆ Rare Trait: ${info.trait.name}（${info.trait.desc}）`:'個体特性: 標準';
    const epithet=info.epithet?` / 称号「${info.epithet}」`:'';
    line.textContent=trait+epithet; card.querySelector('.confirm-actions')?.insertAdjacentElement('beforebegin',line);
  });
}

function decorateCodexCards(){
  const root=document.getElementById('monsterCodexContent'); if(!root)return;
  const entries=state.data.monsterCodex||{};
  root.querySelectorAll('.forge-card').forEach(card=>{
    if(card.querySelector('.packb-field-guide'))return;
    const title=card.querySelector('.forge-card-name')?.textContent?.trim(); if(!title||title.includes('図鑑完成度')||title==='？？？？')return;
    const pair=Object.entries(entries).find(([,e])=>(e?.name||'')===title); if(!pair)return;
    const [id]=pair,g=state.codexFieldGuide?.(id); if(!g?.seen)return;
    const d=document.createElement('details'); d.className='ui-detail-disclosure packb-field-guide';
    d.innerHTML=`<summary>FIELD GUIDE — ${g.level.label}</summary><div class="ui-detail-body" style="font-size:12px;line-height:1.7">`
      +`${g.role?`役割: ${g.role.icon||''} ${g.role.name}<br>`:''}`
      +`${g.behavior?`行動: ${g.behavior}<br>`:''}`
      +`${g.tacticalHint?`${g.tacticalHint}<br>`:''}`
      +`${g.habitatHint?`${g.habitatHint}<br>`:''}`
      +`${g.ecologyHint?`${g.ecologyHint}`:''}</div>`;
    card.appendChild(d);
  });
}

if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(()=>{queueMicrotask(()=>{decorateCompanionCards();decorateCodexCards();});});
  const start=()=>{for(const id of ['companionContent','monsterCodexContent']){const el=document.getElementById(id);if(el)observer.observe(el,{childList:true,subtree:true});}decorateCompanionCards();decorateCodexCards();};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
}

const ecologyForStage=(id='')=>id.includes('old-king')?'tomb':id.includes('phantom-beast')?'forest':id.includes('dragonbone')?'canyon':id.includes('inverted-library')?'library':id.includes('black-moon')?'temple':'boundary';

// Rare presentation is injected into the existing bounded battle log only when
// the rare wave actually appears. Repeat sightings collapse to one line.
const previousReveal=TextBattleScreen.prototype._revealNextGroupIfNeeded;
TextBattleScreen.prototype._revealNextGroupIfNeeded=function packBRareReveal(){
  const before=new Set((this.engine?.aliveEnemies||[]).map(e=>e.id));
  const result=previousReveal.apply(this,arguments);
  const rareId=this.engine?.stage?.phase12RareSpawnId; if(!rareId)return result;
  const rare=(this.engine.aliveEnemies||[]).find(e=>e.type===rareId&&!before.has(e.id)); if(!rare)return result;
  this._packBRareShown??=new Set(); if(this._packBRareShown.has(rare.id))return result; this._packBRareShown.add(rare.id);
  const entry=state.data.monsterCodex?.[rareId]||{}; const first=!entry.rareEncounterSeen;
  entry.name||=rare.name; entry.seen=true; entry.rareEncounterSeen=true; state.data.monsterCodex??={}; state.data.monsterCodex[rareId]=entry; state.save();
  this._pushLines(rareEncounterLines({name:rare.name,first,ecology:ecologyForStage(this.engine.stage.id)}));
  return result;
};

export { decorateCompanionCards,decorateCodexCards };
