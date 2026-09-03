/* ============================================================
   UI Foundation 3.0 bootstrap
   Connects shared navigation to existing routes without duplicating
   each screen's rendering logic.
   ============================================================ */
import { state } from '../state.js';
import { renderHome } from '../screens/home.js';
import { installPrimaryNavigation, updatePrimaryNavigation } from '../ui/uiFoundation.js';

function activeScreenId() {
  return document.querySelector('.screen.active')?.id || null;
}

function showHomeDirect() {
  if (state.abyssRun?.().active) state.abyssRunEnd();
  renderHome();
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.getElementById('homeScreen')?.classList.add('active');
  updatePrimaryNavigation('homeScreen');
}

function clickRoute(buttonId, fallback = showHomeDirect) {
  const button = document.getElementById(buttonId);
  if (button) button.click();
  else fallback?.();
}

function openHomeHub(hubId) {
  showHomeDirect();
  requestAnimationFrame(() => {
    const toggle = document.querySelector(`[data-home-hub-toggle="${hubId}"]`);
    if (toggle && toggle.getAttribute('aria-expanded') !== 'true') toggle.click();
  });
}

function installBladeValeNavigation() {
  installPrimaryNavigation({
    home: showHomeDirect,
    adventure: () => clickRoute('goStageBtn'),
    character: () => clickRoute('goStatusBtn'),
    equipment: () => clickRoute('goEquipBtn'),
    records: () => openHomeHub('records'),
  });

  updatePrimaryNavigation(activeScreenId());

  const observer = new MutationObserver((mutations) => {
    if (!mutations.some((mutation) => mutation.attributeName === 'class')) return;
    updatePrimaryNavigation(activeScreenId());
  });
  document.querySelectorAll('.screen').forEach((screen) => {
    observer.observe(screen, { attributes: true, attributeFilter: ['class'] });
  });
  return observer;
}

installBladeValeNavigation();

export { installBladeValeNavigation, showHomeDirect, openHomeHub };
