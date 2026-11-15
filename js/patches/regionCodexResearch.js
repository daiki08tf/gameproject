/*
 * 地域研究の実行時パッチ。判定は js/data/regionCodexResearch.js の純粋関数、
 * 集計元は既存の state.regionCodexList()。ここが触る保存データは
 * state.data.claimedMilestones（収集の里程標と同じ既存の表）への受け取り記録だけ。
 */
import { state } from '../state.js';
import './regionCodex.js';
import { regionResearchSummary } from '../data/regionCodexResearch.js';

state.regionResearchList = function regionResearchList() {
  const claimed = this.data.claimedMilestones ||= {};
  return (this.regionCodexList?.() || []).map((bundle, index) => ({ region: bundle.region, ...regionResearchSummary(bundle, index, (id) => !!claimed[id]) }));
};

state.claimRegionResearch = function claimRegionResearch(regionId, tier) {
  const row = this.regionResearchList().find((r) => r.regionId === regionId);
  const t = row?.tiers.find((x) => x.tier === Number(tier));
  if (!t || !t.reached || t.claimed) return null;
  (this.data.claimedMilestones ||= {})[t.claimId] = true;
  const { gold = 0, ...materials } = t.reward || {};
  const gained = Object.keys(materials).length ? (this.addSettlementMaterials?.(materials) || {}) : {};
  if (gold > 0) { this.data.gold = Math.max(0, (Number(this.data.gold) || 0) + gold); gained.gold = gold; }
  this.save();
  return { ...t, gained };
};
