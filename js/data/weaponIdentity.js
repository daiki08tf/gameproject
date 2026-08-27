/* ============================================================
   Gear Overhaul Phase 6A — Weapon Identity
   ------------------------------------------------------------
   Deepens the existing 8 mastery families / 24 Equipment 3.0 archetypes.
   This is NOT a new progression system: these profiles only specialize the
   already-existing Combat 2.0 Weapon Techniques.
   ============================================================ */

export const WEAPON_FAMILY_IDENTITIES = Object.freeze({
  sword: Object.freeze({ name:'剣', role:'安定・崩し・反撃', loop:'守りを崩しながら安定して攻め、会心や反撃へ繋ぐ', optionBias:['OFFENSE','CRIT','DEFENSE'] }),
  axe: Object.freeze({ name:'斧', role:'破甲・処刑・Boss', loop:'装甲を割って大きな一撃を通し、瀕死の敵を処刑する', optionBias:['OFFENSE','DEFENSE','BOSS'] }),
  staff: Object.freeze({ name:'杖', role:'魔法・属性・MP循環', loop:'MP効率と属性火力を組み替えながら高威力魔法を回す', optionBias:['MAGIC','RESOURCE','BUILD'] }),
  bow: Object.freeze({ name:'弓', role:'貫通・手数・精密射撃', loop:'貫通と会心で弱点を射抜き、射撃テンポを維持する', optionBias:['OFFENSE','CRIT','BOSS'] }),
  dagger: Object.freeze({ name:'短剣', role:'手数・会心・毒・処刑', loop:'多段攻撃と状態異常で削り、瀕死域を一気に刈り取る', optionBias:['SPEED','CRIT','TRIGGER'] }),
  knuckle: Object.freeze({ name:'拳具', role:'連撃・圧力・継戦', loop:'攻撃回数を積み上げ、止まらない連撃で押し切る', optionBias:['OFFENSE','CRIT','TRIGGER'] }),
  instrument: Object.freeze({ name:'楽器', role:'戦律・自己強化・テンポ', loop:'攻撃と演奏を同時に行い、強化を切らさず戦況を加速する', optionBias:['BUILD','RESOURCE','SPEED'] }),
  rod: Object.freeze({ name:'錫杖', role:'聖光・弱体・持久戦', loop:'光属性と弱体を重ね、回復・再生で長期戦を制する', optionBias:['SUSTAIN','RESOURCE','MAGIC'] }),
});

// Modifier vocabulary is deliberately limited to fields already understood by
// Combat 2.0 techniques. `hitDelta` keeps total base damage roughly stable by
// splitting the original power over more hits; its real value is extra proc
// opportunities, which is exactly the identity of rapid-hit archetypes.
export const WEAPON_ARCHETYPE_TECHNIQUE_PROFILES = Object.freeze({
  longsword: Object.freeze({ family:'sword', name:'片手剣', specialty:'均衡の剣筋', powerMult:1.03, mpCostMult:0.90, weakenPctAdd:0.03 }),
  greatsword: Object.freeze({ family:'sword', name:'大剣', specialty:'溜めた重撃', powerMult:1.14, mpCostMult:1.12 }),
  katana: Object.freeze({ family:'sword', name:'刀', specialty:'会心の居合', powerMult:1.04, critBonusAdd:12 }),

  battleaxe: Object.freeze({ family:'axe', name:'戦斧', specialty:'徹底破甲', armorPenAdd:0.08, weakenPctAdd:0.04 }),
  greataxe: Object.freeze({ family:'axe', name:'大斧', specialty:'処刑の一撃', powerMult:1.11, execution:{ hpThreshold:0.35, power:1.18 } }),
  tomahawk: Object.freeze({ family:'axe', name:'軽斧', specialty:'軽快な連斧', powerMult:0.96, mpCostMult:0.84, critBonusAdd:7 }),

  wand: Object.freeze({ family:'staff', name:'魔杖', specialty:'純魔力増幅', powerMult:1.12, mpCostMult:1.05 }),
  battlestaff: Object.freeze({ family:'staff', name:'戦杖', specialty:'物魔循環', powerMult:1.05, mpCostMult:0.92, selfBuffAdd:{ atkPct:0.08, magPct:0.05, turns:2 } }),
  grimoire: Object.freeze({ family:'staff', name:'魔導書', specialty:'省魔詠唱', mpCostMult:0.72 }),

  longbow: Object.freeze({ family:'bow', name:'長弓', specialty:'重い精密射撃', powerMult:1.09, armorPenAdd:0.04, mpCostMult:1.06 }),
  shortbow: Object.freeze({ family:'bow', name:'短弓', specialty:'連射', hitDelta:1, mpCostMult:0.92 }),
  crossbow: Object.freeze({ family:'bow', name:'弩', specialty:'装甲貫通', armorPenAdd:0.11, critBonusAdd:5, powerMult:1.03 }),

  knife: Object.freeze({ family:'dagger', name:'短刀', specialty:'素早い急所狙い', mpCostMult:0.82, critBonusAdd:6 }),
  twinblade: Object.freeze({ family:'dagger', name:'双短剣', specialty:'追加連撃', hitDelta:1, powerMult:1.02 }),
  assassin: Object.freeze({ family:'dagger', name:'暗殺刃', specialty:'死線の処刑', critBonusAdd:10, execution:{ hpThreshold:0.30, power:1.22 } }),

  gauntlet: Object.freeze({ family:'knuckle', name:'拳甲', specialty:'攻防一体', powerMult:1.04, selfBuffAdd:{ defPct:0.08, turns:2 } }),
  claw: Object.freeze({ family:'knuckle', name:'爪', specialty:'裂傷連撃', hitDelta:1, critBonusAdd:5 }),
  cestus: Object.freeze({ family:'knuckle', name:'セスタス', specialty:'止まらぬ継戦', mpCostMult:0.90, selfBuffAdd:{ regenAdd:0.012, turns:2 } }),

  harp: Object.freeze({ family:'instrument', name:'竪琴', specialty:'支援旋律', selfBuffAdd:{ magPct:0.08, defPct:0.06, turns:2 }, mpCostMult:0.94 }),
  flute: Object.freeze({ family:'instrument', name:'笛', specialty:'高速演奏', mpCostMult:0.76, selfBuffAdd:{ spdPct:0.08, turns:2 } }),
  wardrum: Object.freeze({ family:'instrument', name:'戦鼓', specialty:'攻勢の鼓動', powerMult:1.07, selfBuffAdd:{ atkPct:0.10, spdPct:0.05, turns:2 } }),

  crozier: Object.freeze({ family:'rod', name:'聖杖', specialty:'再生の聖光', mpCostMult:0.92, selfBuffAdd:{ regenAdd:0.018, defPct:0.05, turns:2 } }),
  ritualrod: Object.freeze({ family:'rod', name:'祭杖', specialty:'祓いと弱体', weakenPctAdd:0.06, powerMult:1.04 }),
  orb: Object.freeze({ family:'rod', name:'宝珠杖', specialty:'会心魔法', critBonusAdd:12, powerMult:1.05 }),
});

export function weaponFamilyIdentity(weaponType) {
  return WEAPON_FAMILY_IDENTITIES[weaponType] || null;
}

export function weaponArchetypeTechniqueProfile(archetypeId) {
  return WEAPON_ARCHETYPE_TECHNIQUE_PROFILES[archetypeId] || null;
}

export const WEAPON_IDENTITY_FAMILY_COUNT = Object.keys(WEAPON_FAMILY_IDENTITIES).length;
export const WEAPON_IDENTITY_ARCHETYPE_COUNT = Object.keys(WEAPON_ARCHETYPE_TECHNIQUE_PROFILES).length;
