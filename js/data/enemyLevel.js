export const ENEMY_LEVEL_MIN = 1;
export const ENEMY_LEVEL_MAX = 99999;

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
