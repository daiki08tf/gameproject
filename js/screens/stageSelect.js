import { CHAPTERS } from '../data/stages.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { rollBlessingChoices } from '../data/blessings.js';

/**
 * ステージは「存在を知っているものだけ」表示する。
 * - 各章の1ステージ目は章解放時から表示
 * - 本編2〜5は直前の本編ステージをクリアすると初めて出現
 * - 分岐 / 賞金首は requires 達成後に初めて出現
 */
export function isStageDiscovered(chapter, stage, stageIndex) {
  if (!chapter || !stage) return false;
  if (stage.branch || stage.bounty) return !stage.requires || state.isStageCleared(stage.requires);
  if (stageIndex === 0) return true;

  const previousMainStage = chapter.stages
    .slice(0, stageIndex)
    .filter((candidate) => !candidate.branch && !candidate.bounty)
    .at(-1);
  return !!previousMainStage && state.isStageCleared(previousMainStage.id);
}

export function renderStageSelect(chapterIndex, onPick) {
  const chapter = CHAPTERS[chapterIndex];
  document.getElementById('chapterTitle').textContent = chapter.name;
  const list = document.getElementById('stageList');
  list.innerHTML = '';

  chapter.stages.forEach((stage, stageIndex) => {
    if (!isStageDiscovered(chapter, stage, stageIndex)) return;

    const card = document.createElement('div');
    card.className = 'stage-card'
      + (stage.boss ? ' boss' : '')
      + (stage.branch ? ' branch' : '')
      + (stage.bounty ? ' bounty' : '');
    const cleared = state.isStageCleared(stage.id);
    const icon = stage.bounty ? '🎯 ' : stage.branch ? '🔀 ' : (stage.boss ? '👑 ' : '');
    const sub = stage.bounty
      ? `${stage.bountyRank}級賞金首 / 推奨Lv ${stage.recLevel}`
      : `推奨Lv ${stage.recLevel}`;
    card.innerHTML = `
      <div>
        <div class="name">${icon}${stage.name}</div>
        <div class="rec">${sub}</div>
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  });
}

let currentBlessingChoices = [];
let selectedBlessingId = null;

export function renderStageConfirm(stage) {
  document.getElementById('confirmStageName').textContent = stage.name;
  document.getElementById('confirmStageRec').textContent = `推奨Lv ${stage.recLevel}`;
  document.getElementById('confirmStageRewards').textContent =
    `クリア報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold}${stage.firstClear ? '（初回クリアで装備入手）' : ''}`;

  const modEl = document.getElementById('confirmModifiers');
  if (stage.bounty) {
    modEl.textContent = `手配書：${stage.rumor || '詳細不明'} ／ 特徴：${stage.bountyGimmick || '未知の強敵'}`;
    modEl.classList.remove('hidden');
  } else if (stage.isAbyss && stage.modifiers && stage.modifiers.length > 0) {
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
