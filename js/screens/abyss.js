import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { buildAbyssStage } from '../data/abyss.js';
import { ABYSS_ENDGAME_MILESTONES } from '../data/abyssEndgame.js';
import { ALL_ABYSS_TREE_NODES, abyssTreeNodeCostFor } from '../data/abyssTree.js';

let abyssActiveTab = 'challenge';

export function initAbyssTabs() {
  document.querySelectorAll('#abyssScreen .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Audio_.tap();
      abyssActiveTab = btn.dataset.atab;
      syncAbyssTabs();
    });
  });
}

function syncAbyssTabs() {
  document.querySelectorAll('#abyssScreen .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.atab === abyssActiveTab);
  });
  document.getElementById('abyssHint').classList.toggle('hidden', abyssActiveTab !== 'challenge');
  document.getElementById('abyssList').classList.toggle('hidden', abyssActiveTab !== 'challenge');
  document.getElementById('abyssTreeContent').classList.toggle('hidden', abyssActiveTab !== 'tree');
  document.getElementById('abyssShardText').textContent = `🔹 ${state.data.abyssShards}`;
  if (abyssActiveTab === 'tree') renderAbyssTree();
}

// 数千階を全DOM化しない。最新40階を基本に、到達済みのロードマップ節目を残す。
// 初期〜40階は従来どおり全階表示されるため序盤UXは変わらない。
export function abyssVisibleDepths(bestDepth) {
  const best = Math.max(0, Math.floor(Number(bestDepth) || 0));
  const next = best + 1;
  const keep = new Set();
  const recentStart = Math.max(1, next - 39);
  for (let d = recentStart; d <= next; d += 1) keep.add(d);
  keep.add(1);
  for (const milestone of ABYSS_ENDGAME_MILESTONES) {
    if (milestone.depth <= next) keep.add(milestone.depth);
  }
  return [...keep].sort((a, b) => b - a);
}

export function renderAbyssList(onPick) {
  const list = document.getElementById('abyssList');
  list.innerHTML = '';
  const best = state.data.abyssBestDepth;
  const maxShown = best + 1;
  const depths = abyssVisibleDepths(best);

  for (let index = 0; index < depths.length; index += 1) {
    const depth = depths[index];
    const previous = index > 0 ? depths[index - 1] : null;
    if (previous != null && previous - depth > 1) {
      const gap = document.createElement('div');
      gap.className = 'hint';
      gap.style.textAlign = 'center';
      gap.textContent = `⋯ ${previous - depth - 1}階省略 ⋯`;
      list.appendChild(gap);
    }

    const stage = buildAbyssStage(depth);
    const isNext = depth === maxShown;
    const cleared = depth <= best;
    const card = document.createElement('div');
    card.className = 'stage-card' + (stage.boss ? ' boss' : '');
    const modText = stage.modifiers.length > 0
      ? `<div class="rec">${stage.modifiers.map((m) => m.name).join(' ／ ')}</div>`
      : '';
    card.innerHTML = `
      <div>
        <div class="name">${stage.name}${isNext ? '　<span style="color:var(--accent)">NEW</span>' : ''}</div>
        <div class="rec">推奨Lv ${stage.recLevel.toLocaleString()} ／ 目標IP ${stage.itemPowerTarget.toLocaleString()}</div>
        <div class="rec">${stage.abyssEra}</div>
        ${modText}
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  }
  syncAbyssTabs();
}

function renderAbyssTree() {
  const content = document.getElementById('abyssTreeContent');
  content.innerHTML = '';
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = '深淵の欠片は、深淵のエリート撃破・ボスフロア踏破で入手できる。深淵限定の永続強化に使う（覚醒しても失われない）。';
  content.appendChild(hint);
  for (const node of ALL_ABYSS_TREE_NODES) content.appendChild(renderAbyssTreeNodeCard(node));
}

function renderAbyssTreeNodeCard(node) {
  const rank = state.abyssTreeNodeRank(node.id);
  const maxed = rank >= node.maxRank;
  const cost = abyssTreeNodeCostFor(node, rank);
  const canBuy = state.canBuyAbyssTreeNode(node.id);
  const currentText = node.pctPerRank ? `現在 +${Math.round(rank * node.pctPerRank * 1000) / 10}%` : `現在 ${rank > 0 ? '習得済み' : '未習得'}`;
  const card = document.createElement('div');
  card.className = 'forge-card';
  card.innerHTML = `
    <div class="forge-card-top">
      <div class="forge-card-name">${node.name}${node.big ? '<span class="mastered-badge">★大型</span>' : ''}</div>
      <div>Lv.${rank}/${node.maxRank}</div>
    </div>
    <div class="forge-card-sub">${node.desc}（${currentText}）</div>
    <button class="forge-card-btn" ${maxed || !canBuy ? 'disabled' : ''}>
      ${maxed ? 'MAX' : `強化する（🔹${cost}）`}
    </button>
  `;
  card.querySelector('button').addEventListener('click', () => {
    if (state.buyAbyssTreeNode(node.id)) { Audio_.pickup(); syncAbyssTabs(); }
  });
  return card;
}
