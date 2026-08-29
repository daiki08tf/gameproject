/* ============================================================
   Home navigation organizer — UI Foundation 3.0
   Keeps existing button IDs/listeners while replacing the growing vertical
   menu with one primary Adventure CTA plus compact category drawers.
   ============================================================ */
import './settlementCore.js';
import './settlementTavern.js';
import './settlementUi.js';
import './monsterRanchCore.js';
import './monsterRanch2Facilities.js';
import './monsterRanch2Complete.js';
import './monsterRanch2Economy.js';
import './monsterRanchUi.js';
import './monsterRanch2FacilitiesUi.js';
import './monsterRanch2CompleteUi.js';
import './companionBondUi.js';
import './uiFoundationBootstrap.js';
import './equipmentCompactUi.js';
import './monsterRanchCompactUi.js';
import './endgameGuidanceUi.js';
import './buildLoadoutsUi.js';
import './systemDeepeningPackA.js';
import './systemDeepeningPackB.js';
import './systemDeepeningPackC.js';
import './contentPackIIAB.js';
import './contentPackIICD.js';
import './contentPackIIE.js';
import './contentPackIIIA.js';
import './contentPackIIIB.js';
import { enhanceHome } from './finalIntegrationUi.js';
import { applyHomePixelIcons } from '../ui/pixelIcons.js';

const HOME_HUBS = [
  {
    id: 'growth',
    title: '育成',
    subtitle: '装備・職業・覚醒',
    buttons: ['goEquipBtn', 'goJobBtn', 'goRebirthBtn', 'goStatusBtn'],
  },
  {
    id: 'base',
    title: '仲間・拠点',
    subtitle: '牧場・施設・鍛冶',
    buttons: ['goCompanionBtn', 'goSettlementBtn', 'goBlacksmithBtn'],
  },
  {
    id: 'records',
    title: '記録・その他',
    subtitle: '図鑑・深淵・セーブ',
    buttons: ['goMonsterCodexBtn', 'goAbyssBtn', 'goSpellBtn'],
  },
];

function ensureHomeStyles() {
  if (document.querySelector('link[data-ui-foundation-home]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'css/home3.css';
  link.dataset.uiFoundationHome = 'true';
  document.head.appendChild(link);
}

function makeHubToggle(hub, hasMembers) {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'home-hub-toggle';
  button.dataset.homeHubToggle = hub.id;
  button.disabled = !hasMembers;
  button.setAttribute('aria-expanded', 'false');
  button.innerHTML = `
    <span class="home-hub-title">${hub.title}</span>
    <span class="home-hub-subtitle">${hub.subtitle}</span>
    <span class="home-hub-chevron" aria-hidden="true">›</span>
  `;
  return button;
}

function closeAllHubs(menu, exceptId = null) {
  menu.querySelectorAll('[data-home-hub-panel]').forEach((panel) => {
    const open = panel.dataset.homeHubPanel === exceptId;
    panel.classList.toggle('open', open);
    panel.hidden = !open;
  });
  menu.querySelectorAll('[data-home-hub-toggle]').forEach((toggle) => {
    const open = toggle.dataset.homeHubToggle === exceptId;
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
}

function organizeHomeMenu() {
  ensureHomeStyles();
  const menu = document.querySelector('#homeScreen .home-menu');
  if (!menu || menu.dataset.uiFoundation3 === 'true') { enhanceHome(); return; }

  const allCards = [...menu.querySelectorAll('.menu-card')];
  const buttons = new Map(allCards.map((btn) => [btn.id, btn]));
  const adventure = buttons.get('goStageBtn');
  if (!adventure) return;

  menu.replaceChildren();
  menu.classList.add('home-menu-v3');

  const primary = document.createElement('div');
  primary.className = 'home-primary-action';
  adventure.classList.add('home-adventure-primary');
  const adventureLabel = adventure.querySelector('span:last-child');
  if (adventureLabel) adventureLabel.textContent = '冒険する';
  primary.appendChild(adventure);
  menu.appendChild(primary);

  const hubGrid = document.createElement('div');
  hubGrid.className = 'home-hub-grid';
  const panels = document.createElement('div');
  panels.className = 'home-hub-panels';

  for (const hub of HOME_HUBS) {
    const members = hub.buttons.map((id) => buttons.get(id)).filter(Boolean);
    const toggle = makeHubToggle(hub, members.length > 0);
    hubGrid.appendChild(toggle);

    const panel = document.createElement('section');
    panel.className = 'home-hub-panel';
    panel.dataset.homeHubPanel = hub.id;
    panel.hidden = true;

    const heading = document.createElement('div');
    heading.className = 'home-hub-panel-heading';
    heading.textContent = hub.title;
    panel.appendChild(heading);

    const grid = document.createElement('div');
    grid.className = 'home-hub-actions';
    members.forEach((button) => {
      button.classList.add('home-secondary-action');
      grid.appendChild(button);
    });
    panel.appendChild(grid);
    panels.appendChild(panel);

    toggle.addEventListener('click', () => {
      const alreadyOpen = toggle.getAttribute('aria-expanded') === 'true';
      closeAllHubs(menu, alreadyOpen ? null : hub.id);
    });
  }

  menu.append(hubGrid, panels);
  menu.dataset.uiFoundation3 = 'true';
  applyHomePixelIcons();
  enhanceHome();
}

organizeHomeMenu();
export { organizeHomeMenu, HOME_HUBS };
