/* ============================================================
   Companion species definitions
   ------------------------------------------------------------
   Character/monster allies share one data model. Species data is
   immutable; per-save growth/rarity/nature lives in companionInstances.
   ============================================================ */

export const COMPANION_RARITY = ['normal', 'rare', 'epic', 'legendary', 'mythic'];
export const COMPANION_RARITY_LABEL = {
  normal: 'ノーマル', rare: 'レア', epic: 'エピック', legendary: 'レジェンダリー', mythic: 'ミシック',
};

export const COMPANION_NATURES = {
  balanced: { name: '素直', statMult: {} },
  brave: { name: '勇敢', statMult: { atk: 1.08, def: 0.97 }, ai: 'aggressive' },
  cautious: { name: '慎重', statMult: { def: 1.08, spd: 0.97 }, ai: 'defensive' },
  clever: { name: '賢い', statMult: { mag: 1.08, hp: 0.97 }, ai: 'support' },
  quick: { name: 'せっかち', statMult: { spd: 1.08, def: 0.97 }, ai: 'aggressive' },
};

export const COMPANION_SPECIES = {
  slime: {
    id: 'slime', name: 'スライム', type: 'monster', icon: '🔵',
    baseStats: { hp: 42, mp: 10, atk: 8, def: 7, mag: 4, spd: 7 },
    growth: { hp: 5.2, mp: 1.1, atk: 1.7, def: 1.5, mag: 0.9, spd: 0.7 },
    recruit: { baseChance: 0.12 },
    traits: ['ぷにぷにボディ'],
    skills: [{ level: 1, id: 'body_attack', name: 'たいあたり' }, { level: 8, id: 'slime_heal', name: 'ぷるぷる回復' }],
  },
  goblin: {
    id: 'goblin', name: 'ゴブリン', type: 'monster', icon: '👺',
    baseStats: { hp: 48, mp: 6, atk: 11, def: 6, mag: 2, spd: 8 },
    growth: { hp: 5.6, mp: 0.7, atk: 2.0, def: 1.3, mag: 0.5, spd: 0.8 },
    recruit: { baseChance: 0.08 },
    traits: ['悪知恵'],
    skills: [{ level: 1, id: 'club_hit', name: 'こんぼう打ち' }, { level: 10, id: 'dirty_trick', name: 'だまし討ち' }],
  },
  bat: {
    id: 'bat', name: 'コウモリ', type: 'monster', icon: '🦇',
    baseStats: { hp: 30, mp: 9, atk: 7, def: 4, mag: 5, spd: 13 },
    growth: { hp: 4.0, mp: 1.0, atk: 1.3, def: 0.8, mag: 1.0, spd: 1.2 },
    recruit: { baseChance: 0.10 },
    traits: ['夜目'],
    skills: [{ level: 1, id: 'bite', name: 'かみつき' }, { level: 9, id: 'sonic', name: '超音波' }],
  },
};

export function getCompanionSpecies(id) { return COMPANION_SPECIES[id] || null; }

export function companionExpToNext(level) {
  return Math.round(18 + level * 14 + Math.pow(level, 1.5) * 1.8);
}

export function companionStats(species, instance) {
  const lv = Math.max(1, instance.level || 1);
  const nature = COMPANION_NATURES[instance.nature] || COMPANION_NATURES.balanced;
  const talent = instance.talent || {};
  const out = {};
  for (const stat of ['hp', 'mp', 'atk', 'def', 'mag', 'spd']) {
    const raw = species.baseStats[stat] + species.growth[stat] * (lv - 1);
    const talentMult = talent[stat] || 1;
    const natureMult = (nature.statMult && nature.statMult[stat]) || 1;
    out[stat] = Math.max(1, Math.round(raw * talentMult * natureMult));
  }
  return out;
}
