/* ============================================================
   Blade Vale UI Foundation 3.0
   Shared navigation + reusable compact UI primitives.
   ============================================================ */

const NAV_ITEMS = [
  { id: 'home', label: 'ホーム' },
  { id: 'adventure', label: '冒険' },
  { id: 'growth', label: '育成' },
  { id: 'companions', label: '仲間' },
  { id: 'menu', label: 'メニュー' },
];

const NAV_HIDDEN_SCREENS = new Set([
  'titleScreen',
  'textBattleScreen',
  'stageConfirmScreen',
  'resultScreen',
]);

let primaryNav = null;
let primaryRoutes = {};

function ensureFoundationStyles() {
  if (document.querySelector('link[data-ui-foundation-shared]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/uiFoundation.css';
  link.dataset.uiFoundationShared = 'true';
  document.head.appendChild(link);
}

function installPrimaryNavigation(routes = {}) {
  ensureFoundationStyles();
  primaryRoutes = { ...routes };
  if (primaryNav?.isConnected) return primaryNav;

  const nav = document.createElement('nav');
  nav.className = 'ui-primary-nav dc-nav';
  nav.setAttribute('aria-label', 'メインナビゲーション');

  NAV_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ui-primary-nav-item dc-action';
    button.dataset.uiRoute = item.id;
    button.textContent = item.label;
    button.addEventListener('click', () => {
      const route = primaryRoutes[item.id];
      if (typeof route === 'function') route();
    });
    nav.appendChild(button);
  });

  document.body.appendChild(nav);
  primaryNav = nav;
  return nav;
}

function updatePrimaryNavigation(screenId) {
  if (!primaryNav) return;
  const hidden = NAV_HIDDEN_SCREENS.has(screenId);
  primaryNav.classList.toggle('hidden', hidden);
  document.body.classList.toggle('ui-primary-nav-visible', !hidden);

  const routeByScreen = {
    homeScreen: 'home',
    chapterSelectScreen: 'adventure',
    stageSelectScreen: 'adventure',
    abyssScreen: 'adventure',
    statusScreen: 'growth',
    equipmentScreen: 'growth',
    jobsScreen: 'growth',
  };
  const activeRoute = routeByScreen[screenId] || null;
  primaryNav.querySelectorAll('[data-ui-route]').forEach((button) => {
    const active = !!activeRoute && button.dataset.uiRoute === activeRoute;
    button.classList.toggle('active', active);
    if (active) button.setAttribute('aria-current', 'page');
    else button.removeAttribute('aria-current');
  });
}

function createCompactCard({ title = '', meta = '', stats = [], badge = '', className = '' } = {}) {
  const card = document.createElement('article');
  card.className = ['ui-compact-card', className].filter(Boolean).join(' ');

  const head = document.createElement('div');
  head.className = 'ui-compact-card-head';
  const identity = document.createElement('div');
  identity.className = 'ui-compact-card-identity';
  const name = document.createElement('strong');
  name.className = 'ui-compact-card-title';
  name.textContent = title;
  identity.appendChild(name);
  if (meta) {
    const metaEl = document.createElement('span');
    metaEl.className = 'ui-compact-card-meta';
    metaEl.textContent = meta;
    identity.appendChild(metaEl);
  }
  head.appendChild(identity);
  if (badge) {
    const badgeEl = document.createElement('span');
    badgeEl.className = 'ui-badge';
    badgeEl.textContent = badge;
    head.appendChild(badgeEl);
  }
  card.appendChild(head);

  if (stats.length) {
    const row = document.createElement('div');
    row.className = 'ui-stat-row';
    stats.slice(0, 4).forEach(({ label, value, delta }) => {
      const stat = document.createElement('span');
      stat.className = 'ui-stat-chip';
      stat.innerHTML = `<small>${label}</small><b>${value}</b>${delta ? `<em>${delta}</em>` : ''}`;
      row.appendChild(stat);
    });
    card.appendChild(row);
  }
  return card;
}

function createTabs(items = [], onChange = () => {}) {
  const tabs = document.createElement('div');
  tabs.className = 'ui-tabs dc-tabs';
  tabs.setAttribute('role', 'tablist');
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `ui-tab dc-tab dc-action${index === 0 ? ' active' : ''}`;
    button.textContent = item.label;
    button.dataset.uiTab = item.id;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-selected', String(index === 0));
    button.addEventListener('click', () => {
      tabs.querySelectorAll('.ui-tab').forEach((tab) => {
        const active = tab === button;
        tab.classList.toggle('active', active);
        tab.setAttribute('aria-selected', String(active));
      });
      onChange(item.id);
    });
    tabs.appendChild(button);
  });
  return tabs;
}

function createDetailDisclosure(label = '詳細を見る', content = '') {
  const details = document.createElement('details');
  details.className = 'ui-detail-disclosure';
  const summary = document.createElement('summary');
  summary.textContent = label;
  details.appendChild(summary);
  const body = document.createElement('div');
  body.className = 'ui-detail-body';
  if (content instanceof Node) body.appendChild(content);
  else body.textContent = String(content || '');
  details.appendChild(body);
  return details;
}

function createFilterBar({ placeholder = '検索', filters = [] } = {}) {
  const bar = document.createElement('div');
  bar.className = 'ui-filter-bar';
  const input = document.createElement('input');
  input.type = 'search';
  input.className = 'ui-filter-search';
  input.placeholder = placeholder;
  bar.appendChild(input);
  if (filters.length) {
    const select = document.createElement('select');
    select.className = 'ui-filter-select';
    filters.forEach(({ value, label }) => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = label;
      select.appendChild(option);
    });
    bar.appendChild(select);
  }
  return { element: bar, input, select: bar.querySelector('select') };
}

function createHeader({ title = '', kicker = '', meta = '', onBack = null } = {}) {
  const header = document.createElement('header');
  header.className = 'dc-header';
  if (typeof onBack === 'function') {
    header.appendChild(createAction({ label: '戻る', variant: 'secondary', onClick: onBack }));
  }
  const identity = document.createElement('div');
  identity.className = 'dc-header-identity';
  if (kicker) {
    const kickerEl = document.createElement('span');
    kickerEl.className = 'dc-row-meta';
    kickerEl.textContent = kicker;
    identity.appendChild(kickerEl);
  }
  const heading = document.createElement('h2');
  heading.className = 'dc-header-title';
  heading.textContent = title;
  identity.appendChild(heading);
  header.appendChild(identity);
  if (meta) header.appendChild(createBadge(meta));
  return header;
}

function createSection({ title = '', content = '', className = '' } = {}) {
  const section = document.createElement('section');
  section.className = ['dc-section', className].filter(Boolean).join(' ');
  if (title) {
    const heading = document.createElement('h3');
    heading.className = 'dc-section-title';
    heading.textContent = title;
    section.appendChild(heading);
  }
  if (content instanceof Node) section.appendChild(content);
  else if (content) section.append(String(content));
  return section;
}

function createRow({ label = '', value = '', meta = '' } = {}) {
  const row = document.createElement('div');
  row.className = 'dc-row';
  const labelEl = document.createElement('span');
  labelEl.textContent = label;
  row.appendChild(labelEl);
  const valueEl = document.createElement('span');
  valueEl.className = 'dc-row-value';
  valueEl.textContent = value;
  row.appendChild(valueEl);
  if (meta) {
    const metaEl = document.createElement('small');
    metaEl.className = 'dc-row-meta';
    metaEl.textContent = meta;
    labelEl.appendChild(metaEl);
  }
  return row;
}

function createBadge(label = '', tone = 'neutral') {
  const badge = document.createElement('span');
  badge.className = 'dc-badge';
  badge.dataset.tone = tone;
  badge.textContent = label;
  return badge;
}

function createAction({ label = '', variant = 'secondary', disabled = false, pressed = null, busy = false, onClick = null } = {}) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `dc-action dc-action-${variant}`;
  button.textContent = label;
  button.disabled = disabled;
  if (pressed !== null) button.setAttribute('aria-pressed', String(!!pressed));
  if (busy) button.setAttribute('aria-busy', 'true');
  if (typeof onClick === 'function') button.addEventListener('click', onClick);
  return button;
}

function createNotice({ text = '', tone = 'info' } = {}) {
  const notice = document.createElement('aside');
  notice.className = 'dc-notice';
  notice.dataset.tone = tone;
  notice.textContent = text;
  return notice;
}

export {
  NAV_ITEMS,
  NAV_HIDDEN_SCREENS,
  installPrimaryNavigation,
  updatePrimaryNavigation,
  createCompactCard,
  createTabs,
  createDetailDisclosure,
  createFilterBar,
  createHeader,
  createSection,
  createRow,
  createBadge,
  createAction,
  createNotice,
};
