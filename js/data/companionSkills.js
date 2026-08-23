/* ============================================================
   Companion Skill Engine - data definitions and pure helpers
   ============================================================ */

export const COMPANION_SKILLS = Object.freeze({
  body_attack: {
    id: 'body_attack', name: 'たいあたり', type: 'damage', stat: 'atk', power: 1.00,
    mpCost: 0, target: 'enemy', priority: 1,
    desc: 'ATK100%の物理ダメージ',
  },
  slime_heal: {
    id: 'slime_heal', name: 'ぷるぷる回復', type: 'heal', stat: 'mag', power: 0.60,
    maxHpPct: 0.32, mpCost: 4, target: 'self', priority: 8, hpThreshold: 0.50,
    desc: 'HP50%以下で、自分のHPを回復',
  },
  club_hit: {
    id: 'club_hit', name: 'こんぼう打ち', type: 'damage', stat: 'atk', power: 1.05,
    mpCost: 0, target: 'enemy', priority: 1,
    desc: 'ATK105%の物理ダメージ',
  },
  dirty_trick: {
    id: 'dirty_trick', name: 'だまし討ち', type: 'damage', stat: 'atk', power: 1.35,
    mpCost: 3, target: 'enemy', priority: 5, preferLowHp: true,
    desc: 'ATK135%のダメージ。弱った敵を優先',
  },
  bite: {
    id: 'bite', name: 'かみつき', type: 'damage', stat: 'atk', power: 1.00,
    mpCost: 0, target: 'enemy', priority: 1,
    desc: 'ATK100%の物理ダメージ',
  },
  sonic: {
    id: 'sonic', name: '超音波', type: 'debuff', stat: 'mag', power: 0.90,
    mpCost: 4, target: 'enemy', priority: 6, debuff: { kind: 'weakenAtk', power: 0.15, turns: 2 },
    desc: 'MAG90%のダメージ＋敵ATK-15%（2ターン）',
  },
});

export function getCompanionSkill(id) {
  return COMPANION_SKILLS[id] || null;
}

export function unlockedCompanionSkills(species, level) {
  return (species?.skills || [])
    .filter((entry) => level >= (entry.level || 1))
    .map((entry) => getCompanionSkill(entry.id))
    .filter(Boolean);
}

export function chooseCompanionSkill(species, companion, enemies) {
  const skills = unlockedCompanionSkills(species, companion.level || 1)
    .filter((skill) => (companion.mp || 0) >= (skill.mpCost || 0));
  if (!skills.length) return null;

  const hpRatio = companion.hp / Math.max(1, companion.maxHp);
  const heal = skills
    .filter((skill) => skill.type === 'heal' && hpRatio <= (skill.hpThreshold ?? 0.5))
    .sort((a, b) => (b.priority || 0) - (a.priority || 0))[0];
  if (heal) return heal;

  const usable = skills.filter((skill) => skill.type !== 'heal');
  if (!usable.length) return null;

  // 高優先度技ほど使われやすいが、通常技も残してMP枯渇を抑える。
  const sorted = [...usable].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  const top = sorted[0];
  if ((top.mpCost || 0) > 0 && sorted.length > 1 && Math.random() >= 0.65) {
    return sorted.find((skill) => (skill.mpCost || 0) === 0) || top;
  }
  return top;
}
