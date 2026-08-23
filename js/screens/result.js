import { state } from '../state.js';
import { getItem, RARITY, rarityIndex } from '../data/equipment.js';
import { getRune } from '../data/runes.js';
import { getRune2 } from '../data/runes2.js';
import { describeAffix, AFFIX_RARITY_LABEL } from '../data/affixes.js';

function resolveDrop(itemId) {
  const item = getItem(itemId);
  if (item) {
    const stars = '★'.repeat(rarityIndex(item.rarity));
    let name = `${item.unique ? '◆ UNIQUE ' : ''}${stars ? stars + ' ' : ''}${item.name}`;
    // ユニーク武器は固定性能。通常の武器個体Affix表示は行わない。
    if (!item.unique && state.isWeaponInstance(itemId)) {
      const affixes = state.weaponInstanceAffixes(itemId);
      if (affixes.length) {
        const affixText = affixes.map(a => {
          const d = describeAffix(a);
          return `[${AFFIX_RARITY_LABEL[a.rarity]}] ${d.name}: ${d.desc}`;
        }).join(' / ');
        name += `\n⚙ ${affixText}`;
      } else {
        name += '\n⚙ オプションなし';
      }
    }
    if (item.unique && item.lore) name += `\n「${item.lore}」`;
    return { name, color: RARITY[item.rarity].color };
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
  } else if (result.bountyUnique) {
    title.textContent = 'BOUNTY CLEARED — UNIQUE FOUND';
    title.style.color = '#f2c94c';
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
      chip.style.whiteSpace = 'pre-line';
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
