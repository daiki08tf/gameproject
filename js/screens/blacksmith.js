import { state } from '../state.js';
import { getItem, RARITY, WEAPON_TYPES, WEAPON_MASTERY_THRESHOLD } from '../data/equipment.js';
import { getRune, craftableRunes } from '../data/runes.js';
import { jobsByTier } from '../data/jobs.js';
import { Audio_ } from '../audio.js';

let activeTab = 'enhance';
let selectedRuneSlot = null;

export function initBlacksmithTabs() {
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Audio_.tap();
      activeTab = btn.dataset.tab;
      selectedRuneSlot = null;
      renderBlacksmith();
    });
  });
}

export function renderBlacksmith() {
  document.getElementById('manastoneText').textContent = `💎 ${state.data.manastone}`;
  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });
  const content = document.getElementById('blacksmithContent');
  content.innerHTML = '';
  if (activeTab === 'enhance') renderEnhanceTab(content);
  else if (activeTab === 'rune') renderRuneTab(content);
  else renderMasteryTab(content);
}

// ---------------------------------------------------------
// 強化タブ
// ---------------------------------------------------------
function renderEnhanceTab(content) {
  const candidates = new Set();
  if (state.data.equipped.weapon) candidates.add(state.data.equipped.weapon);
  for (const id in state.data.inventory) {
    const item = getItem(id);
    if (item && item.slot === 'weapon') candidates.add(id);
  }
  for (const id in state.data.weaponEnhance) candidates.add(id);

  if (candidates.size === 0) {
    content.innerHTML = '<p class="hint">武器を入手すると強化できるようになります</p>';
    return;
  }

  for (const id of candidates) {
    const item = getItem(id);
    if (!item) continue;
    const level = state.weaponEnhanceLevel(id);
    const spare = state.data.inventory[id] || 0;
    const cost = state.enhanceCost(level);
    const need = state.enhanceMaterialCount(level);
    const maxed = level >= 10;
    const canDo = state.canEnhanceWeapon(id);

    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name" style="color:${RARITY[item.rarity].color}">${item.name}</div>
        <div>Lv.${level}/10</div>
      </div>
      <div class="forge-card-sub">強化ボーナス +${level * 5}%　／　素材(同じ武器)所持: ${spare}個 ／ 次の強化に必要: ${maxed ? '-' : `${need}個`}</div>
      <button class="forge-card-btn" ${maxed || !canDo ? 'disabled' : ''}>
        ${maxed ? 'MAX' : `合成強化する（素材×${need} + 💰${cost}）`}
      </button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      if (state.enhanceWeapon(id)) { Audio_.pickup(); renderBlacksmith(); }
    });
    content.appendChild(card);
  }
}

// ---------------------------------------------------------
// ルーンタブ
// ---------------------------------------------------------
function renderRuneTab(content) {
  const weaponId = state.data.equipped.weapon;
  if (!weaponId) {
    content.innerHTML = '<p class="hint">武器を装備するとルーンをセットできます</p>';
    renderCraftSection(content);
    return;
  }
  const item = getItem(weaponId);
  const sockets = state.getRuneSockets(weaponId);

  const head = document.createElement('div');
  head.className = 'forge-card';
  head.innerHTML = `
    <div class="forge-card-top">
      <div class="forge-card-name" style="color:${RARITY[item.rarity].color}">${item.name}</div>
      <div>強化Lv.${state.weaponEnhanceLevel(weaponId)}</div>
    </div>
    <div class="forge-card-sub">ルーンスロット ${sockets.length}個</div>
    <div class="rune-slots" id="runeSlotsRow"></div>
  `;
  content.appendChild(head);

  const row = head.querySelector('#runeSlotsRow');
  sockets.forEach((runeId, idx) => {
    const rune = runeId ? getRune(runeId) : null;
    const slot = document.createElement('div');
    slot.className = 'rune-slot' + (rune ? ' filled' : '');
    slot.textContent = rune ? '✨' : '+';
    slot.title = rune ? rune.name : '空きスロット';
    slot.addEventListener('click', () => {
      Audio_.tap();
      selectedRuneSlot = selectedRuneSlot === idx ? null : idx;
      renderBlacksmith();
    });
    row.appendChild(slot);
  });

  if (selectedRuneSlot !== null && selectedRuneSlot < sockets.length) {
    const picker = document.createElement('div');
    picker.className = 'forge-card';
    const currentRuneId = sockets[selectedRuneSlot];
    let rows = '';
    if (currentRuneId) {
      const r = getRune(currentRuneId);
      rows += `<div class="pick-row equipped"><div><div class="item-name">${r.name}</div><div class="item-stats">${r.desc || (r.stat ? `${r.stat.toUpperCase()}+${r.value}` : '')}</div></div><button data-act="unset">外す</button></div>`;
    }
    const owned = Object.keys(state.data.inventory).filter((id) => getRune(id));
    if (owned.length === 0 && !currentRuneId) rows += '<p class="hint">所持しているルーンがありません</p>';
    for (const id of owned) {
      const r = getRune(id);
      const qty = state.data.inventory[id];
      rows += `<div class="pick-row" data-set="${id}"><div><div class="item-name">${r.name} ×${qty}</div><div class="item-stats">${r.desc || (r.stat ? `${r.stat.toUpperCase()}+${r.value}` : '')}</div></div><button>セット</button></div>`;
    }
    picker.innerHTML = `<div class="forge-card-sub">スロット${selectedRuneSlot + 1}にセットするルーンを選択</div>${rows}`;
    const unsetBtn = picker.querySelector('[data-act="unset"]');
    if (unsetBtn) unsetBtn.addEventListener('click', () => {
      state.unsocketRune(weaponId, selectedRuneSlot);
      Audio_.tap();
      renderBlacksmith();
    });
    picker.querySelectorAll('[data-set]').forEach((row2) => {
      row2.querySelector('button').addEventListener('click', () => {
        state.socketRune(weaponId, selectedRuneSlot, row2.dataset.set);
        Audio_.pickup();
        selectedRuneSlot = null;
        renderBlacksmith();
      });
    });
    content.appendChild(picker);
  }

  renderCraftSection(content);
}

function renderCraftSection(content) {
  const heading = document.createElement('div');
  heading.className = 'section-heading';
  heading.textContent = 'ルーン作成（魔石で作成）';
  content.appendChild(heading);

  for (const rune of craftableRunes()) {
    const canCraft = state.data.manastone >= rune.craftCost.manastone && state.data.gold >= rune.craftCost.gold;
    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name">${rune.name}</div>
        <div>${rune.stat.toUpperCase()}+${rune.value}</div>
      </div>
      <div class="forge-card-sub">所持: ${state.data.inventory[rune.id] || 0}個</div>
      <button class="forge-card-btn" ${canCraft ? '' : 'disabled'}>作成する（💎${rune.craftCost.manastone} + 💰${rune.craftCost.gold}）</button>
    `;
    card.querySelector('button').addEventListener('click', () => {
      if (state.craftRune(rune.id)) { Audio_.pickup(); renderBlacksmith(); }
    });
    content.appendChild(card);
  }
}

// ---------------------------------------------------------
// 武器熟練タブ
// ---------------------------------------------------------
function renderMasteryTab(content) {
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = 'その武器種を装備して敵を倒すと熟練度が貯まる。マスターすると以後どの職業でも装備できるようになる。';
  content.appendChild(hint);

  const jobsByWeapon = {};
  for (const job of jobsByTier('basic')) {
    (jobsByWeapon[job.weapon] = jobsByWeapon[job.weapon] || []).push(job.name);
  }

  for (const typeId in WEAPON_TYPES) {
    const wt = WEAPON_TYPES[typeId];
    const kills = state.weaponKillCount(typeId);
    const mastered = state.isWeaponMastered(typeId);
    const pct = Math.min(100, (kills / WEAPON_MASTERY_THRESHOLD) * 100);
    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name">${wt.name}${mastered ? '<span class="mastered-badge">★マスター済み</span>' : ''}</div>
        <div>${Math.min(kills, WEAPON_MASTERY_THRESHOLD)}/${WEAPON_MASTERY_THRESHOLD}</div>
      </div>
      <div class="forge-card-sub">得意職業: ${(jobsByWeapon[typeId] || []).join('・') || '-'}</div>
      <div class="bar xp-bar small"><div class="fill" style="width:${pct}%"></div></div>
    `;
    content.appendChild(card);
  }
}
