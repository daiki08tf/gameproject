/* ============================================================
   World Map Visibility — 地図の「知識モデル」（純データ層）
   ------------------------------------------------------------
   実機プレイテストの指摘: 「地図が世界全容を一気に見せすぎる」。
   このモジュールはノードごとの可視状態だけを決める。描画は
   worldMapUi.js、進行の判定権威は CHAPTERS / stageProgress /
   world2 / worldClimate のまま（ここは判定を受け取るだけ）。

   知識の段階:
     hidden       … 未発見。存在を知る理由がない → 描画しない
     rumored      … 噂・予兆で「何かある」ことを知っている → ？？？
     frontier     … 本編街道の「次の行き先」（次の解放章）→ ？？？
     waiting      … 発見済みだが気象待ち
     field-locked … 発見済みだがField Ability不足
     open         … 発見済み・到達可能
     cleared      … 踏破済み

   スポイラー防止の規則:
   - frontier より先の本編章は位置すら描かない
   - 名前のないノードへの道・領域名・未来の配置も描かない
   - 噂（heard）だけが hidden ノードを ??? へ昇格させる
   ============================================================ */
import { CHAPTERS, finalStageOf } from './stages.js';
import { sideLocationVisibility, sideLocationForeshadowed } from './sideLocations.js';
import { requiredFieldAbilityIds } from './fieldAbilities.js';
import { WORLD_MAP_NODES, WORLD_MAP_MAIN_ROUTE } from './worldMapLayout.js';
import { world3RegionForChapter, WORLD3_REGIONS } from './world3Regions.js';

const NODE_BY_ID = new Map(WORLD_MAP_NODES.map((n) => [n.id, n]));
const CHAPTER_BY_ID = new Map(CHAPTERS.map((c) => [c.id, c]));
const CHAPTER_IDX = new Map(CHAPTERS.map((c, i) => [c.id, i]));

function chapterNum(id) {
  const m = /^ch(\d+)$/.exec(id);
  return m ? Number(m[1]) : null;
}

// ノードが属する領域（anchorの章の領域へ従属させる）
export function worldMapNodeRegionId(node) {
  if (!node || node.kind === 'town') return 'frontier';
  const num = chapterNum(node.id) ?? chapterNum(node.anchor || '');
  return world3RegionForChapter(num)?.id || null;
}

/* ----------------------------------------------------------
   computeWorldMapVisibility(input)

   input:
     isUnlocked(idx)      — 章が行ける状態か（CHAPTERS index）
     isCleared(stageId)   — Stage踏破判定
     fieldOk(req)         — Field Ability充足（省略時 true）
     hasDiscovery(id)     — world2.discoveries 発見済み判定
     climateGateState(ch) — 'open'|'waiting'|その他（省略時 'open'）
     heardNodeIds         — 噂を実際に「聞いた」ノードidのSet

   return:
     nodes: Map<nodeId, {state:'town'|'open'|'cleared'|'frontier'|
                        'rumored'|'waiting'|'field-locked'|'merchant'}>
     regions: 既知領域idの配列（WORLD3_REGIONS順）
     currentRegion: 現在表示すべき領域id
   ---------------------------------------------------------- */
export function computeWorldMapVisibility(input = {}) {
  const isUnlocked = input.isUnlocked || (() => false);
  const isCleared = input.isCleared || (() => false);
  const fieldOk = input.fieldOk || (() => true);
  const hasDiscovery = input.hasDiscovery || (() => false);
  const gateState = input.climateGateState || (() => 'open');
  const heard = input.heardNodeIds instanceof Set ? input.heardNodeIds : new Set();

  const nodes = new Map();

  /* 本編街道の開拓先端 — 最初の未解放章だけが「次の行き先」として
     位置を明かす。それ以遠は位置も道も描かない（スポイラー防止）。 */
  let frontierId = null;
  for (const id of WORLD_MAP_MAIN_ROUTE) {
    const idx = CHAPTER_IDX.get(id);
    if (idx == null) continue;
    if (!isUnlocked(idx)) { frontierId = id; break; }
  }

  for (const node of WORLD_MAP_NODES) {
    if (node.kind === 'town') { nodes.set(node.id, { state: 'town' }); continue; }

    if (node.kind === 'merchant') {
      // 隠れ商人は発見して初めて点る。未発見なら存在自体を描かない。
      if (node.discovery && hasDiscovery(node.discovery)) nodes.set(node.id, { state: 'merchant' });
      else if (heard.has(node.id)) nodes.set(node.id, { state: 'rumored' });
      continue;
    }

    const ch = CHAPTER_BY_ID.get(node.id);
    if (!ch) continue;
    const idx = CHAPTER_IDX.get(node.id);
    const unlocked = isUnlocked(idx);
    const cleared = !!finalStageOf(ch) && isCleared(finalStageOf(ch).id);

    if (ch.sideLocation) {
      const ok = ch.requiresField ? fieldOk(ch.requiresField) : true;
      const foreshadowed = sideLocationForeshadowed(ch, isCleared);
      const discoveryOk = !ch.requiresDiscovery || hasDiscovery(ch.requiresDiscovery);
      const gate = ch.climateGate ? gateState(ch) : 'open';
      let vis = sideLocationVisibility(ch, { unlocked: unlocked && discoveryOk, foreshadowed, fieldOk: ok });
      if (ch.climateGate && unlocked && ok && discoveryOk && gate === 'open') vis = 'open';
      else if (ch.climateGate && unlocked && discoveryOk && gate === 'waiting') vis = 'waiting';
      else if (ch.requiresDiscovery && unlocked && !discoveryOk) vis = foreshadowed ? 'foreshadow' : 'hidden';

      const anchor = node.anchor ? NODE_BY_ID.get(node.anchor) : null;
      const anchorVisible = anchor ? (nodes.get(anchor.id)?.state !== undefined) : false;

      if (unlocked && discoveryOk && vis !== 'hidden') {
        if (vis === 'waiting') nodes.set(node.id, { state: 'waiting' });
        else if (vis === 'field-locked') nodes.set(node.id, { state: 'field-locked' });
        else nodes.set(node.id, { state: cleared ? 'cleared' : 'open' });
      } else if (heard.has(node.id)) {
        // 実際に噂を聞いた場所だけが、未踏でも「？？？」として灯る
        nodes.set(node.id, { state: 'rumored' });
      } else if (vis === 'foreshadow' || (anchorVisible && (vis === 'open' || vis === 'waiting' || vis === 'field-locked'))) {
        // foreshadowAfter踏破＝界からの明確な予兆、または既知地域の
        // 未達地点（一覧で「？？？」の気配カードと同じ扱い）
        nodes.set(node.id, { state: 'rumored' });
      }
      continue;
    }

    /* 本編章・外伝 — 解放済みは名前つき、本編の先端のみ？？？、
       それ以遠と未踏外伝は（噂で灯らない限り）描かない。 */
    if (unlocked) nodes.set(node.id, { state: cleared ? 'cleared' : 'open' });
    else if (node.id === frontierId) nodes.set(node.id, { state: 'frontier' });
    else if (heard.has(node.id)) nodes.set(node.id, { state: 'rumored' });
  }

  /* 既知領域 — 表示ノードを1つ以上含む領域のみ。 */
  const used = new Set();
  for (const id of nodes.keys()) {
    const r = worldMapNodeRegionId(NODE_BY_ID.get(id));
    if (r) used.add(r);
  }
  const regions = WORLD3_REGIONS.map((r) => r.id).filter((id) => used.has(id));

  /* 現在領域 — frontier章の領域（全部解放済みなら最後の領域）。 */
  const frontierNum = frontierId ? chapterNum(frontierId) : null;
  const currentRegion = (frontierNum && world3RegionForChapter(frontierNum)?.id)
    || regions[regions.length - 1]
    || 'frontier';

  return { nodes, regions, currentRegion, frontierId };
}

export { requiredFieldAbilityIds, WORLD3_REGIONS };
