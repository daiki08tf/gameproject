/* ============================================================
   Codex 2.0 foundation - battle/recruit tracking + permanent bonuses
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { codexCompletion, codexBonuses, ensureCodexEntry } from '../data/codex.js';

function ensureCodex() {
  if (!state.data.monsterCodex) state.data.monsterCodex = {};
  return state.data.monsterCodex;
}

function enemyCodexId(enemy) {
  return enemy && (enemy.type || enemy.enemyType || enemy.name);
}

export function knownCodexEnemyIds() {
  return Object.keys(ENEMY_TYPES).filter(id => !id.startsWith('__'));
}

state.markCodexSeen = function(enemy) {
  const id = enemyCodexId(enemy); if (!id) return;
  const e = ensureCodexEntry(ensureCodex(), id, enemy.name || id);
  e.seen = true; state.save();
};
state.markCodexKill = function(enemy) {
  const id = enemyCodexId(enemy); if (!id) return;
  const e = ensureCodexEntry(ensureCodex(), id, enemy.name || id);
  e.seen = true; e.kills = (e.kills || 0) + 1; state.save();
};
state.markCodexRecruit = function(enemyType, rarity = 'normal') {
  if (!enemyType) return;
  const e = ensureCodexEntry(ensureCodex(), enemyType, ENEMY_TYPES[enemyType]?.name || enemyType);
  e.seen = true; e.recruited = true;
  if (['rare','epic','legendary'].includes(rarity)) e.rare = true;
  if (rarity === 'legendary') e.legendary = true;
  state.save();
};
state.codexSummary = function() {
  const completion = codexCompletion(ensureCodex(), knownCodexEnemyIds());
  return { ...completion, bonuses: codexBonuses(completion.pct) };
};

// Codex bonus layer: small permanent multiplier after existing stats, before future Rune finalization.
const originalGetStats = state.getStats.bind(state);
state.getStats = function codexGetStats() {
  const s = originalGetStats();
  const m = this.codexSummary().bonuses.allStatMult;
  for (const k of ['hp','mp','atk','def','mag','spd']) s[k] = Math.round(s[k] * m * (k === 'spd' ? 10 : 1)) / (k === 'spd' ? 10 : 1);
  return s;
};
const originalDropRateMult = state.dropRateMult.bind(state);
state.dropRateMult = function codexDropRateMult() { return originalDropRateMult() * this.codexSummary().bonuses.dropMult; };

// Encounter tracking: enemies become visible in Codex as soon as an encounter is prepared.
const originalPrepareEncounter = BattleEngine.prototype._prepareEncounter;
if (originalPrepareEncounter) BattleEngine.prototype._prepareEncounter = function codexPrepareEncounter(...args) {
  const out = originalPrepareEncounter.apply(this, args);
  for (const e of (this.enemies || [])) state.markCodexSeen(e);
  return out;
};

// Defeat tracking shares the same stable reward hook already used by companion recruitment.
const originalGrantKillRewards = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function codexGrantKillRewards(enemy) {
  state.markCodexKill(enemy);
  return originalGrantKillRewards.call(this, enemy);
};

export { ensureCodex };
