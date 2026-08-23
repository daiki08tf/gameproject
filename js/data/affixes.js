/* ============================================================
   武器ランダムAffix（Part A）
   ------------------------------------------------------------
   武器rarity（normal/rare/epic/legendary/mythic、equipment.js）とは
   別の「affix rarity」を7段階持つ。既存のBattleEngine effect機構
   （trigger/kind、js/battleEngine.js applyEffect系）をそのまま再利用し、
   新しいダメージ式・状態異常システムは作らない。

   Affixは大きく2種類：
     statKey  … state.js getStats()側の乗算バケットに加算する基礎ステータス
                （ATK%/MAG%/DEF%/HP%/MP%/SPD%/Crit%/Evasion%/ArmorPen%）
     effect   … battleEngine.js の effects[]（trigger+kind）にそのまま
                積める効果テンプレート（lifesteal/regen/bossDmg等、既存の
                kindを最大限再利用し、新kindは最小限に留める）
   ============================================================ */

export const AFFIX_RARITY = ['common', 'uncommon', 'rare', 'epic', 'legendary', 'mythic', 'ancient'];
export const AFFIX_RARITY_LABEL = {
  common: 'コモン', uncommon: 'アンコモン', rare: 'レア', epic: 'エピック',
  legendary: 'レジェンダリー', mythic: 'ミシック', ancient: 'エンシェント',
};
export const AFFIX_RARITY_COLOR = {
  common: '#b9c0cc', uncommon: '#6bcf7f', rare: '#4ac2e8', epic: '#b06ef2',
  legendary: '#f2c94c', mythic: '#ff6ec7', ancient: '#ff5555',
};
export function affixRarityIndex(r) { return AFFIX_RARITY.indexOf(r); }

// rarity 7段階ぶんの [min,max] ロール幅テーブル。scale名で使い分け、
// 個々のAffixごとに7段の表を手書きしない（「実際の値は現在のバランスを
// 見て調整」という元指示の範囲内で、代表例のATK%表に合わせて較正）。
const SCALE = {
  // ATK/MAG/DEF/HP/MP/SPD%、Boss/Elite/Execution/DoT/一般Damage%
  big: [[2, 4], [4, 6], [6, 9], [9, 13], [13, 17], [17, 22], [22, 28]],
  // Crit%/CritDamage%/Lifesteal%/ArmorPen%/Evasion%
  medium: [[1, 2], [2, 3], [3, 4.5], [4.5, 6.5], [6.5, 9], [9, 12], [12, 16]],
  // Regen%（毎秒。REGEN_PCT_PER_SEC_MAX=5%が上限なので控えめ）
  regen: [[0.3, 0.6], [0.6, 0.9], [0.9, 1.3], [1.3, 1.8], [1.8, 2.4], [2.4, 3.1], [3.1, 4.0]],
  // MP Cost-%、小型ユーティリティ%
  small: [[0.5, 1], [1, 1.6], [1.6, 2.4], [2.4, 3.4], [3.4, 4.6], [4.6, 6], [6, 8]],
  // Trigger系のproc確率%
  chance: [[3, 5], [5, 8], [8, 12], [12, 17], [17, 23], [23, 30], [30, 38]],
};

function roll(range) { return range[0] + Math.random() * (range[1] - range[0]); }
function round2(v) { return Math.round(v * 100) / 100; }

// ---------------------------------------------------------
// 武器種weight（軽い重み付け。完全固定はしない＝どの武器種にも一定確率で出る）
// ---------------------------------------------------------
export const WEAPON_TYPE_AFFIX_BIAS = {
  sword: ['OFFENSE', 'CRIT', 'DEFENSE'],
  dagger: ['SPEED', 'CRIT', 'DEFENSE', 'TRIGGER'],
  knuckle: ['OFFENSE', 'CRIT', 'TRIGGER'],
  staff: ['MAGIC', 'RESOURCE', 'BUILD'],
  rod: ['SUSTAIN', 'RESOURCE', 'MAGIC'],
  bow: ['OFFENSE', 'CRIT', 'BOSS'],
  axe: ['OFFENSE', 'DEFENSE', 'BOSS'],
  instrument: ['BUILD', 'RESOURCE', 'SPEED'],
};
const WEAPON_BIAS_WEIGHT = 2.2; // 該当カテゴリの抽選重みを何倍にするか

/* ============================================================
   Affix定義（65種類の必須Affix + 12種類のBuild Affix = 77種類）
   category: OFFENSE/MAGIC/CRIT/SPEED/DEFENSE/SUSTAIN/RESOURCE/
             STATUS/BOSS/UTILITY/TRIGGER/BUILD
   statKey が付いているものは state.js の getStats() 側で加算する
   （既存の「極Affix」weaponAffix/weaponAffix2と同じ「武器の基礎stat×
   (1+pct)」ではなく、キャラクター最終値への%加算として扱う＝
   武器種を問わず一貫して機能する）。
   effect が付いているものは battleEngine.js の effects[] へそのまま積む
   （trigger/kindは原則既存のものを再利用。新kindは最小限）。
   rarityWeight: 高rarityのAffixほど出現重みが低い（後述の抽選ロジックで
   affix個別ではなくaffix rarity側の重みとして使う共通ロジックのため、
   ここでは各Affixがどのカテゴリに属するかだけ管理する）。
   ============================================================ */
export const AFFIXES = {
  // ===== 基礎（OFFENSE/MAGIC/DEFENSE/RESOURCE/SPEED） =====
  atk_pct: { name: '剛力', category: 'OFFENSE', statKey: 'atk', scale: 'big', desc: (v) => `ATK +${v}%` },
  mag_pct: { name: '魔力増幅', category: 'MAGIC', statKey: 'mag', scale: 'big', desc: (v) => `MAG +${v}%` },
  def_pct: { name: '鉄壁', category: 'DEFENSE', statKey: 'def', scale: 'big', desc: (v) => `DEF +${v}%` },
  hp_pct: { name: '不屈', category: 'DEFENSE', statKey: 'hp', scale: 'big', desc: (v) => `HP +${v}%` },
  mp_pct: { name: '深遠なる魔力', category: 'RESOURCE', statKey: 'mp', scale: 'big', desc: (v) => `MP +${v}%` },
  spd_pct: { name: '疾風', category: 'SPEED', statKey: 'spd', scale: 'medium', desc: (v) => `SPD +${v}%` },
  crit_pct: { name: '鷹の目', category: 'CRIT', statKey: 'critPct', scale: 'medium', desc: (v) => `Crit +${v}%` },
  evasion_pct: { name: '風のような身のこなし', category: 'DEFENSE', statKey: 'evasion', scale: 'medium', desc: (v) => `Evasion +${v}%` },
  armorpen_pct: { name: '甲殺し', category: 'OFFENSE', statKey: 'armorPen', scale: 'medium', desc: (v) => `Armor Pen +${v}%` },

  // ===== 攻撃 =====
  dmg_all: { name: '闘気', category: 'OFFENSE', scale: 'big', desc: (v) => `Damage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'dmgBonusAdd', power: v / 100 }) },
  dmg_normal: { name: '刃の心得', category: 'OFFENSE', scale: 'big', desc: (v) => `通常攻撃Damage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'normalDmgAdd', power: v / 100 }) },
  dmg_skill: { name: '練達の型', category: 'OFFENSE', scale: 'big', desc: (v) => `とくぎDamage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'skillDmgAdd', power: v / 100 }) },
  dmg_spell: { name: '詠唱の極意', category: 'MAGIC', scale: 'big', desc: (v) => `じゅもんDamage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'spellDmgAdd', power: v / 100 }) },
  dmg_boss: { name: '竜殺し', category: 'BOSS', scale: 'medium', desc: (v) => `Boss Damage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'bossDmg', power: v / 100 }) },
  dmg_elite: { name: '精鋭殺し', category: 'BOSS', scale: 'medium', desc: (v) => `Elite Damage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'eliteDmg', power: v / 100 }) },
  dmg_execution: { name: '止めの一手', category: 'BOSS', scale: 'medium', exclusiveGroup: 'execution', desc: (v) => `HP25%以下の相手へDamage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'executioner', power: v / 100, hpThreshold: 0.25 }) },
  crit_damage_pct: { name: '会心の一撃', category: 'CRIT', scale: 'medium', desc: (v) => `Crit Damage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'critDamageBoost', power: v / 100 }) },
  weaken_power_pct: { name: '弱点看破の心得', category: 'STATUS', scale: 'medium', desc: (v) => `弱体/DoT付与効果量 +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'debuffPowerAdd', power: v / 100 }) },
  boss_special_mitigation: { name: '対怪異の心得', category: 'BOSS', scale: 'small', desc: (v) => `Boss特殊攻撃 被ダメージ-${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'bossSpecialMitigation', power: v / 100 }) },

  // ===== Sustain =====
  lifesteal: { name: '生命奪取', category: 'SUSTAIN', scale: 'medium', exclusiveGroup: 'lifesteal', desc: (v) => `Lifesteal +${v}%`,
    effect: (v) => ({ trigger: 'onHit', kind: 'lifesteal', power: v / 100 }) },
  regen: { name: '再生の心得', category: 'SUSTAIN', scale: 'regen', exclusiveGroup: 'regen', desc: (v) => `Regen +${v}%/秒`,
    effect: (v) => ({ trigger: 'passive', kind: 'regen', power: v / 100 }) },
  heal_on_kill: { name: '喰らいし刃', category: 'SUSTAIN', scale: 'small', desc: (v) => `撃破時HP${v}%回復`,
    effect: (v) => ({ trigger: 'onKill', kind: 'healOnKill', power: v / 100 }) },
  heal_on_crit: { name: '会心の癒し', category: 'SUSTAIN', scale: 'small', desc: (v) => `会心時HP${v}%回復`,
    effect: (v) => ({ trigger: 'onCrit', kind: 'healOnCrit', power: v / 100 }) },
  heal_on_guard: { name: '守りの心得', category: 'SUSTAIN', scale: 'small', desc: (v) => `ぼうぎょ時HP${v}%回復`,
    effect: (v) => ({ trigger: 'onGuard', kind: 'healOnGuard', power: v / 100 }) },

  // ===== MP経済 =====
  mp_cost_reduce: { name: '省魔の心得', category: 'RESOURCE', scale: 'small', desc: (v) => `MPコスト-${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'mpCostReduce', power: v / 100 }) },
  mp_on_kill: { name: '魂の残滓', category: 'RESOURCE', scale: 'small', desc: (v) => `撃破時MP${v}%回復`,
    effect: (v) => ({ trigger: 'onKill', kind: 'mpOnKill', power: v / 100 }) },
  mp_on_crit: { name: '会心の閃き', category: 'RESOURCE', scale: 'small', exclusiveGroup: 'mpOnCrit', desc: (v) => `会心時MP${v}%回復`,
    effect: (v) => ({ trigger: 'onCrit', kind: 'mpOnCrit', power: v / 100 }) },
  mp_on_guard: { name: '静寂の呼吸', category: 'RESOURCE', scale: 'small', desc: (v) => `ぼうぎょ時MP${v}%回復`,
    effect: (v) => ({ trigger: 'onGuard', kind: 'mpOnGuard', power: v / 100 }) },
  cdr_pct: { name: '型の冴え', category: 'SPEED', scale: 'small', desc: (v) => `クールダウン-${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'cdrAdd', power: v / 100 }) },
  atk_speed_pct: { name: '瞬撃の心得', category: 'SPEED', scale: 'small', desc: (v) => `攻撃間隔-${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'atkSpeedAdd', power: v / 100 }) },
  guard_mitigation_pct: { name: '要塞の心得', category: 'DEFENSE', scale: 'small', desc: (v) => `ぼうぎょ軽減 +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'guardMitigation', power: v / 100 }) },
  gold_pct: { name: '商才', category: 'UTILITY', scale: 'big', desc: (v) => `Gold +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'goldMultAdd', power: v / 100 }) },
  exp_pct: { name: '習熟の心得', category: 'UTILITY', scale: 'big', desc: (v) => `EXP +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'expMultAdd', power: v / 100 }) },
  drop_pct: { name: '幸運', category: 'UTILITY', scale: 'medium', desc: (v) => `Drop率 +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'dropRateMultAdd', power: v / 100 }) },

  // ===== DoT =====
  dot_dmg: { name: '毒手', category: 'STATUS', scale: 'big', desc: (v) => `DoT Damage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'dotDmg', power: v / 100 }) },
  dot_duration: { name: '侵蝕', category: 'STATUS', scale: 'medium', desc: (v) => `DoT持続 +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'dotDuration', power: v / 100 }) },
  dot_stack: { name: '積毒', category: 'STATUS', scale: 'medium', desc: (v) => `DoT最大スタック +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'dotStackCap', power: v / 100 }) },
  dot_target_dmg: { name: '弱毒撃', category: 'STATUS', scale: 'medium', desc: (v) => `DoT中の相手へDamage +${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'debuffedDmg', power: v / 100 }) },
  dot_mp_on_apply: { name: '毒煙の呼吸', category: 'STATUS', scale: 'small', desc: (v) => `DoT付与時MP${v}%回復`,
    effect: (v) => ({ trigger: 'onDot', kind: 'mpOnDot', power: v / 100 }) },

  // ===== Trigger =====
  crit_extra_hit: { name: '会心の連撃', category: 'TRIGGER', scale: 'chance', desc: (v) => `会心時${v}%で追撃（1アクション1回まで）`,
    effect: (v) => ({ trigger: 'onCrit', kind: 'critExtraAttack', chance: v / 100, power: 0.4, perActionCap: 1 }) },
  crit_atk_buff: { name: '会心の高揚', category: 'TRIGGER', scale: 'chance', desc: (v) => `会心時${v}%でATK上昇(2T)`,
    effect: (v) => ({ trigger: 'onCrit', kind: 'critAtkBuff', chance: v / 100, power: 0.15, turns: 2 }) },
  crit_spd_buff: { name: '会心の踏込', category: 'TRIGGER', scale: 'chance', desc: (v) => `会心時${v}%でSPD上昇(2T)`,
    effect: (v) => ({ trigger: 'onCrit', kind: 'critSpdBuff', chance: v / 100, power: 0.15, turns: 2 }) },
  every_n_hits: { name: '積み技', category: 'TRIGGER', scale: 'medium', desc: (v) => `${Math.max(3, 8 - Math.round(v / 3))}hit毎に追撃`,
    effect: (v) => ({ trigger: 'onHit', kind: 'everyNHits', n: Math.max(3, 8 - Math.round(v / 3)), power: 0.5 }) },
  hit_low_dot: { name: '呪毒の刃', category: 'TRIGGER', scale: 'chance', desc: (v) => `hit時${v}%でDoT付与（1アクション1回まで）`,
    effect: (v) => ({ trigger: 'onHit', kind: 'hitApplyDot', chance: v / 100, power: 0.35, dotTurns: 3, maxStacks: 3, perActionCap: 1 }) },
  hit_low_defdown: { name: '甲砕きの刃', category: 'TRIGGER', scale: 'chance', desc: (v) => `hit時${v}%でDEF低下（1アクション1回まで）`,
    effect: (v) => ({ trigger: 'onHit', kind: 'weaken', chance: v / 100, stat: 'def', power: 0.2, turns: 2, perActionCap: 1 }) },
  guard_next_atk: { name: '受けの構え', category: 'TRIGGER', scale: 'medium', desc: (v) => `ぼうぎょ後の一撃 Damage+${v}%`,
    effect: (v) => ({ trigger: 'onGuard', kind: 'guardNextAtkBuff', power: v / 100 }) },
  evade_crit_buff: { name: '見切りの心得', category: 'TRIGGER', scale: 'medium', desc: (v) => `回避後Crit+${v}%(2T)`,
    effect: (v) => ({ trigger: 'onEvade', kind: 'evadeCritBuff', power: v, turns: 2 }) },
  kill_atk_buff: { name: '戦意昂揚', category: 'TRIGGER', scale: 'medium', desc: (v) => `撃破後ATK+${v}%(2T)`,
    effect: (v) => ({ trigger: 'onKill', kind: 'selfBuffOnKill', buffPayload: { atkPct: v / 100, turns: 2 } }) },
  spell_mag_buff: { name: '魔力循環の心得', category: 'MAGIC', scale: 'medium', desc: (v) => `じゅもん使用後MAG+${v}%(2T)`,
    effect: (v) => ({ trigger: 'onSkill', kind: 'spellMagBuff', power: v / 100, turns: 2, spellOnly: true }) },
  spell_mp_refund: { name: '還元の術理', category: 'MAGIC', scale: 'chance', desc: (v) => `じゅもん使用後${v}%でMP一部還元`,
    effect: (v) => ({ trigger: 'onSkill', kind: 'spellMpRefund', chance: v / 100, power: 0.3, spellOnly: true }) },

  // ===== Build（Legendary/Mythic/Ancient中心） =====
  build_bloodedge: { name: '血刃', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `HP50%以下でLifesteal+${v}%`,
    effect: (v) => ({ trigger: 'onHit', kind: 'lifestealLowHp', power: v / 100, hpThreshold: 0.5 }) },
  build_manaecho: { name: '魔力反響', category: 'BUILD', scale: 'chance', minRarity: 'legendary', desc: (v) => `じゅもん使用後${v}%で追加発動（連鎖なし）`,
    effect: (v) => ({ trigger: 'onSkill', kind: 'spellEcho', chance: v / 100, spellOnly: true }) },
  build_executioner: { name: '処刑者', category: 'BUILD', scale: 'medium', minRarity: 'legendary', exclusiveGroup: 'execution', desc: (v) => `HP25%以下の相手へDamage+${v}%（強化型）`,
    effect: (v) => ({ trigger: 'passive', kind: 'executioner', power: (v / 100) * 1.4, hpThreshold: 0.25 }) },
  build_thousandblades: { name: '千刃', category: 'BUILD', scale: 'big', minRarity: 'legendary', desc: (v) => `連撃の最後の一撃 Damage+${v}%`,
    effect: (v) => ({ trigger: 'onHit', kind: 'lastHitBonus', power: v / 100 }) },
  build_venomheart: { name: '毒心', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `DoTスタック1につきDamage+${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'dotStackDmg', power: v / 100 }) },
  build_ironvengeance: { name: '鉄の復讐', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `ぼうぎょ後の反撃 Damage${v}%`,
    effect: (v) => ({ trigger: 'onGuard', kind: 'guardCounter', power: v / 100 }) },
  build_manacycle: { name: '魔力循環', category: 'BUILD', scale: 'medium', minRarity: 'legendary', exclusiveGroup: 'mpOnCrit', desc: (v) => `会心時MP${v}%回復（強化型）`,
    effect: (v) => ({ trigger: 'onCrit', kind: 'mpOnCrit', power: (v / 100) * 1.6 }) },
  build_predator: { name: '捕食者', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `Boss/Elite Damage+${v}%`,
    effect: (v) => ([{ trigger: 'passive', kind: 'bossDmg', power: v / 100 }, { trigger: 'passive', kind: 'eliteDmg', power: v / 100 }]) },
  build_laststand: { name: '背水', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `HP30%以下でDamage+${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'damageBoost', power: v / 100, threshold: 0.3 }) },
  build_deathline: { name: '死線', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `HP30%以下でCrit・SPD+${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'deathlineBoost', power: v / 100, threshold: 0.3 }) },
  build_arcanebarrier: { name: '魔導防壁', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `MP70%以上でBoss特殊攻撃-${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'mpShield', power: v / 100, threshold: 0.7 }) },
  build_quickdraw: { name: '早撃ち', category: 'BUILD', scale: 'medium', minRarity: 'legendary', desc: (v) => `先攻時Damage・Crit+${v}%`,
    effect: (v) => ({ trigger: 'passive', kind: 'firstStrikeBonus', power: v / 100 }) },
};

// ---------------------------------------------------------
// Affix数（武器rarity基準、目安どおり）
// ---------------------------------------------------------
const AFFIX_COUNT_BY_WEAPON_RARITY = {
  normal: [0, 1], rare: [1, 2], epic: [2, 3], legendary: [3, 4], mythic: [4, 5],
};

// ---------------------------------------------------------
// Affix rarityの抽選重み（common最多、ancient激レア）。
// depth/elite/bossで少しだけ底上げされる（深淵・エリート/Boss補正）。
// ---------------------------------------------------------
const BASE_RARITY_WEIGHT = { common: 100, uncommon: 55, rare: 26, epic: 11, legendary: 4, mythic: 1.2, ancient: 0.3 };

function pickAffixRarity(qualityBonus) {
  const weights = AFFIX_RARITY.map((r, i) => {
    // qualityBonus（0〜1程度）が高いほど高rarity側の重みを底上げする
    const boost = 1 + qualityBonus * (i / (AFFIX_RARITY.length - 1)) * 3;
    return BASE_RARITY_WEIGHT[r] * boost;
  });
  const total = weights.reduce((s, w) => s + w, 0);
  let r = Math.random() * total;
  for (let i = 0; i < AFFIX_RARITY.length; i++) {
    r -= weights[i];
    if (r <= 0) return AFFIX_RARITY[i];
  }
  return AFFIX_RARITY[0];
}

function affixCountForWeaponRarity(weaponRarity, qualityBonus) {
  const [lo, hi] = AFFIX_COUNT_BY_WEAPON_RARITY[weaponRarity] || [0, 1];
  const extra = qualityBonus > 0.5 && Math.random() < qualityBonus - 0.5 ? 1 : 0; // 深淵深部/Elite/Bossでまれに1本増える
  return Math.min(5, Math.round(lo + Math.random() * (hi - lo)) + extra);
}

// ---------------------------------------------------------
// 武器のAffix生成本体
//   item: getItem()で取得した武器アイテム定義（weapon slotのみ想定）
//   ctx: { depth（深淵深度、0で通常）, elite（bool）, boss（bool） }
// ---------------------------------------------------------
export function generateWeaponAffixes(item, ctx = {}) {
  if (!item || item.slot !== 'weapon') return [];
  const depthBonus = Math.min(0.5, (ctx.depth || 0) / 400); // 深く潜るほど微増
  const eliteBonus = ctx.elite ? 0.12 : 0;
  const bossBonus = ctx.boss ? 0.2 : 0;
  const qualityBonus = Math.min(1, depthBonus + eliteBonus + bossBonus);

  const count = affixCountForWeaponRarity(item.rarity, qualityBonus);
  if (count <= 0) return [];

  const biasCats = WEAPON_TYPE_AFFIX_BIAS[item.weaponType] || [];
  const pool = Object.keys(AFFIXES);
  const weighted = [];
  for (const id of pool) {
    const def = AFFIXES[id];
    const w = biasCats.includes(def.category) ? WEAPON_BIAS_WEIGHT : 1;
    for (let i = 0; i < w * 10; i++) weighted.push(id);
  }

  const chosen = [];
  const usedIds = new Set();
  const usedGroups = new Set();
  let guard = 0;
  while (chosen.length < count && guard < 200) {
    guard++;
    const id = weighted[Math.floor(Math.random() * weighted.length)];
    const def = AFFIXES[id];
    if (usedIds.has(id)) continue; // 同一Affixは同一武器に複数付けない
    if (def.exclusiveGroup && usedGroups.has(def.exclusiveGroup)) continue;
    let rarity = pickAffixRarity(qualityBonus);
    if (def.minRarity && affixRarityIndex(rarity) < affixRarityIndex(def.minRarity)) {
      // Build Affixはlegendary未満で当たっても、そのAffix自体を諦めて
      // 別のAffixを引き直す（rarity自体を後から底上げすると分布が歪むため）
      continue;
    }
    const range = SCALE[def.scale][affixRarityIndex(rarity)];
    const value = round2(roll(range));
    usedIds.add(id);
    if (def.exclusiveGroup) usedGroups.add(def.exclusiveGroup);
    chosen.push({ id, rarity, roll: value });
  }
  // ソート：高rarityのAffixを先頭に（UI表示用）
  chosen.sort((a, b) => affixRarityIndex(b.rarity) - affixRarityIndex(a.rarity));
  return chosen;
}

// ---------------------------------------------------------
// 表示用ヘルパー（Affix 1件 → { name, rarity, desc }）
// ---------------------------------------------------------
export function describeAffix(a) {
  const def = AFFIXES[a.id];
  if (!def) return { name: a.id, rarity: a.rarity, desc: '' };
  return { name: def.name, rarity: a.rarity, desc: def.desc(a.roll), category: def.category };
}

// ---------------------------------------------------------
// Affixリストから、getStats()側で使うstatKey合計と、
// battleEngine.js側で使うeffect[]を組み立てる
// ---------------------------------------------------------
export function splitAffixesForApplication(affixes) {
  const statBonus = {}; // statKey -> 合計%（例：atk: 0.087）
  const effects = [];
  for (const a of affixes || []) {
    const def = AFFIXES[a.id];
    if (!def) continue;
    if (def.statKey) statBonus[def.statKey] = (statBonus[def.statKey] || 0) + a.roll / 100;
    if (def.effect) {
      const e = def.effect(a.roll);
      const list = Array.isArray(e) ? e : [e];
      for (const one of list) effects.push({ ...one, __affixId: a.id, __affixRarity: a.rarity });
    }
  }
  return { statBonus, effects };
}

// 演出用：Legendary以上のAffixを含むか
export function hasRareAffix(affixes) {
  return (affixes || []).some((a) => affixRarityIndex(a.rarity) >= affixRarityIndex('legendary'));
}
export function highestAffixRarity(affixes) {
  let best = null;
  for (const a of affixes || []) if (!best || affixRarityIndex(a.rarity) > affixRarityIndex(best)) best = a.rarity;
  return best;
}
