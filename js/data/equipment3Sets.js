/* ============================================================
   Equipment 3.0 — Fixed Set equipment
   ------------------------------------------------------------
   Set pieces are fixed build items, not random Affix instances. 2-piece bonuses
   establish a direction; 3-piece bonuses change combat behaviour.
   ============================================================ */

export const EQUIPMENT3_SETS = Object.freeze({
  blood_king: {
    name: '血王', unlockDepth: 250,
    bonuses: {
      2: { desc: 'ATK+12% / 撃破時HP3%回復', statMult: { atk: 1.12 }, effects: [{ trigger: 'onKill', kind: 'healOnKill', power: 0.03 }] },
      3: { desc: '与ダメージ+20% / 撃破時さらにHP5%回復', effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.20 }, { trigger: 'onKill', kind: 'healOnKill', power: 0.05 }] },
    },
  },
  ancient_dragon: {
    name: '古竜', unlockDepth: 500,
    bonuses: {
      2: { desc: 'HP+12% / DEF+12%', statMult: { hp: 1.12, def: 1.12 } },
      3: { desc: '与ダメージ+12% / ぼうぎょ後に反撃', effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.12 }, { trigger: 'onGuard', kind: 'guardCounter', power: 0.65 }] },
    },
  },
  star_weaver: {
    name: '星導', unlockDepth: 900,
    bonuses: {
      2: { desc: 'MAG+15% / MP+10%', statMult: { mag: 1.15, mp: 1.10 } },
      3: { desc: 'じゅもんDamage+25% / 8%で追加詠唱', effects: [{ trigger: 'passive', kind: 'spellDmgAdd', power: 0.25 }, { trigger: 'onSkill', kind: 'spellEcho', chance: 0.08, spellOnly: true }] },
    },
  },
  abyss_walker: {
    name: '深淵歩き', unlockDepth: 1500,
    bonuses: {
      2: { desc: '防御貫通+8% / 回避+5%', statAdd: { armorPen: 0.08, evasion: 0.05 } },
      3: { desc: '与ダメージ+18% / 会心時10%で追撃', effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.18 }, { trigger: 'onCrit', kind: 'critExtraAttack', chance: 0.10, power: 0.50, perActionCap: 1 }] },
    },
  },
  executioner: {
    name: '処刑者', unlockDepth: 2200,
    bonuses: {
      2: { desc: '会心率+8pt / 与ダメージ+8%', statAdd: { critPct: 8 }, effects: [{ trigger: 'passive', kind: 'dmgBonusAdd', power: 0.08 }] },
      3: { desc: 'HP25%以下の敵へのDamage+35% / 会心時10%で追撃', effects: [{ trigger: 'passive', kind: 'executioner', power: 0.35, hpThreshold: 0.25 }, { trigger: 'onCrit', kind: 'critExtraAttack', chance: 0.10, power: 0.65, perActionCap: 1 }] },
    },
  },
});

export const SET_EQUIPMENT = Object.freeze([
  { id:'set_blood_head', name:'血王の兜', slot:'head', rarity:'mythic', setId:'blood_king', fixedSet:true, stats:{ def:90, hp:240, crit:5 } },
  { id:'set_blood_body', name:'血王の戦衣', slot:'body', rarity:'mythic', setId:'blood_king', fixedSet:true, stats:{ def:150, hp:620, atk:70 } },
  { id:'set_blood_accessory', name:'血王の印章', slot:'accessory', rarity:'mythic', setId:'blood_king', fixedSet:true, stats:{ atk:120, crit:8, hp:180 } },

  { id:'set_dragon_shield', name:'古竜の大盾', slot:'shield', rarity:'mythic', setId:'ancient_dragon', fixedSet:true, stats:{ def:230, hp:760 } },
  { id:'set_dragon_body', name:'古竜鱗の鎧', slot:'body', rarity:'mythic', setId:'ancient_dragon', fixedSet:true, stats:{ def:210, hp:900 } },
  { id:'set_dragon_accessory', name:'古竜の逆鱗', slot:'accessory', rarity:'mythic', setId:'ancient_dragon', fixedSet:true, stats:{ atk:90, def:90, hp:360 } },

  { id:'set_star_head', name:'星導の冠', slot:'head', rarity:'mythic', setId:'star_weaver', fixedSet:true, stats:{ mag:190, mp:440, crit:5 } },
  { id:'set_star_body', name:'星導の法衣', slot:'body', rarity:'mythic', setId:'star_weaver', fixedSet:true, stats:{ def:130, mag:110, mp:360 } },
  { id:'set_star_accessory', name:'星環の宝珠', slot:'accessory', rarity:'mythic', setId:'star_weaver', fixedSet:true, stats:{ mag:170, mp:260, crit:7 } },

  { id:'set_abyss_head', name:'深淵歩きの仮面', slot:'head', rarity:'mythic', setId:'abyss_walker', fixedSet:true, stats:{ def:100, spd:38, crit:9 } },
  { id:'set_abyss_body', name:'深淵歩きの外套', slot:'body', rarity:'mythic', setId:'abyss_walker', fixedSet:true, stats:{ def:170, hp:560, spd:24 } },
  { id:'set_abyss_accessory', name:'深淵の羅針盤', slot:'accessory', rarity:'mythic', setId:'abyss_walker', fixedSet:true, stats:{ atk:90, mag:90, spd:30, crit:6 } },

  { id:'set_executioner_head', name:'処刑者の面頬', slot:'head', rarity:'mythic', setId:'executioner', fixedSet:true, stats:{ atk:160, crit:11, def:70 } },
  { id:'set_executioner_body', name:'処刑者の黒鎧', slot:'body', rarity:'mythic', setId:'executioner', fixedSet:true, stats:{ atk:110, def:160, hp:500 } },
  { id:'set_executioner_accessory', name:'断罪の指輪', slot:'accessory', rarity:'mythic', setId:'executioner', fixedSet:true, stats:{ atk:190, crit:10, spd:18 } },
]);

export function setDefinition(setId) { return EQUIPMENT3_SETS[setId] || null; }
export function setPieces(setId) { return SET_EQUIPMENT.filter((item) => item.setId === setId); }

export function setDropsForDepth(depth, bossFloor = false) {
  const d = Math.max(1, Math.floor(Number(depth) || 1));
  const unlocked = Object.entries(EQUIPMENT3_SETS).filter(([, def]) => d >= def.unlockDepth);
  if (!unlocked.length) return [];
  const newest = unlocked[unlocked.length - 1][0];
  return SET_EQUIPMENT
    .filter((item) => unlocked.some(([id]) => id === item.setId))
    .map((item) => ({
      itemId: item.id,
      weight: item.setId === newest ? (bossFloor ? 0.20 : 0.10) : (bossFloor ? 0.07 : 0.035),
    }));
}
