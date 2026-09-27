/* ============================================================
   World Map — 空間的な「冒険へ出る」レイヤ（知識モデル版）
   ------------------------------------------------------------
   実機プレイテスト: 「Adventureが縦のリストで世界に感じられない」
   → 続報: 「世界全容を一度に見せすぎて、密度もスポイラーも問題」。

   この patch は chapterSelectScreen の先頭に地域ごとの地図を挿す。
   可視判定は js/data/worldMapVisibility.js の知識モデルが一手に決める:
   - 未発見の章・探索地点・領域・道は描画しない（？？？すら出さない）
   - 本編街道の「次の行き先」だけが frontier の？？？として見える
   - 噂を実際に聞いた場所は未踏でも？？？として灯る
   - 領域は既知のものだけ [前の地域] [次の地域] で行き来する

   タップ先は既存の章カード（[data-chapter-index] の click）に委譲する
   ため、Stage-first の権威・解放判定・報酬経路は一切変わらない。
   ============================================================ */
import { state } from '../state.js';
import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { sideLocationRequiresField } from '../data/sideLocations.js';
import { FIELD_ABILITIES } from '../data/fieldAbilities.js';
import {
  WORLD_MAP_NODES, WORLD_MAP_MAIN_ROUTE,
  WORLD_MAP_RUMOR_BADGES,
} from '../data/worldMapLayout.js';
import { computeWorldMapVisibility, worldMapNodeRegionId, WORLD3_REGIONS } from '../data/worldMapVisibility.js';
import { SESSION8_RUMOR_THREADS } from '../data/rumorNetwork2.js';
import { Audio_ } from '../audio.js';
import { showToast } from './toastFeedback.js';
import { renderSettlement } from './settlementUi.js';
import './rumorHearing.js';

const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const NODE_BY_ID = new Map(WORLD_MAP_NODES.map((n) => [n.id, n]));
const REGION_BY_ID = new Map(WORLD3_REGIONS.map((r) => [r.id, r]));
let activeRegionId = null;

function ensureStyles() {
  if (document.querySelector('link[data-world-map-style]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/worldMap.css';
  link.dataset.worldMapStyle = 'true';
  document.head.appendChild(link);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
}

/* ---- ノード状態の解決（クリック時の案内文用） ---- */

function chapterIndexById(id) {
  return CHAPTERS.findIndex((ch) => ch.id === id);
}

function chapterNodeState(ch, idx) {
  const unlocked = isChapterUnlocked(idx, (id) => state.isStageCleared(id));
  const boss = finalStageOf(ch);
  const cleared = !!boss && state.isStageCleared(boss.id);
  return { unlocked, cleared, name: journeyName(ch) };
}

/* ---- 噂バッジ＋噂で灯るノード ---- */
function rumorBadges() {
  const threads = state.rumorNetworkThreads?.() || [];
  const byNode = {};
  const heardIds = new Set();
  for (const rec of threads) {
    const threadId = String(rec.rumorId || '').replace(/^s8_/, '');
    const nodeId = WORLD_MAP_RUMOR_BADGES[threadId];
    if (!nodeId) continue;
    const thread = SESSION8_RUMOR_THREADS.find((t) => t.id === threadId);
    const recId = rec.id || `rumor:s8_${threadId}`;
    const entries = rec.entries || [];
    const unheard = entries.filter((e) => !state.isRumorEntryHeard?.(recId, e.id)).length;
    byNode[nodeId] ??= { count: 0, unheard: 0, resolved: false, title: '' };
    const b = byNode[nodeId];
    b.count += 1;
    b.unheard += unheard;
    if (unheard < entries.length) heardIds.add(nodeId);
    if (rec.rumorState === 'resolved') b.resolved = true;
    if (!b.title) b.title = thread?.title || rec.name || '';
  }
  return { byNode, heardIds };
}

/* ---- クリック先の解決 ---- */
function clickChapterCard(idx) {
  const card = document.querySelector(`#chapterList [data-chapter-index="${idx}"]`);
  if (card) { card.click(); return true; }
  return false;
}

function onNodeTap(node, nodeState) {
  const idx = chapterIndexById(node.id);
  if (node.kind === 'town') {
    Audio_.tap();
    renderSettlement();
    showScreen('settlementScreen');
    return;
  }
  if (node.kind === 'merchant') {
    Audio_.tap();
    const disc = state.data.world2?.discoveries?.[node.discovery];
    showToast(disc ? `${node.label}：${disc.hint || '旧道の外れで商いをしている。'}` : '噂に聞く商人がこの辺りにいるらしい。', 3200);
    return;
  }
  if (idx < 0) return;
  const ch = CHAPTERS[idx];
  Audio_.tap();
  if (nodeState === 'rumored' || nodeState === 'frontier') {
    showToast(nodeState === 'frontier'
      ? 'まだ辿り着いていない土地。街道を進めば道が開く。'
      : '噂や気配だけが届いている場所。', 2800);
    return;
  }
  if (nodeState === 'field-locked') {
    const missing = (sideLocationRequiresField(ch) || []).map((a) => FIELD_ABILITIES[a]?.label || a).join('／');
    showToast(`${ch.fieldHint || '先へ進む術がない。'}${missing ? ` 必要: ${missing}` : ''}`, 3200);
    return;
  }
  if (nodeState === 'waiting') {
    showToast('気象が揃うのを待つ場所。', 2600);
    return;
  }
  if (!clickChapterCard(idx)) showToast('この場所は一覧から選んでください。', 2600);
}

/* ---- SVG 組み立て ---- */
function nodeShape(node) {
  const { x, y } = node;
  if (node.kind === 'town') return `<rect x="${x - 12}" y="${y - 12}" width="24" height="24" class="wm-shape"/>`;
  if (node.kind === 'merchant') return `<path d="M${x} ${y - 10} L${x + 9} ${y} L${x} ${y + 10} L${x - 9} ${y} Z" class="wm-shape"/>`;
  if (node.kind === 'side' || node.kind === 'gaiden') {
    const r = node.kind === 'gaiden' ? 8 : 7;
    return `<path d="M${x} ${y - r} L${x + r} ${y} L${x} ${y + r} L${x - r} ${y} Z" class="wm-shape"/>`;
  }
  return `<circle cx="${x}" cy="${y}" r="10" class="wm-shape"/>`;
}

export function renderWorldMap() {
  const screen = document.getElementById('chapterSelectScreen');
  const list = document.getElementById('chapterList');
  if (!screen || !list) return;
  ensureStyles();

  const { byNode: badges, heardIds } = rumorBadges();

  /* 知識モデル — 何を描くかはすべてここで決まる */
  const model = computeWorldMapVisibility({
    isUnlocked: (idx) => isChapterUnlocked(idx, (id) => state.isStageCleared(id)),
    isCleared: (id) => state.isStageCleared(id),
    fieldOk: (req) => state.fieldAbilityAvailable?.(req) ?? true,
    hasDiscovery: (id) => !!state.data.world2?.discoveries?.[id],
    climateGateState: (ch) => state.climateGateState?.(ch.climateGate, ch) || 'open',
    heardNodeIds: heardIds,
  });

  /* 領域ごとに描く — activeRegion が既知外なら現在領域へ */
  const known = model.regions.length ? model.regions : ['frontier'];
  if (!activeRegionId || !known.includes(activeRegionId)) activeRegionId = model.currentRegion;
  const regionIdx = Math.max(0, known.indexOf(activeRegionId));
  const region = REGION_BY_ID.get(activeRegionId);

  /* この領域に属する可視ノードだけを選ぶ（街は開拓辺境の住民） */
  const visible = WORLD_MAP_NODES.filter((n) => {
    const st = model.nodes.get(n.id);
    if (!st) return false;
    if (n.kind === 'town') return activeRegionId === 'frontier';
    return worldMapNodeRegionId(n) === activeRegionId;
  });
  const visibleIds = new Set(visible.map((n) => n.id));

  /* viewBox — 表示ノードの範囲へ裁ち落とす（地図は知っている分だけ） */
  const PAD = 90;
  const xs = visible.map((n) => n.x), ys = visible.map((n) => n.y);
  const x0 = Math.max(0, Math.min(...xs) - PAD), y0 = Math.max(0, Math.min(...ys) - PAD);
  const w = Math.max(320, Math.max(...xs) - Math.min(...xs) + PAD * 2);
  const h = Math.max(300, Math.max(...ys) - Math.min(...ys) + PAD * 2);

  const parts = [];
  parts.push(`<svg viewBox="${x0} ${y0} ${w} ${h}" class="worldmap-svg" role="img" aria-label="${esc(region?.name || '世界地図')}">`);

  /* 本編街道 — 表示ノード間の分節だけを引く（未来の道は存在しない） */
  const routePts = ['settlement', ...WORLD_MAP_MAIN_ROUTE].filter((id) => visibleIds.has(id));
  for (let i = 1; i < routePts.length; i += 1) {
    const a = NODE_BY_ID.get(routePts[i - 1]), b = NODE_BY_ID.get(routePts[i]);
    if (!a || !b) continue;
    const frontier = model.nodes.get(b.id)?.state === 'frontier';
    parts.push(`<path d="M${a.x} ${a.y} L${b.x} ${b.y}" class="wm-road${frontier ? ' wm-road-faint' : ''}"/>`);
  }

  /* 側道 — 両端が見えている時だけ */
  for (const n of visible) {
    const a = n.anchor ? NODE_BY_ID.get(n.anchor) : null;
    if (a && visibleIds.has(a.id)) {
      const faint = model.nodes.get(n.id)?.state === 'rumored';
      parts.push(`<path d="M${a.x} ${a.y} L${n.x} ${n.y}" class="wm-road wm-road-branch${faint ? ' wm-road-faint' : ''}"/>`);
    }
  }

  /* ノード */
  for (const node of visible) {
    const st = model.nodes.get(node.id)?.state || 'open';
    const idx = node.kind === 'town' || node.kind === 'merchant' ? -1 : chapterIndexById(node.id);
    const ch = idx >= 0 ? CHAPTERS[idx] : null;
    let cls = `wm-node terrain-${node.terrain || 'plain'} kind-${node.kind}`;
    let label = node.label;
    let sub = '';

    if (node.kind === 'town') {
      cls += ' wm-town';
    } else if (node.kind === 'merchant') {
      cls += st === 'rumored' ? ' wm-rumored' : ' wm-merchant';
      if (st === 'rumored') label = '？？？';
      else sub = '商';
    } else if (st === 'rumored' || st === 'frontier') {
      label = '？？？';
      cls += st === 'frontier' ? ' wm-frontier' : ' wm-rumored';
    } else {
      if (ch && !ch.sideLocation) label = ch.displayName || journeyName(ch).replace(/^第\d+章[ 　]/, '') || node.label;
      cls += st === 'cleared' ? ' wm-cleared' : st === 'waiting' ? ' wm-waiting' : st === 'field-locked' ? ' wm-field-locked' : ' wm-open';
      if (ch && !ch.sideLocation) {
        const cs = chapterNodeState(ch, idx);
        if (!cs.cleared) cls += ' wm-next';
      }
      if (st === 'waiting') sub = '気象待ち';
    }

    const badge = badges[node.id];
    const badgeHtml = badge ? `<g class="wm-rumor-badge${badge.unheard ? ' wm-unheard' : ''}"><circle cx="${node.x + 14}" cy="${node.y - 16}" r="10" class="wm-badge-dot"/><text x="${node.x + 14}" y="${node.y - 11}" class="wm-badge-text">${badge.unheard || '噂'}</text></g>` : '';

    parts.push(`<g class="${cls}" data-map-node="${node.id}" data-map-state="${st}" tabindex="0" role="button" aria-label="${esc(label)}">`
      + `<circle cx="${node.x}" cy="${node.y}" r="20" class="wm-hit" fill="transparent"/>`
      + nodeShape(node)
      + `<text x="${node.x}" y="${node.y + 30}" class="wm-label">${esc(label)}</text>`
      + (sub ? `<text x="${node.x}" y="${node.y - 18}" class="wm-sub">${esc(sub)}</text>` : '')
      + badgeHtml
      + `</g>`);
  }

  parts.push('</svg>');

  /* 領域ナビ — 既知領域が複数ある時だけ行き来できる */
  const navHtml = known.length > 1
    ? `<div class="worldmap-region-nav"><button class="wm-region-btn" data-dir="-1" ${regionIdx <= 0 ? 'disabled' : ''}>‹ 前の地域</button><span class="wm-region-name">${esc(region?.name || '')}</span><button class="wm-region-btn" data-dir="1" ${regionIdx >= known.length - 1 ? 'disabled' : ''}>次の地域 ›</button></div>`
    : `<div class="worldmap-region-nav"><span class="wm-region-name">${esc(region?.name || '開拓辺境')}</span></div>`;

  let panel = screen.querySelector('#worldMapPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'worldMapPanel';
    panel.className = 'worldmap-panel';
    screen.insertBefore(panel, list);
  }
  const svgHtml = parts.join('');
  const htmlKey = `${activeRegionId}|${known.join(',')}|${svgHtml}`;
  if (panel.dataset.mapHtml !== htmlKey) {
    panel.dataset.mapHtml = htmlKey;
    panel.innerHTML = `<div class="worldmap-head"><strong>世界地図</strong><span class="hint">地名をタップで移動 ／ ○記章=噂のある場所</span></div>${navHtml}<div class="worldmap-scroll">${svgHtml}</div>`;
    panel.querySelector('svg')?.addEventListener('click', (ev) => {
      const g = ev.target.closest?.('[data-map-node]');
      if (!g) return;
      const node = NODE_BY_ID.get(g.dataset.mapNode);
      if (node) onNodeTap(node, g.dataset.mapState);
    });
    panel.querySelector('svg')?.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const g = ev.target.closest?.('[data-map-node]');
      if (!g) return;
      ev.preventDefault();
      const node = NODE_BY_ID.get(g.dataset.mapNode);
      if (node) onNodeTap(node, g.dataset.mapState);
    });
    panel.querySelectorAll('.wm-region-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const dir = Number(btn.dataset.dir) || 0;
        const next = regionIdx + dir;
        if (next < 0 || next >= known.length) return;
        Audio_.tap();
        activeRegionId = known[next];
        renderWorldMap();
      });
    });
  }

  /* 既存一覧を <details> に畳む（一度だけ・chapterList自体は不変） */
  if (!screen.dataset.worldMapFolded) {
    screen.dataset.worldMapFolded = 'true';
    const details = document.createElement('details');
    details.className = 'worldmap-list-details';
    details.innerHTML = '<summary>地域・探索地点の一覧（詳細）</summary>';
    screen.insertBefore(details, list);
    details.appendChild(list);
  }
}

/* renderChapterSelect が #chapterList を書き換えるたびに地図も追従する。
   childListのみ監視し、panelは chapterList の兄弟（書き換え対象外）なので
   自作の書き込みでループしない。描画は mapHtml 比較で冪等。 */
function install() {
  const screen = document.getElementById('chapterSelectScreen');
  const list = document.getElementById('chapterList');
  if (!screen || !list || screen.dataset.worldMapInstalled) return;
  screen.dataset.worldMapInstalled = 'true';
  let scheduled = false;
  const schedule = () => {
    if (scheduled) return;
    scheduled = true;
    queueMicrotask(() => { scheduled = false; renderWorldMap(); });
  };
  document.getElementById('goStageBtn')?.addEventListener('click', () => { activeRegionId = null; schedule(); });
  new MutationObserver(schedule).observe(list, { childList: true });
  schedule();
}
install();

export { rumorBadges as worldMapRumorBadges };
