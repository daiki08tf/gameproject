/* ============================================================
   Awakening 2.0 — milestone / feature-unlock progression
   覚醒はレベルリセットではなく、到達実績によって上位システムを解放する。
   ============================================================ */

export const AWAKENING_V2_RANKS = [
  {
    rank: 1,
    name: '第一覚醒・開門',
    description: '中盤の成長システムを束ね、装備の上位育成を解禁する。',
    requirements: { characterLevel: 50, masteredJobs: 5, clearedStage: '5-5' },
    unlocks: ['秘宝スロット1', '装備の目覚め', '覚醒装備'],
  },
  {
    rank: 2,
    name: '第二覚醒・極意',
    description: '複数職のMASTERを越え、ビルド拡張を本格解放する。',
    requirements: { characterLevel: 100, masteredJobs: 15, clearedStage: '10-5' },
    unlocks: ['秘宝スロット2', '極Affix', '上位ビルド拡張'],
  },
  {
    rank: 3,
    name: '第三覚醒・超越',
    description: '本編最深部を越え、Relicと最上位育成へ到達する。',
    requirements: { characterLevel: 200, masteredJobs: 30, clearedStage: '15-5' },
    unlocks: ['秘宝スロット3', 'Relic解放', 'Mythic育成帯'],
  },
  {
    rank: 4,
    name: '第四覚醒・深淵',
    description: '深淵と恒久収集を極めた者向けのエンドゲーム到達証。',
    requirements: { characterLevel: 300, masteredJobs: 40, abyssDepth: 50, rune2OwnedTotal: 1000 },
    unlocks: ['深淵上位拡張フラグ', '将来の超越コンテンツ解放枠'],
  },
];

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
  if (req.abyssDepth != null) checks.push({ label: `深淵 ${req.abyssDepth}層`, met: context.abyssDepth >= req.abyssDepth });
  if (req.rune2OwnedTotal != null) checks.push({ label: `Rune総刻数 ${req.rune2OwnedTotal}`, met: context.rune2OwnedTotal >= req.rune2OwnedTotal });
  return { met: checks.every((check) => check.met), checks };
}

export const SYSTEM_ROLE_MAP = Object.freeze({
  character: 'キャラクター本体の基礎成長',
  job: '戦い方・技・MASTERによる横方向の成長',
  inheritance: 'Character Lv周回による基礎能力の継承',
  awakening: '到達実績による新ルール・上位機能の解放',
  rune2: '周回収集による恒久カスタマイズ',
  codex: '探索・収集による恒久成長',
  equipment: 'ドロップ更新と装備選択',
  affix: '装備個体差と厳選',
  companion: 'パーティ構築・個体育成',
  artifact: 'ルールを変えるビルドパーツ',
  abyss: '高難度・長期エンドコンテンツ',
});
