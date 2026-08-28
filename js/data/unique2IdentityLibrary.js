/* ============================================================
   Gear Overhaul Phase 8B — Unique 2.0 Identity Library
   ------------------------------------------------------------
   Authored FIXED-identity recipes for the EXISTING 8 weapon families.
   These recipes reuse effect kinds already present in Unique Equipment /
   Legendary Power data. They do not create drops, currencies, save roots,
   random Option slots, or hidden stat bonuses by themselves.

   Phase 8C may bind a recipe to an existing/new Named Unique item.
   ============================================================ */

const U = (id, family, name, loop, buildLaneIds, effects, tags = []) => Object.freeze({
  id,
  family,
  name,
  loop,
  buildLaneIds:Object.freeze(buildLaneIds),
  effects:Object.freeze(effects.map((effect) => Object.freeze({ ...effect }))),
  tags:Object.freeze(tags),
  consumesOptionSlot:false,
  optionFusionEligible:false,
});

export const UNIQUE2_WEAPON_IDENTITIES = Object.freeze({
  sword:Object.freeze([
    U('u2_sword_retaliation','sword','返刃の誓い','ぼうぎょで攻勢を作り、次の反撃を主役にする。',['sword_guard_counter'],[
      {trigger:'onGuard',kind:'guardCounter',power:.72},
    ],['guard','counter']),
    U('u2_sword_firstblood','sword','先牙の誓い','高HPを維持して序盤から手数で押し、崩される前に主導権を取る。',['sword_crit_balance'],[
      {trigger:'passive',kind:'highHpDoubleAttack',threshold:.60},
      {trigger:'passive',kind:'defPenalty',power:.10},
    ],['high-hp','tempo']),
  ]),

  axe:Object.freeze([
    U('u2_axe_execution','axe','断王の刻','瀕死域へ入れた敵を重撃で処刑する。',['axe_execution'],[
      {trigger:'passive',kind:'executioner',power:.28,hpThreshold:.25},
    ],['execution']),
    U('u2_axe_colossus','axe','巨獣割り','通常戦を少し捨て、Bossへ明確に特化する。',['axe_predator'],[
      {trigger:'passive',kind:'bossDmg',power:.30},
      {trigger:'passive',kind:'normalEnemyDmgPenalty',power:.12},
    ],['boss','tradeoff']),
  ]),

  staff:Object.freeze([
    U('u2_staff_echo','staff','余韻詠唱','じゅもんの反響を狙い、単発詠唱を連鎖へ変える。',['staff_echo'],[
      {trigger:'onSkill',kind:'spellEcho',chance:.14,spellOnly:true},
    ],['spell','echo']),
    U('u2_staff_stararm','staff','星装詠唱','詠唱を次の打撃へ残し、魔法と攻撃を往復する。',['staff_spellpower'],[
      {trigger:'passive',kind:'spellArmsStarStrike',magRatio:.72},
    ],['spell','hybrid']),
  ]),

  bow:Object.freeze([
    U('u2_bow_aftershot','bow','残矢','会心を追加射撃へ変え、精密射撃から手数を生む。',['bow_volley'],[
      {trigger:'onCrit',kind:'critExtraAttack',chance:.22,power:.62,perActionCap:1},
    ],['crit','extra-hit']),
    U('u2_bow_hunter','bow','巨影照準','雑魚への汎用性を少し捨て、Boss狙撃へ寄せる。',['bow_predator'],[
      {trigger:'passive',kind:'bossDmg',power:.26},
      {trigger:'passive',kind:'normalEnemyDmgPenalty',power:.08},
    ],['boss','precision']),
  ]),

  dagger:Object.freeze([
    U('u2_dagger_venom','dagger','毒葬','HitからDoTを作り、毒を戦闘ループの起点にする。',['dagger_venom'],[
      {trigger:'onHit',kind:'hitApplyDot',chance:.20,power:.42,dotTurns:3,maxStacks:4,perActionCap:1},
    ],['dot','on-hit']),
    U('u2_dagger_finish','dagger','終幕線','瀕死域に入った瞬間、暗殺の価値を跳ね上げる。',['dagger_execution'],[
      {trigger:'passive',kind:'executioner',power:.24,hpThreshold:.25},
    ],['execution','assassin']),
  ]),

  knuckle:Object.freeze([
    U('u2_knuckle_chain','knuckle','連星拳','会心から追撃を発生させ、連撃をさらに連撃へ繋ぐ。',['knuckle_combo','knuckle_crit'],[
      {trigger:'onCrit',kind:'critExtraAttack',chance:.18,power:.50,perActionCap:1},
    ],['combo','crit']),
    U('u2_knuckle_variety','knuckle','百式の構え','異なる行動を混ぜるほど出力が上がり、単調な連打から離れる。',['knuckle_brawler'],[
      {trigger:'passive',kind:'actionDiversityBuff',power:.18,turns:3},
    ],['tempo','diversity']),
  ]),

  instrument:Object.freeze([
    U('u2_instrument_crescendo','instrument','戦律クレッシェンド','異なる行動を重ね、演奏テンポそのものを火力へ変える。',['instrument_tempo','instrument_hybrid'],[
      {trigger:'passive',kind:'actionDiversityBuff',power:.22,turns:3},
    ],['tempo','diversity']),
    U('u2_instrument_requiem','instrument','還魂の終止符','撃破をHP/MP回復へ変え、連戦で演奏を止めない。',['instrument_mana'],[
      {trigger:'onKill',kind:'healOnKill',power:.04},
      {trigger:'onKill',kind:'mpOnKill',power:.04},
    ],['sustain','resource']),
  ]),

  rod:Object.freeze([
    U('u2_rod_sanctuary','rod','聖域反照','守った直後を反撃の好機に変え、持久戦でも受け身になりすぎない。',['rod_sustain'],[
      {trigger:'onGuard',kind:'guardNextAtkBuff',power:.58},
    ],['guard','sustain']),
    U('u2_rod_judgment','rod','審判の反響','じゅもんを時折反響させ、支援だけでなく審判術の攻勢を伸ばす。',['rod_judgment'],[
      {trigger:'onSkill',kind:'spellEcho',chance:.10,spellOnly:true},
    ],['spell','echo']),
  ]),
});

export function unique2WeaponIdentities(weaponType) {
  return UNIQUE2_WEAPON_IDENTITIES[weaponType] || Object.freeze([]);
}

export function unique2IdentityById(id) {
  for (const entries of Object.values(UNIQUE2_WEAPON_IDENTITIES)) {
    const found = entries.find((entry) => entry.id === id);
    if (found) return found;
  }
  return null;
}

export const UNIQUE2_WEAPON_FAMILY_COUNT = Object.keys(UNIQUE2_WEAPON_IDENTITIES).length;
export const UNIQUE2_WEAPON_IDENTITY_COUNT = Object.values(UNIQUE2_WEAPON_IDENTITIES)
  .reduce((sum, entries) => sum + entries.length, 0);
