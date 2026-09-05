import { CHAPTERS } from '../data/stages.js';
import { journeyName } from '../data/worldVeil.js';
import { buildSecretRealmStage } from '../data/secretRealms.js';
import { buildRiftStage } from '../data/riftStages.js';
import { riftDanger, riftReward } from '../data/riftKeys.js';
import { world3EventStageByFlag } from '../data/world3EventStages.js';
import { EIGHTH_KEY_STAGES, eighthKeyProgress } from '../data/phase9EighthKey.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { rollBlessingChoices } from '../data/blessings.js';
import { KEY_DUNGEON_TYPES } from '../data/world2.js';
import { world2KeyStageDescriptor } from '../data/world2Stages.js';
import { knownObservedBranchesForPrimeRegion } from '../data/observedBranchDiscovery.js';
import { observedBranchStageProgress, observedBranchHuntTargets, buildObservedBranchStage } from '../data/observedBranchStages.js';

export function isStageDiscovered(chapter, stage, stageIndex) {
  if (!chapter || !stage) return false;
  if (stage.branch || stage.bounty) return !stage.requires || state.isStageCleared(stage.requires);
  if (stageIndex === 0) return true;
  const previousMainStage = chapter.stages.slice(0, stageIndex).filter(candidate => !candidate.branch && !candidate.bounty).at(-1);
  return !!previousMainStage && state.isStageCleared(previousMainStage.id);
}

function renderEighthKeyStages(list,onPick){
  if(!state.phase9NextWorldUnlocked?.())return;
  const progress=eighthKeyProgress(id=>state.isStageCleared(id));
  const h=document.createElement('div');h.className='section-heading';h.textContent=`第八鍵観測路　—　${progress.cleared}/${progress.total}`;list.appendChild(h);
  const intro=document.createElement('div');intro.className='stage-card boss';intro.innerHTML=`<div><div class="name">🔑 存在しない第八鍵</div><div class="rec">5地域MASTERで観測された人工的な境界。3つの高難度区画を突破すると、未知の世界層へ接触できる。</div></div><div class="cleared">${progress.open?'OPEN':'?'}</div>`;list.appendChild(intro);
  for(const def of EIGHTH_KEY_STAGES){
    const unlocked=!def.requires||state.isStageCleared(def.requires),cleared=state.isStageCleared(def.id),stage=unlocked?buildSecretRealmStage(def.id):null;
    const card=document.createElement('div');card.className='stage-card branch'+(!unlocked?' locked':'')+(def.final?' boss':'');
    card.innerHTML=`<div><div class="name">${unlocked?(def.final?'🚪 ':'◇ ')+def.name:'🔒 ?????'}</div><div class="rec">${unlocked?`推奨Lv ${stage.recLevel} / ${def.modifier.desc}`:'直前の第八鍵区画を突破すると観測可能'}</div></div><div class="cleared">${cleared?'★':unlocked?'→':''}</div>`;
    if(unlocked)card.addEventListener('click',()=>{Audio_.tap();onPick(stage);});list.appendChild(card);
  }
  if(progress.open){const open=document.createElement('div');open.className='stage-card boss';open.innerHTML='<div><div class="name">📡 WORLD LAYER CONTACT</div><div class="rec">零号門が開いた。直線的な建造物、規則的な光、機械文明の信号を明確に観測。次世界「機界」への接続座標を確立した。</div></div><div class="cleared">NEW</div>';list.appendChild(open);}
}

function renderWorld2StageSelect(onPick){
  document.getElementById('chapterTitle').textContent='発見された分岐';
  const list=document.getElementById('stageList');list.innerHTML='';
  const refresh=()=>renderWorld2StageSelect(onPick);
  const head=document.createElement('div');head.className='stage-card boss';head.innerHTML=`<div><div class="name">🧭 世界の外側へ続く道</div><div class="rec">鍵穴、探索で得た縁と手掛かり、深淵で発見した異界、境界異常をまとめて確認する。</div></div>`;list.appendChild(head);
  renderEighthKeyStages(list,onPick);
  const keyHeading=document.createElement('div');keyHeading.className='section-heading';keyHeading.textContent=`境界鍵路　—　鍵片 ${state.world2KeyFragments?.()||0}`;list.appendChild(keyHeading);
  const progress=state.world2Progress?.()||0,visibility=state.world2RealmVisibility?.()||{};
  for(const def of Object.values(KEY_DUNGEON_TYPES)){
    if(progress<def.minProgress)continue;
    const count=Math.max(0,state.data.world2?.keys?.[def.id]||0),stage=world2KeyStageDescriptor(def.id);if(!stage)continue;
    const card=document.createElement('div');card.className='stage-card branch';
    let displayName=stage.name;if(def.id==='celestial'&&visibility.heaven==='hidden')displayName='？？？';if(def.id==='infernal'&&visibility.underworld==='hidden')displayName='？？？';if(def.id==='anomaly'&&visibility.modern!=='hint')displayName='鍵界・？？？？';
    const identity=stage.world3Identity?` / ${stage.world3Identity}`:'';
    const goal=stage.world3Goal?`<br><span style="opacity:.8">${stage.world3Goal}</span>`:'';
    card.innerHTML=`<div><div class="name">${displayName}${identity}</div><div class="rec">推奨Lv ${stage.recLevel} / 所持鍵 ${count} / 作成: 鍵片${def.fragmentCost}${goal}</div></div><div class="cleared">${state.isStageCleared(stage.id)?'★':''}</div>`;
    const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap;margin-top:5px';
    const forge=document.createElement('button');forge.className='btn-sub';forge.textContent='鍵を作る';forge.disabled=(state.world2KeyFragments?.()||0)<def.fragmentCost;forge.addEventListener('click',ev=>{ev.stopPropagation();Audio_.tap();state.world2ForgeKey(def.id);refresh();});actions.appendChild(forge);
    const enter=document.createElement('button');enter.className='btn-main';enter.textContent='挑む';enter.disabled=count<=0;enter.addEventListener('click',ev=>{ev.stopPropagation();Audio_.tap();onPick(stage);});actions.appendChild(enter);
    card.firstElementChild.appendChild(actions);list.appendChild(card);
  }
  const discoveries=state.world2Discoveries?.()||[];
  if(discoveries.length){
    const h=document.createElement('div');h.className='section-heading';h.textContent='旅で得た縁と手掛かり';list.appendChild(h);
    for(const d of discoveries){
      const stage=world3EventStageByFlag(d.id);
      const card=document.createElement('div');card.className='stage-card branch';
      const playable=!!stage;
      card.innerHTML=`<div><div class="name">✦ ${d.name}</div><div class="rec">${d.hint||'探索中に得た手掛かり。'}${playable?` / 推奨Lv ${stage.recLevel}`:''}</div></div><div class="cleared">${playable&&state.isStageCleared(stage.id)?'★':playable?'→':''}</div>`;
      if(playable){const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap;margin-top:5px';const enter=document.createElement('button');enter.className='btn-main';enter.textContent=state.isStageCleared(stage.id)?'もう一度調べる':'手掛かりを追う';enter.addEventListener('click',ev=>{ev.stopPropagation();Audio_.tap();onPick(buildSecretRealmStage(stage.id));});actions.appendChild(enter);card.firstElementChild.appendChild(actions);}
      list.appendChild(card);
    }
  }
  const visibleSites=(state.explorationSites||[]).map(site=>({site,p:state.explorationProgress?.(site.id)})).filter(x=>x.p&&x.p.state!=='hidden');
  if(visibleSites.length){const h=document.createElement('div');h.className='section-heading';h.textContent='深淵で発見した異界';list.appendChild(h);}
  for(const {site,p} of visibleSites){
    const card=document.createElement('div');card.className='stage-card branch';const title=p.unlocked&&site.realm?`🚪 ${site.realmName}`:`🔎 ${site.discoveredName}`;const clue=site.fragmentsRequired?`手掛かり ${p.fragments}/${site.fragmentsRequired}`:(p.inspected?'調査済み':'未調査');
    card.innerHTML=`<div><div class="name">${title}</div><div class="rec">${clue}${site.finalGoal?' / 七つの鍵穴を持つ最終目標':''}</div></div><div class="cleared">${p.unlocked?'→':'?'}</div>`;
    const actions=document.createElement('div');actions.style.cssText='display:flex;gap:5px;flex-wrap:wrap;margin-top:5px';
    if(!p.inspected){const inspect=document.createElement('button');inspect.className='btn-sub';inspect.textContent='調べる';inspect.addEventListener('click',ev=>{ev.stopPropagation();if(state.inspectExplorationSite?.(site.id)){Audio_.tap();refresh();}});actions.appendChild(inspect);}
    if(p.unlocked&&site.realm){const enter=document.createElement('button');enter.className='btn-main';enter.textContent='異界へ入る';enter.addEventListener('click',ev=>{ev.stopPropagation();Audio_.tap();onPick(buildSecretRealmStage(site.realm.id));});actions.appendChild(enter);}
    card.firstElementChild.appendChild(actions);list.appendChild(card);
  }
  const riftKeys=state.riftKeys?.()||[];
  if(riftKeys.length){const h=document.createElement('div');h.className='section-heading';h.textContent=`裂界鍵 — 所持 ${riftKeys.length}本`;list.appendChild(h);}
  for(const key of riftKeys){
    const stage=buildRiftStage(key);if(!stage)continue;
    const card=document.createElement('div');card.className='stage-card branch';card.dataset.stageId=stage.id;
    const body=document.createElement('div');body.style.cssText='min-width:0;overflow-wrap:anywhere';
    const name=document.createElement('div');name.className='name';name.textContent=stage.name;
    const rec=document.createElement('div');rec.className='rec';rec.textContent=`推奨Lv ${stage.recLevel} / 目標IP ${stage.itemPowerTarget} / 出撃時にこの鍵を1本消費`;
    const enter=document.createElement('button');enter.className='btn-main';enter.textContent='裂界へ挑む';
    enter.addEventListener('click',()=>{Audio_.tap();onPick(stage);});
    body.append(name,rec,enter);card.appendChild(body);list.appendChild(card);
  }
}

// CLR-21 — appends the one authored, playable Observed Branch (currently
// only 王樹領・深緑の森, tied to Chapter 2) beneath its Prime chapter's own
// Stage list, once its existing CP4 discovery is satisfied. Branch Stage
// unlock/clear comes entirely from the existing stageProgress/isStageCleared
// authority via observedBranchStageProgress() — this function only renders.
// Cards are always appended after the chapter's own stage cards so
// stageFirstNavigationUi.js's index-based decoration of ordinary stage cards
// is unaffected.
function renderObservedBranchStageCards(chapter, list, onPick) {
  const branches = knownObservedBranchesForPrimeRegion(
    { chapterId: chapter.id, chapterNum: chapter.num },
    { discoveries: state.data.world2?.discoveries || {} },
  );
  for (const branch of branches) {
    const progress = observedBranchStageProgress(branch.id, { isStageCleared: id => state.isStageCleared(id) });
    if (!progress.stages.length) continue;
    const heading = document.createElement('div');
    heading.className = 'section-heading';
    heading.textContent = `◈ ${branch.observedLabel || branch.name}`;
    list.appendChild(heading);
    for (const stageInfo of progress.stages) {
      if (!stageInfo.unlocked) {
        const locked = document.createElement('div');
        locked.className = 'stage-card locked';
        locked.innerHTML = `<div><div class="name">🔒 ？？？</div><div class="rec">直前のStageをクリアすると開放</div></div><div class="cleared">LOCKED</div>`;
        list.appendChild(locked);
        break; // later Branch Stages stay unrendered until reached, like ordinary chapters.
      }
      const stage = buildObservedBranchStage(stageInfo.id);
      const card = document.createElement('div');
      card.className = 'stage-card' + (stageInfo.boss ? ' boss' : '');
      card.dataset.stageId = stage.id;
      card.dataset.stageState = stageInfo.cleared ? 'clear' : 'next';
      const icon = stageInfo.boss ? '👑 ' : '◈ ';
      card.innerHTML = `<div><div class="name">${icon}${stage.name}</div><div class="rec">推奨Lv ${stage.recLevel}</div></div><div class="cleared">${stageInfo.cleared ? '★' : ''}</div>`;
      card.addEventListener('click', () => { Audio_.tap(); onPick(buildObservedBranchStage(stageInfo.id)); });
      list.appendChild(card);
    }
    if (progress.cleared) {
      const huntHeading = document.createElement('div');
      huntHeading.className = 'section-heading';
      huntHeading.textContent = 'Branch Hunt — 周回先';
      list.appendChild(huntHeading);
      const roleLabels = { ecology: '生態巡回', deep: '深部巡回', boss: 'Boss再戦' };
      const targets = observedBranchHuntTargets(branch.id, { isStageCleared: id => state.isStageCleared(id) });
      for (const target of targets) {
        const hunt = document.createElement('div');
        hunt.className = 'stage-card branch' + (target.role === 'boss' ? ' boss' : '');
        hunt.dataset.stageId = target.stageId;
        hunt.dataset.stageState = 'next';
        hunt.innerHTML = `<div><div class="name">🔁 ${roleLabels[target.role]}：${target.name}</div><div class="rec">推奨Lv ${target.recLevel} / 戦利品候補 ${target.dropTable.length}種</div></div><div class="cleared">→</div>`;
        hunt.addEventListener('click', () => { Audio_.tap(); onPick(buildObservedBranchStage(target.stageId)); });
        list.appendChild(hunt);
      }
    }
  }
}

export function renderStageSelect(chapterIndex, onPick) {
  if(chapterIndex==='world2'||chapterIndex==='world3-branches'){renderWorld2StageSelect(onPick);return;}
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
  renderObservedBranchStageCards(chapter, list, onPick);
}

let currentBlessingChoices = [];
let selectedBlessingId = null;

export function renderStageConfirm(stage) {
  document.getElementById('confirmStageName').textContent = stage.name;
  document.getElementById('confirmStageRec').textContent = stage.itemPowerTarget ? `推奨Lv ${stage.recLevel} / 目標IP ${stage.itemPowerTarget}` : `推奨Lv ${stage.recLevel}`;
  const rewardText = stage.bounty ? `討伐報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold} / 初回討伐で固有の戦利品` : `クリア報酬: 経験値 ${stage.rewards.exp} / ゴールド ${stage.rewards.gold}${stage.firstClear ? '（初回クリアで装備入手）' : ''}`;
  document.getElementById('confirmStageRewards').textContent = rewardText;
  const modEl = document.getElementById('confirmModifiers');
  if(stage.raid){const tags=(stage.raidDangerTags||[]).join(' / ');modEl.textContent=`RAID PREPARATION\n危険: ${tags}\nMechanic: ${stage.raidMechanic}\n攻略ヒント: ${stage.raidCounterHint}\n報酬: ${stage.raidRewardHint}`;modEl.style.whiteSpace='pre-line';modEl.classList.remove('hidden');}
  else if(stage.isRift){const dangers=(stage.riftKey.dangers||[]).map(riftDanger).filter(Boolean).map(d=>d.name).join(' / ');modEl.textContent=`裂界：出撃時にこの鍵を1本消費（撤退・敗北でも戻りません）\n危険：${dangers||'なし'}\n報酬特性：${riftReward(stage.riftKey.reward)?.name||'通常'}`;modEl.style.whiteSpace='pre-line';modEl.classList.remove('hidden');}
  else if(stage.keyDungeon){modEl.textContent=`🔑 ${stage.world3Identity||'境界鍵ダンジョン'}：出撃時に鍵を1本消費\n${stage.world3Goal||''}${stage.world3Goal?'\n':''}${stage.modifiers?.map(m=>`${m.name}（${m.desc}）`).join(' ／ ')||''}`;modEl.style.whiteSpace='pre-line';modEl.classList.remove('hidden');}
  else if(stage.worldEventStage){modEl.textContent=`探索分岐：${stage.modifiers?.map(m=>`${m.name}（${m.desc}）`).join(' ／ ')||stage.name}`;modEl.style.whiteSpace='pre-line';modEl.classList.remove('hidden');}
  else if(stage.secretRealm){modEl.textContent=`異界：${stage.abyssEra||stage.name}\n${stage.modifiers?.map(m=>`${m.name}（${m.desc}）`).join(' ／ ')||''}`;modEl.style.whiteSpace='pre-line';modEl.classList.remove('hidden');}
  else if (stage.bounty) {const hint = stage.bountyRewardHint ? ` ／ 戦利品の噂：${stage.bountyRewardHint}` : '';modEl.textContent = `手配書：${stage.rumor || '詳細不明'} ／ 特徴：${stage.bountyGimmick || '未知の強敵'}${hint}`;modEl.classList.remove('hidden');}
  else if (stage.isAbyss) {const lines = [];if (stage.abyssRoute) lines.push(`${stage.abyssRoute.icon} ${stage.abyssRoute.name}：☠ ${stage.abyssRoute.risk} ／ ◆ ${stage.abyssRoute.reward}`);if (stage.modifiers?.length) lines.push(`環境：${stage.modifiers.map(m => `${m.name}（${m.desc}）`).join(' ／ ')}`);if (stage.abyssPacts?.length) lines.push(`盟約：${stage.abyssPacts.map(p => p.name).join(' ／ ')}　危険度${stage.abyssPactDanger}`);modEl.textContent = lines.join('\n');modEl.style.whiteSpace = 'pre-line';modEl.classList.toggle('hidden', lines.length === 0);}
  else if (stage.observedBranch) {const label = stage.observedBranchLabel || '観測分岐';modEl.textContent = `${label}\nPrime世界とは異なる歴史が観測されている。`;modEl.style.whiteSpace = 'pre-line';modEl.classList.remove('hidden');}
  else {modEl.textContent = '';modEl.classList.add('hidden');}
  const blessingRow = document.getElementById('confirmBlessingRow');
  if (stage.isAbyss) {currentBlessingChoices = rollBlessingChoices(3);selectedBlessingId = null;blessingRow.classList.remove('hidden');renderBlessingChoices(blessingRow);} else {currentBlessingChoices = [];selectedBlessingId = null;blessingRow.innerHTML = '';blessingRow.classList.add('hidden');}
}

function renderBlessingChoices(row) {
  row.innerHTML = '<div class="section-heading">出撃前の加護（1つ選択・任意・この階限り）</div>';
  for (const b of currentBlessingChoices) {const el = document.createElement('div');el.className = 'pick-row' + (selectedBlessingId === b.id ? ' selected' : '');el.innerHTML = `<div><div class="item-name">${b.name}</div><div class="item-stats">${b.desc}</div></div><button>${selectedBlessingId === b.id ? '選択中' : '選ぶ'}</button>`;el.querySelector('button').addEventListener('click', () => {selectedBlessingId = selectedBlessingId === b.id ? null : b.id;renderBlessingChoices(row);});row.appendChild(el);}
}

export function getSelectedBlessingId() { return selectedBlessingId; }
