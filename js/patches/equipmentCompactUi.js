/* ============================================================
   Blade Vale 3.0 — Phase 2-A Equipment Compact UI
   Presentation-only compaction layer. It preserves equipment.js gameplay
   handlers while converting long inventory rows into scan-first cards.
   ============================================================ */

function ensureEquipmentCompactStyles() {
  if (document.querySelector('link[data-equipment-compact-ui]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/equipmentCompact.css';
  link.dataset.equipmentCompactUi = 'true';
  document.head.appendChild(link);
}

function compactText(text = '', max = 88) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function buildQuickMeta(row, main) {
  const source = main.querySelector('.item-stats');
  if (!source) return null;
  const meta = document.createElement('div');
  meta.className = 'equip-compact-meta ui-clamp-1';
  meta.textContent = compactText(source.textContent, 88);
  return meta;
}

function makeDetails(main) {
  const detailNodes = [...main.children].filter((node) =>
    node.matches?.('.item-stats, .eq3-meta, .affix-block, .eq3-special-line')
  );
  if (!detailNodes.length) return null;

  const details = document.createElement('details');
  details.className = 'ui-detail-disclosure equip-compact-details';
  const summary = document.createElement('summary');
  summary.textContent = '性能・Affix・固有効果';
  const body = document.createElement('div');
  body.className = 'ui-detail-body equip-compact-detail-body';
  detailNodes.forEach((node) => body.appendChild(node));
  details.append(summary, body);
  return details;
}

function compactEquipmentRow(row) {
  if (!row || row.dataset.compactEquipment === 'true') return;
  const main = row.querySelector(':scope > .pick-main');
  if (!main) return;

  row.dataset.compactEquipment = 'true';
  row.classList.add('ui-compact-card', 'equip-compact-card');
  main.classList.add('equip-compact-main');

  const name = main.querySelector('.item-name');
  if (name) {
    name.classList.add('ui-compact-card-title', 'equip-compact-name');
    name.title = name.textContent.trim();
  }

  const quickMeta = buildQuickMeta(row, main);
  const details = makeDetails(main);
  if (quickMeta) {
    const nameNode = main.querySelector('.item-name');
    if (nameNode) nameNode.insertAdjacentElement('afterend', quickMeta);
    else main.prepend(quickMeta);
  }
  if (details) main.appendChild(details);

  // Comparison deltas stay visible: they are the main decision information.
  main.querySelectorAll('.compare-line').forEach((line) => line.classList.add('equip-compact-compare'));

  const equipButton = row.querySelector(':scope > button[data-action]');
  if (equipButton) equipButton.classList.add('equip-compact-primary-action');
  const actions = row.querySelector(':scope > .equip-inline-actions');
  if (actions) actions.classList.add('equip-compact-secondary-actions');
}

function compactEquipmentScreen() {
  ensureEquipmentCompactStyles();
  const picker = document.getElementById('equipPicker');
  if (!picker) return;
  // classList.add() re-queues an "attributes" mutation record even when the
  // class is already present, and this function is itself invoked from the
  // MutationObserver watching this same subtree (attributes:true) below — so
  // applying it unconditionally on every call retriggers the observer forever
  // and hangs the tab before the page even finishes loading. Only touch the
  // attribute when it would actually change.
  if (!picker.classList.contains('ui-list-compact')) picker.classList.add('ui-list-compact', 'equip-picker-compact');
  picker.querySelectorAll(':scope > .pick-row').forEach(compactEquipmentRow);

  const filters = document.getElementById('lootFilterRow');
  if (filters && !filters.classList.contains('equip-filter-compact')) filters.classList.add('equip-filter-compact');
  const doll = document.getElementById('paperdoll');
  if (doll && !doll.classList.contains('equip-paperdoll-compact')) doll.classList.add('equip-paperdoll-compact');
}

function installEquipmentCompactUi() {
  ensureEquipmentCompactStyles();
  compactEquipmentScreen();

  const screen = document.getElementById('equipmentScreen');
  if (!screen) return null;
  const observer = new MutationObserver((mutations) => {
    if (!mutations.some((m) => m.type === 'childList' || m.attributeName === 'class')) return;
    queueMicrotask(compactEquipmentScreen);
  });
  observer.observe(screen, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  return observer;
}

installEquipmentCompactUi();

export { compactEquipmentRow, compactEquipmentScreen, installEquipmentCompactUi, compactText };
