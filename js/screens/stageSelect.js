import { CHAPTERS } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { rollBlessingChoices } from '../data/blessings.js';
import { KEY_DUNGEON_TYPES } from '../data/world2.js';
import { world2KeyStageDescriptor } from '../data/world2Stages.js';

export function isStageDiscovered(chapter, stage, stageIndex) {
  if (!chapter || !stage) return false;
  if (stage.branch || stage.bounty) return !stage.requires || state.isStageCleared(stage.requires);
  if (stageIndex === 0) return true;
  const previousMainStage = chapter.stages.slice(0, stageIndex).filter(candidate => !candidate.branch && !candidate.bounty).at(-1);
  return !!previousMainStage && state.isStageCleared(previousMainStage.id);
}

function renderWorld2StageSelect(onPick){
  document.getElementById('chapterTitle').textContent='境界鍵路';
  const list=document.getElementById('stageList');list.innerHTML='';
  const head=document.createElement('div');head.className='stage-card boss';head.innerHTML=`<div><div class="name">🔑 鍵片 ${state.world2KeyFragments?.()||0}</div><div class="rec">鍵を作り、通常世界の外側へ踏み込む。鍵は出撃時に1本消費。</div></div>`;list.appendChild(head);
  const progress=state.world2Progress?.()||0,visibility=state.world2RealmVisibility?.()||{};
  for(const def of Object.values(KEY_DUNGEON_TYPES)){
    if(progress<def.minProgress)continue;
    const count=Math.max(0,state.data.world2?.keys?.[def.id]||0),stage=world2KeyStageDescriptor(def.id);if(!stage)continue;
    const card=document.createElement('div');card.className='stage-card branch';
    let displayName=stage.name;if(def.id==='celestial'&&visibility.heaven==='hidden')displayName='？？？';if(def.id==='infernal'&&visibility.underworld==='hidden')displayName='？？？';if(def.id==='anomaly'&&visibility.modern!=='hint')displayName='鍵界・？？？？';
    card.innerHTML=`<div><div class="name">${displayName}</div><div class="rec">推奨Lv ${stage.recLevel} / 所持鍵 ${count} / 作成: 鍵片${def.fragmentCost}</div></div><div class="cleared">${state.isStageCleared(stage.id)?'★':''}</div>`;
    const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap;margin-top:5px';
    const forge=document.createElement('button');forge.className='btn-sub';forge.textContent='鍵を作る';forge.disabled=(state.world2KeyFragments?.()||0)<def.fragmentCost;forge.addEventListener('click',ev=>{ev.stopPropagation();Audio_.tap();state.world2ForgeKey(def.id);renderWorld2StageSelect(onPick);});actions.appendChild(forge);
    const enter=document.createElement('button');enter.className='btn-main';enter.textContent='挑む';enter.disabled=count<=0;enter.addEventListener('click',ev=>{ev.stopPropagation();Audio_.tap();onPick(stage);});actions.appendChild(enter);
    card.firstElementChild.appendChild(actions);list.appendChild(card);
  }
}

export function renderStageSelect(chapterIndex, onPick) {
  if(chapterIndex==='world2'){renderWorld2StageSelect(onPick);return;}
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
  if(stage.keyDungeon){
    modEl.textContent=`🔑 境界鍵ダンジョン：出撃時に鍵を1本消費\n${stage.modifiers?.map(m=>`${m.name}（${m.desc}）`).join(' ／ ')||''}`;modEl.style.whiteSpace='pre-line';modEl.classList.remove('hidden');
  } else if (stage.bounty) {
    const hint = stage.bountyRewardHint ? ` ／ 戦利品の噂：${stage.bountyRewardHint}` : '';
    modEl.textContent = `手配書：${stage.rumor || '詳細不明'} ／ 特徴：${stage.bountyGimmick || '未知の強敵'}${hint}`;
    modEl.classList.remove('hidden');
  } else if (stage.isAbyss) {
    const lines = [];
    if (stage.abyssRoute) lines.push(`${stage.abyssRoute.icon} ${stage.abyssRoute.name}：☠ ${stage.abyssRoute.risk} ／ ◆ ${stage.abyssRoute.reward}`);
    if (stage.modifiers?.length) lines.push(`環境：${stage.modifiers.map(m => `${m.name}（${m.desc}）`).join(' ／ ')}`);
    if (stage.abyssPacts?.length) lines.push(`盟約：${stage.abyssPacts.map(p => p.name).join(' ／ ')}　危険度${stage.abyssPactDanger}`);
    modEl.textContent = lines.join('\n');
    modEl.style.whiteSpace = 'pre-line';
    modEl.classList.toggle('hidden', lines.length === 0);
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
