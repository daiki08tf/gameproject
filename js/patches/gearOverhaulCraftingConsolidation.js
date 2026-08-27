/* Gear Overhaul Phase 3 — consolidate legacy crafting around Option 4.0 */
import { state } from '../state.js';
import { optionFromAffix, applyAuthoredOptionValue, canonicalOptionFamilyId } from '../data/options4.js';
import { refreshInstanceName } from './equipment3Blacksmith.js';

function instanceFor(instanceId) {
  return state.data.weaponInstances?.[instanceId] || state.data.gearInstances?.[instanceId] || null;
}

function optionAt(instanceId, index) {
  const inst = instanceFor(instanceId);
  return inst?.affixes?.[Math.floor(Number(index))] || null;
}

function isOption4(option) {
  return !!option && Number(option.optionSchemaVersion || 0) >= 1;
}

const previousTemper = state.equipment3TemperAffix?.bind(state);
if (previousTemper) {
  state.equipment3TemperAffix = function gearOverhaulTemper(instanceId, index) {
    if (isOption4(optionAt(instanceId, index))) return false;
    return previousTemper(instanceId, index);
  };
}

const previousAscend = state.equipment3AscendAffix?.bind(state);
if (previousAscend) {
  state.equipment3AscendAffix = function gearOverhaulGreaterAscend(instanceId, index) {
    if (isOption4(optionAt(instanceId, index))) return false;
    return previousAscend(instanceId, index);
  };
}

function normalizeRerolledOption(instanceId, index, rawOption) {
  const inst = instanceFor(instanceId);
  if (!inst || !rawOption?.id) return rawOption;
  const clean = { ...rawOption };
  clean.familyId = canonicalOptionFamilyId(clean.familyId || clean.id);
  clean.level = 1;
  clean.xp = 0;
  clean.greater = false;
  clean.greaterEvaluated = true;
  clean.forgedReroll = true;
  delete clean.baseRoll;
  delete clean.temperBaseRoll;
  delete clean.forgedGreater;
  const option4 = optionFromAffix(clean, { level: 1, xp: 0 });
  return applyAuthoredOptionValue(option4, {
    itemPower: inst.itemPower || 1,
    ctx: {},
    key: `${instanceId}:reroll:${index}:${option4.familyId}`,
    initializeLevel: false,
  });
}

const previousReroll = state.equipment3RerollAffix?.bind(state);
if (previousReroll) {
  state.equipment3RerollAffix = function gearOverhaulReroll(instanceId, index) {
    const result = previousReroll(instanceId, index);
    if (!result) return result;
    const inst = instanceFor(instanceId);
    const option = optionAt(instanceId, index);
    if (!inst || !option) return result;
    const normalized = normalizeRerolledOption(instanceId, index, option);
    inst.affixes[Math.floor(Number(index))] = normalized;
    if (this.data.weaponInstances?.[instanceId]) refreshInstanceName(instanceId);
    this.save();
    return normalized;
  };
}

function decorateCraftingButtons() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('blacksmithContent');
  if (!root) return;
  for (const button of root.querySelectorAll('[data-e3act="temper"], [data-e3act="greater"]')) {
    const option = optionAt(button.dataset.id, button.dataset.index);
    if (!isOption4(option)) continue;
    button.disabled = true;
    if (button.dataset.e3act === 'temper') {
      button.textContent = '値＝Option Lv';
      button.title = 'Option 4.0では数値はレアリティとOption Lvから決まります';
    } else {
      button.textContent = option.greater ? '★Greater' : '★ドロップ限定';
      button.title = 'Option 4.0のGreaterはドロップ限定です';
    }
  }
  for (const button of root.querySelectorAll('[data-e3act="reroll"]')) {
    const option = optionAt(button.dataset.id, button.dataset.index);
    if (!option) continue;
    button.textContent = 'Option再抽選';
    button.title = 'Option系統を入れ替えます。新しいOptionはLv1・EXP0から育成します';
  }
}

if (typeof document !== 'undefined') {
  const install = () => {
    const root = document.getElementById('blacksmithContent');
    if (!root) return;
    const observer = new MutationObserver(() => queueMicrotask(decorateCraftingButtons));
    observer.observe(root, { childList: true, subtree: true });
    decorateCraftingButtons();
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', install, { once: true });
  else install();
}

export { isOption4 as isOption4CraftingOption, normalizeRerolledOption, decorateCraftingButtons };
