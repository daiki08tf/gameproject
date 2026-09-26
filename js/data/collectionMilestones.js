/* ============================================================
   Collection Milestones（収集の里程標）— Session 6 / Codex 2.0
   ------------------------------------------------------------
   Codex・種族熟練・仲間収集の「踏破点」。純粋なデータ定義：
   progress の計算に必要な集計だけを行い、報酬の授受は
   patches/speciesMastery.js 側の state API が担う。
   全て一回限り（claimedは state.data.claimedMilestones に記録）。
   ============================================================ */
import { CHAPTERS } from './stages.js';
import { speciesMasteryLevelFor } from './speciesMastery.js';

// ctx: { codex: state.data.monsterCodex, instances: state.data.companionInstances,
//        mastery: state.data.speciesMastery, isStageCleared: fn }
function countWhere(obj, pred) {
  return Object.values(obj || {}).filter(pred).length;
}

export const COLLECTION_MILESTONES = Object.freeze([
  {
    id: 'm_rare3', name: '希少種との遭遇',
    desc: 'Rare個体を3体倒して仲間にする',
    target: 3, reward: { gold: 900, manastone: 30 },
    progress: (ctx) => countWhere(ctx.codex, e => e.recruited && e.rare),
  },
  {
    id: 'm_roamer2', name: '名もなき強敵の追跡',
    desc: 'Roamer（名もなき強敵）を2体仲間にする',
    target: 2, reward: { gold: 1600, manastone: 50 },
    progress: (ctx) => countWhere(ctx.instances, i => i?.provenance?.roamerId),
  },
  {
    id: 'm_denlord2', name: '巣の主たち',
    desc: '巣の主（Denlord）を2体仲間にする',
    target: 2, reward: { gold: 2200, manastone: 60 },
    progress: (ctx) => countWhere(ctx.instances, i => i?.provenance?.denlordId),
  },
  {
    id: 'm_mastery5', name: '群れを知る者',
    desc: '5種族で種族熟練Lv3（精通）に到達する',
    target: 5, reward: { gold: 1400, manastone: 45 },
    progress: (ctx) => countWhere(ctx.mastery, e => speciesMasteryLevelFor(e?.exp) >= 3),
  },
  {
    id: 'm_sideways4', name: '街道を外れる者',
    desc: '探索地点を4箇所踏破する',
    target: 4, reward: { gold: 1500, manastone: 45 },
    progress: (ctx) => CHAPTERS.filter(ch => ch.sideLocation && ctx.isStageCleared(ch.stages[ch.stages.length - 1].id)).length,
  },
]);
