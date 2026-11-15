/* ============================================================
   地域研究（フィールドリサーチ）— EXPANSION B1 / ロードマップ C9 の入口
   ------------------------------------------------------------
   地域図鑑（regionCodex）が既に集計している値を「課題」として並べ直すだけの
   純粋関数。課題の達成は毎回その場で導出し、進行そのものは保存しない。
   保存するのは「段階報酬を受け取ったか」だけで、置き場は既存の
   state.data.claimedMilestones（収集の里程標と同じ表）— 新しいセーブルートは作らない。
   報酬は既存の拠点素材と Gold のみ。
   ============================================================ */

// bundle: state.regionCodexList() の 1 要素（regionCodexBundle + regionBossSummary）
// その地域に該当する要素が無い課題（釣り場の無い地域の「ヌシ」など）は出さない。
export function regionResearchTasks(bundle) {
  if (!bundle) return [];
  const tasks = [];
  const add = (id, label, done, progress) => tasks.push({ id, label, done: !!done, progress: progress || '' });
  if (bundle.faunaTotal > 0) {
    const need = Math.max(1, Math.ceil(bundle.faunaTotal / 2));
    add('fauna', `この地域の生物を${need}種、仲間として記録する`, bundle.faunaSeen >= need, `${Math.min(bundle.faunaSeen, need)}/${need}`);
  }
  if (bundle.fishingSpot && bundle.fishTotal > 0) {
    const need = Math.min(5, bundle.fishTotal);
    add('fish', `${bundle.fishingSpot.name}で魚を${need}種釣る`, bundle.fishSeen >= need, `${Math.min(bundle.fishSeen, need)}/${need}`);
    add('master', 'この地域のヌシを釣り上げる', bundle.masterCaught);
  }
  if (bundle.archaeologySite) add('record', `${bundle.archaeologySite.name}の記録を復元する`, bundle.archaeologySite.recordUnlocked, `${bundle.archaeologySite.foundCount}/${bundle.archaeologySite.totalCount}`);
  if (bundle.treasureHunts?.length) add('treasure', '宝探しを最後まで解決する', bundle.treasureHunts.every((h) => h.stage === 'resolved'));
  if (bundle.rareTotal > 0) add('rare', 'レア個体に遭遇する', bundle.rareSeen >= 1);
  if (bundle.bosses?.length) {
    const cleared = bundle.bosses.filter((b) => b.cleared).length;
    add('bosses', 'この地域の主脅威をすべて討伐する', cleared >= bundle.bosses.length, `${cleared}/${bundle.bosses.length}`);
  }
  if (bundle.hiddenThreats?.length) add('hidden', '隠し脅威を 1 体討伐する', bundle.hiddenThreats.some((h) => h.cleared));
  if (bundle.uniques?.length) add('unique', 'この地域の固有装備を手に入れる', bundle.uniques.some((u) => u.owned));
  return tasks;
}

// 段階報酬：達成数が need に届いたら一度だけ受け取れる。数量は地域の並び順（regionIndex: 0 始まり）で伸ばす。
export const REGION_RESEARCH_TIERS = Object.freeze([
  { tier: 1, need: 3, label: '初期調査', reward: { wood: 6, ore: 4, gold: 80 } },
  { tier: 2, need: 6, label: '踏査', reward: { ore: 8, hide: 6, veilstone: 2, gold: 200 } },
  { tier: 3, need: Infinity, label: '研究完了', reward: { veilstone: 6, gold: 500 } }, // need は「全課題」に読み替える
]);

export function regionResearchRewardFor(tier, regionIndex = 0) {
  const def = REGION_RESEARCH_TIERS.find((t) => t.tier === tier);
  if (!def) return null;
  const mult = 1 + Math.max(0, regionIndex) * 0.5;
  return Object.fromEntries(Object.entries(def.reward).map(([k, v]) => [k, Math.round(v * mult)]));
}

export function regionResearchClaimId(regionId, tier) { return `research:${regionId}:${tier}`; }

// claimed: (claimId) => boolean
export function regionResearchSummary(bundle, regionIndex = 0, claimed = () => false) {
  const tasks = regionResearchTasks(bundle);
  const done = tasks.filter((t) => t.done).length;
  const tiers = REGION_RESEARCH_TIERS.map((t) => {
    const need = Math.min(tasks.length, Number.isFinite(t.need) ? t.need : tasks.length);
    const id = regionResearchClaimId(bundle.region.id, t.tier);
    return { tier: t.tier, label: t.label, need, reached: tasks.length > 0 && done >= need, claimed: !!claimed(id), claimId: id, reward: regionResearchRewardFor(t.tier, regionIndex) };
  })
    // 課題が少ない地域で「need が同じ段階」が重なったら、後ろの段階だけ残す
    .filter((t, i, all) => !all.slice(i + 1).some((later) => later.need === t.need));
  return { regionId: bundle.region.id, tasks, done, total: tasks.length, tiers };
}
