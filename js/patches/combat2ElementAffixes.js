/* ============================================================
   Combat 2.0 — Element build Affixes
   ------------------------------------------------------------
   Adds element-specific affixes to the shared Equipment 3.0 pool at startup.
   Existing affix generation automatically picks them up for weapons/gear.
   ============================================================ */
import { AFFIXES } from '../data/affixes.js';

const defs = {
  element_fire_dmg: ['炎術', 'fire', '炎Damage'],
  element_ice_dmg: ['氷術', 'ice', '氷Damage'],
  element_lightning_dmg: ['雷術', 'lightning', '雷Damage'],
  element_wind_dmg: ['風術', 'wind', '風Damage'],
  element_light_dmg: ['聖光', 'light', '光Damage'],
  element_dark_dmg: ['深闇', 'dark', '闇Damage'],
};

for (const [id, [name, element, label]] of Object.entries(defs)) {
  if (AFFIXES[id]) continue;
  AFFIXES[id] = {
    name,
    category: element === 'light' || element === 'dark' ? 'BUILD' : 'MAGIC',
    scale: 'big',
    desc: (v) => `${label} +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'elementDmg', element, power: v / 100 }),
  };
}
