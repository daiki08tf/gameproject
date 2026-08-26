/* Phase 13 replayability lives inside existing battle/stage-confirm surfaces. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { CHAPTERS } from '../data/stages.js';
import { buildSecretRealmStage } from '../data/secretRealms.js';
import { PHASE13_CHALLENGES,PHASE13_TITLES,phase13Challenge,phase13BuildFeatIds,phase13RareHunt } from '../data/phase13Replay.js';

const selectedChallenges=new Map();
const bossLike=stage=>Boolean(stage?.boss||stage?.raid||stage?.secretRealm);

function data(){
  if(!state.data.phase13)state.data.phase13={records:{},titles:[],buildFeats:[],challengeWins:0,rematchWins:0};
  const d=state.data.phase13;
  d.records ||= {};d.titles ||= [];d.buildFeats ||= [];d.challengeWins ||= 0;d.rematchWins ||= 0;
  return d;
}
function addUnique(list,id){if(list.includes(id))return false;list.push(id);return true;}
function unlockTitle(d,id,newTitles){if(addUnique(d.titles,id)){const t=PHASE13_TITLES.find(x=>x.id===id);if(t)newTitles.push(t);}}

state.phase13Data=()=>data();
state.phase13RecordFor=function(stageId){return data().records[stageId]||null;};
state.phase13Titles=function(){return PHASE13_TITLES.map(t=>({...t,unlocked:data().titles.includes(t.id)}));};
state.phase13SelectedChallenge=function(stageId){return phase13Challenge(selectedChallenges.get(stageId)||'none');};

export function selectPhase13Challenge(stageId,id){selectedChallenges.set(stageId,phase13Challenge(id).id);}
export function selectedPhase13Challenge(stageId){return state.phase13SelectedChallenge(stageId);}

state.phase13RecordClear=function(stage,metrics={}){
  const d=data(),id=stage.id,prev=d.records[id]||{clears:0,challengeClears:0,rematchClears:0,bestTurns:null,maxDamage:0,bestHpPct:0};
  const challenge=phase13Challenge(metrics.challengeId);
  const turns=Math.max(0,Math.floor(Number(metrics.turns)||0)),maxDamage=Math.max(0,Math.floor(Number(metrics.maxDamage)||0));
  const hpPct=Math.max(0,Math.min(100,Number(metrics.hpPct)||0));
  const rec={...prev,clears:prev.clears+1,bestTurns:turns>0?(prev.bestTurns==null?turns:Math.min(prev.bestTurns,turns)):prev.bestTurns,maxDamage:Math.max(prev.maxDamage||0,maxDamage),bestHpPct:Math.max(prev.bestHpPct||0,hpPct)};
  if(challenge.id!=='none'){rec.challengeClears=(rec.challengeClears||0)+1;d.challengeWins++;}
  if(challenge.rematch){rec.rematchClears=(rec.rematchClears||0)+1;d.rematchWins++;}
  d.records[id]=rec;
  const artifactCount=(state.data.equippedArtifacts||[]).filter(Boolean).length;
  const feats=phase13BuildFeatIds({bossLike:bossLike(stage),artifactCount,shield:Boolean(state.data.equipped?.shield),mastered:Boolean(state.isMastered?.(state.currentJobId)),challengeId:challenge.id});
  const newFeats=feats.filter(x=>addUnique(d.buildFeats,x));
  const newTitles=[];
  if(challenge.id!=='none')unlockTitle(d,'challenger',newTitles);
  if(challenge.rematch)unlockTitle(d,'rematcher',newTitles);
  if(newFeats.includes('artifactless'))unlockTitle(d,'artifactless_hunter',newTitles);
  if(Object.keys(d.records).length>=5)unlockTitle(d,'record_breaker',newTitles);
  if(id==='secret-convergence-observatory'&&challenge.rematch)unlockTitle(d,'apex_rematcher',newTitles);
  if(stage.phase13RareHuntName)unlockTitle(d,'rare_tracker',newTitles);
  state.save();
  return {record:rec,newFeats,newTitles,challenge};
};

export function renderPhase13ChallengePicker(stage){
  document.getElementById('phase13ChallengePicker')?.remove();
  const anchor=document.getElementById('confirmModifiers');if(!anchor||!stage)return;
  const wrap=document.createElement('div');wrap.id='phase13ChallengePicker';wrap.className='forge-card';wrap.style.marginTop='8px';
  const current=selectedPhase13Challenge(stage.id);
  const canRematch=Boolean(state.isStageCleared?.(stage.id)&&bossLike(stage));
  const choices=PHASE13_CHALLENGES.filter(x=>!x.rematch||canRematch);
  const title=document.createElement('div');title.className='forge-card-name';title.textContent='CHALLENGE';wrap.appendChild(title);
  const sub=document.createElement('div');sub.className='hint';sub.textContent='任意。難しくするほど既存EXP / Gold / Dropが増える。';wrap.appendChild(sub);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:5px;overflow-x:auto;padding-top:6px';
  for(const c of choices){const b=document.createElement('button');b.className=c.id===current.id?'btn-main':'btn-sub';b.style.flex='0 0 auto';b.textContent=c.name;b.title=c.desc;b.addEventListener('click',()=>{selectPhase13Challenge(stage.id,c.id);renderPhase13ChallengePicker(stage);});row.appendChild(b);}wrap.appendChild(row);
  const desc=document.createElement('div');desc.className='rec';desc.style.marginTop='5px';desc.textContent=current.desc;wrap.appendChild(desc);
  const rec=state.phase13RecordFor(stage.id);if(rec){const line=document.createElement('div');line.className='hint';line.style.marginTop='5px';line.textContent=`記録: 最少 ${rec.bestTurns??'-'} turn / 最大 ${Number(rec.maxDamage||0).toLocaleString()} dmg / Challenge ${rec.challengeClears||0}勝`;wrap.appendChild(line);}
  anchor.after(wrap);
}

function injectRareHunt(engine){
  const hunt=phase13RareHunt(engine.stage.id);if(!hunt||Math.random()>=hunt.chance)return null;
  const source=ENEMY_TYPES[hunt.sourceEnemyId];if(!source)return null;
  ENEMY_TYPES[hunt.enemyId]={...source,name:hunt.name,hp:Math.round(source.hp*1.18),atk:Math.round(source.atk*1.16),def:Math.round(source.def*1.10),speed:Math.round((source.speed||80)*1.08),boss:false,phase13RareHunt:true};
  const bossIndex=Math.max(0,engine.encounterQueue.length-1);engine.encounterQueue.splice(bossIndex,0,{type:hunt.enemyId,count:1});engine.totalToDefeat++;
  engine.stage={...engine.stage,phase13RareHuntName:hunt.name,phase13RareHuntId:hunt.enemyId,dropTable:[{itemId:hunt.dropId,weight:.28,phase13RareHunt:true},...(engine.stage.dropTable||[])]};
  return hunt;
}
function initEngine(engine){
  if(engine._phase13)return engine._phase13;
  const challenge=selectedPhase13Challenge(engine.stage.id);
  engine._phase13={challenge,turns:0,maxDamage:0,finished:false,rareHunt:null};
  engine.stage={...engine.stage,healMult:(engine.stage.healMult||1)*(challenge.healMult||1)};
  engine._phase13.rareHunt=injectRareHunt(engine);
  return engine._phase13;
}
function scaleEnemy(enemy,ch){
  if(!enemy||enemy._phase13Scaled)return;enemy._phase13Scaled=true;
  enemy.maxHp=Math.max(1,Math.round((enemy.maxHp||enemy.hp||1)*ch.enemyHp));enemy.hp=enemy.maxHp;
  enemy.atk=Math.max(1,Math.round((enemy.atk||1)*ch.enemyAtk));enemy.def=Math.max(0,Math.round((enemy.def||0)*ch.enemyDef));enemy.spd=Math.max(1,Math.round((enemy.spd||enemy.speed||80)*ch.enemySpd));
}
function maxDamageFrom(value){
  let best=0;if(!value||typeof value!=='object')return best;
  if(Number.isFinite(value.damage))best=Math.max(best,Number(value.damage));
  for(const [k,v] of Object.entries(value)){if(k==='enemyAction')continue;if(typeof v==='object')best=Math.max(best,maxDamageFrom(v));}
  return best;
}
const originalBegin=BattleEngine.prototype.beginNextEncounter;
BattleEngine.prototype.beginNextEncounter=function phase13BeginEncounter(...args){
  const meta=initEngine(this),out=originalBegin.apply(this,args);for(const e of this.enemies||[])scaleEnemy(e,meta.challenge);return out;
};
for(const method of ['_goldMult','_expMult']){const original=BattleEngine.prototype[method];BattleEngine.prototype[method]=function phase13RewardMult(...args){const base=original.apply(this,args),meta=initEngine(this);return base*(meta.challenge.rewardMult||1);};}
const originalDrop=BattleEngine.prototype._dropChanceBonusMult;
BattleEngine.prototype._dropChanceBonusMult=function phase13DropMult(...args){const base=originalDrop.apply(this,args),meta=initEngine(this),bonus=Math.max(0,(meta.challenge.rewardMult||1)-1);return base*(1+bonus*.7);};
const originalAdvance=BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn=function phase13Advance(...args){
  const meta=initEngine(this);meta.turns++;const out=originalAdvance.apply(this,args);for(const ev of out?.events||[]){if(ev?.type==='enemyAction')continue;meta.maxDamage=Math.max(meta.maxDamage,maxDamageFrom(ev));}
  if(out?.over&&out?.result?.cleared&&!meta.finished){meta.finished=true;const hpPct=this.player?.maxHp?this.player.hp/this.player.maxHp*100:0;const saved=state.phase13RecordClear(this.stage,{challengeId:meta.challenge.id,turns:meta.turns,maxDamage:meta.maxDamage,hpPct});out.result.phase13={challenge:meta.challenge,turns:meta.turns,maxDamage:meta.maxDamage,hpPct,rareHunt:meta.rareHunt,newTitles:saved.newTitles,newFeats:saved.newFeats,record:saved.record};}
  return out;
};

function stageByConfirmName(name){
  for(const chapter of CHAPTERS)for(const stage of chapter.stages||[])if(stage.name===name)return stage;
  for(const site of state.explorationSites||[]){if(!site.realm)continue;const stage=buildSecretRealmStage(site.realm.id);if(stage?.name===name)return stage;}
  return null;
}
function attachPickerObserver(){
  const label=document.getElementById('confirmStageName');if(!label)return;
  const render=()=>{const stage=stageByConfirmName(label.textContent);if(stage)renderPhase13ChallengePicker(stage);};
  new MutationObserver(render).observe(label,{childList:true,characterData:true,subtree:true});
}
attachPickerObserver();
