/* Endgame loot context / reward integrity fix. */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { abyssTargetFarmProfile, isSetDropId } from '../data/abyssTargetFarm.js';
import { rollUnique2ClearReward } from '../data/gearOverhaulPhase9TargetFarm.js';

function targetProfile(engine) {
  return engine?.stage?.isAbyss ? abyssTargetFarmProfile(engine.stage.abyssRoute?.id) : null;
}

function stageDropContext(engine, ctx = null) {
  const stage = engine?.stage || {};
  const base = ctx && typeof ctx === 'object' ? ctx : {};
  const target = targetProfile(engine);
  const realm = stage.loot3Profile || null;
  return {
    ...base,
    depth: stage.isAbyss ? Math.max(0, Math.floor(Number(stage.abyssDepth) || 0)) : Math.max(0, Math.floor(Number(base.depth) || 0)),
    itemPowerTarget: Math.max(0, Math.floor(Number(base.itemPowerTarget || stage.itemPowerTarget) || 0)),
    abyssRouteId: stage.abyssRoute?.id || null,
    world2KeyType: stage.world2KeyType || null,
    dropRegionTags: Array.isArray(stage.dropRegionTags) ? [...stage.dropRegionTags] : [],
    targetFarm: realm?.label || target?.label || null,
    preferredAffixIds: Array.isArray(realm?.preferredAffixIds) ? [...realm.preferredAffixIds] : [],
    targetAffixChance: Math.max(0, Math.min(1, Number(realm?.targetAffixChance) || 0)),
    informationalOnly: !!realm?.informationalOnly,
    cursedChanceMult: (Number(base.cursedChanceMult) || 1) * (Number(target?.cursedChanceMult) || 1) * (Number(realm?.cursedChanceMult) || 1),
    legendaryChanceAdd: (Number(base.legendaryChanceAdd) || 0) + (Number(target?.legendaryChanceAdd) || 0) + (Number(realm?.legendaryChanceAdd) || 0),
  };
}

function withDropRateMult(mult, fn) {
  const m = Math.max(0, Number(mult) || 1);
  if (m === 1) return fn();
  const previous = state.dropRateMult.bind(state);
  state.dropRateMult = function targetFarmDropRateMult() { return previous() * m; };
  try { return fn(); } finally { state.dropRateMult = previous; }
}

function withNonAbyssStageDropMult(engine, fn) {
  const stage = engine?.stage || {};
  if (stage.isAbyss || (!stage.secretRealm && !stage.isRift && !stage.keyDungeon)) return fn();
  return withDropRateMult(Math.max(0, Number(stage.dropMult) || 1), fn);
}

function withTargetSetWeights(engine, fn) {
  const profile = targetProfile(engine);
  const mult = Math.max(1, Number(profile?.setWeightMult) || 1);
  const original = engine?.stage?.dropTable;
  if (mult === 1 || !Array.isArray(original) || !original.some(d => isSetDropId(d?.itemId))) return fn();
  engine.stage.dropTable = original.map(d => isSetDropId(d?.itemId) ? { ...d, weight: (Number(d.weight) || 0) * mult } : d);
  try { return fn(); } finally { engine.stage.dropTable = original; }
}

const originalRollDrop = BattleEngine.prototype._rollDrop;
BattleEngine.prototype._rollDrop = function endgameRollDrop(dropCtx = null) {
  const ctx = stageDropContext(this, dropCtx);
  const profile = targetProfile(this);
  return withNonAbyssStageDropMult(this, () =>
    withDropRateMult(profile?.tableDropMult || 1, () =>
      withTargetSetWeights(this, () => originalRollDrop.call(this, ctx))));
};

const originalRollWeaponDrop = BattleEngine.prototype._rollWeaponDrop;
BattleEngine.prototype._rollWeaponDrop = function endgameRollWeaponDrop(dropCtx = null) {
  const ctx = stageDropContext(this, dropCtx);
  const profile = targetProfile(this);
  return withNonAbyssStageDropMult(this, () =>
    withDropRateMult(profile?.weaponDropMult || 1, () => originalRollWeaponDrop.call(this, ctx)));
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
  const output = withAbyssShardMult(this, () => originalFinishBattle.call(this, cleared, retreated));
  if (cleared && !retreated && this.stage?.isAbyss) {
    const profile = targetProfile(this);
    const chance = Math.max(0, Math.min(0.50, Number(profile?.riftKeyChance) || 0));
    if (chance > 0 && typeof state.addRiftKey === 'function' && Math.random() < chance) {
      const key = state.addRiftKey(this.stage.abyssDepth);
      const result = output || this.finalResult;
      if (key && result) result.riftKeyFound = key;
    }
  }
  if (cleared && !retreated && this.stage?.isRift) {
    const chase = rollUnique2ClearReward(this.stage);
    if (chase) {
      const isNew = state.addItem(chase.itemId, 1, stageDropContext(this));
      const result = output || this.finalResult;
      if (result) result.unique2TargetFarmDrop = { itemId:chase.itemId, targetFarmId:chase.id, isNew:!!isNew };
    }
  }
  return output;
};

export { stageDropContext, targetProfile };
