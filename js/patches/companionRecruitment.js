/* ============================================================
   Companion System Phase 3 - monster recruitment
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { getCompanionSpecies } from '../data/companions.js';
import { abyssTargetFarmProfile } from '../data/abyssTargetFarm.js';

const RECRUIT_SPECIES_BY_ENEMY_TYPE = Object.freeze({
  grunt:'goblin', fast:'bat',
  ch11_normal:'ash_soldier', ch12_normal:'thunder_beast', ch13_normal:'crystal_bug', ch14_normal:'rot_beast', ch15_normal:'iron_hound',
});
function recruitSpeciesForEnemy(enemy){if(!enemy||enemy.boss||enemy.type==='__boss_summon__')return null;return RECRUIT_SPECIES_BY_ENEMY_TYPE[enemy.type]||null;}
function ensureRecruitTracker(engine){if(!engine._recruitDefeats)engine._recruitDefeats=[];}
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function patchedRecruitGrantKillRewards(enemy){ensureRecruitTracker(this);const speciesId=recruitSpeciesForEnemy(enemy);if(speciesId)this._recruitDefeats.push({speciesId,enemyType:enemy.type,enemyName:enemy.name,elite:!!enemy.elite});return originalGrantKillRewards.call(this,enemy);};
function shuffledCopy(items){const out=[...items];for(let i=out.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[out[i],out[j]]=[out[j],out[i]];}return out;}
function rollRecruitCandidate(engine){
  ensureRecruitTracker(engine);if(!engine._recruitDefeats.length)return null;
  const bond=state.companionBondEffects?.()||{recruitChanceBonus:0,rareRecruitChance:0};
  const ranchBonus=Math.max(0,Number(state.settlementEffect?.('recruitChanceBonus'))||0);
  const target=engine?.stage?.isAbyss?abyssTargetFarmProfile(engine.stage.abyssRoute?.id):null;
  const routeMult=Math.max(1,Number(target?.recruitChanceMult)||1);
  for(const entry of shuffledCopy(engine._recruitDefeats)){
    const species=getCompanionSpecies(entry.speciesId);if(!species||!species.recruit)continue;
    const eliteBonus=entry.elite?.05:0;
    const base=(species.recruit.baseChance||0)+eliteBonus+bond.recruitChanceBonus+ranchBonus;
    const chance=Math.min(.75,base*routeMult);
    if(Math.random()<chance)return{speciesId:species.id,enemyType:entry.enemyType,name:species.name,icon:species.icon||'🐾',chance,elite:entry.elite,bondRareChance:bond.rareRecruitChance,targetFarmBonus:routeMult>1,ranchBonus};
  }
  return null;
}
const originalFinishBattle=BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle=function patchedRecruitFinishBattle(cleared,retreated){originalFinishBattle.call(this,cleared,retreated);if(!cleared||retreated||!this.finalResult)return;const candidate=rollRecruitCandidate(this);if(candidate)this.finalResult.recruitCandidate=candidate;};
function removeRecruitOverlay(){document.getElementById('companionRecruitOverlay')?.remove();}
function showRecruitPrompt(candidate,onDone){
  removeRecruitOverlay();const overlay=document.createElement('div');overlay.id='companionRecruitOverlay';Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9999',background:'rgba(0,0,0,.72)',display:'flex',alignItems:'center',justifyContent:'center',padding:'20px'});
  const panel=document.createElement('div');panel.className='panel';
  // 端末の実効ビューポートが低い場合（Artifact埋め込み等）にパネルが画面より
  // 高くなると、body{overflow:hidden}のため帰す/仲間にするボタンへ一切届か
  // なくなり操作不能になる（実機で報告されたフリーズ）。パネル自身に上限と
  // スクロールを持たせ、どんな高さの端末でも必ずボタンへ到達できるようにする。
  Object.assign(panel.style,{width:'min(420px, 92vw)',maxHeight:'86vh',overflowY:'auto'});
  panel.innerHTML=`<div style="font-size:46px;text-align:center;margin-bottom:8px;">${candidate.icon||'🐾'}</div><h2 style="text-align:center;">${candidate.name}がこちらを見ている……</h2><p class="sub" style="text-align:center;">仲間になりたそうだ！${candidate.targetFarmBonus?'<br>🐲 魔獣の巣：加入しやすくなっている。':''}${candidate.ranchBonus>0?`<br>🐾 牧舎：加入率 +${Math.round(candidate.ranchBonus*100)}pt`:''}${candidate.elite?'<br>エリート出身：レア以上の個体になる。':''}${candidate.bondRareChance>0?`<br>縁Rune：加入率上昇 / Rare化 ${Math.round(candidate.bondRareChance*100)}%`:''}</p><div class="confirm-actions" style="margin-top:16px;"><button class="btn-sub" id="recruitDeclineBtn">帰す</button><button class="btn-main" id="recruitAcceptBtn">仲間にする</button></div>`;overlay.appendChild(panel);document.body.appendChild(overlay);
  // スクロールバーが常時表示されないモバイルだと、パネルが画面より高い時
  // 「続きがある」と気づかれず操作不能に見えてしまうため明示する。
  // タイトル直下（＝スクロールせずとも必ず見える最初の画面）に挿入する。
  requestAnimationFrame(()=>{if(panel.scrollHeight>panel.clientHeight+2){const hint=document.createElement('div');hint.className='scroll-hint';hint.textContent='▼ 下にスクロールできます';panel.querySelector('h2')?.after(hint);}});
  let resolved = false;
  const finish = accepted => {
    if (resolved) return;
    resolved = true;
    let recruitResult=null;
    if(accepted&&state.createCompanion){
      const bondRare=!candidate.elite&&candidate.bondRareChance>0&&Math.random()<candidate.bondRareChance;
      const opts=(candidate.elite||bondRare)?{minRarity:'rare',origin:candidate.elite?'eliteRecruit':'bondRecruit',enemyType:candidate.enemyType}:{origin:'recruit',enemyType:candidate.enemyType};
      const instanceId=state.createCompanion(candidate.speciesId,opts),companion=instanceId&&state.getCompanion?.(instanceId);
      if(instanceId&&companion)recruitResult={accepted:true,instanceId,speciesId:candidate.speciesId,name:companion.instance.nickname||companion.species.name,rarity:companion.instance.rarity,nature:companion.instance.nature,level:companion.instance.level,eliteOrigin:!!candidate.elite,bondRare};
    }
    removeRecruitOverlay();onDone(recruitResult||{accepted:false});
  };
  panel.querySelector('#recruitAcceptBtn').addEventListener('click',()=>finish(true));panel.querySelector('#recruitDeclineBtn').addEventListener('click',()=>finish(false));
}
const originalStart=TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start=function patchedRecruitStart(stageId,onEnd,blessingId){const wrappedOnEnd=result=>{if(!result||!result.cleared||!result.recruitCandidate){onEnd(result);return;}showRecruitPrompt(result.recruitCandidate,recruitResult=>{result.recruitResult=recruitResult;onEnd(result);});};return originalStart.call(this,stageId,wrappedOnEnd,blessingId);};
export { rollRecruitCandidate };
