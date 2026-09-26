/* ============================================================
   Companion recruitment + Monster Ranch quality/mutation
   ------------------------------------------------------------
   Living World & Discovery C6-1 — Automatic recruitment. A successful
   recruit roll (rollRecruitCandidate, unchanged below) now resolves
   immediately into a real companion instance instead of blocking battle
   flow behind an accept/decline modal -- per
   LIVING_WORLD_DISCOVERY_ROADMAP.md C6-1: "There is no tactical reason
   to reject a successful recruit if duplicates are useful progression."
   Only a compact toast marks the moment, matching the roadmap's own
   example: "[Companion] 灰狼が仲間になった". The one real edge case a
   modal used to convey -- ranch full -- gets its own toast instead of a
   disabled button, so nothing silently vanishes without explanation.
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { COMPANION_RARITY, getCompanionSpecies } from '../data/companions.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE } from '../data/monsterRanchSpecies.js';
import { abyssTargetFarmProfile } from '../data/abyssTargetFarm.js';
import { denlordForEnemyType } from '../data/denlords.js';
import { pushCompanionMemory } from '../data/companionMemory.js';
import { showToast } from './toastFeedback.js';
import { Audio_ } from '../audio.js';

const RECRUIT_SPECIES_BY_ENEMY_TYPE=Object.freeze({grunt:'goblin',fast:'bat',ch11_normal:'ash_soldier',ch12_normal:'thunder_beast',ch13_normal:'crystal_bug',ch14_normal:'rot_beast',ch15_normal:'iron_hound',...RANCH_RECRUIT_BY_ENEMY_TYPE});
function recruitSpeciesForEnemy(enemy){if(!enemy||enemy.boss||enemy.type==='__boss_summon__')return null;return RECRUIT_SPECIES_BY_ENEMY_TYPE[enemy.type]||null;}function ensure(e){e._recruitDefeats ||= [];}

// 「倒した個体が仲間になる」収集の核：Rare昇格・Elite Affix・Rare行動・
// Roamer個体を倒した実績をそのまま勧誘候補へ引き継ぐ。inheritedTraitsは
// 個体を特別にしていた特性名（再生/狂乱/鉄壁/迅速/狩人/吸命/窮地/急襲）で、
// 仲間になっても同じ特性を持ち続ける。
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;BattleEngine.prototype._grantKillRewards=function(enemy){ensure(this);const speciesId=recruitSpeciesForEnemy(enemy);if(speciesId)this._recruitDefeats.push({speciesId,enemyType:enemy.type,enemyName:enemy.name,elite:!!enemy.elite,eliteAffixName:enemy.enemy3EliteAffix?.name||null,rareBehaviorName:enemy.enemy3RareBehavior?.name||null,roamerId:enemy.roamerId||null,rankRare:enemy.rank==='rare',denlordId:denlordForEnemyType(enemy.type)?.id||null,denlordPrestige:!!enemy.denlordPrestige});return originalGrantKillRewards.call(this,enemy);};
function shuffledCopy(a){const o=[...a];for(let i=o.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[o[i],o[j]]=[o[j],o[i]];}return o;}
function rollRecruitCandidate(engine){ensure(engine);if(!engine._recruitDefeats.length)return null;const bond=state.companionBondEffects?.()||{recruitChanceBonus:0,rareRecruitChance:0},ranchBonus=Math.max(0,Number(state.settlementEffect?.('recruitChanceBonus'))||0),regionalBonus=Math.max(0,Number(state.phase9RegionalBonuses?.().recruitChanceBonus)||0),target=engine?.stage?.isAbyss?abyssTargetFarmProfile(engine.stage.abyssRoute?.id):null,routeMult=Math.max(1,Number(target?.recruitChanceMult)||1);for(const entry of shuffledCopy(engine._recruitDefeats)){const species=getCompanionSpecies(entry.speciesId);if(!species?.recruit)continue;const eliteBonus=entry.elite?.05:0,researchBonus=state.ranchResearch?.(species.id)?.recruited>=10?.01:0,boardBonus=Math.max(0,Number(state.ranchBoardEffects?.(species.id)?.recruitChanceBonus)||0),treeBonus=Math.max(0,Number(state.playerTreeRecruitBonus?.())||0),masteryBonus=Math.max(0,Number(state.speciesMasteryRecruitBonus?.(species.id))||0),base=(species.recruit.baseChance||0)+eliteBonus+bond.recruitChanceBonus+ranchBonus+regionalBonus+researchBonus+boardBonus+treeBonus+masteryBonus,chance=Math.min(.75,base*routeMult);if(Math.random()<chance)return{speciesId:species.id,enemyType:entry.enemyType,name:species.name,chance,elite:entry.elite,rankRare:entry.rankRare,roamerId:entry.roamerId,denlordId:entry.denlordId,denlordPrestige:entry.denlordPrestige,eliteAffixName:entry.eliteAffixName,rareBehaviorName:entry.rareBehaviorName,bondRareChance:bond.rareRecruitChance,targetFarmBonus:routeMult>1,ranchBonus,regionalBonus,researchBonus,boardBonus,masteryBonus,target};}return null;}
const originalFinishBattle=BattleEngine.prototype._finishBattle;BattleEngine.prototype._finishBattle=function(cleared,retreated){originalFinishBattle.call(this,cleared,retreated);if(!cleared||retreated||!this.finalResult)return;const c=rollRecruitCandidate(this);if(c)this.finalResult.recruitCandidate=c;};
function applyTalentFloor(companion,speciesId,target){if(!companion?.instance?.talent)return false;const rarityIdx=Math.max(0,COMPANION_RARITY.indexOf(companion.instance.rarity)),board=Math.max(0,Number(state.ranchBoardEffects?.(speciesId)?.talentFloorBonus)||0),route=Math.max(0,Number(target?.talentFloorBonus)||0),high=target?.highTalentChance>0&&Math.random()<target.highTalentChance?Math.max(0,Number(target.highTalentFloorBonus)||0):0,floor=Math.min(1.18,.94+rarityIdx*.018+board+route+high);let changed=false;for(const k of ['hp','mp','atk','def','mag','spd'])if((Number(companion.instance.talent[k])||0)<floor){companion.instance.talent[k]=Math.round(floor*1000)/1000;changed=true;}if(changed)state.save();return high>0;}

// Resolves a rolled candidate into a real companion instance -- the exact
// same accept-branch logic the old modal's "仲間にする" button used to run
// (bondRare/routeRare rolls, createCompanion, talent floor, ranch research
// count, mutation roll), now applied unconditionally instead of gated
// behind a player decision. The only way this doesn't accept is a full
// ranch, which was already the modal's one real disabled-button case.
function resolveRecruitCandidate(candidate) {
  if (!state.ranchHasSpace?.()) return { accepted: false, reason: 'full', name: candidate.name };
  const bondRare = !candidate.elite && candidate.bondRareChance > 0 && Math.random() < candidate.bondRareChance;
  const routeRare = !!(candidate.target?.minRarity && Math.random() < (candidate.target.rareFloorChance || 0));
  let opts = { origin: 'recruit', enemyType: candidate.enemyType };
  // 倒した個体の由来を保存する。Denlord > Roamer > 地域Rare > Elite >
  // 絆/巣窟 の順で珍しさの高い出自を採り、どの個体から来たかを
  // origin と provenance に残す。再臨Denlordは『再臨』特性を継承する。
  if (candidate.denlordId) opts = { minRarity: candidate.denlordPrestige ? 'legendary' : 'epic', origin: 'denlordRecruit', enemyType: candidate.enemyType };
  else if (candidate.roamerId) opts = { minRarity: 'epic', origin: 'roamerRecruit', enemyType: candidate.enemyType };
  else if (candidate.rankRare) opts = { minRarity: 'rare', origin: 'rareRecruit', enemyType: candidate.enemyType };
  else if (candidate.elite) opts = { minRarity: 'rare', origin: 'eliteRecruit', enemyType: candidate.enemyType };
  else if (bondRare) opts = { minRarity: 'rare', origin: 'bondRecruit', enemyType: candidate.enemyType };
  else if (routeRare) opts = { minRarity: 'rare', origin: 'abyssBeastDen', enemyType: candidate.enemyType };
  const inheritedTraits = [candidate.eliteAffixName, candidate.rareBehaviorName].filter(Boolean);
  if (candidate.denlordPrestige) inheritedTraits.push('再臨');
  if (inheritedTraits.length) opts.inheritedTraits = inheritedTraits;
  const provenance = { roamerId: candidate.roamerId, denlordId: candidate.denlordId, prestige: !!candidate.denlordPrestige, eliteAffixName: candidate.eliteAffixName, rareBehaviorName: candidate.rareBehaviorName };
  if (Object.values(provenance).some(Boolean)) opts.provenance = provenance;
  const instanceId = state.createCompanion(candidate.speciesId, opts);
  const companion = instanceId && state.getCompanion?.(instanceId);
  if (!instanceId || !companion) return { accepted: false, reason: 'error', name: candidate.name };
  // Monster Memory: 出会いの記録。「どこで倒した個体が仲間になったか」を
  // 個体の記憶として残す（provenance の機械的記録を読み物化する層）。
  if (candidate.denlordPrestige) pushCompanionMemory(companion.instance, '再臨した巣の主を制して迎え入れた');
  else if (candidate.denlordId) pushCompanionMemory(companion.instance, '巣の主として倒され、仲間に加わった');
  else if (candidate.roamerId) pushCompanionMemory(companion.instance, '名もなき強敵として倒され、仲間に加わった');
  else if (candidate.rankRare) pushCompanionMemory(companion.instance, '希少種として倒され、仲間に加わった');
  const highTalent = applyTalentFloor(companion, candidate.speciesId, candidate.target);
  const recruitRecord = state.recordRanchRecruit?.(candidate.speciesId);
  const mutation = state.rollRanchMutation?.(instanceId, { beastDen: !!candidate.targetFarmBonus }) || null;
  return {
    accepted: true, instanceId, speciesId: candidate.speciesId,
    name: companion.instance.nickname || companion.species.name,
    rarity: companion.instance.rarity, nature: companion.instance.nature,
    eliteOrigin: !!candidate.elite, bondRare, routeRare, highTalent, mutation,
    origin: opts.origin, roamerId: candidate.roamerId || null, denlordId: candidate.denlordId || null, prestige: !!candidate.denlordPrestige,
    gradedUpLabel: recruitRecord?.gradedUp ? recruitRecord.gradedUpLabel : null,
  };
}

// A recruit that also crosses a species-grade threshold (C6-4) gets ONE
// combined toast rather than two separate ones racing for the same #toast
// element back-to-back (the second call would just clobber the first
// before the player could read it -- see js/patches/toastFeedback.js).
function announceRecruit(result) {
  if (result.accepted) {
    Audio_.pickup();
    const gradeText = result.gradedUpLabel ? `（${result.gradedUpLabel}に昇格！）` : '';
    const special = result.denlordId ? `[番獣] ${result.prestige ? '再臨した' : ''}巣の主` : result.roamerId ? '[名もなき強敵]' : null;
    showToast(`${special || '[Companion]'} ${result.name}が仲間になった${gradeText}`, special ? 3200 : undefined);
  } else if (result.reason === 'full') {
    showToast(`[Companion] ${result.name}が仲間になりたそうにしていたが、牧場が満員だった`);
  }
}

const originalStart=TextBattleScreen.prototype.start;TextBattleScreen.prototype.start=function(stageId,onEnd,blessingId){const wrapped=result=>{if(result?.cleared&&result.recruitCandidate){const recruitResult=resolveRecruitCandidate(result.recruitCandidate);result.recruitResult=recruitResult;announceRecruit(recruitResult);}onEnd(result);};return originalStart.call(this,stageId,wrapped,blessingId);};
export {rollRecruitCandidate,RECRUIT_SPECIES_BY_ENEMY_TYPE,applyTalentFloor,resolveRecruitCandidate};
