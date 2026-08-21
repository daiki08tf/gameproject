import { CHAPTERS } from '../data/stages.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

export function renderStageSelect(onPick) {
  const chapter = CHAPTERS[0];
  document.getElementById('chapterTitle').textContent = chapter.name;
  const list = document.getElementById('stageList');
  list.innerHTML = '';
  for (const stage of chapter.stages) {
    const card = document.createElement('div');
    card.className = 'stage-card' + (stage.boss ? ' boss' : '');
    const cleared = state.isStageCleared(stage.id);
    card.innerHTML = `
      <div>
        <div class="name">${stage.boss ? '👑 ' : ''}${stage.name}</div>
        <div class="rec">推奨Lv ${stage.recLevel}</div>
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  }
}

export function renderStageConfirm(stage) {
  document.getElementById('confirmStageName').textContent = stage.name;
  document.getElementById('confirmStageRec').textContent = `推奨Lv ${stage.recLevel}`;
  document.getElementById('confirmStageRewards').textContent =
    `クリア報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold}${stage.firstClear ? '（初回クリアで装備入手）' : ''}`;
}
