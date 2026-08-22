import { state } from '../state.js';
import { getItem, RARITY, powerScore, WEAPON_TYPES } from '../data/equipment.js';
import { Audio_ } from '../audio.js';

const SLOT_LABELS = {
  weapon: '武器', shield: '盾', head: '頭', body: '胴',
  accessory1: 'アクセ1', accessory2: 'アクセ2',
};
const SLOT_BASE_TYPE = {
  weapon: 'weapon', shield: 'shield', head: 'head', body: 'body',
  accessory1: 'accessory', accessory2: 'accessory',
};

let selectedSlot = null;

function statLine(item) {
  const stats = Object.entries(item.stats).map(([k, v]) => `${k.toUpperCase()}+${v}`).join(' ');
  const parts = [stats];
  if (item.weaponType) {
    const wt = WEAPON_TYPES[item.weaponType];
    const match = state.currentJob.weapon === item.weaponType;
    parts.push(`${wt.name}${match ? '（適性◎+8%）' : ''}`);
  }
  if (item.effects) {
    for (const eff of item.effects) parts.push(`✨${eff.name}: ${eff.desc}`);
  }
  return parts.join(' / ');
}

export function renderEquipment() {
  const doll = document.getElementById('paperdoll');
  doll.innerHTML = '';
  for (const slot of Object.keys(SLOT_LABELS)) {
    const itemId = state.data.equipped[slot];
    const item = itemId ? getItem(itemId) : null;
    const div = document.createElement('div');
    div.className = 'equip-slot' + (slot === selectedSlot ? ' selected' : '');
    div.dataset.slot = slot;
    div.innerHTML = `
      <div class="slot-label">${SLOT_LABELS[slot]}</div>
      ${item
        ? `<div class="slot-item" style="color:${RARITY[item.rarity].color}">${item.name}</div>`
        : `<div class="slot-empty">未装備</div>`}
    `;
    div.addEventListener('click', () => {
      selectedSlot = slot;
      Audio_.tap();
      renderEquipment();
    });
    doll.appendChild(div);
  }

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
  candidates.sort((a, b) => powerScore(getItem(b.id)) - powerScore(getItem(a.id)));

  if (currentId) {
    const row = document.createElement('div');
    row.className = 'pick-row equipped';
    const item = getItem(currentId);
    row.innerHTML = `
      <div><div class="item-name" style="color:${RARITY[item.rarity].color}">${item.name}</div><div class="item-stats">${statLine(item)}</div></div>
      <button data-action="unequip">外す</button>
    `;
    row.querySelector('button').addEventListener('click', () => {
      state.equipItem(selectedSlot, null);
      Audio_.tap();
      renderEquipment();
    });
    picker.appendChild(row);
  }

  for (const c of candidates) {
    if (c.equipped) continue;
    const item = getItem(c.id);
    const row = document.createElement('div');
    row.className = 'pick-row';
    row.innerHTML = `
      <div><div class="item-name" style="color:${RARITY[item.rarity].color}">${item.name} ×${state.data.inventory[c.id]}</div><div class="item-stats">${statLine(item)}</div></div>
      <button data-action="equip">装備</button>
    `;
    row.querySelector('button').addEventListener('click', () => {
      state.equipItem(selectedSlot, c.id);
      Audio_.tap();
      renderEquipment();
    });
    picker.appendChild(row);
  }

  if (candidates.length === (currentId ? 1 : 0)) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = '装備可能なアイテムを所持していません';
    picker.appendChild(p);
  }
}

export function autoEquipBest() {
  state.autoEquipBest();
  Audio_.pickup();
  renderEquipment();
}
