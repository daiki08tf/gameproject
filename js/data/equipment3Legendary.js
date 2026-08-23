/* ============================================================
   Equipment 3.0 E4 — Legendary Effects / Cursed Affixes
   ============================================================ */

export const LEGENDARY_EFFECTS = Object.freeze({
  thunderheart: {
    name: '雷神の心臓',
    desc: '会心時25%で強力な追撃が発生する',
    effects: [{ trigger: 'onCrit', kind: 'critExtraAttack', chance: 0.25, power: 0.75, perActionCap: 1 }],
  },
  execution_chain: {
    name: '処刑連鎖',
    desc: 'HP25%以下の敵へのダメージが大きく上昇する',
    effects: [{ trigger: 'passive', kind: 'executioner', power: 0.35, hpThreshold: 0.25 }],
  },
  soul_harvest: {
    name: '魂喰らい',
    desc: '撃破時にHPとMPを同時に回復する',
    effects: [
      { trigger: 'onKill', kind: 'healOnKill', power: 0.05 },
      { trigger: 'onKill', kind: 'mpOnKill', power: 0.04 },
    ],
  },
  arcane_echo: {
    name: '魔導反響',
    desc: 'じゅもん使用時12%で追加発動する',
    effects: [{ trigger: 'onSkill', kind: 'spellEcho', chance: 0.12, spellOnly: true }],
  },
  fortress_counter: {
    name: '不落の反撃',
    desc: 'ぼうぎょ後に強力な反撃を行う',
    effects: [{ trigger: 'onGuard', kind: 'guardCounter', power: 0.8 }],
  },
  venom_bloom: {
    name: '毒華',
    desc: '攻撃時18%で強力なDoTを付与する',
    effects: [{ trigger: 'onHit', kind: 'hitApplyDot', chance: 0.18, power: 0.5, dotTurns: 3, maxStacks: 4, perActionCap: 1 }],
  },
});

export const CURSED_AFFIXES = Object.freeze({
  blood_contract: {
    name: '血の契約',
    desc: '最大HP-30% / Damage+50%',
    statMult: { hp: 0.70 },
    effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.50 }],
  },
  mana_overload: {
    name: '魔神の知識',
    desc: '最大MP-30% / じゅもんDamage+45%',
    statMult: { mp: 0.70 },
    effects: [{ trigger: 'passive', kind: 'spellDmgAdd', power: 0.45 }],
  },
  glass_blade: {
    name: '修羅の刃',
    desc: 'DEF-25% / Damage+35%',
    statMult: { def: 0.75 },
    effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.35 }],
  },
});

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function deterministicUnit(key) {
  const s = String(key || 'legendary');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000000) / 999999;
}
function pickDeterministic(obj, key) {
  const ids = Object.keys(obj);
  if (!ids.length) return null;
  const index = Math.min(ids.length - 1, Math.floor(deterministicUnit(key) * ids.length));
  return ids[index];
}

export function legendaryEffectChance(item, itemPower, ctx = {}) {
  const rarity = item?.rarity;
  // Equipment 3.0 E4 is intentionally Epic+ only. High Item Power or a
  // Nemesis/EX source may improve an eligible item's chance, but may never
  // promote a Rare/Normal base into the Legendary Effect pool.
  if (!['epic', 'legendary', 'mythic'].includes(rarity)) return 0;
  let chance = rarity === 'mythic' ? 0.40 : rarity === 'legendary' ? 0.20 : itemPower >= 900 ? 0.04 : 0;
  chance += Math.min(0.12, Math.max(0, Number(itemPower) - 1000) / 75000);
  if (ctx.boss) chance += 0.05;
  if (ctx.ex) chance += 0.08;
  if (ctx.nemesis) chance += 0.12;
  return clamp(chance, 0, 0.70);
}

export function cursedAffixChance(item, itemPower, ctx = {}) {
  if (!item || !['epic', 'legendary', 'mythic'].includes(item.rarity)) return 0;
  let chance = item.rarity === 'mythic' ? 0.06 : item.rarity === 'legendary' ? 0.035 : 0.01;
  chance += Math.min(0.08, Math.max(0, Number(itemPower) - 1000) / 100000);
  if (ctx.ex) chance += 0.02;
  if (ctx.nemesis) chance += 0.04;
  return clamp(chance, 0, 0.20);
}

export function rollLegendaryPackage(item, itemPower, ctx = {}, instanceId = '') {
  const legendaryChance = legendaryEffectChance(item, itemPower, ctx);
  const curseChance = cursedAffixChance(item, itemPower, ctx);
  const legendaryEffectId = deterministicUnit(`${instanceId}:legendary:chance`) < legendaryChance
    ? pickDeterministic(LEGENDARY_EFFECTS, `${instanceId}:legendary:pick`)
    : null;
  const curseId = deterministicUnit(`${instanceId}:curse:chance`) < curseChance
    ? pickDeterministic(CURSED_AFFIXES, `${instanceId}:curse:pick`)
    : null;
  return { legendaryEffectId, curseId, legendaryChance, curseChance };
}

export function getLegendaryEffect(id) { return id ? LEGENDARY_EFFECTS[id] || null : null; }
export function getCursedAffix(id) { return id ? CURSED_AFFIXES[id] || null : null; }
