import { state } from '../state.js';
import { PLAYER_SKILL_TREE, PLAYER_TREE_BRANCHES } from '../data/playerSkillTree.js';
import { Audio_ } from '../audio.js';

let resetArmed = false;
const BRANCH_ORDER = ['blade', 'aegis', 'beast', 'hunt'];
const BRANCH_INFO = {
  blade: { title: '刃の星路', hint: '一撃を研ぐ攻勢の心得' },
  aegis: { title: '障の星路', hint: '受け止めて生き延びる心得' },
  beast: { title: '獣の星路', hint: '仲間の獣を率いる調教の心得' },
  hunt: { title: '狩の星路', hint: '巡回で獲物を追う狩人の心得' },
};
const KIND_LABEL = { core: 'ROOT', minor: 'MINOR', major: 'MAJOR', keystone: 'KEYSTONE' };

function nodeButton(n) {
  const s = state.playerTreeNodeStatus(n.id);
  const cls = s.bought ? 'bought' : s.canBuy ? 'available' : 'locked';
  const label = s.bought ? '取得済' : s.canBuy ? `${n.cost} SP` : s.prereq ? 'SP不足' : '前提未達';
  return `<button class="constellation-skill-node ${cls} ${n.kind}" data-wayfarer-node="${n.id}" ${s.canBuy ? '' : 'disabled'}><span class="skill-node-kind">${KIND_LABEL[n.kind] || n.kind.toUpperCase()}</span><strong>${n.name}</strong><small>${n.desc}</small><em>${label}</em></button>`;
}

export function renderWayfarerTree(container, opts = {}) {
  const available = state.playerTreeAvailable(), earned = state.playerTreeEarned();
  const root = PLAYER_SKILL_TREE.find(n => n.branch === 'root');
  const spent = state.playerTreeSpent();
  container.innerHTML = `<div class="constellation-shell"><div class="constellation-summary"><div><span class="constellation-kicker">WAYFARER SKILL TREE</span><strong>旅人星盤</strong></div><div class="constellation-count">SP ${available}/${earned}<br><span>消費 ${spent}</span></div></div><p class="constellation-hint">章ボスの撃破と職業Lvが旅人のSPになる。職業を替えても残る恒久的な心得 — リセットは無料。</p><div class="constellation-panel wayfarer-panel"><div class="constellation-skill-head"><div><strong>${PLAYER_TREE_BRANCHES.root}の星路 / ${root.name}</strong><small>4つの星路はこの根から分岐する。</small></div><button class="btn-sub" data-wayfarer-reset>${resetArmed ? '本当にリセット?' : '星盤リセット（無料）'}</button></div><div class="wayfarer-root">${nodeButton(root)}</div><div class="wayfarer-branches">${BRANCH_ORDER.map(b => `<section class="wayfarer-branch"><header><strong>${BRANCH_INFO[b].title}</strong><small>${BRANCH_INFO[b].hint}</small></header>${PLAYER_SKILL_TREE.filter(n => n.branch === b).map(nodeButton).join('')}</section>`).join('')}</div></div></div>`;
  for (const b of container.querySelectorAll('[data-wayfarer-node]:not([disabled])')) b.addEventListener('click', () => { if (state.buyPlayerTreeNode(b.dataset.wayfarerNode)) { Audio_.tap(); resetArmed = false; renderWayfarerTree(container, opts); } });
  container.querySelector('[data-wayfarer-reset]')?.addEventListener('click', () => {
    if (!resetArmed) { resetArmed = true; renderWayfarerTree(container, opts); return; }
    if (state.resetPlayerTree()) { Audio_.tap(); resetArmed = false; renderWayfarerTree(container, opts); }
  });
}
