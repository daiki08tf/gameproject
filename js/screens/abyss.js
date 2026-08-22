import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { buildAbyssStage } from '../data/abyss.js';

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
    card.innerHTML = `
      <div>
        <div class="name">${stage.name}${isNext ? '　<span style="color:var(--accent)">NEW</span>' : ''}</div>
        <div class="rec">推奨Lv ${stage.recLevel}</div>
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  }
}
