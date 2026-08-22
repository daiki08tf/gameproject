import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { AWAKENING_NODES, awakeningNodeCost } from '../data/awakening.js';
import { AWAKENING_LAYER } from '../data/balance.js';

let rebirthActiveTab = 'reincarnate';
let awakenArmed = false; // 覚醒は取り返しがつくとはいえレベルが1に戻るため、2段階確認にする

export function initRebirthTabs() {
  document.querySelectorAll('#rebirthScreen .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Audio_.tap();
      rebirthActiveTab = btn.dataset.rtab;
      awakenArmed = false;
      renderRebirth();
    });
  });
}

export function renderRebirth() {
  document.querySelectorAll('#rebirthScreen .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.rtab === rebirthActiveTab);
  });
  const content = document.getElementById('rebirthContent');
  content.innerHTML = '';
  if (rebirthActiveTab === 'awaken') renderAwakenTab(content);
  else renderReincarnateTab(content);
}

// ---------------------------------------------------------
// 転生タブ（既存・加算オンリー）
// ---------------------------------------------------------
function renderReincarnateTab(content) {
  const n = state.data.reincarnations;
  const cost = state.reincarnationCost();
  const canDo = state.data.gold >= cost.gold && state.data.manastone >= cost.manastone;

  const panel = document.createElement('div');
  panel.className = 'rebirth-panel';
  panel.innerHTML = `
    <div class="rebirth-count">${n}</div>
    <div class="rebirth-bonus">転生回数：全ステータス +${n * 3}%（永続）</div>
    <p class="sub">転生してもレベル・職業・装備・所持品は一切失いません。</p>
    <p class="sub">次の転生コスト：💰${cost.gold} ／ 💎${cost.manastone}</p>
    <button class="btn-main" id="doReincarnateBtn" ${canDo ? '' : 'disabled'}>転生する</button>
  `;
  content.appendChild(panel);
  panel.querySelector('#doReincarnateBtn').addEventListener('click', () => {
    if (state.reincarnate()) { Audio_.jobMastered(); renderRebirth(); }
  });
}

// ---------------------------------------------------------
// 覚醒タブ（Phase 2：Reincarnation 2.0 / プレステージリセット）
// ---------------------------------------------------------
function renderAwakenTab(content) {
  const highest = state.highestJobLevel();
  const canDo = state.canAwaken();
  const preview = state.awakenPreviewPoints();

  const panel = document.createElement('div');
  panel.className = 'rebirth-panel';
  panel.innerHTML = `
    <div class="rebirth-count">${state.data.awakeningPoints}💠</div>
    <div class="rebirth-bonus">覚醒ポイント（覚醒回数：${state.data.awakenings}）</div>
    <p class="sub">覚醒すると全職業のレベル・経験値が1に戻り、覚醒ポイントを獲得します。</p>
    <p class="sub">装備・所持品・ゴールド・魔石・マスター済み職業・武器熟練度・転生・ステージ進行は一切失いません。</p>
    <p class="sub">現在の最高職業レベル：${highest}　${canDo ? `（覚醒で ${preview}💠 獲得）` : `（Lv.${AWAKENING_LAYER.MIN_LEVEL_TO_AWAKEN} 以上で覚醒可能）`}</p>
    <button class="btn-main" id="doAwakenBtn" ${canDo ? '' : 'disabled'}>${awakenArmed ? '本当に覚醒する（レベルが1に戻ります）' : '覚醒する'}</button>
    ${awakenArmed ? '<button class="btn-sub" id="cancelAwakenBtn" style="width:100%;margin-top:8px;">やめる</button>' : ''}
  `;
  content.appendChild(panel);

  panel.querySelector('#doAwakenBtn').addEventListener('click', () => {
    if (!canDo) return;
    if (!awakenArmed) {
      awakenArmed = true;
      renderRebirth();
      return;
    }
    const gained = state.awaken();
    if (gained) { Audio_.jobMastered(); awakenArmed = false; renderRebirth(); }
  });
  const cancelBtn = panel.querySelector('#cancelAwakenBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => { awakenArmed = false; renderRebirth(); });

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.textContent = '覚醒ツリー（永続・覚醒してもリセットされません）';
  content.appendChild(heading);

  for (const node of AWAKENING_NODES) {
    const rank = state.awakeningNodeRank(node.id);
    const maxed = rank >= AWAKENING_LAYER.NODE_MAX_RANK;
    const cost = awakeningNodeCost(rank);
    const canBuy = state.canBuyAwakeningNode(node.id);
    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name">${node.name}</div>
        <div>Lv.${rank}/${AWAKENING_LAYER.NODE_MAX_RANK}</div>
      </div>
      <div class="forge-card-sub">${node.desc}（現在 +${Math.round(rank * node.pctPerRank * 1000) / 10}%）</div>
      <button class="forge-card-btn" ${maxed || !canBuy ? 'disabled' : ''}>
        ${maxed ? 'MAX' : `強化する（💠${cost}）`}
      </button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      if (state.buyAwakeningNode(node.id)) { Audio_.pickup(); renderRebirth(); }
    });
    content.appendChild(card);
  }
}
