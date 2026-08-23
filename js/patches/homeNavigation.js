/* ============================================================
   Home navigation organizer
   Groups the growing hub menu without changing existing button IDs.
   ============================================================ */

const GROUPS = [
  { id: 'adventure', title: '冒険', buttons: ['goStageBtn', 'goAbyssBtn'] },
  { id: 'growth', title: '育成', buttons: ['goStatusBtn', 'goCompanionBtn', 'goMonsterCodexBtn', 'goEquipBtn', 'goJobBtn', 'goBlacksmithBtn', 'goRebirthBtn'] },
  { id: 'other', title: 'その他', buttons: ['goSpellBtn'] },
];

function organizeHomeMenu() {
  const menu = document.querySelector('#homeScreen .home-menu');
  if (!menu || menu.dataset.grouped === 'true') return;
  const buttons = new Map([...menu.querySelectorAll(':scope > .menu-card')].map((btn) => [btn.id, btn]));
  for (const group of GROUPS) {
    const members = group.buttons.map((id) => buttons.get(id)).filter(Boolean);
    if (!members.length) continue;
    const section = document.createElement('section');
    section.className = 'home-menu-section';
    section.dataset.homeGroup = group.id;
    const heading = document.createElement('h2');
    heading.className = 'home-menu-heading';
    heading.textContent = group.title;
    const grid = document.createElement('div');
    grid.className = 'home-menu-grid';
    members.forEach((button) => grid.appendChild(button));
    section.append(heading, grid);
    menu.appendChild(section);
  }
  menu.dataset.grouped = 'true';
}

organizeHomeMenu();
export { organizeHomeMenu, GROUPS };
