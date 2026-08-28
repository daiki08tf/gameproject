import fs from 'node:fs';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { CP3_DEEP_SURVEYS, buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';
import {
  encodeDeepSurveyConditionStageId,
  surveyConditionsForRegion,
} from '../js/data/postCp3SurveyConditions.js';
import { buildConvergenceApexStage } from '../js/data/postCp3ConvergenceApex.js';

const UI_PATH = new URL('../js/patches/postCp3DeepSurveyUi.js', import.meta.url);
const COMBAT_PATH = new URL('../js/patches/postCp3ConvergenceApexCombat.js', import.meta.url);

function read(path) { return fs.readFileSync(path, 'utf8'); }
function round2(n) { return Math.round(n * 100) / 100; }
function choose2(n) { return n < 2 ? 0 : (n * (n - 1)) / 2; }

function bossHpFor(stage) {
  const wave = stage?.waves?.at?.(-1);
  return Number(ENEMY_TYPES[wave?.type]?.hp) || 0;
}

export function buildPostCp3PlayFeelProxyReport() {
  const regions = CP3_DEEP_SURVEYS.map((def) => {
    const conditions = surveyConditionsForRegion(def.id);
    const baseline = buildDeepSurveyStage(def.realmId);
    const singles = conditions.map((condition) => buildDeepSurveyStage(
      encodeDeepSurveyConditionStageId(def.realmId, [condition.id]),
    ));
    const pairs = [];
    for (let i = 0; i < conditions.length; i += 1) {
      for (let j = i + 1; j < conditions.length; j += 1) {
        pairs.push(buildDeepSurveyStage(encodeDeepSurveyConditionStageId(def.realmId, [conditions[i].id, conditions[j].id])));
      }
    }
    return {
      id: def.id,
      name: def.realmName,
      conditionCount: conditions.length,
      pairCount: choose2(conditions.length),
      baselineSteering: baseline?.loot3Profile?.targetAffixChance || 0,
      singleSteering: Math.max(0, ...singles.map((stage) => Number(stage?.loot3Profile?.targetAffixChance) || 0)),
      pairSteering: Math.max(0, ...pairs.map((stage) => Number(stage?.loot3Profile?.targetAffixChance) || 0)),
      baselineBossHp: bossHpFor(baseline),
      conditionPrimaryKeys: conditions.map((condition) => Object.keys(condition.effect || {}).filter((key) => {
        const value = condition.effect?.[key];
        return typeof value === 'number' ? value !== 0 && value !== 1 : Boolean(value);
      })),
    };
  });

  const apex = buildConvergenceApexStage();
  const apexPhaseHps = (apex?.waves || []).map((wave) => Number(ENEMY_TYPES[wave.type]?.hp) || 0);
  const maxBaselineBossHp = Math.max(1, ...regions.map((region) => region.baselineBossHp));
  const ui = read(UI_PATH);
  const combat = read(COMBAT_PATH);

  const minHeightMatch = ui.match(/min-height:(\d+)px/);
  const columnsMatch = ui.match(/grid-template-columns:repeat\((\d+),/);

  return {
    regions,
    apex: {
      phaseCount: apex?.waves?.length || 0,
      phaseOrder: (apex?.waves || []).map((wave) => wave.convergencePhase),
      phaseHps: apexPhaseHps,
      totalBossHp: apexPhaseHps.reduce((sum, hp) => sum + hp, 0),
      maxBaselineBossHp,
      totalHpVsMaxBaseline: round2(apexPhaseHps.reduce((sum, hp) => sum + hp, 0) / maxBaselineBossHp),
      mixedSteering: Number(apex?.loot3Profile?.targetAffixChance) || 0,
      finalCyclesReadable: /\['ash','ninth','root'\]/.test(combat) && /\/2\)%3/.test(combat),
    },
    mobile: {
      conditionGridColumns: Number(columnsMatch?.[1]) || 0,
      minTouchHeightPx: Number(minHeightMatch?.[1]) || 0,
      pressedState: /aria-pressed/.test(ui),
      apexPhaseLabel: /APEX \/ 4-PHASE/.test(ui),
    },
  };
}

if (process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href) {
  const report = buildPostCp3PlayFeelProxyReport();
  console.log('Post-CP3 Play-Feel Proxy Audit');
  for (const region of report.regions) {
    console.log(`\n${region.name}`);
    console.log(`  Conditions : ${region.conditionCount} singles / ${region.pairCount} pairs`);
    console.log(`  Steering   : ${(region.baselineSteering * 100).toFixed(0)}% -> ${(region.singleSteering * 100).toFixed(0)}% -> ${(region.pairSteering * 100).toFixed(0)}%`);
    console.log(`  Boss HP    : ${region.baselineBossHp.toLocaleString()}`);
    console.log(`  Pressure   : ${region.conditionPrimaryKeys.map((keys) => keys.join('+')).join(' | ')}`);
  }
  console.log('\nConvergence Apex');
  console.log(`  Phases     : ${report.apex.phaseOrder.join(' -> ')}`);
  console.log(`  Total HP   : ${report.apex.totalBossHp.toLocaleString()} (${report.apex.totalHpVsMaxBaseline}x max baseline boss)`);
  console.log(`  Mixed chase: ${(report.apex.mixedSteering * 100).toFixed(0)}%`);
  console.log(`  Final cycle readable: ${report.apex.finalCyclesReadable ? 'yes' : 'no'}`);
  console.log('\nPortrait/mobile');
  console.log(`  Condition grid : ${report.mobile.conditionGridColumns} columns`);
  console.log(`  Touch target   : >= ${report.mobile.minTouchHeightPx}px`);
  console.log(`  Pressed state  : ${report.mobile.pressedState ? 'yes' : 'no'}`);
  console.log(`  Apex label     : ${report.mobile.apexPhaseLabel ? 'yes' : 'no'}`);
}
