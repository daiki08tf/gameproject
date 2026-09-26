/* ============================================================
   Side Locations（探索地点）— 本編の街道を外れた任意の寄り道
   ------------------------------------------------------------
   「外伝」は巣の生態系を辿る物語的な寄り道だったが、Side Location
   はもっと小さく、本編と直接関係しない寄り道——森の窪地、鉱山跡、
   祠、墓道、工房跡、見張り塔、そして発見者だけが辿り着く隠し場所。
   「MAP OFF THE MAIN ROAD」を形にする層。

   構造（既存authorityへの乗り方）:
   - CHAPTERSの末端に並ぶ gaiden:true な Chapter。
     - isChapterUnlocked の unlocksAfter（本編Stage踏破）で解放
     - isAbyssUnlocked / E8移行 / nextStageAfter は gaiden を除外済み
     - nextStageAfter は /^ch\d+$/ のみ辿るので本編進行へ混入しない
   - sideLocation:true + poiKind で chapterSelect の「探索地点」節へ
     分離描画する（外伝節とは別枠）。
   - poiKind:
       poi     … 単発の探索地点（1〜2 Stage）。短く、確定Rareや
                 固有ドロップテーブルを持つ「ちょっと良い場所」。
       dungeon … 2〜3 Stage の小迷宮。最深部に巣の主級の希少種
                 （Bossではないので撃破→勧誘できる）がいる。
       hidden  … 条件を満たすまで章選択に現れない隠し場所。
                 unlocksAfter の踏破を満たした時点で初めて姿を見せる。
   - 各Stageは waves / encounterPool / dropRegionTags / firstClear を
     持つ。報酬は全て既存のitemId・敵typeに紐づく。

   「知らないと通り過ぎるが、踏めば確かに得をする」場所を目指す。
   ============================================================ */

export const SIDE_LOCATION_KIND = Object.freeze({
  poi: '探索地点',
  dungeon: '小迷宮',
  hidden: '隠し場所',
});

function pool(types, rareTypes, tags, { rareChance = .05, variantChance = .08 } = {}) {
  return {
    id: 'side-loc',
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
   1. 苔むす獣道（POI・早期）
   平原と深緑の境に隠れた獣道。小さな群れの奥で必ずRareが1体いる。
   ------------------------------------------------------------ */
const MOSSGROVE = {
  id: 'side_mossgrove', num: 2, gaiden: true, sideLocation: true, poiKind: 'poi',
  unlocksAfter: '2-5', name: '探索 苔むす獣道', displayName: '苔むす獣道',
  desc: '街道を外れた苔むす獣道。深緑の匂いと、何か大きな足跡。',
  stages: [
    st('sg-1', '苔むす獣道', 18,
      [{ type: 'ch2_normal', count: 5, interval: 1.1 }, { type: 'ch2_fast', count: 4, interval: .9 }, { type: 'ch2_rare', count: 1, interval: 0 }],
      { gold: 80, exp: 60 },
      { firstClear: { itemId: 'ch3_accessory' }, dropTable: [{ itemId: 'ch2_accessory', weight: 1 }, { itemId: 'ch2_head', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   2. 錆鉱の寝床（POI・洞窟）
   掘り尽くされた鉱山の横穴。重装甲の魔物が根城にしている。
   ------------------------------------------------------------ */
const RUSTMINE = {
  id: 'side_rustmine', num: 4, gaiden: true, sideLocation: true, poiKind: 'poi',
  unlocksAfter: '4-5', name: '探索 錆鉱の寝床', displayName: '錆鉱の寝床',
  desc: '鉱夫が捨てた横穴の奥で、鋭利な鉱石を纏った群れが眠る。',
  stages: [
    st('rm-1', '錆鉱の寝床', 30,
      [{ type: 'ch3_tank', count: 3, interval: 1.6 }, { type: 'ch4_normal', count: 4, interval: 1.1 }, { type: 'ch4_rare', count: 1, interval: 0 }],
      { gold: 120, exp: 95 },
      { firstClear: { itemId: 'sh_tower_e' }, dropTable: [{ itemId: 'ch4_shield', weight: 1 }, { itemId: 'ch4_body', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   3. 風待ちの祠（POI・祠）
   山の尾根に建つ小さな祠。祈りの残滓を巡って精霊が集う。
   ------------------------------------------------------------ */
const WINDSHRINE = {
  id: 'side_windshrine', num: 6, gaiden: true, sideLocation: true, poiKind: 'poi',
  unlocksAfter: '6-5', name: '探索 風待ちの祠', displayName: '風待ちの祠',
  desc: '旅人が安全を願って建てた祠。今は風を読む獣たちの寝床。',
  stages: [
    st('ws-1', '風待ちの祠', 48,
      [{ type: 'ch6_trickster', count: 4, interval: .9 }, { type: 'ch6_support', count: 2, interval: 1.4 }, { type: 'ch6_rare', count: 1, interval: 0 }],
      { gold: 170, exp: 135 },
      { firstClear: { itemId: 'ac_charm_e' }, dropTable: [{ itemId: 'ch6_accessory', weight: 1 }, { itemId: 'rune_effect_haste', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   4. 沈みし水路（POI・水路 — 潮径クリアで見える）
   潮径を制した者だけが気づく、霧の下のもう一本の水路。
   ------------------------------------------------------------ */
const HOLLOW_CHANNEL = {
  id: 'side_hollow', num: 7, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: 'tp-5', name: '隠し 沈みし水路', displayName: '沈みし水路',
  desc: '潮径の主を制した今、水面の下にもう一本の道が見える。',
  stages: [
    st('hw-1', '沈みし水路', 58,
      [{ type: 'tp_shambler', count: 4, interval: 1.1 }, { type: 'tp_skimmer', count: 4, interval: .9 }, { type: 'tp_rare', count: 1, interval: 0 }],
      { gold: 200, exp: 160 },
      { firstClear: { itemId: 'ch7_accessory' }, dropTable: [{ itemId: 'ch7_body', weight: 1 }, { itemId: 'ch7_head', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   5. 古戦場の墓道（DUNGEON・墓地、3階層）
   葬いきれなかった兵たちの眠る墓道。最深部に墓守の大蜘蛛。
   ------------------------------------------------------------ */
const GRAVEPATH = {
  id: 'side_gravepath', num: 11, gaiden: true, sideLocation: true, poiKind: 'dungeon',
  unlocksAfter: '11-5', name: '探索 古戦場の墓道', displayName: '古戦場の墓道',
  desc: '戦で果てた者たちの墓道。供養の声はもう届かない。',
  stages: [
    st('gp-1', '墓道・参道', 82,
      [{ type: 'ch11_normal', count: 5, interval: 1.1 }, { type: 'af_moth', count: 3, interval: .9 }],
      { gold: 240, exp: 190 },
      { dropTable: [{ itemId: 'ch11_shield', weight: 1 }, { itemId: 'ch11_head', weight: 1 }] }),
    st('gp-2', '墓道・埋葬層', 88,
      [{ type: 'af_revenant', count: 5, interval: 1.0 }, { type: 'ch11_tank', count: 2, interval: 1.6 }],
      { gold: 270, exp: 220 },
      { dropTable: [{ itemId: 'ch11_body', weight: 1 }, { itemId: 'rune_effect_lifesteal', weight: 1 }] }),
    st('gp-3', '墓道・最深墓室', 94,
      [{ type: 'af_revenant', count: 4, interval: 1.0 }, { type: 'af_rare', count: 1, interval: 0 }, { type: 'af_moth', count: 3, interval: .9 }],
      { gold: 320, exp: 260 },
      { firstClear: { itemId: 'ac_relic_l' }, dropTable: [{ itemId: 'ch11_accessory', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   6. 遺棄された演習炉（DUNGEON・工房、3階層）
   かつて兵器を焼いた演習炉。動かないはずの残骸が今も巡る。
   ------------------------------------------------------------ */
const SILENTFORGE = {
  id: 'side_silentforge', num: 13, gaiden: true, sideLocation: true, poiKind: 'dungeon',
  unlocksAfter: '13-5', name: '探索 遺棄された演習炉', displayName: '遺棄された演習炉',
  desc: '戦争を模すために建てられた炉。命令が消えても機構は回る。',
  stages: [
    st('sf-1', '演習炉・搬入路', 100,
      [{ type: 'ch13_normal', count: 5, interval: 1.0 }, { type: 'ch13_fast', count: 4, interval: .8 }],
      { gold: 300, exp: 240 },
      { dropTable: [{ itemId: 'ch13_head', weight: 1 }, { itemId: 'ch13_accessory', weight: 1 }] }),
    st('sf-2', '演習炉・熱交換層', 106,
      [{ type: 'ch14_normal', count: 4, interval: 1.0 }, { type: 'ch13_tank', count: 2, interval: 1.6 }, { type: 'ch13_support', count: 1, interval: 1.4 }],
      { gold: 330, exp: 270 },
      { dropTable: [{ itemId: 'ch13_body', weight: 1 }, { itemId: 'ch14_shield', weight: 1 }] }),
    st('sf-3', '演習炉・炉心', 112,
      [{ type: 'ch14_normal', count: 4, interval: 1.0 }, { type: 'ch13_rare', count: 1, interval: 0 }, { type: 'ch14_fast', count: 3, interval: .8 }],
      { gold: 380, exp: 310 },
      { firstClear: { itemId: 'ch14_named_body' }, dropTable: [{ itemId: 'ch14_body', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   7. 雷鳥の峰（POI・山頂、後半）
   嵐の麓の峰。雷を好む巨鳥の群れが空を縄張りにする。
   ------------------------------------------------------------ */
const STORMPEAK = {
  id: 'side_stormpeak', num: 15, gaiden: true, sideLocation: true, poiKind: 'poi',
  unlocksAfter: '15-5', name: '探索 雷鳥の峰', displayName: '雷鳥の峰',
  desc: '稲妻を渡り鳥が繰り返す峰。羽根拾いは命がけの仕事。',
  stages: [
    st('sp-1', '雷鳥の峰', 118,
      [{ type: 'ch15_fast', count: 6, interval: .7 }, { type: 'ch15_attacker', count: 3, interval: 1.0 }, { type: 'ch15_rare', count: 1, interval: 0 }],
      { gold: 420, exp: 340 },
      { firstClear: { itemId: 'ch15_weapon_epic' }, dropTable: [{ itemId: 'ch15_accessory', weight: 1 }, { itemId: 'ch15_head', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   8. 獣径最深部（HIDDEN・獣径クリアで初めて現れる）
   獣径の主のさらに奥——「本当の巣」。最深部に相位の番人が待つ
   段階制の密猟場。Boss枠なので勧誘はできない（倒す狩場）。
   ------------------------------------------------------------ */
const DEEPDEN = {
  id: 'side_deepden', num: 5, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: 'bt-7', name: '隠し 獣径最深部', displayName: '獣径最深部',
  desc: '獣径の主を制して初めて現れた、さらに深い獣道。',
  stages: [
    st('dd-1', '獣径・更深の道', 52,
      [{ type: 'ch4_normal', count: 5, interval: 1.0 }, { type: 'ch5_fast', count: 4, interval: .8 }, { type: 'ch5_rare', count: 1, interval: 0 }],
      { gold: 260, exp: 200 },
      { dropTable: [{ itemId: 'ch5_accessory', weight: 1 }, { itemId: 'ch5_head', weight: 1 }] }),
    st('dd-2', '獣径・相位の窪地', 58,
      [{ type: 'ch5_normal', count: 3, interval: 1.0 }, { type: 'sd_warden', count: 1, interval: 0 }],
      { gold: 480, exp: 380 },
      { boss: true, firstClear: { itemId: 'bd_dragon_l' }, dropTable: [{ itemId: 'ch5_named_body', weight: 1 }, { itemId: 'rune_effect_awaken', weight: 1 }] }),
  ],
};

export const SIDE_LOCATION_CHAPTERS = Object.freeze([
  MOSSGROVE, RUSTMINE, WINDSHRINE, HOLLOW_CHANNEL,
  GRAVEPATH, SILENTFORGE, STORMPEAK, DEEPDEN,
]);

// 各Stageへ「その場所の棲み分け」を付与する（E8移行はgaiden除外で干渉しない）。
const SIDE_POOLS = Object.freeze({
  side_mossgrove: [
    pool([['ch2_normal', 1], ['ch2_fast', .9], ['ch2_attacker', .7]], [['ch2_rare', 1]], ['wind', 'poison']),
  ],
  side_rustmine: [
    pool([['ch3_tank', 1], ['ch4_normal', .9], ['ch4_attacker', .6]], [['ch4_rare', 1]], ['earth', 'dark'], { rareChance: .04 }),
  ],
  side_windshrine: [
    pool([['ch6_trickster', 1], ['ch6_support', .8], ['ch6_caster', .6]], [['ch6_rare', 1]], ['wind', 'light'], { rareChance: .04 }),
  ],
  side_hollow: [
    pool([['tp_shambler', 1], ['tp_skimmer', .9], ['tp_bulwark', .6]], [['tp_rare', 1]], ['water', 'dark'], { rareChance: .05 }),
  ],
  side_gravepath: [
    pool([['ch11_normal', 1], ['af_moth', .8], ['ch11_fast', .7]], [['af_rare', .5]], ['dark', 'earth']),
    pool([['af_revenant', 1], ['ch11_tank', .7], ['af_moth', .8]], [['af_rare', .7]], ['dark', 'earth']),
    pool([['af_revenant', 1], ['af_moth', .9], ['ch11_caster', .5]], [['af_rare', 1]], ['dark', 'earth']),
  ],
  side_silentforge: [
    pool([['ch13_normal', 1], ['ch13_fast', .9], ['ch13_caster', .6]], [['ch13_rare', .7]], ['lightning', 'dark']),
    pool([['ch14_normal', 1], ['ch13_tank', .7], ['ch13_support', .6]], [['ch13_rare', .8]], ['lightning', 'dark']),
    pool([['ch14_normal', 1], ['ch14_fast', .8], ['ch13_attacker', .6]], [['ch13_rare', 1]], ['lightning', 'dark']),
  ],
  side_stormpeak: [
    pool([['ch15_fast', 1], ['ch15_attacker', .8], ['ch15_support', .5]], [['ch15_rare', 1]], ['lightning', 'wind'], { rareChance: .05 }),
  ],
  side_deepden: [
    pool([['ch4_normal', 1], ['ch5_fast', .9], ['ch4_attacker', .7]], [['ch5_rare', .8]], ['ice', 'fire']),
    pool([['ch5_normal', 1], ['ch5_attacker', .8], ['ch5_tank', .6]], [['ch5_rare', 1]], ['ice', 'fire'], { rareChance: .04 }),
  ],
});

// 探索地点のドロップ品質補正（generateWeaponAffixes の ctx.bonus へ。
// 最大+0.15でキャップされる＝Loot自体はドロップを掘り続ける価値を持つ）。
const SIDE_LOOT_BONUS = Object.freeze({
  side_mossgrove: .08, side_rustmine: .09, side_windshrine: .09,
  side_hollow: .10, side_gravepath: .10, side_silentforge: .10,
  side_stormpeak: .11, side_deepden: .12,
});

for (const chapter of SIDE_LOCATION_CHAPTERS) {
  const pools = SIDE_POOLS[chapter.id] || [];
  chapter.stages.forEach((stage, i) => {
    const p = pools[i];
    if (!p) return;
    stage.encounterPool = p;
    stage.dropRegionTags = [...p.regionTags];
    stage.dropAffixBonus = SIDE_LOOT_BONUS[chapter.id] || 0;
  });
}

// chapterSelect の描画側が「本編・外伝・探索地点」を分けて並べるための判定。
export function isSideLocationChapter(chapter) {
  return !!chapter?.sideLocation;
}
// 隠し場所は unlocksAfter を踏破するまで章選択に描画しない
// （「まだ気づいていない道」を表す。描画側で isChapterUnlocked を併用）。
export function sideLocationVisible(chapter, isChapterUnlocked) {
  if (!chapter?.sideLocation) return false;
  if (chapter.poiKind !== 'hidden') return true;
  return !!isChapterUnlocked?.();
}
export function sideLocationKindLabel(chapter) {
  return SIDE_LOCATION_KIND[chapter?.poiKind] || '探索地点';
}
