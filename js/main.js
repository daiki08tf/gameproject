import { state } from './state.js';
import { BattleScreen } from './battle.js';
import { renderHome } from './screens/home.js';
import { renderChapterSelect } from './screens/chapterSelect.js';
import { renderStageSelect, renderStageConfirm } from './screens/stageSelect.js';
import { renderEquipment, autoEquipBest } from './screens/equipment.js';
import { renderJobs } from './screens/jobs.js';
import { renderBlacksmith, initBlacksmithTabs } from './screens/blacksmith.js';
import { renderRebirth, initRebirthTabs } from './screens/rebirth.js';
import { renderSpellScreen, initSpellScreen } from './screens/spellScreen.js';
import { renderResult } from './screens/result.js';
import { Audio_ } from './audio.js';

const battle = new BattleScreen();
let pendingStage = null;
let lastStageId = null;
let currentChapterIndex = 0;

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
}

function goHome() {
  renderHome();
  showScreen('homeScreen');
}

function goChapterSelect() {
  renderChapterSelect((chapterIndex) => {
    goStageSelect(chapterIndex);
  });
  showScreen('chapterSelectScreen');
}

function goStageSelect(chapterIndex) {
  currentChapterIndex = chapterIndex;
  renderStageSelect(chapterIndex, (stage) => {
    pendingStage = stage;
    renderStageConfirm(stage);
    showScreen('stageConfirmScreen');
  });
  showScreen('stageSelectScreen');
}

function startBattle(stage) {
  lastStageId = stage.id;
  showScreen('battleScreen');
  battle.start(stage.id, (result) => {
    renderResult(result);
    showScreen('resultScreen');
  });
}

// ---------------------------------------------------------
// タイトル
document.getElementById('titleStartBtn').addEventListener('click', () => {
  Audio_.tap();
  goHome();
});

// ---------------------------------------------------------
// ホーム
document.getElementById('goStageBtn').addEventListener('click', () => { Audio_.tap(); goChapterSelect(); });
document.getElementById('goEquipBtn').addEventListener('click', () => {
  Audio_.tap();
  renderEquipment();
  showScreen('equipmentScreen');
});
document.getElementById('goJobBtn').addEventListener('click', () => {
  Audio_.tap();
  renderJobs();
  showScreen('jobsScreen');
});
document.getElementById('goBlacksmithBtn').addEventListener('click', () => {
  Audio_.tap();
  renderBlacksmith();
  showScreen('blacksmithScreen');
});
document.getElementById('goRebirthBtn').addEventListener('click', () => {
  Audio_.tap();
  renderRebirth();
  showScreen('rebirthScreen');
});
document.getElementById('goSpellBtn').addEventListener('click', () => {
  Audio_.tap();
  renderSpellScreen();
  showScreen('spellScreen');
});

// ---------------------------------------------------------
// 章選択／ステージ選択／確認
document.getElementById('chapterBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('stageBackBtn').addEventListener('click', () => { Audio_.tap(); goChapterSelect(); });
document.getElementById('confirmBackBtn').addEventListener('click', () => { Audio_.tap(); goStageSelect(currentChapterIndex); });
document.getElementById('confirmStartBtn').addEventListener('click', () => {
  Audio_.tap();
  startBattle(pendingStage);
});

// ---------------------------------------------------------
// 装備
document.getElementById('equipBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('autoEquipBtn').addEventListener('click', () => autoEquipBest());

// ---------------------------------------------------------
// 職業
document.getElementById('jobsBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });

// ---------------------------------------------------------
// 鍛冶屋
document.getElementById('blacksmithBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initBlacksmithTabs();

// ---------------------------------------------------------
// 転生の祭壇
document.getElementById('rebirthBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initRebirthTabs();

// ---------------------------------------------------------
// ふっかつのじゅもん
document.getElementById('spellBackBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
initSpellScreen();

// ---------------------------------------------------------
// リザルト
document.getElementById('resultHomeBtn').addEventListener('click', () => { Audio_.tap(); goHome(); });
document.getElementById('resultRetryBtn').addEventListener('click', () => {
  Audio_.tap();
  if (lastStageId) {
    const found = pendingStage && pendingStage.id === lastStageId ? pendingStage : null;
    startBattle(found || pendingStage);
  }
});

// 初期表示
showScreen('titleScreen');
