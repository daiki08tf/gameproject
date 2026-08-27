/* ============================================================
   Gear Overhaul Phase 2B — inline Option Fusion UI
   ------------------------------------------------------------
   Wraps the existing Equipment screen instead of creating another route.
   Base Equipment rendering remains authoritative; a MutationObserver only
   decorates the current item rows with compact Fusion controls.
   ============================================================ */
import { state } from '../state.js';
import { getItem, powerScore } from '../data/equipment.js';
import { AFFIX_RARITY_COLOR } from '../data/affixes.js';
import { equipment3Presentation } from '../data/equipment3Presentation.js';
import { optionXpToNext } from '../data/options4Fusion.js';
import { Audio_ } from '../audio.js';
import { renderEquipment as renderBaseEquipment, autoEquipBest as autoEquipBestBase } from './equipment.js';

const SLOT_BASE_TYPE = { weapon: 'weapon', shield: 'shield', head: 'head', body: 'body', accessory1: 'accessory', accessory2: 'accessory' };
let fusionOpenItemId = null;
let fusionTargetOptionIndex = null;
let fusionMessage = '';
let observer = null;
let decorating = false;

function presentationFor(id) {
  const item = getItem(id);
  const inst = state.equipmentInstance?.(id) || null;
  return item ? equipment3Presentation(item, inst) : null;
}

function displayName(id) {
  return presentationFor(id)?.name || getItem(id)?.name || id;
}

function currentRowIds() {
  const selected = document.querySelector('#paperdoll .equip-slot.selected');
  const selectedSlot = selected?.dataset?.slot || null;
  if (!selectedSlot) return [];
  const baseType = SLOT_BASE_TYPE[selectedSlot];
  const currentId = state.data.equipped?.[selectedSlot] || null;
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
  const visible = candidates
    .filter((c) => !c.equipped)
    .filter((c) => state.passesLootFilter(c.id, getItem(c.id)));
  return [...(currentId ? [currentId] : []), ...visible.map((c) => c.id)];
}

function compactButton(label, onClick, disabled = false) {
  const btn = document.createElement('button');
  btn.className = 'inline-btn';
  btn.textContent = label;
  btn.disabled = !!disabled;
  btn.addEventListener('click', onClick);
  return btn;
}

function refreshEquipment() {
  renderBaseEquipment();
  queueMicrotask(() => decorateFusionRows());
}

function targetPanel(itemId, inst, p) {
  const panel = document.createElement('div');
  panel.className = 'option-fusion-panel';
  panel.style.cssText = 'width:100%;margin-top:8px;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;display:grid;gap:6px;';

  const head = document.createElement('div');
  head.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
  head.innerHTML = '<strong>OPTION FUSION</strong><span class="hint">同系統Optionを持つ装備を素材化</span>';
  panel.appendChild(head);

  inst.affixes.forEach((option, index) => {
    const shown = p.affixes[index];
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 0;border-top:1px solid rgba(255,255,255,.08);';
    const text = document.createElement('div');
    const needed = optionXpToNext(option.level ?? 1);
    const xpText = (option.level ?? 1) >= 100 ? 'MAX' : `EXP ${Math.max(0, option.xp || 0)}/${needed}`;
    const color = AFFIX_RARITY_COLOR[option.rarity] || 'inherit';
    text.innerHTML = `<span style="color:${color}">${shown?.greater ? '★ ' : ''}${shown?.name || option.familyId || option.id}</span> <span class="hint">${xpText}</span>`;
    const selected = fusionTargetOptionIndex === index;
    row.append(text, compactButton(selected ? '素材を選択中' : ((option.level ?? 1) >= 100 ? 'Lv100' : 'このOptionを育成'), () => {
      Audio_.tap();
      fusionTargetOptionIndex = selected ? null : index;
      fusionMessage = '';
      refreshEquipment();
    }, (option.level ?? 1) >= 100));
    panel.appendChild(row);

    if (!selected) return;
    const materials = state.optionFusionMaterials?.(itemId, index) || [];
    const materialBox = document.createElement('div');
    materialBox.style.cssText = 'display:grid;gap:5px;padding:4px 0 4px 10px;';
    if (!materials.length) {
      materialBox.innerHTML = '<div class="hint">同じOption系統を持つ、未ロック・未お気に入り・未装備の素材がありません。</div>';
    } else {
      for (const material of materials.slice(0, 8)) {
        const line = document.createElement('div');
        line.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
        const label = document.createElement('span');
        const efficiency = Math.round(material.efficiency * 100);
        label.innerHTML = `${displayName(material.materialItemId)} <span class="hint">${material.materialRarity} Lv${material.materialLevel} / +${material.xp} EXP (${efficiency}%)</span>`;
        const fuseBtn = compactButton('融合', () => {
          Audio_.tap();
          const ok = typeof globalThis.confirm !== 'function' || globalThis.confirm(`${displayName(material.materialItemId)} を素材として消費します。よろしいですか？`);
          if (!ok) return;
          const result = state.fuseEquipmentOption(itemId, index, material.materialItemId, material.materialOptionIndex);
          fusionMessage = result.ok
            ? `${shown?.name || option.familyId}：+${result.xp} EXP → Lv${result.level}`
            : `Fusionできませんでした (${result.reason || 'unknown'})`;
          refreshEquipment();
        });
        line.append(label, fuseBtn);
        materialBox.appendChild(line);
      }
      if (materials.length > 8) {
        const more = document.createElement('div');
        more.className = 'hint';
        more.textContent = `ほか ${materials.length - 8} 件（高EXP素材から表示）`;
        materialBox.appendChild(more);
      }
    }
    panel.appendChild(materialBox);
  });

  if (fusionMessage) {
    const message = document.createElement('div');
    message.className = 'hint';
    message.textContent = fusionMessage;
    panel.appendChild(message);
  }
  return panel;
}

function decorateRow(row, itemId) {
  if (!row || row.dataset.optionFusionDecorated === '1') return;
  row.dataset.optionFusionDecorated = '1';
  const inst = state.equipmentInstance?.(itemId);
  if (!inst?.affixes?.length) return;
  const p = presentationFor(itemId);
  if (!p?.affixes?.length) return;

  const actions = document.createElement('div');
  actions.className = 'equip-inline-actions option-fusion-actions';
  actions.style.width = '100%';
  const open = fusionOpenItemId === itemId;
  actions.appendChild(compactButton(open ? 'OPTION育成を閉じる' : 'OPTION育成', () => {
    Audio_.tap();
    fusionOpenItemId = open ? null : itemId;
    fusionTargetOptionIndex = null;
    fusionMessage = '';
    refreshEquipment();
  }));
  row.appendChild(actions);
  if (open) row.appendChild(targetPanel(itemId, inst, p));
}

function decorateFusionRows() {
  if (decorating) return;
  const picker = document.getElementById('equipPicker');
  if (!picker) return;
  decorating = true;
  try {
    const ids = currentRowIds();
    const rows = [...picker.querySelectorAll(':scope > .pick-row')];
    rows.forEach((row, index) => decorateRow(row, ids[index]));
  } finally {
    decorating = false;
  }
}

function ensureObserver() {
  const picker = document.getElementById('equipPicker');
  if (!picker || observer) return;
  observer = new MutationObserver(() => queueMicrotask(() => decorateFusionRows()));
  observer.observe(picker, { childList: true });
}

export function renderEquipment() {
  renderBaseEquipment();
  ensureObserver();
  decorateFusionRows();
}

export function autoEquipBest() {
  autoEquipBestBase();
  ensureObserver();
  decorateFusionRows();
}
