/* ============================================================
   深淵ツリー定義（深淵拡張）
   覚醒ツリーとは完全に別枠。通貨は「深淵の欠片」（深淵限定のエリート撃破・
   ボスフロア踏破で入手）で、覚醒しても・転生しても一切失われない。
   小ノードは深淵内の数値強化、1つだけ「ゲームルールを変える大型ノード」
   （深淵限定の1階1回リバイブ）を置く（覚醒ツリーと同じ設計方針）。
   ============================================================ */
import { ABYSS_EXPANSION_LAYER } from './balance.js';

export const ABYSS_TREE_NODES = [
  { id: 'abt_eliterate', stat: 'eliteChance', name: '深淵の眼力', pctPerRank: 0.02,
    maxRank: ABYSS_EXPANSION_LAYER.TREE_NODE_MAX_RANK,
    costBase: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_PER_RANK,
    desc: '深淵でのエリート出現率が永続で上昇する' },
  { id: 'abt_elitereward', stat: 'eliteReward', name: '略奪の心得', pctPerRank: 0.1,
    maxRank: ABYSS_EXPANSION_LAYER.TREE_NODE_MAX_RANK,
    costBase: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_PER_RANK,
    desc: 'エリート撃破時の経験値・ゴールド倍率が永続で上昇する' },
  { id: 'abt_shardgain', stat: 'shardGain', name: '欠片の目利き', pctPerRank: 0.15,
    maxRank: ABYSS_EXPANSION_LAYER.TREE_NODE_MAX_RANK,
    costBase: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_PER_RANK,
    desc: '深淵の欠片の獲得量が永続で上昇する' },
  { id: 'abt_resist', stat: 'modifierResist', name: '混沌への耐性', pctPerRank: 0.1,
    maxRank: 3,
    costBase: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_PER_RANK,
    desc: '深淵のモディファイアによる敵の強化（攻撃力・防御力・移動速度・接触ダメージ増加）を軽減する' },
  { id: 'abt_droprate', stat: 'dropRate', name: '深淵の宝探し', pctPerRank: 0.08,
    maxRank: ABYSS_EXPANSION_LAYER.TREE_NODE_MAX_RANK,
    costBase: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_PER_RANK,
    desc: '深淵限定でドロップ率が永続で上昇する' },
  { id: 'abt_bossfloor', stat: 'bossFloorReward', name: '制圧の心得', pctPerRank: 0.15,
    maxRank: 3,
    costBase: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_NODE_COST_PER_RANK,
    desc: '深淵のボスフロアで得る経験値・ゴールドが永続で上昇する' },
];

// 大型ノード：数値ボーナスではなくルールを変える（元指示の「一定ポイント
// ごとにゲームルールを変える大型ノード」の深淵版）
export const ABYSS_TREE_BIG_NODES = [
  {
    id: 'abt_revive', stat: 'revive', name: '深淵の加護', big: true, maxRank: 1,
    costBase: ABYSS_EXPANSION_LAYER.TREE_BIG_NODE_COST_BASE, costPerRank: ABYSS_EXPANSION_LAYER.TREE_BIG_NODE_COST_PER_RANK,
    desc: '深淵で致死ダメージを受けても、1階につき1回だけHP50%で踏みとどまれるようになる',
  },
];

export const ALL_ABYSS_TREE_NODES = [...ABYSS_TREE_NODES, ...ABYSS_TREE_BIG_NODES];

export function getAbyssTreeNodeDef(id) { return ALL_ABYSS_TREE_NODES.find((n) => n.id === id); }

// ノードを rank から rank+1 へ上げるのに必要な深淵の欠片
export function abyssTreeNodeCostFor(node, rank) {
  return node.costBase + rank * node.costPerRank;
}
