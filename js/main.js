import { state } from './state.js';
import './patches/progressionCore.js';
import './patches/statusCalculationCore.js';
import './patches/progression3Core.js';
import './patches/progression3Combat.js';
import './patches/progression3Ui.js';
import './patches/levelRoadmap99999.js';
import './patches/jobCodexUi.js';
import './patches/inheritanceCore.js';
import './patches/rune2Core.js';
import './patches/rune2Special.js';
import './patches/equipment3Archetypes.js';
import './patches/weaponInstanceFoundation.js';
import './patches/equipment3Foundation.js';
import './patches/equipment3Greater.js';
import './patches/equipment3Legendary.js';
import './patches/equipment3Blacksmith.js';
import './patches/equipment3SmartLoot.js';
import './patches/equipment3AbyssEndgame.js';
import './patches/equipment3DebugSafety.js';
import './patches/weaponAffixResultVisibility.js';
import './patches/companionFoundation.js';
import './patches/companionResetSafety.js';
import './patches/companionEvolution.js';
import './patches/companionSynergy.js';
import './patches/companionBattle.js';
import './patches/companionRecruitment.js';
import './patches/codexFoundation.js';
import './patches/codexUi.js';
import './patches/homeNavigation.js';
import './patches/rune2Ui.js';
import './patches/rune2ObserveUi.js';
import './patches/systemCleanupAwakeningV2.js';
import './patches/legacyRuneRetirement.js';
import './patches/bountyFoundation.js';
import './patches/bountyUniqueFoundation.js';
import './patches/bountyUniqueCombat.js';
import './patches/uniqueTrialFoundation.js';
import './patches/uniqueTrialCombat.js';
import './patches/uniqueTrialUi.js';
import './patches/uniqueBranchEffects.js';
import './patches/secretJobsPhase1.js';
import './patches/secretJobCodexBridge.js';
import './patches/secretJobsPhase2.js';
import { TextBattleScreen } from './screens/textBattle.js';
import { renderHome } from './screens/home.js';
import { renderChapterSelect } from './screens/chapterSelect.js';
import { renderStageSelect, renderStageConfirm, getSelectedBlessingId } from './screens/stageSelect.js';
import { renderAbyssList, initAbyssTabs } from './screens/abyss.js';
import { renderEquipment, autoEquipBest } from './screens/equipment.js';
import { renderWeaponCodex, initWeaponCodexTabs } from './screens/weaponCodex.js';
import { renderJobs } from './screens/jobs.js';
import { renderBlacksmith, initBlacksmithTabs } from './screens/blacksmith.js';
import { renderRebirth, initRebirthTabs } from './screens/rebirthModern.js';
import { renderSpellScreen, initSpellScreen } from './screens/spellScreen.js';
import { renderResult } from './screens/result.js';
import { renderStatus } from './screens/status.js';
import { Audio_ } from './audio.js';

const battle=new TextBattleScreen();let pendingStage=null,lastStageId=null,currentChapterIndex=0,cameFromAbyss=false;
function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id).classList.add('active');}
function goHome(){renderHome();showScreen('homeScreen');}
function goChapterSelect(){renderChapterSelect(chapterIndex=>goStageSelect(chapterIndex));showScreen('chapterSelectScreen');}
function goStageSelect(chapterIndex){currentChapterIndex=chapterIndex;renderStageSelect(chapterIndex,stage=>{cameFromAbyss=false;pendingStage=stage;renderStageConfirm(stage);showScreen('stageConfirmScreen');});showScreen('stageSelectScreen');}
function goAbyssList(){renderAbyssList(stage=>{cameFromAbyss=true;pendingStage=stage;renderStageConfirm(stage);showScreen('stageConfirmScreen');});showScreen('abyssScreen');}
function startBattle(stage,blessingId){lastStageId=stage.id;showScreen('textBattleScreen');battle.start(stage.id,result=>{result.rune2Drops=result.cleared&&state.rollRune2DropForStage?state.rollRune2DropForStage(stage.id):[];renderResult(result);showScreen('resultScreen');},blessingId);}
document.getElementById('titleStartBtn').addEventListener('click',()=>{Audio_.tap();goHome();});document.getElementById('goStageBtn').addEventListener('click',()=>{Audio_.tap();goChapterSelect();});document.getElementById('goEquipBtn').addEventListener('click',()=>{Audio_.tap();renderEquipment();showScreen('equipmentScreen');});document.getElementById('goStatusBtn').addEventListener('click',()=>{Audio_.tap();renderStatus();showScreen('statusScreen');});document.getElementById('statusBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});document.getElementById('goJobBtn').addEventListener('click',()=>{Audio_.tap();renderJobs();showScreen('jobsScreen');});document.getElementById('goBlacksmithBtn').addEventListener('click',()=>{Audio_.tap();renderBlacksmith();showScreen('blacksmithScreen');});document.getElementById('goRebirthBtn').addEventListener('click',()=>{Audio_.tap();renderRebirth();showScreen('rebirthScreen');});document.getElementById('goSpellBtn').addEventListener('click',()=>{Audio_.tap();renderSpellScreen();showScreen('spellScreen');});document.getElementById('goAbyssBtn').addEventListener('click',()=>{if(!state.isAbyssUnlocked())return;Audio_.tap();goAbyssList();});
document.getElementById('chapterBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});document.getElementById('stageBackBtn').addEventListener('click',()=>{Audio_.tap();goChapterSelect();});document.getElementById('confirmBackBtn').addEventListener('click',()=>{Audio_.tap();cameFromAbyss?goAbyssList():goStageSelect(currentChapterIndex);});document.getElementById('confirmStartBtn').addEventListener('click',()=>{Audio_.tap();startBattle(pendingStage,getSelectedBlessingId());});document.getElementById('abyssBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});initAbyssTabs();
document.getElementById('equipBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});document.getElementById('autoEquipBtn').addEventListener('click',()=>autoEquipBest());document.getElementById('weaponCodexBtn').addEventListener('click',()=>{Audio_.tap();renderWeaponCodex();showScreen('weaponCodexScreen');});document.getElementById('weaponCodexBackBtn').addEventListener('click',()=>{Audio_.tap();renderEquipment();showScreen('equipmentScreen');});initWeaponCodexTabs();
document.getElementById('jobsBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});document.getElementById('blacksmithBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});initBlacksmithTabs();document.getElementById('rebirthBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});initRebirthTabs();document.getElementById('spellBackBtn').addEventListener('click',()=>{Audio_.tap();goHome();});initSpellScreen();
document.getElementById('resultHomeBtn').addEventListener('click',()=>{Audio_.tap();goHome();});document.getElementById('resultEquipBtn').addEventListener('click',()=>{Audio_.tap();renderEquipment();showScreen('equipmentScreen');});document.getElementById('resultRetryBtn').addEventListener('click',()=>{Audio_.tap();if(lastStageId)startBattle(pendingStage,getSelectedBlessingId());});showScreen('titleScreen');