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
function enemyCodexId(enemy) { return enemy && (enemy.type || enemy.enemyType || enemy.name); }
export function knownCodexEnemyIds() { return Object.keys(ENEMY_TYPES).filter(id => !id.startsWith('__')); }

state.markCodexSeen = function(enemy) {
  const id = enemyCodexId(enemy); if (!id) return;
  const e = ensureCodexEntry(ensureCodex(), id, enemy.name || id); e.seen = true; state.save();
};
state.markCodexKill = function(enemy) {
  const id = enemyCodexId(enemy); if (!id) return;
  const e = ensureCodexEntry(ensureCodex(), id, enemy.name || id); e.seen = true; e.kills = (e.kills || 0) + 1; state.save();
};
state.markCodexRecruit = function(enemyType, rarity = 'normal') {
  if (!enemyType) return;
  const e = ensureCodexEntry(ensureCodex(), enemyType, ENEMY_TYPES[enemyType]?.name || enemyType);
  e.seen = true; e.recruited = true;
  if (['rare','epic','legendary','mythic'].includes(rarity)) e.rare = true;
  if (['legendary','mythic'].includes(rarity)) e.legendary = true;
  state.save();
};
state.codexSummary = function() {
  const completion = codexCompletion(ensureCodex(), knownCodexEnemyIds());
  return { ...completion, bonuses: codexBonuses(completion.pct) };
};

const originalGetStats = state.getStats.bind(state);
state.getStats = function codexGetStats() {
  const s = originalGetStats(); const m = this.codexSummary().bonuses.allStatMult;
  for (const k of ['hp','mp','atk','def','mag','spd']) s[k] = Math.round(s[k] * m * (k === 'spd' ? 10 : 1)) / (k === 'spd' ? 10 : 1);
  return s;
};
const originalDropRateMult = state.dropRateMult.bind(state);
state.dropRateMult = function codexDropRateMult() { return originalDropRateMult() * this.codexSummary().bonuses.dropMult; };
if (state.gainCharacterExp) {
  const originalGainCharacterExp = state.gainCharacterExp.bind(state);
  state.gainCharacterExp = function codexGainCharacterExp(amount) { return originalGainCharacterExp(amount * this.codexSummary().bonuses.expMult); };
}

if (state.createCompanion) {
  const originalCreateCompanion = state.createCompanion.bind(state);
  const speciesToEnemy = { goblin: 'grunt', bat: 'fast' };
  state.createCompanion = function codexCreateCompanion(speciesId, opts = {}) {
    const id = originalCreateCompanion(speciesId, opts);
    const enemyType = opts.enemyType || speciesToEnemy[speciesId];
    if (id && enemyType) {
      const c = this.getCompanion?.(id);
      this.markCodexRecruit(enemyType, c?.instance?.rarity || opts.rarity || 'normal');
    }
    return id;
  };
}

// 「遭遇」と「撃破」を別の達成項目として成立させるため、遭遇グループが
// 生成された時点でseenを記録する。撤退しても遭遇記録は残る。
const originalBeginNextEncounter = BattleEngine.prototype.beginNextEncounter;
BattleEngine.prototype.beginNextEncounter = function codexBeginNextEncounter(...args) {
  const event = originalBeginNextEncounter.apply(this, args);
  for (const enemy of (this.enemies || [])) state.markCodexSeen(enemy);
  return event;
};

const originalGrantKillRewards = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function codexGrantKillRewards(enemy) {
  state.markCodexKill(enemy);
  return originalGrantKillRewards.call(this, enemy);
};

export { ensureCodex };
