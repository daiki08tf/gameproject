/* ============================================================
   覚醒ツリー定義（Blade Vale 2.0 Phase 2）
   覚醒ポイントで永続強化できるノード一覧。1ノードにつき5ランクまで、
   ランクが上がるごとにコストも増える（js/data/balance.jsのAWAKENING_LAYER）。
   ============================================================ */
import { AWAKENING_LAYER } from './balance.js';

// stat: 'atk'/'def'/'hp'/'mag'/'spd'/'crit' はgetStats()側の乗算ボーナスへ、
// 'exp'/'gold'/'drop' は経験値・ゴールド・ドロップ率の乗算ボーナスへ反映される。
export const AWAKENING_NODES = [
  { id: 'awk_atk',  stat: 'atk',  name: '闘気の心得',   pctPerRank: 0.02,  desc: 'ATKが永続で上昇する' },
  { id: 'awk_def',  stat: 'def',  name: '守りの心得',   pctPerRank: 0.02,  desc: 'DEFが永続で上昇する' },
  { id: 'awk_hp',   stat: 'hp',   name: '生命の心得',   pctPerRank: 0.02,  desc: 'HPが永続で上昇する' },
  { id: 'awk_mag',  stat: 'mag',  name: '魔力の心得',   pctPerRank: 0.02,  desc: 'MAGが永続で上昇する' },
  { id: 'awk_spd',  stat: 'spd',  name: '俊敏の心得',   pctPerRank: 0.015, desc: 'SPDが永続で上昇する' },
  { id: 'awk_crit', stat: 'crit', name: '会心の心得',   pctPerRank: 0.015, desc: 'CRITが永続で上昇する' },
  { id: 'awk_exp',  stat: 'exp',  name: '英知の心得',   pctPerRank: 0.03,  desc: '獲得経験値が永続で上昇する' },
  { id: 'awk_gold', stat: 'gold', name: '財運の心得',   pctPerRank: 0.03,  desc: '獲得ゴールドが永続で上昇する' },
  { id: 'awk_drop', stat: 'drop', name: '幸運の心得',   pctPerRank: 0.02,  desc: 'ドロップ率が永続で上昇する' },
];

export function getAwakeningNode(id) { return AWAKENING_NODES.find((n) => n.id === id); }

// ノードを rank から rank+1 へ上げるのに必要な覚醒ポイント
export function awakeningNodeCost(rank) {
  return AWAKENING_LAYER.NODE_COST_BASE + rank * AWAKENING_LAYER.NODE_COST_PER_RANK;
}
