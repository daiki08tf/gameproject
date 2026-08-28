export const ENEMY_LEVEL_MIN = 1;
export const ENEMY_LEVEL_MAX = 99999;

export const ENEMY_LEVEL_BANDS = Object.freeze({
  ordinary: Object.freeze({ min: 0.92, max: 1.08 }),
  boss: Object.freeze({ min: 1, max: 1 }),
});

export const ENEMY_LEVEL_SCALE_EXPONENTS = Object.freeze({
  hp: 1.00,
  atk: 0.85,
  def: 0.70,
  spd: 0.15,
  xp: 0.78,
  gold: 0.62,
});

export function clampEnemyLevel(value) {
  const n = Math.round(Number(value) || ENEMY_LEVEL_MIN);
  return Math.max(ENEMY_LEVEL_MIN, Math.min(ENEMY_LEVEL_MAX, n));
}

export function stageEnemyBaseLevel(stage) {
  return clampEnemyLevel(stage?.enemyLevelBase ?? stage?.recLevel ?? ENEMY_LEVEL_MIN);
}

export function attachEnemyLevelMetadata(enemy, stage, explicitLevel = null) {
  if (!enemy) return enemy;
  const baseLevel = stageEnemyBaseLevel(stage);
  enemy.baseLevel = baseLevel;
  enemy.level = clampEnemyLevel(explicitLevel ?? baseLevel);
  return enemy;
}

export function rollEnemyLevel(stage, enemy, rng = Math.random) {
  const baseLevel = stageEnemyBaseLevel(stage);
  if (stage?.enemyLevelRoll === false || enemy?.boss) return baseLevel;
  const band = ENEMY_LEVEL_BANDS.ordinary;
  const roll = Math.max(0, Math.min(1, Number(rng?.()) || 0));
  const mult = band.min + (band.max - band.min) * roll;
  return clampEnemyLevel(baseLevel * mult);
}

export function enemyLevelRatio(enemy) {
  const base = clampEnemyLevel(enemy?.baseLevel ?? ENEMY_LEVEL_MIN);
  const level = clampEnemyLevel(enemy?.level ?? base);
  return level / base;
}

export function applyEnemyLevelScaling(enemy) {
  if (!enemy) return enemy;
  const ratio = enemyLevelRatio(enemy);
  if (ratio === 1) return enemy;

  const hpMult = Math.pow(ratio, ENEMY_LEVEL_SCALE_EXPONENTS.hp);
  const atkMult = Math.pow(ratio, ENEMY_LEVEL_SCALE_EXPONENTS.atk);
  const defMult = Math.pow(ratio, ENEMY_LEVEL_SCALE_EXPONENTS.def);
  const spdMult = Math.pow(ratio, ENEMY_LEVEL_SCALE_EXPONENTS.spd);
  const xpMult = Math.pow(ratio, ENEMY_LEVEL_SCALE_EXPONENTS.xp);
  const goldMult = Math.pow(ratio, ENEMY_LEVEL_SCALE_EXPONENTS.gold);

  enemy.hp = Math.max(1, Math.round(enemy.hp * hpMult));
  enemy.maxHp = enemy.hp;
  enemy.atk = Math.max(1, Math.round(enemy.atk * atkMult));
  enemy.def = Math.max(0, Math.round(enemy.def * defMult));
  enemy.spd = Math.max(1, Math.round(enemy.spd * spdMult));
  enemy.xp = Math.max(1, Math.round(enemy.xp * xpMult));
  enemy.gold = Math.max(1, Math.round(enemy.gold * goldMult));
  return enemy;
}
