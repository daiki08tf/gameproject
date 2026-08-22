/* ============================================================
   武器総数拡張（Blade Vale 2.1）
   8武器種 × 約25本（計約200本）の「武器ベース」データ層。

   既存の武器（wp_sword_n・chN_weapon・chN_named_weapon等）は一切変更・
   削除しない。このファイルは equipment.js の ITEMS へ完全に加算される
   別レイヤーであり、既存セーブ・既存ドロップテーブルへの影響はゼロ。

   レイヤー構成（元指示1番の「武器構造」に対応）：
     ・ベース武器：このファイルの WEAPON_BASES（基礎攻撃・攻撃速度・
       射程相当の武器種比率・属性・implicit＝小さな固定特性）
     ・ランダムAffix：既存の極Affix（state.js の weaponAffix/weaponAffix2）
       をそのまま利用。affixBias でどのステータスが出やすいかだけ調整する
     ・固有効果：エピック以上の effects（既存のtrigger/kind/chance/power
       方式を再利用。state.js の getEquippedEffects() は装備の.effectsを
       スロット問わず拾う既存実装のため、ここに効果を持たせるだけで
       全ての既存パイプライン（覚醒装備のキル数成長も含む）へ自動的に
       乗る）
     ・シリーズ：WEAPON_SERIES（メタデータのみ。装備一覧・図鑑での
       テーマ表示用。防具・転生遺物・Affixとの組み合わせは既存システム
       同士の自然な噛み合わせに委ね、新しい"セット効果計算"は追加しない
       ＝元指示18番の例はあくまで「プレイヤーが自分で組み合わせる」
       ビルドの導線であり、自動発動するセットボーナス機構ではない）

   requiredLevel（元指示19番）：転生（覚醒）で全職業Lvがリセットされる
   ため、現在の職業レベル（state.currentLevel）でゲートする。既存装備は
   requiredLevelを持たないため影響なし（undefined→ゲート無し）。
   ============================================================ */
// equipment.js からはimportしない：equipment.js側がこのファイルの
// WEAPON_CODEX_ITEMS/BOSS_WEAPON_ITEMSをITEMSへ統合するため、
// 逆方向にimportすると循環importになってしまう。WEAPON_TYPESは
// 依存のないweaponTypes.jsへ分離済みなのでそちらから、レアリティ倍率は
// equipment.jsのRARITYではなく元のEQUIPMENT_LAYER.RARITY_MULTを直接使う。
import { WEAPON_TYPES } from './weaponTypes.js';
import { EQUIPMENT_LAYER, WEAPON_CODEX_LAYER } from './balance.js';

// ---------------------------------------------------------
// レベル倍率（章番号ではなく武器自身のrequiredLevelを軸にスケーリングする。
// 章に紐付かない「どこでも拾いうる」武器のため）
// ---------------------------------------------------------
function levelMult(level) {
  return WEAPON_CODEX_LAYER.LEVEL_POWER_BASE + level * WEAPON_CODEX_LAYER.LEVEL_POWER_PER_LEVEL;
}

function roundWeaponStats(stats) {
  const out = {};
  for (const k in stats) out[k] = Math.round(stats[k] * 100) / 100;
  return out;
}

// raw: { id, name, type, rarity, req, mods, note, element, bias, series,
//        effects, isBossWeapon, abyssMinDepth, dropTags }
function buildWeaponItem(raw) {
  const wt = WEAPON_TYPES[raw.type];
  const power = EQUIPMENT_LAYER.BASE_POWER.weapon * EQUIPMENT_LAYER.RARITY_MULT[raw.rarity] * levelMult(raw.req);
  const mods = raw.mods || {};
  const stats = {
    atk: wt.atk * power * (1 + (mods.atk || 0)),
    mag: wt.mag * power * (1 + (mods.mag || 0)),
    spd: wt.spd * power * (1 + (mods.spd || 0)),
    crit: wt.crit * power * (1 + (mods.crit || 0)),
  };
  if (mods.armorPen) stats.armorPen = mods.armorPen;
  if (mods.evasion) stats.evasion = mods.evasion;
  if (mods.def) stats.def = wt.atk * 0 + power * 0.15 * mods.def; // 錫杖等、防御寄りimplicit用の小さな加算枠

  return {
    id: raw.id,
    name: raw.name,
    slot: 'weapon',
    weaponType: raw.type,
    rarity: raw.rarity,
    stats: roundWeaponStats(stats),
    requiredLevel: raw.req,
    implicit: raw.note ? { desc: raw.note } : undefined,
    element: raw.element || null,
    affixBias: raw.bias || [],
    effects: raw.effects || undefined,
    series: raw.series || null,
    dropTags: raw.dropTags || (raw.element ? [raw.element] : []),
    isBossWeapon: !!raw.isBossWeapon,
    abyssMinDepth: raw.abyssMinDepth || null,
    isCodexWeapon: true, // 武器図鑑（新規200本）に属するかどうかの目印。既存装備には付かない
  };
}

// ============================================================
// 剣（sword）：バランス・会心・連撃
// ============================================================
const SWORD_RAW = [
  // ノーマル
  { id: 'sword_n1', name: '古びた剣', type: 'sword', rarity: 'normal', req: 1, mods: {} },
  { id: 'sword_n2', name: '鉄の剣', type: 'sword', rarity: 'normal', req: 3, mods: { atk: 0.10 }, note: '基礎攻撃が高め' },
  { id: 'sword_n3', name: '鋼の剣', type: 'sword', rarity: 'normal', req: 6, mods: { atk: 0.05, crit: 0.05 }, note: '扱いやすい万能型' },
  { id: 'sword_n4', name: '傭兵の剣', type: 'sword', rarity: 'normal', req: 10, mods: { spd: 0.05 }, note: '手に馴染む軽さ' },
  { id: 'sword_n5', name: '騎士の剣', type: 'sword', rarity: 'normal', req: 14, mods: { atk: 0.06, spd: -0.03 }, note: '重厚な一撃' },
  // レア
  { id: 'sword_r1', name: '烈火の剣', type: 'sword', rarity: 'rare', req: 10, mods: { atk: 0.08 }, element: 'fire', bias: ['atk'], note: '炎をまとう刃' },
  { id: 'sword_r2', name: '氷晶の剣', type: 'sword', rarity: 'rare', req: 14, mods: { crit: 0.05 }, element: 'ice', bias: ['crit'], note: '冷気を宿す刃' },
  { id: 'sword_r3', name: '疾風の剣', type: 'sword', rarity: 'rare', req: 19, mods: { spd: 0.05 }, element: 'wind', bias: ['spd'], note: '攻撃速度+5%' },
  { id: 'sword_r4', name: '雷光の剣', type: 'sword', rarity: 'rare', req: 24, mods: { crit: 0.03 }, element: 'lightning', bias: ['crit', 'spd'], note: '会心率+3%' },
  { id: 'sword_r5', name: '黒鉄の剣', type: 'sword', rarity: 'rare', req: 29, mods: { spd: -0.05, atk: 0.10 }, note: '攻撃速度-5%、攻撃力+10%' },
  { id: 'sword_r6', name: '血吸いの剣', type: 'sword', rarity: 'rare', req: 34, mods: {}, bias: ['hp', 'spd'], note: 'HP吸収+2%',
    effects: [{ name: '血吸いの一撃', desc: '与えたダメージの2%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.02 }] },
  // エピック
  { id: 'sword_agni', name: '紅蓮剣アグニ', type: 'sword', rarity: 'epic', req: 20, element: 'fire', mods: { atk: 0.04 },
    effects: [{ name: '炎爆発', desc: '通常攻撃5回ごとに周囲へ炎の爆発（ATKの120%）', trigger: 'onHit', kind: 'everyNHits', id: 'sword_agni_burst', n: 5, power: 1.2, aoe: true, radius: 90 }] },
  { id: 'sword_frost', name: '氷刃フロスト', type: 'sword', rarity: 'epic', req: 26, element: 'ice',
    effects: [{ name: '凍える一撃', desc: '命中時25%で敵の移動速度を3秒間30%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.3, duration: 3, stat: 'spd' }] },
  { id: 'sword_raikiri', name: '迅雷剣ライキリ', type: 'sword', rarity: 'epic', req: 32, element: 'lightning', mods: { crit: 0.04 },
    effects: [{ name: '雷撃', desc: '会心発生時15%でATKの40%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.15, power: 0.4 }] },
  { id: 'sword_noctis', name: '魔剣ノクティス', type: 'sword', rarity: 'epic', req: 38, element: 'dark',
    effects: [{ name: '夜享の代償', desc: '最大HP-10%の代わりに与ダメージ+15%', trigger: 'passive', kind: 'glassCannon', hpMult: -0.1, dmgMult: 0.15 }] },
  { id: 'sword_luminous', name: '聖剣ルミナス', type: 'sword', rarity: 'epic', req: 44, element: 'light',
    effects: [{ name: '聖なる加護', desc: '被弾時20%でHPの8%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.2, power: 0.08 }] },
  { id: 'sword_kagerou', name: '影縫剣カゲロウ', type: 'sword', rarity: 'epic', req: 49, element: 'dark',
    effects: [{ name: '影縫いの反撃', desc: '被弾時35%でATKの60%の反撃ダメージ', trigger: 'onHurt', kind: 'counter', chance: 0.35, power: 0.6 }] },
  // レジェンド
  { id: 'sword_balmung', name: '竜殺剣バルムンク', type: 'sword', rarity: 'legendary', req: 35, series: 'dragonHunter',
    effects: [
      { name: '竜殺しの誓い', desc: 'Bossへの与ダメージ+20%', trigger: 'passive', kind: 'bossDmg', power: 0.2 },
      { name: '討伐の高揚', desc: 'Boss撃破時、15秒間ATK+25%', trigger: 'passive', kind: 'bossSlayerBuff', power: 0.25, duration: 15 },
    ] },
  { id: 'sword_arcadia', name: '天剣アルカディア', type: 'sword', rarity: 'legendary', req: 45, element: 'light',
    effects: [{ name: '聖なる追撃', desc: '会心発生時30%でATKの50%の追加聖ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.3, power: 0.5 }] },
  { id: 'sword_infernal', name: '獄炎剣インフェルノ', type: 'sword', rarity: 'legendary', req: 55, element: 'fire',
    effects: [{ name: '業炎の刻印', desc: '命中時40%で炎の刻印を付与（最大5重複、1秒毎にATKの15%×重複数のダメージ）', trigger: 'onHit', kind: 'burnStack', chance: 0.4, power: 0.15, maxStacks: 5, tickInterval: 1, duration: 4 }] },
  { id: 'sword_hades', name: '冥王剣ハデス', type: 'sword', rarity: 'legendary', req: 65, element: 'dark', series: 'underworld',
    effects: [{ name: '冥府の余波', desc: '敵撃破時、周囲の敵にATKの60%の闇ダメージ', trigger: 'onKill', kind: 'deathNova', power: 0.6, radius: 100 }] },
  { id: 'sword_asterion', name: '星断剣アステリオン', type: 'sword', rarity: 'legendary', req: 70, element: 'light', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [{ name: '星断の一閃', desc: '会心ダメージ倍率がさらに+20%上昇する', trigger: 'passive', kind: 'critDamageBoost', power: 0.2 }] },
  // 神話
  { id: 'sword_astra', name: '神断剣アストラ', type: 'sword', rarity: 'mythic', req: 65, element: 'light',
    effects: [{ name: '神断', desc: '通常攻撃5回ごとに、周囲の敵へATKの300%の光の断撃', trigger: 'onHit', kind: 'everyNHits', id: 'sword_astra_judgement', n: 5, power: 3.0, aoe: true, radius: 140 }] },
  { id: 'sword_chronos', name: '時空剣クロノス', type: 'sword', rarity: 'mythic', req: 78, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [{ name: '刹那凍結', desc: '会心発生時12%で敵を2.5秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.12, duration: 2.5 }] },
  { id: 'sword_exceed', name: '創世剣エクシード', type: 'sword', rarity: 'mythic', req: 90, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [{ name: '創世の連環', desc: '通常攻撃・スキル・必殺技をそれぞれ1回ずつ成立させると、周囲へ全属性の大爆発（ATKの250%）が発生する', trigger: 'passive', kind: 'actionDiversityBurst', power: 2.5, radius: 160 }] },
];

// ============================================================
// 斧（axe）：高一撃・防御貫通・低攻撃速度
// ============================================================
const AXE_RAW = [
  { id: 'axe_n1', name: '木こり斧', type: 'axe', rarity: 'normal', req: 1, mods: { atk: 0.05 } },
  { id: 'axe_n2', name: '鉄の斧', type: 'axe', rarity: 'normal', req: 3, mods: {} },
  { id: 'axe_n3', name: '鋼の斧', type: 'axe', rarity: 'normal', req: 6, mods: { atk: 0.08 } },
  { id: 'axe_n4', name: '戦斧', type: 'axe', rarity: 'normal', req: 10, mods: { spd: -0.05, atk: 0.1 }, note: '重く力強い一撃' },
  { id: 'axe_n5', name: '重戦斧', type: 'axe', rarity: 'normal', req: 14, mods: { armorPen: 0.05, spd: -0.08 }, note: '防御貫通+5%、攻撃速度-8%' },
  { id: 'axe_r1', name: '岩砕きの斧', type: 'axe', rarity: 'rare', req: 10, mods: { armorPen: 0.08 }, bias: ['atk'], note: '防御貫通+8%' },
  { id: 'axe_r2', name: '烈火の斧', type: 'axe', rarity: 'rare', req: 14, mods: { atk: 0.05 }, element: 'fire' },
  { id: 'axe_r3', name: '雷鳴の斧', type: 'axe', rarity: 'rare', req: 19, mods: { crit: 0.05 }, element: 'lightning' },
  { id: 'axe_r4', name: '血戦の斧', type: 'axe', rarity: 'rare', req: 24, element: 'dark', bias: ['hp'],
    effects: [{ name: '血戦の一撃', desc: '与えたダメージの2%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.02 }] },
  { id: 'axe_r5', name: '巨人の斧', type: 'axe', rarity: 'rare', req: 29, mods: { atk: 0.12, spd: -0.1 } },
  { id: 'axe_r6', name: '狂戦士の斧', type: 'axe', rarity: 'rare', req: 34, mods: { atk: 0.08 }, bias: ['atk', 'hp'] },
  { id: 'axe_gaia', name: '断岩斧ガイア', type: 'axe', rarity: 'epic', req: 20, mods: { armorPen: 0.15 }, note: '防御貫通+15%',
    effects: [{ name: '断岩の一撃', desc: '命中時25%で敵の防御力を4秒間20%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.2, duration: 4, stat: 'def' }] },
  { id: 'axe_ignas', name: '炎獄斧イグナス', type: 'axe', rarity: 'epic', req: 26, element: 'fire',
    effects: [{ name: '炎獄の刻印', desc: '命中時30%で炎の刻印を付与（最大3重複、1秒毎にATKの12%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.3, power: 0.12, maxStacks: 3, tickInterval: 1, duration: 3 }] },
  { id: 'axe_thor', name: '雷帝斧トール', type: 'axe', rarity: 'epic', req: 32, element: 'lightning', series: 'thunder',
    effects: [{ name: '雷帝の一撃', desc: '会心発生時18%でATKの45%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.18, power: 0.45 }] },
  { id: 'axe_berserk', name: '狂刃斧ベルセルク', type: 'axe', rarity: 'epic', req: 38,
    effects: [{ name: '狂刃の代償', desc: '最大HP-8%の代わりに与ダメージ+12%', trigger: 'passive', kind: 'glassCannon', hpMult: -0.08, dmgMult: 0.12 }] },
  { id: 'axe_behemoth', name: '獣王斧ベヒモス', type: 'axe', rarity: 'epic', req: 44,
    effects: [{ name: '獣王の一撃', desc: '命中時25%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.25, duration: 4, stat: 'def' }] },
  { id: 'axe_mordred', name: '黒斧モルドレッド', type: 'axe', rarity: 'epic', req: 49, element: 'dark',
    effects: [{ name: '黒斧の反撃', desc: '被弾時30%でATKの55%の反撃ダメージ', trigger: 'onHurt', kind: 'counter', chance: 0.3, power: 0.55 }] },
  { id: 'axe_gargantua', name: '巨神斧ガルガン', type: 'axe', rarity: 'legendary', req: 35, mods: { armorPen: 0.2 }, note: '防御貫通+20%',
    effects: [{ name: '巨神の重撃', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 }] },
  { id: 'axe_barbaros', name: '獄王斧バルバロス', type: 'axe', rarity: 'legendary', req: 45, element: 'fire', series: 'underworld',
    effects: [{ name: '獄王の刻印', desc: '命中時45%で炎の刻印を付与（最大6重複、1秒毎にATKの18%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.45, power: 0.18, maxStacks: 6, tickInterval: 1, duration: 4 }] },
  { id: 'axe_abaddon', name: '魔王斧アバドン', type: 'axe', rarity: 'legendary', req: 55, element: 'dark',
    effects: [{ name: '断罪の一撃', desc: 'Boss残HPが30%以下の間、与ダメージ+50%', trigger: 'passive', kind: 'executioner', hpThreshold: 0.3, power: 0.5 }] },
  { id: 'axe_mjolnir', name: '天雷斧ミョルニル', type: 'axe', rarity: 'legendary', req: 65, element: 'lightning', series: 'thunder',
    effects: [{ name: '天雷', desc: '会心発生時25%でATKの60%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.25, power: 0.6 }] },
  { id: 'axe_fafnir', name: '竜断斧ファフニール', type: 'axe', rarity: 'legendary', req: 70, series: 'dragonHunter', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [
      { name: '竜断の誓い', desc: 'Bossへの与ダメージ+20%', trigger: 'passive', kind: 'bossDmg', power: 0.2 },
      { name: '竜断の高揚', desc: 'Boss撃破時、15秒間ATK+25%', trigger: 'passive', kind: 'bossSlayerBuff', power: 0.25, duration: 15 },
    ] },
  { id: 'axe_ragnarok', name: '終焉斧ラグナロク', type: 'axe', rarity: 'mythic', req: 65, mods: { spd: -0.15 }, note: '攻撃速度-15%の代わりに絶大な与ダメージ',
    effects: [
      { name: '終焉の代償', desc: '最大HP-0%の代わりに与ダメージ+35%', trigger: 'passive', kind: 'glassCannon', hpMult: 0, dmgMult: 0.35 },
      { name: '断末魔の一撃', desc: 'Boss残HPが30%以下の間、与ダメージ+50%', trigger: 'passive', kind: 'executioner', hpThreshold: 0.3, power: 0.5 },
    ] },
  { id: 'axe_titan', name: '神砕斧タイタン', type: 'axe', rarity: 'mythic', req: 78, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [
      { name: '神砕', desc: '通常攻撃4回ごとに、周囲の敵へATKの260%の破砕ダメージ', trigger: 'onHit', kind: 'everyNHits', id: 'axe_titan_smash', n: 4, power: 2.6, aoe: true, radius: 120 },
      { name: '神砕の誓い', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 },
    ] },
  { id: 'axe_chaos', name: '混沌斧カオス', type: 'axe', rarity: 'mythic', req: 90, element: 'dark', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '混沌の爆散', desc: '敵撃破時、周囲の敵にATKの120%の闇ダメージ', trigger: 'onKill', kind: 'deathNova', power: 1.2, radius: 180 },
      { name: '混沌の侵蝕', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' },
    ] },
];

// ============================================================
// 杖（staff）：属性魔法・スキル威力
// ============================================================
const STAFF_RAW = [
  { id: 'staff_n1', name: '木の杖', type: 'staff', rarity: 'normal', req: 1, mods: {} },
  { id: 'staff_n2', name: '樫の杖', type: 'staff', rarity: 'normal', req: 3, mods: { mag: 0.05 } },
  { id: 'staff_n3', name: '魔術師の杖', type: 'staff', rarity: 'normal', req: 6, mods: { mag: 0.08 } },
  { id: 'staff_n4', name: '水晶の杖', type: 'staff', rarity: 'normal', req: 10, mods: { mag: 0.05, crit: 0.05 } },
  { id: 'staff_n5', name: '魔導杖', type: 'staff', rarity: 'normal', req: 14, mods: { mag: 0.1 } },
  { id: 'staff_r1', name: '炎の杖', type: 'staff', rarity: 'rare', req: 10, mods: { mag: 0.05 }, element: 'fire' },
  { id: 'staff_r2', name: '氷の杖', type: 'staff', rarity: 'rare', req: 14, mods: { mag: 0.05 }, element: 'ice' },
  { id: 'staff_r3', name: '雷の杖', type: 'staff', rarity: 'rare', req: 19, mods: { crit: 0.05 }, element: 'lightning' },
  { id: 'staff_r4', name: '風の杖', type: 'staff', rarity: 'rare', req: 24, mods: { spd: 0.05 }, element: 'wind' },
  { id: 'staff_r5', name: '光の杖', type: 'staff', rarity: 'rare', req: 29, mods: { mag: 0.06 }, element: 'light' },
  { id: 'staff_r6', name: '闇の杖', type: 'staff', rarity: 'rare', req: 34, element: 'dark',
    effects: [{ name: '闇の呪縛', desc: '命中時20%で敵の防御力を3秒間15%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.2, power: 0.15, duration: 3, stat: 'def' }] },
  { id: 'staff_ignis', name: '炎杖イグニス', type: 'staff', rarity: 'epic', req: 20, element: 'fire',
    effects: [{ name: '業火の刻印', desc: '命中時30%で炎の刻印を付与（最大3重複、1秒毎にATKの10%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.3, power: 0.10, maxStacks: 3, tickInterval: 1, duration: 3 }] },
  { id: 'staff_glacia', name: '氷杖グレイシア', type: 'staff', rarity: 'epic', req: 26, element: 'ice',
    effects: [{ name: '氷結の一撃', desc: '命中時25%で敵の移動速度を3秒間30%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.3, duration: 3, stat: 'spd' }] },
  { id: 'staff_tempest', name: '雷杖テンペスト', type: 'staff', rarity: 'epic', req: 32, element: 'lightning',
    effects: [{ name: '雷杖の一撃', desc: '会心発生時18%でATKの45%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.18, power: 0.45 }] },
  { id: 'staff_astria', name: '星杖アストリア', type: 'staff', rarity: 'epic', req: 38, element: 'light',
    effects: [{ name: '星の加護', desc: '毎秒、最大HPの1.5%を回復する', trigger: 'passive', kind: 'regen', power: 0.015 }] },
  { id: 'staff_nocturne', name: '闇杖ノクターン', type: 'staff', rarity: 'epic', req: 44, element: 'dark',
    effects: [{ name: '闇杖の呪縛', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' }] },
  { id: 'staff_luxion', name: '聖杖ルクシオン', type: 'staff', rarity: 'epic', req: 49, element: 'light',
    effects: [{ name: '聖杖の加護', desc: '被弾時25%でHPの10%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.25, power: 0.1 }] },
  { id: 'staff_asteria', name: '星詠杖アステリア', type: 'staff', rarity: 'legendary', req: 35, element: 'light',
    effects: [
      { name: '星詠みの加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
      { name: '星詠みの一閃', desc: '会心ダメージ倍率がさらに+15%上昇する', trigger: 'passive', kind: 'critDamageBoost', power: 0.15 },
    ] },
  { id: 'staff_solomon', name: '魔導王杖ソロモン', type: 'staff', rarity: 'legendary', req: 45,
    effects: [{ name: '王の裁き', desc: '通常攻撃5回ごとに、周囲の敵へATKの200%の魔法爆発', trigger: 'onHit', kind: 'everyNHits', id: 'staff_solomon_judgement', n: 5, power: 2.0, aoe: true, radius: 110 }] },
  { id: 'staff_hecate', name: '冥界杖ヘカーテ', type: 'staff', rarity: 'legendary', req: 55, element: 'dark', series: 'underworld',
    effects: [{ name: '冥界の呪詛', desc: '命中時40%で呪詛を付与（最大5重複、1秒毎にATKの15%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.4, power: 0.15, maxStacks: 5, tickInterval: 1, duration: 4 }] },
  { id: 'staff_zeus', name: '天雷杖ゼウス', type: 'staff', rarity: 'legendary', req: 65, element: 'lightning', series: 'thunder',
    effects: [{ name: '天雷の裁き', desc: '会心発生時28%でATKの65%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.28, power: 0.65 }] },
  { id: 'staff_oberon', name: '精霊王杖オベロン', type: 'staff', rarity: 'legendary', req: 70, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [
      { name: '精霊王の加護', desc: '毎秒、最大HPの2.5%を回復する', trigger: 'passive', kind: 'regen', power: 0.025 },
      { name: '精霊王の裁き', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 },
    ] },
  { id: 'staff_aether', name: '創世杖エーテル', type: 'staff', rarity: 'mythic', req: 65,
    effects: [{ name: '創世の共鳴', desc: '通常攻撃・スキル・必殺技をそれぞれ1回ずつ成立させると、周囲へ大魔法爆発（ATKの230%）が発生する', trigger: 'passive', kind: 'actionDiversityBurst', power: 2.3, radius: 150 }] },
  { id: 'staff_akasha', name: '根源杖アカシャ', type: 'staff', rarity: 'mythic', req: 78, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [{ name: '根源の裁き', desc: '通常攻撃4回ごとに、周囲の敵へATKの270%の魔法爆発', trigger: 'onHit', kind: 'everyNHits', id: 'staff_akasha_burst', n: 4, power: 2.7, aoe: true, radius: 130 }] },
  { id: 'staff_sephirot', name: '神界杖セフィロト', type: 'staff', rarity: 'mythic', req: 90, element: 'light', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '神界凍結', desc: '会心発生時15%で敵を3秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.15, duration: 3 },
      { name: '神界の加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
    ] },
];

// ============================================================
// 弓（bow）：遠距離・会心・貫通・高速攻撃
// ============================================================
const BOW_RAW = [
  { id: 'bow_n1', name: '狩人の弓', type: 'bow', rarity: 'normal', req: 1, mods: {} },
  { id: 'bow_n2', name: '短弓', type: 'bow', rarity: 'normal', req: 3, mods: { spd: 0.08, atk: -0.05 }, note: '速射性が高い' },
  { id: 'bow_n3', name: '長弓', type: 'bow', rarity: 'normal', req: 6, mods: { atk: 0.08, spd: -0.05 }, note: '一射が重い' },
  { id: 'bow_n4', name: '複合弓', type: 'bow', rarity: 'normal', req: 10, mods: { atk: 0.05, crit: 0.05 } },
  { id: 'bow_n5', name: '軍用弓', type: 'bow', rarity: 'normal', req: 14, mods: { atk: 0.1 } },
  { id: 'bow_r1', name: '疾風の弓', type: 'bow', rarity: 'rare', req: 10, mods: { spd: 0.06 }, element: 'wind' },
  { id: 'bow_r2', name: '火矢の弓', type: 'bow', rarity: 'rare', req: 14, mods: { atk: 0.05 }, element: 'fire' },
  { id: 'bow_r3', name: '氷牙の弓', type: 'bow', rarity: 'rare', req: 19, mods: { crit: 0.04 }, element: 'ice' },
  { id: 'bow_r4', name: '雷光の弓', type: 'bow', rarity: 'rare', req: 24, mods: { crit: 0.05 }, element: 'lightning' },
  { id: 'bow_r5', name: '鷹目の弓', type: 'bow', rarity: 'rare', req: 29, mods: { crit: 0.08 }, bias: ['crit'] },
  { id: 'bow_r6', name: '貫通の弓', type: 'bow', rarity: 'rare', req: 34, mods: { armorPen: 0.06 }, note: '防御貫通+6%' },
  { id: 'bow_sylphid', name: '疾風弓シルフィード', type: 'bow', rarity: 'epic', req: 20, element: 'wind', mods: { spd: 0.05 },
    effects: [{ name: '疾風の一矢', desc: '通常攻撃6回ごとに、周囲の敵へATKの110%の風撃', trigger: 'onHit', kind: 'everyNHits', id: 'bow_sylphid_gust', n: 6, power: 1.1, aoe: true, radius: 80 }] },
  { id: 'bow_phoenix', name: '炎弓フェニクス', type: 'bow', rarity: 'epic', req: 26, element: 'fire',
    effects: [{ name: '不死鳥の矢', desc: '命中時30%で炎の刻印を付与（最大3重複、1秒毎にATKの12%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.3, power: 0.12, maxStacks: 3, tickInterval: 1, duration: 3 }] },
  { id: 'bow_fenrir', name: '氷弓フェンリル', type: 'bow', rarity: 'epic', req: 32, element: 'ice',
    effects: [{ name: '氷牙の一矢', desc: '命中時25%で敵の移動速度を3秒間30%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.3, duration: 3, stat: 'spd' }] },
  { id: 'bow_raijin', name: '雷弓ライジン', type: 'bow', rarity: 'epic', req: 38, element: 'lightning', series: 'thunder',
    effects: [{ name: '雷神の一矢', desc: '会心発生時18%でATKの45%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.18, power: 0.45 }] },
  { id: 'bow_nox', name: '魔弓ノクス', type: 'bow', rarity: 'epic', req: 44, element: 'dark',
    effects: [{ name: '魔矢の呪縛', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' }] },
  { id: 'bow_arteon', name: '狩神弓アルテオン', type: 'bow', rarity: 'epic', req: 49, series: 'dragonHunter',
    effects: [{ name: '狩神の一矢', desc: 'Bossへの与ダメージ+12%', trigger: 'passive', kind: 'bossDmg', power: 0.12 }] },
  { id: 'bow_artemis', name: '月影弓アルテミス', type: 'bow', rarity: 'legendary', req: 35, element: 'light',
    effects: [{ name: '月影の一閃', desc: '会心ダメージ倍率がさらに+18%上昇する', trigger: 'passive', kind: 'critDamageBoost', power: 0.18 }] },
  { id: 'bow_apollo', name: '竜狩弓アポロン', type: 'bow', rarity: 'legendary', req: 45, series: 'dragonHunter',
    effects: [
      { name: '竜狩りの誓い', desc: 'Bossへの与ダメージ+20%', trigger: 'passive', kind: 'bossDmg', power: 0.2 },
      { name: '竜狩りの高揚', desc: 'Boss撃破時、15秒間ATK+25%', trigger: 'passive', kind: 'bossSlayerBuff', power: 0.25, duration: 15 },
    ] },
  { id: 'bow_garuda', name: '天翔弓ガルーダ', type: 'bow', rarity: 'legendary', req: 55, element: 'wind', mods: { spd: 0.06 },
    effects: [{ name: '天翔の一矢', desc: '通常攻撃6回ごとに、周囲の敵へATKの180%の風撃', trigger: 'onHit', kind: 'everyNHits', id: 'bow_garuda_gust', n: 6, power: 1.8, aoe: true, radius: 100 }] },
  { id: 'bow_orion', name: '星穿弓オリオン', type: 'bow', rarity: 'legendary', req: 65,
    effects: [{ name: '星穿ちの矢', desc: '通常攻撃5回ごとに、周囲の敵へATKの200%の光撃', trigger: 'onHit', kind: 'everyNHits', id: 'bow_orion_pierce', n: 5, power: 2.0, aoe: true, radius: 110 }] },
  { id: 'bow_azazel', name: '魔神弓アザゼル', type: 'bow', rarity: 'legendary', req: 70, element: 'dark', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [{ name: '魔神の呪矢', desc: '命中時45%で呪詛を付与（最大5重複、1秒毎にATKの16%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.45, power: 0.16, maxStacks: 5, tickInterval: 1, duration: 4 }] },
  { id: 'bow_uranus', name: '天穿弓ウラノス', type: 'bow', rarity: 'mythic', req: 65,
    effects: [{ name: '天穿ち', desc: '通常攻撃・スキル・必殺技をそれぞれ1回ずつ成立させると、周囲へ光の大爆発（ATKの240%）が発生する', trigger: 'passive', kind: 'actionDiversityBurst', power: 2.4, radius: 150 }] },
  { id: 'bow_artemia', name: '神狩弓アルテミア', type: 'bow', rarity: 'mythic', req: 78, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [
      { name: '神狩りの一閃', desc: '会心発生時12%で敵を2.5秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.12, duration: 2.5 },
      { name: '神狩りの誓い', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 },
    ] },
  { id: 'bow_cosmos', name: '星界弓コスモス', type: 'bow', rarity: 'mythic', req: 90, series: 'starfall', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '星界の爆散', desc: '敵撃破時、周囲の敵にATKの110%の光ダメージ', trigger: 'onKill', kind: 'deathNova', power: 1.1, radius: 170 },
      { name: '星界の呪縛', desc: '命中時30%で敵の移動速度を4秒間30%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.3, duration: 4, stat: 'spd' },
    ] },
];

// ============================================================
// 短剣（dagger）：高速・会心・毒・回避
// ============================================================
const DAGGER_RAW = [
  { id: 'dagger_n1', name: '銅の短剣', type: 'dagger', rarity: 'normal', req: 1, mods: {} },
  { id: 'dagger_n2', name: '鉄の短剣', type: 'dagger', rarity: 'normal', req: 3, mods: { spd: 0.05 } },
  { id: 'dagger_n3', name: '狩人の短剣', type: 'dagger', rarity: 'normal', req: 6, mods: { crit: 0.05 } },
  { id: 'dagger_n4', name: '盗賊の短剣', type: 'dagger', rarity: 'normal', req: 10, mods: { spd: 0.05, evasion: 0.02 }, note: '回避+2%' },
  { id: 'dagger_n5', name: '暗殺刀', type: 'dagger', rarity: 'normal', req: 14, mods: { crit: 0.08, atk: 0.05 } },
  { id: 'dagger_r1', name: '毒牙の短剣', type: 'dagger', rarity: 'rare', req: 10, element: 'poison',
    effects: [{ name: '毒牙', desc: '命中時25%で毒を付与（最大2重複、1秒毎にATKの8%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.25, power: 0.08, maxStacks: 2, tickInterval: 1, duration: 3 }] },
  { id: 'dagger_r2', name: '影縫いの短剣', type: 'dagger', rarity: 'rare', req: 14, mods: { evasion: 0.03 }, element: 'dark', note: '回避+3%' },
  { id: 'dagger_r3', name: '雷刃', type: 'dagger', rarity: 'rare', req: 19, mods: { crit: 0.05 }, element: 'lightning' },
  { id: 'dagger_r4', name: '血刃', type: 'dagger', rarity: 'rare', req: 24, element: 'dark', bias: ['hp'],
    effects: [{ name: '血刃の一撃', desc: '与えたダメージの2%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.02 }] },
  { id: 'dagger_r5', name: '風切りの短剣', type: 'dagger', rarity: 'rare', req: 29, mods: { spd: 0.08, evasion: 0.02 }, element: 'wind', note: '回避+2%' },
  { id: 'dagger_r6', name: '闇討ちの短剣', type: 'dagger', rarity: 'rare', req: 34, mods: { crit: 0.06 }, element: 'dark' },
  { id: 'dagger_venom', name: '毒牙ヴェノム', type: 'dagger', rarity: 'epic', req: 20, element: 'poison',
    effects: [{ name: '猛毒', desc: '命中時40%で毒を付与（最大5重複、1秒毎にATKの14%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.4, power: 0.14, maxStacks: 5, tickInterval: 1, duration: 4 }] },
  { id: 'dagger_kagerou', name: '影刃カゲロウ', type: 'dagger', rarity: 'epic', req: 26, mods: { evasion: 0.05 }, element: 'dark', note: '回避+5%',
    effects: [{ name: '影の反撃', desc: '被弾時30%でATKの55%の反撃ダメージ', trigger: 'onHurt', kind: 'counter', chance: 0.3, power: 0.55 }] },
  { id: 'dagger_raiga', name: '雷牙ライトニング', type: 'dagger', rarity: 'epic', req: 32, element: 'lightning',
    effects: [{ name: '雷牙の一撃', desc: '会心発生時18%でATKの45%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.18, power: 0.45 }] },
  { id: 'dagger_blood', name: '血刃ブラッド', type: 'dagger', rarity: 'epic', req: 38, element: 'dark',
    effects: [{ name: '血刃の代償', desc: '最大HP-8%の代わりに与ダメージ+12%', trigger: 'passive', kind: 'glassCannon', hpMult: -0.08, dmgMult: 0.12 }] },
  { id: 'dagger_noctis', name: '魔刃ノクティス', type: 'dagger', rarity: 'epic', req: 44, element: 'dark',
    effects: [{ name: '魔刃の呪縛', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' }] },
  { id: 'dagger_selene', name: '月牙セレーネ', type: 'dagger', rarity: 'epic', req: 49, element: 'light',
    effects: [{ name: '月牙の一閃', desc: '会心ダメージ倍率がさらに+12%上昇する', trigger: 'passive', kind: 'critDamageBoost', power: 0.12 }] },
  { id: 'dagger_noxking', name: '夜王刃ノクス', type: 'dagger', rarity: 'legendary', req: 35, mods: { evasion: 0.06 }, element: 'dark', note: '回避+6%',
    effects: [{ name: '夜王の一撃', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 }] },
  { id: 'dagger_hassan', name: '暗殺王刃ハサン', type: 'dagger', rarity: 'legendary', req: 45,
    effects: [{ name: '暗殺の極意', desc: '通常攻撃3回ごとに、対象へATKの260%の必殺の一撃', trigger: 'onHit', kind: 'everyNHits', id: 'dagger_hassan_assassinate', n: 3, power: 2.6, aoe: false }] },
  { id: 'dagger_belial', name: '魔神刃ベリアル', type: 'dagger', rarity: 'legendary', req: 55, element: 'dark',
    effects: [{ name: '魔神の呪詛', desc: '命中時45%で毒を付与（最大6重複、1秒毎にATKの15%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.45, power: 0.15, maxStacks: 6, tickInterval: 1, duration: 4 }] },
  { id: 'dagger_carmilla', name: '血王刃カーミラ', type: 'dagger', rarity: 'legendary', req: 65, element: 'dark', series: 'bloodking',
    effects: [
      { name: '血王の口づけ', desc: '与えたダメージの6%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.06 },
      { name: '血王の代償', desc: '最大HP-10%の代わりに与ダメージ+15%', trigger: 'passive', kind: 'glassCannon', hpMult: -0.1, dmgMult: 0.15 },
    ] },
  { id: 'dagger_zephyr', name: '空裂刃ゼファー', type: 'dagger', rarity: 'legendary', req: 70, mods: { evasion: 0.08, spd: 0.08 }, element: 'wind', note: '回避+8%', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [{ name: '空裂の連撃', desc: '通常攻撃4回ごとに、周囲の敵へATKの200%の風撃', trigger: 'onHit', kind: 'everyNHits', id: 'dagger_zephyr_gust', n: 4, power: 2.0, aoe: true, radius: 90 }] },
  { id: 'dagger_kairos', name: '神速刃カイロス', type: 'dagger', rarity: 'mythic', req: 65,
    effects: [
      { name: '神速の刻', desc: '会心発生時14%で敵を2.5秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.14, duration: 2.5 },
      { name: '神速の一閃', desc: '会心ダメージ倍率がさらに+15%上昇する', trigger: 'passive', kind: 'critDamageBoost', power: 0.15 },
    ] },
  { id: 'dagger_murakumo', name: '無影刃ムラクモ', type: 'dagger', rarity: 'mythic', req: 78, mods: { evasion: 0.1 }, note: '回避+10%', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [{ name: '無影の連撃', desc: '通常攻撃3回ごとに、対象へATKの300%の必殺の一撃', trigger: 'onHit', kind: 'everyNHits', id: 'dagger_murakumo_strike', n: 3, power: 3.0, aoe: false }] },
  { id: 'dagger_karma', name: '因果刃カルマ', type: 'dagger', rarity: 'mythic', req: 90, element: 'dark', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '因果応報', desc: '敵撃破時、周囲の敵にATKの130%の闇ダメージ', trigger: 'onKill', kind: 'deathNova', power: 1.3, radius: 140 },
      { name: '因果の呪縛', desc: '命中時35%で敵の防御力を4秒間30%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.35, power: 0.3, duration: 4, stat: 'def' },
    ] },
];

// ============================================================
// 拳具（knuckle）：コンボ・超高速・HP吸収
// ============================================================
const KNUCKLE_RAW = [
  { id: 'knuckle_n1', name: '革の拳帯', type: 'knuckle', rarity: 'normal', req: 1, mods: {} },
  { id: 'knuckle_n2', name: '鉄拳', type: 'knuckle', rarity: 'normal', req: 3, mods: { atk: 0.05 } },
  { id: 'knuckle_n3', name: '鋼拳', type: 'knuckle', rarity: 'normal', req: 6, mods: { atk: 0.08 } },
  { id: 'knuckle_n4', name: '闘士の籠手', type: 'knuckle', rarity: 'normal', req: 10, mods: { spd: 0.05 } },
  { id: 'knuckle_n5', name: '武闘家の拳具', type: 'knuckle', rarity: 'normal', req: 14, mods: { spd: 0.05, crit: 0.05 } },
  { id: 'knuckle_r1', name: '火炎拳', type: 'knuckle', rarity: 'rare', req: 10, element: 'fire',
    effects: [{ name: '火炎の連打', desc: '命中時20%で炎の刻印を付与（最大2重複、1秒毎にATKの8%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.2, power: 0.08, maxStacks: 2, tickInterval: 1, duration: 3 }] },
  { id: 'knuckle_r2', name: '雷撃拳', type: 'knuckle', rarity: 'rare', req: 14, mods: { crit: 0.05 }, element: 'lightning' },
  { id: 'knuckle_r3', name: '猛虎拳', type: 'knuckle', rarity: 'rare', req: 19, mods: { atk: 0.08, spd: 0.05 } },
  { id: 'knuckle_r4', name: '竜牙拳', type: 'knuckle', rarity: 'rare', req: 24, mods: { atk: 0.06 } },
  { id: 'knuckle_r5', name: '血闘拳', type: 'knuckle', rarity: 'rare', req: 29, element: 'dark', bias: ['hp'],
    effects: [{ name: '血闘の一撃', desc: '与えたダメージの2%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.02 }] },
  { id: 'knuckle_r6', name: '疾風拳', type: 'knuckle', rarity: 'rare', req: 34, mods: { spd: 0.1 }, element: 'wind' },
  { id: 'knuckle_ashura', name: '鬼神拳アシュラ', type: 'knuckle', rarity: 'epic', req: 20,
    effects: [{ name: '鬼神の連撃', desc: '通常攻撃3回ごとに、対象へATKの220%の一撃', trigger: 'onHit', kind: 'everyNHits', id: 'knuckle_ashura_strike', n: 3, power: 2.2, aoe: false }] },
  { id: 'knuckle_indra', name: '雷拳インドラ', type: 'knuckle', rarity: 'epic', req: 26, element: 'lightning',
    effects: [{ name: '雷帝の拳', desc: '会心発生時18%でATKの45%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.18, power: 0.45 }] },
  { id: 'knuckle_ifrit', name: '炎拳イフリート', type: 'knuckle', rarity: 'epic', req: 32, element: 'fire',
    effects: [{ name: '業炎の連打', desc: '命中時30%で炎の刻印を付与（最大3重複、1秒毎にATKの12%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.3, power: 0.12, maxStacks: 3, tickInterval: 1, duration: 3 }] },
  { id: 'knuckle_baihu', name: '猛虎拳バイフー', type: 'knuckle', rarity: 'epic', req: 38,
    effects: [{ name: '猛虎の代償', desc: '最大HP-8%の代わりに与ダメージ+12%', trigger: 'passive', kind: 'glassCannon', hpMult: -0.08, dmgMult: 0.12 }] },
  { id: 'knuckle_draco', name: '竜拳ドラコ', type: 'knuckle', rarity: 'epic', req: 44, series: 'dragonHunter',
    effects: [{ name: '竜拳の一撃', desc: 'Bossへの与ダメージ+12%', trigger: 'passive', kind: 'bossDmg', power: 0.12 }] },
  { id: 'knuckle_kali', name: '血拳カーリー', type: 'knuckle', rarity: 'epic', req: 49, element: 'dark', series: 'bloodking',
    effects: [{ name: '血拳の一撃', desc: '与えたダメージの5%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.05 }] },
  { id: 'knuckle_bahamut', name: '竜王拳バハムート', type: 'knuckle', rarity: 'legendary', req: 35, series: 'dragonHunter',
    effects: [
      { name: '竜王の誓い', desc: 'Bossへの与ダメージ+20%', trigger: 'passive', kind: 'bossDmg', power: 0.2 },
      { name: '竜王の高揚', desc: 'Boss撃破時、15秒間ATK+25%', trigger: 'passive', kind: 'bossSlayerBuff', power: 0.25, duration: 15 },
    ] },
  { id: 'knuckle_vajra', name: '天帝拳ヴァジュラ', type: 'knuckle', rarity: 'legendary', req: 45, element: 'lightning', series: 'thunder',
    effects: [{ name: '天帝の一撃', desc: '会心発生時28%でATKの65%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.28, power: 0.65 }] },
  { id: 'knuckle_ogre', name: '魔神拳オーガ', type: 'knuckle', rarity: 'legendary', req: 55, element: 'dark',
    effects: [{ name: '魔神の断罪', desc: 'Boss残HPが30%以下の間、与ダメージ+50%', trigger: 'passive', kind: 'executioner', hpThreshold: 0.3, power: 0.5 }] },
  { id: 'knuckle_baldr', name: '覇王拳バルドル', type: 'knuckle', rarity: 'legendary', req: 65, element: 'light',
    effects: [{ name: '覇王の代償', desc: '最大HP-12%の代わりに与ダメージ+18%', trigger: 'passive', kind: 'glassCannon', hpMult: -0.12, dmgMult: 0.18 }] },
  { id: 'knuckle_shivana', name: '神虎拳シヴァーナ', type: 'knuckle', rarity: 'legendary', req: 70, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [
      { name: '神虎の連撃', desc: '通常攻撃3回ごとに、対象へATKの240%の一撃', trigger: 'onHit', kind: 'everyNHits', id: 'knuckle_shivana_strike', n: 3, power: 2.4, aoe: false },
      { name: '神虎の呪縛', desc: '命中時25%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.25, duration: 4, stat: 'def' },
    ] },
  { id: 'knuckle_shiva', name: '天破拳シヴァ', type: 'knuckle', rarity: 'mythic', req: 65,
    effects: [{ name: '天破の共鳴', desc: '通常攻撃・スキル・必殺技をそれぞれ1回ずつ成立させると、周囲へ大爆発（ATKの260%）が発生する', trigger: 'passive', kind: 'actionDiversityBurst', power: 2.6, radius: 150 }] },
  { id: 'knuckle_brahma', name: '創滅拳ブラフマー', type: 'knuckle', rarity: 'mythic', req: 78, element: 'dark', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [{ name: '創滅の爆散', desc: '敵撃破時、周囲の敵にATKの140%の闇ダメージ', trigger: 'onKill', kind: 'deathNova', power: 1.4, radius: 160 }] },
  { id: 'knuckle_ananta', name: '無限拳アナンタ', type: 'knuckle', rarity: 'mythic', req: 90, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '無限の刻', desc: '会心発生時14%で敵を3秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.14, duration: 3 },
      { name: '無限の加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
    ] },
];

// ============================================================
// 楽器（instrument）：バフ・デバフ・特殊支援（単純な攻撃力武器にしない）
// ============================================================
const INSTRUMENT_RAW = [
  { id: 'instrument_n1', name: '木の笛', type: 'instrument', rarity: 'normal', req: 1, mods: {} },
  { id: 'instrument_n2', name: '旅人の笛', type: 'instrument', rarity: 'normal', req: 3, mods: { mag: 0.05 } },
  { id: 'instrument_n3', name: '小さな竪琴', type: 'instrument', rarity: 'normal', req: 6, mods: { mag: 0.05 } },
  { id: 'instrument_n4', name: '戦鼓', type: 'instrument', rarity: 'normal', req: 10, mods: { atk: 0.05 } },
  { id: 'instrument_n5', name: '古いリュート', type: 'instrument', rarity: 'normal', req: 14, mods: { mag: 0.08 } },
  { id: 'instrument_r1', name: '勇気の笛', type: 'instrument', rarity: 'rare', req: 10, mods: { spd: 0.05 } },
  { id: 'instrument_r2', name: '癒しの琴', type: 'instrument', rarity: 'rare', req: 14,
    effects: [{ name: '癒しの調べ', desc: '毎秒、最大HPの1%を回復する', trigger: 'passive', kind: 'regen', power: 0.01 }] },
  { id: 'instrument_r3', name: '戦歌の鼓', type: 'instrument', rarity: 'rare', req: 19, mods: { atk: 0.05, spd: 0.03 } },
  { id: 'instrument_r4', name: '雷鳴の鈴', type: 'instrument', rarity: 'rare', req: 24, mods: { crit: 0.04 }, element: 'lightning' },
  { id: 'instrument_r5', name: '妖精の笛', type: 'instrument', rarity: 'rare', req: 29, mods: { mag: 0.06 }, element: 'wind' },
  { id: 'instrument_r6', name: '魅惑の琴', type: 'instrument', rarity: 'rare', req: 34,
    effects: [{ name: '魅惑の調べ', desc: '命中時20%で敵の攻撃力を3秒間15%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.2, power: 0.15, duration: 3, stat: 'atk' }] },
  { id: 'instrument_siren', name: '妖精琴セイレーン', type: 'instrument', rarity: 'epic', req: 20,
    effects: [{ name: '魅了の唄', desc: '命中時30%で敵の攻撃力を4秒間20%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.2, duration: 4, stat: 'atk' }] },
  { id: 'instrument_valkyria', name: '戦歌琴ヴァルキリア', type: 'instrument', rarity: 'epic', req: 26,
    effects: [
      { name: '戦歌の高揚', desc: 'スキル使用時、5秒間ATK+15%', trigger: 'onSkill', kind: 'haste', power: 0.15, duration: 5 },
      { name: '戦歌の一撃', desc: 'Bossへの与ダメージ+10%', trigger: 'passive', kind: 'bossDmg', power: 0.1 },
    ] },
  { id: 'instrument_thunderbird', name: '雷鼓サンダーバード', type: 'instrument', rarity: 'epic', req: 32, element: 'lightning',
    effects: [{ name: '雷鼓の一撃', desc: '会心発生時16%でATKの40%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.16, power: 0.4 }] },
  { id: 'instrument_lunaria', name: '月笛ルナリア', type: 'instrument', rarity: 'epic', req: 38, element: 'light',
    effects: [{ name: '月光の加護', desc: '毎秒、最大HPの1.5%を回復する', trigger: 'passive', kind: 'regen', power: 0.015 }] },
  { id: 'instrument_diablo', name: '魔奏器ディアボロ', type: 'instrument', rarity: 'epic', req: 44, element: 'dark',
    effects: [{ name: '魔奏の呪縛', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' }] },
  { id: 'instrument_celestia', name: '聖琴セレスティア', type: 'instrument', rarity: 'epic', req: 49, element: 'light',
    effects: [{ name: '聖歌の加護', desc: '被弾時25%でHPの10%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.25, power: 0.1 }] },
  { id: 'instrument_orpheus', name: '天奏琴オルフェウス', type: 'instrument', rarity: 'legendary', req: 35,
    effects: [
      { name: '天奏の加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
      { name: '天奏の高揚', desc: 'スキル使用時、5秒間ATK+20%', trigger: 'onSkill', kind: 'haste', power: 0.2, duration: 5 },
    ] },
  { id: 'instrument_titania', name: '精霊琴ティターニア', type: 'instrument', rarity: 'legendary', req: 45,
    effects: [
      { name: '精霊の呪縛（攻）', desc: '命中時30%で敵の攻撃力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'atk' },
      { name: '精霊の呪縛（防）', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' },
    ] },
  { id: 'instrument_amaterasu', name: '神楽鼓アマテラス', type: 'instrument', rarity: 'legendary', req: 55, element: 'light',
    effects: [
      { name: '神楽の加護', desc: '被弾時30%でHPの12%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.3, power: 0.12 },
      { name: '神楽の一撃', desc: 'Bossへの与ダメージ+12%', trigger: 'passive', kind: 'bossDmg', power: 0.12 },
    ] },
  { id: 'instrument_erebus', name: '冥奏器エレボス', type: 'instrument', rarity: 'legendary', req: 65, element: 'dark', series: 'underworld',
    effects: [{ name: '冥奏の呪詛', desc: '命中時40%で呪詛を付与（最大5重複、1秒毎にATKの15%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.4, power: 0.15, maxStacks: 5, tickInterval: 1, duration: 4 }] },
  { id: 'instrument_muse', name: '星詠琴ミューズ', type: 'instrument', rarity: 'legendary', req: 70, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [
      { name: '星詠みの一閃', desc: '会心ダメージ倍率がさらに+15%上昇する', trigger: 'passive', kind: 'critDamageBoost', power: 0.15 },
      { name: '星詠みの加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
    ] },
  { id: 'instrument_acacia', name: '神響器アカシア', type: 'instrument', rarity: 'mythic', req: 65,
    effects: [{ name: '神響の共鳴', desc: '通常攻撃・スキル・必殺技をそれぞれ1回ずつ成立させると、周囲へ大共鳴（ATKの220%）が発生する', trigger: 'passive', kind: 'actionDiversityBurst', power: 2.2, radius: 150 }] },
  { id: 'instrument_harmonia', name: '創世琴ハルモニア', type: 'instrument', rarity: 'mythic', req: 78, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [
      { name: '創世の爆散', desc: '敵撃破時、周囲の敵にATKの110%の光ダメージ', trigger: 'onKill', kind: 'deathNova', power: 1.1, radius: 160 },
      { name: '創世の加護', desc: '毎秒、最大HPの2.5%を回復する', trigger: 'passive', kind: 'regen', power: 0.025 },
    ] },
  { id: 'instrument_seraphia', name: '天界楽器セラフィア', type: 'instrument', rarity: 'mythic', req: 90, element: 'light', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '天界の加護', desc: '被弾時35%でHPの18%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.35, power: 0.18 },
      { name: '天界凍結', desc: '会心発生時12%で敵を2.5秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.12, duration: 2.5 },
    ] },
];

// ============================================================
// 錫杖（rod）：聖属性・回復・防御・支援
// ============================================================
const ROD_RAW = [
  { id: 'rod_n1', name: '木の錫杖', type: 'rod', rarity: 'normal', req: 1, mods: {} },
  { id: 'rod_n2', name: '修行の錫杖', type: 'rod', rarity: 'normal', req: 3, mods: { mag: 0.05 } },
  { id: 'rod_n3', name: '僧兵の錫杖', type: 'rod', rarity: 'normal', req: 6, mods: { mag: 0.05 } },
  { id: 'rod_n4', name: '鉄輪の錫杖', type: 'rod', rarity: 'normal', req: 10, mods: { mag: 0.06 } },
  { id: 'rod_n5', name: '祈りの錫杖', type: 'rod', rarity: 'normal', req: 14, mods: { mag: 0.08 } },
  { id: 'rod_r1', name: '癒しの錫杖', type: 'rod', rarity: 'rare', req: 10,
    effects: [{ name: '癒しの祈り', desc: '毎秒、最大HPの1%を回復する', trigger: 'passive', kind: 'regen', power: 0.01 }] },
  { id: 'rod_r2', name: '守護の錫杖', type: 'rod', rarity: 'rare', req: 14, mods: { mag: 0.08 } },
  { id: 'rod_r3', name: '光明の錫杖', type: 'rod', rarity: 'rare', req: 19, element: 'light',
    effects: [{ name: '光明の加護', desc: '被弾時20%でHPの6%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.2, power: 0.06 }] },
  { id: 'rod_r4', name: '浄化の錫杖', type: 'rod', rarity: 'rare', req: 24,
    effects: [{ name: '浄化の一撃', desc: '命中時20%で敵の防御力を3秒間15%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.2, power: 0.15, duration: 3, stat: 'def' }] },
  { id: 'rod_r5', name: '雷鳴の錫杖', type: 'rod', rarity: 'rare', req: 29, mods: { crit: 0.03 }, element: 'lightning' },
  { id: 'rod_r6', name: '聖者の錫杖', type: 'rod', rarity: 'rare', req: 34, mods: { mag: 0.06 }, element: 'light' },
  { id: 'rod_seraphim', name: '光輪杖セラフィム', type: 'rod', rarity: 'epic', req: 20, element: 'light',
    effects: [{ name: '光輪の加護', desc: '被弾時25%でHPの10%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.25, power: 0.1 }] },
  { id: 'rod_raphael', name: '聖杖ラファエル', type: 'rod', rarity: 'epic', req: 26, element: 'light',
    effects: [{ name: '聖杖の加護', desc: '毎秒、最大HPの1.5%を回復する', trigger: 'passive', kind: 'regen', power: 0.015 }] },
  { id: 'rod_aegis', name: '守護杖アイギス', type: 'rod', rarity: 'epic', req: 32, mods: { def: 1 }, note: '防御寄りの一本',
    effects: [{ name: '守護の呪縛', desc: '命中時25%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.25, power: 0.25, duration: 4, stat: 'def' }] },
  { id: 'rod_michael', name: '浄界杖ミカエル', type: 'rod', rarity: 'epic', req: 38, element: 'light',
    effects: [
      { name: '浄界の一撃', desc: 'Bossへの与ダメージ+10%', trigger: 'passive', kind: 'bossDmg', power: 0.1 },
      { name: '浄界の加護', desc: '被弾時20%でHPの8%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.2, power: 0.08 },
    ] },
  { id: 'rod_perun', name: '雷法杖ペルーン', type: 'rod', rarity: 'epic', req: 44, element: 'lightning',
    effects: [{ name: '雷法の一撃', desc: '会心発生時16%でATKの40%の追加雷ダメージ', trigger: 'onCrit', kind: 'lightning', chance: 0.16, power: 0.4 }] },
  { id: 'rod_luna', name: '月聖杖ルナ', type: 'rod', rarity: 'epic', req: 49, element: 'light',
    effects: [
      { name: '月聖の加護（回復）', desc: '毎秒、最大HPの1%を回復する', trigger: 'passive', kind: 'regen', power: 0.01 },
      { name: '月聖の加護（被弾）', desc: '被弾時20%でHPの8%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.2, power: 0.08 },
    ] },
  { id: 'rod_messiah', name: '聖王杖メサイア', type: 'rod', rarity: 'legendary', req: 35, element: 'light',
    effects: [
      { name: '聖王の加護（回復）', desc: '毎秒、最大HPの2.5%を回復する', trigger: 'passive', kind: 'regen', power: 0.025 },
      { name: '聖王の加護（被弾）', desc: '被弾時30%でHPの14%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.3, power: 0.14 },
    ] },
  { id: 'rod_gabriel', name: '天使杖ガブリエル', type: 'rod', rarity: 'legendary', req: 45, element: 'light',
    effects: [
      { name: '天使の一撃', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 },
      { name: '天使の加護', desc: '被弾時25%でHPの10%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.25, power: 0.1 },
    ] },
  { id: 'rod_melchizedek', name: '神官杖メルキゼデク', type: 'rod', rarity: 'legendary', req: 55,
    effects: [
      { name: '神官の加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
      { name: '神官の呪縛', desc: '命中時30%で敵の防御力を4秒間25%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.25, duration: 4, stat: 'def' },
    ] },
  { id: 'rod_helios', name: '光神杖ヘリオス', type: 'rod', rarity: 'legendary', req: 65, element: 'light',
    effects: [{ name: '光神の一撃', desc: '通常攻撃5回ごとに、周囲の敵へATKの190%の光撃', trigger: 'onHit', kind: 'everyNHits', id: 'rod_helios_flare', n: 5, power: 1.9, aoe: true, radius: 110 }] },
  { id: 'rod_elyon', name: '救世杖エリオン', type: 'rod', rarity: 'legendary', req: 70, element: 'light', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_LEGENDARY_DEPTH,
    effects: [
      { name: '救世の加護', desc: '被弾時35%でHPの16%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.35, power: 0.16 },
      { name: '救世の一撃', desc: 'Bossへの与ダメージ+15%', trigger: 'passive', kind: 'bossDmg', power: 0.15 },
    ] },
  { id: 'rod_elysion', name: '神聖杖エリュシオン', type: 'rod', rarity: 'mythic', req: 65, element: 'light',
    effects: [
      { name: '神聖の加護（回復）', desc: '毎秒、最大HPの3%を回復する', trigger: 'passive', kind: 'regen', power: 0.03 },
      { name: '神聖の加護（被弾）', desc: '被弾時35%でHPの18%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.35, power: 0.18 },
    ] },
  { id: 'rod_empyrean', name: '天界杖エンパイリアン', type: 'rod', rarity: 'mythic', req: 78, element: 'light', abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH,
    effects: [
      { name: '天界凍結', desc: '会心発生時15%で敵を3秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.15, duration: 3 },
      { name: '天界の加護', desc: '被弾時30%でHPの14%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.3, power: 0.14 },
    ] },
  { id: 'rod_samsara', name: '輪廻杖サンサーラ', type: 'rod', rarity: 'mythic', req: 90, abyssMinDepth: WEAPON_CODEX_LAYER.ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH,
    effects: [
      { name: '輪廻の共鳴', desc: '通常攻撃・スキル・必殺技をそれぞれ1回ずつ成立させると、周囲へ大共鳴（ATKの230%）が発生する', trigger: 'passive', kind: 'actionDiversityBurst', power: 2.3, radius: 150 },
      { name: '輪廻の加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 },
    ] },
];

const ALL_RAW = [
  ...SWORD_RAW, ...AXE_RAW, ...STAFF_RAW, ...BOW_RAW,
  ...DAGGER_RAW, ...KNUCKLE_RAW, ...INSTRUMENT_RAW, ...ROD_RAW,
];

export const WEAPON_CODEX_ITEMS = ALL_RAW.map(buildWeaponItem);

// ============================================================
// Boss固有武器（元指示21番）：各章のボスに低確率の固有武器。
// 通常の武器図鑑ドロップとは別枠（BOSS_WEAPON_DROP_CHANCE）で、
// そのステージのボスを撃破した時だけ抽選される。
// ============================================================
const BOSS_WEAPON_RAW = [
  { id: 'boss_wp_ch1', name: '猪王剣タスカー', type: 'sword', rarity: 'legendary', req: 8, chapterId: 'ch1',
    effects: [{ name: '猪突の一撃', desc: '命中時20%で敵を怯ませ、3秒間防御力を20%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.2, power: 0.2, duration: 3, stat: 'def' }] },
  { id: 'boss_wp_ch2', name: '森狼王の牙', type: 'dagger', rarity: 'legendary', req: 14, chapterId: 'ch2', element: 'poison',
    effects: [{ name: '森狼の毒牙', desc: '命中時35%で毒を付与（最大4重複、1秒毎にATKの13%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.35, power: 0.13, maxStacks: 4, tickInterval: 1, duration: 4 }] },
  { id: 'boss_wp_ch3', name: '守護者の杖ゴーレムハート', type: 'staff', rarity: 'legendary', req: 20, chapterId: 'ch3',
    effects: [{ name: '守護の加護', desc: '毎秒、最大HPの2%を回復する', trigger: 'passive', kind: 'regen', power: 0.02 }] },
  { id: 'boss_wp_ch4', name: '竜氷弓フロストゲイル', type: 'bow', rarity: 'legendary', req: 27, chapterId: 'ch4', element: 'ice',
    effects: [{ name: '氷結の一矢', desc: '命中時30%で敵の移動速度を4秒間30%低下させる', trigger: 'onHit', kind: 'weaken', chance: 0.3, power: 0.3, duration: 4, stat: 'spd' }] },
  { id: 'boss_wp_ch5', name: '炎王剣イグナート', type: 'axe', rarity: 'legendary', req: 34, chapterId: 'ch5', element: 'fire',
    effects: [{ name: '炎王の刻印', desc: '燃焼中の敵への与ダメージ+25%（炎の刻印を持つ敵限定）', trigger: 'passive', kind: 'bossDmg', power: 0.1 },
      { name: '炎王の業火', desc: '命中時35%で炎の刻印を付与（最大5重複、1秒毎にATKの15%×重複数）', trigger: 'onHit', kind: 'burnStack', chance: 0.35, power: 0.15, maxStacks: 5, tickInterval: 1, duration: 4 }] },
  { id: 'boss_wp_ch6', name: '沼女王の拳甲', type: 'knuckle', rarity: 'legendary', req: 41, chapterId: 'ch6', element: 'poison',
    effects: [{ name: '沼女王の一撃', desc: '与えたダメージの5%をHP回復', trigger: 'onHit', kind: 'lifesteal', chance: 1, power: 0.05 }] },
  { id: 'boss_wp_ch7', name: '天空の竪琴グリフォンウィング', type: 'instrument', rarity: 'legendary', req: 48, chapterId: 'ch7', element: 'wind',
    effects: [{ name: '天翔の加護', desc: 'スキル使用時、5秒間ATK+20%', trigger: 'onSkill', kind: 'haste', power: 0.2, duration: 5 }] },
  { id: 'boss_wp_ch8', name: '大公爵の錫杖ベリアルロッド', type: 'rod', rarity: 'legendary', req: 56, chapterId: 'ch8', element: 'dark',
    effects: [{ name: '堕天の加護', desc: '被弾時30%でHPの12%を回復', trigger: 'onHurt', kind: 'guardianHeal', chance: 0.3, power: 0.12 }] },
  { id: 'boss_wp_ch9', name: '虚無断ちの剣アビス', type: 'sword', rarity: 'legendary', req: 65, chapterId: 'ch9', element: 'dark',
    effects: [{ name: '虚無の裁き', desc: '会心発生時25%で敵を2秒間時間停止させる', trigger: 'onCrit', kind: 'timeStop', chance: 0.25, duration: 2 }] },
  { id: 'boss_wp_ch10', name: '真・魔王剣ディザスター', type: 'sword', rarity: 'mythic', req: 80, chapterId: 'ch10', element: 'dark',
    effects: [
      { name: '魔王の断罪', desc: 'Boss残HPが30%以下の間、与ダメージ+50%', trigger: 'passive', kind: 'executioner', hpThreshold: 0.3, power: 0.5 },
      { name: '魔王の一撃', desc: 'Bossへの与ダメージ+20%', trigger: 'passive', kind: 'bossDmg', power: 0.2 },
    ] },
];

export const BOSS_WEAPON_ITEMS = BOSS_WEAPON_RAW.map((raw) => buildWeaponItem({ ...raw, isBossWeapon: true }));

export function bossWeaponForChapter(chapterId) {
  return BOSS_WEAPON_ITEMS.find((w) => BOSS_WEAPON_RAW.find((r) => r.id === w.id).chapterId === chapterId) || null;
}

// ============================================================
// シリーズ（元指示17・18番）：武器種横断のテーマタグ（メタデータのみ）。
// 自動発動するセット効果計算は追加しない。装備一覧・図鑑での表示用に、
// 「このシリーズのテーマに合う防具/転生遺物/Affix」を案内するだけの、
// 既存システム同士を組み合わせる導線として扱う。
// ============================================================
export const WEAPON_SERIES = {
  dragonHunter: { name: '竜狩りシリーズ', theme: 'Boss・大型敵特攻', synergyHint: '転生遺物「竜殺しの誓い」系の与ダメージ上昇や、覚醒ツリー「覇者の一撃」と相性が良い' },
  bloodking:    { name: '血王シリーズ', theme: 'HP吸収・低HP・バーサーカー', synergyHint: '転生遺物「血神の杯」「狂戦士の心臓」、覚醒装備の吸血効果と相性が良い' },
  thunder:      { name: '雷神シリーズ', theme: '会心・攻撃速度・雷', synergyHint: '転生遺物「雷神の瞳」、覚醒ツリー「会心の心得」、雷属性Affixと相性が良い' },
  underworld:   { name: '冥府シリーズ', theme: '闇・DoT・敵撃破効果', synergyHint: '深淵ツリー「深淵の加護」系、闇属性Affixと相性が良い' },
  starfall:     { name: '星界シリーズ', theme: 'スキル・魔法・会心', synergyHint: '職業MASTERのスキル威力ボーナス、会心Affixと相性が良い' },
};

export function seriesMembers(seriesId) {
  return WEAPON_CODEX_ITEMS.filter((w) => w.series === seriesId);
}

export function allCodexWeapons() { return WEAPON_CODEX_ITEMS; }
export function allBossWeapons() { return BOSS_WEAPON_ITEMS; }

// ============================================================
// ドロッププール（元指示20・21・22番：地域差・Boss固有・深淵限定）
// 既存のdropTable（防具・固有装備の抽選）とは完全に独立した、
// 武器図鑑武器専用の第二の抽選プール。既存ドロップ確率・重みには
// 一切影響しない。
// ============================================================
export function weaponDropPoolForStage(stage) {
  const recLevel = stage.recLevel || 1;
  const regionTags = stage.dropRegionTags || [];
  const isAbyss = !!stage.isAbyss;
  const abyssDepth = stage.abyssDepth || 0;

  const pool = [];
  for (const w of WEAPON_CODEX_ITEMS) {
    if (w.requiredLevel > recLevel + WEAPON_CODEX_LAYER.LEVEL_SLACK) continue;
    if (w.abyssMinDepth) {
      if (!isAbyss || abyssDepth < w.abyssMinDepth) continue;
    }
    const matches = w.element && regionTags.includes(w.element);
    const weight = WEAPON_CODEX_LAYER.RARITY_DROP_WEIGHT[w.rarity] * (matches ? (1 + WEAPON_CODEX_LAYER.REGION_WEIGHT_BONUS) : 1);
    pool.push({ itemId: w.id, weight });
  }
  return pool;
}
