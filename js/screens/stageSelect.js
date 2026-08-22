import { CHAPTERS } from '../data/stages.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { rollBlessingChoices } from '../data/blessings.js';

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

// 加護（Blessing）の3択と選択状態はこのモジュール内だけで保持する
// （セーブされない・出撃するたびに引き直す使い切りの選択のため）
let currentBlessingChoices = [];
let selectedBlessingId = null;

export function renderStageConfirm(stage) {
  document.getElementById('confirmStageName').textContent = stage.name;
  document.getElementById('confirmStageRec').textContent = `推奨Lv ${stage.recLevel}`;
  document.getElementById('confirmStageRewards').textContent =
    `クリア報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold}${stage.firstClear ? '（初回クリアで装備入手）' : ''}`;

  const modEl = document.getElementById('confirmModifiers');
  if (stage.isAbyss && stage.modifiers && stage.modifiers.length > 0) {
    modEl.textContent = `このフロアのモディファイア: ${stage.modifiers.map((m) => `${m.name}（${m.desc}）`).join(' ／ ')}`;
    modEl.classList.remove('hidden');
  } else {
    modEl.textContent = '';
    modEl.classList.add('hidden');
  }

  const blessingRow = document.getElementById('confirmBlessingRow');
  if (stage.isAbyss) {
    currentBlessingChoices = rollBlessingChoices(3);
    selectedBlessingId = null;
    blessingRow.classList.remove('hidden');
    renderBlessingChoices(blessingRow);
  } else {
    currentBlessingChoices = [];
    selectedBlessingId = null;
    blessingRow.innerHTML = '';
    blessingRow.classList.add('hidden');
  }
}

function renderBlessingChoices(row) {
  row.innerHTML = '<div class="section-heading">出撃前の加護（1つ選択・任意・この階限り）</div>';
  for (const b of currentBlessingChoices) {
    const el = document.createElement('div');
    el.className = 'pick-row' + (selectedBlessingId === b.id ? ' selected' : '');
    el.innerHTML = `
      <div><div class="item-name">${b.name}</div><div class="item-stats">${b.desc}</div></div>
      <button>${selectedBlessingId === b.id ? '選択中' : '選ぶ'}</button>
    `;
    el.querySelector('button').addEventListener('click', () => {
      selectedBlessingId = selectedBlessingId === b.id ? null : b.id;
      renderBlessingChoices(row);
    });
    row.appendChild(el);
  }
}

export function getSelectedBlessingId() { return selectedBlessingId; }
