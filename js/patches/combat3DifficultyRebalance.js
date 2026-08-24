import { BattleEngine } from '../battleEngine.js';

// Combat 3.x difficulty retune.
// The original enemy tables were calibrated for the retired real-time/contact-damage
// battle loop. Text combat now gives the player deterministic commands, strong job
// techniques, companions, AoE and formation knowledge. Apply a text-battle-only
// pressure layer so enemies survive long enough to use their roles/skills and their
// attacks matter without rewriting the legacy chapter/abyss data tables.
export const COMBAT3_DIFFICULTY = Object.freeze({
  normal: Object.freeze({ hp: 1.70, atk: 1.30, def: 1.15 }),
  boss: Object.freeze({ hp: 2.20, atk: 1.40, def: 1.20 }),
});

const originalSpawnEnemy = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function(type) {
  const enemy = originalSpawnEnemy.call(this, type);
  if (!enemy) return enemy;
  const mult = enemy.boss ? COMBAT3_DIFFICULTY.boss : COMBAT3_DIFFICULTY.normal;
  enemy.hp = Math.max(1, Math.round(enemy.hp * mult.hp));
  enemy.maxHp = enemy.hp;
  enemy.atk = Math.max(1, Math.round(enemy.atk * mult.atk));
  enemy.def = Math.max(0, Math.round(enemy.def * mult.def));
  return enemy;
};

// Combat 3.0 introduced several Battle Groups per stage, but the inherited text-battle
// adapter granted a completely free player action at the start of *every* group to mimic
// the old canvas enemy-walk-in delay. With AoE/companions this often deletes a priority
// caster/support before it can act. Keep the encounter reveal, but initiative now decides
// the first actual turn just like every other round.
const originalBeginNextEncounter = BattleEngine.prototype.beginNextEncounter;
BattleEngine.prototype.beginNextEncounter = function(...args) {
  const event = originalBeginNextEncounter.apply(this, args);
  if (event) this._freshGroupPending = false;
  return event;
};
