import { CHAPTERS } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { rollBlessingChoices } from '../data/blessings.js';

export function isStageDiscovered(chapter, stage, stageIndex) {
  if (!chapter || !stage) return false;
  if (stage.branch || stage.bounty) return !stage.requires || state.isStageCleared(stage.requires);
  if (stageIndex === 0) return true;
  const previousMainStage = chapter.stages.slice(0, stageIndex).filter(candidate => !candidate.branch && !candidate.bounty).at(-1);
  return !!previousMainStage && state.isStageCleared(previousMainStage.id);
}

export function renderStageSelect(chapterIndex, onPick) {
  const chapter = CHAPTERS[chapterIndex];
  document.getElementById('chapterTitle').textContent = journeyName(chapter);
  const list = document.getElementById('stageList');
  list.innerHTML = '';
  chapter.stages.forEach((stage, stageIndex) => {
    if (!isStageDiscovered(chapter, stage, stageIndex)) return;
    const card = document.createElement('div');
    card.className = 'stage-card' + (stage.boss ? ' boss' : '') + (stage.branch ? ' branch' : '') + (stage.bounty ? ' bounty' : '');
    const cleared = state.isStageCleared(stage.id);
    const icon = stage.bounty ? '🎯 ' : stage.branch ? '🔀 ' : (stage.boss ? '👑 ' : '');
    const sub = stage.bounty ? `${stage.bountyRank}級賞金首 / 推奨Lv ${stage.recLevel}` : `推奨Lv ${stage.recLevel}`;
    card.innerHTML = `<div><div class="name">${icon}${stage.name}</div><div class="rec">${sub}</div></div><div class="cleared">${cleared ? '★' : ''}</div>`;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  });
}

let currentBlessingChoices = [];
let selectedBlessingId = null;

export function renderStageConfirm(stage) {
  document.getElementById('confirmStageName').textContent = stage.name;
  document.getElementById('confirmStageRec').textContent = `推奨Lv ${stage.recLevel}`;
  const rewardText = stage.bounty
    ? `討伐報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold} / 初回討伐で固有の戦利品`
    : `クリア報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold}${stage.firstClear ? '（初回クリアで装備入手）' : ''}`;
  document.getElementById('confirmStageRewards').textContent = rewardText;

  const modEl = document.getElementById('confirmModifiers');
  if (stage.bounty) {
    const hint = stage.bountyRewardHint ? ` ／ 戦利品の噂：${stage.bountyRewardHint}` : '';
    modEl.textContent = `手配書：${stage.rumor || '詳細不明'} ／ 特徴：${stage.bountyGimmick || '未知の強敵'}${hint}`;
    modEl.classList.remove('hidden');
  } else if (stage.isAbyss && stage.modifiers && stage.modifiers.length > 0) {
    modEl.textContent = `このフロアのモディファイア: ${stage.modifiers.map(m => `${m.name}（${m.desc}）`).join(' ／ ')}`;
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
    el.innerHTML = `<div><div class="item-name">${b.name}</div><div class="item-stats">${b.desc}</div></div><button>${selectedBlessingId === b.id ? '選択中' : '選ぶ'}</button>`;
    el.querySelector('button').addEventListener('click', () => {
      selectedBlessingId = selectedBlessingId === b.id ? null : b.id;
      renderBlessingChoices(row);
    });
    row.appendChild(el);
  }
}

export function getSelectedBlessingId() { return selectedBlessingId; }
