/* ============================================================
   Combat 2.0 — Element rules
   ============================================================ */
import { enemyAffinityResist, affinityMultiplierFromResist } from './enemyAffinity2.js';

export const COMBAT2_ELEMENTS = Object.freeze({
  fire:      { name: '炎', icon: '🔥', strongAgainst: ['ice'], weakAgainst: ['water'] },
  ice:       { name: '氷', icon: '❄️', strongAgainst: ['wind'], weakAgainst: ['fire'] },
  lightning: { name: '雷', icon: '⚡', strongAgainst: ['water'], weakAgainst: ['earth'] },
  wind:      { name: '風', icon: '🌪️', strongAgainst: ['earth'], weakAgainst: ['ice'] },
  light:     { name: '光', icon: '✨', strongAgainst: ['dark'], weakAgainst: [] },
  dark:      { name: '闇', icon: '🌑', strongAgainst: ['light'], weakAgainst: [] },
  poison:    { name: '毒', icon: '☠️', strongAgainst: [], weakAgainst: [] },
  bleed:     { name: '出血', icon: '🩸', strongAgainst: [], weakAgainst: [] },
});

export const ELEMENT_DAMAGE_CAP = Object.freeze({ min: 0.65, max: 1.55 });

const FAMILY_BY_ENEMY_ID = Object.freeze({
  fire: ['fire', 'flame', 'lava', 'inferno', 'dragon'],
  ice: ['ice', 'frost', 'snow', 'glacier'],
  lightning: ['thunder', 'lightning', 'storm'],
  wind: ['wind', 'gale', 'sky'],
  light: ['holy', 'angel', 'saint'],
  dark: ['dark', 'shadow', 'demon', 'abyss', 'void'],
});

export function inferEnemyElement(enemy = {}) {
  if (enemy.element) return enemy.element;
  const text = `${enemy.typeId || ''} ${enemy.id || ''} ${enemy.name || ''}`.toLowerCase();
  for (const [element, keys] of Object.entries(FAMILY_BY_ENEMY_ID)) {
    if (keys.some((key) => text.includes(key))) return element;
  }
  return null;
}

export function elementMultiplier(attackElement, enemy = {}) {
  if (!attackElement || attackElement === 'random') return 1;
  const affinityResist = enemyAffinityResist(enemy, attackElement);
  if (Number.isFinite(affinityResist)) return affinityMultiplierFromResist(affinityResist);
  const enemyElement = inferEnemyElement(enemy);
  if (!enemyElement || enemyElement === attackElement) return enemyElement === attackElement ? 0.82 : 1;
  const attack = COMBAT2_ELEMENTS[attackElement];
  if (!attack) return 1;
  if (attack.strongAgainst.includes(enemyElement)) return 1.25;
  if (attack.weakAgainst.includes(enemyElement)) return 0.80;
  const enemyDef = COMBAT2_ELEMENTS[enemyElement];
  if (enemyDef?.strongAgainst?.includes(attackElement)) return 0.85;
  return 1;
}

export function resolveRandomElement(key = 0) {
  const pool = ['fire', 'ice', 'lightning', 'wind', 'light', 'dark'];
  const n = Math.abs(Math.floor(Number(key) || 0));
  return pool[n % pool.length];
}

export function elementLabel(element) {
  const def = COMBAT2_ELEMENTS[element];
  return def ? def.name : '';
}
