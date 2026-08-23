import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { AWAKENING_BRANCHES, nodesInBranch, awakeningNodeCostFor } from '../data/awakening.js';
import { AWAKENING_LAYER, ARTIFACT_LAYER } from '../data/balance.js';
import { ARTIFACTS, getArtifact } from '../data/artifacts.js';

let rebirthActiveTab = 'reincarnate';
let inheritArmed = false;
let awakenArmed = false;
let selectedArtifactSlot = null;

const STAT_LABELS = { hp: 'HP', mp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', spd: 'SPD' };

export function initRebirthTabs() {
  document.querySelectorAll('#rebirthScreen .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Audio_.tap();
      rebirthActiveTab = btn.dataset.rtab;
      inheritArmed = false;
      awakenArmed = false;
      selectedArtifactSlot = null;
      renderRebirth();
    });
  });
}

export function renderRebirth() {
  document.querySelectorAll('#rebirthScreen .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.rtab === rebirthActiveTab);
  });
  const content = document.getElementById('rebirthContent');
  content.innerHTML = '';
  if (rebirthActiveTab === 'awaken') renderAwakenTab(content);
  else if (rebirthActiveTab === 'artifact') renderArtifactTab(content);
  else renderInheritanceTab(content);
}

function statPreviewRows(preview) {
  return Object.keys(STAT_LABELS).map((key) => {
    const source = preview.sourceStats[key] || 0;
    const next = preview.nextInheritedStats[key] || 0;
    return `<div class="status-row"><span>${STAT_LABELS[key]}</span><span>${source.toLocaleString()} → <strong>${next.toLocaleString()}</strong></span></div>`;
  }).join('');
}

function allocationRows() {
  const unspent = state.inheritanceUnspentPoints();
  return Object.keys(STAT_LABELS).map((key) => {
    const value = state.data.inheritanceAllocated?.[key] || 0;
    return `<div class="forge-card inheritance-stat-row" data-inherit-stat="${key}">
      <div class="forge-card-top"><div class="forge-card-name">${STAT_LABELS[key]}</div><strong>+${Number(value).toLocaleString()}</strong></div>
      <div class="inheritance-buttons">
        <button class="btn-sub" data-add="1" ${unspent < 1 ? 'disabled' : ''}>+1</button>
        <button class="btn-sub" data-add="10" ${unspent < 1 ? 'disabled' : ''}>+10</button>
        <button class="btn-sub" data-add="100" ${unspent < 1 ? 'disabled' : ''}>+100</button>
        <button class="btn-sub" data-add="max" ${unspent < 1 ? 'disabled' : ''}>MAX</button>
      </div>
    </div>`;
  }).join('');
}

function renderInheritanceTab(content) {
  const preview = state.inheritancePreview();
  const unspent = state.inheritanceUnspentPoints();
  const rateText = `${Math.round(preview.ratePct * 1000) / 1000}%`;

  const panel = document.createElement('div');
  panel.className = 'rebirth-panel';
  panel.innerHTML = `
    <div class="rebirth-count">${state.data.reincarnations}</div>
    <div class="rebirth-bonus">継承回数</div>
    <p class="sub">Character Lv.${preview.level.toLocaleString()} → Lv.1。職業Lv・MASTER・装備・所持品・進行・覚醒は維持されます。</p>
    <p class="sub">今回の継承率：<strong>${rateText}</strong> ／ 獲得ボーナスポイント：<strong>${preview.bonusPoints.toLocaleString()} pt</strong></p>
    <p class="sub">継承対象はCharacter Lv由来の基礎能力＋過去の継承値＋継承BPです。装備・Affix・MASTERなどは二重継承しません。</p>
    <div class="section-heading">継承プレビュー</div>
    <div class="status-grid">${statPreviewRows(preview)}</div>
    <button class="btn-main" id="doInheritanceBtn">${inheritArmed ? '本当に継承する（Character Lvが1に戻ります）' : '継承する'}</button>
    ${inheritArmed ? '<button class="btn-sub" id="cancelInheritanceBtn" style="width:100%;margin-top:8px;">やめる</button>' : ''}
  `;
  content.appendChild(panel);

  panel.querySelector('#doInheritanceBtn').addEventListener('click', () => {
    if (!inheritArmed) {
      inheritArmed = true;
      renderRebirth();
      return;
    }
    state.performInheritance();
    Audio_.jobMastered();
    inheritArmed = false;
    renderRebirth();
  });
  const cancel = panel.querySelector('#cancelInheritanceBtn');
  if (cancel) cancel.addEventListener('click', () => { inheritArmed = false; renderRebirth(); });

  const allocation = document.createElement('div');
  allocation.innerHTML = `
    <div class="section-heading">継承ボーナス</div>
    <div class="forge-card"><div class="forge-card-top"><div class="forge-card-name">未使用ポイント</div><strong>${unspent.toLocaleString()} pt</strong></div>
      <div class="forge-card-sub">1ptにつき選んだステータス+1。振り直しは無料です。</div>
      <button class="btn-sub" id="resetInheritanceBtn" style="width:100%;margin-top:8px;">振り直す</button>
    </div>
    ${allocationRows()}
  `;
  content.appendChild(allocation);

  allocation.querySelector('#resetInheritanceBtn').addEventListener('click', () => {
    state.resetInheritanceAllocation();
    Audio_.tap();
    renderRebirth();
  });
  allocation.querySelectorAll('[data-inherit-stat]').forEach((row) => {
    row.querySelectorAll('[data-add]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const available = state.inheritanceUnspentPoints();
        const raw = btn.dataset.add;
        const amount = raw === 'max' ? available : Number(raw);
        if (state.allocateInheritancePoints(row.dataset.inheritStat, amount)) Audio_.pickup();
        renderRebirth();
      });
    });
  });
}

function renderAwakenTab(content) {
  const highest = state.highestJobLevel();
  const canDo = state.canAwaken();
  const preview = state.awakenPreviewPoints();
  const startLv = state.awakeningStartLevel();

  const panel = document.createElement('div');
  panel.className = 'rebirth-panel';
  panel.innerHTML = `
    <div class="rebirth-count">${state.data.awakeningPoints}💠</div>
    <div class="rebirth-bonus">覚醒ポイント（覚醒回数：${state.data.awakenings}）</div>
    <p class="sub">覚醒すると全職業のレベル・経験値がLv.${startLv}に戻り、覚醒ポイントを獲得します（獲得量は最高到達レベル・深淵到達階・職業MASTER数で決まります）。</p>
    <p class="sub">装備・所持品・ゴールド・魔石・マスター済み職業・武器熟練度・継承・ステージ進行は一切失いません。</p>
    <p class="sub">現在の最高職業レベル：${highest}　${canDo ? `（覚醒で ${preview}💠 獲得）` : `（Lv.${AWAKENING_LAYER.MIN_LEVEL_TO_AWAKEN} 以上で覚醒可能）`}</p>
    <button class="btn-main" id="doAwakenBtn" ${canDo ? '' : 'disabled'}>${awakenArmed ? `本当に覚醒する（職業レベルがLv.${startLv}に戻ります）` : '覚醒する'}</button>
    ${awakenArmed ? '<button class="btn-sub" id="cancelAwakenBtn" style="width:100%;margin-top:8px;">やめる</button>' : ''}
  `;
  content.appendChild(panel);

  panel.querySelector('#doAwakenBtn').addEventListener('click', () => {
    if (!canDo) return;
    if (!awakenArmed) { awakenArmed = true; renderRebirth(); return; }
    const gained = state.awaken();
    if (gained) { Audio_.jobMastered(); awakenArmed = false; renderRebirth(); }
  });
  const cancelBtn = panel.querySelector('#cancelAwakenBtn');
  if (cancelBtn) cancelBtn.addEventListener('click', () => { awakenArmed = false; renderRebirth(); });

  for (const branchId in AWAKENING_BRANCHES) {
    const branch = AWAKENING_BRANCHES[branchId];
    const heading = document.createElement('div');
    heading.className = 'section-heading';
    heading.textContent = `${branch.name}（${branch.desc}）`;
    content.appendChild(heading);
    for (const node of nodesInBranch(branchId)) content.appendChild(renderAwakeningNodeCard(node));
  }
}

function renderAwakeningNodeCard(node) {
  const rank = state.awakeningNodeRank(node.id);
  const maxed = rank >= node.maxRank;
  const cost = awakeningNodeCostFor(node, rank);
  const canBuy = state.canBuyAwakeningNode(node.id);
  const currentText = node.levels ? `現在 Lv.${rank > 0 ? node.levels[rank - 1] : 1}` : `現在 +${Math.round(rank * node.pctPerRank * 1000) / 10}%`;
  const card = document.createElement('div');
  card.className = 'forge-card';
  card.innerHTML = `
    <div class="forge-card-top"><div class="forge-card-name">${node.name}${node.big ? '<span class="mastered-badge">★大型</span>' : ''}</div><div>Lv.${rank}/${node.maxRank}</div></div>
    <div class="forge-card-sub">${node.desc}（${currentText}）</div>
    <button class="forge-card-btn" ${maxed || !canBuy ? 'disabled' : ''}>${maxed ? 'MAX' : `強化する（💠${cost}）`}</button>
  `;
  card.querySelector('button').addEventListener('click', () => { if (state.buyAwakeningNode(node.id)) { Audio_.pickup(); renderRebirth(); } });
  return card;
}

function renderArtifactTab(content) {
  const slotCount = state.artifactSlotCount();
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = `覚醒回数が${ARTIFACT_LAYER.SLOT_UNLOCK_AWAKENINGS.join('・')}回に達するごとにスロットが増える（最大${ARTIFACT_LAYER.SLOT_UNLOCK_AWAKENINGS.length}個）。解放した秘宝は消費されず、スロットへ自由に付け替えられる。`;
  content.appendChild(hint);

  const slotsHead = document.createElement('div');
  slotsHead.className = 'forge-card';
  slotsHead.innerHTML = `<div class="forge-card-sub">アーティファクトスロット（${slotCount}/${ARTIFACT_LAYER.SLOT_UNLOCK_AWAKENINGS.length}）</div><div class="rune-slots" id="artifactSlotsRow"></div>`;
  content.appendChild(slotsHead);
  const row = slotsHead.querySelector('#artifactSlotsRow');
  for (let i = 0; i < ARTIFACT_LAYER.SLOT_UNLOCK_AWAKENINGS.length; i++) {
    const unlocked = i < slotCount;
    const artifactId = state.data.equippedArtifacts[i];
    const artifact = artifactId ? getArtifact(artifactId) : null;
    const slot = document.createElement('div');
    slot.className = 'rune-slot' + (artifact ? ' filled' : '') + (!unlocked ? ' locked' : '');
    slot.textContent = !unlocked ? '🔒' : (artifact ? '✨' : '+');
    slot.title = !unlocked ? '未解放スロット' : (artifact ? artifact.name : '空きスロット');
    if (unlocked) slot.addEventListener('click', () => { Audio_.tap(); selectedArtifactSlot = selectedArtifactSlot === i ? null : i; renderRebirth(); });
    row.appendChild(slot);
  }

  if (selectedArtifactSlot !== null && selectedArtifactSlot < slotCount) {
    const picker = document.createElement('div');
    picker.className = 'forge-card';
    const currentId = state.data.equippedArtifacts[selectedArtifactSlot];
    let rows = '';
    if (currentId) {
      const a = getArtifact(currentId);
      rows += `<div class="pick-row equipped"><div><div class="item-name">${a.name}</div><div class="item-stats">${a.desc}</div></div><button data-act="unset">外す</button></div>`;
    }
    const owned = state.data.unlockedArtifacts.filter((id) => id !== currentId);
    if (owned.length === 0 && !currentId) rows += '<p class="hint">解放済みの秘宝がありません</p>';
    for (const id of owned) {
      const a = getArtifact(id);
      rows += `<div class="pick-row" data-set="${id}"><div><div class="item-name">${a.name}</div><div class="item-stats">${a.desc}</div></div><button>セット</button></div>`;
    }
    picker.innerHTML = `<div class="forge-card-sub">スロット${selectedArtifactSlot + 1}にセットする秘宝を選択</div>${rows}`;
    const unsetBtn = picker.querySelector('[data-act="unset"]');
    if (unsetBtn) unsetBtn.addEventListener('click', () => { state.equipArtifact(selectedArtifactSlot, null); Audio_.tap(); renderRebirth(); });
    picker.querySelectorAll('[data-set]').forEach((rowEl) => {
      rowEl.querySelector('button').addEventListener('click', () => { state.equipArtifact(selectedArtifactSlot, rowEl.dataset.set); Audio_.pickup(); selectedArtifactSlot = null; renderRebirth(); });
    });
    content.appendChild(picker);
  }

  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.textContent = '秘宝の解放（覚醒ポイントを消費、永続）';
  content.appendChild(heading);
  for (const artifact of ARTIFACTS) {
    const unlocked = state.isArtifactUnlocked(artifact.id);
    const cost = state.artifactUnlockCost();
    const canUnlock = state.canUnlockArtifact(artifact.id);
    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top"><div class="forge-card-name">${artifact.name}${unlocked ? '<span class="mastered-badge">★解放済み</span>' : ''}</div></div>
      <div class="forge-card-sub">${artifact.desc}</div>
      ${unlocked ? '' : `<button class="forge-card-btn" ${canUnlock ? '' : 'disabled'}>解放する（💠${cost}）</button>`}
    `;
    const btn = card.querySelector('button');
    if (btn) btn.addEventListener('click', () => { if (state.unlockArtifact(artifact.id)) { Audio_.jobMastered(); renderRebirth(); } });
    content.appendChild(card);
  }
}
