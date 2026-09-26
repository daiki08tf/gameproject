/* ============================================================
   Side Locations II（探索地点・第二波）— Session 7
   ------------------------------------------------------------
   Session 6 の8箇所（Ch1–15帯）に続く、後半世界の探索レイヤ。
   「メインの街道を外れてよかった」と思わせる場所を Ch16–41 帯
   に張り巡らせる。

   第一波に追加された語彙:
     requiresField   … Field Ability が必要な場所（仲間が道を開く）
     foreshadowAfter … unlocksAfter 前から「？？？」の気配カードを
                        見せる予兆（先のStage踏破で姿を見せ始める）
     roamerLair      … Roamer の巣。wave内でそのRoamerが必ず現れ、
                        勧誘・固有ドロップの確率が上がる狩場
     denlordHome     … Denlord の生態系が残る場所（領域ボーナス）
     locTags         … 地点署名Affix（loc_*）の抽選を許可するタグ
     affixBiasCats   … その場所で出やすいAffixカテゴリ
     dropRankBonus   … 位階+1抽選の底上げ（秘密の狩場向け。小さく）
     discoveryText   … 初めて姿を見せた時の発見テキスト
   ============================================================ */

export const SIDE_LOCATION_KIND_2 = Object.freeze({
  lair: '巣穴',
  ruin: '遺構',
  sealed: '封印地',
});

function pool(types, rareTypes, tags, { rareChance = .05, variantChance = .08 } = {}) {
  return {
    id: 'side-loc2',
    types: types.map(([type, weight]) => ({ type, weight })),
    templates: [],
    rareChance,
    rareTypes: rareTypes.map(([type, weight]) => ({ type, weight })),
    regionTags: [...tags],
    variantChance,
  };
}

function st(id, name, recLevel, waves, rewards, extra = {}) {
  return { id, name, recLevel, waves, rewards, dropTable: [], ...extra };
}

/* ------------------------------------------------------------
   1. 水没坑道（DUNGEON・遊泳が必要）
   崩れた水路の奥、水面の下に眠る坑道。水棲の仲間が潜って
   入口を確かめると、まだ誰も掘っていない鉱脈が残っている。
   潮径の主の生態に近い水の匂い（Denlord領域）。NULL CHANTは
   この水底で「歌の続き」を拾ったらしい——巣穴ではないが、
   居座ることが多い（補助的な棲息地としてroamer出現を持つ）。
   ------------------------------------------------------------ */
const FLOODGATE = {
  id: 'side_floodgate', num: 16, gaiden: true, sideLocation: true, poiKind: 'dungeon',
  unlocksAfter: '16-8', foreshadowAfter: '15-8',
  requiresField: 'dive',
  fieldHint: '水面の下に道が続いている。水棲の仲間がいれば潜れる。',
  discoveryText: '仲間が水面の下へ潜り、錆びた坑道の入口を見つけた。',
  denlordHome: 'tp_denlord',
  name: '探索 水没坑道', displayName: '水没坑道',
  desc: '崩れた水路の奥、水面の下に沈んだ採掘坑。水の匂いが濃い。',
  locTags: ['aquatic'],
  stages: [
    st('fg-1', '水没坑道・冠水路', 275,
      [{ type: 'ch16_normal', count: 5, interval: 1.0 }, { type: 'tp_shambler', count: 4, interval: .9 }],
      { gold: 420, exp: 340 },
      { dropTable: [{ itemId: 'ch16_shield', weight: 1 }, { itemId: 'ch16_head', weight: 1 }] }),
    st('fg-2', '水没坑道・埋没鉱脈', 305,
      [{ type: 'tp_bulwark', count: 3, interval: 1.3 }, { type: 'ch16_fast', count: 4, interval: .8 }, { type: 'roamer:null_chant', count: 1, interval: 0 }],
      { gold: 480, exp: 390 },
      { roamerLair: 'null_chant', firstClear: { itemId: 'ch16_named_accessory' }, dropTable: [{ itemId: 'ch16_accessory', weight: 1 }, { itemId: 'rune_effect_lifesteal', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   2. 断崖の足場（POI・飛翔が必要）
   街道の切れ目、絶壁の中腹にだけ見える白い足場。
   ------------------------------------------------------------ */
const SKYCLIFF = {
  id: 'side_skycliff', num: 17, gaiden: true, sideLocation: true, poiKind: 'poi',
  unlocksAfter: '17-8', foreshadowAfter: '16-8',
  requiresField: 'soar',
  fieldHint: '絶壁の中腹に足場がある。翼ある仲間がいれば渡れる。',
  discoveryText: '翼ある仲間が崖の上から、隠れた足場を見つけた。',
  name: '探索 断崖の足場', displayName: '断崖の足場',
  desc: '切り立った崖の中腹にだけ続く、白亜の細い足場。',
  locTags: ['storm'],
  stages: [
    st('sc-1', '断崖の足場', 355,
      [{ type: 'ch17_fast', count: 6, interval: .7 }, { type: 'ch17_normal', count: 4, interval: 1.0 }, { type: 'ch17_rare', count: 1, interval: 0 }],
      { gold: 520, exp: 420 },
      { firstClear: { itemId: 'ch17_weapon_epic' }, dropTable: [{ itemId: 'ch17_accessory', weight: 1 }, { itemId: 'ch17_head', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   3. 獣の根城（DUNGEON・獣路の嗅覚が必要）
   匂いだけが残る獣道の奥。宝喰みの大口が溜め込んだ場所。
   ------------------------------------------------------------ */
const ROOTWARREN = {
  id: 'side_rootwarren', num: 18, gaiden: true, sideLocation: true, poiKind: 'lair',
  unlocksAfter: '18-8', foreshadowAfter: '17-8',
  requiresField: 'trail',
  fieldHint: '獣の仲間が何かの匂いを追っている。この先に巣がある。',
  discoveryText: '仲間が地面に鼻を近づけ、獣道の先を指し示した。',
  roamerLairHint: '宝喰みの大口の溜まり場',
  denlordHome: 'bt_denlord',
  name: '巣穴 獣の根城', displayName: '獣の根城',
  desc: '大きな獣が何度も往復した跡。奥から金属の匂いがする。',
  locTags: ['beast'],
  stages: [
    st('rw-1', '獣の根城・喰い散らかされた道', 430,
      [{ type: 'ch18_normal', count: 5, interval: 1.0 }, { type: 'ch18_fast', count: 4, interval: .8 }],
      { gold: 560, exp: 450 },
      { dropTable: [{ itemId: 'ch18_body', weight: 1 }, { itemId: 'ch18_head', weight: 1 }] }),
    st('rw-2', '獣の根城・溜め込み場', 470,
      [{ type: 'ch18_tank', count: 2, interval: 1.4 }, { type: 'roamer:gilt_maw', count: 1, interval: 0 }, { type: 'ch18_fast', count: 3, interval: .8 }],
      { gold: 640, exp: 520 },
      { roamerLair: 'gilt_maw', firstClear: { itemId: 'ch18_named_accessory' }, dropTable: [{ itemId: 'ch18_accessory', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   4. 反響の霊廟（HIDDEN・霊視が必要）
   月蝕の境界の下、音だけが残る廟。精霊でなければ入口の
   残響を読めない。
   ------------------------------------------------------------ */
const ECHOCRYPT = {
  id: 'side_echocrypt', num: 19, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: '19-8', foreshadowAfter: '18-8',
  requiresField: 'seer',
  fieldHint: '奇妙な気配がする。精霊の仲間がいれば読めるかもしれない。',
  discoveryText: '仲間が虚空を見つめ、見えない廟の入口を教えてくれた。',
  name: '隠し 反響の霊廟', displayName: '反響の霊廟',
  desc: '音だけが残る廟。壁に触れると、誰かの祈りが反響する。',
  locTags: ['hollow', 'grave'],
  stages: [
    st('ec-1', '反響の霊廟', 540,
      [{ type: 'ch19_normal', count: 5, interval: 1.0 }, { type: 'ch19_caster', count: 3, interval: 1.2 }, { type: 'ch19_rare', count: 1, interval: 0 }],
      { gold: 620, exp: 500 },
      { firstClear: { itemId: 'ch19_weapon_epic' }, dropTable: [{ itemId: 'ch19_accessory', weight: 1 }, { itemId: 'rune_effect_haste', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   5. 膠着地溝（HIDDEN・隙間通過が必要）
   灰燼の外縁の下で膠着した地割れ。粘性のある仲間だけが
   潜り抜けられる窄みの先。
   ------------------------------------------------------------ */
const GALLOWSEEP = {
  id: 'side_gallowseep', num: 21, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: '21-8', foreshadowAfter: '20-8',
  requiresField: 'fissure',
  fieldHint: '地割れの奥から冷気が漏れている。粘性の仲間がいれば潜れる。',
  discoveryText: '仲間が岩の隙間へ滑り込み、奥の広がりを教えてくれた。',
  name: '隠し 膠着地溝', displayName: '膠着地溝',
  desc: '膠着した地割れの奥。ねばつく水脈と、吞まれた骨。',
  locTags: ['hollow', 'aquatic'],
  stages: [
    st('gs-1', '膠着地溝', 720,
      [{ type: 'ch21_normal', count: 5, interval: 1.0 }, { type: 'ch21_tank', count: 2, interval: 1.5 }, { type: 'ch21_rare', count: 1, interval: 0 }],
      { gold: 720, exp: 580 },
      { firstClear: { itemId: 'ch21_named_accessory' }, dropTable: [{ itemId: 'ch21_accessory', weight: 1 }, { itemId: 'ch21_body', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   6. 炉心回廊（DUNGEON・機構起動が必要 / 秘密Boss）
   玻璃凍原の下に眠る古代炉。機械の仲間が機構を再起動すると、
   守っていた管理者が目覚める。3階層＋炉の番人。
   ------------------------------------------------------------ */
const FORGEHEART = {
  id: 'side_forgeheart', num: 22, gaiden: true, sideLocation: true, poiKind: 'ruin',
  unlocksAfter: '22-8', foreshadowAfter: '21-8',
  requiresField: 'mechanism',
  fieldHint: '古い機構が沈黙している。機械の仲間がいれば起こせるかもしれない。',
  discoveryText: '仲間が機構に触れると、長い廊下の灯りが順に灯った。',
  name: '遺構 炉心回廊', displayName: '炉心回廊',
  desc: '眠ったままの古代炉。機構の奥に、まだ生きている管理系がある。',
  locTags: ['machine', 'ruin'],
  stages: [
    st('fh-1', '炉心回廊・搬入層', 980,
      [{ type: 'ch22_normal', count: 5, interval: 1.0 }, { type: 'ch22_fast', count: 4, interval: .8 }],
      { gold: 760, exp: 610 },
      { dropTable: [{ itemId: 'ch22_head', weight: 1 }, { itemId: 'ch22_shield', weight: 1 }] }),
    st('fh-2', '炉心回廊・熱交換層', 1060,
      [{ type: 'ch22_tank', count: 3, interval: 1.4 }, { type: 'ch22_caster', count: 3, interval: 1.1 }],
      { gold: 820, exp: 670 },
      { dropTable: [{ itemId: 'ch22_body', weight: 1 }, { itemId: 'ch22_accessory', weight: 1 }] }),
    st('fh-3', '炉心回廊・番人の間', 1140,
      [{ type: 'ch22_normal', count: 3, interval: 1.0 }, { type: 'fh_overseer', count: 1, interval: 0 }],
      { gold: 980, exp: 800 },
      { boss: true, secretBoss: true, dropRankBonus: .10,
        firstClear: { itemId: 'ch22_named_accessory' },
        dropTable: [{ itemId: 'ch22_named_accessory', weight: 1 }, { itemId: 'ch22_accessory', weight: 1 }, { itemId: 'uq_hunt_forgeheart_relay', weight: .4 }] }),
  ],
};

/* ------------------------------------------------------------
   7. 骨の採取場（POI・誰でも入れる）
   天雷墓標群の麓、大きな獣の骨が風化して残る採取場。
   獣径の主が子らを連れて通った跡がある。
   ------------------------------------------------------------ */
const BONEPIT = {
  id: 'side_bonepit', num: 23, gaiden: true, sideLocation: true, poiKind: 'poi',
  unlocksAfter: '23-8',
  denlordHome: 'bt_denlord',
  name: '探索 骨の採取場', displayName: '骨の採取場',
  desc: '風化した巨獣の骨が散乱する窪地。獣の匂いがまだ残る。',
  locTags: ['beast', 'grave'],
  stages: [
    st('bp-1', '骨の採取場', 1300,
      [{ type: 'ch23_normal', count: 5, interval: 1.0 }, { type: 'ch23_fast', count: 4, interval: .8 }, { type: 'ch23_rare', count: 1, interval: 0 }],
      { gold: 840, exp: 680 },
      { firstClear: { itemId: 'ch23_named_accessory' }, dropTable: [{ itemId: 'ch23_accessory', weight: 1 }, { itemId: 'ch23_shield', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   8. 嵐鳥の営巣（DUNGEON・飛翔が必要）
   虚花の庭園の上空、嵐を渡る巨鳥の営巣地。鏡歩きがここで
   羽の合間を歩き回っている——巣ではないが縄張り。
   ------------------------------------------------------------ */
const STORMROOST = {
  id: 'side_stormroost', num: 24, gaiden: true, sideLocation: true, poiKind: 'lair',
  unlocksAfter: '24-8', foreshadowAfter: '23-8',
  requiresField: 'soar',
  fieldHint: '上空に鳥影が群れている。翼ある仲間がいれば昇れる。',
  discoveryText: '翼ある仲間が風に乗り、雲の切れ間の営巣地を見つけた。',
  roamerLairHint: '鏡歩きの通り道',
  name: '巣穴 嵐鳥の営巣', displayName: '嵐鳥の営巣',
  desc: '嵐を好む巨鳥の営巣地。足元から雷鳥の羽が舞い上がる。',
  locTags: ['storm'],
  stages: [
    st('sr-1', '嵐鳥の営巣・下層', 1650,
      [{ type: 'ch24_fast', count: 6, interval: .7 }, { type: 'ch24_normal', count: 4, interval: 1.0 }],
      { gold: 900, exp: 730 },
      { dropTable: [{ itemId: 'ch24_accessory', weight: 1 }, { itemId: 'ch24_head', weight: 1 }] }),
    st('sr-2', '嵐鳥の営巣・鏡歩きの径', 1780,
      [{ type: 'ch24_fast', count: 5, interval: .7 }, { type: 'roamer:glass_step', count: 1, interval: 0 }, { type: 'ch24_rare', count: 1, interval: 0 }],
      { gold: 980, exp: 800 },
      { roamerLair: 'glass_step', firstClear: { itemId: 'ch24_weapon_epic' }, dropTable: [{ itemId: 'rune_effect_haste', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   9. 墓標の回廊（HIDDEN・死読が必要）
   境界王座の麓、名の削れた墓標が並ぶ回廊。不死の仲間が
   墓に残った記憶を読めば、白き獄卒がまだここを巡回して
   いることが分かる。
   ------------------------------------------------------------ */
const GRAVESHIFT = {
  id: 'side_graveshift', num: 25, gaiden: true, sideLocation: true, poiKind: 'lair',
  unlocksAfter: '25-8', foreshadowAfter: '24-8',
  requiresField: 'grave',
  fieldHint: '墓標に何かが刻まれている。不死の仲間がいれば読めるかもしれない。',
  discoveryText: '仲間が墓標に手を置くと、削れた名の下に巡回路が浮かんだ。',
  roamerLairHint: '白き獄卒の巡回路',
  denlordHome: 'af_denlord',
  name: '巣穴 墓標の回廊', displayName: '墓標の回廊',
  desc: '名の削れた墓標が続く回廊。白い影が静かに巡回している。',
  locTags: ['grave', 'undead'],
  stages: [
    st('gv-1', '墓標の回廊・参列', 2050,
      [{ type: 'ch25_normal', count: 5, interval: 1.0 }, { type: 'af_revenant', count: 3, interval: 1.0 }],
      { gold: 980, exp: 800 },
      { dropTable: [{ itemId: 'ch25_shield', weight: 1 }, { itemId: 'ch25_body', weight: 1 }] }),
    st('gv-2', '墓標の回廊・巡礼終点', 2300,
      [{ type: 'af_moth', count: 4, interval: .9 }, { type: 'roamer:pale_jailer', count: 1, interval: 0 }],
      { gold: 1080, exp: 890 },
      { roamerLair: 'pale_jailer', firstClear: { itemId: 'ch25_named_accessory' }, dropTable: [{ itemId: 'ch25_accessory', weight: 1 }, { itemId: 'rune_effect_counter', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   10. 深層井戸（HIDDEN・遊泳が必要 / 高品質ドロップ）
   逆観測門の底、垂直に降りる黒い水脈。潜った者だけが
   井戸の底に「拾いものの群れ」が溜まっているのを知っている。
   ------------------------------------------------------------ */
const DEPTHWELL = {
  id: 'side_depthwell', num: 29, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: '29-8', foreshadowAfter: '28-8',
  requiresField: 'dive',
  fieldHint: '井戸の底に冷たい水脈が光っている。水棲の仲間がいれば降りられる。',
  discoveryText: '仲間が黒い水脈へ潜り、底に光るものが溜まっていると報せた。',
  name: '隠し 深層井戸', displayName: '深層井戸',
  desc: '垂直に降りる黒い水脈。底には流れ着いた拾いものが眠る。',
  locTags: ['aquatic', 'deep'],
  stages: [
    st('dw-1', '深層井戸・水面下の棚', 2700,
      [{ type: 'ch29_normal', count: 5, interval: 1.0 }, { type: 'ch29_fast', count: 4, interval: .8 }],
      { gold: 1100, exp: 900 },
      { dropRankBonus: .08, dropTable: [{ itemId: 'ch29_accessory', weight: 1 }, { itemId: 'ch29_shield', weight: 1 }] }),
    st('dw-2', '深層井戸・底の拾いもの', 3100,
      [{ type: 'ch29_tank', count: 3, interval: 1.4 }, { type: 'ch29_rare', count: 1, interval: 0 }],
      { gold: 1250, exp: 1030 },
      { dropRankBonus: .12, firstClear: { itemId: 'ch29_weapon_epic' }, dropTable: [{ itemId: 'ch29_body', weight: 1 }, { itemId: 'rune_effect_awaken', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   11. 頂の食卓（DUNGEON・獣路の嗅覚が必要）
   機界監査層の外縁、巨大な捕食者の食事場。錆びた遍歴騎士が
   この頂で何かを探し続けている——巣というより舞台。
   ------------------------------------------------------------ */
const APEXMESA = {
  id: 'side_apexmesa', num: 28, gaiden: true, sideLocation: true, poiKind: 'lair',
  unlocksAfter: '28-8', foreshadowAfter: '27-8',
  requiresField: 'trail',
  fieldHint: '巨大な足跡が頂へ続いている。獣の仲間がいれば追える。',
  discoveryText: '仲間が巨大な足跡に鼻を寄せ、頂上の食事場を嗅ぎつけた。',
  roamerLairHint: '錆びた遍歴騎士の探し場',
  name: '巣穴 頂の食卓', displayName: '頂の食卓',
  desc: '巨大な捕食者の食事場。骨と錆びた剣が散乱する頂。',
  locTags: ['beast'],
  stages: [
    st('am-1', '頂の食卓・骨の麓', 3400,
      [{ type: 'ch28_normal', count: 5, interval: 1.0 }, { type: 'ch28_tank', count: 3, interval: 1.4 }],
      { gold: 1150, exp: 950 },
      { dropTable: [{ itemId: 'ch28_shield', weight: 1 }, { itemId: 'ch28_head', weight: 1 }] }),
    st('am-2', '頂の食卓・食痕の丘', 3700,
      [{ type: 'ch28_fast', count: 5, interval: .8 }, { type: 'ch28_rare', count: 1, interval: 0 }],
      { gold: 1280, exp: 1060 },
      { dropTable: [{ itemId: 'ch28_accessory', weight: 1 }, { itemId: 'ch28_body', weight: 1 }] }),
    st('am-3', '頂の食卓・騎士の探し場', 4000,
      [{ type: 'ch28_tank', count: 2, interval: 1.4 }, { type: 'roamer:rust_errant', count: 1, interval: 0 }, { type: 'ch28_normal', count: 3, interval: 1.0 }],
      { gold: 1400, exp: 1180 },
      { roamerLair: 'rust_errant', dropRankBonus: .06, firstClear: { itemId: 'ch28_named_accessory' }, dropTable: [{ itemId: 'rune_effect_counter', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   12. 未記録の座標（HIDDEN・霊視が必要 / 最深の秘密Boss）
   分流圃の奥、誰の記録にも載っていない座標へ続く畦。
   精霊の仲間だけが「記録にない場所」の存在を読める。
   最奥には、記録されないことを守る者がいる。
   ------------------------------------------------------------ */
const UNRECORDED = {
  id: 'side_unrecorded', num: 41, gaiden: true, sideLocation: true, poiKind: 'sealed',
  unlocksAfter: '41-8', foreshadowAfter: '40-8',
  requiresField: 'seer',
  fieldHint: 'どの地図にも載っていない場所の気配。精霊の仲間がいれば読める。',
  discoveryText: '仲間が「記録にない場所」の存在を読み、誰も書かなかった畦を示した。',
  name: '封印地 未記録の座標', displayName: '未記録の座標',
  desc: '地図に存在しない畦。記録に載らないものだけが、ここに辿り着く。',
  locTags: ['unrecorded', 'hidden', 'deep'],
  stages: [
    st('ur-1', '未記録の座標・畦', 13800,
      [{ type: 'ch41_normal', count: 5, interval: 1.0 }, { type: 'ch41_fast', count: 4, interval: .8 }],
      { gold: 2400, exp: 2000 },
      { dropRankBonus: .10, dropTable: [{ itemId: 'ch41_accessory', weight: 1 }, { itemId: 'ch41_shield', weight: 1 }] }),
    st('ur-2', '未記録の座標・書かれなかった丘', 14200,
      [{ type: 'ch41_tank', count: 3, interval: 1.4 }, { type: 'ch41_caster', count: 3, interval: 1.1 }],
      { gold: 2650, exp: 2200 },
      { dropRankBonus: .12, dropTable: [{ itemId: 'ch41_body', weight: 1 }, { itemId: 'ch41_head', weight: 1 }] }),
    st('ur-3', '未記録の座標・記録の番人', 14800,
      [{ type: 'ch41_normal', count: 3, interval: 1.0 }, { type: 'ur_sentinel', count: 1, interval: 0 }],
      { gold: 3200, exp: 2700 },
      { boss: true, secretBoss: true, dropRankBonus: .18,
        firstClear: { itemId: 'ch41_named2_body' },
        dropTable: [{ itemId: 'ch41_named_weapon', weight: 1 }, { itemId: 'rune_effect_awaken', weight: 1 }, { itemId: 'uq_hunt_unwritten_leaf', weight: .4 }] }),
  ],
};

export const SIDE_LOCATION_CHAPTERS_2 = Object.freeze([
  FLOODGATE, SKYCLIFF, ROOTWARREN, ECHOCRYPT, GALLOWSEEP, FORGEHEART,
  BONEPIT, STORMROOST, GRAVESHIFT, DEPTHWELL, APEXMESA, UNRECORDED,
]);

// 各Stageへ棲み分け・地点署名Affixタグ・傾向・位階補正を付与。
const SIDE_POOLS_2 = Object.freeze({
  side_floodgate: [
    pool([['ch16_normal', 1], ['tp_shambler', .8], ['tp_skimmer', .6]], [['ch16_rare', .8]], ['water', 'dark']),
    pool([['tp_bulwark', 1], ['ch16_fast', .8], ['tp_shambler', .6]], [['ch16_rare', 1]], ['water', 'dark']),
  ],
  side_skycliff: [
    pool([['ch17_fast', 1], ['ch17_normal', .8], ['ch17_attacker', .6]], [['ch17_rare', 1]], ['lightning', 'wind']),
  ],
  side_rootwarren: [
    pool([['ch18_normal', 1], ['ch18_fast', .9], ['ch18_attacker', .6]], [['ch18_rare', .8]], ['earth', 'poison']),
    pool([['ch18_tank', 1], ['ch18_normal', .8], ['ch18_fast', .7]], [['ch18_rare', 1]], ['earth', 'poison']),
  ],
  side_echocrypt: [
    pool([['ch19_normal', 1], ['ch19_caster', .8], ['ch19_fast', .6]], [['ch19_rare', 1]], ['dark', 'light']),
  ],
  side_gallowseep: [
    pool([['ch21_normal', 1], ['ch21_tank', .7], ['ch21_attacker', .6]], [['ch21_rare', 1]], ['dark', 'earth']),
  ],
  side_forgeheart: [
    pool([['ch22_normal', 1], ['ch22_fast', .8], ['ch22_caster', .6]], [['ch22_rare', .7]], ['lightning', 'light']),
    pool([['ch22_tank', 1], ['ch22_caster', .8], ['ch22_support', .6]], [['ch22_rare', .8]], ['lightning', 'light']),
    pool([['ch22_normal', 1], ['ch22_tank', .8], ['ch22_support', .5]], [['ch22_rare', 1]], ['lightning', 'light']),
  ],
  side_bonepit: [
    pool([['ch23_normal', 1], ['ch23_fast', .8], ['ch23_attacker', .6]], [['ch23_rare', 1]], ['lightning', 'earth']),
  ],
  side_stormroost: [
    pool([['ch24_fast', 1], ['ch24_normal', .8], ['ch24_attacker', .6]], [['ch24_rare', .8]], ['wind', 'lightning']),
    pool([['ch24_fast', 1], ['ch24_attacker', .8], ['ch24_normal', .6]], [['ch24_rare', 1]], ['wind', 'lightning']),
  ],
  side_graveshift: [
    pool([['ch25_normal', 1], ['af_revenant', .8], ['af_moth', .6]], [['af_rare', .8]], ['dark', 'earth']),
    pool([['af_revenant', 1], ['af_moth', .9], ['ch25_tank', .6]], [['af_rare', 1]], ['dark', 'earth']),
  ],
  side_depthwell: [
    pool([['ch29_normal', 1], ['ch29_fast', .8], ['ch29_caster', .6]], [['ch29_rare', .8]], ['water', 'dark']),
    pool([['ch29_tank', 1], ['ch29_normal', .8], ['ch29_attacker', .6]], [['ch29_rare', 1]], ['water', 'dark']),
  ],
  side_apexmesa: [
    pool([['ch28_normal', 1], ['ch28_tank', .8], ['ch28_attacker', .6]], [['ch28_rare', .8]], ['earth', 'lightning']),
    pool([['ch28_fast', 1], ['ch28_normal', .8], ['ch28_attacker', .7]], [['ch28_rare', .9]], ['earth', 'lightning']),
    pool([['ch28_tank', 1], ['ch28_normal', .8], ['ch28_fast', .6]], [['ch28_rare', 1]], ['earth', 'lightning']),
  ],
  side_unrecorded: [
    pool([['ch41_normal', 1], ['ch41_fast', .9], ['ch41_caster', .6]], [['ch41_rare', .8]], ['dark', 'light']),
    pool([['ch41_tank', 1], ['ch41_caster', .8], ['ch41_support', .6]], [['ch41_rare', .9]], ['dark', 'light']),
    pool([['ch41_normal', 1], ['ch41_tank', .8], ['ch41_caster', .6]], [['ch41_rare', 1]], ['dark', 'light']),
  ],
});

// 位階・Affix傾向はchapter単位でstageへ展開する。
const SIDE2_STAGE_DECOR = Object.freeze({
  side_floodgate: { affixBiasCats: ['SUSTAIN', 'RESOURCE'], dropAffixBonus: .10 },
  side_skycliff: { affixBiasCats: ['SPEED', 'CRIT'], dropAffixBonus: .10 },
  side_rootwarren: { affixBiasCats: ['OFFENSE', 'BOSS'], dropAffixBonus: .11 },
  side_echocrypt: { affixBiasCats: ['STATUS', 'MAGIC'], dropAffixBonus: .11 },
  side_gallowseep: { affixBiasCats: ['STATUS', 'DEFENSE'], dropAffixBonus: .11 },
  side_forgeheart: { affixBiasCats: ['MAGIC', 'RESOURCE'], dropAffixBonus: .12 },
  side_bonepit: { affixBiasCats: ['OFFENSE', 'DEFENSE'], dropAffixBonus: .10 },
  side_stormroost: { affixBiasCats: ['SPEED', 'CRIT'], dropAffixBonus: .12 },
  side_graveshift: { affixBiasCats: ['DEFENSE', 'SUSTAIN'], dropAffixBonus: .12 },
  side_depthwell: { affixBiasCats: ['SUSTAIN', 'MAGIC'], dropAffixBonus: .12 },
  side_apexmesa: { affixBiasCats: ['OFFENSE', 'BOSS'], dropAffixBonus: .13 },
  side_unrecorded: { affixBiasCats: ['STATUS', 'MAGIC', 'BUILD'], dropAffixBonus: .15 },
});

for (const chapter of SIDE_LOCATION_CHAPTERS_2) {
  const pools = SIDE_POOLS_2[chapter.id] || [];
  const decor = SIDE2_STAGE_DECOR[chapter.id] || {};
  chapter.stages.forEach((stage, i) => {
    const p = pools[i];
    if (p) {
      stage.encounterPool = p;
      stage.dropRegionTags = [...p.regionTags];
    }
    stage.dropAffixBonus = decor.dropAffixBonus || 0;
    stage.locTags = [...(chapter.locTags || []), ...(stage.locTags || [])];
    stage.affixBiasCats = decor.affixBiasCats || null;
  });
}
