import { state } from '../state.js';
import { getItem, RARITY, powerScore, WEAPON_TYPES, WEAPON_MASTERY_THRESHOLD } from '../data/equipment.js';
import { WEAPON_SERIES } from '../data/weapons.js';
import { AFFIX_RARITY_COLOR } from '../data/affixes.js';
import { equipment3Presentation, equipment3MetaText, equipment3SpecialLines } from '../data/equipment3Presentation.js';
import { Audio_ } from '../audio.js';

const ELEMENT_LABEL = {
  fire: '炎', ice: '氷', lightning: '雷', wind: '風',
  light: '光', dark: '闇', poison: '毒',
};
const STAT_LABEL_JA = { atk: 'ATK', def: 'DEF', hp: 'HP', mag: 'MAG', spd: 'SPD', crit: 'CRIT', mp: 'MP', armorPen: '防御貫通', evasion: '回避' };
const SLOT_LABELS = { weapon: '武器', shield: '盾', head: '頭', body: '胴', accessory1: 'アクセ1', accessory2: 'アクセ2' };
const SLOT_BASE_TYPE = { weapon: 'weapon', shield: 'shield', head: 'head', body: 'body', accessory1: 'accessory', accessory2: 'accessory' };
const RARITY_FILTER_OPTIONS = [
  { rarity: 'normal', label: 'すべて' },
  { rarity: 'rare', label: 'レア以上' },
  { rarity: 'epic', label: 'エピック以上' },
  { rarity: 'legendary', label: 'レジェンド以上' },
  { rarity: 'mythic', label: '神話のみ' },
];
let selectedSlot = null;
let lootFilterAdvancedOpen = false;
let lootFilterMessage = '';

function presentationFor(id, item = getItem(id)) {
  const inst = state.equipmentInstance?.(id)
    || state.data.weaponInstances?.[id]
    || state.data.gearInstances?.[id]
    || null;
  return equipment3Presentation(item, inst);
}
function displayName(id, item = getItem(id)) {
  return presentationFor(id, item)?.name || item?.name || id;
}

function makeFilterField(label, control) {
  const wrap = document.createElement('label');
  wrap.style.cssText = 'display:flex;align-items:center;gap:6px;font-size:12px;';
  const text = document.createElement('span');
  text.textContent = label;
  wrap.append(text, control);
  return wrap;
}

function makeNumberInput(value, max, onChange) {
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = String(max);
  input.step = '100';
  input.value = String(value || 0);
  input.style.width = '84px';
  input.addEventListener('change', () => onChange(Math.max(0, Math.floor(Number(input.value) || 0))));
  return input;
}

function makeSelect(value, options, onChange) {
  const select = document.createElement('select');
  for (const [v, label] of options) {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = label;
    select.appendChild(opt);
  }
  select.value = String(value);
  select.addEventListener('change', () => onChange(select.value));
  return select;
}

function makeCheckbox(checked, onChange) {
  const input = document.createElement('input');
  input.type = 'checkbox';
  input.checked = !!checked;
  input.addEventListener('change', () => onChange(input.checked));
  return input;
}

function makeTextInput(value, placeholder, onChange) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value || '';
  input.placeholder = placeholder;
  input.style.width = '150px';
  input.addEventListener('change', () => onChange(input.value));
  return input;
}

function renderAdvancedLootFilter(row, filter) {
  const panel = document.createElement('div');
  panel.className = 'loot-filter-advanced';
  panel.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:100%;padding:8px 0;';

  panel.appendChild(makeFilterField('最低IP', makeNumberInput(filter.minItemPower, 10000, (value) => {
    state.updateLootFilter3({ minItemPower: value }); renderEquipment();
  })));
  panel.appendChild(makeFilterField('Greater', makeSelect(filter.minGreater, [['0', '指定なし'], ['1', '1個以上'], ['2', '2個以上'], ['3', '3個']], (value) => {
    state.updateLootFilter3({ minGreater: Number(value) }); renderEquipment();
  })));
  panel.appendChild(makeFilterField('武器種', makeSelect(filter.weaponType, [
    ['all', 'すべて'],
    ...Object.entries(WEAPON_TYPES).map(([id, def]) => [id, def.name || id]),
  ], (value) => {
    state.updateLootFilter3({ weaponType: value }); renderEquipment();
  })));
  panel.appendChild(makeFilterField('Legendaryのみ', makeCheckbox(filter.legendaryOnly, (value) => {
    state.updateLootFilter3({ legendaryOnly: value }); renderEquipment();
  })));
  panel.appendChild(makeFilterField('Curseのみ', makeCheckbox(filter.cursedOnly, (value) => {
    state.updateLootFilter3({ cursedOnly: value }); renderEquipment();
  })));
  // Phase 5D: the legacy Affix search field is retired in favor of the Phase 5A
  // Option検索 field (smartLoot4EquipmentUi.js), which now covers query + rarity
  // + Lv together. affixQuery/optionQuery normalization stays in
  // equipment3SmartLoot.js for old-save compatibility.

  const resetBtn = document.createElement('button');
  resetBtn.className = 'inline-btn';
  resetBtn.textContent = '詳細条件をリセット';
  resetBtn.addEventListener('click', () => {
    Audio_.tap();
    state.resetLootFilter3();
    lootFilterMessage = '詳細フィルターを初期化しました';
    renderEquipment();
  });
  panel.appendChild(resetBtn);

  const smart = document.createElement('div');
  smart.style.cssText = 'display:flex;flex-wrap:wrap;align-items:center;gap:8px;width:100%;padding-top:8px;border-top:1px solid rgba(255,255,255,.12);';
  const smartTitle = document.createElement('strong');
  smartTitle.textContent = 'Smart Loot 自動保護';
  smart.appendChild(smartTitle);
  smart.appendChild(makeFilterField('ON', makeCheckbox(filter.autoLock.enabled, (value) => {
    state.updateLootFilter3({ autoLock: { enabled: value } }); renderEquipment();
  })));
  smart.appendChild(makeFilterField('IP', makeNumberInput(filter.autoLock.minItemPower, 10000, (value) => {
    state.updateLootFilter3({ autoLock: { minItemPower: value } }); renderEquipment();
  })));
  // Phase 5D: Legendary / Curse / Greater / Affix moved into the Phase 5B
  // PROTECT panel (smartLoot4EquipmentUi.js decorateProtectionControls), which
  // also adds the independent Ancient Option / Option Lv80+ / Option text
  // rules. Only ON and IP remain here as plain fields.

  const applyBtn = document.createElement('button');
  applyBtn.className = 'inline-btn';
  applyBtn.textContent = '所持品へ一括適用';
  applyBtn.addEventListener('click', () => {
    Audio_.tap();
    const count = state.applySmartLootLocks();
    lootFilterMessage = count > 0 ? `${count}個をSmart Lootでロックしました` : '新たにロックする装備はありません';
    renderEquipment();
  });
  smart.appendChild(applyBtn);
  panel.appendChild(smart);

  if (lootFilterMessage) {
    const message = document.createElement('div');
    message.className = 'hint';
    message.style.width = '100%';
    message.textContent = lootFilterMessage;
    panel.appendChild(message);
  }
  row.appendChild(panel);
}

function renderLootFilterRow() {
  const row = document.getElementById('lootFilterRow');
  row.innerHTML = '';
  const filter = state.getLootFilter3();
  for (const opt of RARITY_FILTER_OPTIONS) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (filter.minRarity === opt.rarity ? ' active' : '');
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      Audio_.tap();
      state.setLootFilterMinRarity(opt.rarity);
      renderEquipment();
    });
    row.appendChild(btn);
  }

  const activeAdvanced = [
    filter.minItemPower > 0,
    filter.minGreater > 0,
    filter.legendaryOnly,
    filter.cursedOnly,
    filter.weaponType !== 'all',
    !!filter.affixQuery,
  ].filter(Boolean).length;
  const advancedBtn = document.createElement('button');
  advancedBtn.className = 'tab-btn' + (activeAdvanced ? ' active' : '');
  advancedBtn.textContent = `詳細${activeAdvanced ? ` (${activeAdvanced})` : ''}`;
  advancedBtn.addEventListener('click', () => {
    Audio_.tap();
    lootFilterAdvancedOpen = !lootFilterAdvancedOpen;
    lootFilterMessage = '';
    renderEquipment();
  });
  row.appendChild(advancedBtn);

  const smartBadge = document.createElement('span');
  smartBadge.className = 'hint';
  smartBadge.style.cssText = 'align-self:center;font-size:11px;';
  smartBadge.textContent = filter.autoLock.enabled ? 'Smart Loot ON' : 'Smart Loot OFF';
  row.appendChild(smartBadge);

  if (lootFilterAdvancedOpen) renderAdvancedLootFilter(row, filter);
}

function compareLine(candidate, current, candidateId = null, currentId = null) {
  if (!current) return '';
  const keys = new Set([...Object.keys(candidate.stats), ...Object.keys(current.stats)]);
  const parts = [];
  for (const k of keys) {
    const diff = Math.round(((candidate.stats[k] || 0) - (current.stats[k] || 0)) * 100) / 100;
    if (!diff) continue;
    parts.push(`<span class="${diff > 0 ? 'stat-up' : 'stat-down'}">${STAT_LABEL_JA[k] || k.toUpperCase()}${diff > 0 ? '↑' : '↓'}${Math.abs(diff)}</span>`);
  }
  const candidateEffects = (candidate.effects || []).map((e) => e.name);
  const currentEffects = (current.effects || []).map((e) => e.name);
  const effectDiff = [];
  for (const n of candidateEffects) if (!currentEffects.includes(n)) effectDiff.push(`<span class="stat-up">+固有:${n}</span>`);
  for (const n of currentEffects) if (!candidateEffects.includes(n)) effectDiff.push(`<span class="stat-down">-固有:${n}</span>`);
  const candidateScore = candidateId && state.equipmentPowerScore ? state.equipmentPowerScore(candidateId) : powerScore(candidate);
  const currentScore = currentId && state.equipmentPowerScore ? state.equipmentPowerScore(currentId) : powerScore(current);
  const scoreDiff = Math.round(candidateScore - currentScore);
  return (parts.length ? `<div class="compare-line">${parts.join(' ')}</div>` : '')
    + (effectDiff.length ? `<div class="compare-line">${effectDiff.join(' ')}</div>` : '')
    + (scoreDiff ? `<div class="compare-line compare-score ${scoreDiff > 0 ? 'stat-up' : 'stat-down'}">総合戦力(参考値) ${scoreDiff > 0 ? '↑' : '↓'}${Math.abs(scoreDiff)}</div>` : '');
}

function statLine(item, id) {
  const stats = Object.entries(item.stats).map(([k, v]) => `${STAT_LABEL_JA[k] || k.toUpperCase()}+${v}`).join(' ');
  const parts = [stats];
  if (item.weaponType) {
    const wt = WEAPON_TYPES[item.weaponType];
    const match = state.currentJob.weapon === item.weaponType;
    parts.push(`${wt.name}${match ? '（適性◎+8%）' : ''}`);
    const enhLv = state.weaponEnhanceLevel(id);
    if (enhLv > 0) parts.push(`強化Lv.${enhLv}（+${enhLv * 5}%）`);
  }
  if (item.requiredLevel) parts.push(`必要Lv.${item.requiredLevel}`);
  if (item.element && ELEMENT_LABEL[item.element]) parts.push(ELEMENT_LABEL[item.element]);
  if (item.implicit?.desc) parts.push(`【特性】${item.implicit.desc}`);
  if (item.series && WEAPON_SERIES[item.series]) parts.push(`《${WEAPON_SERIES[item.series].name}》`);
  if (item.effects) for (const eff of item.effects) parts.push(`◆${eff.name}: ${eff.desc}`);
  return parts.join(' / ');
}

function equipment3Block(id, item) {
  const p = presentationFor(id, item);
  if (!p || p.itemPower == null) return '';
  const meta = equipment3MetaText(p);
  const affixes = p.affixes.map((a) => {
    const color = AFFIX_RARITY_COLOR[a.rarity] || 'rgba(255,255,255,.35)';
    return `<div class="affix-line${a.greater ? ' greater' : ''}" style="border-left:3px solid ${color}">`
      + `<span class="affix-rarity" style="color:${color}">${a.greater ? '★ ' : ''}[${a.rarityLabel}]</span> `
      + `<span class="affix-name">${a.name}</span><br><span class="affix-desc">${a.desc}</span></div>`;
  }).join('');
  const specials = equipment3SpecialLines(p).map((line) => `<div class="eq3-special-line">${line}</div>`).join('');
  const smartReasons = state.smartLootReasons(id);
  const smartLine = state.isItemLocked(id) && smartReasons.length
    ? `<div class="eq3-special-line">Smart Loot: ${smartReasons.join(' / ')}</div>`
    : '';
  return `<div class="eq3-meta eq3-${p.quality}">${meta}</div>`
    + (affixes ? `<div class="affix-block">${affixes}</div>` : '')
    + specials
    + smartLine;
}

function favoriteLockBadges(itemId) {
  let s = '';
  if (state.isItemFavorite(itemId)) s += ' ★';
  if (state.isItemLocked(itemId)) s += ' [LOCK]';
  return s;
}
function appendFavLockButtons(row, itemId) {
  const wrap = document.createElement('div');
  wrap.className = 'equip-inline-actions';
  const favBtn = document.createElement('button');
  favBtn.className = 'inline-btn';
  favBtn.textContent = state.isItemFavorite(itemId) ? '★お気に入り解除' : '☆お気に入り登録';
  favBtn.addEventListener('click', () => { state.toggleItemFavorite(itemId); Audio_.tap(); renderEquipment(); });
  const lockBtn = document.createElement('button');
  lockBtn.className = 'inline-btn';
  lockBtn.textContent = state.isItemLocked(itemId) ? 'ロック解除' : 'ロックする';
  lockBtn.addEventListener('click', () => { state.toggleItemLocked(itemId); Audio_.tap(); renderEquipment(); });
  wrap.append(favBtn, lockBtn);
  row.appendChild(wrap);
}

export function renderEquipment() {
  const doll = document.getElementById('paperdoll');
  doll.innerHTML = '';
  for (const slot of Object.keys(SLOT_LABELS)) {
    const itemId = state.data.equipped[slot];
    const item = itemId ? getItem(itemId) : null;
    const p = item ? presentationFor(itemId, item) : null;
    const div = document.createElement('div');
    div.className = 'equip-slot' + (slot === selectedSlot ? ' selected' : '') + (p?.quality === 'jackpot' ? ' eq3-jackpot' : '');
    div.dataset.slot = slot;
    div.innerHTML = `<div class="slot-label">${SLOT_LABELS[slot]}</div>`
      + (item ? `<div class="slot-item" style="color:${RARITY[item.rarity].color}">${displayName(itemId, item)}</div>${p?.itemPower ? `<div class="slot-eq3-meta">IP ${p.itemPower} / T${p.tier}${p.archetype ? ` / ${p.archetype}` : ''}</div>` : ''}` : '<div class="slot-empty">未装備</div>');
    div.addEventListener('click', () => { selectedSlot = slot; Audio_.tap(); renderEquipment(); });
    doll.appendChild(div);
  }

  renderLootFilterRow();
  const picker = document.getElementById('equipPicker');
  picker.innerHTML = '';
  if (!selectedSlot) {
    picker.innerHTML = '<p class="hint">スロットをタップして装備を選択</p>';
    return;
  }

  const baseType = SLOT_BASE_TYPE[selectedSlot];
  const currentId = state.data.equipped[selectedSlot];
  const candidates = [];
  if (currentId) candidates.push({ id: currentId, equipped: true });
  for (const id in state.data.inventory) {
    const item = getItem(id);
    if (item && item.slot === baseType) candidates.push({ id, equipped: false });
  }
  candidates.sort((a, b) => {
    const score = (id) => state.equipmentPowerScore ? state.equipmentPowerScore(id) : powerScore(getItem(id));
    return score(b.id) - score(a.id);
  });
  const unequippedCandidates = candidates.filter((c) => !c.equipped);
  const visibleCandidates = unequippedCandidates.filter((c) => state.passesLootFilter(c.id, getItem(c.id)));

  if (currentId) {
    const item = getItem(currentId);
    const p = presentationFor(currentId, item);
    const row = document.createElement('div');
    row.className = `pick-row equipped${p?.quality ? ` eq3-${p.quality}` : ''}`;
    row.innerHTML = `<div class="pick-main"><div class="item-name" style="color:${RARITY[item.rarity].color}">${displayName(currentId, item)}${favoriteLockBadges(currentId)}</div>`
      + `<div class="item-stats">${statLine(item, currentId)}</div>${equipment3Block(currentId, item)}</div><button data-action="unequip">外す</button>`;
    row.querySelector('[data-action="unequip"]').addEventListener('click', () => { state.equipItem(selectedSlot, null); Audio_.tap(); renderEquipment(); });
    appendFavLockButtons(row, currentId);
    picker.appendChild(row);
  }

  const currentItemForCompare = currentId ? getItem(currentId) : null;
  for (const c of visibleCandidates) {
    const item = getItem(c.id);
    const p = presentationFor(c.id, item);
    const weaponTypeLocked = item.weaponType && !state.canUseWeaponType(item.weaponType);
    const levelLocked = item.requiredLevel && state.currentLevel < item.requiredLevel;
    const locked = weaponTypeLocked || levelLocked;
    let lockReason = '';
    if (weaponTypeLocked) lockReason = `職業「${state.currentJob.name}」では装備不可（あと${WEAPON_MASTERY_THRESHOLD - state.weaponKillCount(item.weaponType)}体撃破でマスター）`;
    else if (levelLocked) lockReason = `必要Lv.${item.requiredLevel}（現在Lv.${state.currentLevel}）`;

    const row = document.createElement('div');
    row.className = `pick-row${p?.quality ? ` eq3-${p.quality}` : ''}`;
    row.innerHTML = `<div class="pick-main"><div class="item-name" style="color:${RARITY[item.rarity].color}">${displayName(c.id, item)} ×${state.data.inventory[c.id]}${favoriteLockBadges(c.id)}</div>`
      + `<div class="item-stats">${statLine(item, c.id)}${lockReason ? `<br>${lockReason}` : ''}</div>${equipment3Block(c.id, item)}${compareLine(item, currentItemForCompare, c.id, currentId)}</div>`
      + `<button data-action="equip" ${locked ? 'disabled' : ''}>装備</button>`;
    if (!locked) row.querySelector('[data-action="equip"]').addEventListener('click', () => { state.equipItem(selectedSlot, c.id); Audio_.tap(); renderEquipment(); });
    appendFavLockButtons(row, c.id);
    picker.appendChild(row);
  }

  if (unequippedCandidates.length === 0) {
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = '装備可能なアイテムを所持していません'; picker.appendChild(p);
  } else if (visibleCandidates.length === 0) {
    const p = document.createElement('p'); p.className = 'hint'; p.textContent = 'フィルター条件に一致する装備がありません（フィルターを緩めてください）'; picker.appendChild(p);
  }
}

export function autoEquipBest() {
  state.autoEquipBest();
  Audio_.pickup();
  renderEquipment();
}