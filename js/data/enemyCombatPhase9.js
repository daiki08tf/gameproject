/* Phase 9.2 — Monster Expansion
   Chapter 21–25 enemies receive authored combat identities instead of generic fallbacks.
   Only Combat 3-supported skill kinds are used so these profiles execute through the existing AI runtime. */

export const PHASE9_ENEMY_COMBAT = Object.freeze({
  // Chapter 21 — 灰燼の外縁: burn pressure + heavy guard
  ch21_normal:{role:'frontline',skill:{name:'灰熱斬',kind:'burn',power:.044,turns:3,chance:.42}},
  ch21_fast:{role:'skirmisher',skill:{name:'燐火連牙',kind:'multi',power:.88,hits:3,chance:.42}},
  ch21_tank:{role:'guardian',skill:{name:'焼鉄防陣',kind:'guardAll',defPct:.58,turns:2,chance:.43}},
  ch21_midboss:{role:'guardian',skill:{name:'灰鎧の威圧',kind:'weakenAtk',power:.20,turns:2,chance:.44}},
  ch21_branchboss:{role:'caster',skill:{name:'王墓の残火',kind:'burn',power:.050,turns:3,chance:.45}},

  // Chapter 22 — 玻璃凍原: tempo control + sustain
  ch22_normal:{role:'caster',skill:{name:'零晶波',kind:'slow',power:.26,turns:2,chance:.43}},
  ch22_fast:{role:'support',skill:{name:'鏡雪共鳴',kind:'healAlly',healPct:.18,chance:.43}},
  ch22_tank:{role:'guardian',skill:{name:'凍晶障壁',kind:'guardAll',defPct:.60,turns:2,chance:.44}},
  ch22_midboss:{role:'skirmisher',skill:{name:'氷鏡連閃',kind:'multi',power:.90,hits:3,chance:.45}},
  ch22_branchboss:{role:'caster',skill:{name:'凍結記録',kind:'slow',power:.30,turns:2,chance:.46}},

  // Chapter 23 — 天雷墓標群: speed race + multi-hit burst
  ch23_normal:{role:'skirmisher',skill:{name:'雷葬連撃',kind:'multi',power:.92,hits:3,chance:.44}},
  ch23_fast:{role:'support',skill:{name:'雷路加速',kind:'hasteAll',spdPct:.24,turns:2,chance:.44}},
  ch23_tank:{role:'guardian',skill:{name:'避雷巨壁',kind:'guardAll',defPct:.62,turns:2,chance:.45}},
  ch23_midboss:{role:'skirmisher',skill:{name:'墓標雷槍',kind:'power',power:2.00,chance:.46}},
  ch23_branchboss:{role:'caster',skill:{name:'落雷座標固定',kind:'slow',power:.28,turns:2,chance:.46}},

  // Chapter 24 — 虚花の庭園: poison attrition + recovery
  ch24_normal:{role:'caster',skill:{name:'虚花毒粉',kind:'poison',power:.047,turns:3,chance:.45}},
  ch24_fast:{role:'caster',skill:{name:'夢喰い鱗粉',kind:'mpDrain',mpPct:.22,chance:.45}},
  ch24_tank:{role:'guardian',skill:{name:'根脈庇護',kind:'guardAll',defPct:.64,turns:2,chance:.46}},
  ch24_midboss:{role:'support',skill:{name:'園守の再生花',kind:'healAlly',healPct:.20,chance:.47}},
  ch24_branchboss:{role:'caster',skill:{name:'禁花猛毒',kind:'poison',power:.055,turns:3,chance:.48}},

  // Chapter 25 — 境界王座: resource denial + formation control
  ch25_normal:{role:'frontline',skill:{name:'境界執行斬',kind:'power',power:2.08,chance:.46}},
  ch25_fast:{role:'skirmisher',skill:{name:'位相跳躍連刃',kind:'multi',power:.96,hits:3,chance:.46}},
  ch25_tank:{role:'guardian',skill:{name:'七鍵封鎖陣',kind:'guardAll',defPct:.66,turns:2,chance:.47}},
  ch25_midboss:{role:'caster',skill:{name:'零式観測破棄',kind:'mpDrain',mpPct:.25,chance:.48}},
  ch25_branchboss:{role:'frontline',skill:{name:'無銘王の断界',kind:'power',power:2.18,chance:.49}},
});

export function phase9EnemyCombatProfile(type){ return PHASE9_ENEMY_COMBAT[type]||null; }
