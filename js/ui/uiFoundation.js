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
  nav.className = 'ui-primary-nav';
  nav.setAttribute('aria-label', 'メインナビゲーション');

  NAV_ITEMS.forEach((item) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'ui-primary-nav-item';
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
  tabs.className = 'ui-tabs';
  tabs.setAttribute('role', 'tablist');
  items.forEach((item, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `ui-tab${index === 0 ? ' active' : ''}`;
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

export {
  NAV_ITEMS,
  NAV_HIDDEN_SCREENS,
  installPrimaryNavigation,
  updatePrimaryNavigation,
  createCompactCard,
  createTabs,
  createDetailDisclosure,
  createFilterBar,
};
