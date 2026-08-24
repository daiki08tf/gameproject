/* ============================================================
   Combat 2.0 — Skill Modifier rules
   ------------------------------------------------------------
   One modifier can be selected per active technique. The technique id remains
   unchanged so MP/cooldown/once-per-battle rules cannot be bypassed by cycling
   variants. Modifiers transform existing technique fields only.
   ============================================================ */

export const SKILL_MODIFIERS = Object.freeze({
  none: { id: 'none', name: '標準', desc: '元の性能のまま' },
  giant: { id: 'giant', name: '巨大化', desc: '威力+45% / MP+35% / CD+1' },
  split: { id: 'split', name: '分裂', desc: '単体攻撃を3Hitランダム化 / 1Hit威力55%' },
  focus: { id: 'focus', name: '集中', desc: '威力-5% / 会心+20pt / 防御貫通+8%' },
  efficient: { id: 'efficient', name: '省魔', desc: '威力-15% / MP-35%' },
  searing: { id: 'searing', name: '灼熱', desc: '炎攻撃に継続ダメージを追加' },
});

export function compatibleModifierIds(tech = {}) {
  const ids = ['none'];
  if (tech.type === 'damage' && Number(tech.power) > 0) {
    ids.push('giant', 'focus', 'efficient');
    if (tech.target === 'enemy' && (!tech.hits || tech.hits === 1)) ids.push('split');
    if (tech.element === 'fire') ids.push('searing');
  }
  return ids;
}

function round(value, digits = 3) {
  const p = 10 ** digits;
  return Math.round(value * p) / p;
}

export function applySkillModifier(tech, modifierId = 'none') {
  if (!tech) return tech;
  const compatible = compatibleModifierIds(tech);
  const id = compatible.includes(modifierId) ? modifierId : 'none';
  if (id === 'none') return { ...tech, modifierId: 'none', modifierLabel: SKILL_MODIFIERS.none.name };

  const out = { ...tech, modifierId: id, modifierLabel: SKILL_MODIFIERS[id].name };
  if (tech.buff) out.buff = { ...tech.buff };
  if (tech.selfBuff) out.selfBuff = { ...tech.selfBuff };
  if (tech.weaken && !Array.isArray(tech.weaken)) out.weaken = { ...tech.weaken };
  if (tech.dot) out.dot = { ...tech.dot };

  if (id === 'giant') {
    out.power = round(tech.power * 1.45);
    out.mpCost = Math.max(0, Math.ceil((tech.mpCost || 0) * 1.35));
    out.cooldownTurns = Math.max(0, (tech.cooldownTurns || 0) + 1);
  } else if (id === 'split') {
    out.target = 'randomEnemies';
    out.hits = 3;
    out.power = round(tech.power * 0.55);
    out.mpCost = Math.max(0, Math.ceil((tech.mpCost || 0) * 1.25));
  } else if (id === 'focus') {
    out.power = round(tech.power * 0.95);
    out.critBonus = (tech.critBonus || 0) + 20;
    out.armorPenBonus = Math.min(0.50, (tech.armorPenBonus || 0) + 0.08);
  } else if (id === 'efficient') {
    out.power = round(tech.power * 0.85);
    out.mpCost = Math.max(1, Math.floor((tech.mpCost || 0) * 0.65));
  } else if (id === 'searing') {
    out.dot = {
      power: Math.max(tech.dot?.power || 0, 0.10),
      turns: Math.max(tech.dot?.turns || 0, 3),
      maxStacks: Math.max(tech.dot?.maxStacks || 0, 2),
    };
  }
  return out;
}

export function nextModifierId(tech, currentId = 'none') {
  const ids = compatibleModifierIds(tech);
  const index = Math.max(0, ids.indexOf(currentId));
  return ids[(index + 1) % ids.length];
}
