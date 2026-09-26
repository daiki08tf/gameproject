/* ============================================================
   Hunt Uniques — 巡回（Hunt）とRare討伐でだけ手に入る追撃装備群

   既存の固有装備（BOUNTY_UNIQUES等）は Stage/Bounty/Secret 固定の
   「一度だけの報酬」だった。こちらは「倒した相手」に紐づく Chase
   層で、同じアイテムが複数章にまたがって落ちうる。そのため各
   アイテムは「狙える章レンジ」（huntChapters: [min,max]）を持ち、
   stats はアンカー章の新装備曲線（authoredStatRescale適用済み）で
   記述する。効果は「%を積む」ではなく行動を変えるものを優先する。
   ============================================================ */
import { authoredStatRescale } from './chapters.js';

// anchor = stats を較正した章。huntChapters = ドロップ対象となる章
// レンジ（Stageの章番号）。Rare/Roamer/巡回Eliteの撃破抽選で
// 「その章で狙える固有」だけが候補になる。
const u = (def) => {
  const anchor = def.anchor ?? def.huntChapters?.[0] ?? 1;
  return Object.freeze({ ...def, stats: authoredStatRescale(def.stats, anchor) });
};

export const HUNT_UNIQUES = Object.freeze([
  // ---- 早期（Ch2〜9）----
  u({ id:'uq_hunt_bloodmist_knife', name:'血霞の短刃・MIST', slot:'weapon', weaponType:'dagger',
    rarity:'legendary', unique:true, anchor:3, huntChapters:[2,10],
    stats:{ atk:26, spd:6, crit:4 },
    effects:[{ trigger:'onHit', kind:'lifestealLowHp', name:'嗜血', power:.22, hpThreshold:.45 }],
    lore:'霧の中でだけ血を喰らう短刃。追い込まれた時ほど深く吸い付く。',
  }),
  u({ id:'uq_hunt_stormcall_bow', name:'雷鳥の尾羽・GALEQUILL', slot:'weapon', weaponType:'bow',
    rarity:'legendary', unique:true, anchor:5, huntChapters:[3,12],
    stats:{ atk:38, spd:10, crit:9 },
    effects:[{ trigger:'onCrit', kind:'critExtraAttack', name:'残光の追撃', power:.55 }],
    lore:'雷鳥が落とした尾羽を弦に編んだ弓。会心の瞬間、残り火がもう一箭飛ぶ。',
  }),
  u({ id:'uq_hunt_oathbound_pauldron', name:'誓いの肩鎧・OATHWARD', slot:'body',
    rarity:'legendary', unique:true, anchor:4, huntChapters:[2,11],
    stats:{ def:46, hp:80, spd:-6 },
    effects:[{ trigger:'onHurt', kind:'counter', name:'報復', power:.45 }],
    lore:'主を守れなかった騎士の肩鎧。受けた痛みを倍にして返す誓いが残る。',
  }),
  // ---- 中期（Ch8〜20）----
  u({ id:'uq_hunt_thousand_edge', name:'千刃の宝輪・THOUSANDFOLD', slot:'weapon', weaponType:'sword',
    rarity:'legendary', unique:true, anchor:9, huntChapters:[7,17],
    stats:{ atk:120, spd:8 },
    effects:[{ trigger:'onHit', kind:'everyNHits', name:'千刃', id:'uq_hunt_thousand_edge', n:4, power:.8, aoe:true }],
    lore:'四度斬るごとに刃が千に裂ける宝輪。群れの中でこそ真価を発揮する。',
  }),
  u({ id:'uq_hunt_executioner_mask', name:'処刑人の仮面・LAST FACE', slot:'head',
    rarity:'legendary', unique:true, anchor:10, huntChapters:[8,18],
    stats:{ atk:70, crit:8, spd:4 },
    effects:[{ trigger:'passive', kind:'executioner', name:'断罪', power:.5, hpThreshold:.3 },
             { trigger:'passive', kind:'firstStrikeBonus', name:'先見', power:.15 }],
    lore:'断頭台の影で育った仮面。弱った獲物と、出し抜いた相手を見逃さない。',
  }),
  u({ id:'uq_hunt_blight_fang', name:'蝕毒の牙・BLIGHTFANG', slot:'weapon', weaponType:'dagger',
    rarity:'mythic', unique:true, anchor:11, huntChapters:[9,19],
    stats:{ atk:150, spd:12, crit:5 },
    effects:[{ trigger:'onHit', kind:'hitApplyDot', name:'蝕毒', power:.15, dotTurns:3, maxStacks:4 },
             { trigger:'passive', kind:'dotStackDmg', name:'毒心', power:.06 }],
    lore:'獣の牙に染み込んだ百年の毒。毒は浅く、しかし重ねるほど致命的になる。',
  }),
  u({ id:'uq_hunt_starlit_censer', name:'星屑の香炉・STARDUST', slot:'accessory',
    rarity:'mythic', unique:true, anchor:12, huntChapters:[10,20],
    stats:{ mag:90, mp:60, def:30 },
    effects:[{ trigger:'passive', kind:'mpShield', name:'魔導防壁', threshold:.4, power:.3 },
             { trigger:'onSkill', kind:'spellMpRefund', name:'還元の術理', chance:.25, power:.35, spellOnly:true }],
    lore:'燃やした星屑の煙が術者を包む香炉。魔力がある限り、身体は煙の向こう側。',
  }),
  u({ id:'uq_hunt_slayer_sigil', name:'狩人の刻印・QUARRY', slot:'accessory',
    rarity:'legendary', unique:true, anchor:8, huntChapters:[6,18],
    stats:{ atk:55, crit:6 },
    effects:[{ trigger:'passive', kind:'eliteDmg', name:'獣狩り', power:.3 },
             { trigger:'onKill', kind:'healOnKill', name:'喰らいし刃', power:.04 }],
    lore:'強き獲物だけに反応する狩人の印。大物を仕留めるたび、次の獲物への力が満ちる。',
  }),
  // ---- 後期（Ch17〜36）----
  u({ id:'uq_hunt_void_fang', name:'滅界の断牙・VOIDFANG', slot:'weapon', weaponType:'axe',
    rarity:'mythic', unique:true, anchor:18, huntChapters:[16,30],
    stats:{ atk:420, def:-30 },
    effects:[{ trigger:'onKill', kind:'deathNova', name:'滅界の残響', power:.9 }],
    lore:'滅びた世界の欠片を鍛えた斧。命を断つたび、残響が周囲の敵を引き裂く。',
  }),
  u({ id:'uq_hunt_stillwater_lens', name:'止水の鏡・STILLWATER', slot:'accessory',
    rarity:'mythic', unique:true, anchor:20, huntChapters:[17,32],
    stats:{ spd:30, crit:12, mp:50 },
    effects:[{ trigger:'onCrit', kind:'timeStop', name:'止水', duration:2 },
             { trigger:'onCrit', kind:'critSpdBuff', name:'疾風の高揚', power:.12, turns:2 }],
    lore:'映った瞬間だけ時を止める古鏡。会心を重ねるほど、世界が遅く見える。',
  }),
  u({ id:'uq_hunt_lone_wolf_brand', name:'孤狼の烙印・LONEWOLF', slot:'body',
    rarity:'mythic', unique:true, anchor:22, huntChapters:[18,36],
    stats:{ atk:300, hp:-80, def:-20 },
    effects:[{ trigger:'passive', kind:'noRecoveryDmgBonus', name:'孤狼', power:.35 },
             { trigger:'onHit', kind:'lifestealLowHp', name:'嗜血', power:.15, hpThreshold:.35 }],
    lore:'回復を捨てた者だけが纏える烙印。守りを捨て、倒れる寸前まで獣のように噛み付く。',
  }),
  /* Session 7 — 秘密の戦利品。秘密Boss・超再臨の領域からだけ
     届く、新位階（relic）の追撃装備。huntChapters は通常の
     Chase抽選で拾われないよう極狭に絞るか、直接抽選のみにする。 */
  u({ id:'uq_hunt_forgeheart_relay', name:'炉心の中継核・FORGERELAY', slot:'weapon', weaponType:'staff',
    rarity:'relic', unique:true, anchor:22, huntChapters:[22,28],
    stats:{ mag:520, mp:90, spd:14 },
    effects:[{ trigger:'onSkill', kind:'spellMpRefund', name:'炉心還流', chance:.35, power:.45, spellOnly:true },
             { trigger:'passive', kind:'mpShield', name:'機魂防壁', threshold:.35, power:.3 }],
    lore:'炉心回廊の監督機が抱えていた中継核。回した分の魔力が、もう一度炉へ還ってくる。',
  }),
  u({ id:'uq_hunt_unwritten_leaf', name:'未記述の頁・UNWRITTEN LEAF', slot:'accessory',
    rarity:'relic', unique:true, anchor:41, huntChapters:[41,45],
    stats:{ spd:34, crit:14, mp:80, atk:60 },
    effects:[{ trigger:'passive', kind:'firstStrikeBonus', name:'記録の隙間', power:.25 },
             { trigger:'passive', kind:'eliteDmg', name:'記されざる狩り', power:.4 }],
    lore:'どの帳簿にも存在しない頁。めくれば、まだ誰も書いていない場所への道が透けて見える。',
  }),
  u({ id:'uq_hunt_overlord_core', name:'超再臨の心核・OVERLORD', slot:'accessory',
    rarity:'relic', unique:true, anchor:30, huntChapters:[99,99],
    stats:{ hp:160, atk:80, def:40 },
    effects:[{ trigger:'passive', kind:'damageBoost', name:'主の残り火', threshold:.35, power:.25 },
             { trigger:'onHurt', kind:'counter', name:'領域の報復', power:.55 }],
    lore:'超再臨を越えた巣の主の心核。二度の再臨を耐え抜いた意志が、領域そのものを武装化する。',
  }),
]);

const BY_ID = new Map(HUNT_UNIQUES.map(i => [i.id, i]));

export function huntUniqueById(id) { return BY_ID.get(id) || null; }

// その章のStageでドロップしうる固有の候補リスト。
export function huntUniquesForChapter(chapterNum) {
  const n = Math.max(1, Math.floor(Number(chapterNum) || 1));
  return HUNT_UNIQUES.filter(i => {
    const [lo, hi] = i.huntChapters || [1, 99];
    return n >= lo && n <= hi;
  });
}
