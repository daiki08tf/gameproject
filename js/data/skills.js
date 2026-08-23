/* ============================================================
   とくぎ（skills）データ定義
   ------------------------------------------------------------
   職業ごとの「とくぎ」の実体（何をするか）をここに集約する。
   jobs.js側は「どのjobがどのskillをLvいくつで覚えるか」だけを
   参照する（技定義と職業定義の分離＝技IDと職業IDの分離）。

   技オブジェクトの共通フィールド：
     id            正規識別子。名前が変わってもセーブ・ロジックが
                   壊れないよう、この値は変更しない。
     name          表示名（変更してもセーブに影響しない）
     type          'damage' | 'heal' | 'buff' | 'debuff' | 'steal' |
                   'inspect' | 'burst' | 'cleanse' | 'utility'
     target        'self' | 'enemy' | 'allEnemies'
                   （将来の仲間追加に備え 'ally' | 'allAllies' も
                   BattleEngine側では受理できる構造にしておくが、
                   今回は使用しない）
     mpCost        MPコスト
     cooldownTurns 個別クールダウン（ターン数）。0ならMPのみで制御。
     passive       trueならとくぎメニューには出さず、BattleEngine側の
                   条件判定だけで自動的に働く（例：百姓魂）

   ダメージ系は power を「player.atk（またはmagic:trueならmag）に
   掛ける倍率」として扱う。既存のDamage Bucket・比率型DEF軽減・
   Armor Pen・Crit・Boss倍率・multi-hitの1hit単位onHit/onCrit処理は
   一切変更せず、BattleEngine側の共通処理（calculateDamage/
   _applyDamageToEnemy）をそのまま呼び出す。

   weaken/dotは既存のenemy.weaken／enemy.dotStacks構造をそのまま
   使う（新しい状態異常システムは作らない）。buffは新設した
   player.buffsの汎用構造（atk/def/spd/mag/critAdd/evasionAdd/
   regenAdd、いずれもCAPS_LAYERの上限を厳守）に載せる。
   ============================================================ */

export const SKILLS = {
  // ---------------------------------------------------------
  // 戦士：高HP・高DEF・重い一撃。Bossの予兆に対して守りながら戦える前衛。
  // ---------------------------------------------------------
  warrior_power_strike: {
    id: 'warrior_power_strike', name: '渾身の一撃', type: 'damage', target: 'enemy',
    power: 2.4, mpCost: 6, cooldownTurns: 0,
  },
  warrior_armor_break: {
    id: 'warrior_armor_break', name: 'かぶと割り', type: 'damage', target: 'enemy',
    power: 1.6, mpCost: 8, cooldownTurns: 1,
    weaken: { stat: 'def', pct: 0.25, turns: 3 },
  },
  warrior_provoke: {
    // ソロゲームのため「敵視を集める」ではなく自己防御技として解釈する
    id: 'warrior_provoke', name: '挑発', type: 'buff', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    buff: { defPct: 0.35, turns: 2 },
  },
  warrior_unbreakable_stance: {
    id: 'warrior_unbreakable_stance', name: '不屈の構え', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    // bossGuardPct：Boss予兆特殊攻撃にのみ効く追加軽減（完全無敵にはしない）
    buff: { defPct: 0.25, bossGuardPct: 0.35, turns: 3 },
  },

  // ---------------------------------------------------------
  // 武闘家：SPD・会心・multi-hit。
  // ---------------------------------------------------------
  fighter_flurry: {
    id: 'fighter_flurry', name: '連撃拳', type: 'damage', target: 'enemy',
    power: 0.75, hits: 3, mpCost: 6, cooldownTurns: 0,
  },
  fighter_focus: {
    id: 'fighter_focus', name: 'ためる', type: 'buff', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    buff: { atkPct: 0.35, turns: 1 },
  },
  fighter_straight_punch: {
    id: 'fighter_straight_punch', name: '正拳突き', type: 'damage', target: 'enemy',
    power: 2.8, mpCost: 9, cooldownTurns: 1, armorPenBonus: 0.15,
  },
  fighter_tiger_flurry: {
    // hit数は固定5・SPDによる過剰hit増加は起こさない（multi-hit系の暴走防止）
    id: 'fighter_tiger_flurry', name: '猛虎連撃', type: 'damage', target: 'enemy',
    power: 0.7, hits: 5, mpCost: 16, cooldownTurns: 2,
  },

  // ---------------------------------------------------------
  // 魔法使い：MPを消費して高火力。低耐久。とくぎは1つのみ、主力はじゅもん。
  // ---------------------------------------------------------
  mage_focus: {
    id: 'mage_focus', name: '魔力集中', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { magPct: 0.35, turns: 2 },
  },

  // ---------------------------------------------------------
  // 僧侶：回復・防御・継戦能力。とくぎは1つのみ、主力はじゅもん。
  // ---------------------------------------------------------
  priest_prayer: {
    id: 'priest_prayer', name: '祈り', type: 'buff', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    buff: { regenAdd: 0.02, turns: 3 },
  },

  // ---------------------------------------------------------
  // 盗賊：SPD・回避・状態異常・報酬。
  // ---------------------------------------------------------
  thief_dark_slash: {
    id: 'thief_dark_slash', name: 'くらやみ斬り', type: 'damage', target: 'enemy',
    power: 2.2, mpCost: 6, cooldownTurns: 0,
    weaken: { stat: 'atk', pct: 0.20, turns: 2 },
  },
  thief_poison_blade: {
    id: 'thief_poison_blade', name: '毒刃', type: 'damage', target: 'enemy',
    power: 1.6, mpCost: 8, cooldownTurns: 1,
    dot: { power: 0.14, turns: 3, maxStacks: 2 },
  },
  thief_steal: {
    // 同一敵から無限に盗めないよう、対象enemyに_stolenフラグを立てて1戦/1敵に制限する
    id: 'thief_steal', name: '盗む', type: 'steal', target: 'enemy',
    mpCost: 6, cooldownTurns: 2, stealGoldMult: 1.5, stealDropChance: 0.25,
  },
  thief_shadow_step: {
    id: 'thief_shadow_step', name: '影走り', type: 'buff', target: 'self',
    mpCost: 12, cooldownTurns: 2,
    buff: { evasionAdd: 0.20, turns: 3 }, // CAPS_LAYER.EVASION_MAXで頭打ち
  },

  // ---------------------------------------------------------
  // 商人：Goldを戦闘資源として使う特殊職。Goldが0未満にはならない。
  // ---------------------------------------------------------
  merchant_golden_strike: {
    id: 'merchant_golden_strike', name: '黄金の一撃', type: 'damage', target: 'enemy',
    power: 2.0, mpCost: 5, cooldownTurns: 0,
  },
  merchant_coin_toss: {
    id: 'merchant_coin_toss', name: '銭投げ', type: 'damage', target: 'enemy',
    power: 1.8, mpCost: 4, cooldownTurns: 1, armorPenBonus: 0.25,
    goldCostPct: 0.05, goldCostMin: 10,
  },
  merchant_business_sense: {
    id: 'merchant_business_sense', name: '商魂', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { goldMultAdd: 0.5, turns: 3 },
  },
  merchant_grand_giveaway: {
    id: 'merchant_grand_giveaway', name: '大盤振る舞い', type: 'damage', target: 'allEnemies',
    power: 2.0, mpCost: 10, cooldownTurns: 2,
    goldCostPct: 0.15, goldCostMin: 50,
  },

  // ---------------------------------------------------------
  // 狩人：単体・Boss特効。
  // ---------------------------------------------------------
  hunter_piercing_arrow: {
    id: 'hunter_piercing_arrow', name: '貫通の矢', type: 'damage', target: 'enemy',
    power: 2.3, mpCost: 6, cooldownTurns: 0, armorPenBonus: 0.25,
  },
  hunter_aim: {
    id: 'hunter_aim', name: '狙い撃ち', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { critAdd: 20, turns: 2 },
  },
  hunter_pin_down: {
    // Bossには効果量減衰（bossMultiplierで半減）
    id: 'hunter_pin_down', name: '足止め', type: 'debuff', target: 'enemy',
    mpCost: 7, cooldownTurns: 1,
    weaken: { stat: 'spd', pct: 0.30, turns: 2, bossMultiplier: 0.5 },
  },
  hunter_beast_slayer: {
    id: 'hunter_beast_slayer', name: '獣狩り', type: 'buff', target: 'self',
    mpCost: 12, cooldownTurns: 2,
    buff: { bossDmgAdd: 0.20, turns: 3 }, // Boss/Elite限定の与ダメージ加算（既存_bossDmgMultへ合流）
  },

  // ---------------------------------------------------------
  // 忍者：高速、多段、状態異常。忍術（火遁）はとくぎ側に見せる。
  // ---------------------------------------------------------
  ninja_shadow_slash: {
    id: 'ninja_shadow_slash', name: '分身斬り', type: 'damage', target: 'enemy',
    power: 0.65, hits: 4, mpCost: 7, cooldownTurns: 0,
  },
  ninja_poison_star: {
    id: 'ninja_poison_star', name: '毒手裏剣', type: 'damage', target: 'enemy',
    power: 1.6, mpCost: 8, cooldownTurns: 1,
    dot: { power: 0.13, turns: 3, maxStacks: 2 },
  },
  ninja_pin: {
    // Bossには完全停止（frozenTurns）を適用しない＝弱体化。非Bossにのみ低確率で1ターン行動阻害
    id: 'ninja_pin', name: '影縫い', type: 'debuff', target: 'enemy',
    mpCost: 8, cooldownTurns: 1,
    weaken: { stat: 'spd', pct: 0.35, turns: 2 },
    stunChance: 0.20, stunTurns: 1, stunExcludesBoss: true,
  },
  ninja_katon: {
    id: 'ninja_katon', name: '火遁', type: 'damage', target: 'allEnemies',
    power: 2.0, mpCost: 16, cooldownTurns: 2,
  },

  // ---------------------------------------------------------
  // 吟遊詩人：バフ・継続支援。
  // ---------------------------------------------------------
  bard_encourage: {
    id: 'bard_encourage', name: '鼓舞の歌', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { atkPct: 0.30, turns: 3 },
  },
  bard_protect_song: {
    id: 'bard_protect_song', name: '守りの歌', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { defPct: 0.30, turns: 3 },
  },
  bard_healing_melody: {
    id: 'bard_healing_melody', name: '癒しの旋律', type: 'buff', target: 'self',
    mpCost: 9, cooldownTurns: 1,
    buff: { regenAdd: 0.025, turns: 4 },
  },
  bard_hero_song: {
    // 強すぎる万能バフにしないため、各ステータスの上昇幅は小さめにしてある
    id: 'bard_hero_song', name: '英雄の歌', type: 'buff', target: 'self',
    mpCost: 15, cooldownTurns: 3,
    buff: { atkPct: 0.15, defPct: 0.15, spdPct: 0.15, turns: 3 },
  },

  // ---------------------------------------------------------
  // 踊り子：回避・デバフ・瞬間強化。
  // ---------------------------------------------------------
  dancer_illusion_dance: {
    id: 'dancer_illusion_dance', name: '幻惑の舞', type: 'debuff', target: 'enemy',
    mpCost: 6, cooldownTurns: 0,
    weaken: { stat: 'atk', pct: 0.20, turns: 2 },
  },
  dancer_blade_dance: {
    id: 'dancer_blade_dance', name: '剣の舞', type: 'damage', target: 'enemy',
    power: 0.8, hits: 3, mpCost: 8, cooldownTurns: 1,
  },
  dancer_haste_dance: {
    // SPD上昇はinitiative（先攻判定）にも反映される（_effectiveSpd経由）
    id: 'dancer_haste_dance', name: '加速の舞', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { spdPct: 0.5, turns: 2 },
  },
  dancer_dream_dance: {
    id: 'dancer_dream_dance', name: '夢幻舞', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 2,
    buff: { evasionAdd: 0.15, critAdd: 15, turns: 3 },
  },

  // ---------------------------------------------------------
  // 錬金術師：DoT・爆発・薬。
  // ---------------------------------------------------------
  alchemist_explosive_potion: {
    id: 'alchemist_explosive_potion', name: '爆裂薬', type: 'damage', target: 'allEnemies',
    power: 1.7, mpCost: 9, cooldownTurns: 1,
  },
  alchemist_poison_potion: {
    id: 'alchemist_poison_potion', name: '毒薬', type: 'debuff', target: 'enemy',
    mpCost: 7, cooldownTurns: 0,
    dot: { power: 0.16, turns: 4, maxStacks: 3 },
  },
  alchemist_boost_potion: {
    id: 'alchemist_boost_potion', name: '強化薬', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { atkPct: 0.25, magPct: 0.25, turns: 3 },
  },
  alchemist_detonate: {
    // 現在のDoT/burnStackを消費してスタック数に応じた追加ダメージを与える
    id: 'alchemist_detonate', name: '起爆', type: 'burst', target: 'enemy',
    power: 1.0, stackPowerMult: 0.5, mpCost: 10, cooldownTurns: 2,
  },

  // ---------------------------------------------------------
  // 学者：解析・弱点利用。じゅもんは元素術（scholar_elemental、spells.js）。
  // ---------------------------------------------------------
  scholar_weakpoint: {
    id: 'scholar_weakpoint', name: '弱点看破', type: 'debuff', target: 'enemy',
    mpCost: 6, cooldownTurns: 1,
    weaken: { stat: 'def', pct: 0.25, turns: 3 },
  },
  scholar_analyze: {
    // 敵HP/ATK/DEF/SPDをログに表示する情報技。Bossにも有効。
    id: 'scholar_analyze', name: '解析', type: 'inspect', target: 'enemy',
    mpCost: 4, cooldownTurns: 0,
  },
  scholar_full_analysis: {
    // 与ダメージ補正（既存の_mainDmgMult系と同じ加算バケットに合流）
    id: 'scholar_full_analysis', name: '完全解析', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 2,
    buff: { dmgBonusAdd: 0.15, turns: 3 },
  },

  // ---------------------------------------------------------
  // 農民：高HP・耐久・素朴な範囲攻撃。
  // ---------------------------------------------------------
  farmer_scythe_sweep: {
    id: 'farmer_scythe_sweep', name: '鎌払い', type: 'damage', target: 'allEnemies',
    power: 1.5, mpCost: 6, cooldownTurns: 1,
  },
  farmer_grit: {
    // HPが低いほど恩恵が大きい（無駄打ちにならないよう、通常時も小さな
    // DEF上昇は必ず得られるようにしてある）
    id: 'farmer_grit', name: '根性', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    lowHpThreshold: 0.5,
    buff: { defPct: 0.15, turns: 2 },
    lowHpBonus: { healPct: 0.30, defPct: 0.25, turns: 2 },
  },
  farmer_harvest: {
    // 経済効果は商人の商魂(0.5)より弱くしてある
    id: 'farmer_harvest', name: '大収穫', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { goldMultAdd: 0.25, turns: 3 },
  },
  farmer_peasant_soul: {
    // パッシブ：とくぎメニューには表示されず、致死ダメージを受けた際に
    // BattleEngine.checkBattleEnd()側で1戦1回だけ低確率判定される
    id: 'farmer_peasant_soul', name: '百姓魂', type: 'passive', target: 'self',
    passive: true, mpCost: 0, cooldownTurns: 0,
  },

  // ---------------------------------------------------------
  // 大工：防御・Guard・反撃。
  // ---------------------------------------------------------
  craftsman_iron_stance: {
    id: 'craftsman_iron_stance', name: '鉄壁の構え', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { defPct: 0.35, turns: 2 },
  },
  craftsman_parry: {
    // 次の1ラウンドだけ、通常のぼうぎょ（GUARD_DAMAGE_MULT）より強い軽減率を適用する
    id: 'craftsman_parry', name: '受け流し', type: 'utility', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    guardOverride: { mult: 0.3, turns: 1 }, // 70%軽減（完全無敵にはしない）
  },
  craftsman_counter: {
    // 既存のcounter固有効果（onHurtトリガー）をそのまま2ターンだけ一時的に付与する
    id: 'craftsman_counter', name: '反撃', type: 'utility', target: 'self',
    mpCost: 8, cooldownTurns: 2,
    tempEffect: { effect: { trigger: 'onHurt', kind: 'counter', power: 0.35 }, turns: 2 },
  },
  craftsman_fortify: {
    id: 'craftsman_fortify', name: '要塞化', type: 'utility', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    guardOverride: { mult: 0.35, turns: 3 }, // 65%軽減（完全無敵にはしない）
    buff: { defPct: 0.15, turns: 3 },
  },

  // ---------------------------------------------------------
  // 占い師：Crit・乱数操作・未来予測。じゅもんは星の導き（MASTER、spells.js）。
  // ---------------------------------------------------------
  fortune_fate_reversal: {
    id: 'fortune_fate_reversal', name: '運命の逆転', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { critAdd: 15, turns: 3 },
  },
  fortune_good_omen: {
    id: 'fortune_good_omen', name: '吉兆', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { critAdd: 30, turns: 1 },
  },
  fortune_bad_omen: {
    id: 'fortune_bad_omen', name: '凶兆', type: 'debuff', target: 'enemy',
    mpCost: 7, cooldownTurns: 1,
    weaken: { stat: 'atk', pct: 0.30, turns: 1 },
  },
};

export function getSkill(id) { return SKILLS[id] || null; }
