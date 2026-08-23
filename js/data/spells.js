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
};

export function getSpell(id) { return SPELLS[id] || null; }
