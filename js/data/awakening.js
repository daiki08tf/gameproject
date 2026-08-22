/* ============================================================
   覚醒ツリー定義（3系統：征服／探求／輪廻）
   元指示の「転生ツリー」仕様に対応：小ノードは数値強化、各系統に1つずつ
   「ゲームルールを変える大型ノード」を配置する。
   ノードは覚醒ポイントで永続強化でき、ランクが上がるごとにコストも増える
   （js/data/balance.jsのAWAKENING_LAYER）。
   ============================================================ */
import { AWAKENING_LAYER } from './balance.js';

export const AWAKENING_BRANCHES = {
  conquest:    { name: '征服', desc: '戦闘力を高める' },
  exploration: { name: '探求', desc: 'ハクスラの効率を高める' },
  cycle:       { name: '輪廻', desc: '周回効率を高める' },
};

// 通常ノード：stat が 'atk'/'def'/'hp'/'spd'/'crit' はgetStats()の乗算ボーナスへ、
// 'exp'/'gold'/'drop' は経験値・ゴールド・ドロップ率の乗算ボーナスへ反映される。
export const AWAKENING_NODES = [
  { id: 'awk_atk',  branch: 'conquest',    stat: 'atk',  name: '闘気の心得', pctPerRank: 0.02,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: 'ATKが永続で上昇する' },
  { id: 'awk_def',  branch: 'conquest',    stat: 'def',  name: '守りの心得', pctPerRank: 0.02,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: 'DEFが永続で上昇する' },
  { id: 'awk_hp',   branch: 'conquest',    stat: 'hp',   name: '生命の心得', pctPerRank: 0.02,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: 'HPが永続で上昇する' },
  { id: 'awk_spd',  branch: 'conquest',    stat: 'spd',  name: '俊敏の心得', pctPerRank: 0.015,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: 'SPDが永続で上昇する' },
  { id: 'awk_crit', branch: 'conquest',    stat: 'crit', name: '会心の心得', pctPerRank: 0.015,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: 'CRITが永続で上昇する' },
  { id: 'awk_gold', branch: 'exploration', stat: 'gold', name: '財運の心得', pctPerRank: 0.03,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: '獲得ゴールドが永続で上昇する' },
  { id: 'awk_drop', branch: 'exploration', stat: 'drop', name: '幸運の心得', pctPerRank: 0.02,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: 'ドロップ率が永続で上昇する' },
  { id: 'awk_exp',  branch: 'cycle',       stat: 'exp',  name: '英知の心得', pctPerRank: 0.03,
    maxRank: AWAKENING_LAYER.NODE_MAX_RANK, costBase: AWAKENING_LAYER.NODE_COST_BASE, costPerRank: AWAKENING_LAYER.NODE_COST_PER_RANK,
    desc: '獲得経験値が永続で上昇する' },
];

// 大型ノード：各系統に1つ。数値ボーナスではなくゲームルールそのものを変える。
export const AWAKENING_BIG_NODES = [
  {
    id: 'awk_bossdmg', branch: 'conquest', stat: 'bossDmg', name: '覇者の一撃', big: true,
    pctPerRank: 0.08, maxRank: 1,
    costBase: AWAKENING_LAYER.BIG_NODE_COST_BASE, costPerRank: AWAKENING_LAYER.BIG_NODE_COST_PER_RANK,
    desc: 'ボスに対する与ダメージが永続で上昇する',
  },
  {
    id: 'awk_unowned', branch: 'exploration', stat: 'unownedBias', name: '宝物庫の記憶', big: true,
    pctPerRank: 1 / 3, maxRank: 3,
    costBase: AWAKENING_LAYER.BIG_NODE_COST_BASE, costPerRank: AWAKENING_LAYER.BIG_NODE_COST_PER_RANK,
    desc: 'まだ持っていない装備がドロップ抽選で優先されやすくなる（ランクが上がるほど優先度UP）',
  },
  {
    id: 'awk_startlevel', branch: 'cycle', stat: 'startLevel', name: '不滅の魂', big: true,
    levels: [5, 10, 15], maxRank: 3,
    costBase: AWAKENING_LAYER.BIG_NODE_COST_BASE, costPerRank: AWAKENING_LAYER.BIG_NODE_COST_PER_RANK,
    desc: '覚醒で全職業のレベルが1ではなく、このレベルまで戻るようになる',
  },
];

export const ALL_AWAKENING_NODES = [...AWAKENING_NODES, ...AWAKENING_BIG_NODES];

export function getAwakeningNodeDef(id) { return ALL_AWAKENING_NODES.find((n) => n.id === id); }
export function nodesInBranch(branch) { return ALL_AWAKENING_NODES.filter((n) => n.branch === branch); }

// ノードを rank から rank+1 へ上げるのに必要な覚醒ポイント
export function awakeningNodeCostFor(node, rank) {
  return node.costBase + rank * node.costPerRank;
}
