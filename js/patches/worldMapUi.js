/* ============================================================
   World Map — 空間的な「冒険へ出る」レイヤ
   ------------------------------------------------------------
   実機プレイテスト: 「Adventureが縦のリストで世界に感じられない」。
   この patch は chapterSelectScreen の先頭に SVG の世界地図を挿し、
   章・探索地点・外伝・隠れ商人・宿場町を「位置」として提示する。
   タップ先は既存の章カード（[data-chapter-index] の click）に委譲する
   ため、Stage-first の権威・解放判定・報酬経路は一切変わらない。

   - Chapter/Stage 権威: CHAPTERS / isChapterUnlocked / isStageCleared
   - 探索地点の可視性: sideLocationVisibility + requiresDiscovery +
     climateGate（chapterSelect.js と同じ手順）
   - 噂: SESSION8 thread の存在と未聞行数をノード上にバッジ表示
   ============================================================ */
import { state } from '../state.js';
import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { sideLocationVisibility, sideLocationForeshadowed, sideLocationRequiresField } from '../data/sideLocations.js';
import { FIELD_ABILITIES } from '../data/fieldAbilities.js';
import {
  WORLD_MAP_VIEW, WORLD_MAP_NODES, WORLD_MAP_MAIN_ROUTE,
  WORLD_MAP_RUMOR_BADGES, WORLD_MAP_REGION_LABELS, worldMapNode,
} from '../data/worldMapLayout.js';
import { SESSION8_RUMOR_THREADS } from '../data/rumorNetwork2.js';
import { Audio_ } from '../audio.js';
import { showToast } from './toastFeedback.js';
import { renderSettlement } from './settlementUi.js';
import './rumorHearing.js';

const esc = (v) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const NODE_BY_ID = new Map(WORLD_MAP_NODES.map((n) => [n.id, n]));
let scrollOnNextRender = true;

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

/* ---- ノード状態の解決（chapterSelect.js と同じ判定を再利用） ---- */

function chapterIndexById(id) {
  return CHAPTERS.findIndex((ch) => ch.id === id);
}

function chapterNodeState(ch, idx) {
  const unlocked = isChapterUnlocked(idx, (id) => state.isStageCleared(id));
  const boss = finalStageOf(ch);
  const cleared = !!boss && state.isStageCleared(boss.id);
  return { unlocked, cleared, name: journeyName(ch) };
}

function sideNodeState(ch, idx) {
  const unlocked = isChapterUnlocked(idx, (id) => state.isStageCleared(id));
  const fieldOk = ch.requiresField ? (state.fieldAbilityAvailable?.(ch.requiresField) ?? true) : true;
  const foreshadowed = sideLocationForeshadowed(ch, (id) => state.isStageCleared(id));
  const discoveryOk = !ch.requiresDiscovery || !!(state.data.world2?.discoveries?.[ch.requiresDiscovery]);
  const gateState = ch.climateGate ? (state.climateGateState?.(ch.climateGate, ch) || 'open') : 'open';
  const openNow = unlocked && fieldOk && discoveryOk && gateState === 'open';
  let vis = sideLocationVisibility(ch, { unlocked: unlocked && discoveryOk, foreshadowed, fieldOk });
  if (ch.climateGate && openNow) vis = fieldOk ? 'open' : 'field-locked';
  else if (ch.climateGate && unlocked && discoveryOk && gateState === 'waiting') vis = 'waiting';
  else if (ch.requiresDiscovery && unlocked && !discoveryOk) vis = foreshadowed ? 'foreshadow' : 'hidden';
  return { vis, unlocked, fieldOk, gateState, name: ch.displayName || ch.name, fieldHint: ch.fieldHint || '' };
}

/* ---- 噂バッジ ---- */
function rumorBadges() {
  const threads = state.rumorNetworkThreads?.() || [];
  const byNode = {};
  for (const rec of threads) {
    const threadId = String(rec.rumorId || '').replace(/^s8_/, '');
    const nodeId = WORLD_MAP_RUMOR_BADGES[threadId];
    if (!nodeId) continue;
    const thread = SESSION8_RUMOR_THREADS.find((t) => t.id === threadId);
    const recId = rec.id || `rumor:s8_${threadId}`;
    const unheard = (rec.entries || []).filter((e) => !state.isRumorEntryHeard?.(recId, e.id)).length;
    byNode[nodeId] ??= { count: 0, unheard: 0, resolved: false, title: '' };
    const b = byNode[nodeId];
    b.count += 1;
    b.unheard += unheard;
    if (rec.rumorState === 'resolved') b.resolved = true;
    if (!b.title) b.title = thread?.title || rec.name || '';
  }
  return byNode;
}

/* ---- クリック先の解決 ---- */
function clickChapterCard(idx) {
  const card = document.querySelector(`#chapterList [data-chapter-index="${idx}"]`);
  if (card) { card.click(); return true; }
  return false;
}

function onNodeTap(node) {
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
    showToast(disc ? `${node.label}：${disc.hint || '旧道の外れで商いをしている。'}` : `${node.label} — まだ見つけていない。`, 3200);
    return;
  }
  if (idx < 0) return;
  const ch = CHAPTERS[idx];
  Audio_.tap();
  if (ch.sideLocation) {
    const s = sideNodeState(ch, idx);
    if (s.vis === 'open' && s.unlocked) {
      if (!clickChapterCard(idx)) showToast('この場所は一覧から選んでください。', 2600);
      return;
    }
    if (s.vis === 'open' && !s.unlocked) {
      showToast('奇妙な気配がする場所。まだ道は見えていない。', 2600);
      return;
    }
    if (s.vis === 'field-locked') {
      const missing = (sideLocationRequiresField(ch) || []).map((a) => FIELD_ABILITIES[a]?.label || a).join('／');
      showToast(`${s.fieldHint || '先へ進む術がない。'}${missing ? ` 必要: ${missing}` : ''}`, 3200);
      return;
    }
    showToast(s.fieldHint || 'まだ道が見えていない場所。噂や気象が揃えば辿り着けるかもしれない。', 2600);
    return;
  }
  const cs = chapterNodeState(ch, idx);
  if (!cs.unlocked) { showToast('まだ辿り着いていない土地。街道を進めば道が開く。', 2600); return; }
  if (!clickChapterCard(idx)) showToast('この章は一覧から選んでください。', 2600);
}

/* ---- SVG 組み立て ---- */
function nodeShape(node, state2) {
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

  const badges = rumorBadges();
  const parts = [];
  parts.push(`<svg viewBox="0 0 ${WORLD_MAP_VIEW.width} ${WORLD_MAP_VIEW.height}" class="worldmap-svg" role="img" aria-label="世界地図">`);

  /* 領域名キャプション */
  for (const r of WORLD_MAP_REGION_LABELS) {
    parts.push(`<text x="${r.x}" y="${r.y}" class="wm-region-label">${esc(r.label)}</text>`);
  }

  /* 本編街道（章番号順の一本道） */
  const routePts = ['settlement', ...WORLD_MAP_MAIN_ROUTE].map((id) => NODE_BY_ID.get(id)).filter(Boolean);
  const routePath = routePts.map((n, i) => `${i ? 'L' : 'M'}${n.x} ${n.y}`).join(' ');
  parts.push(`<path d="${routePath}" class="wm-road"/>`);

  /* 側道（anchorへの枝線） */
  for (const n of WORLD_MAP_NODES) {
    const a = n.anchor ? NODE_BY_ID.get(n.anchor) : null;
    if (a) parts.push(`<path d="M${a.x} ${a.y} L${n.x} ${n.y}" class="wm-road wm-road-branch"/>`);
  }

  /* ノード */
  for (const node of WORLD_MAP_NODES) {
    const idx = node.kind === 'town' || node.kind === 'merchant' ? -1 : chapterIndexById(node.id);
    let cls = `wm-node terrain-${node.terrain || 'plain'} kind-${node.kind}`;
    let label = node.label;
    let stateAttr = 'open';
    let sub = '';

    if (node.kind === 'town') {
      cls += ' wm-town';
    } else if (node.kind === 'merchant') {
      const discovered = !!state.data.world2?.discoveries?.[node.discovery];
      if (!discovered) continue;
      cls += ' wm-merchant';
      sub = '商';
    } else {
      const ch = CHAPTERS[idx];
      if (!ch) continue;
      if (ch.sideLocation) {
        const s = sideNodeState(ch, idx);
        if (s.vis === 'hidden') continue;
        stateAttr = s.vis;
        // 'open'でも未到達（unlocksAfter未踏破）の場所は一覧では「？？？」
        // の気配カードになる —— 地図でも同じ扱いにする。
        if (s.vis === 'foreshadow' || (s.vis === 'open' && !s.unlocked)) { label = '？？？'; cls += ' wm-foreshadow'; stateAttr = 'foreshadow'; }
        else if (s.vis === 'waiting') { cls += ' wm-waiting'; sub = '気象待ち'; }
        else if (s.vis === 'field-locked') { cls += ' wm-field-locked'; }
        if (s.vis === 'open' && s.unlocked && state.isStageCleared(finalStageOf(ch)?.id)) cls += ' wm-cleared';
      } else {
        const cs = chapterNodeState(ch, idx);
        label = cs.unlocked ? (ch.displayName || journeyName(ch).replace(/^第\d+章[ 　]/, '') || node.label) : '？？？';
        stateAttr = !cs.unlocked ? 'locked' : cs.cleared ? 'cleared' : 'next';
        cls += ` wm-${stateAttr}`;
      }
    }

    const badge = badges[node.id];
    const badgeHtml = badge ? `<g class="wm-rumor-badge${badge.unheard ? ' wm-unheard' : ''}"><circle cx="${node.x + 14}" cy="${node.y - 16}" r="10" class="wm-badge-dot"/><text x="${node.x + 14}" y="${node.y - 11}" class="wm-badge-text">${badge.unheard || '噂'}</text></g>` : '';

    parts.push(`<g class="${cls}" data-map-node="${node.id}" data-map-state="${stateAttr}" tabindex="0" role="button" aria-label="${esc(label)}">`
      + `<circle cx="${node.x}" cy="${node.y}" r="20" class="wm-hit" fill="transparent"/>`
      + nodeShape(node)
      + `<text x="${node.x}" y="${node.y + 30}" class="wm-label">${esc(label)}</text>`
      + (sub ? `<text x="${node.x}" y="${node.y - 18}" class="wm-sub">${esc(sub)}</text>` : '')
      + badgeHtml
      + `</g>`);
  }

  parts.push('</svg>');

  /* 既存の詳細一覧は地図の下に畳んで保持（権威・描画は従来どおり） */
  let panel = screen.querySelector('#worldMapPanel');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'worldMapPanel';
    panel.className = 'worldmap-panel';
    screen.insertBefore(panel, list);
  }
  const svgHtml = parts.join('');
  if (panel.dataset.mapHtml !== svgHtml) {
    panel.dataset.mapHtml = svgHtml;
    panel.innerHTML = `<div class="worldmap-head"><strong>世界地図</strong><span class="hint">地名をタップで移動 ／ ○記章=噂のある場所</span></div><div class="worldmap-scroll">${svgHtml}</div>`;
    panel.querySelector('svg')?.addEventListener('click', (ev) => {
      const g = ev.target.closest?.('[data-map-node]');
      if (!g) return;
      const node = NODE_BY_ID.get(g.dataset.mapNode);
      if (node) onNodeTap(node);
    });
    panel.querySelector('svg')?.addEventListener('keydown', (ev) => {
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      const g = ev.target.closest?.('[data-map-node]');
      if (!g) return;
      ev.preventDefault();
      const node = NODE_BY_ID.get(g.dataset.mapNode);
      if (node) onNodeTap(node);
    });
  }

  /* 画面を開くたび「次に進む場所」へスクロールする（scrollOnNextRender
     は goStageBtn のクリックで立つ）。地図を眺めている最中の再描画
     （噂バッジ更新など）では位置を奪わない。 */
  if (scrollOnNextRender) {
    scrollOnNextRender = false;
    const sc = panel.querySelector('.worldmap-scroll');
    const nextEl = panel.querySelector('.wm-next') || panel.querySelector('.wm-town');
    if (sc && nextEl) {
      const nr = nextEl.getBoundingClientRect();
      const sr = sc.getBoundingClientRect();
      sc.scrollTop = Math.max(0, sc.scrollTop + nr.top - sr.top - sc.clientHeight / 2 + 30);
    }
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
  document.getElementById('goStageBtn')?.addEventListener('click', () => { scrollOnNextRender = true; schedule(); });
  new MutationObserver(schedule).observe(list, { childList: true });
  schedule();
}
install();

export { rumorBadges as worldMapRumorBadges };
