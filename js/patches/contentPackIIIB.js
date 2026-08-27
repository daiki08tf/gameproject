/* Content Pack III B — convergence chains / hidden bosses / companions / breeding / lore. */
import './contentPackIIIA.js';
import { state } from '../state.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { COMPANION_SPECIES } from '../data/companions.js';
import { COMPANION_ROLES } from '../data/phase12CompanionPack.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { CP3_SECRET_CHAINS,CP3_HIDDEN_BOSSES,CP3_SECRET_COMPANIONS,CP3_SPECIAL_HYBRIDS,CP3_CODEX_ECOLOGY,CP3_CHAIN_LORE,cp3ChainProgress,cp3HybridFor } from '../data/contentPackIIIB.js';

function world(){state.data.world2??={};state.data.world2.discoveries??={};return state.data.world2;}
function put(id,patch){const d=world().discoveries,prev=d[id]||{};d[id]={...prev,...patch,at:prev.at||Date.now()};return d[id];}
function chainState(chain){return cp3ChainProgress(chain,{discoveries:world().discoveries});}

function registerCompanion(def,{hybrid=false}={}){
  if(COMPANION_SPECIES[def.id])return;
  COMPANION_SPECIES[def.id]={...def,type:'monster',family:def.family||(hybrid?'hybrid':'unknown'),regionId:def.regionId||(hybrid?'cp3_convergence':'cp3_secret'),regionName:def.regionName||(hybrid?'収束交配':'逆流観測域'),roleName:COMPANION_ROLES[def.role]?.name||def.role,recruit:{baseChance:0},contentPackIII:true,secret:true,hybrid};
}
for(const def of Object.values(CP3_SECRET_COMPANIONS))registerCompanion(def);
for(const def of Object.values(CP3_SPECIAL_HYBRIDS))registerCompanion(def,{hybrid:true});

function syncChains(){
  if(!state.isStageCleared?.('30-8'))return [];
  const d=world().discoveries;
  for(const chain of Object.values(CP3_SECRET_CHAINS)){
    const p=chainState(chain);if(p.completed===0)continue;
    const hint=p.resolved?chain.resolution:p.next?.text||chain.steps[Math.max(0,p.completed-1)]?.text;
    put(`rumor:cp3:chain:${chain.id}`,{name:`秘密連鎖：${chain.name}`,hint,rumor:true,rumorId:`cp3-chain:${chain.id}`,contentPackIII:true,secretChain:true,chainId:chain.id,chainCompleted:p.completed,chainTotal:p.total,rumorState:p.resolved?'resolved':'tracking',rumorStateLabel:p.resolved?'解決済み':'追跡中',nextAction:p.resolved?'関連地域を再訪し、収束個体を追う':p.next?.site?`${p.next.site} — ${p.next.text}`:null});
    if(p.resolved){
      put(`cp3:chain:${chain.id}`,{name:`秘密連鎖：${chain.name}`,hint:chain.resolution,contentPackIII:true,secretChain:true,chainResolved:true,chainId:chain.id});
      const lore=CP3_CHAIN_LORE[chain.id];if(lore)put(lore.id,{name:lore.name,hint:lore.text,loreFragment:true,contentPackIII:true,chainId:chain.id,worldMystery:true});
    }
  }
  return Object.values(CP3_SECRET_CHAINS).map(c=>({...chainState(c),definition:c}));
}
state.cp3SecretChains=function(){return syncChains();};
state.cp3LoreFragments=function(){syncChains();return Object.entries(world().discoveries).filter(([,v])=>v?.contentPackIII&&v?.loreFragment).map(([id,v])=>({id,...v}));};
state.worldLoreFragments=function(){
  const merged=[...(this.cp2LoreFragments?.()||[]),...this.cp3LoreFragments()];
  return [...new Map(merged.map(x=>[x.id,x])).values()];
};

function postStoryBossBaseline(sourceEnemyId){
  const src=ENEMY_TYPES[sourceEnemyId];if(!src)return null;
  const suffix=String(sourceEnemyId).replace(/^ch\d+_/,'');
  const benchmark=ENEMY_TYPES[`ch30_${suffix}`]||ENEMY_TYPES.ch30_boss||src;
  return {src,benchmark};
}
function registerBoss(id,def){
  if(ENEMY_TYPES[id])return true;
  const base=postStoryBossBaseline(def.sourceEnemyId);if(!base)return false;
  const{src,benchmark}=base;
  // CP3 is unlocked only after Ch30. Preserve authored skills/identity from
  // the old-region source, but benchmark combat stats against the equivalent
  // Ch30 enemy so a discovered hidden boss cannot be an accidental pushover.
  ENEMY_TYPES[id]={...src,name:def.name,hp:Math.max(1,Math.round(benchmark.hp*def.hpMult)),atk:Math.max(1,Math.round(benchmark.atk*def.atkMult)),def:Math.max(0,Math.round(benchmark.def*def.defMult)),speed:Math.max(1,Math.round((benchmark.speed||src.speed||80)*def.speedMult)),xp:Math.max(Number(src.xp)||0,Number(benchmark.xp)||0),boss:true,contentPackIII:true,cp3HiddenBoss:true,cp3PostStoryScaled:true};
  return true;
}
function eligibleBoss(stageId){
  syncChains();
  return Object.entries(CP3_HIDDEN_BOSSES).find(([id,def])=>def.stageId===stageId&&chainState(CP3_SECRET_CHAINS[def.chainId]).resolved&&!world().discoveries[`cp3:boss:${id}:cleared`])||null;
}
function grantBossReward(id,def){
  if(world().discoveries[`cp3:boss:${id}:cleared`])return;
  put(`cp3:boss:${id}:cleared`,{name:`討伐：${def.name}`,hint:'複数地域の観測が収束して生じた個体を撃破した。',contentPackIII:true,hiddenBoss:true,bossId:id,chainId:def.chainId,clearedAt:Date.now()});
  for(const itemId of def.rewards||[])state.addItem?.(itemId,1,{boss:true});
  if(def.companionId&&state.createCompanion){
    const already=Object.values(state.data.companionInstances||{}).some(x=>x?.speciesId===def.companionId);
    if(!already)state.createCompanion(def.companionId,{epithet:'逆流観測の仔'});
  }
  if(id==='cp3_boss_living_archive'&&state.createCompanion){
    const already=Object.values(state.data.companionInstances||{}).some(x=>x?.speciesId==='cp3_echo_seed');
    if(!already)state.createCompanion('cp3_echo_seed',{epithet:'生体記録層の種'});
  }
  syncChains();state.save();
}

const previousStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function cp3BStart(stageId,onEnd,blessingId){
  const wrappedEnd=result=>{if(result?.cleared&&this._cp3BBossId){const def=CP3_HIDDEN_BOSSES[this._cp3BBossId];if(def)grantBossReward(this._cp3BBossId,def);}return onEnd?.(result);};
  const out=previousStart.call(this,stageId,wrappedEnd,blessingId);
  this._cp3BBossId=null;
  const found=eligibleBoss(stageId);if(!found)return out;
  const[id,def]=found;if(!registerBoss(id,def))return out;
  // One authored boss per run. Bosses remain queued follow-ups so the initial enemy pile and command bar stay bounded.
  this.engine.encounterQueue.push({type:id,count:1});this.engine.totalToDefeat+=1;this._cp3BBossId=id;
  return out;
};

const previousReveal=TextBattleScreen.prototype._revealNextGroupIfNeeded;
TextBattleScreen.prototype._revealNextGroupIfNeeded=function cp3BReveal(){
  const before=new Set((this.engine?.aliveEnemies||[]).map(e=>e.id));const out=previousReveal.apply(this,arguments);
  if(!this._cp3BBossId)return out;
  const found=(this.engine?.aliveEnemies||[]).find(e=>e.type===this._cp3BBossId&&!before.has(e.id));if(!found)return out;
  this._cp3BBossShown??=new Set();if(this._cp3BBossShown.has(found.id))return out;this._cp3BBossShown.add(found.id);
  this._pushLines(['離れた地域の手掛かりが、同じ返答へ収束した。',`HIDDEN BOSS — ${found.name}`]);return out;
};

const HYBRID_CHAIN=Object.freeze({cp3_target_hound:'reply_target',cp3_reflux_beast:'returned_pulse',cp3_living_bloom:'living_archive'});
function resolvedHybridFor(a,b){
  if(!a||!b)return null;
  const aSpecies=a.instance.baseSpeciesId||a.instance.speciesId,bSpecies=b.instance.baseSpeciesId||b.instance.speciesId;
  const hybrid=cp3HybridFor(aSpecies,bSpecies);if(!hybrid)return null;
  const required=HYBRID_CHAIN[hybrid.id];
  return required&&chainState(CP3_SECRET_CHAINS[required]).resolved?hybrid:null;
}
if(state.createBreedingEgg&&!state.createBreedingEgg.__cp3b){
  const previous=state.createBreedingEgg.bind(state);
  const wrapped=function cp3BBreeding(aId,bId,rng=Math.random){
    const a=this.getCompanion?.(aId),b=this.getCompanion?.(bId),hybrid=resolvedHybridFor(a,b);
    const result=previous(aId,bId,rng);if(!result?.ok||!hybrid)return result;
    const egg=this.data.ranchEggs?.find(x=>x.id===result.eggId);if(!egg)return result;
    egg.speciesId=hybrid.id;egg.origin='cp3SpecialBreeding';result.speciesId=hybrid.id;result.cp3SpecialHybrid=hybrid.id;this.save();return result;
  };wrapped.__cp3b=true;state.createBreedingEgg=wrapped;
}
if(state.breedCompanions&&!state.breedCompanions.__cp3b){
  const previous=state.breedCompanions.bind(state);
  const wrapped=function cp3BDirectBreeding(aId,bId,rng=Math.random){
    const a=this.getCompanion?.(aId),b=this.getCompanion?.(bId),hybrid=resolvedHybridFor(a,b);
    const result=previous(aId,bId,rng);if(!result?.ok||!hybrid)return result;
    const child=this.data.companionInstances?.[result.childId];if(!child)return result;
    child.speciesId=hybrid.id;child.baseSpeciesId=hybrid.id;child.origin='cp3SpecialBreeding';
    this.data.companionCodex??={};this.data.companionCodex[hybrid.id]=true;
    result.speciesId=hybrid.id;result.child=this.getCompanion?.(result.childId)||result.child;result.cp3SpecialHybrid=hybrid.id;
    this.save();return result;
  };wrapped.__cp3b=true;state.breedCompanions=wrapped;
}

if(state.codexFieldGuide&&!state.codexFieldGuide.__cp3b){
  const previous=state.codexFieldGuide.bind(state);
  const wrapped=function cp3BFieldGuide(enemyId){const base=previous(enemyId),eco=CP3_CODEX_ECOLOGY[enemyId];if(!eco)return base;const rank=base?.level?.rank||0;return{...base,habitatHint:rank>=2?`生息・観測域：${eco.habitat}`:base?.habitatHint,ecologyHint:rank>=3?eco.ecology:base?.ecologyHint,cp3Ecology:true};};wrapped.__cp3b=true;state.codexFieldGuide=wrapped;
}
if(state.rumorNotebook&&!state.rumorNotebook.__cp3b){const previous=state.rumorNotebook.bind(state);const wrapped=function cp3BNotebook(){syncChains();return previous();};wrapped.__cp3b=true;state.rumorNotebook=wrapped;}

syncChains();
export {syncChains,eligibleBoss,grantBossReward};
