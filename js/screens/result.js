import { getItem, RARITY } from '../data/equipment.js';

export function renderResult(result) {
  const title = document.getElementById('resultTitle');
  const stats = document.getElementById('resultStats');
  const itemsEl = document.getElementById('resultItems');

  if (result.retreated) {
    title.textContent = 'RETREAT';
    title.style.color = '#b9c0cc';
  } else if (result.cleared) {
    title.textContent = 'STAGE CLEAR';
    title.style.color = '';
  } else {
    title.textContent = 'DEFEATED...';
    title.style.color = '#e6425a';
  }

  stats.textContent = `獲得経験値: ${result.expGained} / 獲得ゴールド: ${result.goldGained}`
    + (result.cleared ? '' : '（撃破分のみ・レベルや装備は失われません）');

  itemsEl.innerHTML = '';
  if (result.items.length === 0) {
    itemsEl.innerHTML = '<span class="hint" style="opacity:.6;font-size:12px;">ドロップなし</span>';
  } else {
    for (const itemId of result.items) {
      const item = getItem(itemId);
      const chip = document.createElement('div');
      chip.className = 'result-item-chip';
      chip.style.color = RARITY[item.rarity].color;
      chip.textContent = item.name;
      itemsEl.appendChild(chip);
    }
  }
}
