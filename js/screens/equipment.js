import { state } from '../state.js';
import { getItem, RARITY, powerScore, WEAPON_TYPES, WEAPON_MASTERY_THRESHOLD } from '../data/equipment.js';
import { Audio_ } from '../audio.js';

const SLOT_LABELS = {
  weapon: '武器', shield: '盾', head: '頭', body: '胴',
  accessory1: 'アクセ1', accessory2: 'アクセ2',
};
const SLOT_BASE_TYPE = {
  weapon: 'weapon', shield: 'shield', head: 'head', body: 'body',
  accessory1: 'accessory', accessory2: 'accessory',
};

// Loot Filter：所持品一覧の表示だけを絞り込む（ドロップ抽選には影響しない）
const RARITY_FILTER_OPTIONS = [
  { rarity: 'normal', label: 'すべて' },
  { rarity: 'rare', label: 'レア以上' },
  { rarity: 'epic', label: 'エピック以上' },
  { rarity: 'legendary', label: 'レジェンド以上' },
  { rarity: 'mythic', label: '神話のみ' },
];

let selectedSlot = null;

function renderLootFilterRow() {
  const row = document.getElementById('lootFilterRow');
  row.innerHTML = '';
  for (const opt of RARITY_FILTER_OPTIONS) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (state.data.lootFilter.minRarity === opt.rarity ? ' active' : '');
    btn.textContent = opt.label;
    btn.addEventListener('click', () => {
      Audio_.tap();
      state.setLootFilterMinRarity(opt.rarity);
      renderEquipment();
    });
    row.appendChild(btn);
  }
}

// 装備比較UI（Phase 6）：候補装備を現在装備と比べたステータス差分・総合戦力差分を表示する
function compareLine(candidate, current) {
  if (!current) return ''; // 何も装備していなければ比較対象がない
  const keys = new Set([...Object.keys(candidate.stats), ...Object.keys(current.stats)]);
  const parts = [];
  for (const k of keys) {
    const diff = Math.round(((candidate.stats[k] || 0) - (current.stats[k] || 0)) * 10) / 10;
    if (diff === 0) continue;
    const cls = diff > 0 ? 'stat-up' : 'stat-down';
    parts.push(`<span class="${cls}">${k.toUpperCase()}${diff > 0 ? '↑' : '↓'}${Math.abs(diff)}</span>`);
  }
  const scoreDiff = Math.round(powerScore(candidate) - powerScore(current));
  const statsPart = parts.length ? `<div class="compare-line">${parts.join(' ')}</div>` : '';
  const scorePart = scoreDiff !== 0
    ? `<div class="compare-line compare-score ${scoreDiff > 0 ? 'stat-up' : 'stat-down'}">総合戦力 ${scoreDiff > 0 ? '↑' : '↓'}${Math.abs(scoreDiff)}</div>`
    : '';
  return statsPart + scorePart;
}

function statLine(item) {
  const stats = Object.entries(item.stats).map(([k, v]) => `${k.toUpperCase()}+${v}`).join(' ');
  const parts = [stats];
  if (item.weaponType) {
    const wt = WEAPON_TYPES[item.weaponType];
    const match = state.currentJob.weapon === item.weaponType;
    parts.push(`${wt.name}${match ? '（適性◎+8%）' : ''}`);
    const enhLv = state.weaponEnhanceLevel(item.id);
    if (enhLv > 0) parts.push(`強化Lv.${enhLv}（+${enhLv * 5}%）`);
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
  candidates.sort((a, b) => powerScore(getItem(b.id)) - powerScore(getItem(a.id)));

  const unequippedCandidates = candidates.filter((c) => !c.equipped);
  const visibleCandidates = unequippedCandidates.filter((c) => state.passesLootFilter(getItem(c.id)));

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

  const currentItemForCompare = currentId ? getItem(currentId) : null;
  for (const c of visibleCandidates) {
    const item = getItem(c.id);
    const locked = item.weaponType && !state.canUseWeaponType(item.weaponType);
    const row = document.createElement('div');
    row.className = 'pick-row';
    row.innerHTML = `
      <div><div class="item-name" style="color:${RARITY[item.rarity].color}">${item.name} ×${state.data.inventory[c.id]}</div><div class="item-stats">${statLine(item)}${locked ? `<br>🔒 職業「${state.currentJob.name}」では装備不可（あと${WEAPON_MASTERY_THRESHOLD - state.weaponKillCount(item.weaponType)}体撃破でマスター）` : ''}</div>${compareLine(item, currentItemForCompare)}</div>
      <button data-action="equip" ${locked ? 'disabled' : ''}>装備</button>
    `;
    if (!locked) {
      row.querySelector('button').addEventListener('click', () => {
        state.equipItem(selectedSlot, c.id);
        Audio_.tap();
        renderEquipment();
      });
    }
    picker.appendChild(row);
  }

  if (unequippedCandidates.length === 0) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = '装備可能なアイテムを所持していません';
    picker.appendChild(p);
  } else if (visibleCandidates.length === 0) {
    const p = document.createElement('p');
    p.className = 'hint';
    p.textContent = 'フィルター条件に一致する装備がありません（フィルターを緩めてください）';
    picker.appendChild(p);
  }
}

export function autoEquipBest() {
  state.autoEquipBest();
  Audio_.pickup();
  renderEquipment();
}
