import { state } from '../state.js';
import { getItem, RARITY, rarityIndex } from '../data/equipment.js';
import { describeAffix } from '../data/affixes.js';
import { getRune } from '../data/runes.js';
import { getRune2 } from '../data/runes2.js';
import { equipment3Presentation, equipment3MetaText, equipment3SpecialLines, equipment3DropHeadline } from '../data/equipment3Presentation.js';

function resolveDrop(itemId) {
  const item = getItem(itemId);
  if (item) {
    const isWeaponInstance = state.isWeaponInstance(itemId);
    const isGearInstance = state.isGearInstance?.(itemId) || false;
    const isInstance = isWeaponInstance || isGearInstance;
    const legacyAffixes = isWeaponInstance ? state.weaponInstanceAffixes(itemId) : [];
    const inst = isInstance
      ? (state.equipmentInstance?.(itemId) || state.data.weaponInstances?.[itemId] || state.data.gearInstances?.[itemId] || null)
      : null;
    const p = equipment3Presentation(item, inst);
    if (p && isWeaponInstance && inst && p.affixes.length === 0 && legacyAffixes.length > 0) {
      // weaponInstanceAffixes + describeAffix は従来のリザルト表示契約として維持する。
      p.affixes = legacyAffixes.map((a) => {
        const d = describeAffix(a);
        return {
          id: a.id,
          name: d.name,
          desc: d.desc,
          rarity: a.rarity,
          rarityLabel: a.rarity,
          greater: !!a.greater,
          roll: a.roll,
        };
      });
    }
    const stars = '★'.repeat(rarityIndex(item.rarity));
    let name = `${item.unique ? '◆ UNIQUE ' : ''}${stars ? stars + ' ' : ''}${p?.name || item.name}`;
    const lines = [];

    const meta = equipment3MetaText(p);
    if (meta) lines.push(`⚙ ${meta}`);

    if (!item.unique && inst) {
      if (p.affixes.length) {
        for (const a of p.affixes) {
          lines.push(`${a.greater ? '★ ' : ''}[${a.rarityLabel}] ${a.name}: ${a.desc}`);
        }
      } else {
        lines.push('⚙ オプションなし');
      }
      lines.push(...equipment3SpecialLines(p));
    }

    if (item.unique && item.lore) lines.push(`「${item.lore}」`);
    if (lines.length) name += `\n${lines.join('\n')}`;
    return {
      name,
      color: RARITY[item.rarity].color,
      equipment3: p,
      headline: equipment3DropHeadline(p),
    };
  }
  const rune = getRune(itemId);
  if (rune) return { name: `✨ ${rune.name}`, color: 'var(--accent)', equipment3: null, headline: null };
  return { name: itemId, color: '', equipment3: null, headline: null };
}

function appendDropChip(itemsEl, resolved) {
  const wrap = document.createElement('div');
  wrap.className = `result-drop-wrap${resolved.equipment3 ? ` eq3-${resolved.equipment3.quality}` : ''}`;

  if (resolved.headline) {
    const headline = document.createElement('div');
    headline.className = 'result-loot-headline';
    headline.textContent = resolved.headline;
    wrap.appendChild(headline);
  }

  const chip = document.createElement('div');
  chip.className = 'result-item-chip';
  chip.style.color = resolved.color;
  chip.style.whiteSpace = 'pre-line';
  chip.textContent = resolved.name;
  wrap.appendChild(chip);
  itemsEl.appendChild(wrap);
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
  } else if (result.bountyNemesis?.grew) {
    title.textContent = `DEFEATED — ${result.bountyNemesis.title || 'NEMESIS'}`;
    title.style.color = '#e6425a';
  } else if (result.cleared) {
    title.textContent = 'STAGE CLEAR';
    title.style.color = '';
  } else {
    title.textContent = 'DEFEATED...';
    title.style.color = '#e6425a';
  }

  stats.textContent = `獲得経験値: ${result.expGained} / 獲得ゴールド: ${result.goldGained}`
    + (result.bounty2 ? ` / 賞金首の証 +${result.bounty2.marks}（所持 ${result.bounty2.totalMarks}）` : '')
    + (result.bounty2?.nemesisDefeated ? ' / 宿敵討伐ボーナス！' : '')
    + (result.bountyNemesis?.grew ? ` / 宿敵Lv.${result.bountyNemesis.level}へ成長` : '')
    + (result.cleared ? '' : '（撃破分のみ・レベルや装備は失われません）');

  itemsEl.innerHTML = '';
  const normalItems = Array.isArray(result.items) ? result.items : [];
  const rune2Drops = Array.isArray(result.rune2Drops) ? result.rune2Drops : [];

  if (normalItems.length === 0 && rune2Drops.length === 0) {
    itemsEl.innerHTML = '<span class="hint" style="opacity:.6;font-size:12px;">ドロップなし</span>';
  } else {
    for (const itemId of normalItems) appendDropChip(itemsEl, resolveDrop(itemId));
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

  attachScrollHint(stats);
}

// ドロップが多い戦闘だとリザルトのpanelがoverflow-y:autoでスクロール
// 可能になるだけで、モバイルでは常時スクロールバーが出ないため
// 気づかれず「拠点へ」等に届けないと誤解されやすい。実際にoverflowして
// いる時だけ、タイトル直下（＝スクロールしなくても必ず見える最初の画面）
// に「続きがある」ヒントを出す（レイアウト確定後に判定するためrAFで測る）。
function attachScrollHint(afterEl) {
  const panel = afterEl.closest('.panel');
  if (!panel) return;
  requestAnimationFrame(() => {
    panel.querySelector('.scroll-hint')?.remove();
    if (panel.scrollHeight > panel.clientHeight + 2) {
      const hint = document.createElement('div');
      hint.className = 'scroll-hint';
      hint.textContent = '▼ 下にスクロールできます';
      afterEl.after(hint);
    }
  });
}
