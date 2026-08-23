import { state } from '../state.js';
import { getItem, RARITY, powerScore, WEAPON_TYPES, WEAPON_MASTERY_THRESHOLD } from '../data/equipment.js';
import { WEAPON_SERIES } from '../data/weapons.js';
import { describeAffix, AFFIX_RARITY_COLOR, AFFIX_RARITY_LABEL } from '../data/affixes.js';
import { Audio_ } from '../audio.js';

const ELEMENT_LABEL = {
  fire: '🔥炎', ice: '❄️氷', lightning: '⚡雷', wind: '🌪️風',
  light: '✨光', dark: '🌑闇', poison: '☠️毒',
};
const STAT_LABEL_JA = { atk: 'ATK', def: 'DEF', hp: 'HP', mag: 'MAG', spd: 'SPD', crit: 'CRIT', mp: 'MP', armorPen: '防御貫通', evasion: '回避' };

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

// 装備比較UI（Phase 6→Blade Vale 2.1で拡張）：候補装備を現在装備と比べた
// ステータス差分・総合戦力差分を表示する。総合戦力はあくまで「参考値」
// （元指示29番）：ビルドシナジー・セット効果・固有能力の強さまでは
// 反映できないため、スコアだけで強さを断定しないよう明記する。
function compareLine(candidate, current) {
  if (!current) return ''; // 何も装備していなければ比較対象がない
  const keys = new Set([...Object.keys(candidate.stats), ...Object.keys(current.stats)]);
  const parts = [];
  for (const k of keys) {
    const diff = Math.round(((candidate.stats[k] || 0) - (current.stats[k] || 0)) * 100) / 100;
    if (diff === 0) continue;
    const cls = diff > 0 ? 'stat-up' : 'stat-down';
    parts.push(`<span class="${cls}">${STAT_LABEL_JA[k] || k.toUpperCase()}${diff > 0 ? '↑' : '↓'}${Math.abs(diff)}</span>`);
  }
  const candidateEffects = (candidate.effects || []).map((e) => e.name);
  const currentEffects = (current.effects || []).map((e) => e.name);
  const effectDiff = [];
  for (const n of candidateEffects) if (!currentEffects.includes(n)) effectDiff.push(`<span class="stat-up">+固有:${n}</span>`);
  for (const n of currentEffects) if (!candidateEffects.includes(n)) effectDiff.push(`<span class="stat-down">-固有:${n}</span>`);
  const scoreDiff = Math.round(powerScore(candidate) - powerScore(current));
  const statsPart = parts.length ? `<div class="compare-line">${parts.join(' ')}</div>` : '';
  const effectPart = effectDiff.length ? `<div class="compare-line">${effectDiff.join(' ')}</div>` : '';
  const scorePart = scoreDiff !== 0
    ? `<div class="compare-line compare-score ${scoreDiff > 0 ? 'stat-up' : 'stat-down'}">総合戦力(参考値) ${scoreDiff > 0 ? '↑' : '↓'}${Math.abs(scoreDiff)}</div>`
    : '';
  return statsPart + effectPart + scorePart;
}

// id：インベントリ/装備スロットに実際に入っているキー（武器はPart A
// （Affix）導入によりドロップごとに一意なインスタンスIDになっているため、
// 強化Lv等の進行度は必ずitem.id（静的定義側の常にbase id）ではなく、この
// idをそのまま使う。item自体はgetItem(id)で解決済みの静的定義を渡す。
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
  // Blade Vale 2.1：武器図鑑武器の追加情報（必要Lv・属性・ベース特性・シリーズ）
  if (item.requiredLevel) parts.push(`必要Lv.${item.requiredLevel}`);
  if (item.element && ELEMENT_LABEL[item.element]) parts.push(ELEMENT_LABEL[item.element]);
  if (item.implicit && item.implicit.desc) parts.push(`【特性】${item.implicit.desc}`);
  if (item.series && WEAPON_SERIES[item.series]) parts.push(`《${WEAPON_SERIES[item.series].name}》`);
  if (item.effects) {
    for (const eff of item.effects) parts.push(`✨${eff.name}: ${eff.desc}`);
  }
  return parts.join(' / ');
}

// 武器ランダムAffix（Part A）の表示。武器スロット以外・Affixを持たない
// インスタンスでは空文字を返す（既存rarity CSS変数をそのまま再利用）。
function affixBlock(id) {
  if (!state.isWeaponInstance(id)) return '';
  const affixes = state.weaponInstanceAffixes(id);
  if (affixes.length === 0) return '';
  const lines = affixes.map((a) => {
    const d = describeAffix(a);
    return `<div class="affix-line" style="border-left:3px solid ${AFFIX_RARITY_COLOR[a.rarity]}">`
      + `<span class="affix-rarity" style="color:${AFFIX_RARITY_COLOR[a.rarity]}">[${AFFIX_RARITY_LABEL[a.rarity]}]</span> `
      + `<span class="affix-name">${d.name}</span><br><span class="affix-desc">${d.desc}</span></div>`;
  }).join('');
  return `<div class="affix-block">${lines}</div>`;
}

// お気に入り・ロック（元指示27番）：一覧上の名前の右にバッジとして表示し、
// カード内にトグルボタンを追加する。ロック中は鍛冶屋の売却・分解対象から外れる。
function favoriteLockBadges(itemId) {
  let s = '';
  if (state.isItemFavorite(itemId)) s += ' ★';
  if (state.isItemLocked(itemId)) s += ' 🔒';
  return s;
}

function appendFavLockButtons(row, itemId) {
  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '6px';
  wrap.style.marginTop = '4px';
  const favBtn = document.createElement('button');
  favBtn.className = 'inline-btn';
  favBtn.textContent = state.isItemFavorite(itemId) ? '★お気に入り解除' : '☆お気に入り登録';
  favBtn.addEventListener('click', () => { state.toggleItemFavorite(itemId); Audio_.tap(); renderEquipment(); });
  const lockBtn = document.createElement('button');
  lockBtn.className = 'inline-btn';
  lockBtn.textContent = state.isItemLocked(itemId) ? '🔓ロック解除' : '🔒ロックする';
  lockBtn.addEventListener('click', () => { state.toggleItemLocked(itemId); Audio_.tap(); renderEquipment(); });
  wrap.appendChild(favBtn);
  wrap.appendChild(lockBtn);
  row.appendChild(wrap);
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
      <div><div class="item-name" style="color:${RARITY[item.rarity].color}">${item.name}${favoriteLockBadges(currentId)}</div><div class="item-stats">${statLine(item, currentId)}</div>${affixBlock(currentId)}</div>
      <button data-action="unequip">外す</button>
    `;
    row.querySelector('button').addEventListener('click', () => {
      state.equipItem(selectedSlot, null);
      Audio_.tap();
      renderEquipment();
    });
    appendFavLockButtons(row, currentId);
    picker.appendChild(row);
  }

  const currentItemForCompare = currentId ? getItem(currentId) : null;
  for (const c of visibleCandidates) {
    const item = getItem(c.id);
    const weaponTypeLocked = item.weaponType && !state.canUseWeaponType(item.weaponType);
    const levelLocked = item.requiredLevel && state.currentLevel < item.requiredLevel;
    const locked = weaponTypeLocked || levelLocked;
    let lockReason = '';
    if (weaponTypeLocked) lockReason = `🔒 職業「${state.currentJob.name}」では装備不可（あと${WEAPON_MASTERY_THRESHOLD - state.weaponKillCount(item.weaponType)}体撃破でマスター）`;
    else if (levelLocked) lockReason = `🔒 必要Lv.${item.requiredLevel}（現在Lv.${state.currentLevel}）`;
    const row = document.createElement('div');
    row.className = 'pick-row';
    row.innerHTML = `
      <div><div class="item-name" style="color:${RARITY[item.rarity].color}">${item.name} ×${state.data.inventory[c.id]}${favoriteLockBadges(c.id)}</div><div class="item-stats">${statLine(item, c.id)}${lockReason ? `<br>${lockReason}` : ''}</div>${affixBlock(c.id)}${compareLine(item, currentItemForCompare)}</div>
      <button data-action="equip" ${locked ? 'disabled' : ''}>装備</button>
    `;
    if (!locked) {
      row.querySelector('button').addEventListener('click', () => {
        state.equipItem(selectedSlot, c.id);
        Audio_.tap();
        renderEquipment();
      });
    }
    appendFavLockButtons(row, c.id);
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
