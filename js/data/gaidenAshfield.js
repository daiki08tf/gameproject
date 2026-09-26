/* ============================================================
   外伝「灰径」(Ashfield) — 獣径の兄弟ルート。葬送の巣。
   ------------------------------------------------------------
   灰冠の旧都の外れ、葬いきれなかったものが積もる野原。
   亡者の獣道は速く、数で覆い隠す —— 獣径より軽く、灰のように
   無数に舞う。

   獣径・潮径との違い:
   - 高速・亡者系の「数の群れ」エコロジー（fast偏重のwave構成）
   - 固有敵 af_* 系（灰の亡兵/煤羽の妖蛾）は勧誘可能。
     確定Rareは王墓の大蜘蛛
   - 主は灰径の主・ASHLORD（死地で牙を剥く主）
   - 解放は 11-5（旧都に踏み入れた探索者だけが見る）
   ============================================================ */

const STAGE_NAMES = Object.freeze([
  '灰径の境', '葬送の平地', '白灰の窪地', '静穏の墓床', '灰径の主',
]);

const DEN_POOLS = Object.freeze([
  // af-1 境 — 灰にまみれた亡兵の群れ
  { types: [['af_revenant', 1.0], ['af_moth', .9], ['ch11_fast', .8], ['ch11_normal', .6]],
    rareTypes: [['af_rare', 1]], tags: ['dark', 'fire'] },
  // af-2 葬送の平地 — 舞い散る煤羽が視界を塞ぐ
  { types: [['af_moth', 1.0], ['ch11_fast', .8], ['af_revenant', .7], ['ch11_trickster', .6]],
    rareTypes: [['af_rare', 1]], tags: ['dark'] },
  // af-3 白灰の窪地 — 死灰が積もる静かな縄張り
  { types: [['af_revenant', .9], ['af_moth', .9], ['ch11_caster', .7], ['ch11_attacker', .6]],
    rareTypes: [['af_rare', 1]], tags: ['dark', 'light'] },
  // af-4 静穏の墓床 — 主に捧げる護りの群れ
  { types: [['af_revenant', 1.0], ['ch11_tank', .7], ['af_moth', .8], ['ch11_support', .5]],
    rareTypes: [['af_rare', 1], ['ch11_rare', .5]], tags: ['dark', 'fire'] },
  // af-5 灰径の主 — 墓床の中央、葬唱の主
  { types: [['af_moth', .9], ['af_revenant', .8], ['ch11_tank', .6]],
    rareTypes: [['af_rare', .8]], tags: ['dark'] },
]);

function pool(spec) {
  return {
    id: 'af-den',
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

export const ASHFIELD_CHAPTER = {
  id: 'gaiden_ashfield',
  num: 11,
  gaiden: true,
  unlocksAfter: '11-5',
  name: '外伝 灰径',
  displayName: '灰径',
  stages: Object.freeze([
    st('af-1', 0, 80, [{ type: 'af_revenant', count: 4, interval: 1.1 }, { type: 'af_moth', count: 4, interval: .8 }],
      { gold: 260, exp: 210 }),
    st('af-2', 1, 88, [{ type: 'af_moth', count: 5, interval: .8 }, { type: 'af_revenant', count: 3, interval: 1.0 }, { type: 'af_rare', count: 1, interval: 0 }],
      { gold: 330, exp: 265 }),
    st('af-3', 2, 96, [{ type: 'af_revenant', count: 4, interval: 1.0 }, { type: 'ch11_caster', count: 2, interval: 1.4 }, { type: 'af_rare', count: 1, interval: 0 }],
      { gold: 400, exp: 320 }),
    st('af-4', 3, 104, [{ type: 'af_moth', count: 4, interval: .8 }, { type: 'ch11_tank', count: 2, interval: 1.5 }, { type: 'af_rare', count: 1, interval: 0 }],
      { gold: 480, exp: 390 }),
    st('af-5', 4, 112, [{ type: 'af_revenant', count: 3, interval: 1.0 }, { type: 'af_moth', count: 3, interval: .8 }, { type: 'af_denlord', count: 1, interval: 0 }],
      { gold: 720, exp: 600 }, { boss: true }),
  ]),
};

for (let i = 0; i < ASHFIELD_CHAPTER.stages.length; i++) {
  const stage = ASHFIELD_CHAPTER.stages[i];
  stage.encounterPool = pool(DEN_POOLS[i]);
  stage.dropRegionTags = [...DEN_POOLS[i].tags];
}
