import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { buildAbyssStage } from '../data/abyss.js';
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

// 最高到達階＋1（次に挑める階）を先頭に、新しい順に並べて表示する。
// 章のように事前生成された配列がないため、必要な分だけその場で作る。
export function renderAbyssList(onPick) {
  const list = document.getElementById('abyssList');
  list.innerHTML = '';
  const best = state.data.abyssBestDepth;
  const maxShown = best + 1;
  for (let depth = maxShown; depth >= 1; depth--) {
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
        <div class="rec">推奨Lv ${stage.recLevel}</div>
        ${modText}
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  }
  syncAbyssTabs();
}

// ---------------------------------------------------------
// 深淵ツリー（深淵拡張：覚醒ツリーとは別枠、深淵の欠片で永続強化）
// ---------------------------------------------------------
function renderAbyssTree() {
  const content = document.getElementById('abyssTreeContent');
  content.innerHTML = '';
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = '深淵の欠片は、深淵のエリート撃破・ボスフロア踏破で入手できる。深淵限定の永続強化に使う（覚醒しても失われない）。';
  content.appendChild(hint);
  for (const node of ALL_ABYSS_TREE_NODES) {
    content.appendChild(renderAbyssTreeNodeCard(node));
  }
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
