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
    power: 3, mpCost: 6, cooldownTurns: 0,
  },
  warrior_armor_break: {
    id: 'warrior_armor_break', name: 'かぶと割り', type: 'damage', target: 'enemy',
    power: 3, mpCost: 8, cooldownTurns: 1,
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
    power: 1, hits: 3, mpCost: 6, cooldownTurns: 0,
  },
  fighter_focus: {
    id: 'fighter_focus', name: 'ためる', type: 'buff', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    buff: { atkPct: 0.35, turns: 1 },
  },
  fighter_straight_punch: {
    id: 'fighter_straight_punch', name: '正拳突き', type: 'damage', target: 'enemy',
    power: 3, mpCost: 9, cooldownTurns: 1, armorPenBonus: 0.15,
  },
  fighter_tiger_flurry: {
    // hit数は固定5・SPDによる過剰hit増加は起こさない（multi-hit系の暴走防止）
    id: 'fighter_tiger_flurry', name: '猛虎連撃', type: 'damage', target: 'enemy',
    power: 1.04, hits: 5, mpCost: 16, cooldownTurns: 2,
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
    power: 3, mpCost: 6, cooldownTurns: 0,
    weaken: { stat: 'atk', pct: 0.20, turns: 2 },
  },
  thief_poison_blade: {
    id: 'thief_poison_blade', name: '毒刃', type: 'damage', target: 'enemy',
    power: 3, mpCost: 8, cooldownTurns: 1,
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
    power: 3, mpCost: 5, cooldownTurns: 0,
  },
  merchant_coin_toss: {
    id: 'merchant_coin_toss', name: '銭投げ', type: 'damage', target: 'enemy',
    power: 3, mpCost: 4, cooldownTurns: 1, armorPenBonus: 0.25,
    goldCostPct: 0.05, goldCostMin: 10,
  },
  merchant_business_sense: {
    id: 'merchant_business_sense', name: '商魂', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { goldMultAdd: 0.5, turns: 3 },
  },
  merchant_grand_giveaway: {
    id: 'merchant_grand_giveaway', name: '大盤振る舞い', type: 'damage', target: 'allEnemies',
    power: 3.9, mpCost: 10, cooldownTurns: 2,
    goldCostPct: 0.15, goldCostMin: 50,
  },

  // ---------------------------------------------------------
  // 狩人：単体・Boss特効。
  // ---------------------------------------------------------
  hunter_piercing_arrow: {
    id: 'hunter_piercing_arrow', name: '貫通の矢', type: 'damage', target: 'enemy',
    power: 3, mpCost: 6, cooldownTurns: 0, armorPenBonus: 0.25,
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
    power: 0.75, hits: 4, mpCost: 7, cooldownTurns: 0,
  },
  ninja_poison_star: {
    id: 'ninja_poison_star', name: '毒手裏剣', type: 'damage', target: 'enemy',
    power: 3, mpCost: 8, cooldownTurns: 1,
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
    power: 5.2, mpCost: 16, cooldownTurns: 2,
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
    power: 1, hits: 3, mpCost: 8, cooldownTurns: 1,
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
    power: 3, mpCost: 9, cooldownTurns: 1,
  },
  alchemist_poison_potion: {
    // バランス再較正：直接ダメージを持たないDoT専業技は、4ターン合計が
    // 通常攻撃1回分にも満たない水準だったため、power自体を引き上げた
    // （元指示：3〜5ターン継続時の総DoTダメージが通常攻撃より弱すぎない水準）
    id: 'alchemist_poison_potion', name: '毒薬', type: 'debuff', target: 'enemy',
    mpCost: 7, cooldownTurns: 0,
    dot: { power: 1.13, turns: 4, maxStacks: 3 },
  },
  alchemist_boost_potion: {
    id: 'alchemist_boost_potion', name: '強化薬', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { atkPct: 0.25, magPct: 0.25, turns: 3 },
  },
  alchemist_detonate: {
    // 現在のDoT/burnStackを消費してスタック数に応じた追加ダメージを与える
    id: 'alchemist_detonate', name: '起爆', type: 'burst', target: 'enemy',
    power: 1.95, stackPowerMult: 0.98, mpCost: 10, cooldownTurns: 2,
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
    power: 3, mpCost: 6, cooldownTurns: 1,
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

  /* ============================================================
     ここから上級職30種（第2フェーズ）。
     コンセプト：「必要基本職A＋必要基本職Bの技を並べただけ」にせず、
     各職に固有の戦術・Boss戦での役割を持たせる。新しい状態異常
     システムは作らず、既存のweaken/dot/buff/guardOverride/counter/
     pendingSpecialへ薄く新フィールドを足して合流させる（詳細は
     battleEngine.jsの各フィールドの導入コメントを参照）。
     ============================================================ */

  // ---------------------------------------------------------
  // パラディン（warrior+priest）：Boss予兆を受け止めるほど立て直せる守護騎士。
  // ---------------------------------------------------------
  paladin_holy_shield: {
    // telegraphBonus：Boss予兆が出ている間に使うと、通常のDEF上昇に加えて
    // bossGuardPct（既存の不屈の構え/魔法障壁と同じ「次のぼうぎょを強化する」
    // 仕組み）が追加で乗る＝「予兆を見てから使うと化ける」技にしてある
    id: 'paladin_holy_shield', name: '聖盾', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { defPct: 0.20, turns: 2 },
    telegraphBonus: { buff: { defPct: 0.20, bossGuardPct: 0.30, turns: 2 } },
  },
  paladin_holy_slash: {
    // hybrid：ATKとMAGの両方を参照するハイブリッド攻撃（新フィールド）
    id: 'paladin_holy_slash', name: '聖光斬', type: 'damage', target: 'enemy',
    hybrid: true, power: 3, mpCost: 9, cooldownTurns: 1,
  },
  paladin_healing_counter: {
    // 次に被弾した瞬間、既存のcounter（onHurt）とguardianHeal（onHurt）を
    // 同時に一時付与する＝「防いだ・受けた」ことがそのまま反撃と回復に
    // つながる、というパラディンのコンセプトそのもの
    id: 'paladin_healing_counter', name: '癒しの反撃', type: 'utility', target: 'self',
    mpCost: 10, cooldownTurns: 2,
    tempEffects: [
      { effect: { trigger: 'onHurt', kind: 'counter', power: 0.30 }, turns: 2 },
      { effect: { trigger: 'onHurt', kind: 'guardianHeal', power: 0.06 }, turns: 2 },
    ],
  },
  paladin_unfallen_oath: {
    // deathGuard：致死ダメージを1戦1回だけ耐える権利を「起動」する（農民の
    // 百姓魂＝常時パッシブとは違い、こちらは技として使った時だけ有効になる）。
    // 深淵蘇生→百姓魂→この順で判定するchekBattleEnd()側の優先順位により、
    // 既存の死亡回避系と重複しても二重発動しない
    id: 'paladin_unfallen_oath', name: '不落の誓い', type: 'utility', target: 'self',
    mpCost: 16, cooldownTurns: 4,
    buff: { defPct: 0.25, turns: 3 },
    deathGuard: true,
  },

  // ---------------------------------------------------------
  // バトルマスター（warrior+fighter）：単発の破壊力と固定連撃を使い分ける純物理アタッカー。
  // ---------------------------------------------------------
  battlemaster_armor_breaker: {
    id: 'battlemaster_armor_breaker', name: '破甲撃', type: 'damage', target: 'enemy',
    power: 3, mpCost: 8, cooldownTurns: 0, armorPenBonus: 0.25,
  },
  battlemaster_rapid_break: {
    id: 'battlemaster_rapid_break', name: '連破斬', type: 'damage', target: 'enemy',
    power: 1.33, hits: 3, mpCost: 10, cooldownTurns: 1,
  },
  battlemaster_fighting_spirit: {
    // 攻め特化のリスク技：ATK/Critは大きく上がるがDEFは下がる
    id: 'battlemaster_fighting_spirit', name: '闘気解放', type: 'buff', target: 'self',
    mpCost: 9, cooldownTurns: 2,
    buff: { atkPct: 0.30, critAdd: 15, defPct: -0.10, turns: 3 },
  },
  battlemaster_peerless: {
    // 固定4hit。通常攻撃の最大9hitに対し「hit数で勝負しない」設計
    // （元指示：単純hit数だけで優位を作らない）
    id: 'battlemaster_peerless', name: '天下無双', type: 'damage', target: 'enemy',
    power: 1.63, hits: 4, mpCost: 18, cooldownTurns: 3,
  },

  // ---------------------------------------------------------
  // 魔法剣士（warrior+mage）：物理とMAGを併用する属性剣士。
  // ---------------------------------------------------------
  spellblade_flame_slash: {
    id: 'spellblade_flame_slash', name: '火炎斬', type: 'damage', target: 'enemy', element: 'fire',
    hybrid: true, power: 3, mpCost: 8, cooldownTurns: 0,
  },
  spellblade_frost_slash: {
    id: 'spellblade_frost_slash', name: '氷結斬', type: 'damage', target: 'enemy', element: 'ice',
    hybrid: true, power: 3, mpCost: 9, cooldownTurns: 1,
    weaken: { stat: 'spd', pct: 0.20, turns: 2 },
  },
  spellblade_thunder_slash: {
    // critBonus：この一撃だけ会心率に加算する（新フィールド）
    id: 'spellblade_thunder_slash', name: '雷鳴斬', type: 'damage', target: 'enemy', element: 'lightning',
    hybrid: true, power: 4, mpCost: 11, cooldownTurns: 1, critBonus: 20,
  },
  spellblade_mana_blade: {
    // 数ターン、通常攻撃にもMAG補正を追加する（新フィールド hybridAtkAdd）。
    // 永続化しないよう必ずturnsを持たせる
    id: 'spellblade_mana_blade', name: '魔力剣', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    buff: { hybridAtkAdd: { ratio: 0.5, turns: 3 } },
  },

  // ---------------------------------------------------------
  // 剣豪（warrior+thief）：先制・回避・会心を武器にする一撃離脱の剣士。
  // ---------------------------------------------------------
  swordsaint2_iai: {
    // conditionBonus：このラウンド先攻した場合のみ威力上昇（新フィールド）
    id: 'swordsaint2_iai', name: '居合', type: 'damage', target: 'enemy',
    power: 3, mpCost: 7, cooldownTurns: 0,
    conditionBonus: { condition: 'playerFirst', power: 2.1 },
  },
  swordsaint2_mikiri: {
    // Evasion上昇＋回避成功時に自動反撃（新トリガーonEvade、既存counterを流用）
    id: 'swordsaint2_mikiri', name: '見切り', type: 'utility', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { evasionAdd: 0.18, turns: 3 },
    tempEffect: { effect: { trigger: 'onEvade', kind: 'counter', power: 0.40 }, turns: 3 },
  },
  swordsaint2_samidare: {
    id: 'swordsaint2_samidare', name: '五月雨斬り', type: 'damage', target: 'enemy',
    power: 1.25, hits: 4, mpCost: 12, cooldownTurns: 1,
  },
  swordsaint2_mushin: {
    // 高いcritBonusに加え、Boss予兆が出ている間はさらに強化される
    id: 'swordsaint2_mushin', name: '無心斬', type: 'damage', target: 'enemy',
    power: 7.8, mpCost: 16, cooldownTurns: 2, critBonus: 25,
    conditionBonus: { condition: 'telegraphActive', power: 6 },
  },

  // ---------------------------------------------------------
  // アームズナイト（warrior+craftsman）：武器で受け、防具ごと敵を崩す堅牢な前衛。
  // ---------------------------------------------------------
  armsknight_weapon_guard: {
    id: 'armsknight_weapon_guard', name: '武器受け', type: 'utility', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    guardOverride: { mult: 0.5, turns: 1 },
  },
  armsknight_shield_break: {
    id: 'armsknight_shield_break', name: 'シールドブレイク', type: 'damage', target: 'enemy',
    power: 3, mpCost: 9, cooldownTurns: 1,
    weaken: { stat: 'def', pct: 0.25, turns: 3 },
  },
  armsknight_bulwark: {
    id: 'armsknight_bulwark', name: '堅牢陣', type: 'utility', target: 'self',
    mpCost: 12, cooldownTurns: 2,
    guardOverride: { mult: 0.45, turns: 3 },
    buff: { defPct: 0.25, turns: 3 },
  },
  armsknight_full_armament: {
    // DEF/ArmorPen/ATKを小幅同時強化（万能すぎないよう控えめな数値）
    id: 'armsknight_full_armament', name: '完全武装', type: 'buff', target: 'self',
    mpCost: 16, cooldownTurns: 3,
    buff: { defPct: 0.15, atkPct: 0.12, armorPenAdd: 0.12, turns: 3 },
  },

  // ---------------------------------------------------------
  // 賢者（mage+priest）：攻撃魔法と回復を高効率で両立する。主力呪文はspells.js側。
  // ---------------------------------------------------------
  sage_magic_barrier: {
    // 既存の不屈の構え/巫女「結界」と同型：Boss特殊攻撃軽減として扱う
    id: 'sage_magic_barrier', name: '魔法障壁', type: 'buff', target: 'self',
    mpCost: 10, cooldownTurns: 2,
    buff: { magPct: 0.10, bossGuardPct: 0.35, turns: 3 },
  },

  // ---------------------------------------------------------
  // 怪盗（thief+ninja）：回避・盗み・先制の高速アタッカー。
  // ---------------------------------------------------------
  phantomthief_phantom_slash: {
    // 高Evasion状態（現在の有効回避率が閾値以上）で威力上昇
    id: 'phantomthief_phantom_slash', name: '幻影斬', type: 'damage', target: 'enemy',
    power: 4, mpCost: 7, cooldownTurns: 0,
    conditionBonus: { condition: 'highEvasion', power: 2.8, evasionThreshold: 0.15 },
  },
  phantomthief_grand_theft: {
    // 盗むの上位版。既存の_rollDrop()（ステージのdropTableのみ）を使うため、
    // Boss固有武器・初回クリア報酬は自然に対象外（別経路のため）
    id: 'phantomthief_grand_theft', name: '強奪', type: 'steal', target: 'enemy',
    mpCost: 9, cooldownTurns: 2, stealGoldMult: 2.2, stealDropChance: 0.40,
  },
  phantomthief_smoke_step: {
    id: 'phantomthief_smoke_step', name: '煙遁', type: 'buff', target: 'self',
    mpCost: 9, cooldownTurns: 1,
    buff: { evasionAdd: 0.18, spdPct: 0.25, turns: 3 },
  },
  phantomthief_backstab: {
    // 先攻していた、または直前の敵手番を回避していた場合に威力上昇
    id: 'phantomthief_backstab', name: '背後の一撃', type: 'damage', target: 'enemy',
    power: 10.4, mpCost: 15, cooldownTurns: 2,
    conditionBonus: { condition: 'firstOrEvaded', power: 8 },
  },

  // ---------------------------------------------------------
  // トレジャーハンター（thief+merchant）：DropとGoldを戦闘中に変換する経済職。
  // ---------------------------------------------------------
  treasurehunter_dig: {
    // 戦闘終了（クリア）時に追加報酬判定を1回だけ予約する（新フィールド
    // bonusRewardArm）。Boss固有武器・初回クリア報酬は対象外の別経路
    id: 'treasurehunter_dig', name: '発掘', type: 'utility', target: 'self',
    mpCost: 6, cooldownTurns: 2,
    bonusRewardArm: { goldPct: 0.10, dropChance: 0.30 },
  },
  treasurehunter_gem_toss: {
    id: 'treasurehunter_gem_toss', name: '宝石投げ', type: 'damage', target: 'enemy',
    power: 4, mpCost: 6, cooldownTurns: 1, armorPenBonus: 0.20,
    goldCostPct: 0.04, goldCostMin: 10,
  },
  treasurehunter_appraisal: {
    // 戦闘中だけドロップ率を底上げする（新フィールド dropRateMultAdd）。
    // 永続的な経済破壊にならないよう、必ずturnsで切れる一時効果にしてある
    id: 'treasurehunter_appraisal', name: '目利き', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 2,
    buff: { dropRateMultAdd: 0.5, turns: 4 },
  },
  treasurehunter_big_find: {
    // 1戦1回・高確率の即時追加ドロップ判定。既存の_rollDrop()のみを使うため
    // Boss固有装備は対象外
    id: 'treasurehunter_big_find', name: '大発見', type: 'utility', target: 'self',
    mpCost: 12, cooldownTurns: 3, oncePerBattle: true,
    instantDropRoll: { chance: 0.75 },
  },

  // ---------------------------------------------------------
  // 密偵（thief+hunter）：先制・弱点看破・デバフ利用の狙撃職。
  // ---------------------------------------------------------
  scoutmaster_ambush: {
    id: 'scoutmaster_ambush', name: '奇襲', type: 'damage', target: 'enemy',
    power: 3, mpCost: 7, cooldownTurns: 0,
    conditionBonus: { condition: 'playerFirst', power: 2.1 },
  },
  scoutmaster_recon: {
    // 敵解析（学者「解析」と同じ情報）とDEF低下を同時に行う
    id: 'scoutmaster_recon', name: '偵察', type: 'debuff', target: 'enemy',
    mpCost: 6, cooldownTurns: 1, inspect: true,
    weaken: { stat: 'def', pct: 0.20, turns: 3 },
  },
  scoutmaster_weakshot: {
    id: 'scoutmaster_weakshot', name: '弱点射撃', type: 'damage', target: 'enemy',
    power: 5, mpCost: 9, cooldownTurns: 1, armorPenBonus: 0.20, critBonus: 15,
  },
  scoutmaster_shadowhunt: {
    // 弱体（weaken）またはDoTが乗っている敵へ追加ダメージ
    id: 'scoutmaster_shadowhunt', name: '影狩り', type: 'damage', target: 'enemy',
    power: 9.1, mpCost: 14, cooldownTurns: 2,
    targetBonus: { when: 'debuffed', power: 7 },
  },

  // ---------------------------------------------------------
  // 幻惑の舞姫（thief+dancer）：回避とデバフを連鎖させる。
  // ---------------------------------------------------------
  enchantdancer_illusion: {
    // 敵ATK低下と自分のEvasion上昇を同時に行う（新フィールド selfBuff）
    id: 'enchantdancer_illusion', name: '幻惑舞', type: 'debuff', target: 'enemy',
    mpCost: 7, cooldownTurns: 0,
    weaken: { stat: 'atk', pct: 0.22, turns: 2 },
    selfBuff: { evasionAdd: 0.10, turns: 2 },
  },
  enchantdancer_poison_dance: {
    // バランス再較正：DoT専業技のpowerを底上げ（同上の理由）
    id: 'enchantdancer_poison_dance', name: '毒舞', type: 'debuff', target: 'allEnemies',
    mpCost: 10, cooldownTurns: 1,
    dot: { power: 2.0, turns: 3, maxStacks: 2 },
  },
  enchantdancer_blade_dance: {
    id: 'enchantdancer_blade_dance', name: '剣舞', type: 'damage', target: 'enemy',
    power: 1.67, hits: 3, mpCost: 10, cooldownTurns: 1,
  },
  enchantdancer_dream_flurry: {
    // 戦闘中に回避へ成功した回数に応じて威力上昇（上限あり、過剰乱数防止）
    id: 'enchantdancer_dream_flurry', name: '夢幻乱舞', type: 'damage', target: 'enemy',
    power: 9.1, mpCost: 16, cooldownTurns: 2,
    evasionCountScale: { perCount: 0.35, max: 7 },
  },

  // ---------------------------------------------------------
  // 拳聖（fighter+ninja）：高速コンボで畳みかける。
  // ---------------------------------------------------------
  fistsaint_explosive_fist: {
    id: 'fistsaint_explosive_fist', name: '爆裂拳', type: 'damage', target: 'enemy',
    power: 0.75, hits: 4, mpCost: 8, cooldownTurns: 0,
  },
  fistsaint_afterimage: {
    id: 'fistsaint_afterimage', name: '残影', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { spdPct: 0.30, evasionAdd: 0.12, turns: 3 },
  },
  fistsaint_chain_fist: {
    // 直前の自分の行動が「攻撃系」（通常攻撃かdamage技）だった場合に威力上昇
    id: 'fistsaint_chain_fist', name: '連環拳', type: 'damage', target: 'enemy',
    power: 5, mpCost: 10, cooldownTurns: 1,
    conditionBonus: { condition: 'prevActionAttack', power: 3.5 },
  },
  fistsaint_hundred_strikes: {
    // 固定6hit。通常攻撃のhit数（SPD依存・最大9hit）とは完全に独立した
    // 別設計にしてある（元指示：hit数だけで優位を作らない）
    id: 'fistsaint_hundred_strikes', name: '百裂拳', type: 'damage', target: 'enemy',
    power: 1.52, hits: 6, mpCost: 18, cooldownTurns: 3,
  },

  // ---------------------------------------------------------
  // 暗殺拳（fighter+thief）：会心・処刑・背水の低HPアタッカー。
  // ---------------------------------------------------------
  assassinfist_vital_strike: {
    id: 'assassinfist_vital_strike', name: '急所突き', type: 'damage', target: 'enemy',
    power: 3, mpCost: 7, cooldownTurns: 0, critBonus: 30,
  },
  assassinfist_death_palm: {
    // HP50%以下の敵に追加倍率（新フィールド targetBonus:lowHp）
    id: 'assassinfist_death_palm', name: '致命掌', type: 'damage', target: 'enemy',
    power: 4, mpCost: 9, cooldownTurns: 1,
    targetBonus: { when: 'lowHp', hpThreshold: 0.5, power: 2.8 },
  },
  assassinfist_desperation: {
    // 自HPが低いほど威力上昇（上限あり、即死級暴走は禁止）
    id: 'assassinfist_desperation', name: '背水拳', type: 'damage', target: 'enemy',
    power: 5, mpCost: 10, cooldownTurns: 1,
    lowHpScalePower: { maxBonus: 3.5 },
  },
  assassinfist_assassinate: {
    // 雑魚のみ低確率の即死。Eliteには一切効かず、Bossには即死の代わりに
    // Execution（既存bossDmg/executioner思想と同じ「低HP相手に追加ダメ」）
    // へ変換する（元指示：Boss/Eliteは即死無効・Executionへ変換）
    id: 'assassinfist_assassinate', name: '暗殺', type: 'damage', target: 'enemy',
    power: 9.1, mpCost: 14, cooldownTurns: 3,
    instaKill: { chance: 0.12 },
    targetBonus: { when: 'bossOrElite', power: 7 },
  },

  // ---------------------------------------------------------
  // 猛獣使い（fighter+hunter）：Boss/Eliteとの殴り合いに特化。
  // ---------------------------------------------------------
  beasttamer_beast_strike: {
    id: 'beasttamer_beast_strike', name: '猛獣撃', type: 'damage', target: 'enemy',
    power: 3, mpCost: 7, cooldownTurns: 0,
    targetBonus: { when: 'bossOrElite', power: 2.1 },
  },
  beasttamer_roar: {
    id: 'beasttamer_roar', name: '咆哮', type: 'debuff', target: 'enemy',
    mpCost: 7, cooldownTurns: 1,
    weaken: { stat: 'atk', pct: 0.22, turns: 2 },
  },
  beasttamer_feral: {
    // ATK/SPD上昇、DEFはわずかに低下（獣化のリスク）
    id: 'beasttamer_feral', name: '獣化', type: 'buff', target: 'self',
    mpCost: 10, cooldownTurns: 2,
    buff: { atkPct: 0.25, spdPct: 0.20, defPct: -0.08, turns: 3 },
  },
  beasttamer_king_fang: {
    id: 'beasttamer_king_fang', name: '王獣の牙', type: 'damage', target: 'enemy',
    power: 7.8, mpCost: 15, cooldownTurns: 2,
    targetBonus: { when: 'bossOrElite', power: 6 },
  },

  // ---------------------------------------------------------
  // 剛力士（fighter+farmer）：高HP・重打・耐えるほど強い。
  // ---------------------------------------------------------
  sumo_slap: {
    id: 'sumo_slap', name: '張り手', type: 'damage', target: 'enemy',
    power: 1, hits: 3, mpCost: 7, cooldownTurns: 0,
  },
  sumo_immovable: {
    // 状態異常耐性相当は現状プレイヤーへ与える敵手段が無いためDEF上昇のみが
    // 実効効果（僧侶「浄化」と同じ将来拡張向けスキャフォールド）
    id: 'sumo_immovable', name: '不動', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { defPct: 0.28, turns: 3 },
  },
  sumo_body_slam: {
    id: 'sumo_body_slam', name: '渾身投げ', type: 'damage', target: 'enemy',
    power: 4, mpCost: 11, cooldownTurns: 1,
  },
  sumo_stand_firm: {
    // 農民「根性」と同型：HP一定以下で恩恵が跳ね上がる（通常時も最低限の
    // DEF上昇は必ず得られる）
    id: 'sumo_stand_firm', name: '仁王立ち', type: 'buff', target: 'self',
    mpCost: 10, cooldownTurns: 2,
    lowHpThreshold: 0.4,
    buff: { defPct: 0.15, turns: 3 },
    lowHpBonus: { defPct: 0.35, atkPct: 0.20, turns: 3 },
  },

  // ---------------------------------------------------------
  // 狩猟王（hunter+ninja）：Boss/Eliteへ「印」を刻んで狩る高速狙撃。
  // ---------------------------------------------------------
  huntking_weakshot: {
    id: 'huntking_weakshot', name: '弱点狙撃', type: 'damage', target: 'enemy',
    power: 3, mpCost: 7, cooldownTurns: 0, armorPenBonus: 0.30,
  },
  huntking_followup: {
    // 会心が出た場合、同じ相手へ即座に追撃を1回加える（新フィールド critFollowup）
    id: 'huntking_followup', name: '追撃', type: 'damage', target: 'enemy',
    power: 4, mpCost: 9, cooldownTurns: 1,
    critFollowup: { powerMult: 0.9 },
  },
  huntking_mark: {
    // Boss/Elite限定でマーク（既存weakenとは別枠のenemy.vulnerable）を刻む。
    // マーク中は与ダメージが割増（calculateDamage側で一律適用）になる
    id: 'huntking_mark', name: '狩人の印', type: 'debuff', target: 'enemy',
    mpCost: 10, cooldownTurns: 2,
    vulnerable: { pct: 0.15, turns: 3, bossEliteOnly: true },
  },
  huntking_slayer: {
    // マーク中の相手へ大ダメージ（マーク自体の割増＋この技固有の追加倍率の二重取り）
    id: 'huntking_slayer', name: '魔獣殺し', type: 'damage', target: 'enemy',
    power: 9.1, mpCost: 16, cooldownTurns: 2,
    targetBonus: { when: 'marked', power: 7 },
  },

  // ---------------------------------------------------------
  // 森の吟遊詩人（hunter+bard）：自然の回復力と遠距離支援。
  // ---------------------------------------------------------
  forestbard_spirit_arrow: {
    id: 'forestbard_spirit_arrow', name: '精霊矢', type: 'damage', target: 'enemy',
    hybrid: true, power: 3, mpCost: 7, cooldownTurns: 0,
  },
  forestbard_forest_song: {
    id: 'forestbard_forest_song', name: '森の歌', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { regenAdd: 0.025, turns: 4 },
  },
  forestbard_hunters_cheer: {
    id: 'forestbard_hunters_cheer', name: '狩人の鼓舞', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { atkPct: 0.22, spdPct: 0.18, turns: 3 },
  },
  forestbard_spirit_blessing: {
    id: 'forestbard_spirit_blessing', name: '精霊の祝福', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 2,
    buff: { regenAdd: 0.03, critAdd: 15, spdPct: 0.15, turns: 3 },
  },

  // ---------------------------------------------------------
  // プリマ・ディーヴァ（bard+dancer）：歌と舞を同時に操る万能支援。
  // ---------------------------------------------------------
  primadiva_sword_aria: {
    // 攻撃と同時に自分のATKも上げる（新フィールド selfBuff、damage側でも利用可）
    id: 'primadiva_sword_aria', name: '剣の舞曲', type: 'damage', target: 'enemy',
    power: 3, mpCost: 8, cooldownTurns: 1,
    selfBuff: { atkPct: 0.15, turns: 2 },
  },
  primadiva_evasion_aria: {
    id: 'primadiva_evasion_aria', name: '回避の舞曲', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { evasionAdd: 0.14, spdPct: 0.18, turns: 3 },
  },
  primadiva_healing_aria: {
    id: 'primadiva_healing_aria', name: '癒しの舞曲', type: 'heal', target: 'self',
    healPct: 0.20, mpCost: 10, cooldownTurns: 1,
    buff: { regenAdd: 0.02, turns: 3 },
  },
  primadiva_queens_stage: {
    // 各ステータスの上昇幅は小さめに抑えた複合バフ（強すぎる万能技を避ける）
    id: 'primadiva_queens_stage', name: '女王の舞台', type: 'buff', target: 'self',
    mpCost: 16, cooldownTurns: 3,
    buff: { atkPct: 0.14, defPct: 0.14, spdPct: 0.14, critAdd: 10, turns: 3 },
  },

  // ---------------------------------------------------------
  // 語り部（bard+scholar）：解析と長期バフで戦況を支配する。
  // ---------------------------------------------------------
  loremaster_heroic_tale: {
    // バランス再較正：語り部は直接ダメージ技も回復技も持たず通常攻撃が
    // 唯一の攻撃手段のため、ATKバフを強めにして通常攻撃だけでも十分な
    // 火力が出るようにし、さらに回復手段の代わりとしてDEFも同時に上げる
    // （元指示：45職横比較で勝率が極端に低い職の是正。Boss予兆の重さが
    // 目安どおりに引き上がったことで、無防備な支援型職の生存が特に厳しく
    // なったため、ぼうぎょと併用できる自己バフとして機能させる）
    id: 'loremaster_heroic_tale', name: '英雄譚', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { atkPct: 0.45, defPct: 0.25, turns: 3 },
  },
  loremaster_monster_lore: {
    // バランス再較正：語り部は回復技を一切持たないため、唯一の継戦手段
    // としてこの技にRegenを追加する（既存selfBuff機構の再利用のみ、
    // 新しい回復経路は作らない）
    id: 'loremaster_monster_lore', name: '魔物語り', type: 'debuff', target: 'enemy',
    mpCost: 6, cooldownTurns: 1, inspect: true,
    weaken: { stat: 'def', pct: 0.18, turns: 3 },
    selfBuff: { regenAdd: 0.035, turns: 4 },
  },
  loremaster_victory_tale: {
    // 撃破時に短時間バフが自動発動する一時効果を仕込む（新effect種
    // selfBuffOnKill：onKillトリガーに新規追加、既存の発火経路をそのまま使う）
    id: 'loremaster_victory_tale', name: '勝利の物語', type: 'utility', target: 'self',
    mpCost: 9, cooldownTurns: 1,
    tempEffect: { effect: { trigger: 'onKill', kind: 'selfBuffOnKill', buffPayload: { atkPct: 0.15, turns: 2 } }, turns: 4 },
  },
  loremaster_legend_verse: {
    // 数ターン与ダメージ＋経験値取得の両方を底上げする（新フィールド expMultAdd）
    id: 'loremaster_legend_verse', name: '伝説の一節', type: 'buff', target: 'self',
    mpCost: 15, cooldownTurns: 3,
    buff: { dmgBonusAdd: 0.40, expMultAdd: 0.20, turns: 3 },
  },

  // ---------------------------------------------------------
  // 運命の踊り子（dancer+fortune）：Crit・Evasion・行動順の運を操る。
  // ---------------------------------------------------------
  fatedancer_lucky_dance: {
    id: 'fatedancer_lucky_dance', name: '幸運舞', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { critAdd: 20, turns: 3 },
  },
  fatedancer_evasion_dance: {
    id: 'fatedancer_evasion_dance', name: '回避舞', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { evasionAdd: 0.16, turns: 3 },
  },
  fatedancer_fate_reverse: {
    id: 'fatedancer_fate_reverse', name: '運命反転', type: 'debuff', target: 'enemy',
    mpCost: 8, cooldownTurns: 1,
    weaken: { stat: 'atk', pct: 0.30, turns: 1 },
  },
  fatedancer_grand_wheel: {
    id: 'fatedancer_grand_wheel', name: '運命の大輪', type: 'buff', target: 'self',
    mpCost: 15, cooldownTurns: 3,
    buff: { critAdd: 20, evasionAdd: 0.14, spdPct: 0.15, turns: 3 },
  },

  // ---------------------------------------------------------
  // 幻術師（dancer+alchemist）：幻惑・毒・DoTを連鎖させる。
  // ---------------------------------------------------------
  illusionist_poison_mist: {
    // バランス再較正：DoT専業技のpowerを底上げ（同上の理由）
    id: 'illusionist_poison_mist', name: '毒霧', type: 'debuff', target: 'allEnemies',
    mpCost: 10, cooldownTurns: 1,
    dot: { power: 1.5, turns: 3, maxStacks: 2 },
  },
  illusionist_hallucination: {
    // 敵ATK・SPDを同時に弱体（weakenが配列を受理できるよう一般化済み）
    id: 'illusionist_hallucination', name: '幻覚', type: 'debuff', target: 'enemy',
    mpCost: 8, cooldownTurns: 1,
    weaken: [{ stat: 'atk', pct: 0.20, turns: 2 }, { stat: 'spd', pct: 0.20, turns: 2 }],
  },
  illusionist_corrosion: {
    // バランス再較正：DoT成分のpowerを底上げ（weaken部分は変更しない）
    id: 'illusionist_corrosion', name: '腐食', type: 'debuff', target: 'enemy',
    mpCost: 9, cooldownTurns: 1,
    weaken: { stat: 'def', pct: 0.20, turns: 3 },
    dot: { power: 2.0, turns: 3, maxStacks: 2 },
  },
  illusionist_toxic_burst: {
    // 対象にかかっているデバフ／DoTの数に応じて追加ダメージ（burst型を
    // stackSource:'debuffCount'で汎用化。既存の起爆＝dotStacks消費とは
    // 別カウント方式だが、同じ_resolveTechniqueBurst()を共有する）
    id: 'illusionist_toxic_burst', name: '幻毒爆', type: 'burst', target: 'enemy',
    power: 3.76, stackPowerMult: 1.37, stackSource: 'debuffCount', mpCost: 14, cooldownTurns: 2,
  },

  // ---------------------------------------------------------
  // アルカニスト（alchemist+scholar）：魔法理論で錬金効果を底上げする。
  // ---------------------------------------------------------
  arcanist_element_shift: {
    // 次の1ラウンドだけ与ダメージ全般を上げる（既存dmgBonusAddの再利用）
    id: 'arcanist_element_shift', name: '属性変換', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { dmgBonusAdd: 0.20, turns: 1 },
  },
  arcanist_circle: {
    // 自分がかけるweaken/dotの効果量を一時的に底上げする（新フィールド debuffPowerAdd）
    id: 'arcanist_circle', name: '錬成陣', type: 'buff', target: 'self',
    mpCost: 9, cooldownTurns: 2,
    buff: { debuffPowerAdd: 0.30, turns: 3 },
  },
  arcanist_catalyst: {
    id: 'arcanist_catalyst', name: '賢者の触媒', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    buff: { dmgBonusAdd: 0.25, debuffPowerAdd: 0.25, turns: 2 },
  },

  // ---------------------------------------------------------
  // 魔導技師（alchemist+craftsman）：機械仕掛けの継続火力と装甲。
  // ---------------------------------------------------------
  artificer_mana_cannon: {
    id: 'artificer_mana_cannon', name: '魔導砲', type: 'damage', target: 'enemy',
    magic: true, power: 3, mpCost: 9, cooldownTurns: 0,
  },
  artificer_armor_boost: {
    id: 'artificer_armor_boost', name: '装甲強化', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 1,
    buff: { defPct: 0.25, turns: 3 },
  },
  artificer_auto_turret: {
    // ラウンド終了時に自動で追撃する「据え置き砲台」を設置する（新フィールド
    // autoTurretArm）。実弾やsummonは作らず、既存の_afterRoundChecks()側に
    // ダメージtickを1つ足すだけの軽量な仕組みとして実装する
    id: 'artificer_auto_turret', name: '自動砲台', type: 'utility', target: 'self',
    mpCost: 12, cooldownTurns: 3,
    autoTurretArm: { power: 0.5, turns: 4 },
  },
  artificer_overdrive: {
    // 自動砲台の威力を底上げしつつ、魔導砲側にもダメージボーナスを乗せる。
    // 代償としてDEFがわずかに下がる
    id: 'artificer_overdrive', name: '超過駆動', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    buff: { dmgBonusAdd: 0.15, defPct: -0.10, turretPowerAdd: 0.35, turns: 3 },
  },

  // ---------------------------------------------------------
  // 大商人（merchant+scholar）：経済効率と戦術眼を両立する。
  // ---------------------------------------------------------
  merchantlord_haggle: {
    // 数ターン、Gold消費技のコストを割り引く（新フィールド goldCostReduceAdd）
    id: 'merchantlord_haggle', name: '値切り', type: 'buff', target: 'self',
    mpCost: 5, cooldownTurns: 1,
    buff: { goldCostReduceAdd: 0.4, turns: 3 },
  },
  merchantlord_investment: {
    id: 'merchantlord_investment', name: '投資', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { atkPct: 0.20, magPct: 0.20, turns: 3 },
    goldCostPct: 0.06, goldCostMin: 15,
  },
  merchantlord_appraising_eye: {
    id: 'merchantlord_appraising_eye', name: '鑑定眼', type: 'buff', target: 'self',
    mpCost: 8, cooldownTurns: 2,
    buff: { dropRateMultAdd: 0.4, turns: 4 },
  },
  merchantlord_market_control: {
    // 戦闘終了（クリア）時にGold・Dropを追加する。既存runGoldに対する割合
    // ボーナスなので無限増殖にはならない（元指示：無限増殖禁止）
    id: 'merchantlord_market_control', name: '市場支配', type: 'utility', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    bonusRewardArm: { goldPct: 0.15, dropChance: 0.35 },
  },

  // ---------------------------------------------------------
  // ギルドマスター（merchant+craftsman）：指揮・補給・防衛管理。
  // ---------------------------------------------------------
  guildmaster_command: {
    // バランス再較正：ギルドマスターも直接ダメージ技を持たない支援型のため、
    // ATKバフを強めにして通常攻撃だけで十分にBossを削れるようにする
    id: 'guildmaster_command', name: '号令', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { atkPct: 0.30, defPct: 0.15, turns: 2 },
  },
  guildmaster_supply: {
    // Gold消費でHP/MPを同時回復する（新フィールド mpRestorePct）
    id: 'guildmaster_supply', name: '補給', type: 'heal', target: 'self',
    healPct: 0.20, mpRestorePct: 0.25, mpCost: 3, cooldownTurns: 1,
    goldCostPct: 0.05, goldCostMin: 15,
  },
  guildmaster_defense_order: {
    id: 'guildmaster_defense_order', name: '防衛指令', type: 'utility', target: 'self',
    mpCost: 10, cooldownTurns: 2,
    guardOverride: { mult: 0.4, turns: 3 },
  },
  guildmaster_mobilize: {
    id: 'guildmaster_mobilize', name: '総動員', type: 'buff', target: 'self',
    mpCost: 12, cooldownTurns: 3,
    buff: { atkPct: 0.40, defPct: 0.20, spdPct: 0.15, turns: 3 },
    goldCostPct: 0.12, goldCostMin: 40,
  },

  // ---------------------------------------------------------
  // 村の癒し手（priest+farmer）：高HP・Regen中心の素朴な回復役。呪文はspells.js側。
  // ---------------------------------------------------------
  healerfolk_vitality: {
    id: 'healerfolk_vitality', name: '生命力', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { regenAdd: 0.025, turns: 4 },
  },

  // ---------------------------------------------------------
  // 鉄農兵（farmer+craftsman）：超耐久・反撃・範囲の農民系タンク。
  // ---------------------------------------------------------
  ironyeoman_scythe_storm: {
    id: 'ironyeoman_scythe_storm', name: '鎌乱舞', type: 'damage', target: 'allEnemies',
    power: 3, mpCost: 8, cooldownTurns: 1,
  },
  ironyeoman_iron_skin: {
    id: 'ironyeoman_iron_skin', name: '鉄皮', type: 'buff', target: 'self',
    mpCost: 7, cooldownTurns: 1,
    buff: { defPct: 0.30, turns: 3 },
  },
  ironyeoman_counter_formation: {
    id: 'ironyeoman_counter_formation', name: '反撃陣', type: 'utility', target: 'self',
    mpCost: 9, cooldownTurns: 2,
    tempEffect: { effect: { trigger: 'onHurt', kind: 'counter', power: 0.35 }, turns: 3 },
  },
  ironyeoman_unbroken: {
    // HP低下時にGuard強化＋ATK上昇（farmer_grit系のlowHpBonusを、
    // guardOverrideも設定できるよう一般化して利用する）
    id: 'ironyeoman_unbroken', name: '不屈の農兵', type: 'buff', target: 'self',
    mpCost: 12, cooldownTurns: 2,
    lowHpThreshold: 0.4,
    buff: { defPct: 0.15, turns: 3 },
    lowHpBonus: { atkPct: 0.25, turns: 3, guardOverride: { mult: 0.4, turns: 3 } },
  },
};

export function getSkill(id) { return SKILLS[id] || null; }
