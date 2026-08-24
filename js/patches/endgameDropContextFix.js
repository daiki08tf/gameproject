/* Endgame loot context / reward integrity fix. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';

function stageDropContext(engine, ctx = null) {
  const stage = engine?.stage || {};
  const base = ctx && typeof ctx === 'object' ? ctx : {};
  return {
    ...base,
    depth: stage.isAbyss ? Math.max(0, Math.floor(Number(stage.abyssDepth) || 0)) : Math.max(0, Math.floor(Number(base.depth) || 0)),
    itemPowerTarget: Math.max(0, Math.floor(Number(base.itemPowerTarget || stage.itemPowerTarget) || 0)),
  };
}

function withNonAbyssStageDropMult(engine, fn) {
  const stage = engine?.stage || {};
  if (stage.isAbyss || (!stage.secretRealm && !stage.isRift)) return fn();
  const stageMult = Math.max(0, Number(stage.dropMult) || 1);
  if (stageMult === 1) return fn();
  const previous = state.dropRateMult.bind(state);
  state.dropRateMult = function endgameStageDropRateMult() { return previous() * stageMult; };
  try { return fn(); } finally { state.dropRateMult = previous; }
}

const originalRollDrop = BattleEngine.prototype._rollDrop;
BattleEngine.prototype._rollDrop = function endgameRollDrop(dropCtx = null) {
  const ctx = stageDropContext(this, dropCtx);
  return withNonAbyssStageDropMult(this, () => originalRollDrop.call(this, ctx));
};

const originalRollWeaponDrop = BattleEngine.prototype._rollWeaponDrop;
BattleEngine.prototype._rollWeaponDrop = function endgameRollWeaponDrop(dropCtx = null) {
  const ctx = stageDropContext(this, dropCtx);
  return withNonAbyssStageDropMult(this, () => originalRollWeaponDrop.call(this, ctx));
};

const originalRollBossWeaponDrop = BattleEngine.prototype._rollBossWeaponDrop;
BattleEngine.prototype._rollBossWeaponDrop = function endgameRollBossWeaponDrop(dropCtx = null) {
  return originalRollBossWeaponDrop.call(this, stageDropContext(this, dropCtx));
};

function withAbyssShardMult(engine, fn) {
  const mult = engine?.stage?.isAbyss ? Math.max(1, Number(engine.stage.abyssShardMult) || 1) : 1;
  if (mult === 1) return fn();
  const previous = state.addAbyssShards.bind(state);
  state.addAbyssShards = function pactShardGain(amount) { return previous(Number(amount || 0) * mult); };
  try { return fn(); } finally { state.addAbyssShards = previous; }
}

const originalGrantKillRewards = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function endgameGrantKillRewards(enemy) {
  return withAbyssShardMult(this, () => originalGrantKillRewards.call(this, enemy));
};

const originalFinishBattle = BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle = function endgameFinishBattle(cleared, retreated) {
  return withAbyssShardMult(this, () => originalFinishBattle.call(this, cleared, retreated));
};

export { stageDropContext };
