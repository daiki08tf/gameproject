import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../data/stages.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

export function renderChapterSelect(onPick) {
  const list = document.getElementById('chapterList');
  list.innerHTML = '';
  CHAPTERS.forEach((ch, idx) => {
    const unlocked = isChapterUnlocked(idx, (id) => state.isStageCleared(id));
    const bossStage = finalStageOf(ch);
    const allCleared = ch.stages.every((s) => state.isStageCleared(s.id));
    const card = document.createElement('div');
    card.className = 'stage-card' + (!unlocked ? ' locked' : '') + (allCleared ? ' boss' : '');
    card.innerHTML = `
      <div>
        <div class="name">${unlocked ? ch.name : '🔒 ???'}</div>
        <div class="rec">${unlocked ? `推奨Lv ${ch.stages[0].recLevel}〜${bossStage.recLevel}` : '前章のボスを撃破すると解放'}</div>
      </div>
      <div class="cleared">${allCleared ? '★' : ''}</div>
    `;
    if (unlocked) {
      card.addEventListener('click', () => { Audio_.tap(); onPick(idx); });
    }
    list.appendChild(card);
  });
}
