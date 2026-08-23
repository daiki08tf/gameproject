import { getItem, RARITY, rarityIndex } from '../data/equipment.js';
import { getRune } from '../data/runes.js';
import { getRune2 } from '../data/runes2.js';

// ドロップは装備アイテムだけでなく旧ルーンの場合もあるため、両方から解決する
function resolveDrop(itemId) {
  const item = getItem(itemId);
  if (item) {
    const stars = '★'.repeat(rarityIndex(item.rarity));
    return { name: `${stars ? stars + ' ' : ''}${item.name}`, color: RARITY[item.rarity].color };
  }
  const rune = getRune(itemId);
  if (rune) return { name: `✨ ${rune.name}`, color: 'var(--accent)' };
  return { name: itemId, color: '' };
}

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
  const normalItems = Array.isArray(result.items) ? result.items : [];
  const rune2Drops = Array.isArray(result.rune2Drops) ? result.rune2Drops : [];
  if (normalItems.length === 0 && rune2Drops.length === 0) {
    itemsEl.innerHTML = '<span class="hint" style="opacity:.6;font-size:12px;">ドロップなし</span>';
  } else {
    for (const itemId of normalItems) {
      const resolved = resolveDrop(itemId);
      const chip = document.createElement('div');
      chip.className = 'result-item-chip';
      chip.style.color = resolved.color;
      chip.textContent = resolved.name;
      itemsEl.appendChild(chip);
    }
    for (const drop of rune2Drops) {
      const rune = getRune2(drop.id);
      if (!rune) continue;
      const chip = document.createElement('div');
      chip.className = 'result-item-chip';
      chip.style.color = 'var(--accent)';
      chip.textContent = `✨ RUNE ${rune.name} +${drop.amount}刻（${drop.owned}刻）`;
      itemsEl.appendChild(chip);
    }
  }

  const equipBtn = document.getElementById('resultEquipBtn');
  equipBtn.classList.toggle('hidden', normalItems.length === 0);
}
