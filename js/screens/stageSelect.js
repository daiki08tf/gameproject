import { CHAPTERS } from '../data/stages.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { rollBlessingChoices } from '../data/blessings.js';

/**
 * ステージは「存在を知っているものだけ」表示する。
 * - 各章の1ステージ目は章解放時から表示
 * - 本編2〜5は直前の本編ステージをクリアすると初めて出現
 * - 分岐は従来どおり requires 達成後に初めて出現
 *
 * 未到達ステージを ??? のカードとして並べないことで、
 * 次に何が待っているか分からない探索感を残す。
 */
export function isStageDiscovered(chapter, stage, stageIndex) {
  if (!chapter || !stage) return false;
  if (stage.branch) return !stage.requires || state.isStageCleared(stage.requires);
  if (stageIndex === 0) return true;

  // 分岐ステージは配列末尾へ追加されるため、本編の直前要素を参照すればよい。
  const previousMainStage = chapter.stages
    .slice(0, stageIndex)
    .filter((candidate) => !candidate.branch)
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
      + (stage.branch ? ' branch' : '');
    const cleared = state.isStageCleared(stage.id);
    const icon = stage.branch ? '🔀 ' : (stage.boss ? '👑 ' : '');
    card.innerHTML = `
      <div>
        <div class="name">${icon}${stage.name}</div>
        <div class="rec">推奨Lv ${stage.recLevel}</div>
      </div>
      <div class="cleared">${cleared ? '★' : ''}</div>
    `;
    card.addEventListener('click', () => { Audio_.tap(); onPick(stage); });
    list.appendChild(card);
  });
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
