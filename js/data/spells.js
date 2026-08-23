/* ============================================================
   じゅもん（spells）データ定義
   ------------------------------------------------------------
   職業ごとの「じゅもん」の実体。jobs.js側は「どのjobがどのspellを
   Lvいくつで覚えるか」だけを参照する（技IDと職業IDの分離）。
   スキーマはjs/data/skills.jsと共通（type/target/mpCost/
   cooldownTurns等）。呪文は原則cooldownTurns:0でMPのみで制御する
   （MASTER級の一部のみクールダウン併用）。

   基本職15種のうち、じゅもんを持つのは
   魔法使い・僧侶・学者・占い師の4職のみ（他11職はspells:[]）。
   忍者の「火遁」は忍術だがとくぎ側（skills.js）に置いている
   （元指示：UI上はとくぎ側に見せても構わない）。

   属性（fire/ice/lightning）は現状のBlade Valeに属性耐性システムが
   存在しないため、フレーバーテキストのみで機械的な効果は持たない。
   新しい属性耐性システムを今回新設することはしない。
   ============================================================ */

export const SPELLS = {
  // ---------------------------------------------------------
  // 魔法使い：MPを消費して高火力。低耐久。
  // ---------------------------------------------------------
  mage_fireball: {
    id: 'mage_fireball', name: '火球', type: 'damage', target: 'enemy', magic: true, element: 'fire',
    power: 2.3, mpCost: 6, cooldownTurns: 0,
  },
  mage_ice_lance: {
    // 低確率で敵を1ターン行動阻害（完全ハメ防止のため確率・持続とも小さめ）
    id: 'mage_ice_lance', name: '氷槍', type: 'damage', target: 'enemy', magic: true, element: 'ice',
    power: 2.6, mpCost: 9, cooldownTurns: 0,
    stunChance: 0.15, stunTurns: 1, stunExcludesBoss: true,
  },
  mage_thunder: {
    id: 'mage_thunder', name: '雷撃', type: 'damage', target: 'enemy', magic: true, element: 'lightning',
    power: 3.4, mpCost: 12, cooldownTurns: 0,
  },
  mage_inferno: {
    id: 'mage_inferno', name: '爆炎', type: 'damage', target: 'allEnemies', magic: true, element: 'fire',
    power: 2.6, mpCost: 20, cooldownTurns: 2,
  },

  // ---------------------------------------------------------
  // 僧侶：回復・防御・継戦能力。
  // ---------------------------------------------------------
  priest_heal: {
    id: 'priest_heal', name: 'ヒール', type: 'heal', target: 'self',
    healPct: 0.22, mpCost: 8, cooldownTurns: 0,
  },
  priest_guard_blessing: {
    id: 'priest_guard_blessing', name: '守護', type: 'buff', target: 'self',
    mpCost: 9, cooldownTurns: 1,
    buff: { defPct: 0.30, turns: 3 },
  },
  priest_purify: {
    // 現状の敵側の攻撃手段にプレイヤーへweaken/DoTを与えるものが存在しない
    // ため、実質的には将来の拡張（Bossがプレイヤーを弱体化させる攻撃を
    // 追加する場合）に備えたスキャフォールドとして動作する
    id: 'priest_purify', name: '浄化', type: 'cleanse', target: 'self',
    mpCost: 7, cooldownTurns: 0,
  },
  priest_full_heal: {
    id: 'priest_full_heal', name: '大回復', type: 'heal', target: 'self',
    healPct: 0.55, mpCost: 20, cooldownTurns: 2,
  },

  // ---------------------------------------------------------
  // 学者：Lv10のみ。他は弱点看破・解析・完全解析（skills.js側）。
  // ---------------------------------------------------------
  scholar_elemental: {
    id: 'scholar_elemental', name: '元素術', type: 'damage', target: 'enemy', magic: true, element: 'random',
    power: 3.0, mpCost: 10, cooldownTurns: 0,
  },

  // ---------------------------------------------------------
  // 占い師：MASTERのみ。他は運命の逆転・吉兆・凶兆（skills.js側）。
  // ---------------------------------------------------------
  fortune_star_guidance: {
    // 既存のhaste（SPD/先攻ボーナス）機構をそのまま再利用して
    // 「次ターンの行動順を有利にする」を表現する
    id: 'fortune_star_guidance', name: '星の導き', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 2,
    buff: { critAdd: 20, turns: 2 },
    haste: { power: 30, turns: 2 },
  },

  /* ============================================================
     ここから上級職30種（第2フェーズ）。呪文はmage/priest/scholar/fortune
     の系譜を継ぐ職にのみ持たせる（元指示：呪文と特技の比率は自由）。
     属性（fire/ice/lightning/random）は既存同様フレーバーのみ。
     ============================================================ */

  // ---------------------------------------------------------
  // 賢者（mage+priest）：攻撃魔法と回復を高効率で両立する。
  // ---------------------------------------------------------
  sage_mid_flame: {
    id: 'sage_mid_flame', name: '中級火炎', type: 'damage', target: 'enemy', magic: true, element: 'fire',
    power: 2.6, mpCost: 9, cooldownTurns: 0,
  },
  sage_mid_heal: {
    id: 'sage_mid_heal', name: '中級回復', type: 'heal', target: 'self',
    healPct: 0.30, mpCost: 10, cooldownTurns: 0,
  },
  sage_twin_cast: {
    // 次に唱えるspellを2回発動させる（MP消費も2回分）。armDoubleCastで
    // 「予約」だけしておき、実際の二重発動は_playerTechnique()側で処理する。
    // 自分自身の再発動は明示的に除外してあるため無限ループは起こらない
    id: 'sage_twin_cast', name: '連続詠唱', type: 'utility', target: 'self',
    mpCost: 12, cooldownTurns: 3,
    armDoubleCast: true,
  },

  // ---------------------------------------------------------
  // 大魔導士（mage+scholar）：純魔法の最大火力。
  // ---------------------------------------------------------
  archmage_explosion: {
    id: 'archmage_explosion', name: '爆炎', type: 'damage', target: 'allEnemies', magic: true, element: 'fire',
    power: 3.0, mpCost: 18, cooldownTurns: 1,
  },
  archmage_absolute_zero: {
    id: 'archmage_absolute_zero', name: '極氷', type: 'damage', target: 'enemy', magic: true, element: 'ice',
    power: 3.6, mpCost: 14, cooldownTurns: 0,
    stunChance: 0.15, stunTurns: 1, stunExcludesBoss: true,
  },
  archmage_swift_thunder: {
    id: 'archmage_swift_thunder', name: '迅雷', type: 'damage', target: 'enemy', magic: true, element: 'lightning',
    power: 4.0, mpCost: 16, cooldownTurns: 1,
  },
  archmage_manic_surge: {
    // spellPowerを大幅に上げる代わりに、この技自体のMPコストを高くしてある
    // （元指示：MP消費も増える等の代償を付ける）
    id: 'archmage_manic_surge', name: '魔力暴走', type: 'buff', target: 'self',
    mpCost: 20, cooldownTurns: 3,
    buff: { dmgBonusAdd: 0.30, turns: 3 },
  },

  // ---------------------------------------------------------
  // 星詠みの魔女（mage+fortune）：魔法とCrit/未来予測を融合する。
  // ---------------------------------------------------------
  astromancer_star_bullet: {
    id: 'astromancer_star_bullet', name: '星弾', type: 'damage', target: 'enemy', magic: true,
    power: 2.6, mpCost: 8, cooldownTurns: 0, critBonus: 15,
  },
  astromancer_star_eclipse: {
    // 敵ATK・MAG相当を同時に弱体化（weakenの配列受理を利用）
    id: 'astromancer_star_eclipse', name: '星蝕', type: 'debuff', target: 'enemy',
    mpCost: 9, cooldownTurns: 1,
    weaken: [{ stat: 'atk', pct: 0.20, turns: 2 }, { stat: 'def', pct: 0.15, turns: 2 }],
  },
  astromancer_meteor: {
    // ランダムな相手へ独立して3hit（過剰乱数防止のためhit数は固定）
    id: 'astromancer_meteor', name: '流星', type: 'damage', target: 'randomEnemies',
    power: 1.1, hits: 3, magic: true, mpCost: 16, cooldownTurns: 2,
  },
  astromancer_star_blessing: {
    id: 'astromancer_star_blessing', name: '星の加護', type: 'buff', target: 'self',
    mpCost: 14, cooldownTurns: 2,
    buff: { critAdd: 15, spdPct: 0.15, defPct: 0.15, turns: 3 },
  },

  // ---------------------------------------------------------
  // 巫女（priest+fortune）：結界・浄化・Boss予兆対策。
  // ---------------------------------------------------------
  miko_prayer_chant: {
    id: 'miko_prayer_chant', name: '祝詞', type: 'buff', target: 'self',
    mpCost: 6, cooldownTurns: 1,
    buff: { regenAdd: 0.03, turns: 3 },
  },
  miko_barrier: {
    // 既存の不屈の構え/魔法障壁と同型：Boss特殊攻撃軽減として扱う
    id: 'miko_barrier', name: '結界', type: 'buff', target: 'self',
    mpCost: 9, cooldownTurns: 1,
    buff: { defPct: 0.15, bossGuardPct: 0.35, turns: 3 },
  },
  miko_purification: {
    // 僧侶「浄化」と同じ将来拡張向けスキャフォールド＋短時間の耐性フラグ
    id: 'miko_purification', name: '厄払い', type: 'cleanse', target: 'self',
    mpCost: 7, cooldownTurns: 1, immuneTurns: 3,
  },
  miko_oracle: {
    // Boss予兆が出ている間に使うと、通常のガード強化に加えさらに軽減が乗る
    // （specialKind自体は既存のBattleLogがすでに予兆時点で開示している）
    id: 'miko_oracle', name: '神託', type: 'utility', target: 'self',
    mpCost: 14, cooldownTurns: 3,
    buff: { defPct: 0.10, turns: 2 },
    telegraphBonus: { guardOverride: { mult: 0.35, turns: 1 }, buff: { defPct: 0.10, turns: 2 } },
  },

  // ---------------------------------------------------------
  // 聖歌隊長（priest+bard）：歌による回復と守護。特技はskills.js側。
  // ---------------------------------------------------------
  choirmaster_healing_chorus: {
    id: 'choirmaster_healing_chorus', name: '癒しの合唱', type: 'heal', target: 'self',
    healPct: 0.28, mpCost: 12, cooldownTurns: 0,
    buff: { regenAdd: 0.02, turns: 3 },
  },
  choirmaster_miracle_chorus: {
    // 強力だが高MP・高CD（元指示どおり）
    id: 'choirmaster_miracle_chorus', name: '奇跡の大合唱', type: 'heal', target: 'self',
    healPct: 0.45, mpCost: 20, cooldownTurns: 3,
    buff: { atkPct: 0.12, defPct: 0.12, turns: 3 },
  },

  // ---------------------------------------------------------
  // アルカニスト（alchemist+scholar）：学者由来の呪文を1つだけ持つ。
  // ---------------------------------------------------------
  arcanist_mana_bomb: {
    id: 'arcanist_mana_bomb', name: '魔力爆弾', type: 'damage', target: 'allEnemies', magic: true,
    power: 2.4, mpCost: 12, cooldownTurns: 1,
  },

  // ---------------------------------------------------------
  // 村の癒し手（priest+farmer）：僧侶由来の回復呪文。特技はskills.js側。
  // ---------------------------------------------------------
  healerfolk_herbal_cure: {
    id: 'healerfolk_herbal_cure', name: '薬草治療', type: 'heal', target: 'self',
    healPct: 0.20, mpCost: 5, cooldownTurns: 0,
  },
  healerfolk_earthguard: {
    id: 'healerfolk_earthguard', name: '大地の守り', type: 'heal', target: 'self',
    healPct: 0.18, mpCost: 8, cooldownTurns: 1,
    buff: { defPct: 0.20, turns: 3 },
  },
  healerfolk_miracle: {
    // 1戦1回・大回復中心（死亡回避ではない）。oncePerBattleで厳密に1回に絞る
    id: 'healerfolk_miracle', name: '村人の奇跡', type: 'heal', target: 'self',
    healPct: 0.60, mpCost: 18, cooldownTurns: 3, oncePerBattle: true,
  },
};

export function getSpell(id) { return SPELLS[id] || null; }
