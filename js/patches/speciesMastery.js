/* ============================================================
   Species Mastery（種族熟練）— Session 6 patch
   ------------------------------------------------------------
   data/speciesMastery.js の曲線を既存イベントへ配線する。
   フックは全て state 経由（新しいBattleEngine経路は作らない）:

     markCodexKill    … Codex記録のタイミングで撃破熟練を加算。
                        勧誘可能種のみ対象（recruitSpeciesForEnemy準拠）。
                        勧誘に失敗しても撃破分の熟練は残る。
     markCodexRecruit … 勧誘成立で大口の熟練を加算。
     awardCompanionBattleBond … 勝利時、そのPTの仲間種族へ少量加算
                        （「一緒に戦うほどその種を知る」）。

   恩恵:
     speciesMasteryRecruitBonus … rollRecruitCandidate 側で加算
     speciesMasteryStatMult     … getCompanion wrapで仲間能力へ乗算
   ============================================================ */
import { state } from '../state.js';
import { getCompanionSpecies } from '../data/companions.js';
import { RECRUIT_SPECIES_BY_ENEMY_TYPE } from './companionRecruitment.js';
import {
  SPECIES_MASTERY,
  speciesMasteryLevelFor,
  speciesMasteryKillXp,
  speciesMasteryTierLabel,
  speciesMasteryIntelLines,
} from '../data/speciesMastery.js';
import { ROAMERS } from '../data/roamers.js';

function ensureMastery() {
  state.data.speciesMastery ||= {};
  return state.data.speciesMastery;
}
function ensureEntry(speciesId) {
  const root = ensureMastery();
  return root[speciesId] ||= { exp: 0, kills: 0, recruits: 0 };
}
// 勧誘可能な敵type → 種族id。Boss・召喚枠は種族知識の対象外。
function speciesForEnemyType(enemyType) {
  return RECRUIT_SPECIES_BY_ENEMY_TYPE[enemyType] || null;
}
function gainSpeciesExp(speciesId, amount, { kill = false, recruit = false } = {}) {
  if (!speciesId || amount <= 0) return null;
  const e = ensureEntry(speciesId);
  const before = speciesMasteryLevelFor(e.exp);
  e.exp += Math.round(amount);
  if (kill) e.kills += 1;
  if (recruit) e.recruits += 1;
  const after = speciesMasteryLevelFor(e.exp);
  return { speciesId, exp: e.exp, level: after, leveledUp: after > before };
}

state.speciesMasteryEntry = function speciesMasteryEntry(speciesId) {
  const e = ensureMastery()[speciesId];
  if (!e) return { exp: 0, kills: 0, recruits: 0, level: 0, label: '' };
  const level = speciesMasteryLevelFor(e.exp);
  return { exp: e.exp, kills: e.kills, recruits: e.recruits, level, label: speciesMasteryTierLabel(level) };
};
state.speciesMasteryRecruitBonus = function speciesMasteryRecruitBonus(speciesId) {
  const level = this.speciesMasteryEntry(speciesId).level;
  return level * SPECIES_MASTERY.RECRUIT_BONUS_PER_LEVEL;
};
state.speciesMasteryStatMult = function speciesMasteryStatMult(speciesId) {
  const level = this.speciesMasteryEntry(speciesId).level;
  return 1 + level * SPECIES_MASTERY.STAT_MULT_PER_LEVEL;
};
// Codex/収集画面向け: 知っている種族の一覧を熟練順で返す。
state.speciesMasterySummary = function speciesMasterySummary() {
  return Object.entries(ensureMastery())
    .map(([speciesId, e]) => ({
      speciesId,
      name: getCompanionSpecies(speciesId)?.name || speciesId,
      exp: e.exp, kills: e.kills, recruits: e.recruits,
      level: speciesMasteryLevelFor(e.exp),
      label: speciesMasteryTierLabel(speciesMasteryLevelFor(e.exp)),
    }))
    .sort((a, b) => b.level - a.level || b.exp - a.exp);
};

/* Session 7 — Mastery 2.0: 知識行と Lv5 capstone。
   speciesMasteryIntel … その種について「分かっていること」の行。
   speciesMasteryCapstone … Lv5到達か（勧誘素質floor判定用）。
   roamerIntelList … Roamer縄張り情報。遭遇=生息域、撃破=気配、
                     種族熟練Lv3 or 撃破3 = 巣の場所まで分かる。 */
state.speciesMasteryIntel = function speciesMasteryIntel(speciesId) {
  const level = this.speciesMasteryEntry(speciesId).level;
  return speciesMasteryIntelLines(getCompanionSpecies(speciesId), level);
};
state.speciesMasteryCapstone = function speciesMasteryCapstone(speciesId) {
  return this.speciesMasteryEntry(speciesId).level >= SPECIES_MASTERY.MAX_LEVEL;
};
state.roamerIntelList = function roamerIntelList() {
  const codex = this.data.monsterCodex || {};
  return Object.values(ROAMERS).map((r) => {
    const entry = codex[`roamer:${r.id}`] || {};
    const species = getCompanionSpecies(`roamer_${r.id}`);
    const masteryLv = species ? this.speciesMasteryEntry(species.id).level : 0;
    let tier = 0;
    if (entry.seen || (entry.kills || 0) > 0) tier = 1;           // 出会った
    if ((entry.kills || 0) >= 1) tier = 2;                         // 倒した
    if ((entry.kills || 0) >= 3 || masteryLv >= 3) tier = 3;       // 巣を知る
    return {
      roamerId: r.id, name: r.name, tier,
      habitat: tier >= 1 ? r.territory?.habitat : null,
      hint: tier >= 2 ? r.territory?.hint : null,
      lairName: tier >= 3 ? r.territory?.lairName : null,
    };
  });
};

// 撃破 → 種族熟練。Codex記録と同じタイミングで走らせる。
const prevMarkCodexKill = state.markCodexKill?.bind(state);
if (prevMarkCodexKill) {
  state.markCodexKill = function masteryMarkCodexKill(enemy, stage = null) {
    const speciesId = speciesForEnemyType(enemy?.type);
    if (speciesId) {
      const gain = gainSpeciesExp(speciesId, speciesMasteryKillXp(enemy), { kill: true });
      if (gain?.leveledUp && typeof document !== 'undefined') {
        const name = getCompanionSpecies(speciesId)?.name || speciesId;
        import('./toastFeedback.js').then(m => m.showToast(`[種族熟練] ${name} 熟練Lv${gain.level}`, 2400));
      }
    }
    return prevMarkCodexKill(enemy, stage);
  };
}

// 勧誘成立 → 大きく熟練が進む（失敗しても撃破分は残る）。
const prevMarkCodexRecruit = state.markCodexRecruit?.bind(state);
if (prevMarkCodexRecruit) {
  state.markCodexRecruit = function masteryMarkCodexRecruit(enemyType, rarity = 'normal') {
    const speciesId = speciesForEnemyType(enemyType);
    if (speciesId) gainSpeciesExp(speciesId, SPECIES_MASTERY.RECRUIT_XP, { recruit: true });
    return prevMarkCodexRecruit(enemyType, rarity);
  };
}

// 戦闘クリア → PTの仲間種族へ少量の熟練（「共に戦う」記憶）。
const prevAwardBond = state.awardCompanionBattleBond?.bind(state);
if (prevAwardBond) {
  state.awardCompanionBattleBond = function masteryAwardBond(opts = {}) {
    const awards = prevAwardBond(opts);
    if (opts?.cleared !== false) {
      const seen = new Set();
      for (const id of this.activeCompanionIds?.() || []) {
        const c = this.getCompanion?.(id);
        const sid = c?.instance?.baseSpeciesId || c?.instance?.speciesId;
        if (sid && !seen.has(sid)) { seen.add(sid); gainSpeciesExp(sid, SPECIES_MASTERY.PARTY_CLEAR_XP); }
      }
      if (seen.size) this.save();
    }
    return awards;
  };
}

// 種族熟練 → 仲間能力の小倍率。getCompanion の既存wrap列（Bond→Evolution）
// の後段に乗せる。新しいセーブモデルではなく派生値なので二重計上しない。
const prevGetCompanion = state.getCompanion?.bind(state);
if (prevGetCompanion) {
  state.getCompanion = function masteryGetCompanion(instanceId) {
    const c = prevGetCompanion(instanceId);
    if (!c) return c;
    const sid = c.instance?.baseSpeciesId || c.instance?.speciesId;
    const mult = sid ? this.speciesMasteryStatMult(sid) : 1;
    if (mult === 1) return c;
    const stats = { ...c.stats };
    for (const k of ['hp', 'mp', 'atk', 'def', 'mag', 'spd']) stats[k] = Math.max(1, Math.round((Number(stats[k]) || 1) * mult));
    return { ...c, stats, speciesMastery: this.speciesMasteryEntry(sid) };
  };
}

/* ============================================================
   Collection Milestones（収集の里程標）— Codex 2.0
   Codex/仲間/熟練/探索踏破から進行を読み取る一覧 + 一回限りの
   受け取り。claimed は state.data.claimedMilestones（additive）。
   ============================================================ */
import { COLLECTION_MILESTONES } from '../data/collectionMilestones.js';

function milestoneCtx() {
  return {
    codex: state.data.monsterCodex || {},
    instances: state.data.companionInstances || {},
    mastery: ensureMastery(),
    isStageCleared: (id) => state.isStageCleared(id),
  };
}
state.collectionMilestones = function collectionMilestones() {
  const claimed = this.data.claimedMilestones ||= {};
  const ctx = milestoneCtx();
  return COLLECTION_MILESTONES.map(m => {
    const progress = Math.max(0, Math.floor(m.progress(ctx)));
    return {
      ...m,
      progress,
      done: progress >= m.target,
      claimed: !!claimed[m.id],
    };
  });
};
state.claimCollectionMilestone = function claimCollectionMilestone(id) {
  const row = this.collectionMilestones().find(m => m.id === id);
  if (!row || !row.done || row.claimed) return null;
  (this.data.claimedMilestones ||= {})[id] = true;
  if (row.reward.gold) this.data.gold += row.reward.gold;
  if (row.reward.manastone) this.data.manastone += row.reward.manastone;
  this.save();
  return row;
};
