/* Gear Overhaul Phase 3A — consolidate legacy crafting around Option 4.0 */
import { state } from '../state.js';

function optionAt(instanceId, index) {
  const inst = state.data.weaponInstances?.[instanceId] || state.data.gearInstances?.[instanceId];
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

const previousReroll = state.equipment3RerollAffix?.bind(state);
if (previousReroll) {
  state.equipment3RerollAffix = function gearOverhaulReroll(instanceId, index) {
    const result = previousReroll(instanceId, index);
    if (!result) return result;
    const option = optionAt(instanceId, index);
    if (!isOption4(option)) return result;
    option.level = 1;
    option.xp = 0;
    option.greater = false;
    option.greaterEvaluated = true;
    delete option.baseRoll;
    delete option.temperBaseRoll;
    delete option.forgedGreater;
    this.save();
    return option;
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

export { isOption4 as isOption4CraftingOption, decorateCraftingButtons };
