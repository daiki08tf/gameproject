/* ============================================================
   Combat 2.0 — Debug / compatibility safety
   ------------------------------------------------------------
   The legacy randomEnemies resolver was originally written only for Meteor and
   skipped several fields supported by the normal damage resolver. Combat 2.0's
   Split modifier makes randomEnemies a general-purpose target mode, so bring it
   to feature parity without changing the normal damage path.
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { CAPS_LAYER } from '../data/balance.js';

function randomTechniqueDamage(engine, tech, result, kind) {
  const hits = Math.max(1, Math.floor(Number(tech.hits) || 1));
  const statValue = tech.hybrid ? (engine._effectiveAtk() + engine._effectiveMag()) / 2
    : (tech.magic ? engine._effectiveMag() : engine._effectiveAtk());
  const opts = {};
  if (tech.armorPenBonus) opts.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, engine._effectiveArmorPen() + tech.armorPenBonus);
  if (tech.critBonus) opts.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, engine._effectiveCritPct() + tech.critBonus);

  let conditionBonusPower = 0;
  if (tech.conditionBonus && engine._conditionMet(tech.conditionBonus)) conditionBonusPower += tech.conditionBonus.power;
  if (tech.lowHpScalePower) {
    const hpRatio = engine.player.maxHp > 0 ? engine.player.hp / engine.player.maxHp : 1;
    conditionBonusPower += tech.lowHpScalePower.maxBonus * Math.max(0, 1 - hpRatio);
  }
  if (tech.evasionCountScale) {
    const c = tech.evasionCountScale;
    conditionBonusPower += Math.min(c.max, c.perCount * (engine._playerEvasionCount || 0));
  }

  const touched = new Map();
  for (let i = 0; i < hits; i += 1) {
    const alive = engine.aliveEnemies;
    if (alive.length === 0) break;
    const target = alive[Math.floor(Math.random() * alive.length)];
    const targetBonusPower = engine._targetBonusPower(tech.targetBonus, target);
    const power = tech.power + conditionBonusPower + targetBonusPower;
    const atkValue = statValue * power * engine._mainDmgMult(kind);
    const { damage, critical } = engine.calculateDamage(atkValue, target, opts);
    const hit = engine._applyDamageToEnemy(target, damage, critical, i, hits);

    let entry = result.targets.find((row) => row.targetId === target.id);
    if (!entry) {
      entry = { targetId: target.id, targetName: target.name, damage: 0, criticalCount: 0, hitCount: 0, effects: [], defeated: false, kill: null };
      result.targets.push(entry);
    }
    entry.damage += damage;
    entry.hitCount += 1;
    if (critical) entry.criticalCount += 1;
    entry.effects.push(...hit.effects);
    entry.defeated = target.dead;
    entry.critical = entry.criticalCount > 0;
    if (hit.kill) entry.kill = hit.kill;
    touched.set(target.id, target);

    if (critical && tech.critFollowup && !target.dead) {
      const followAtk = statValue * tech.power * tech.critFollowup.powerMult * engine._mainDmgMult(kind);
      const follow = engine.calculateDamage(followAtk, target, opts);
      const followHit = engine._applyDamageToEnemy(target, follow.damage, follow.critical);
      entry.damage += follow.damage;
      entry.hitCount += 1;
      if (follow.critical) entry.criticalCount += 1;
      entry.effects.push(...followHit.effects);
      entry.defeated = target.dead;
      entry.critical = entry.criticalCount > 0;
      if (followHit.kill) entry.kill = followHit.kill;
    }
  }

  // Status payloads are applied once per target touched, matching the normal
  // multi-hit resolver's "once per action/target" behaviour rather than once per hit.
  for (const target of touched.values()) {
    if (target.dead) continue;
    if (tech.weaken) engine._applyWeakenList(target, tech.weaken, target);
    if (tech.dot) {
      engine._applyDotToTarget(target, tech.dot.power, tech.dot.turns, tech.dot.maxStacks || 99);
      engine.applyEffect('onDot', {});
    }
  }
  if (tech.selfBuff) engine._applyBuffPayload(tech.selfBuff, result);
  if (result.targets.length === 0) result.noTarget = true;
}

const previousResolveTechniqueDamage = BattleEngine.prototype._resolveTechniqueDamage;
BattleEngine.prototype._resolveTechniqueDamage = function combat2ResolveTechniqueDamage(tech, targetId, result, kind) {
  if (tech?.target === 'randomEnemies') {
    randomTechniqueDamage(this, tech, result, kind);
    return;
  }
  return previousResolveTechniqueDamage.call(this, tech, targetId, result, kind);
};

export { randomTechniqueDamage };
