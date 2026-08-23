import { state } from './state.js';
import './patches/progressionCore.js';
import './patches/statusCalculationCore.js';
import './patches/inheritanceCore.js';
import './patches/rune2Core.js';
import './patches/rune2Special.js';
import './patches/weaponInstanceFoundation.js';
import './patches/companionFoundation.js';
import './patches/companionBattle.js';
import './patches/companionRecruitment.js';
import './patches/codexFoundation.js';
import './patches/codexUi.js';
import './patches/homeNavigation.js';
import './patches/rune2Ui.js';
import './patches/rune2ObserveUi.js';
// 旧リアルタイムCanvas戦闘（js/battle.js）はそのまま未使用で残し、こちらの
// テキスト戦闘（TextBattleScreen）へ切り替える（元指示19番）
import { TextBattleScreen } from './screens/textBattle.js';
import { renderHome } from './screens/home.js';
import { renderChapterSelect } from './screens/chapterSelect.js';
import { renderStageSelect, renderStageConfirm, getSelectedBlessingId } from './screens/stageSelect.js';
import { renderAbyssList, initAbyssTabs } from './screens/abyss.js';
import { renderEquipment, autoEquipBest } from './screens/equipment.js';
import { renderWeaponCodex, initWeaponCodexTabs } from './screens/weaponCodex.js';
import { renderJobs } from './screens/jobs.js';
import { renderBlacksmith, initBlacksmithTabs } from './screens/blacksmith.js';
import { renderRebirth, initRebirthTabs } from './screens/rebirth.js';
import { renderSpellScreen, initSpellScreen } from './screens/spellScreen.js';
import { renderResult } from './screens/result.js';
import { renderStatus } from './screens/status.js';
import { Audio_ } from './audio.js';

const battle = new TextBattleScreen();
let pendingStage = null;
let lastStageId = null;
let currentChapterIndex = 0;
let cameFromAbyss = false;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goHome() { renderHome(); showScreen('homeScreen'); }
function goChapterSelect() { renderChapterSelect((chapterIndex) => { goStageSelect(chapterIndex); }); showScreen('chapterSelectScreen'); }
function goStageSelect(chapterIndex) {
  currentChapterIndex = chapterIndex;
  renderStageSelect(chapterIndex, (stage) => { cameFromAbyss = false; pendingStage = stage; renderStageConfirm(stage); showScreen('stageConfirmScreen'); });
  showScreen('stageSelectScreen');
}
function goAbyssList() {
  renderAbyssList((stage) => { cameFromAbyss = true; pendingStage = stage; renderStageConfirm(stage); showScreen('stageConfirmScreen'); });
  showScreen('abyssScreen');
}
function startBattle(stage, blessingId) {
  lastStageId = stage.id;
  showScreen('textBattleScreen');
  battle.start(stage.id, (result) => {
    if (result.cleared && state.rollRune2DropForStage) {
      result.rune2Drops = state.rollRune2DropForStage(stage.id);
    } else result.rune2Drops = [];
    renderResult(result);
    showScreen('resultScreen');
  }, blessingId);
}

document.getElementById('titleStartBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('goStageBtn').addEventListener('click', () => { Audio_.tap(); goChapterSelect(); });
document.getElementById('goEquipBtn').addEventListener('click', () => { Audio_.tap(); renderEquipment(); showScreen('equipmentScreen'); });
document.getElementById('goStatusBtn').addEventListener('click', () => { Audio_.tap(); renderStatus(); showScreen('statusScreen'); });
document.getElementById('statusBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('goJobBtn').addEventListener('click', () => { Audio_.tap(); renderJobs(); showScreen('jobsScreen'); });
document.getElementById('goBlacksmithBtn').addEventListener('click', () => { Audio_.tap(); renderBlacksmith(); showScreen('blacksmithScreen'); });
document.getElementById('goRebirthBtn').addEventListener('click', () => { Audio_.tap(); renderRebirth(); showScreen('rebirthScreen'); });
document.getElementById('goSpellBtn').addEventListener('click', () => { Audio_.tap(); renderSpellScreen(); showScreen('spellScreen'); });
document.getElementById('goAbyssBtn').addEventListener('click', () => { if (!state.isAbyssUnlocked()) return; Audio_.tap(); goAbyssList(); });

document.getElementById('chapterBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('stageBackBtn').addEventListener('click', () => { Audio_.tap(); goChapterSelect(); });
document.getElementById('confirmBackBtn').addEventListener('click', () => { Audio_.tap(); if (cameFromAbyss) goAbyssList(); else goStageSelect(currentChapterIndex); });
document.getElementById('confirmStartBtn').addEventListener('click', () => { Audio_.tap(); startBattle(pendingStage, getSelectedBlessingId()); });
document.getElementById('abyssBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initAbyssTabs();

document.getElementById('equipBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('autoEquipBtn').addEventListener('click', () => autoEquipBest());
document.getElementById('weaponCodexBtn').addEventListener('click', () => { Audio_.tap(); renderWeaponCodex(); showScreen('weaponCodexScreen'); });
document.getElementById('weaponCodexBackBtn').addEventListener('click', () => { Audio_.tap(); renderEquipment(); showScreen('equipmentScreen'); });
initWeaponCodexTabs();

document.getElementById('jobsBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('blacksmithBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initBlacksmithTabs();
document.getElementById('rebirthBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initRebirthTabs();
document.getElementById('spellBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initSpellScreen();

document.getElementById('resultHomeBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('resultEquipBtn').addEventListener('click', () => { Audio_.tap(); renderEquipment(); showScreen('equipmentScreen'); });
document.getElementById('resultRetryBtn').addEventListener('click', () => {
  Audio_.tap();
  if (lastStageId) {
    const found = pendingStage && pendingStage.id === lastStageId ? pendingStage : null;
    startBattle(found || pendingStage, getSelectedBlessingId());
  }
});

showScreen('titleScreen');
