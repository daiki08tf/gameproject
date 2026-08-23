/* ============================================================
   Companion System Phase 3 - monster recruitment
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { getCompanionSpecies } from '../data/companions.js';

const RECRUIT_SPECIES_BY_ENEMY_TYPE = Object.freeze({ grunt:'goblin', fast:'bat' });
function recruitSpeciesForEnemy(enemy){if(!enemy||enemy.boss||enemy.type==='__boss_summon__')return null;return RECRUIT_SPECIES_BY_ENEMY_TYPE[enemy.type]||null;}
function ensureRecruitTracker(engine){if(!engine._recruitDefeats)engine._recruitDefeats=[];}
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function patchedRecruitGrantKillRewards(enemy){ensureRecruitTracker(this);const speciesId=recruitSpeciesForEnemy(enemy);if(speciesId)this._recruitDefeats.push({speciesId,enemyType:enemy.type,enemyName:enemy.name,elite:!!enemy.elite});return originalGrantKillRewards.call(this,enemy);};
function shuffledCopy(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function rollRecruitCandidate(engine){
  ensureRecruitTracker(engine);if(!engine._recruitDefeats.length)return null;
  const bond=state.companionBondEffects?.()||{recruitChanceBonus:0,rareRecruitChance:0};
  for(const entry of shuffledCopy(engine._recruitDefeats)){
    const species=getCompanionSpecies(entry.speciesId);if(!species||!species.recruit)continue;
    const eliteBonus=entry.elite?.05:0;
    const chance=Math.min(.60,(species.recruit.baseChance||0)+eliteBonus+bond.recruitChanceBonus);
    if(Math.random()<chance)return{speciesId:species.id,name:species.name,icon:species.icon||'🐾',chance,elite:entry.elite,bondRareChance:bond.rareRecruitChance};
  }
  return null;
}
const originalFinishBattle=BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle=function patchedRecruitFinishBattle(cleared,retreated){originalFinishBattle.call(this,cleared,retreated);if(!cleared||retreated||!this.finalResult)return;const candidate=rollRecruitCandidate(this);if(candidate)this.finalResult.recruitCandidate=candidate;};
function removeRecruitOverlay(){document.getElementById('companionRecruitOverlay')?.remove();}
function showRecruitPrompt(candidate,onDone){
  removeRecruitOverlay();const overlay=document.createElement('div');overlay.id='companionRecruitOverlay';Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9999',background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'});
  const panel=document.createElement('div');panel.className='panel';panel.style.width='min(420px, 92vw)';panel.innerHTML=`<div style="font-size:46px;text-align:center;margin-bottom:8px;">${candidate.icon||'🐾'}</div><h2 style="text-align:center;">${candidate.name}がこちらを見ている……</h2><p class="sub" style="text-align:center;">仲間になりたそうだ！${candidate.elite?'<br>エリート出身：レア以上の個体になる。':''}${candidate.bondRareChance>0?`<br>縁Rune：加入率上昇 / Rare化 ${Math.round(candidate.bondRareChance*100)}%`:''}</p><div class="confirm-actions" style="margin-top:16px;"><button class="btn-sub" id="recruitDeclineBtn">帰す</button><button class="btn-main" id="recruitAcceptBtn">仲間にする</button></div>`;overlay.appendChild(panel);document.body.appendChild(overlay);
  let resolved=false;const finish=accepted=>{if(resolved)return;resolved=true;let recruitResult=null;if(accepted&&state.createCompanion){const bondRare=!candidate.elite&&candidate.bondRareChance>0&&Math.random()<candidate.bondRareChance;const opts=(candidate.elite||bondRare)?{minRarity:'rare',origin:candidate.elite?'eliteRecruit':'bondRecruit'}:{origin:'recruit'};const instanceId=state.createCompanion(candidate.speciesId,opts),companion=instanceId&&state.getCompanion?.(instanceId);if(instanceId&&companion)recruitResult={accepted:true,instanceId,speciesId:candidate.speciesId,name:companion.instance.nickname||companion.species.name,rarity:companion.instance.rarity,nature:companion.instance.nature,level:companion.instance.level,eliteOrigin:!!candidate.elite,bondRare};}removeRecruitOverlay();onDone(recruitResult||{accepted:false});};
  panel.querySelector('#recruitAcceptBtn').addEventListener('click',()=>finish(true));panel.querySelector('#recruitDeclineBtn').addEventListener('click',()=>finish(false));
}
const originalStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function patchedRecruitStart(stageId,onEnd,blessingId){const wrappedOnEnd=result=>{if(!result||!result.cleared||!result.recruitCandidate){onEnd(result);return;}showRecruitPrompt(result.recruitCandidate,recruitResult=>{result.recruitResult=recruitResult;onEnd(result);});};return originalStart.call(this,stageId,wrappedOnEnd,blessingId);};
export { rollRecruitCandidate };
