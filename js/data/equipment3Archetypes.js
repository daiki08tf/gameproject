/* ============================================================
   Equipment 3.0 E5 — Weapon Archetypes
   ------------------------------------------------------------
   The existing 8 mastery families stay intact for job compatibility, while
   each family branches into three loot archetypes. This creates 24 distinct
   weapon identities without invalidating old saves or job weapon mastery.
   ============================================================ */

export const WEAPON_ARCHETYPES = Object.freeze({
  sword: [
    { id:'longsword', name:'片手剣', identity:'万能・安定', statMult:{ atk:1.03, spd:1.03 }, effect:{ trigger:'passive', kind:'normalDmgAdd', power:0.04 } },
    { id:'greatsword', name:'大剣', identity:'低速・高火力', statMult:{ atk:1.12, spd:0.90 }, effect:{ trigger:'passive', kind:'bossDmg', power:0.06 } },
    { id:'katana', name:'刀', identity:'会心・反撃', statMult:{ atk:1.04, crit:1.15 }, effect:{ trigger:'passive', kind:'critDamageBoost', power:0.08 } },
  ],
  axe: [
    { id:'battleaxe', name:'戦斧', identity:'標準破壊型', statMult:{ atk:1.05 }, statAdd:{ armorPen:0.02 } },
    { id:'greataxe', name:'大斧', identity:'処刑・一撃', statMult:{ atk:1.13, spd:0.88 }, effect:{ trigger:'passive', kind:'executioner', power:0.08, hpThreshold:0.25 } },
    { id:'tomahawk', name:'軽斧', identity:'速度・会心', statMult:{ atk:0.97, spd:1.12, crit:1.08 }, effect:{ trigger:'passive', kind:'atkSpeedAdd', power:0.04 } },
  ],
  staff: [
    { id:'wand', name:'魔杖', identity:'純魔力', statMult:{ mag:1.10, atk:0.95 }, effect:{ trigger:'passive', kind:'spellDmgAdd', power:0.05 } },
    { id:'battlestaff', name:'戦杖', identity:'物魔両立', statMult:{ atk:1.08, mag:1.04 }, effect:{ trigger:'passive', kind:'normalDmgAdd', power:0.04 } },
    { id:'grimoire', name:'魔導書', identity:'MP循環・詠唱', statMult:{ mag:1.06 }, effect:{ trigger:'passive', kind:'mpCostReduce', power:0.05 } },
  ],
  bow: [
    { id:'longbow', name:'長弓', identity:'Boss・高威力', statMult:{ atk:1.08, spd:0.95 }, effect:{ trigger:'passive', kind:'bossDmg', power:0.05 } },
    { id:'shortbow', name:'短弓', identity:'高速連射', statMult:{ atk:0.96, spd:1.14 }, effect:{ trigger:'passive', kind:'atkSpeedAdd', power:0.05 } },
    { id:'crossbow', name:'弩', identity:'貫通・会心', statMult:{ atk:1.06, crit:1.10, spd:0.94 }, statAdd:{ armorPen:0.025 } },
  ],
  dagger: [
    { id:'knife', name:'短刀', identity:'速度・回避', statMult:{ spd:1.10 }, statAdd:{ evasion:0.02 } },
    { id:'twinblade', name:'双短剣', identity:'連撃・会心', statMult:{ atk:0.97, spd:1.08, crit:1.12 }, effect:{ trigger:'passive', kind:'normalDmgAdd', power:0.05 } },
    { id:'assassin', name:'暗殺刃', identity:'瀕死特効', statMult:{ crit:1.15 }, effect:{ trigger:'passive', kind:'executioner', power:0.07, hpThreshold:0.25 } },
  ],
  knuckle: [
    { id:'gauntlet', name:'拳甲', identity:'攻防一体', statMult:{ atk:1.04 }, statAdd:{ def:1 } },
    { id:'claw', name:'爪', identity:'速度・会心', statMult:{ atk:0.98, spd:1.12, crit:1.12 }, effect:{ trigger:'passive', kind:'atkSpeedAdd', power:0.04 } },
    { id:'cestus', name:'セスタス', identity:'手数・吸命', statMult:{ atk:1.02, spd:1.06 }, effect:{ trigger:'onHit', kind:'lifesteal', power:0.02 } },
  ],
  instrument: [
    { id:'harp', name:'竪琴', identity:'魔力・支援', statMult:{ mag:1.08 }, effect:{ trigger:'passive', kind:'spellDmgAdd', power:0.04 } },
    { id:'flute', name:'笛', identity:'速度・MP循環', statMult:{ spd:1.10, mag:1.03 }, effect:{ trigger:'passive', kind:'mpCostReduce', power:0.04 } },
    { id:'wardrum', name:'戦鼓', identity:'攻撃・撃破強化', statMult:{ atk:1.10, mag:0.95 }, effect:{ trigger:'onKill', kind:'selfBuffOnKill', buffPayload:{ atkPct:0.08, turns:2 } } },
  ],
  rod: [
    { id:'crozier', name:'聖杖', identity:'回復・防御', statMult:{ mag:1.04 }, statAdd:{ def:1 }, effect:{ trigger:'passive', kind:'regen', power:0.005 } },
    { id:'ritualrod', name:'祭杖', identity:'弱体・魔法', statMult:{ mag:1.08 }, effect:{ trigger:'passive', kind:'debuffPowerAdd', power:0.05 } },
    { id:'orb', name:'宝珠杖', identity:'会心魔法', statMult:{ mag:1.06, crit:1.12 }, effect:{ trigger:'passive', kind:'critDamageBoost', power:0.06 } },
  ],
});

export const WEAPON_ARCHETYPE_COUNT = Object.values(WEAPON_ARCHETYPES).reduce((n, list) => n + list.length, 0);

export function archetypesForWeaponType(weaponType) {
  return WEAPON_ARCHETYPES[weaponType] || [];
}

export function weaponArchetype(weaponType, archetypeId) {
  return archetypesForWeaponType(weaponType).find((a) => a.id === archetypeId) || null;
}

function hash32(text) {
  let h = 2166136261;
  for (const ch of String(text || '')) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function chooseArchetypeForItem(item, ordinal = 0) {
  const list = archetypesForWeaponType(item?.weaponType);
  if (!list.length) return null;
  const seed = (hash32(item.id) + Math.max(0, ordinal)) >>> 0;
  return list[seed % list.length];
}
