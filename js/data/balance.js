/* ============================================================
   バランス設定（Blade Vale 2.0 Phase 1）
   ------------------------------------------------------------
   ゲームロジックのコードを書き換えずに数値だけで調整できるよう、
   全レイヤーの主要な倍率・しきい値をここに集約する。
   Phase 1 の時点では既存の数値を「そのまま」ここへ移しただけで、
   ゲームバランス自体は変更していない（構造の整理のみ）。
   ============================================================ */

// ---------------------------------------------------------
// A. キャラクター成長レイヤー
// レベル1時点の素の基礎値／1レベルあたりの素の伸び
// （tier補正・職業profile補正はこの上でjobs.js側が掛け合わせる）
// ---------------------------------------------------------
export const CHARACTER_LAYER = {
  STAT_BASE: { hp: 44, mp: 8, atk: 6, def: 5, mag: 5, spd: 5, crit: 3 },
  STAT_GROWTH: { hp: 4.5, mp: 1.2, atk: 1, def: 1, mag: 1, spd: 0.4, crit: 0.15 },
};

// ---------------------------------------------------------
// B. 職業成長レイヤー（基本→上級→特級→勇者）
// ---------------------------------------------------------
export const JOB_TIER = {
  basic:    { order: 0, changeableLv: 10,   masteryLv: 15,   baseMult: 1.0, growthMult: 1.0 },
  advanced: { order: 1, changeableLv: 20,   masteryLv: 30,   baseMult: 1.5, growthMult: 2.0 },
  special:  { order: 2, changeableLv: 30,   masteryLv: 50,   baseMult: 2.1, growthMult: 3.3 },
  hero:     { order: 3, changeableLv: null, masteryLv: null, baseMult: 3.0, growthMult: 5.3 },
};

// ---------------------------------------------------------
// C. 装備成長レイヤー（武器種・レアリティ・強化・ルーン・武器熟練）
// ---------------------------------------------------------
export const EQUIPMENT_LAYER = {
  RARITY_MULT: { normal: 1.0, rare: 1.6, epic: 2.4, legendary: 3.6, mythic: 5.4 },

  WEAPON_AFFINITY_BONUS: 0.08,      // 得意武器種を装備中、主要ステータスに+8%

  ENHANCE_MAX_LEVEL: 10,
  ENHANCE_BONUS_PER_LEVEL: 0.05,    // 強化+1レベルごとに武器のステータス+5%
  ENHANCE_GOLD_BASE: 30,
  ENHANCE_GOLD_PER_LEVEL: 40,       // cost(level) = BASE + level * PER_LEVEL

  RUNE_SLOT_LEVEL_THRESHOLDS: [3, 6, 9], // このLv到達ごとにルーンスロット+1（初期1、最大4）

  WEAPON_MASTERY_KILLS_REQUIRED: 300,     // その武器種を装備して倒した数。到達で全職業が使用可に

  // スロットごとの基礎威力（章倍率・レアリティ倍率を掛ける前の値）
  BASE_POWER: { weapon: 4, shield: 4, head: 3, body: 4, accessory: 3 },
};

// ---------------------------------------------------------
// D. 転生成長レイヤー
// ---------------------------------------------------------
export const REBIRTH_LAYER = {
  STAT_BONUS_PER_REBIRTH: 0.03,     // 現行：転生1回につき全ステータス+3%（永続・加算）
  GOLD_COST_BASE: 500,
  GOLD_COST_PER_REBIRTH: 800,
  MANASTONE_COST_BASE: 30,
  MANASTONE_COST_PER_REBIRTH: 40,
};

// ---------------------------------------------------------
// 敵スケーリング（難易度リバランス：章立て指数スケーリング）
// ------------------------------------------------------------
// 【リバランス前の問題点】旧設計は「章が1つ進むごとに+35%（線形加算）」
// だった。一方プレイヤー側の実効火力は、レアリティ倍率(×5.4)・レベル
// 倍率・強化(+50%)・目覚め(+24%)・極Affix2本(+15%×2)・会心率(〜75%)・
// 攻撃速度(下限0.35秒)・転生/職業MASTER/覚醒ツリーの永続倍率など、8系統
// 以上が乗算で積み重なる（詳細はDamage Bucketの節を参照）。実測シミュレー
// ションでは、標準プレイヤーの通常攻撃DPSが1章→10章で約32倍に伸びる一方、
// 敵HPは線形+35%/章では章10時点でも4.15倍にしかならず、通常敵の体感
// TTKは全チェックポイントで0.02〜0.6秒（目標1〜5秒）という「一撃で消える」
// 状態になっていた。
//
// 【新設計】章立てを「1〜5章（序盤〜中盤：急勾配）」と「6〜10章
// （中盤〜終盤：緩勾配）」の2区間指数スケーリングに変更した（元指示19番の
// Piecewise Scalingの考え方を深淵だけでなく本編にも適用）。序盤の急勾配は
// 「会心率・攻撃速度が上限に向かって急激に伸びる」プレイヤー側の実測DPS
// 成長カーブに追随するため。終盤の緩勾配は、上限到達後はビルド・Affix・
// 職業シナジーで殴り合う設計（元指示9番の「7〜8章：ビルドを意識」）に
// 合わせたもの。BASE_MULTは章1時点で必要な底上げ分（敵の攻撃力が
// 「1ダメージ床効かない」ほど低すぎた問題の是正）。
// 数値は /tmp/balance_sim.mjs によるシミュレーションで
// 標準プレイヤー(B)の通常敵TTKが章1〜10で概ね2〜4.5秒に収まるよう較正した。
// ---------------------------------------------------------
export const ENEMY_SCALING = {
  PIVOT_CHAPTER: 5,
  // BASE_MULTはn=1（第1章）の値。5.5/3.6/2.2→4.0/2.9/1.8→2.0/1.45/0.9と
  // 段階的に下げてきたが、最終的にPlaywrightでの実プレイテストで判明したのは
  // 「1体との1対1」では勝てても、1-1の本当のwave（グラント5体、1.4秒間隔で
  // 湧く）を待ち構えて実際に全滅させるまでの合計戦闘時間で見ると、接触
  // ダメージによる生存時間（無敵時間0.9秒ごとに1発を受けると仮定した
  // ワーストケース）を上回ってしまい、キャラを一切動かさなくても勝てる
  // 想定で計算し直す必要があった、という点。5体合計のHPを倒し切るのに
  // かかる時間 < 無限に棒立ちしても死なない生存時間、を満たすまで章1到達値を
  // さらに引き下げた。章5・10の到達値（シミュレーションで目標TTK帯に収まる
  // ことを確認済み）は変えず、EARLY_RATEを引き上げて章5時点の到達値が
  // 変わらないよう再フィットしている。
  HP_BASE_MULT: 1.0,    HP_EARLY_RATE: 2.97, HP_LATE_RATE: 1.28,
  ATK_BASE_MULT: 0.75,  ATK_EARLY_RATE: 2.17, ATK_LATE_RATE: 1.16,
  DEF_BASE_MULT: 0.45,  DEF_EARLY_RATE: 2.05, DEF_LATE_RATE: 1.22,

  // Boss専用のHPカーブ（Phase 6再シミュレーションで発覚した問題への対処）。
  // Boss素体（BOSS_BASE.hp=420）は元々、通常敵素体（NORMAL_BASE.hp=26）の
  // 約16倍というテーブル固定比率を持つ。上のHP_*カーブをBossにもそのまま
  // 使うと、章が進んでHP_*の倍率が伸びるほどこの16倍比率がそのまま保存
  // されてしまい、章10でBossのHPだけが通常敵の16倍＝TTKが約300秒（目標の
  // 20〜45秒を大幅に超過）という壊れた結果になった。BossのDEFは通常敵と
  // 同じ成長率のままにして「防御の高さ」でBossの硬さを表現しつつ、HPの
  // 伸び自体はこの専用カーブでゆるめ、章10でBoss実HPが通常敵実HPの
  // 約2.2倍（序盤は約3.5倍）に収まるよう較正した。Bossを「壁」にする役割は
  // HPの絶対量ではなく、DEF＋新設のBoss AI（フェーズ2・予兆付き範囲攻撃／
  // 突進／遠距離攻撃／雑魚召喚）が担う設計（元指示10・11番）。
  BOSS_HP_BASE_MULT: 1.19, BOSS_HP_EARLY_RATE: 1.99, BOSS_HP_LATE_RATE: 1.22,
};

// 章立てスケーリングの共通計算（1〜PIVOTは指数EARLY_RATE、PIVOT以降は
// EARLY_RATEで到達した値を起点にLATE_RATEでさらに伸ばす、2区間の
// 複合指数関数）。n=1のとき必ずBASE_MULTを返す。
export function chapterScaleMult(baseMult, earlyRate, lateRate, pivot, n) {
  if (n <= pivot) return baseMult * Math.pow(earlyRate, n - 1);
  return baseMult * Math.pow(earlyRate, pivot - 1) * Math.pow(lateRate, n - pivot);
}

// ---------------------------------------------------------
// Damage Bucket（難易度リバランス：ダメージ計算式の再設計）
// ------------------------------------------------------------
// 【旧式の問題点】(a) 防御力が「atk - def*0.5」という単純減算だったため、
// プレイヤーATKが数百〜数千に達すると敵DEFの影響が実質ゼロになり、防御力
// という数値そのものが終盤ほど無意味化していた（元指示3・13番）。
// (b) プレイヤー側の「与ダメージ+%」系ボーナス（覚醒ツリー・職業MASTER・
// 転生遺物・スキルバフ・玉砕型武器・討伐後バフ等）が、それぞれ独立した
// 乗算チェーン（buffAtkMult × awakenMult × bloodChaliceMult × ...）に
// なっており、同じ「与ダメージ増加」というカテゴリーなのに掛け算で
// 複利的に積み上がっていた（元指示12番で明確に禁止されているパターン）。
//
// 【新式】
//   1. mainMult：上記(b)の全ての「与ダメージ+%」を1つの加算バケットへ
//      統合（battle.jsの_mainDmgMult()）。カテゴリー内加算。
//   2. mitigation：defを使った比率ベースの軽減式へ変更。
//        effectiveDef = def * (1 - armorPen)
//        mitigation   = effectiveDef / (effectiveDef + MITIGATION_K)
//      defがMITIGATION_Kに等しいとき50%軽減、défが増えるほど軽減率は
//      逓減しながら上昇する（完全無敵を防ぎつつ、高DEFが終盤でも意味を
//      持ち続ける）。
//   3. critMult：会心成立時のみ乗算（critDamageBoost込み）。
//   4. bossMult：Boss相手にのみ乗算（覚醒ツリー「覇者の一撃」＋
//      レジェンド/神話武器のbossDmg/executionerを加算合成）。
//   5. specialEffectダメージ（burnStack/deathNova等）は「別の攻撃」として
//      このBucketの外側で独立処理（既存設計を踏襲、変更なし）。
// finalDamage = atk × mainMult × (1-mitigation) × critMult(会心時) × bossMult(Boss時)
// カテゴリー内加算・カテゴリー間乗算、の方針に合わせて再整理した。
// ---------------------------------------------------------
export const DAMAGE_BUCKET = {
  CRIT_MULTIPLIER: 1.8,
  MITIGATION_K: 60, // defがこの値に等しいと50%軽減。ENEMY_SCALINGのDEF成長と合わせて較正。
};

// ---------------------------------------------------------
// 各種ステータス上限（難易度リバランス：元指示14番「隠し上限は禁止」）
// UI（装備画面等）から確認できる値のみを使用し、コード中に散在させない。
// ---------------------------------------------------------
export const CAPS_LAYER = {
  CRIT_PCT_MAX: 75,             // 会心率（jobs.js computeStats／state.js getStatsの両方で適用、既存踏襲）
  EVASION_MAX: 0.5,             // 回避率（Blade Vale 2.1で0.4だったが、防御ビルドが報われるよう0.5へ）
  ARMOR_PEN_MAX: 0.6,           // 防御貫通率（既存踏襲）
  CDR_MULT_MIN: 0.5,            // スキルクールダウン倍率の下限（=最大50%短縮、既存踏襲）
  ATTACK_INTERVAL_MIN: 0.35,    // 通常攻撃の間隔下限＝秒（既存踏襲、実質の攻撃速度上限）
  LIFESTEAL_PCT_MAX: 0.5,       // HP吸収（既存は上限なし。合計で被ダメの50%までに制限）
  REGEN_PCT_PER_SEC_MAX: 0.05,  // HP自動回復（毎秒最大HPの5%まで）
  // mitigation = effectiveDef/(effectiveDef+MITIGATION_K) は比率式のため、
  // 上限を設けないとdefが青天井に伸びる深淵深部で軽減率が99%超に張り付き、
  // 被ダメ側の実質DPSがほぼゼロになって「ダメージがまったく通らない」
  // 壊れた状態になる（Phase 6再シミュレーションで深淵200階のTTKが数千秒に
  // 達して発覚）。元指示14番「防御側の指標にも上限や逓減を設ける。完全
  // 無敵化を防ぐ」に従い、プレイヤー→敵・敵→プレイヤーの両方向の
  // mitigationに共通の上限を設ける（DEFへの投資は依然として終盤・深淵まで
  // 意味を持つが、85%を超えて軽減されることはない）。
  DEF_MITIGATION_MAX: 0.85,
};

// ---------------------------------------------------------
// ドロップ／経済
// ---------------------------------------------------------
export const ECONOMY = {
  BASE_DROP_CHANCE: 0.28,
  MANASTONE_BOSS_MIN: 15,
  MANASTONE_BOSS_MAX: 25,
  MANASTONE_NORMAL_CHANCE: 0.2,
  MANASTONE_NORMAL_MIN: 1,
  MANASTONE_NORMAL_MAX: 3,
};

// ---------------------------------------------------------
// ルーンクラフト
// ---------------------------------------------------------
export const RUNE_TIER_MULT = { small: 1, medium: 2, large: 3 };
export const RUNE_CRAFT_COST = {
  small: { manastone: 10, gold: 50 },
  medium: { manastone: 25, gold: 150 },
  large: { manastone: 60, gold: 400 },
};

// ---------------------------------------------------------
// E. 職業MASTER
// これまでの「mastered」は上級職解放の判定にしか使われていなかった。
// 現在は、マスター済み職業1つにつき現在職に関係なく永続ボーナスを付与する。
// このボーナスは覚醒でリセットされない。
//   基本職：職業ごとに個性を持つ固定ボーナス（js/data/jobs.jsの各job.masterBonus）
//   上級・特級職：単純加算ではなく条件付き能力（js/data/jobs.jsの各job.masterAbility、
//                mergeProfiles後のプロファイルから自動で3種類に振り分け）
// tier別の一律%だった旧設計はここでは使わなくなったため、この定数自体は撤去した。
// ボーナスの中身は「バランス数値」というより「職業ごとの個性という内容(コンテンツ)」
// のため、equipment.jsのWEAPON_TYPESと同様、balance.jsではなくjobs.js側に置く。
// ---------------------------------------------------------

// ---------------------------------------------------------
// F. 覚醒（Reincarnation 2.0 / プレステージリセット）
// 既存の「転生」（専用画面、加算のみ・非破壊）とは別の、もう一段上のシステム。
// 元指示の「転生システム2.0」が想定していたキャラLv・ストーリー進行のリセットは、
// このプロジェクトを通じて繰り返し明言してきた「死んでも進行は絶対に失わない」
// という大原則と衝突するため、ユーザー確認のうえ採用しない：
//   - リセットする物：全職業のレベル・経験値のみ（覚醒ツリーの「不滅の魂」
//     ノードでリセット後の初期Lvを底上げできる＝元指示の「転生後初期Lv」に相当）
//   - 絶対に失わない物：装備・所持品・ゴールド・魔石・マスター済み職業・
//     武器熟練度・既存の転生回数・ステージ進行（章の解放状況も含む）
//   - 見返り：覚醒ポイントを獲得し、覚醒ツリー（永続・覚醒しても失わない）
//     に投資できる。ポイント量は最高到達レベルだけでなく、深淵到達階・
//     職業MASTER数からも加算される（元指示の転生ポイント仕様）
// ---------------------------------------------------------
export const AWAKENING_LAYER = {
  MIN_LEVEL_TO_AWAKEN: 50,       // 保持中の職業の最高レベルがこれ以上で覚醒可能
  POINTS_PER_LEVEL_DIVISOR: 10,  // 獲得ポイントのレベル分 = floor(最高レベル / この値)
  POINTS_PER_ABYSS_DEPTH: 0.5,   // 獲得ポイントの深淵分 = floor(深淵最高到達階 * この値)
  POINTS_PER_MASTERED_JOB: 1,    // 獲得ポイントのMASTER分 = マスター済み職業数 * この値
  NODE_COST_BASE: 3,
  NODE_COST_PER_RANK: 2,         // 通常ノードのコスト(rank) = BASE + rank * PER_RANK
  NODE_MAX_RANK: 5,
  // 覚醒ツリーの「大型ノード」（征服/探求/輪廻の各系統に1つ、数値ではなく
  // ゲームルールそのものを変える効果を持つ。元指示の「一定ポイントごとに
  // ゲームルールを変える大型ノードを配置」に対応）
  BIG_NODE_COST_BASE: 15,
  BIG_NODE_COST_PER_RANK: 15,
};

// ---------------------------------------------------------
// G. 目覚めた装備（Phase 3）
// 武器強化がMAXに達し、かつ1回以上覚醒した後にのみ、覚醒ポイントを
// 使って武器をさらに強化できる（強化+10とは別枠の追加ボーナス）。
// ---------------------------------------------------------
export const AWAKENED_EQUIP_LAYER = {
  REQUIRE_ENHANCE_LEVEL: 10,   // この強化レベルに達していないと目覚めさせられない
  REQUIRE_AWAKENINGS: 1,       // プレイヤー自身が最低1回は覚醒している必要がある
  MAX_RANK: 3,
  COST_BASE: 8,
  COST_PER_RANK: 6,            // コスト(rank) = BASE + rank * PER_RANK
  BONUS_PER_RANK: 0.08,        // 武器の付与ステータスに対して、強化ボーナスとは別に+8%/rank
};

// ---------------------------------------------------------
// H. 覚醒アーティファクト（秘宝、Phase 3）
// 既存の特殊効果（EFFECTS）を、ボスドロップのルーンとは別ルートで
// 恒久解放できる仕組み。解放は永続で、スロットに自由に付け替えられる。
// ---------------------------------------------------------
export const ARTIFACT_LAYER = {
  SLOT_UNLOCK_AWAKENINGS: [1, 3, 6], // 覚醒回数がこの値に達するごとにスロット+1（最大3）
  UNLOCK_COST_BASE: 10,
  UNLOCK_COST_PER_ARTIFACT: 8,  // N個目（0始まり）の解放コスト = BASE + N * PER_ARTIFACT
};

// ---------------------------------------------------------
// I. 深淵（Abyss、Phase 4）
// 全10章のボスを撃破すると解放される、無限に深くなるエンドコンテンツ。
// 第10章の強さ（chapterMult(10)）を起点に、章とは別の刻み幅でさらに
// 敵を強くしていく。HP/ATK/DEFで刻み幅を分けているのは、Phase 1で
// 「将来の深淵実装でHPは緩やかに・ATKの危険度は着実に、のように
// 分岐させる」ためにあえて分離しておいた設計をここで実際に使うため。
// 踏破記録（最高到達階）は永続保存・非破壊（下がることはない）。
// ---------------------------------------------------------
// ------------------------------------------------------------
// 難易度リバランス：深淵はプレイヤーインフレの受け皿（元指示17番）のため、
// 無限スケーリングかつPiecewise Scaling（元指示19番）にする。深さ帯ごとに
// 成長率を上げていく（1〜50は緩やか、200+はより急）。深淵1階は「10章
// ボス撃破直後」のENEMY_SCALING到達値をそのまま起点にする。
// ------------------------------------------------------------
// 難易度リバランス Phase 6 再較正：BANDSの各レート値は、当初「深淵の起点＝
// 旧chapterMult(10)=4.15（章の経済倍率、Boss実強度とは無関係な小さい値）」
// という誤った土台の上で決めていたため、深淵1階を実際のENEMY_SCALING章10
// 到達値（正しい起点）につなぎ直した後に検証したところ、深さ200到達時点で
// 約10,600倍という桁違いの複利になり、標準ビルドは元より上級ビルドでも
// TTKが数十万秒に達する（事実上クリア不能）という結果になった。土台を
// 正しくした上で、深さ200までの累積倍率が約24倍（緩やか1〜50→中程度
// 51〜100→やや急101〜200、元指示19番のPiecewise Scaling）に収まるよう
// 全帯のレートを引き下げて再較正した。200階より先（Infinity帯）は
// 「理論上無限・自己ベスト更新ゾーン」（元指示20番）として、あえて元の
// 急なレートを残し、そこから先で本当に際限なく伸びていく設計にしている。
export const ABYSS_LAYER = {
  REWARD_STEP: 0.05,       // gold/exp/xpの深淵内での伸び幅（章10到達値を基準に、難易度とは独立）
  BOSS_FLOOR_INTERVAL: 5,  // この階数ごとにボスフロア
  BOSS_REWARD_MULT: 2.5,   // ボスフロアの追加報酬倍率
  // 追記（同じPhase 6の中でのさらなる較正）：DEF側はCAPS_LAYER.DEF_MITIGATION_MAX
  // （85%軽減）を新設したことで、enemyDefがMITIGATION_Kを大きく超えた時点で
  // 軽減率は頭打ちになり、それ以上defRateを上げても実効ダメージには効かなく
  // なった（＝深部のdefRateは主に「どの深さで頭打ちに達するか」を左右する
  // だけの見た目上の数値）。一方hpRateは頭打ちがないため、101〜200階の帯
  // （旧1.020）をそのまま複利適用すると章10からの起点HPと組み合わさって
  // depth200のBoss TTKが数百秒に達してしまった。101〜200階のhpRateを
  // 大きく引き下げて対処したが、その値（1.0045）は51〜100階の帯（1.014）
  // からの下げ幅が大きすぎ、「101階を境に敵の成長が急に鈍る」という
  // 別の違和感を生んでいた（PR#2レビュー第2点）。
  //
  // 再々較正：101〜200階のhpRateを1.006へ引き上げ、51〜100階との段差を
  // 緩和した（depth200到達時点の複利倍率は約5.2倍→約6.0倍に、Boss TTKで
  // 言うと標準ビルドで約90秒→約105秒に増加。「深くなるほど明確に難しく
  // なる」方向の変化であり、目標帯からの逸脱は軽微）。HPの伸びを頭打ち
  // ぎみに抑える一方、101階以降の体感難易度はHP以外の軸で補う方針へ転換：
  //   ・雑魚waveの出現数上限をdepth30前後→depth65〜75前後まで伸ばし、
  //     101〜200階でも出現数自体が増え続けるようにした（abyss.js参照）
  //   ・エリート出現率の深さ帯を4段階→5段階に増やし、101〜150／151〜200を
  //     分けてなだらかに上げた（ABYSS_EXPANSION_LAYER.ELITE_CHANCE_DEPTH_BANDS）
  // これにより「HPだけで難易度を作らない」（元指示・最重要原則）を101階
  // 以降でも維持しつつ、101階の段差そのものも緩和した。201階以降
  // （Infinity帯）はここよりやや高いレートのまま、「200+は理論上無限」
  // （元指示20番）の通り、そこから先で改めて伸びていく設計を維持する。
  BANDS: [
    { maxDepth: 50,       hpRate: 1.010,  atkRate: 1.008,  defRate: 1.007 },
    { maxDepth: 100,      hpRate: 1.014,  atkRate: 1.011,  defRate: 1.010 },
    { maxDepth: 200,      hpRate: 1.006,  atkRate: 1.0048, defRate: 1.0043 },
    { maxDepth: Infinity, hpRate: 1.012,  atkRate: 1.010,  defRate: 1.009 },
  ],
};

// depthが属する帯のbonus値を返す（エリート出現率の深さ加算に使用）
export function bandLookup(bands, depth) {
  for (const band of bands) if (depth <= band.maxDepth) return band.bonus;
  return bands[bands.length - 1].bonus;
}

// 深さdepthまでの累積倍率をBANDSに沿って複利計算する（帯の境界で連続）。
// rateKeyは'hpRate'|'atkRate'|'defRate'。
//
// PR#2レビュー第4点：「深淵1階＝10章ボス撃破直後の到達値そのもの」
// （仕様A、abyss.jsのscaleArchetype()コメント参照）を明文化する。以前は
// depthをそのまま複利適用していたため、depth=1の時点で既に1回分の
// bandRate（例：hpRateなら約1.01倍）が乗ってしまい、「深淵1階は10章
// ボスよりわずかに強い」という仕様Bの状態になっていた（コメントと実装が
// 食い違っていた）。1階を起点（乗数1.0）とし、2階以降の「経過階数」
// （=depth-1）ぶんだけ複利をかけるよう修正した。
export function abyssBandMult(rateKey, depth) {
  const steps = Math.max(0, depth - 1);
  let mult = 1;
  let prevMax = 0;
  for (const band of ABYSS_LAYER.BANDS) {
    if (steps <= prevMax) break;
    const stepsInBand = Math.min(steps, band.maxDepth) - prevMax;
    mult *= Math.pow(band[rateKey], stepsInBand);
    prevMax = band.maxDepth;
    if (steps <= band.maxDepth) break;
  }
  return mult;
}

// ---------------------------------------------------------
// J. 極Affix（Phase 5）
// 強化＋目覚めの両方をMAXにした武器だけが挑める、最後の仕上げ。
// ランダムに1ステータスへ追加%ボーナスを付与する（コスト消費で再抽選も可）。
// アイテムは個体ではなくitemId単位で管理している既存設計（強化・目覚めと
// 同じ）を踏襲し、インベントリ構造そのものは変更しない。
// ---------------------------------------------------------
export const EXTREME_AFFIX_LAYER = {
  REQUIRE_ENHANCE_LEVEL: 10,  // EQUIPMENT_LAYER.ENHANCE_MAX_LEVEL と同値
  REQUIRE_AWAKENED_RANK: 3,   // AWAKENED_EQUIP_LAYER.MAX_RANK と同値
  ROLL_COST_GOLD: 3000,
  ROLL_COST_MANASTONE: 150,
  MIN_PCT: 0.05,
  MAX_PCT: 0.15,
};

// ---------------------------------------------------------
// K. 覚醒装備（本来仕様：キル数で育つ固有装備）
// 元指示の「覚醒装備」：一部の特殊装備（固有効果を持つ名前付き装備のみ）
// が、装備して敵を倒すことで成長する。「覚醒でどんな装備でも最強になる
// 設計は禁止」のため、対象は固有効果(effects)を持つ装備に限定し、通常
// 装備には一切影響しない。元のAffix個体差（極Affixの1本目）はそのまま
// 維持し、ここで解放される第2枠は完全に追加のボーナスとする。
// ---------------------------------------------------------
export const AWAKENED_ITEM_LAYER = {
  KILLS_TIER1: 50,          // この撃破数で第2の極Affixスロットが解放される
  KILLS_TIER2: 100,         // この撃破数で固有能力（effects）が強化される
  TIER2_EFFECT_BOOST: 0.3,  // 固有能力のchance/powerに掛かる強化倍率
};

// ---------------------------------------------------------
// L. 深淵拡張：エリート・モディファイア・深淵ツリー・加護（Blessing）
// 深淵（Abyss）そのものをより深く遊べるようにする4つの追加要素。
// ・エリート：深淵限定で通常敵が低確率で強化状態になる（撃破すると深淵の欠片）
// ・モディファイア：階層ごとに決定論的に付与される「リスク＋リターン」の
//   フロア効果（同じ階なら常に同じ組み合わせになる。一覧を開き直しても
//   ブレない）
// ・深淵ツリー：エリート撃破・ボスフロア踏破で得る「深淵の欠片」を使う、
//   覚醒ツリーとは完全に別枠の永続強化（覚醒しても失われない）
// ・加護（Blessing）：深淵に挑む直前に3択から1つ選べる、その1階限りの
//   一時バフ（セーブされない・恒久進行とは無関係）
// ---------------------------------------------------------
export const ABYSS_EXPANSION_LAYER = {
  ELITE_CHANCE_BASE: 0.08,
  ELITE_CHANCE_MAX: 0.4,
  // 難易度リバランス（元指示20番）：深いほどエリート出現率自体も上げる
  // （敵HPだけで難易度を作らないため）。深淵ツリーの投資分はこの上に加算される。
  // PR#2レビュー第2点：101〜200階のHP成長を頭打ちぎみに抑えた分、この
  // 深さ帯の体感難易度をエリート出現率側で補うため、101〜150／151〜200を
  // 分割し（旧は101〜200をひとまとめに+0.10で扱っていた）、201階以降も
  // 含めて全体をなだらかに底上げした。
  ELITE_CHANCE_DEPTH_BANDS: [
    { maxDepth: 50, bonus: 0 },
    { maxDepth: 100, bonus: 0.05 },
    { maxDepth: 150, bonus: 0.09 },
    { maxDepth: 200, bonus: 0.13 },
    { maxDepth: Infinity, bonus: 0.17 },
  ],
  ELITE_HP_MULT: 1.8,
  ELITE_ATK_MULT: 1.3,
  ELITE_DEF_MULT: 1.2,
  ELITE_REWARD_MULT: 2.5,   // 経験値・ゴールド
  ELITE_SHARD_DROP: 3,      // エリート撃破で得る深淵の欠片（深淵ツリーの獲得量倍率が乗る）
  BOSS_SHARD_DROP: 15,      // ボスフロア踏破で得る深淵の欠片
  TREE_NODE_COST_BASE: 2,
  TREE_NODE_COST_PER_RANK: 2,
  TREE_NODE_MAX_RANK: 5,
  TREE_BIG_NODE_COST_BASE: 12,
  TREE_BIG_NODE_COST_PER_RANK: 12,
};

// ---------------------------------------------------------
// M. 武器総数拡張・装備掘り強化（Blade Vale 2.1）
// 8武器種 × 約25本（計約200本）の「武器ベース」データ層。既存の章ドロップ
// 装備（wp_sword_n・chN_weapon等）はそのまま残し、このレイヤーは完全に
// 加算で追加する（既存武器は一切変更・削除しない）。
// 武器の最終ステータス = WEAPON_TYPES比率 × RARITY_MULT × レベル倍率
//   （章倍率(chapterMult)の代わりに、武器自身のrequiredLevelを軸にした
//     levelMultを使う。特定の章に紐付かない「どこでも拾いうる」武器の
//     ため、章番号ではなくレベルでスケーリングするほうが自然）
// ---------------------------------------------------------
export const WEAPON_CODEX_LAYER = {
  LEVEL_POWER_BASE: 1.0,
  LEVEL_POWER_PER_LEVEL: 0.045, // chapterMult(1章あたり+35%≒9レベル相当)とおおむね揃う値
  // 通常のdropTable抽選（ECONOMY.BASE_DROP_CHANCE）とは完全に独立した、
  // 武器図鑑武器専用の追加ドロップ抽選（既存の防具・固有装備のドロップ率は
  // 一切変えない＝既存の希少性を薄めない）
  DROP_CHANCE: 0.05,
  BOSS_WEAPON_DROP_CHANCE: 0.02,
  REGION_WEIGHT_BONUS: 2,        // 地域タグ一致時、重みが (1 + これ) 倍になる
  RARITY_DROP_WEIGHT: { normal: 10, rare: 6, epic: 3, legendary: 1, mythic: 0.3 },
  LEVEL_SLACK: 15,                // ステージ推奨Lv + この値までの武器がそのステージで出現しうる（下限は制限しない＝低レア武器は素材用途があるため終盤でも出続けて良い）
  AFFIX_BIAS_WEIGHT: 3,           // affixBiasに含まれるステータスは、通常ステータスの何倍選ばれやすいか（極Affixのロール時）
  // 深淵限定武器（元指示22番）：レジェンドの一部は深淵50階以降、神話は
  // 100階以降・200階以降でそれぞれ解放される（常にこれが最強にならないよう、
  // 通常入手できるレジェンド/神話ともバランスを取る＝固有能力中心の設計にする）
  ABYSS_EXCLUSIVE_LEGENDARY_DEPTH: 50,
  ABYSS_EXCLUSIVE_MYTHIC_LOW_DEPTH: 100,
  ABYSS_EXCLUSIVE_MYTHIC_HIGH_DEPTH: 200,
  // 売却／分解（元指示26・27番）：大量に拾う武器を捌くための鍛冶屋機能
  SELL_GOLD: { normal: 10, rare: 30, epic: 80, legendary: 200, mythic: 500 },
  DISMANTLE_ESSENCE: { normal: 1, rare: 2, epic: 4, legendary: 8, mythic: 16 },
  ESSENCE_PER_MATERIAL: 3, // 強化素材化した「武器の欠片」で、通常の同名武器1個分の代わりに必要な数
};

// ---------------------------------------------------------
// N. Boss AI（難易度リバランス：元指示10・11番「Bossを壁にする」）
// 単純なHP増加ではなく、予兆付きの特殊攻撃・HP割合によるフェーズ移行で
// 各章Bossを「その章で学んだシステムを試す壁」にする。全Bossに共通の
// 汎用フレームワークとして実装する（battle.jsの_updateBossAI）。
// スマホ操作を前提に、予兆時間は最低でも0.8秒以上を必ず確保する
// （元指示11・33番：回避不能な即死攻撃・精密回避の要求を禁止）。
//
// PR#2レビュー第3点：以前はHIGH_INTENSITY_CHAPTERS（章番号の配列）に
// 含まれるかどうかだけで「フル構成か否か」の2択しかなく、Bossごとに
// 行動を個別に差別化できなかった（「どのBossも同じ攻略になる」問題）。
// BOSS_AI_PROFILESへ移行し、章単位の設定に加えてBoss個体（type文字列。
// 例：'ch5_boss'）単位での上書きも自然に追加できるようにした
// （resolveBossAIProfile()の優先順位：Boss個体 > 章単位 > 深淵共通 >
// default）。現時点では中身は全Bossに同じフル構成を割り当てているだけ
// だが（個別の作り込みは今後の課題）、土台としてこの形にしておく。
// ---------------------------------------------------------
export const BOSS_AI_PROFILES = {
  // 未指定のBossは全てこれ（スラム＋突進のみ、旧intensity='normal'相当）
  default: { slam: true, charge: true, projectile: false, summon: false },
  // 章5・8・10のBossは「明確な難易度の節目」（元指示10番）として、
  // 遠距離攻撃・雑魚召喚も使うフル構成にする（旧intensity='high'相当）。
  // 深淵はプレイヤーインフレの受け皿（元指示21番）のため同様にフル構成。
  chapter5: { slam: true, charge: true, projectile: true, summon: true },
  chapter8: { slam: true, charge: true, projectile: true, summon: true },
  chapter10: { slam: true, charge: true, projectile: true, summon: true },
  abyss: { slam: true, charge: true, projectile: true, summon: true },
};

// Boss1体の情報からAI Profileを解決する。優先順位：
// 1. Boss個体（type文字列、例:'ch5_boss'）に直接エントリがあればそれ
// 2. 深淵のBossなら'abyss'
// 3. 章番号から'chapter<N>'
// 4. どれも無ければ'default'
export function resolveBossAIProfile(bossType, chapterNum, isAbyss) {
  if (bossType && BOSS_AI_PROFILES[bossType]) return BOSS_AI_PROFILES[bossType];
  if (isAbyss && BOSS_AI_PROFILES.abyss) return BOSS_AI_PROFILES.abyss;
  const chKey = chapterNum != null ? `chapter${chapterNum}` : null;
  if (chKey && BOSS_AI_PROFILES[chKey]) return BOSS_AI_PROFILES[chKey];
  return BOSS_AI_PROFILES.default;
}

export const BOSS_AI_LAYER = {
  PHASE2_HP_RATIO: 0.5,       // このHP割合を下回るとフェーズ2（強化状態）に入る
  PHASE2_ATK_MULT: 1.25,      // フェーズ2の攻撃力倍率
  PHASE2_SPEED_MULT: 1.15,    // フェーズ2の移動速度倍率
  PHASE2_ATTACK_INTERVAL_MULT: 0.75, // フェーズ2の特殊攻撃間隔倍率（短縮）

  TELEGRAPH_SEC: 0.9,         // 予兆表示時間（最低保証、元指示11・33番）
  SLAM_INTERVAL_SEC: 5.5,     // 範囲攻撃（地面スラム）の間隔
  SLAM_RADIUS: 130,
  SLAM_DAMAGE_MULT: 0.22,     // Boss ATKに対する割合ダメージ

  CHARGE_INTERVAL_SEC: 7.5,   // 突進攻撃の間隔
  CHARGE_SPEED_MULT: 3.2,
  CHARGE_DAMAGE_MULT: 0.30,

  PROJECTILE_INTERVAL_SEC: 4.5, // 遠距離攻撃の間隔（プロファイルでprojectile:trueのBossのみ）
  PROJECTILE_SPEED: 260,
  PROJECTILE_DAMAGE_MULT: 0.18,

  SUMMON_INTERVAL_SEC: 10,    // 雑魚召喚の間隔（プロファイルでsummon:trueのBossのみ）
  SUMMON_COUNT: 2,
};

// ---------------------------------------------------------
// O. テキスト戦闘（ターン制移行）
// リアルタイムCanvas戦闘からコマンド式テキスト戦闘（js/battleEngine.js）へ
// 移行するにあたって新設した定数群。PR#2までのDamage Bucket・比率型DEF
// 軽減・CAPS_LAYER・Enemy Scaling・深淵Piecewise Scaling・Boss AI Profileは
// 一切変更せず、ここは純粋に「ターン制だからこそ必要になった新しい値」だけを
// 追加する（既存レイヤーへの割り込みや置き換えは行わない）。
// ---------------------------------------------------------
export const TEXT_BATTLE_LAYER = {
  // 「ぼうぎょ」コマンド（元指示6番）：DEF軽減とは別枠で、最終被ダメージに
  // さらに掛ける乗数。完全無敵にはしない（0より大きい値を維持する）。
  GUARD_DAMAGE_MULT: 0.6,
  // 1ラウンド ≒ 何秒相当とみなして、BOSS_AI_LAYER等の秒数系定数をターン数へ
  // 換算するか（元指示5・7番）。この定数自体は変更前の秒数値をそのまま
  // 活かすための換算比であり、独自のバランス数値を新設するものではない。
  SECONDS_PER_ROUND: 3,
  // 1つの遭遇（encounter）グループに同時に出す敵の上限（元指示10番：Wave
  // 構成は維持しつつ、テキスト戦闘では時間差Spawnが不要なため、超過分は
  // 複数の遭遇グループに分割して順番に出す）。
  ENCOUNTER_GROUP_SIZE: 4,
  // 1ラウンドにつき、実際にプレイヤーへ攻撃する非Boss敵の上限。
  // リアルタイム版は被弾後0.9秒の無敵時間があり、敵の頭数に関わらず
  // 「合計で見るとほぼ1体ぶん」のペースでしか被弾しなかった（PR#2の
  // ENEMY_SCALING・敵ATKはこの前提で較正済み）。ターン制で敵全員が毎
  // ラウンド攻撃すると、頭数の多いwaveほどPR#2較正値に対して過剰に痛く
  // なってしまうため、この上限で「選ばれた敵だけがそのラウンド攻撃する」
  // ようにし、既存のENEMY_SCALING/敵ATK自体は一切変更せずに済ませる。
  // Bossはこの上限の対象外（常に行動する）。
  MAX_NORMAL_ATTACKERS_PER_ROUND: 1,
  // 非Boss敵の「通常攻撃」（予兆を経ないBoss通常攻撃も含む。予兆つきの
  // Boss特殊攻撃・ぼうぎょでの軽減は対象外＝別枠でGUARD_DAMAGE_MULTが効く）
  // にのみ掛かる被ダメージ倍率。
  // 実時間版では、プレイヤーは移動で敵の接触判定そのものを避けられた
  // （ENEMY_SCALINGの較正コメントにある「無敵時間0.9秒毎に1発」は、あくまで
  // 「その場に立ち止まり続けた場合のワーストケース」であり、通常プレイでは
  // 移動によってこれを大きく下回るのが前提だった）。テキスト戦闘には
  // そもそも「移動して避ける」操作自体が存在しないため、MAX_NORMAL_
  // ATTACKERS_PER_ROUNDで頭数分の重複被弾は防いでも、選ばれた1体の攻撃は
  // 毎ラウンド必ず命中してしまい、実時間で本来あったはずの「移動による
  // 回避」ぶんが丸ごと失われる。これをこの倍率で補正する（ENEMY_SCALING・
  // 敵ATK自体は変更しない）。/tmp/balance_sim2.mjsのD/E想定較正キャラで
  // 3章・5章のwaveを実際にプレイアウトさせ、標準装備キャラが無理なく
  // クリアできる水準まで実測で追い込んだ値。
  NORMAL_ATTACK_DAMAGE_MULT: 0.55,
};
