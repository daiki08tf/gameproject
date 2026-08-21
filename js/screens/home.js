import { state } from '../state.js';

export function renderHome() {
  document.getElementById('homeJobName').textContent = state.currentJob.name;
  document.getElementById('homeLevelText').textContent = `Lv.${state.currentLevel}`;
  document.getElementById('homeGoldText').textContent = `💰 ${state.data.gold}`;
  const pct = Math.min(100, (state.currentExp / state.expToNext(state.currentLevel)) * 100);
  document.getElementById('homeXpFill').style.width = `${pct}%`;
}
