export const COMPANION_SYNERGIES = Object.freeze([
  {
    id: 'full_party', name: '三位一体',
    test: party => party.length >= 3,
    bonuses: { hpMult: 1.05, defMult: 1.05 },
    desc: '3体編成：仲間HP/DEF +5%',
  },
  {
    id: 'diverse_species', name: '異種連携',
    test: party => party.length >= 3 && new Set(party.map(c => c.instance.baseSpeciesId || c.instance.speciesId)).size >= 3,
    bonuses: { atkMult: 1.05, magMult: 1.05, spdMult: 1.05 },
    desc: '3種族編成：仲間ATK/MAG/SPD +5%',
  },
  {
    id: 'evolved_pair', name: '覚醒共鳴',
    test: party => party.filter(c => !!c.instance.evolution).length >= 2,
    bonuses: { atkMult: 1.08, magMult: 1.08 },
    desc: '進化済み2体以上：仲間ATK/MAG +8%',
  },
  {
    id: 'ai_trinity', name: '役割分担',
    test: party => party.length >= 3 && new Set(party.map(c => c.nature?.ai || c.instance.nature)).size >= 3,
    bonuses: { hpMult: 1.03, atkMult: 1.03, defMult: 1.03, magMult: 1.03, spdMult: 1.03 },
    desc: '異なるAI役割3種：仲間全能力 +3%',
  },
]);

export function evaluateCompanionSynergies(party = []) {
  const active = COMPANION_SYNERGIES.filter(s => s.test(party));
  const total = { hpMult:1, atkMult:1, defMult:1, magMult:1, spdMult:1 };
  for (const s of active) for (const [k,v] of Object.entries(s.bonuses)) total[k] *= v;
  return { active, total };
}

export function bondRuneEffects(marks = 0) {
  const n = Math.min(1000, Math.max(0, Math.floor(Number(marks) || 0)));
  return {
    effectiveMarks: n,
    recruitChanceBonus: Math.min(0.15, n * 0.00015),
    companionExpMult: 1 + Math.min(0.50, n * 0.00050),
    rareRecruitChance: Math.min(0.20, n * 0.00020),
  };
}
