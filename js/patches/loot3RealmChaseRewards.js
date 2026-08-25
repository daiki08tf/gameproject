/* ============================================================
   Loot 3.0 — Realm chase acceleration
   ------------------------------------------------------------
   Fixed Relics/Uniques should not become duplicate random drops. Their original
   acquisition routes remain authoritative. Heaven instead accelerates the cost
   of an already-eligible locked Relic with existing currencies, while Underworld
   grants bounded echoes that can cover at most 25% of a defeated Bounty Unique's
   initial mastery-trial requirement.
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { RELICS } from '../data/artifacts.js';
import { BOUNTY_UNIQUES } from '../data/uniqueEquipment.js';

const HEAVEN_RELIC_CHANCE = 0.35;
const HEAVEN_COST_SHARE = 0.15;
const UNDERWORLD_ECHO_CHANCE = 0.45;
const UNIQUE_ECHO_MAX = 5;
const UNIQUE_ECHO_TRIAL_SHARE = 0.05;

function ensureChaseData(target = state) {
  target.data.loot3RealmChase ||= {};
  target.data.loot3RealmChase.uniqueEchoes ||= {};
  return target.data.loot3RealmChase;
}

function relicCandidates(target = state) {
  return RELICS.filter((relic) => !target.isArtifactUnlocked(relic.id) && target.artifactProgressionGate?.(relic.id)?.met);
}

function uniqueCandidates(target = state) {
  const echoes = ensureChaseData(target).uniqueEchoes;
  return BOUNTY_UNIQUES.filter((unique) => {
    if (!target.isBountyDefeated?.(unique.bountyId)) return false;
    if ((echoes[unique.id] || 0) >= UNIQUE_ECHO_MAX) return false;
    const progress = target.getUniqueTrialProgress?.(unique.id);
    return progress && !progress.awakened;
  });
}

export function grantHeavenRelicChase(target = state, rng = Math.random) {
  if (rng() >= HEAVEN_RELIC_CHANCE) return null;
  const pool = relicCandidates(target);
  if (!pool.length) return null;
  const relic = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  const cost = target.artifactUnlockCostV2?.() || { gold: 0, manastone: 0 };
  const gold = Math.max(1, Math.round((cost.gold || 0) * HEAVEN_COST_SHARE));
  const manastone = Math.max(1, Math.round((cost.manastone || 0) * HEAVEN_COST_SHARE));
  target.data.gold = Math.max(0, Number(target.data.gold) || 0) + gold;
  target.data.manastone = Math.max(0, Number(target.data.manastone) || 0) + manastone;
  target.save();
  return { type: 'relicResonance', id: relic.id, name: relic.name, gold, manastone };
}

export function grantUnderworldUniqueEcho(target = state, rng = Math.random) {
  if (rng() >= UNDERWORLD_ECHO_CHANCE) return null;
  const pool = uniqueCandidates(target);
  if (!pool.length) return null;
  const unique = pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))];
  const data = ensureChaseData(target);
  data.uniqueEchoes[unique.id] = Math.min(UNIQUE_ECHO_MAX, (data.uniqueEchoes[unique.id] || 0) + 1);
  target.save();
  return { type: 'uniqueEcho', id: unique.id, name: unique.name, echoes: data.uniqueEchoes[unique.id], maxEchoes: UNIQUE_ECHO_MAX };
}

state.uniqueRealmEchoes = function uniqueRealmEchoes(itemId) {
  return Math.max(0, Math.min(UNIQUE_ECHO_MAX, Number(ensureChaseData(this).uniqueEchoes[itemId]) || 0));
};

const previousUniqueProgress = state.getUniqueTrialProgress?.bind(state);
if (previousUniqueProgress) {
  state.getUniqueTrialProgress = function loot3UniqueTrialProgress(itemId) {
    const progress = previousUniqueProgress(itemId);
    if (!progress) return progress;
    const echoes = this.uniqueRealmEchoes(itemId);
    if (!echoes) return { ...progress, realmEchoes: 0, echoBonusPct: 0 };
    const trials = progress.trials.map((trial) => {
      const raw = Math.max(0, Number(progress.counts?.[trial.event]) || 0);
      const bonus = Math.floor(trial.target * UNIQUE_ECHO_TRIAL_SHARE * echoes);
      const count = Math.min(trial.target, raw + bonus);
      return { ...trial, count, done: count >= trial.target, realmEchoBonus: Math.min(bonus, Math.max(0, trial.target - raw)) };
    });
    return { ...progress, trials, ready: trials.every((trial) => trial.done), realmEchoes: echoes, echoBonusPct: echoes * UNIQUE_ECHO_TRIAL_SHARE * 100 };
  };
}

const previousFinishBattle = BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle = function loot3RealmChaseFinish(cleared, retreated) {
  const output = previousFinishBattle.call(this, cleared, retreated);
  if (!cleared || retreated || !this.stage?.keyDungeon) return output;
  let chase = null;
  if (this.stage.world2KeyType === 'celestial') chase = grantHeavenRelicChase(state);
  else if (this.stage.world2KeyType === 'infernal') chase = grantUnderworldUniqueEcho(state);
  if (chase && this.finalResult) this.finalResult.loot3Chase = chase;
  return output;
};

export { HEAVEN_RELIC_CHANCE, HEAVEN_COST_SHARE, UNDERWORLD_ECHO_CHANCE, UNIQUE_ECHO_MAX, UNIQUE_ECHO_TRIAL_SHARE, relicCandidates, uniqueCandidates };
