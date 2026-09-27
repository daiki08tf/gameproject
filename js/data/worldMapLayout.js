/* ============================================================
   World Map layout — 空間レイヤの純データ
   ------------------------------------------------------------
   「Adventureが縦のリストに見えて世界に感じられない」という実機
   プレイテストの指摘への対応。座標は viewBox 1000x1400 の縦長地図。
   南（下）の宿場町から街道が北上し、境界（The Veil）を越え、
   観測域を経て、帳簿に記されなかった未踏帳外域は南東の
   「地図の外」の隅へ別れていく。

   ここは表示レイヤだけ。章・Stage・発見・気象の判定権威は
   CHAPTERS / stageProgress / world2 / worldClimate のまま。
   ============================================================ */

export const WORLD_MAP_VIEW = Object.freeze({ width: 1000, height: 1400 });

// kind: town / chapter / side（探索地点） / gaiden / merchant
// terrain: ノードの描画種別（plain/forest/mountain/ruin/water/machine/veil/cave…装飾トーン）
export const WORLD_MAP_NODES = Object.freeze([
  { id: 'settlement', kind: 'town', label: '宿場町', x: 500, y: 1330, terrain: 'town' },

  /* 第一部 — 開拓辺境 (1-4) */
  { id: 'ch1', label: 'はじまりの平原', x: 430, y: 1245, terrain: 'plain' },
  { id: 'ch2', label: '深緑の森', x: 275, y: 1200, terrain: 'forest' },
  { id: 'ch3', label: '忘れられた遺跡', x: 420, y: 1140, terrain: 'ruin' },
  { id: 'ch4', label: '凍てつく霊峰', x: 620, y: 1175, terrain: 'mountain' },

  /* 四境連峰 (5-8) */
  { id: 'ch5', label: '灼熱の火山', x: 180, y: 1030, terrain: 'volcano' },
  { id: 'ch6', label: '底なし沼地', x: 330, y: 980, terrain: 'water' },
  { id: 'ch7', label: '天空の遺跡都市', x: 480, y: 1010, terrain: 'ruin' },
  { id: 'ch8', label: '深淵の魔界', x: 640, y: 960, terrain: 'abyss' },

  /* 境界裂域 (9-12) */
  { id: 'ch9', label: '虚無の狭間', x: 780, y: 880, terrain: 'veil' },
  { id: 'ch10', label: '勇者の試練', x: 620, y: 820, terrain: 'ruin' },
  { id: 'ch11', label: '灰冠の旧都', x: 450, y: 860, terrain: 'ash' },
  { id: 'ch12', label: '天雷の浮島', x: 300, y: 830, terrain: 'storm' },

  /* 人界最奥 (13-15) */
  { id: 'ch13', label: '蒼晶深層', x: 180, y: 745, terrain: 'cave' },
  { id: 'ch14', label: '腐緑の樹海', x: 335, y: 685, terrain: 'forest' },
  { id: 'ch15', label: '黒鉄機城', x: 500, y: 705, terrain: 'machine' },

  /* The Veil (16-20) */
  { id: 'ch16', label: '沈みゆく聖海', x: 660, y: 600, terrain: 'water' },
  { id: 'ch17', label: '白夜の聖都', x: 800, y: 545, terrain: 'ruin' },
  { id: 'ch18', label: '星骸の砂海', x: 915, y: 595, terrain: 'desert' },
  { id: 'ch19', label: '月蝕の境界', x: 845, y: 445, terrain: 'veil' },
  { id: 'ch20', label: '始原の深淵', x: 680, y: 420, terrain: 'abyss' },

  /* 外縁世界 (21-25) */
  { id: 'ch21', label: '灰燼の外縁', x: 935, y: 885, terrain: 'ash' },
  { id: 'ch22', label: '玻璃凍原', x: 940, y: 760, terrain: 'ice' },
  { id: 'ch23', label: '天雷墓標群', x: 940, y: 635, terrain: 'grave' },
  { id: 'ch24', label: '虚花の庭園', x: 915, y: 490, terrain: 'forest' },
  { id: 'ch25', label: '境界王座', x: 830, y: 315, terrain: 'veil' },

  /* 逆観測域 (26-30) */
  { id: 'ch26', label: '零外接続域', x: 705, y: 260, terrain: 'veil' },
  { id: 'ch27', label: '遠信残響帯', x: 560, y: 225, terrain: 'veil' },
  { id: 'ch28', label: '機界監査層', x: 420, y: 245, terrain: 'machine' },
  { id: 'ch29', label: '逆観測門', x: 290, y: 185, terrain: 'veil' },
  { id: 'ch30', label: '外部観測核', x: 165, y: 220, terrain: 'veil' },

  /* 共観測域 (31-35) */
  { id: 'ch31', label: '応答文法層', x: 75, y: 330, terrain: 'veil' },
  { id: 'ch32', label: '第八鍵裏面層', x: 135, y: 445, terrain: 'veil' },
  { id: 'ch33', label: '欠落観測層', x: 65, y: 555, terrain: 'veil' },
  { id: 'ch34', label: '共通参照窓', x: 155, y: 645, terrain: 'veil' },
  { id: 'ch35', label: '共観測点', x: 85, y: 765, terrain: 'veil' },

  /* 分岐観測域 (36-39) */
  { id: 'ch36', label: '分岐記録', x: 305, y: 545, terrain: 'branch' },
  { id: 'ch37', label: '淘汰累層', x: 435, y: 505, terrain: 'branch' },
  { id: 'ch38', label: '双照回廊', x: 335, y: 425, terrain: 'branch' },
  { id: 'ch39', label: '分岐核', x: 470, y: 385, terrain: 'branch' },

  /* 重層観測域 (40-41) */
  { id: 'ch40', label: '重層帯', x: 565, y: 585, terrain: 'stratum' },
  { id: 'ch41', label: '分流圃', x: 555, y: 480, terrain: 'stratum' },

  /* 未踏帳外域 (42-48) — 地図の南東、帳簿の外 */
  { id: 'ch42', label: '未踏座標域', x: 790, y: 1170, terrain: 'unrecorded' },
  { id: 'ch43', label: '黙録棚', x: 905, y: 1110, terrain: 'unrecorded' },
  { id: 'ch44', label: '囲いの外', x: 855, y: 1005, terrain: 'unrecorded' },
  { id: 'ch45', label: '接続端', x: 715, y: 1055, terrain: 'unrecorded' },
  { id: 'ch46', label: '応答の畦道', x: 815, y: 1255, terrain: 'unrecorded' },
  { id: 'ch47', label: '集音の谷', x: 930, y: 1210, terrain: 'unrecorded' },
  { id: 'ch48', label: '囁きの水源', x: 730, y: 1290, terrain: 'unrecorded' },

  /* 外伝 */
  { id: 'gaiden_beasttrail', kind: 'gaiden', label: '獣径', x: 715, y: 1125, anchor: 'ch4', terrain: 'beast' },
  { id: 'gaiden_tidepath', kind: 'gaiden', label: '潮径', x: 415, y: 930, anchor: 'ch6', terrain: 'water' },
  { id: 'gaiden_ashfield', kind: 'gaiden', label: '灰径', x: 535, y: 795, anchor: 'ch11', terrain: 'ash' },

  /* 探索地点 — anchor は chapters の num（関連本編章の node id） */
  { id: 'side_mossgrove', kind: 'side', label: '苔むす獣道', x: 165, y: 1140, anchor: 'ch2', terrain: 'forest' },
  { id: 'side_rustmine', kind: 'side', label: '錆鉱の寝床', x: 645, y: 1265, anchor: 'ch4', terrain: 'cave' },
  { id: 'side_deepden', kind: 'side', label: '獣径最深部', x: 105, y: 940, anchor: 'ch5', terrain: 'beast' },
  { id: 'side_windshrine', kind: 'side', label: '風待ちの祠', x: 185, y: 880, anchor: 'ch6', terrain: 'storm' },
  { id: 'side_hollow', kind: 'side', label: '沈みし水路', x: 565, y: 1075, anchor: 'ch7', terrain: 'water' },
  { id: 'side_gravepath', kind: 'side', label: '古戦場の墓道', x: 385, y: 940, anchor: 'ch11', terrain: 'grave' },
  { id: 'side_silentforge', kind: 'side', label: '遺棄された演習炉', x: 275, y: 705, anchor: 'ch13', terrain: 'machine' },
  { id: 'side_stormpeak', kind: 'side', label: '雷鳥の峰', x: 595, y: 760, anchor: 'ch15', terrain: 'storm' },
  { id: 'side_floodgate', kind: 'side', label: '水没坑道', x: 600, y: 640, anchor: 'ch16', terrain: 'water' },
  { id: 'side_skycliff', kind: 'side', label: '断崖の足場', x: 745, y: 485, anchor: 'ch17', terrain: 'storm' },
  { id: 'side_rootwarren', kind: 'side', label: '獣の根城', x: 865, y: 685, anchor: 'ch18', terrain: 'beast' },
  { id: 'side_echocrypt', kind: 'side', label: '反響の霊廟', x: 905, y: 390, anchor: 'ch19', terrain: 'grave' },
  { id: 'side_gallowseep', kind: 'side', label: '膠着地溝', x: 850, y: 865, anchor: 'ch21', terrain: 'water' },
  { id: 'side_forgeheart', kind: 'side', label: '炉心回廊', x: 855, y: 785, anchor: 'ch22', terrain: 'machine' },
  { id: 'side_bonepit', kind: 'side', label: '骨の採取場', x: 855, y: 570, anchor: 'ch23', terrain: 'grave' },
  { id: 'side_stormroost', kind: 'side', label: '嵐鳥の営巣', x: 885, y: 535, anchor: 'ch24', terrain: 'storm' },
  { id: 'side_graveshift', kind: 'side', label: '墓標の回廊', x: 765, y: 365, anchor: 'ch25', terrain: 'grave' },
  { id: 'side_depthwell', kind: 'side', label: '深層井戸', x: 220, y: 125, anchor: 'ch29', terrain: 'water' },
  { id: 'side_apexmesa', kind: 'side', label: '頂の食卓', x: 490, y: 300, anchor: 'ch28', terrain: 'beast' },
  { id: 'side_unrecorded', kind: 'side', label: '未記録の座標', x: 480, y: 600, anchor: 'ch41', terrain: 'unrecorded' },

  /* Session 8 — 噂の合点で初めて「場所になる」隠し地点 */
  { id: 'side8_bellgrave', kind: 'side', label: '忘鐘の墓道', x: 260, y: 905, anchor: 'ch12', terrain: 'grave', requiresDiscovery: 'conv_bellgrave' },
  { id: 'side8_sunkenmanse', kind: 'side', label: '沈みゆく離宮', x: 645, y: 205, anchor: 'ch26', terrain: 'water', requiresDiscovery: 'conv_sunken_manse' },
  { id: 'side8_whitehollow', kind: 'side', label: '白い窪み', x: 700, y: 1115, anchor: 'ch42', terrain: 'unrecorded', requiresDiscovery: 'conv_white_hollow' },

  /* 隠れ商人 — 発見（discovery）されて初めて地図に点る */
  { id: 'merchant_lantern_broker', kind: 'merchant', label: '角の男の露天', x: 830, y: 945, anchor: 'ch9', terrain: 'merchant', discovery: 'merchant_lantern_broker' },
  { id: 'merchant_tide_scavenger', kind: 'merchant', label: '潮溜まりの拾い手', x: 700, y: 685, anchor: 'ch16', terrain: 'merchant', discovery: 'merchant_tide_scavenger' },
]);

/* 本編街道 — 章番号順に一本の旅路として描く。側道はanchorへの短い枝線。 */
export const WORLD_MAP_MAIN_ROUTE = Object.freeze(
  Array.from({ length: 48 }, (_, i) => `ch${i + 1}`),
);

/* Rumor thread → 地図ノード。噂が「どこに関する話か」を地図上で示す。 */
export const WORLD_MAP_RUMOR_BADGES = Object.freeze({
  night_bells: 'ch11',
  white_beast: 'side_stormpeak',
  horned_merchant: 'merchant_lantern_broker',
  sunken_manse: 'side_floodgate',
  walking_corpse: 'ch11',
  broken_machine: 'ch13',
  old_blood: 'ch17',
  storm_roost: 'side_stormroost',
  eclipse_child: 'ch19',
  deep_adapted: 'side_depthwell',
  tide_scavenger: 'merchant_tide_scavenger',
  white_hollow: 'side_unrecorded',
});

/* 領域名キャプションの描画位置 */
export const WORLD_MAP_REGION_LABELS = Object.freeze([
  { id: 'frontier', label: '開拓辺境', x: 430, y: 1310 },
  { id: 'elemental', label: '四境連峰', x: 390, y: 1090 },
  { id: 'fracture', label: '境界裂域', x: 540, y: 935 },
  { id: 'last-mortal', label: '人界最奥', x: 330, y: 785 },
  { id: 'veil', label: 'The Veil', x: 780, y: 645 },
  { id: 'outer-world', label: '外縁世界', x: 870, y: 945 },
  { id: 'reverse-observation', label: '逆観測域', x: 430, y: 140 },
  { id: 'shared-observation', label: '共観測域', x: 60, y: 830 },
  { id: 'branch-record', label: '分岐観測域', x: 300, y: 345 },
  { id: 'stratum-band', label: '重層観測域', x: 620, y: 535 },
  { id: 'unrecorded-band', label: '未踏帳外域', x: 800, y: 1345 },
]);

export function worldMapNode(id) {
  return WORLD_MAP_NODES.find((n) => n.id === id) || null;
}
