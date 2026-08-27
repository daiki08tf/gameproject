/* Gear Overhaul Phase 4 — compact list + selected-item detail layer */
import { state } from '../state.js';
import { getItem, powerScore, RARITY } from '../data/equipment.js';
import { AFFIX_RARITY_COLOR } from '../data/affixes.js';
import { equipment3Presentation } from '../data/equipment3Presentation.js';
import { optionXpToNext } from '../data/options4Fusion.js';

const SLOT_BASE_TYPE = { weapon: 'weapon', shield: 'shield', head: 'head', body: 'body', accessory1: 'accessory', accessory2: 'accessory' };
const SLOT_LABEL = { weapon: '武器', shield: '盾', head: '頭', body: '胴', accessory1: 'アクセ1', accessory2: 'アクセ2', accessory: 'アクセサリ' };
const CATEGORY_LABEL = {
  OFFENSE: '火力', MAGIC: '魔法', CRIT: '会心', SPEED: '速度', DEFENSE: '耐久',
  SUSTAIN: '継戦', RESOURCE: '資源', STATUS: '状態', BOSS: '対Boss', UTILITY: '汎用', TRIGGER: '発動', BUILD: 'ビルド',
};

let selectedDetailItemId = null;
let observer = null;
let decorating = false;

function ensureStyle() {
  if (typeof document === 'undefined' || document.querySelector('link[data-equipment4]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/equipment4.css';
  link.dataset.equipment4 = '1';
  document.head.appendChild(link);
}

function selectedSlot() {
  return document.querySelector('#paperdoll .equip-slot.selected')?.dataset?.slot || null;
}

function currentRowIds() {
  const slot = selectedSlot();
  if (!slot) return [];
  const baseType = SLOT_BASE_TYPE[slot];
  const currentId = state.data.equipped?.[slot] || null;
  const candidates = [];
  if (currentId) candidates.push({ id: currentId, equipped: true });
  for (const id in state.data.inventory || {}) {
    const item = getItem(id);
    if (item && item.slot === baseType) candidates.push({ id, equipped: false });
  }
  candidates.sort((a, b) => {
    const score = (id) => state.equipmentPowerScore ? state.equipmentPowerScore(id) : powerScore(getItem(id));
    return score(b.id) - score(a.id);
  });
  const visible = candidates.filter(c => !c.equipped).filter(c => state.passesLootFilter(c.id, getItem(c.id)));
  return [...(currentId ? [currentId] : []), ...visible.map(c => c.id)];
}

function presentationFor(id) {
  const item = getItem(id);
  const inst = state.equipmentInstance?.(id) || null;
  return item ? equipment3Presentation(item, inst) : null;
}

function statText(stats = {}) {
  return Object.entries(stats).filter(([, value]) => Number(value) !== 0).map(([key, value]) => `${key.toUpperCase()} ${Number(value) >= 0 ? '+' : ''}${value}`).join(' / ') || '基礎ステータスなし';
}

function buildTags(p) {
  const seen = new Set();
  for (const option of p?.affixes || []) if (option.category) seen.add(CATEGORY_LABEL[option.category] || option.category);
  return [...seen].slice(0, 4);
}

function compareStats(item, currentItem) {
  if (!item || !currentItem) return [];
  const keys = new Set([...Object.keys(item.stats || {}), ...Object.keys(currentItem.stats || {})]);
  const out = [];
  for (const key of keys) {
    const diff = Number(item.stats?.[key] || 0) - Number(currentItem.stats?.[key] || 0);
    if (!diff) continue;
    out.push({ key: key.toUpperCase(), diff });
  }
  return out.slice(0, 6);
}

function compatibilityText(item) {
  if (!item?.weaponType) return null;
  const job = state.currentJob;
  const weapons = Array.isArray(job?.weapons) && job.weapons.length ? job.weapons : [job?.weapon].filter(Boolean);
  return weapons.includes(item.weaponType) ? '現在職との武器適性 ◎' : '現在職との武器適性 —';
}

function ensureDetailPanel() {
  const layout = document.querySelector('#equipmentScreen .equip-layout');
  if (!layout) return null;
  let panel = document.getElementById('equipmentSelectedDetail');
  if (!panel) {
    panel = document.createElement('section');
    panel.id = 'equipmentSelectedDetail';
    panel.className = 'equipment4-detail';
    layout.appendChild(panel);
  }
  return panel;
}

function rowForItem(id) {
  return [...document.querySelectorAll('#equipPicker > .pick-row')].find(row => row.dataset.equipment4ItemId === id) || null;
}

function relayDetailAction(id, selector) {
  const row = rowForItem(id);
  const source = row?.querySelector(selector);
  if (!source || source.disabled) return false;
  source.click();
  return true;
}

function wireDetailActions(panel, id, currentId) {
  if (!panel) return;
  const relay = (action, selector) => {
    const button = panel.querySelector(`[data-e4act="${action}"]`);
    if (!button) return;
    const source = rowForItem(id)?.querySelector(selector);
    button.disabled = !source || !!source.disabled;
    button.addEventListener('click', () => relayDetailAction(id, selector));
  };
  relay('equip', currentId === id ? '[data-action="unequip"]' : '[data-action="equip"]');
  relay('favorite', '.equip-inline-actions button[aria-label^="お気に入り"]');
  relay('lock', '.equip-inline-actions button[aria-label*="ロック"]');
  relay('fusion', '.option-fusion-actions button');
}

function renderDetail() {
  const panel = ensureDetailPanel();
  if (!panel) return;
  const ids = currentRowIds();
  if (!ids.length) {
    selectedDetailItemId = null;
    panel.innerHTML = '<div class="equipment4-empty">装備を選ぶと、ここに詳細が表示されます。</div>';
    return;
  }
  if (!selectedDetailItemId || !ids.includes(selectedDetailItemId)) selectedDetailItemId = ids[0];

  const id = selectedDetailItemId;
  const item = getItem(id);
  const p = presentationFor(id);
  if (!item || !p) return;

  const slot = selectedSlot();
  const currentId = slot ? state.data.equipped?.[slot] : null;
  const currentItem = currentId && currentId !== id ? getItem(currentId) : null;
  const compare = compareStats(item, currentItem);
  const tags = buildTags(p);
  const compatibility = compatibilityText(item);
  const rarityColor = RARITY[item.rarity]?.color || 'inherit';
  const favorite = !!state.isItemFavorite?.(id);
  const locked = !!state.isItemLocked?.(id);
  const sourceRow = rowForItem(id);
  const equipSource = sourceRow?.querySelector(currentId === id ? '[data-action="unequip"]' : '[data-action="equip"]');
  const fusionSource = sourceRow?.querySelector('.option-fusion-actions button');

  const fixedHtml = (p.fixedIdentities || []).map(identity => `
    <div class="equipment4-fixed equipment4-fixed-${identity.kind}">
      <div class="equipment4-fixed-label">${identity.label}</div>
      <div class="equipment4-fixed-name">${identity.name}</div>
      <div class="equipment4-fixed-desc">${identity.desc}</div>
    </div>`).join('') || '<div class="equipment4-muted">固定能力なし</div>';

  const optionHtml = (p.affixes || []).slice(0, 3).map(option => {
    const color = AFFIX_RARITY_COLOR[option.rarity] || 'inherit';
    const lv = option.level ?? 1;
    const needed = optionXpToNext(lv);
    const xp = Math.max(0, Number(option.xp) || 0);
    const progress = lv >= 100 || needed <= 0 ? 100 : Math.min(100, Math.round((xp / needed) * 100));
    return `<div class="equipment4-option" style="border-left-color:${color}">
      <div class="equipment4-option-head"><strong style="color:${color}">${option.greater ? '★ ' : ''}${option.name}</strong><span>Lv${lv}${lv >= 100 ? ' MASTER' : ''}</span></div>
      <div class="equipment4-option-desc">${option.desc}</div>
      <div class="equipment4-xp"><span style="width:${progress}%"></span></div>
      <div class="equipment4-option-exp">${lv >= 100 ? 'MASTER' : `EXP ${xp}/${needed}`}</div>
    </div>`;
  }).join('') || '<div class="equipment4-muted">ランダムOptionなし</div>';

  const compareHtml = currentId === id
    ? '<span class="equipment4-equipped">現在装備中</span>'
    : compare.length
      ? compare.map(row => `<span class="${row.diff > 0 ? 'stat-up' : 'stat-down'}">${row.key} ${row.diff > 0 ? '+' : ''}${row.diff}</span>`).join(' ')
      : '<span class="equipment4-muted">基礎値差なし</span>';

  panel.innerHTML = `
    <div class="equipment4-detail-head">
      <div><div class="equipment4-kicker">SELECTED DETAIL</div><h3 style="color:${rarityColor}">${p.name}</h3></div>
      <div class="equipment4-badges"><span>${SLOT_LABEL[slot] || SLOT_LABEL[item.slot] || item.slot}</span>${p.itemPower ? `<span>IP ${p.itemPower}</span>` : ''}${p.greaterCount ? `<span>★${p.greaterCount}</span>` : ''}</div>
    </div>
    <div class="equipment4-base">${statText(item.stats)}${item.weaponType ? ` / ${item.weaponType}` : ''}</div>
    ${compatibility ? `<div class="equipment4-compat">${compatibility}</div>` : ''}
    ${tags.length ? `<div class="equipment4-tags">${tags.map(tag => `<span>${tag}</span>`).join('')}</div>` : ''}
    <div class="equipment4-section-title">FIXED IDENTITY</div>
    <div class="equipment4-fixed-list">${fixedHtml}</div>
    <div class="equipment4-section-title">OPTION <small>${Math.min(3, p.affixes.length)}/3</small></div>
    <div class="equipment4-option-list">${optionHtml}</div>
    <div class="equipment4-section-title">現在装備との差</div>
    <div class="equipment4-compare">${compareHtml}</div>
    <div class="equipment4-detail-actions">
      <button data-e4act="equip" ${!equipSource || equipSource.disabled ? 'disabled' : ''}>${currentId === id ? '外す' : '装備'}</button>
      <button data-e4act="favorite">${favorite ? '★ KEEP' : '☆ KEEP'}</button>
      <button data-e4act="lock">${locked ? '🔓 解除' : '🔒 保護'}</button>
      <button data-e4act="fusion" ${!fusionSource ? 'disabled' : ''}>OP育成</button>
    </div>
    <div class="equipment4-action-hint">DETAILの操作は既存一覧ボタンへ中継されるため、装備可否・保護・Fusionの安全判定は従来ロジックをそのまま使います。</div>`;
  wireDetailActions(panel, id, currentId);
}

function rowSummaryHtml(id, p) {
  const parts = [];
  if (p?.itemPower) parts.push(`<span>IP${p.itemPower}</span>`);
  if (p?.affixes?.length) parts.push(`<span>OP${Math.min(3, p.affixes.length)}/3</span>`);
  if (p?.highestAffixRarity) parts.push(`<span>${String(p.highestAffixRarity).toUpperCase()}</span>`);
  if (p?.greaterCount) parts.push(`<span>★${p.greaterCount}</span>`);
  if (p?.fixedIdentities?.length) parts.push(`<span>FIXED${p.fixedIdentities.length}</span>`);
  if (state.isItemLocked?.(id)) parts.push('<span>🔒</span>');
  if (state.isItemFavorite?.(id)) parts.push('<span>★KEEP</span>');
  return parts.join('');
}

function compactRow(row, id) {
  if (!row || !id) return;
  row.classList.add('equipment4-compact-row');
  const p = presentationFor(id);
  const main = row.querySelector('.pick-main');
  const itemName = main?.querySelector('.item-name');
  if (itemName && !main.querySelector('.equipment4-row-summary')) {
    const summary = document.createElement('div');
    summary.className = 'equipment4-row-summary';
    summary.innerHTML = rowSummaryHtml(id, p);
    itemName.insertAdjacentElement('afterend', summary);
  } else if (main?.querySelector('.equipment4-row-summary')) {
    main.querySelector('.equipment4-row-summary').innerHTML = rowSummaryHtml(id, p);
  }

  const equipButton = row.querySelector('[data-action="equip"], [data-action="unequip"]');
  const disabledEquip = !!equipButton?.disabled;
  const statLine = main?.querySelector('.item-stats');
  if (statLine) statLine.classList.toggle('equipment4-keep-lock-reason', disabledEquip);

  for (const button of row.querySelectorAll('.equip-inline-actions button')) {
    if (button.textContent.includes('お気に入り')) {
      const on = state.isItemFavorite?.(id);
      button.textContent = on ? '★' : '☆';
      button.title = on ? 'お気に入り解除' : 'お気に入り登録';
      button.setAttribute('aria-label', button.title);
    } else if (button.textContent.includes('ロック')) {
      const on = state.isItemLocked?.(id);
      button.textContent = on ? '🔓' : '🔒';
      button.title = on ? 'ロック解除' : 'ロックする';
      button.setAttribute('aria-label', button.title);
    }
  }
  for (const button of row.querySelectorAll('.option-fusion-actions button')) {
    if (button.textContent === 'OPTION育成') button.textContent = 'OP育成';
    else if (button.textContent === 'OPTION育成を閉じる') button.textContent = 'OP育成を閉じる';
  }
}

function decorateRows() {
  if (decorating) return;
  const picker = document.getElementById('equipPicker');
  if (!picker) return;
  decorating = true;
  try {
    const ids = currentRowIds();
    if (ids.length && (!selectedDetailItemId || !ids.includes(selectedDetailItemId))) selectedDetailItemId = ids[0];
    const rows = [...picker.querySelectorAll(':scope > .pick-row')];
    rows.forEach((row, index) => {
      const id = ids[index];
      if (!id) return;
      row.dataset.equipment4ItemId = id;
      compactRow(row, id);
      row.classList.toggle('equipment4-selected-row', id === selectedDetailItemId);
      if (row.dataset.equipment4Bound === '1') return;
      row.dataset.equipment4Bound = '1';
      row.addEventListener('click', event => {
        if (event.target.closest('button, details, input, select, textarea, a')) return;
        selectedDetailItemId = row.dataset.equipment4ItemId;
        decorateRows();
        renderDetail();
      });
    });
    renderDetail();
  } finally {
    decorating = false;
  }
}

function installEquipment4() {
  if (typeof document === 'undefined') return;
  ensureStyle();
  const picker = document.getElementById('equipPicker');
  if (!picker) return;
  if (!observer) {
    observer = new MutationObserver(() => queueMicrotask(decorateRows));
    observer.observe(picker, { childList: true });
  }
  decorateRows();
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', installEquipment4, { once: true });
  else installEquipment4();
}

export { installEquipment4, renderDetail as renderEquipment4Detail, compactRow as compactEquipment4Row, relayDetailAction };
