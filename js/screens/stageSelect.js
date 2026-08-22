import { CHAPTERS } from '../data/stages.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

export function renderStageSelect(chapterIndex, onPick) {
  const chapter = CHAPTERS[chapterIndex];
  document.getElementById('chapterTitle').textContent = chapter.name;
  const list = document.getElementById('stageList');
  list.innerHTML = '';
  for (const stage of chapter.stages) {
    const locked = stage.requires && !state.isStageCleared(stage.requires);
    const card = document.createElement('div');
    card.className = 'stage-card'
      + (stage.boss ? ' boss' : '')
      + (stage.branch ? ' branch' : '')
      + (locked ? ' locked' : '');
    const cleared = state.isStageCleared(stage.id);
    const icon = stage.branch ? '🔀 ' : (stage.boss ? '👑 ' : '');
    card.innerHTML = `
      <div>
        <div class="name">${icon}${locked ? '???' : stage.name}</div>
        <div class="rec">${locked ? '本編ステージ3をクリアすると出現' : `推奨Lv ${stage.recLevel}`}</div>
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    if (!locked) card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  }
}

export function renderStageConfirm(stage) {
  document.getElementById('confirmStageName').textContent = stage.name;
  document.getElementById('confirmStageRec').textContent = `推奨Lv ${stage.recLevel}`;
  document.getElementById('confirmStageRewards').textContent =
    `クリア報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold}${stage.firstClear ? '（初回クリアで装備入手）' : ''}`;
}
