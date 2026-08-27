/* Gear Overhaul Phase 5A — Option-aware Equipment filter controls */
import { state } from '../state.js';
import { OPTION_RARITY } from '../data/options4.js';

const RARITY_LABEL = {
  common: 'Common', uncommon: 'Uncommon', rare: 'Rare', epic: 'Epic',
  legendary: 'Legendary', mythic: 'Mythic', ancient: 'Ancient',
};

function ensureStyle() {
  if (typeof document === 'undefined' || document.getElementById('smartLoot4Style')) return;
  const style = document.createElement('style');
  style.id = 'smartLoot4Style';
  style.textContent = `
    #equipmentScreen .smartloot4-option-filters{display:grid;grid-template-columns:auto repeat(3,minmax(0,1fr));align-items:end;gap:6px;width:100%;padding:7px 8px;border:1px solid rgba(242,201,76,.18);border-radius:8px;background:rgba(242,201,76,.045)}
    #equipmentScreen .smartloot4-title{font-size:9px;letter-spacing:1px;color:var(--accent);align-self:center;white-space:nowrap}
    #equipmentScreen .smartloot4-field{display:grid!important;gap:3px!important;min-width:0;font-size:9px!important}
    #equipmentScreen .smartloot4-field>span{opacity:.62;white-space:nowrap}
    #equipmentScreen .smartloot4-field input,#equipmentScreen .smartloot4-field select{width:100%!important;max-width:none!important;min-width:0;padding:5px 6px;font-size:10px!important;background:rgba(0,0,0,.25);color:inherit;border:1px solid rgba(255,255,255,.12);border-radius:5px}
    #equipmentScreen .smartloot4-hint{grid-column:2/-1;font-size:8px!important;line-height:1.35}
    @media(max-width:560px){#equipmentScreen .smartloot4-option-filters{grid-template-columns:1fr 1fr}#equipmentScreen .smartloot4-title{grid-column:1/-1}#equipmentScreen .smartloot4-field:first-of-type{grid-column:1/-1}#equipmentScreen .smartloot4-hint{grid-column:1/-1}}
  `;
  document.head.appendChild(style);
}

function field(label, control) {
  const wrap = document.createElement('label');
  wrap.className = 'smartloot4-field';
  const text = document.createElement('span');
  text.textContent = label;
  wrap.append(text, control);
  return wrap;
}

function optionQueryInput(value, rerender) {
  const input = document.createElement('input');
  input.type = 'text';
  input.value = value || '';
  input.placeholder = '例：天威 / atk_pct / Boss';
  input.className = 'smartloot4-query';
  input.addEventListener('change', () => {
    state.updateLootFilter3({ optionQuery: input.value });
    rerender();
  });
  return input;
}

function raritySelect(value, rerender) {
  const select = document.createElement('select');
  select.appendChild(new Option('指定なし', 'any'));
  for (const rarity of OPTION_RARITY) select.appendChild(new Option(RARITY_LABEL[rarity] || rarity, rarity));
  select.value = value || 'any';
  inputFallback(select, 'any');
  select.addEventListener('change', () => {
    state.updateLootFilter3({ minOptionRarity: select.value });
    rerender();
  });
  return select;
}

function inputFallback(select, fallback) {
  if (![...select.options].some(option => option.value === select.value)) select.value = fallback;
}

function levelInput(value, rerender) {
  const input = document.createElement('input');
  input.type = 'number';
  input.min = '0';
  input.max = '100';
  input.step = '1';
  input.value = String(Math.max(0, Math.min(100, Number(value) || 0)));
  input.className = 'smartloot4-level';
  input.addEventListener('change', () => {
    state.updateLootFilter3({ minOptionLevel: Math.max(0, Math.min(100, Math.floor(Number(input.value) || 0))) });
    rerender();
  });
  return input;
}

function activeOptionFilterCount(filter) {
  return [!!filter.optionQuery, filter.minOptionRarity && filter.minOptionRarity !== 'any', Number(filter.minOptionLevel) > 0].filter(Boolean).length;
}

function syncAdvancedBadge(filter) {
  const row = document.getElementById('lootFilterRow');
  if (!row) return;
  const button = [...row.querySelectorAll(':scope > .tab-btn')].find(btn => btn.textContent.startsWith('⚙ 詳細'));
  if (!button) return;
  const optionCount = activeOptionFilterCount(filter);
  const baseMatch = button.textContent.match(/\((\d+)\)/);
  const currentTotal = baseMatch ? Number(baseMatch[1]) : 0;
  const previousOptionCount = Number(button.dataset.smartloot4Count || 0);
  const baseCount = Math.max(0, currentTotal - previousOptionCount);
  const total = baseCount + optionCount;
  button.dataset.smartloot4Count = String(optionCount);
  button.textContent = `⚙ 詳細${total ? ` (${total})` : ''}`;
  button.classList.toggle('active', total > 0);
}

function hideLegacyVisibleAffixField(advanced) {
  for (const label of advanced.querySelectorAll(':scope > label')) {
    const first = label.querySelector(':scope > span')?.textContent?.trim();
    if (first === 'Affix') {
      label.hidden = true;
      label.dataset.smartloot4LegacyAffix = '1';
    }
  }
}

export function decorateSmartLoot4Filters(rerender = () => {}) {
  if (typeof document === 'undefined') return;
  ensureStyle();
  const filter = state.getLootFilter3?.();
  if (!filter) return;
  syncAdvancedBadge(filter);

  const advanced = document.querySelector('#lootFilterRow .loot-filter-advanced');
  if (!advanced) return;
  hideLegacyVisibleAffixField(advanced);
  if (advanced.querySelector('[data-smartloot4-option-filters]')) return;

  const box = document.createElement('div');
  box.dataset.smartloot4OptionFilters = '1';
  box.className = 'smartloot4-option-filters';

  const title = document.createElement('strong');
  title.textContent = 'OPTION FILTER';
  title.className = 'smartloot4-title';
  box.appendChild(title);
  box.appendChild(field('Option検索', optionQueryInput(filter.optionQuery || filter.affixQuery || '', rerender)));
  box.appendChild(field('最低Optionレア', raritySelect(filter.minOptionRarity || 'any', rerender)));
  box.appendChild(field('最低Option Lv', levelInput(filter.minOptionLevel || 0, rerender)));

  const hint = document.createElement('span');
  hint.className = 'hint smartloot4-hint';
  hint.textContent = '検索語・レア・Lvは同じ1個のOptionがすべて満たす時だけ一致。武器・防具・アクセ共通。';
  box.appendChild(hint);

  advanced.insertBefore(box, advanced.firstChild);
}
