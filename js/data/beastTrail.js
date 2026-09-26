/* ============================================================
   外伝「獣径」(Beast Trail) — 魔物の縄張りを巡る外伝Chapter
   ------------------------------------------------------------
   世界各地の魔物が、人知れず「円環の残響」へ集まっているという噂。
   本編の各地方を束ねた獣径を辿ると、巣ごとに住み分けた獣たちの
   群れ —— そして、その奥に居座る名付きの番獣に辿り着く。

   本Chapterは通常のStory進行に割り込まない外伝：
   - 第2章クリア後に解放される任意の寄り道（unlocksAfter）
   - CHAPTERS/stageProgressの既存authorityにそのまま乗る
   - waveに直書きされた chN_rare 枠は「確定Rare遭遇」として機能する
     （pickEncounterPoolTypeはRare系統の枠を差し替えない）
   - 各StageのencounterPoolは「その巣の棲み分け」を表す手書きの
     群れ構成。pool.typesから通常枠が抽選され、rareTypesからは
     まれに追加のRare紛れ込みも起きる
   - 最深部の番獣 bt_denlord はBossではない（倒して勧誘できる）
   ============================================================ */

const STAGE_NAMES = Object.freeze([
  '獣径の入口', '白狼の窪み', '古代の巣窟', '雪縁の牙場', '炎床の溜まり', '鏡の静水', '獣径の主',
]);

// 「巣の棲み分け」を表す群れ構成：indexでStageと対応させる。
// rareTypesは「この巣に巣食うRare種」で、rankOverride経路の紛れ込み先。
const DEN_POOLS = Object.freeze([
  // bt-1 入口 — 平原〜深緑の境界を嗅ぎ回る斥候たち
  { types: [['ch2_normal', 1.0], ['ch2_fast', .8], ['ch1_attacker', .7], ['ch2_attacker', .7], ['ch2_support', .4]],
    rareTypes: [['ch2_rare', 1]], tags: ['wind', 'poison'] },
  // bt-2 白狼の窪み — 森狼の群れ。奥に白角がいる
  { types: [['ch2_normal', 1.0], ['ch2_fast', .8], ['ch2_attacker', .8], ['ch2_tank', .5], ['ch2_trickster', .5]],
    rareTypes: [['ch2_rare', 1]], tags: ['wind', 'poison'] },
  // bt-3 古代の巣窟 — 遺跡を根城にする亡者たち
  { types: [['ch3_normal', 1.0], ['ch3_fast', .8], ['ch3_attacker', .7], ['ch3_caster', .6], ['ch3_support', .4]],
    rareTypes: [['ch3_rare', 1]], tags: ['dark', 'light'] },
  // bt-4 雪縁の牙場 — 霊峰の麓で牙を研ぐ獣たち
  { types: [['ch4_normal', 1.0], ['ch4_fast', .8], ['ch4_attacker', .7], ['ch4_tank', .5], ['ch4_trickster', .5]],
    rareTypes: [['ch4_rare', 1]], tags: ['ice'] },
  // bt-5 炎床の溜まり — 火口の縁に集う灼かれた群れ
  { types: [['ch5_normal', 1.0], ['ch5_fast', .8], ['ch5_attacker', .7], ['ch5_tank', .5], ['ch5_caster', .5]],
    rareTypes: [['ch5_rare', 1]], tags: ['fire'] },
  // bt-6 鏡の静水 — 円環の残響が滲む静水。境界を迷う獣が流れ着く
  { types: [['ch7_normal', .9], ['ch8_fast', .8], ['ch9_normal', .8], ['ch7_trickster', .6], ['ch9_caster', .5], ['ch8_attacker', .5]],
    rareTypes: [['ch9_rare', 1], ['ch7_rare', .5]], tags: ['dark', 'light', 'wind'] },
  // bt-7 獣径の主 — 番獣の縄張り。護り手の群れの奥に主がいる
  { types: [['ch4_normal', 1.0], ['ch5_normal', .8], ['ch4_attacker', .7], ['ch5_attacker', .6], ['ch4_tank', .5]],
    rareTypes: [['ch4_rare', .7], ['ch5_rare', .4]], tags: ['ice', 'fire'] },
]);

function pool(spec) {
  return {
    id: 'bt-den',
    types: spec.types.map(([type, weight]) => ({ type, weight })),
    templates: [],
    rareChance: .05,
    rareTypes: spec.rareTypes.map(([type, weight]) => ({ type, weight })),
    regionTags: [...spec.tags],
    variantChance: .08,
  };
}

// stage id prefixは `bt-N`。findStageはCHAPTERS内のstagesを検索するため
// 番号章と衝突しない接頭辞を使う。
function st(id, nameIndex, recLevel, waves, rewards, extra = {}) {
  return { id, name: STAGE_NAMES[nameIndex], recLevel, waves, rewards, dropTable: [], ...extra };
}

export const BEAST_TRAIL_CHAPTER = {
  id: 'gaiden_beasttrail',
  // 難易度アンカー：Roamerスケーリング・Rare帯など「章番号」を読む系統が
  // 早期中盤の強度を得られるよう4を使う。Story進行・Abyss解禁・E8移行は
  // gaidenフラグで明示的に除外する（isChapterUnlocked / isAbyssUnlocked /
  // isE8MigratableStage参照）。
  num: 4,
  gaiden: true,
  unlocksAfter: '2-5',
  name: '外伝 獣径',
  displayName: '獣径',
  stages: Object.freeze([
    st('bt-1', 0, 16, [{ type: 'ch2_normal', count: 5, interval: 1.2 }, { type: 'ch2_fast', count: 4, interval: .9 }],
      { gold: 60, exp: 48 }),
    st('bt-2', 1, 20, [{ type: 'ch2_normal', count: 4, interval: 1.1 }, { type: 'ch2_fast', count: 3, interval: .9 }, { type: 'ch2_rare', count: 1, interval: 0 }],
      { gold: 90, exp: 72 }),
    st('bt-3', 2, 25, [{ type: 'ch3_normal', count: 4, interval: 1.1 }, { type: 'ch3_fast', count: 4, interval: .9 }, { type: 'ch3_rare', count: 1, interval: 0 }],
      { gold: 115, exp: 95 }),
    st('bt-4', 3, 30, [{ type: 'ch4_normal', count: 4, interval: 1.1 }, { type: 'ch4_tank', count: 2, interval: 1.6 }, { type: 'ch4_rare', count: 1, interval: 0 }],
      { gold: 140, exp: 115 }),
    st('bt-5', 4, 36, [{ type: 'ch5_normal', count: 4, interval: 1.0 }, { type: 'ch5_tank', count: 2, interval: 1.5 }, { type: 'ch5_rare', count: 1, interval: 0 }],
      { gold: 175, exp: 140 }),
    st('bt-6', 5, 42, [{ type: 'ch7_normal', count: 3, interval: 1.0 }, { type: 'ch8_fast', count: 3, interval: .8 }, { type: 'ch9_rare', count: 1, interval: 0 }],
      { gold: 220, exp: 180 }),
    st('bt-7', 6, 48, [{ type: 'ch4_normal', count: 3, interval: 1.0 }, { type: 'ch4_tank', count: 2, interval: 1.5 }, { type: 'bt_denlord', count: 1, interval: 0 }],
      { gold: 340, exp: 280 }, { boss: true }),
  ]),
};

// 各Stageへ「その巣の棲み分け」を付与する（E8移行はgaiden除外で干渉しない）。
for (let i = 0; i < BEAST_TRAIL_CHAPTER.stages.length; i++) {
  const stage = BEAST_TRAIL_CHAPTER.stages[i];
  stage.encounterPool = pool(DEN_POOLS[i]);
  stage.dropRegionTags = [...DEN_POOLS[i].tags];
}
