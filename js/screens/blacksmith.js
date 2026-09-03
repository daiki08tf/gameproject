import { state } from '../state.js';
import { getItem, RARITY, WEAPON_TYPES, WEAPON_MASTERY_THRESHOLD } from '../data/equipment.js';
import { getRune, craftableRunes } from '../data/runes.js';
import { jobsByTier } from '../data/jobs.js';
import { Audio_ } from '../audio.js';
import { EQUIPMENT_LAYER, AWAKENED_EQUIP_LAYER, EXTREME_AFFIX_LAYER, AWAKENED_ITEM_LAYER, WEAPON_CODEX_LAYER } from '../data/balance.js';

const AFFIX_STAT_LABEL = { atk: 'ATK', def: 'DEF', hp: 'HP', mag: 'MAG', spd: 'SPD', crit: 'CRIT' };

let activeTab = 'enhance';
let selectedRuneSlot = null;

export function initBlacksmithTabs() {
  document.querySelectorAll('#blacksmithScreen .tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Audio_.tap();
      activeTab = btn.dataset.tab;
      selectedRuneSlot = null;
      renderBlacksmith();
    });
  });
}

export function renderBlacksmith() {
  document.getElementById('manastoneText').textContent = `魔石 ${state.data.manastone}`;
  document.querySelectorAll('#blacksmithScreen .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === activeTab);
  });
  const content = document.getElementById('blacksmithContent');
  content.innerHTML = '';
  if (activeTab === 'enhance') renderEnhanceTab(content);
  else if (activeTab === 'rune') renderRuneTab(content);
  else if (activeTab === 'awakenitem') renderAwakenedItemTab(content);
  else if (activeTab === 'dispose') renderDisposeTab(content);
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
    const maxLevel = EQUIPMENT_LAYER.ENHANCE_MAX_LEVEL;
    const maxed = level >= maxLevel;
    const canDo = state.canEnhanceWeapon(id);
    // Blade Vale 2.1：同じ武器の複数所持の代わりに「武器の欠片」（分解で得る汎用素材）でも強化できる
    const essenceNeed = state.essenceCostForEnhance(level);
    const canDoEssence = state.canEnhanceWeapon(id, true);

    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name" style="color:${RARITY[item.rarity].color}">${item.name}</div>
        <div>Lv.${level}/${maxLevel}</div>
      </div>
      <div class="forge-card-sub">強化ボーナス +${level * 5}%　／　素材(同じ武器)所持: ${spare}個 ／ 次の強化に必要: ${maxed ? '-' : `${need}個`}
        ／ 武器の欠片所持: ${state.data.weaponEssence}個 ／ 欠片で必要: ${maxed ? '-' : `${essenceNeed}個`}</div>
      <button class="forge-card-btn" data-mode="copy" ${maxed || !canDo ? 'disabled' : ''}>
        ${maxed ? 'MAX' : `合成強化する（素材×${need} + 💰${cost}）`}
      </button>
      ${maxed ? '' : `<button class="forge-card-btn" data-mode="essence" ${canDoEssence ? '' : 'disabled'} style="margin-top:6px;">武器の欠片で強化する（欠片×${essenceNeed} + 💰${cost}）</button>`}
    `;
    card.querySelector('[data-mode="copy"]').addEventListener('click', () => {
      if (state.enhanceWeapon(id)) { Audio_.pickup(); renderBlacksmith(); }
    });
    const essenceBtn = card.querySelector('[data-mode="essence"]');
    if (essenceBtn) essenceBtn.addEventListener('click', () => {
      if (state.enhanceWeapon(id, true)) { Audio_.pickup(); renderBlacksmith(); }
    });
    content.appendChild(card);

    // 強化MAX後は、覚醒ポイントで「目覚めた装備」化できる（Phase 3）
    if (maxed) content.appendChild(renderAwakenWeaponCard(id, item));

    // 強化＋目覚めの両方がMAXなら、最後の仕上げとして極Affixに挑める（Phase 5）
    if (maxed && state.weaponAwakenedRank(id) >= EXTREME_AFFIX_LAYER.REQUIRE_AWAKENED_RANK) {
      content.appendChild(renderAffixCard(id, item));
    }
  }
}

// 強化MAXの武器を「目覚めた装備」化するカード（Phase 3、覚醒ポイント消費）
function renderAwakenWeaponCard(id, item) {
  const rank = state.weaponAwakenedRank(id);
  const maxed = rank >= AWAKENED_EQUIP_LAYER.MAX_RANK;
  const cost = state.awakenWeaponCost(rank);
  const canDo = state.canAwakenWeapon(id);
  const needAwakening = state.data.awakenings < AWAKENED_EQUIP_LAYER.REQUIRE_AWAKENINGS;

  const card = document.createElement('div');
  card.className = 'forge-card';
  card.innerHTML = `
    <div class="forge-card-top">
      <div class="forge-card-name">${item.name}（目覚め）</div>
      <div>Lv.${rank}/${AWAKENED_EQUIP_LAYER.MAX_RANK}</div>
    </div>
    <div class="forge-card-sub">目覚めボーナス +${Math.round(rank * AWAKENED_EQUIP_LAYER.BONUS_PER_RANK * 100)}%（強化ボーナスとは別枠で加算）
      ${needAwakening ? '<br>※覚醒の祭壇で1回以上「覚醒」すると目覚めさせられるようになります' : ''}</div>
    <button class="forge-card-btn" ${maxed || !canDo ? 'disabled' : ''}>
      ${maxed ? 'MAX' : `目覚めさせる（💎${cost}）`}
    </button>
  `;
  card.querySelector('button').addEventListener('click', () => {
    if (state.awakenWeapon(id)) { Audio_.jobMastered(); renderBlacksmith(); }
  });
  return card;
}

// 強化＋目覚め両方MAXの武器だけが挑める最後の仕上げ：極Affix（Phase 5）
// ランダムに1ステータスへ追加%ボーナスを付与する。何度でも再抽選できる。
function renderAffixCard(id, item) {
  const affix = state.weaponAffix(id);
  const canDo = state.canRollAffix(id);
  const card = document.createElement('div');
  card.className = 'forge-card';
  card.innerHTML = `
    <div class="forge-card-top">
      <div class="forge-card-name">${item.name}（極Affix）</div>
    </div>
    <div class="forge-card-sub">${affix
      ? `現在の付与効果：${AFFIX_STAT_LABEL[affix.stat] || affix.stat}+${Math.round(affix.pct * 1000) / 10}%（再抽選すると上書きされます）`
      : 'まだ極Affixは付与されていません'}</div>
    <button class="forge-card-btn" ${canDo ? '' : 'disabled'}>
      ${affix ? '再抽選する' : '極める'}（💰${EXTREME_AFFIX_LAYER.ROLL_COST_GOLD} + 💎${EXTREME_AFFIX_LAYER.ROLL_COST_MANASTONE}）
    </button>
  `;
  card.querySelector('button').addEventListener('click', () => {
    if (state.rollAffix(id)) { Audio_.jobMastered(); renderBlacksmith(); }
  });
  return card;
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

// ---------------------------------------------------------
// 覚醒装備タブ（本来仕様：固有効果を持つ特殊装備限定、キル数で成長）
// ---------------------------------------------------------
function renderAwakenedItemTab(content) {
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = `固有能力を持つ特殊な装備だけが対象。装備して敵を倒すと育つ（キル数 ${AWAKENED_ITEM_LAYER.KILLS_TIER1}で極Affix枠+1、${AWAKENED_ITEM_LAYER.KILLS_TIER2}で固有能力が強化される）。`;
  content.appendChild(hint);

  const candidates = new Set();
  for (const slot in state.data.equipped) {
    const id = state.data.equipped[slot];
    if (id && state.isAwakenedItemEligible(id)) candidates.add(id);
  }
  for (const id in state.data.inventory) {
    if (state.isAwakenedItemEligible(id)) candidates.add(id);
  }
  for (const id in state.data.itemAwakenKills) {
    if (state.isAwakenedItemEligible(id)) candidates.add(id);
  }

  if (candidates.size === 0) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = '対象となる固有装備をまだ所持していません';
    content.appendChild(p);
    return;
  }

  for (const id of candidates) {
    content.appendChild(renderAwakenedItemCard(id));
  }
}

function renderAwakenedItemCard(id) {
  const item = getItem(id);
  const kills = state.itemAwakenKillCount(id);
  const tier = state.itemAwakenTier(id);
  const pct = Math.min(100, (kills / AWAKENED_ITEM_LAYER.KILLS_TIER2) * 100);
  const equipped = Object.values(state.data.equipped).includes(id);

  const card = document.createElement('div');
  card.className = 'forge-card';
  card.innerHTML = `
    <div class="forge-card-top">
      <div class="forge-card-name" style="color:${RARITY[item.rarity].color}">${item.name}${tier >= 2 ? '<span class="mastered-badge">★固有能力強化済み</span>' : ''}</div>
      <div>${kills}/${AWAKENED_ITEM_LAYER.KILLS_TIER2}</div>
    </div>
    <div class="forge-card-sub">
      ${(item.effects || []).map((e) => `✨${e.name}: ${e.desc}`).join('<br>')}
      ${!equipped ? '<br>※装備していないと覚醒キルは増えません' : ''}
    </div>
    <div class="bar xp-bar small"><div class="fill" style="width:${pct}%"></div></div>
  `;
  appendAffix2Section(card, id, tier);
  return card;
}

// 第2の極Affix枠（tier1到達で解放）の抽選UI
function appendAffix2Section(card, id, tier) {
  const wrap = document.createElement('div');
  wrap.style.marginTop = '8px';
  if (tier < 1) {
    wrap.innerHTML = `<div class="forge-card-sub">あと${Math.max(0, AWAKENED_ITEM_LAYER.KILLS_TIER1 - state.itemAwakenKillCount(id))}キルで第2の極Affix枠が解放されます</div>`;
    card.appendChild(wrap);
    return;
  }
  const affix2 = state.weaponAffix2(id);
  const canDo = state.canRollAffix2(id);
  wrap.innerHTML = `
    <div class="forge-card-sub">${affix2
      ? `第2Affix：${AFFIX_STAT_LABEL[affix2.stat] || affix2.stat}+${Math.round(affix2.pct * 1000) / 10}%（再抽選すると上書きされます）`
      : '第2の極Affix枠が解放されています（まだ付与されていません）'}</div>
    <button class="forge-card-btn" ${canDo ? '' : 'disabled'}>
      ${affix2 ? '再抽選する' : '極める'}（💰${EXTREME_AFFIX_LAYER.ROLL_COST_GOLD} + 💎${EXTREME_AFFIX_LAYER.ROLL_COST_MANASTONE}）
    </button>
  `;
  wrap.querySelector('button').addEventListener('click', () => {
    if (state.rollAffix2(id)) { Audio_.jobMastered(); renderBlacksmith(); }
  });
  card.appendChild(wrap);
}

// ---------------------------------------------------------
// 整理タブ（Blade Vale 2.1：大量に拾う武器の売却・分解、元指示26・27番）
// ロック中の装備は対象外（誤操作防止）。分解すると「武器の欠片」（強化タブ
// で同名武器の代わりに使える汎用素材）が手に入る。
// ---------------------------------------------------------
function renderDisposeTab(content) {
  const hint = document.createElement('p');
  hint.className = 'hint';
  hint.textContent = `売却でゴールド、分解で「武器の欠片」（強化タブで同じ武器の代わりに使える汎用素材、所持: ${state.data.weaponEssence}個）を得る。ロック中の装備は対象外。`;
  content.appendChild(hint);

  const ids = Object.keys(state.data.inventory).filter((id) => (state.data.inventory[id] || 0) > 0);
  if (ids.length === 0) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = '所持品がありません';
    content.appendChild(p);
    return;
  }

  ids.sort((a, b) => (getItem(b) ? getItem(b).rarity : '').localeCompare(getItem(a) ? getItem(a).rarity : ''));
  for (const id of ids) {
    const item = getItem(id);
    if (!item) continue;
    const qty = state.data.inventory[id];
    const locked = state.isItemLocked(id);
    const sellGold = WEAPON_CODEX_LAYER.SELL_GOLD[item.rarity] || 0;
    const dismantleEssence = WEAPON_CODEX_LAYER.DISMANTLE_ESSENCE[item.rarity] || 0;
    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name" style="color:${RARITY[item.rarity].color}">${item.name} ×${qty}${state.isItemFavorite(id) ? ' ★' : ''}${locked ? ' 🔒' : ''}</div>
        <div>${RARITY[item.rarity].label}</div>
      </div>
      <div class="forge-card-sub">売却: 💰${sellGold}/個　／　分解: 🔹${dismantleEssence}欠片/個${locked ? '<br>※ロック中は売却・分解できません' : ''}</div>
    `;
    const btnRow = document.createElement('div');
    btnRow.style.display = 'flex';
    btnRow.style.gap = '6px';
    btnRow.style.marginTop = '6px';
    const sellBtn = document.createElement('button');
    sellBtn.className = 'forge-card-btn';
    sellBtn.textContent = '売却(1個)';
    sellBtn.disabled = locked;
    sellBtn.addEventListener('click', () => { if (state.sellItem(id, 1)) { Audio_.pickup(); renderBlacksmith(); } });
    const dismantleBtn = document.createElement('button');
    dismantleBtn.className = 'forge-card-btn';
    dismantleBtn.textContent = '分解(1個)';
    dismantleBtn.disabled = locked;
    dismantleBtn.addEventListener('click', () => { if (state.dismantleItem(id, 1)) { Audio_.pickup(); renderBlacksmith(); } });
    const lockBtn = document.createElement('button');
    lockBtn.className = 'inline-btn';
    lockBtn.textContent = locked ? '🔓ロック解除' : '🔒ロックする';
    lockBtn.addEventListener('click', () => { state.toggleItemLocked(id); Audio_.tap(); renderBlacksmith(); });
    btnRow.appendChild(sellBtn);
    btnRow.appendChild(dismantleBtn);
    btnRow.appendChild(lockBtn);
    card.appendChild(btnRow);
    content.appendChild(card);
  }
}
