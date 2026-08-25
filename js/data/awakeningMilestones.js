/* ============================================================
   Awakening 3.0 — milestone / feature-unlock progression
   ------------------------------------------------------------
   Awakening is not a reset or a passive-stat tree. It is the long-term
   milestone spine for Character Lv 1..99,999. Each rank is anchored to a
   major level/story breakpoint and unlocks a permanent Imprint choice plus
   higher-order systems.

   Formal milestones:
   Rank 1 = Lv90
   Rank 2 = Lv300
   Rank 3 = Lv700
   Rank 4 = Lv3,000 / Chapter 20 clear
   ============================================================ */

export const AWAKENING_V2_RANKS = Object.freeze([
  Object.freeze({
    rank: 1,
    name: '第一覚醒・開門',
    description: 'Lv90の節目。中盤の成長システムを束ね、最初の永久刻印と装備の上位育成を解禁する。',
    requirements: Object.freeze({ characterLevel: 90, masteredJobs: 5, clearedStage: '5-5' }),
    unlocks: Object.freeze(['覚醒刻印 Rank1', '秘宝スロット1', '装備の目覚め', '覚醒装備']),
  }),
  Object.freeze({
    rank: 2,
    name: '第二覚醒・極意',
    description: 'Lv300の節目。複数職MASTERを土台に、厳選とビルド分岐を本格化する。',
    requirements: Object.freeze({ characterLevel: 300, masteredJobs: 15, clearedStage: '10-5' }),
    unlocks: Object.freeze(['覚醒刻印 Rank2', '秘宝スロット2', '極Affix', '上位ビルド拡張']),
  }),
  Object.freeze({
    rank: 3,
    name: '第三覚醒・超越',
    description: 'Lv700の節目。第一部15章の踏破を証明し、The Veilと長期エンドゲームへ接続する。',
    requirements: Object.freeze({ characterLevel: 700, masteredJobs: 30, clearedStage: '15-5' }),
    unlocks: Object.freeze(['覚醒刻印 Rank3', '秘宝スロット3', 'Relic解放権', 'Mythic育成帯']),
  }),
  Object.freeze({
    rank: 4,
    name: '第四覚醒・深淵',
    description: 'Lv3,000の節目。The Veil編20章を越え、Lv99,999へ続く深淵時代へ正式に入る。',
    requirements: Object.freeze({ characterLevel: 3000, masteredJobs: 40, clearedStage: '20-5' }),
    unlocks: Object.freeze(['覚醒刻印 Rank4', '深淵上位拡張フラグ', '超越コンテンツ解放枠']),
  }),
]);

export function awakeningRankDef(rank) {
  return AWAKENING_V2_RANKS.find((entry) => entry.rank === rank) || null;
}

export function evaluateAwakeningRequirements(def, context) {
  if (!def) return { met: false, checks: [] };
  const req = def.requirements || {};
  const checks = [];
  if (req.characterLevel != null) checks.push({ label: `Character Lv.${req.characterLevel}`, met: context.characterLevel >= req.characterLevel });
  if (req.masteredJobs != null) checks.push({ label: `MASTER職 ${req.masteredJobs}種`, met: context.masteredJobs >= req.masteredJobs });
  if (req.clearedStage) checks.push({ label: `${req.clearedStage} クリア`, met: !!context.isStageCleared(req.clearedStage) });
  // Compatibility only: older/custom milestone definitions may still use these.
  if (req.abyssDepth != null) checks.push({ label: `深淵 ${req.abyssDepth}層`, met: context.abyssDepth >= req.abyssDepth });
  if (req.rune2OwnedTotal != null) checks.push({ label: `Rune総刻数 ${req.rune2OwnedTotal}`, met: context.rune2OwnedTotal >= req.rune2OwnedTotal });
  return { met: checks.every((check) => check.met), checks };
}

export const SYSTEM_ROLE_MAP = Object.freeze({
  character: 'キャラクター本体の基礎成長',
  job: '戦い方・技・MASTERによる横方向の成長',
  inheritance: 'Character Lv周回による基礎能力の継承',
  awakening: 'Lv90 / 300 / 700 / 3,000の到達節目。永久刻印と上位機能を解放',
  rune2: '周回収集による恒久カスタマイズ',
  codex: '探索・収集による恒久成長',
  equipment: 'ドロップ更新と装備選択',
  affix: '装備個体差と厳選',
  companion: 'パーティ構築・個体育成',
  artifact: 'ルールを変えるビルドパーツ',
  abyss: 'Lv3,000以降の高難度・長期エンドコンテンツ',
});
