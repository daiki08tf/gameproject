/* ============================================================
   Companion System Phase 2 - battle participation
   ------------------------------------------------------------
   Keeps the existing BattleEngine turn order intact and adds one
   autonomous companion action after a resolved round. Companion EXP is
   awarded from the same enemy reward path as player EXP so every kill
   route (normal attack / skill / DoT / proc) stays consistent.
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { COMPANION_NATURES } from '../data/companions.js';

function ensureCompanionBattle(engine) {
  if (engine._companionBattleReady) return;
  engine._companionBattleReady = true;
  const c = state.activeCompanion ? state.activeCompanion() : null;
  if (!c) {
    engine.companion = null;
    return;
  }
  engine.companion = {
    id: c.id,
    name: c.instance.nickname || c.species.name,
    speciesId: c.species.id,
    nature: c.instance.nature,
    hp: c.stats.hp,
    maxHp: c.stats.hp,
    mp: c.stats.mp,
    maxMp: c.stats.mp,
    atk: c.stats.atk,
    def: c.stats.def,
    mag: c.stats.mag,
    spd: c.stats.spd,
  };
}

function companionDamage(engine, companion, target) {
  const nature = COMPANION_NATURES[companion.nature] || COMPANION_NATURES.balanced;
  let power = companion.atk;
  if (nature.ai === 'support' && companion.mag > companion.atk) power = companion.mag * 0.9;
  const variance = 0.90 + Math.random() * 0.20;
  const raw = Math.max(1, power * variance);
  // Lightweight DEF curve that mirrors the game's ratio-style mitigation idea
  // without modifying BattleEngine's player damage buckets.
  const mitigation = target.def / (target.def + 55);
  return Math.max(1, Math.round(raw * (1 - mitigation)));
}

function chooseTarget(engine, companion) {
  const alive = engine.aliveEnemies;
  if (!alive.length) return null;
  const nature = COMPANION_NATURES[companion.nature] || COMPANION_NATURES.balanced;
  if (nature.ai === 'aggressive') {
    return [...alive].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  }
  if (nature.ai === 'defensive') {
    return [...alive].sort((a, b) => b.atk - a.atk)[0];
  }
  return alive[Math.floor(Math.random() * alive.length)];
}

function performCompanionTurn(engine) {
  ensureCompanionBattle(engine);
  const c = engine.companion;
  if (!c || c.hp <= 0 || engine.over) return null;
  const target = chooseTarget(engine, c);
  if (!target) return null;

  const damage = companionDamage(engine, c, target);
  const kill = engine._applyRawDamageAndReward(target, damage);
  return {
    action: 'attack',
    companion: true,
    companionId: c.id,
    companionName: c.name,
    targetId: target.id,
    // BattleLog Phase 1 compatibility: existing playerAction renderer can show
    // this immediately; a dedicated companionAction renderer can replace it later.
    targetName: `${c.name} → ${target.name}`,
    damage,
    critical: false,
    defeated: target.dead,
    effects: [],
    kill,
  };
}

const originalAdvanceTurn = BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn = function patchedAdvanceTurn(command) {
  ensureCompanionBattle(this);
  const out = originalAdvanceTurn.call(this, command);

  // Invalid commands do not consume a round; do not grant a free companion turn.
  const blocked = out.events && out.events.some((ev) => ev.type === 'playerAction' && ev.result && ev.result.blocked);
  const fled = out.result && out.result.retreated;
  if (!blocked && !fled && !out.over && this.aliveEnemies.length > 0) {
    const result = performCompanionTurn(this);
    if (result) out.events.push({ type: 'playerAction', result });
  }

  // Companion may finish the last enemy after the original round-end check.
  // Final victory will resolve naturally on the next command/encounter transition;
  // this avoids duplicating BattleEngine's calibrated _afterRoundChecks flow.
  return out;
};

const originalGrantKillRewards = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function patchedGrantKillRewards(enemy) {
  const result = originalGrantKillRewards.call(this, enemy);
  if (result && state.gainCompanionExp && state.activeCompanionId && state.activeCompanionId()) {
    const gained = Math.max(1, Math.round((enemy.xp || 0) * 0.75));
    const exp = state.gainCompanionExp(gained);
    result.companionExp = exp.gained;
    result.companionLeveledUp = exp.leveledUp;
    result.companionLevel = exp.level;
  }
  return result;
};

export { performCompanionTurn };
