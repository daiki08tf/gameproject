/* ============================================================
   Companion battle participation / 3-member party AI
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { defMitigationPct } from '../data/combatStats.js';
import { BOSS_AI_LAYER } from '../data/balance.js';
import { COMPANION_NATURES, companionTraitEffect, getCompanionSpecies } from '../data/companions.js';
import { chooseCompanionSkill } from '../data/companionSkills.js';

export const BOSS_COMPANION_COMBAT = Object.freeze({
  BASIC_CLEAVE_CHANCE: 0.22,
  BASIC_CLEAVE_MULT: 0.38,
  BASIC_HP_FLOOR: 0.045,
  BASIC_HP_CAP: 0.10,
  SPECIAL_SPLASH_MULT: 0.42,
  SPECIAL_HP_FLOOR: 0.14,
  SPECIAL_HP_CAP: 0.32,
  SPECIAL_KIND_MULT: Object.freeze({ slam:1.00, charge:1.15, projectile:0.85 }),
  NATURE_DAMAGE_MULT: Object.freeze({ defensive:0.70, support:0.90, balanced:1.0, aggressive:1.10 }),
});

function battleCompanionFrom(c, slot, synergy = {}) {
  const hp=Math.max(1,Math.round(c.stats.hp*(synergy.hpMult||1)));
  return {
    id:c.id,slot,name:c.instance.nickname||c.species.name,speciesId:c.instance.baseSpeciesId||c.species.id,
    nature:c.instance.nature,traits:[...(c.species.traits||[])],level:c.instance.level||1,
    hp,maxHp:hp,mp:c.stats.mp,maxMp:c.stats.mp,
    atk:Math.max(1,Math.round(c.stats.atk*(synergy.atkMult||1))),
    def:Math.max(1,Math.round(c.stats.def*(synergy.defMult||1))),
    mag:Math.max(1,Math.round(c.stats.mag*(synergy.magMult||1))),
    spd:Math.max(1,Math.round(c.stats.spd*(synergy.spdMult||1))),down:false,
  };
}
function ensureCompanionBattle(engine) {
  if(engine._companionBattleReady)return;engine._companionBattleReady=true;
  const party=state.activeCompanions?state.activeCompanions():(state.activeCompanion?.()?[state.activeCompanion()]:[]);
  const synergy=state.companionSynergySummary?.()||{active:[],total:{}};
  engine.companionSynergies=synergy.active||[];
  engine.companions=party.slice(0,3).map((c,i)=>battleCompanionFrom(c,i,synergy.total));
  engine.companion=engine.companions[0]||null;
}
function livingCompanions(engine){ensureCompanionBattle(engine);return(engine.companions||[]).filter(c=>!c.down&&c.hp>0);}
function traitEffect(companion,kind){for(const name of companion?.traits||[]){const effect=companionTraitEffect(name);if(effect?.kind===kind)return effect;}return null;}
function effectiveCompanionSpd(companion){const effect=traitEffect(companion,'initiativeSpd');return companion.spd*(1+(effect?.power||0));}
function chooseTarget(engine,companion,skill=null){const alive=engine.aliveEnemies;if(!alive.length)return null;if(skill?.preferLowHp)return[...alive].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];const nature=COMPANION_NATURES[companion.nature]||COMPANION_NATURES.balanced;if(nature.ai==='aggressive')return[...alive].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];if(nature.ai==='defensive')return[...alive].sort((a,b)=>b.atk-a.atk)[0];return alive[Math.floor(Math.random()*alive.length)];}
function companionDamage(companion,target,skill=null){const nature=COMPANION_NATURES[companion.nature]||COMPANION_NATURES.balanced;let stat=skill?.stat==='mag'?companion.mag:companion.atk;if(!skill&&nature.ai==='support'&&companion.mag>companion.atk)stat=companion.mag*.9;let power=stat*(skill?.power||1);const lowHp=traitEffect(companion,'lowHpDamage');if(lowHp&&target.hp/Math.max(1,target.maxHp)<=(lowHp.threshold??.5))power*=1+lowHp.power;const raw=Math.max(1,power*(.90+Math.random()*.20));const mitigation=defMitigationPct(target.def||0);return Math.max(1,Math.round(raw*(1-mitigation)));}
function companionNatureDamageMult(companion){const ai=(COMPANION_NATURES[companion?.nature]||COMPANION_NATURES.balanced).ai||'balanced';return BOSS_COMPANION_COMBAT.NATURE_DAMAGE_MULT[ai]||1;}
function enemyDamageToCompanion(enemy,companion,mult=1){let raw=Math.max(1,enemy.atk*mult*(.92+Math.random()*.16));const physicalMitigation=traitEffect(companion,'physicalMitigation');if(physicalMitigation)raw*=1-physicalMitigation.power;const mitigation=defMitigationPct(companion.def||0);return Math.max(1,Math.round(raw*(1-mitigation)));}
function bossDamageToCompanion(enemy,companion,mult=1,{floorPct=0,capPct=1}={}){
  const base=enemyDamageToCompanion(enemy,companion,mult),nature=companionNatureDamageMult(companion),physicalMitigation=traitEffect(companion,'physicalMitigation')?.power||0;
  const floor=Math.max(1,Math.round(companion.maxHp*floorPct*nature*(1-physicalMitigation)));
  const cap=Math.max(floor,Math.round(companion.maxHp*capPct*nature));
  return Math.max(floor,Math.min(cap,base));
}
function executeHeal(companion,skill){companion.mp-=skill.mpCost||0;const amount=Math.max(1,Math.round(companion.maxHp*(skill.maxHpPct||0)+companion.mag*(skill.power||0))),before=companion.hp;companion.hp=Math.min(companion.maxHp,companion.hp+amount);return{action:'skill',companion:true,companionId:companion.id,companionName:companion.name,name:`${companion.name}の${skill.name}`,techType:'heal',healAmount:companion.hp-before,mpRestored:0,buffed:false,targets:[]};}
function applySkillDebuff(target,skill){const debuff=skill?.debuff;if(!debuff)return null;if(debuff.kind==='weakenAtk'){target._companionAtkDebuffMult=Math.max(.1,1-debuff.power);target._companionAtkDebuffTurns=Math.max(target._companionAtkDebuffTurns||0,debuff.turns||1);return{kind:debuff.kind,power:debuff.power,turns:debuff.turns||1};}return null;}
function executeOffensiveSkill(engine,companion,skill){const target=chooseTarget(engine,companion,skill);if(!target)return null;companion.mp-=skill.mpCost||0;const damage=companionDamage(companion,target,skill),kill=engine._applyRawDamageAndReward(target,damage),debuff=target.dead?null:applySkillDebuff(target,skill);return{action:'skill',companion:true,companionId:companion.id,companionName:companion.name,name:`${companion.name}の${skill.name}`,techType:skill.type==='debuff'?'damage':skill.type,targets:[{targetId:target.id,targetName:target.name,damage,critical:false,defeated:target.dead,effects:debuff?[debuff]:[],kill}]};}
function performCompanionTurn(engine, companion = null) {ensureCompanionBattle(engine);const c=companion||engine.companion;if(!c||c.down||c.hp<=0||engine.over)return null;const species=getCompanionSpecies(c.speciesId);if(!species)return null;const skill=chooseCompanionSkill(species,c,engine.aliveEnemies);if(!skill)return null;if(skill.type==='heal')return executeHeal(c,skill);return executeOffensiveSkill(engine,c,skill);}
function companionCanBeTargeted(engine){return livingCompanions(engine).length>0;}
function applyDamageToCompanion(enemy,c,mult=1,opts=null){const damage=opts?bossDamageToCompanion(enemy,c,mult,opts):enemyDamageToCompanion(enemy,c,mult);c.hp=Math.max(0,c.hp-damage);if(c.hp<=0)c.down=true;return{enemyId:enemy.id,name:enemy.name,kind:'attack',damage,evaded:false,companionTarget:true,companionId:c.id,companionName:c.name,companionHp:c.hp,companionMaxHp:c.maxHp,companionDown:c.down};}
function hitCompanion(engine,enemy,mult=1,opts=null){const alive=livingCompanions(engine);if(!alive.length)return null;const c=alive[Math.floor(Math.random()*alive.length)];return applyDamageToCompanion(enemy,c,mult,opts);}
function bossSpecialBaseMult(kind){if(kind==='slam')return BOSS_AI_LAYER.SLAM_DAMAGE_MULT||1;if(kind==='charge')return BOSS_AI_LAYER.CHARGE_DAMAGE_MULT||1;if(kind==='projectile')return BOSS_AI_LAYER.PROJECTILE_DAMAGE_MULT||1;return 1;}
function bossCompanionCollateral(engine,enemy,result){
  if(!enemy?.boss||!result||!companionCanBeTargeted(engine))return [];
  if(result.kind==='special'){
    const kindMult=BOSS_COMPANION_COMBAT.SPECIAL_KIND_MULT[result.specialKind]||1,mult=bossSpecialBaseMult(result.specialKind)*BOSS_COMPANION_COMBAT.SPECIAL_SPLASH_MULT;
    const opts={floorPct:BOSS_COMPANION_COMBAT.SPECIAL_HP_FLOOR*kindMult,capPct:BOSS_COMPANION_COMBAT.SPECIAL_HP_CAP*kindMult};
    return [...livingCompanions(engine)].map(c=>applyDamageToCompanion(enemy,c,mult,opts));
  }
  if(result.kind==='attack'&&Math.random()<BOSS_COMPANION_COMBAT.BASIC_CLEAVE_CHANCE){
    const hit=hitCompanion(engine,enemy,BOSS_COMPANION_COMBAT.BASIC_CLEAVE_MULT,{floorPct:BOSS_COMPANION_COMBAT.BASIC_HP_FLOOR,capPct:BOSS_COMPANION_COMBAT.BASIC_HP_CAP});return hit?[hit]:[];
  }
  return [];
}
function withCompanionEnemyDebuff(enemy,fn){if(!enemy||!enemy._companionAtkDebuffTurns||!enemy._companionAtkDebuffMult)return fn();const originalAtk=enemy.atk;enemy.atk=Math.max(1,Math.round(originalAtk*enemy._companionAtkDebuffMult));try{return fn();}finally{enemy.atk=originalAtk;enemy._companionAtkDebuffTurns-=1;if(enemy._companionAtkDebuffTurns<=0){delete enemy._companionAtkDebuffTurns;delete enemy._companionAtkDebuffMult;}}}
const originalPerformEnemyTurn=BattleEngine.prototype.performEnemyTurn;
BattleEngine.prototype.performEnemyTurn=function patchedPerformEnemyTurn(enemy){ensureCompanionBattle(this);if(enemy&&enemy.frozenTurns>0)return originalPerformEnemyTurn.call(this,enemy);return withCompanionEnemyDebuff(enemy,()=>{if(!enemy.dead&&!enemy.boss&&companionCanBeTargeted(this)){const candidates=livingCompanions(this),defensive=candidates.filter(c=>(COMPANION_NATURES[c.nature]||COMPANION_NATURES.balanced).ai==='defensive'),targetChance=.28+(defensive.length?.07:0);if(Math.random()<targetChance)return hitCompanion(this,enemy);}const result=originalPerformEnemyTurn.call(this,enemy);if(enemy?.boss&&result)result.companionSplash=bossCompanionCollateral(this,enemy,result);return result;});};
function companionHitLog(r,label='攻撃'){return{type:'playerAction',result:{action:'skill',name:`${r.name}の${label}${r.companionDown?`（${r.companionName}は力尽きた）`:''}`,techType:'damage',targets:[{targetName:r.companionName,damage:r.damage,critical:false,defeated:r.companionDown,effects:[],kill:null}]}};}
function convertCompanionCombatEvent(event){if(!event||event.type!=='enemyAction'||!event.result)return[event];const r=event.result;if(r.companionTarget)return[companionHitLog(r)];const splash=Array.isArray(r.companionSplash)?r.companionSplash.filter(Boolean):[];if(!splash.length)return[event];return[event,...splash.map(x=>companionHitLog(x,r.kind==='special'?'特殊攻撃の余波':'攻撃の巻き込み'))];}
function companionActsBeforeEnemyPhase(engine,c=null){ensureCompanionBattle(engine);const companion=c||engine.companion,enemies=engine.aliveEnemies;if(!companion||companion.down||!enemies.length)return false;const fastestEnemy=Math.max(...enemies.map(e=>e.spd||0));return effectiveCompanionSpd(companion)>=fastestEnemy;}
function actCompanions(engine,predicate){const events=[];for(const c of livingCompanions(engine)){if(engine._companionsActedThisRound.has(c.id))continue;if(predicate&&!predicate(c))continue;const result=performCompanionTurn(engine,c);if(result){engine._companionsActedThisRound.add(c.id);events.push({type:'playerAction',result});if(engine.aliveEnemies.length===0)break;}}return events;}
const originalRunEnemyPhase=BattleEngine.prototype._runEnemyPhase;
BattleEngine.prototype._runEnemyPhase=function patchedRunEnemyPhase(){ensureCompanionBattle(this);this._companionsActedThisRound||=new Set();const events=actCompanions(this,c=>companionActsBeforeEnemyPhase(this,c));if(this.aliveEnemies.length>0&&this.player.hp>0)events.push(...originalRunEnemyPhase.call(this));return events;};
const originalAdvanceTurn=BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn=function patchedAdvanceTurn(command){ensureCompanionBattle(this);this._companionsActedThisRound=new Set();const out=originalAdvanceTurn.call(this,command);if(out.events)out.events=out.events.flatMap(convertCompanionCombatEvent);const blocked=out.events&&out.events.some(ev=>ev.type==='playerAction'&&ev.result&&ev.result.blocked),fled=out.result&&out.result.retreated;if(!blocked&&!fled&&!out.over&&this.player.hp>0&&this.aliveEnemies.length>0)out.events.push(...actCompanions(this));if(!out.over&&this.aliveEnemies.length===0){const end=this.checkBattleEnd();if(end.over){out.over=true;out.result=this.finalResult;}}return out;};
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function patchedGrantKillRewards(enemy){const result=originalGrantKillRewards.call(this,enemy);if(result&&(enemy.xp||0)>0&&state.gainPartyCompanionExp){const gained=Math.round(enemy.xp*.75);if(gained>0){const awards=state.gainPartyCompanionExp(gained);result.companionExpAwards=awards;result.companionExp=awards[0]?.gained||0;result.companionLeveledUp=awards.some(x=>x.leveledUp);}}return result;};
function ensureCompanionHud(screen){if(!screen||!screen.engine)return null;ensureCompanionBattle(screen.engine);let el=document.getElementById('tbCompanionHud');if(!screen.engine.companions?.length){if(el)el.remove();return null;}if(!el){el=document.createElement('div');el.id='tbCompanionHud';el.className='forge-card-sub';el.style.padding='5px 10px';el.style.margin='4px 8px';document.querySelector('#textBattleScreen .tb-hud')?.appendChild(el);}return el;}
const originalRender=TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render=function patchedCompanionRender(){originalRender.call(this);const el=ensureCompanionHud(this);if(!el)return;const synergy=this.engine.companionSynergies?.length?`<div>シナジー: ${this.engine.companionSynergies.map(s=>s.name).join(' / ')}</div>`:'';el.innerHTML=synergy+this.engine.companions.map((c,i)=>{const down=c.down||c.hp<=0;return `<div style="opacity:${down?.55:1}">仲間${i+1} ${c.name} Lv.${c.level}　HP ${Math.max(0,c.hp)}/${c.maxHp}　MP ${Math.max(0,c.mp)}/${c.maxMp}${down?'　【戦闘不能】':''}</div>`;}).join('');};
export { performCompanionTurn,effectiveCompanionSpd,companionDamage,enemyDamageToCompanion,bossDamageToCompanion,applySkillDebuff,livingCompanions,bossCompanionCollateral,companionNatureDamageMult };
