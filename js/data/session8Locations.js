/* ============================================================
   Session 8 — Living World locations
   ------------------------------------------------------------
   New side-location chapters riding the SAME authority as
   sideLocations{,2}.js (sideLocation:true chapter in CHAPTERS,
   visibility via sideLocationVisibility). Session 8 adds two
   visibility inputs on top of the existing ladder:

     chapter.requiresDiscovery … world2.discoveries[id] must exist
       (multi-rumor convergence reveals the location — knowledge
       unlocks the place, not a level number)
     chapter.climateGate {weathers?, dayparts?} … the path only
       exists while the living world matches (worldClimate).
       When known but the weather is wrong, the ??? foreshadow
       card stays up with a climate hint — "the path is real,
       but not right now".
     stage.requiresField … per-stage Field Ability gate, so one
       dungeon can keep deeper layers behind dive/mechanism/
       seer/fissure — return value for a growing roster.
     stage.vault … clearing it triggers a natural-drop burst
       through state.addItem (DROP CREATES THE ITEM; the vault
       only rolls the existing pipeline more times).
   ============================================================ */

function pool(types, rareTypes, tags, { rareChance = .05, variantChance = .08 } = {}) {
  return {
    id: 's8-side-loc',
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
   1. 忘鐘の墓道（HIDDEN・夜＋霧/灰の時だけ姿を見せる）
   三つの噂（夜の鐘・東へ歩く死者・ないはずの道）が合点した先。
   墓の仲間がいれば崖の隙間を見つけられる——が、昼の晴れた日に
   来ても、ここは「ただの崖」に戻っている。
   ------------------------------------------------------------ */
const BELLGRAVE = {
  id: 'side8_bellgrave', num: 12, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: '11-5',
  requiresDiscovery: 'conv_bellgrave',
  climateGate: { weathers: ['mist', 'ash'], dayparts: ['night', 'dusk'] },
  requiresField: 'grave',
  fieldHint: '鐘の音がする。夜と霧（あるいは灰）の時だけ、崖に道が浮く。墓の仲間が道を知っている。',
  discoveryText: '霧の中で崖の輪郭が崩れ、鐘の音の先に墓道の入口が浮かんだ。',
  name: '隠し場所 忘鐘の墓道', displayName: '忘鐘の墓道',
  desc: '夜と霧の時だけ崖に浮く墓道。鐘は三度鳴り、死者は東へ歩く。',
  locTags: ['grave'],
  stages: [
    st('bg8-1', '忘鐘の墓道・送りの径', 2350,
      [{ type: 'ch11_normal', count: 5, interval: 1.0 }, { type: 'ch11_fast', count: 3, interval: .8 }],
      { gold: 640, exp: 520 },
      { dropTable: [{ itemId: 'ch11_accessory', weight: 1 }, { itemId: 'ch11_head', weight: 1 }] }),
    st('bg8-2', '忘鐘の墓道・三鳴の間', 2600,
      [{ type: 'ch11_tank', count: 3, interval: 1.3 }, { type: 'ch11_rare', count: 1, interval: 0 }],
      { gold: 720, exp: 580 },
      { mutationBoost: 2.0, dropRankBonus: .04, dropTable: [{ itemId: 'ch11_body', weight: 1 }, { itemId: 'ch11_weapon', weight: 1 }] }),
    st('bg8-3', '忘鐘の墓道・鐘守の寝所', 2900,
      [{ type: 'ch11_normal', count: 4, interval: 1.0 }, { type: 'ch11_rare', count: 2, interval: 0 }],
      { gold: 900, exp: 700 },
      { vault: { rolls: 3, rankBonus: .05 }, mutationBoost: 2.5,
        firstClear: { itemId: 'ch11_named_accessory' },
        dropTable: [{ itemId: 'ch11_weapon', weight: 1 }, { itemId: 'ch11_accessory', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   2. 沈みゆく離宮（CHAIN DUNGEON — 能力の数だけ深く潜れる）
   湖底に丸ごと沈んだ領主の離宮。廊下は水に沈み、昇降機は錆び、
   廟室は目に見えず、宝物庫は床の裂け目の先にある。
   初めて来た者は前庭までしか進めない。仲間が増えるたびに、
   離宮はもう一層深く開く。
   ------------------------------------------------------------ */
const SUNKEN_MANSE = {
  id: 'side8_sunkenmanse', num: 26, gaiden: true, sideLocation: true, poiKind: 'dungeon',
  unlocksAfter: '16-8',
  requiresDiscovery: 'conv_sunken_manse',
  fieldHint: '湖底に離宮が沈んでいる。潜る・動かす・見抜く・割る——仲間の数だけ深く潜れる。',
  discoveryText: '水面の下、湖の底に、昔の領主の離宮が丸ごと沈んでいるのが見えた。',
  name: '小迷宮 沈みゆく離宮', displayName: '沈みゆく離宮',
  desc: '水没した離宮。空気の残る部屋を辿って、最深部へ。',
  locTags: ['water', 'deep'],
  stages: [
    st('sm8-1', '沈みゆく離宮・崩れた前庭', 3100,
      [{ type: 'ch16_normal', count: 5, interval: 1.0 }, { type: 'ch16_fast', count: 4, interval: .8 }],
      { gold: 760, exp: 640 },
      { dropTable: [{ itemId: 'ch16_accessory', weight: 1 }, { itemId: 'ch16_head', weight: 1 }] }),
    st('sm8-2', '沈みゆく離宮・冠水廊下', 3500,
      [{ type: 'tp_shambler', count: 4, interval: .9 }, { type: 'ch16_normal', count: 4, interval: 1.0 }],
      { gold: 840, exp: 700 },
      { requiresField: 'dive', fieldHint: '廊下は水没している。水棲の仲間が潜れば進める。',
        dropTable: [{ itemId: 'ch16_body', weight: 1 }, { itemId: 'ch17_accessory', weight: 1 }] }),
    st('sm8-3', '沈みゆく離宮・錆びた昇降機', 3900,
      [{ type: 'ch15_normal', count: 3, interval: 1.1 }, { type: 'ch15_tank', count: 2, interval: 1.4 }, { type: 'ch15_rare', count: 1, interval: 0 }],
      { gold: 920, exp: 780 },
      { requiresField: 'mechanism', fieldHint: '昇降機は錆びて止まっている。機械を扱う仲間がいれば動かせる。',
        dropTable: [{ itemId: 'ch17_head', weight: 1 }, { itemId: 'ch16_named_accessory', weight: 1 }] }),
    st('sm8-4', '沈みゆく離宮・見えない廟室', 4300,
      [{ type: 'ch19_normal', count: 4, interval: 1.0 }, { type: 'ch19_fast', count: 3, interval: .8 }, { type: 'ch19_rare', count: 1, interval: 0 }],
      { gold: 1040, exp: 860 },
      { requiresField: 'seer', fieldHint: '廟室の壁は目に見えない。見抜く仲間がいれば先がある。',
        mutationBoost: 1.5, dropRankBonus: .05,
        dropTable: [{ itemId: 'ch19_accessory', weight: 1 }, { itemId: 'ch19_body', weight: 1 }] }),
    st('sm8-5', '沈みゆく離宮・裂け目の宝物庫', 4800,
      [{ type: 'ch20_normal', count: 4, interval: 1.0 }, { type: 'ch20_tank', count: 2, interval: 1.4 }, { type: 'ch20_rare', count: 2, interval: 0 }],
      { gold: 1600, exp: 1200 },
      { requiresField: 'fissure', fieldHint: '床に細い裂け目がある。割る力を持つ仲間がいれば降りられる。',
        vault: { rolls: 4, rankBonus: .08 }, mutationBoost: 2.0,
        firstClear: { itemId: 'ch20_named_accessory' },
        dropTable: [{ itemId: 'ch20_named2_body', weight: 1 }, { itemId: 'ch20_weapon_epic', weight: 1 }] }),
  ],
};

/* ------------------------------------------------------------
   3. 白い窪み（HIDDEN・最深の変異狩場）
   未記録の座標の外れ、霧の夜にだけ「場所」になる窪み。
   白い抜け殻が何重にも重なり、変異個体の気配が濃い。
   ------------------------------------------------------------ */
const WHITE_HOLLOW = {
  id: 'side8_whitehollow', num: 42, gaiden: true, sideLocation: true, poiKind: 'hidden',
  unlocksAfter: '42-5',
  requiresDiscovery: 'conv_white_hollow',
  climateGate: { weathers: ['mist'], dayparts: ['night', 'dawn'] },
  fieldHint: '霧の夜だけ、窪みが「場所」になる。変異の気配が濃い。',
  discoveryText: '霧の夜、未記録の座標の外れに窪みがあった。白い抜け殻が何重にも重なっている。',
  name: '隠し場所 白い窪み', displayName: '白い窪み',
  desc: '霧と雪の夜にだけ存在する窪み。何かが何度も姿を変えて生き延びている。',
  locTags: ['deep', 'spirit'],
  stages: [
    st('wh8-1', '白い窪み・抜け殻の縁', 15200,
      [{ type: 'ch42_normal', count: 5, interval: 1.0 }, { type: 'ch42_fast', count: 3, interval: .8 }],
      { gold: 2400, exp: 1900 },
      { mutationBoost: 2.5, dropRankBonus: .05,
        dropTable: [{ itemId: 'ch42_accessory', weight: 1 }, { itemId: 'ch42_body', weight: 1 }] }),
    st('wh8-2', '白い窪み・脱皮の底', 16200,
      [{ type: 'ch42_tank', count: 3, interval: 1.3 }, { type: 'ch42_rare', count: 2, interval: 0 }, { type: 'ch44_fast', count: 3, interval: .8 }],
      { gold: 2900, exp: 2300 },
      { vault: { rolls: 4, rankBonus: .10 }, mutationBoost: 3.5,
        firstClear: { itemId: 'ch42_named_weapon' },
        dropTable: [{ itemId: 'ch42_named2_body', weight: 1 }, { itemId: 'ch43_weapon', weight: 1 }] }),
  ],
};

export const SESSION8_LOCATION_CHAPTERS = Object.freeze([BELLGRAVE, SUNKEN_MANSE, WHITE_HOLLOW]);

const SIDE8_POOLS = Object.freeze({
  side8_bellgrave: [
    pool([['ch11_normal', 6], ['ch11_fast', 4]], [['ch11_rare', 1]], ['grave', 'undead'], { rareChance: .06 }),
    pool([['ch11_normal', 4], ['ch11_tank', 4], ['ch11_fast', 2]], [['ch11_rare', 1]], ['grave', 'undead'], { rareChance: .08 }),
    pool([['ch11_tank', 5], ['ch11_normal', 3]], [['ch11_rare', 2]], ['grave', 'undead'], { rareChance: .10 }),
  ],
  side8_sunkenmanse: [
    pool([['ch16_normal', 5], ['ch16_fast', 4]], [['ch16_rare', 1]], ['aquatic'], { rareChance: .06 }),
    pool([['tp_shambler', 4], ['ch16_normal', 4]], [['tp_bulwark', 1]], ['aquatic'], { rareChance: .06 }),
    pool([['ch15_normal', 4], ['ch15_tank', 3]], [['ch15_rare', 1]], ['machine'], { rareChance: .07 }),
    pool([['ch19_normal', 4], ['ch19_fast', 3]], [['ch19_rare', 1]], ['spirit'], { rareChance: .08 }),
    pool([['ch20_normal', 4], ['ch20_tank', 3]], [['ch20_rare', 2]], ['deep', 'aquatic'], { rareChance: .10 }),
  ],
  side8_whitehollow: [
    pool([['ch42_normal', 5], ['ch42_fast', 4]], [['ch42_rare', 1]], ['deep', 'spirit'], { rareChance: .08, variantChance: .12 }),
    pool([['ch42_tank', 4], ['ch44_fast', 3]], [['ch42_rare', 2]], ['deep', 'spirit'], { rareChance: .12, variantChance: .16 }),
  ],
});

const SIDE8_LOOT_BONUS = Object.freeze({
  side8_bellgrave: .04, side8_sunkenmanse: .06, side8_whitehollow: .10,
});

for (const chapter of SESSION8_LOCATION_CHAPTERS) {
  const pools = SIDE8_POOLS[chapter.id] || [];
  chapter.stages.forEach((stage, i) => {
    const p = pools[i];
    if (p) {
      stage.encounterPool = p;
      stage.dropRegionTags = [...p.regionTags];
    }
    stage.dropAffixBonus = (stage.dropAffixBonus || 0) + (SIDE8_LOOT_BONUS[chapter.id] || 0);
  });
}
