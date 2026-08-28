import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const knowledge=readFileSync(new URL('../js/patches/codexEnemyKnowledge.js',import.meta.url),'utf8');
const runtime=readFileSync(new URL('../js/patches/enemy3CodexAnalysis.js',import.meta.url),'utf8');
const ui=readFileSync(new URL('../js/patches/enemy3CodexUi.js',import.meta.url),'utf8');
const bridge=readFileSync(new URL('../js/patches/enemy3Targeting.js',import.meta.url),'utf8');
const codex=readFileSync(new URL('../js/data/codex.js',import.meta.url),'utf8');

test('B8 exposes Enemy 3 tactical knowledge through existing enemyKnowledge',()=>{
  assert.match(knowledge,/observedEliteAffixes/);
  assert.match(knowledge,/observedRareBehaviors/);
  assert.match(knowledge,/bossPhase2Observed/);
  assert.match(knowledge,/bossPhaseKnown/);
});

test('B8 observes combat metadata and analysis without a new save root',()=>{
  assert.match(runtime,/markEnemy3EliteAffixObserved/);
  assert.match(runtime,/markEnemy3RareBehaviorObserved/);
  assert.match(runtime,/markEnemy3BossPhaseObserved/);
  assert.match(runtime,/markEnemy3AdvancedAnalyzed/);
  assert.match(runtime,/state\.data\.monsterCodex/);
  assert.doesNotMatch(runtime,/state\.data\.enemy3Codex|state\.data\.enemyKnowledge/);
});

test('B8 tactical panel is loaded through the Enemy 3 bridge',()=>{
  assert.match(bridge,/import '\.\/enemy3CodexAnalysis\.js'/);
  assert.match(bridge,/import '\.\/enemy3CodexUi\.js'/);
  assert.match(ui,/Enemy 3\.0 戦術解析/);
  assert.match(ui,/Elite Affix/);
  assert.match(ui,/Rare Behavior/);
  assert.match(ui,/Boss Phase/);
});

test('B8 does not alter Codex completion milestones or permanent rewards',()=>{
  assert.match(codex,/CODEX_MILESTONES/);
  assert.doesNotMatch(runtime,/CODEX_MILESTONES|codexBonuses|rareEncounterMult|allStatMult|dropMult|expMult/);
  assert.doesNotMatch(ui,/codexBonuses\s*=|CODEX_MILESTONES\.push/);
});
