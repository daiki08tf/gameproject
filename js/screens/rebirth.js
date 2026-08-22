import { state } from '../state.js';
import { Audio_ } from '../audio.js';

export function renderRebirth() {
  const content = document.getElementById('rebirthContent');
  content.innerHTML = '';

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
