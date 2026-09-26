/* ============================================================
   外伝「潮径」(Tidepath) — 獣径の兄弟ルート。水溜まりの巣。
   ------------------------------------------------------------
   底なし沼地の奥、潮の満ち引きだけが刻む獣道。淀みを根城にする
   甲殻と這い寄りの群れ —— 獣径より硬く、引く波のように遅く重い。

   獣径との違い:
   - 甲殻・タンク系の比率が高い「硬い群れ」のエコロジー
   - 固有敵 tp_* 系（淀みの這い寄り/飛沫駆け/甲殻の壁獣）は
     すべて勧誘可能。確定Rareは真珠殻の古亀
   - 主は潮径の主・TIDELORD（再生系の主）
   - 解放は 6-5（沼地を越えた探索者だけが辿り着く）
   ============================================================ */

const STAGE_NAMES = Object.freeze([
  '潮径の汀', '貝殻の洲', '引き潮の回廊', '渦の深潭', '潮径の主',
]);

const DEN_POOLS = Object.freeze([
  // tp-1 汀 — 沼と海の境を嗅ぎ回る這い寄りたち
  { types: [['tp_shambler', 1.0], ['ch6_fast', .8], ['tp_skimmer', .7], ['ch6_normal', .6]],
    rareTypes: [['tp_rare', 1]], tags: ['ice', 'poison'] },
  // tp-2 貝殻の洲 — 甲殻が身を寄せ合う浅瀬
  { types: [['tp_bulwark', .9], ['tp_shambler', .8], ['ch6_tank', .6], ['tp_skimmer', .6]],
    rareTypes: [['tp_rare', 1]], tags: ['ice'] },
  // tp-3 引き潮の回廊 — 深部へ落ち込む群れの通り道
  { types: [['tp_skimmer', .9], ['ch6_fast', .8], ['ch6_trickster', .7], ['tp_shambler', .6]],
    rareTypes: [['tp_rare', 1]], tags: ['ice', 'wind'] },
  // tp-4 渦の深潭 — 主の縄張りの手前。分厚い護り手
  { types: [['tp_bulwark', 1.0], ['ch6_tank', .8], ['tp_shambler', .7], ['ch6_caster', .5]],
    rareTypes: [['tp_rare', 1], ['ch6_rare', .5]], tags: ['ice', 'poison'] },
  // tp-5 潮径の主 — 深潭の奥、満ち潮を従える主
  { types: [['tp_bulwark', .9], ['tp_shambler', .8], ['ch6_tank', .6], ['tp_skimmer', .5]],
    rareTypes: [['tp_rare', .8]], tags: ['ice'] },
]);

function pool(spec) {
  return {
    id: 'tp-den',
    types: spec.types.map(([type, weight]) => ({ type, weight })),
    templates: [],
    rareChance: .05,
    rareTypes: spec.rareTypes.map(([type, weight]) => ({ type, weight })),
    regionTags: [...spec.tags],
    variantChance: .08,
  };
}
function st(id, nameIndex, recLevel, waves, rewards, extra = {}) {
  return { id, name: STAGE_NAMES[nameIndex], recLevel, waves, rewards, dropTable: [], ...extra };
}

export const TIDEPATH_CHAPTER = {
  id: 'gaiden_tidepath',
  num: 6,
  gaiden: true,
  unlocksAfter: '6-5',
  name: '外伝 潮径',
  displayName: '潮径',
  stages: Object.freeze([
    st('tp-1', 0, 34, [{ type: 'tp_shambler', count: 4, interval: 1.2 }, { type: 'ch6_fast', count: 3, interval: .9 }],
      { gold: 100, exp: 80 }),
    st('tp-2', 1, 38, [{ type: 'tp_bulwark', count: 2, interval: 1.6 }, { type: 'tp_shambler', count: 3, interval: 1.1 }, { type: 'tp_rare', count: 1, interval: 0 }],
      { gold: 135, exp: 105 }),
    st('tp-3', 2, 43, [{ type: 'tp_skimmer', count: 4, interval: .9 }, { type: 'ch6_fast', count: 3, interval: .9 }, { type: 'tp_rare', count: 1, interval: 0 }],
      { gold: 165, exp: 130 }),
    st('tp-4', 3, 47, [{ type: 'tp_bulwark', count: 3, interval: 1.5 }, { type: 'tp_shambler', count: 2, interval: 1.1 }, { type: 'tp_rare', count: 1, interval: 0 }],
      { gold: 200, exp: 160 }),
    st('tp-5', 4, 52, [{ type: 'tp_bulwark', count: 2, interval: 1.6 }, { type: 'tp_shambler', count: 2, interval: 1.2 }, { type: 'tp_denlord', count: 1, interval: 0 }],
      { gold: 380, exp: 320 }, { boss: true }),
  ]),
};

for (let i = 0; i < TIDEPATH_CHAPTER.stages.length; i++) {
  const stage = TIDEPATH_CHAPTER.stages[i];
  stage.encounterPool = pool(DEN_POOLS[i]);
  stage.dropRegionTags = [...DEN_POOLS[i].tags];
}
