/* ============================================================
   Equipment 3.0 E6 — Blacksmith 3.0
   ------------------------------------------------------------
   Adds selective Affix crafting without replacing the existing blacksmith.
   Uses current gold / weapon essence / manastone economies.
   ============================================================ */
import { state } from '../state.js';
import { getItem, RARITY } from '../data/equipment.js';
import { AFFIXES, describeAffix, generateWeaponAffixes } from '../data/affixes.js';
import { generatedEquipmentName } from '../data/equipment3.js';
import { getLegendaryEffect, getCursedAffix, LEGENDARY_EFFECTS } from '../data/equipment3Legendary.js';
import {
  EQUIPMENT3_CRAFT_COST,
  costAffordable,
  greaterAffixCount,
  canGreaterAscendAffix,
  temperAffixValue,
  ascendAffixToGreater,
} from '../data/equipment3Crafting.js';
import { Audio_ } from '../audio.js';

function ensureCraftingState() {
  if (!state.data.equipment3Imprints || typeof state.data.equipment3Imprints !== 'object') {
    state.data.equipment3Imprints = {};
  }
}
ensureCraftingState();

function spend(cost) {
  if (!costAffordable(state.data, cost)) return false;
  state.data.gold -= cost.gold || 0;
  state.data.weaponEssence -= cost.essence || 0;
  state.data.manastone -= cost.manastone || 0;
  return true;
}

function refreshInstanceName(instanceId) {
  const inst = state.data.weaponInstances?.[instanceId];
  if (!inst) return;
  const item = getItem(inst.itemId || instanceId);
  if (!item) return;
  const generated = generatedEquipmentName(item.name, (inst.affixes || []).map(describeAffix));
  const greaterCount = greaterAffixCount(inst.affixes);
  inst.greaterAffixCount = greaterCount;
  const tags = [];
  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  if (legendary) tags.push(`《${legendary.name}》`);
  if (curse) tags.push(`【呪:${curse.name}】`);
  inst.displayName = `${greaterCount ? `${'★'.repeat(greaterCount)} ` : ''}${generated}${tags.length ? ` ${tags.join(' ')}` : ''}`;
}

function replacementCandidate(item, affixes, index) {
  const usedIds = new Set(affixes.filter((_, i) => i !== index).map((a) => a.id));
  const usedGroups = new Set(
    affixes.filter((_, i) => i !== index)
      .map((a) => AFFIXES[a.id]?.exclusiveGroup)
      .filter(Boolean),
  );
  for (let attempt = 0; attempt < 60; attempt++) {
    const rolled = generateWeaponAffixes(item, {});
    for (const candidate of rolled) {
      const def = AFFIXES[candidate.id];
      if (usedIds.has(candidate.id)) continue;
      if (def?.exclusiveGroup && usedGroups.has(def.exclusiveGroup)) continue;
      return {
        ...candidate,
        greater: false,
        greaterEvaluated: true,
        forgedReroll: true,
      };
    }
  }
  return null;
}

state.equipment3Imprints = function equipment3Imprints() {
  ensureCraftingState();
  return { ...this.data.equipment3Imprints };
};

state.equipment3RerollAffix = function equipment3RerollAffix(instanceId, index) {
  ensureCraftingState();
  const inst = this.data.weaponInstances?.[instanceId];
  if (!inst || !Array.isArray(inst.affixes) || !inst.affixes[index]) return false;
  const item = getItem(inst.itemId || instanceId);
  if (!item || !costAffordable(this.data, EQUIPMENT3_CRAFT_COST.REROLL_AFFIX)) return false;
  const candidate = replacementCandidate(item, inst.affixes, index);
  if (!candidate || !spend(EQUIPMENT3_CRAFT_COST.REROLL_AFFIX)) return false;
  inst.affixes[index] = candidate;
  refreshInstanceName(instanceId);
  this.save();
  return candidate;
};

state.equipment3TemperAffix = function equipment3TemperAffix(instanceId, index) {
  ensureCraftingState();
  const inst = this.data.weaponInstances?.[instanceId];
  if (!inst || !Array.isArray(inst.affixes) || !inst.affixes[index]) return false;
  if (!costAffordable(this.data, EQUIPMENT3_CRAFT_COST.TEMPER_VALUE)) return false;
  const tempered = temperAffixValue(inst.affixes[index]);
  if (!tempered || !spend(EQUIPMENT3_CRAFT_COST.TEMPER_VALUE)) return false;
  inst.affixes[index] = tempered;
  refreshInstanceName(instanceId);
  this.save();
  return tempered;
};

state.equipment3AscendAffix = function equipment3AscendAffix(instanceId, index) {
  ensureCraftingState();
  const inst = this.data.weaponInstances?.[instanceId];
  if (!inst || !canGreaterAscendAffix(inst.affixes, index)) return false;
  if (!costAffordable(this.data, EQUIPMENT3_CRAFT_COST.GREATER_ASCEND)) return false;
  const ascended = ascendAffixToGreater(inst.affixes[index]);
  if (!ascended || !spend(EQUIPMENT3_CRAFT_COST.GREATER_ASCEND)) return false;
  inst.affixes[index] = ascended;
  refreshInstanceName(instanceId);
  this.save();
  return ascended;
};

state.equipment3ExtractLegendary = function equipment3ExtractLegendary(instanceId) {
  ensureCraftingState();
  const inst = this.data.weaponInstances?.[instanceId];
  const effectId = inst?.legendaryEffectId;
  if (!effectId || !getLegendaryEffect(effectId)) return false;
  if (!costAffordable(this.data, EQUIPMENT3_CRAFT_COST.EXTRACT_LEGENDARY)) return false;
  if (!spend(EQUIPMENT3_CRAFT_COST.EXTRACT_LEGENDARY)) return false;
  this.data.equipment3Imprints[effectId] = (this.data.equipment3Imprints[effectId] || 0) + 1;
  inst.legendaryEffectId = null;
  inst.legendaryExtracted = true;
  refreshInstanceName(instanceId);
  this.save();
  return effectId;
};

state.equipment3ImprintLegendary = function equipment3ImprintLegendary(instanceId, effectId) {
  ensureCraftingState();
  const inst = this.data.weaponInstances?.[instanceId];
  if (!inst || !getLegendaryEffect(effectId)) return false;
  if ((this.data.equipment3Imprints[effectId] || 0) <= 0) return false;
  if (!costAffordable(this.data, EQUIPMENT3_CRAFT_COST.IMPRINT_LEGENDARY)) return false;
  if (!spend(EQUIPMENT3_CRAFT_COST.IMPRINT_LEGENDARY)) return false;
  this.data.equipment3Imprints[effectId] -= 1;
  if (this.data.equipment3Imprints[effectId] <= 0) delete this.data.equipment3Imprints[effectId];
  inst.legendaryEffectId = effectId;
  inst.legendaryImprinted = true;
  refreshInstanceName(instanceId);
  this.save();
  return effectId;
};

function fmtCost(cost) {
  const parts = [];
  if (cost.gold) parts.push(`💰${cost.gold}`);
  if (cost.essence) parts.push(`欠片×${cost.essence}`);
  if (cost.manastone) parts.push(`💎${cost.manastone}`);
  return parts.join(' + ');
}

function forgeableWeapons() {
  const ids = new Set();
  if (state.data.weaponInstances?.[state.data.equipped.weapon]) ids.add(state.data.equipped.weapon);
  for (const [id, qty] of Object.entries(state.data.inventory || {})) {
    if (qty > 0 && state.data.weaponInstances?.[id]) ids.add(id);
  }
  return [...ids];
}

function renderEquipment3Forge() {
  ensureCraftingState();
  document.querySelectorAll('#blacksmithScreen .tab-btn').forEach((b) => b.classList.toggle('active', b.dataset.tab === 'equipment3'));
  const badge = document.getElementById('manastoneText');
  if (badge) badge.textContent = `💎 ${state.data.manastone}`;
  const content = document.getElementById('blacksmithContent');
  if (!content) return;
  content.innerHTML = '';

  const intro = document.createElement('div');
  intro.className = 'forge-card';
  const imprintText = Object.entries(state.data.equipment3Imprints)
    .map(([id, qty]) => `${getLegendaryEffect(id)?.name || id}×${qty}`)
    .join(' / ') || 'なし';
  intro.innerHTML = `
    <div class="forge-card-top"><div class="forge-card-name">⚒️ 鍛冶屋3.0</div><div>IP装備専用</div></div>
    <div class="forge-card-sub">💰 ${state.data.gold} ／ 武器の欠片 ${state.data.weaponEssence || 0} ／ 💎 ${state.data.manastone}<br>
    刻印ストック：${imprintText}<br>1枠だけ厳選できるので、神個体の残り1枠を育てられます。</div>`;
  content.appendChild(intro);

  const ids = forgeableWeapons();
  if (!ids.length) {
    const hint = document.createElement('p');
    hint.className = 'hint';
    hint.textContent = 'Equipment 3.0の武器個体を入手すると鍛造できます。';
    content.appendChild(hint);
    return;
  }

  for (const id of ids) {
    const inst = state.data.weaponInstances[id];
    const item = getItem(inst.itemId || id);
    if (!item) continue;
    const card = document.createElement('div');
    card.className = 'forge-card';
    const affixRows = (inst.affixes || []).map((a, index) => {
      const d = describeAffix(a);
      const canAscend = canGreaterAscendAffix(inst.affixes, index) && costAffordable(state.data, EQUIPMENT3_CRAFT_COST.GREATER_ASCEND);
      return `<div class="pick-row">
        <div><div class="item-name">${a.greater ? '★ ' : ''}${d.name} <small>${a.rarity || ''}</small></div><div class="item-stats">${d.desc}</div></div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;justify-content:flex-end;">
          <button data-e3act="temper" data-id="${id}" data-index="${index}" ${costAffordable(state.data, EQUIPMENT3_CRAFT_COST.TEMPER_VALUE) ? '' : 'disabled'}>数値</button>
          <button data-e3act="reroll" data-id="${id}" data-index="${index}" ${costAffordable(state.data, EQUIPMENT3_CRAFT_COST.REROLL_AFFIX) ? '' : 'disabled'}>1枠再抽選</button>
          <button data-e3act="greater" data-id="${id}" data-index="${index}" ${canAscend ? '' : 'disabled'}>${a.greater ? '★済' : '★昇華'}</button>
        </div>
      </div>`;
    }).join('') || '<p class="hint">Affixなし</p>';

    const legendary = getLegendaryEffect(inst.legendaryEffectId);
    const curse = getCursedAffix(inst.curseId);
    const imprintButtons = Object.entries(state.data.equipment3Imprints)
      .filter(([, qty]) => qty > 0)
      .map(([effectId, qty]) => `<button class="forge-card-btn" data-e3act="imprint" data-id="${id}" data-effect="${effectId}" ${costAffordable(state.data, EQUIPMENT3_CRAFT_COST.IMPRINT_LEGENDARY) ? '' : 'disabled'}>《${getLegendaryEffect(effectId)?.name || effectId}》を刻印 ×${qty}（${fmtCost(EQUIPMENT3_CRAFT_COST.IMPRINT_LEGENDARY)}）</button>`)
      .join('');

    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name" style="color:${RARITY[item.rarity]?.color || 'inherit'}">${inst.displayName || item.name}</div>
        <div>IP ${inst.itemPower || '-'} / T${inst.affixTier || '-'}</div>
      </div>
      <div class="forge-card-sub">Greater ${greaterAffixCount(inst.affixes)}/3${curse ? ` ／ ${curse.name}` : ''}</div>
      ${affixRows}
      <div class="forge-card-sub" style="margin-top:8px;">数値再鍛錬：${fmtCost(EQUIPMENT3_CRAFT_COST.TEMPER_VALUE)} ／ 1枠再抽選：${fmtCost(EQUIPMENT3_CRAFT_COST.REROLL_AFFIX)} ／ ★昇華：${fmtCost(EQUIPMENT3_CRAFT_COST.GREATER_ASCEND)}</div>
      <div class="forge-card-sub" style="margin-top:10px;">Legendary Effect：${legendary ? `《${legendary.name}》 ${legendary.desc}` : 'なし'}</div>
      ${legendary ? `<button class="forge-card-btn" data-e3act="extract" data-id="${id}" ${costAffordable(state.data, EQUIPMENT3_CRAFT_COST.EXTRACT_LEGENDARY) ? '' : 'disabled'}>効果を抽出（${fmtCost(EQUIPMENT3_CRAFT_COST.EXTRACT_LEGENDARY)}）</button>` : ''}
      ${imprintButtons}
    `;
    content.appendChild(card);
  }

  content.querySelectorAll('[data-e3act]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const index = Number(btn.dataset.index);
      let result = false;
      if (btn.dataset.e3act === 'temper') result = state.equipment3TemperAffix(id, index);
      else if (btn.dataset.e3act === 'reroll') result = state.equipment3RerollAffix(id, index);
      else if (btn.dataset.e3act === 'greater') result = state.equipment3AscendAffix(id, index);
      else if (btn.dataset.e3act === 'extract') result = state.equipment3ExtractLegendary(id);
      else if (btn.dataset.e3act === 'imprint') result = state.equipment3ImprintLegendary(id, btn.dataset.effect);
      if (result) {
        Audio_.pickup();
        renderEquipment3Forge();
      }
    });
  });
}

function installEquipment3Tab() {
  const row = document.querySelector('#blacksmithScreen .tab-row');
  if (!row || row.querySelector('[data-tab="equipment3"]')) return;
  const btn = document.createElement('button');
  btn.className = 'tab-btn';
  btn.dataset.tab = 'equipment3';
  btn.textContent = '鍛造3.0';
  const dispose = row.querySelector('[data-tab="dispose"]');
  row.insertBefore(btn, dispose || null);
  // initBlacksmithTabs() is called later by main.js. Register first and stop the
  // legacy fallback listener when this special tab is selected.
  btn.addEventListener('click', (event) => {
    event.stopImmediatePropagation();
    Audio_.tap();
    renderEquipment3Forge();
  });
}

if (typeof document !== 'undefined') installEquipment3Tab();

export { renderEquipment3Forge, refreshInstanceName };
