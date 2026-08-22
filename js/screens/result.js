import { getItem, RARITY, rarityIndex } from '../data/equipment.js';
import { getRune } from '../data/runes.js';

// ドロップは装備アイテムだけでなくルーンの場合もあるため、両方から解決する
// レアリティが高いほど★の数を増やし、一目で価値が分かるようにする（Phase 6）
function resolveDrop(itemId) {
  const item = getItem(itemId);
  if (item) {
    const stars = '★'.repeat(rarityIndex(item.rarity));
    return { name: `${stars ? stars + ' ' : ''}${item.name}`, color: RARITY[item.rarity].color };
  }
  const rune = getRune(itemId);
  if (rune) return { name: `✨ ${rune.name}`, color: 'var(--accent)' };
  // 未知のIDでも画面遷移自体は止めない
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
  if (result.items.length === 0) {
    itemsEl.innerHTML = '<span class="hint" style="opacity:.6;font-size:12px;">ドロップなし</span>';
  } else {
    for (const itemId of result.items) {
      const resolved = resolveDrop(itemId);
      const chip = document.createElement('div');
      chip.className = 'result-item-chip';
      chip.style.color = resolved.color;
      chip.textContent = resolved.name;
      itemsEl.appendChild(chip);
    }
  }

  // ドロップがあった時だけ「装備を見る」導線を出す（何もない時は無意味なので隠す）
  const equipBtn = document.getElementById('resultEquipBtn');
  equipBtn.classList.toggle('hidden', result.items.length === 0);
}
