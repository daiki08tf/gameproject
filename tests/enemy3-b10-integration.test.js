import assert from 'assert';
import { readFileSync } from 'fs';
import { enemy3WorldTierAiPolicy } from '../js/data/enemy3WorldTierAI.js';

const mainSource = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
const completeSource = readFileSync(new URL('../js/patches/battle2RoadmapComplete.js', import.meta.url), 'utf8');
const targetingSource = readFileSync(new URL('../js/patches/enemy3Targeting.js', import.meta.url), 'utf8');
const worldTierSource = readFileSync(new URL('../js/patches/worldTierRuntime.js', import.meta.url), 'utf8');
const roadmapSource = readFileSync(new URL('../ENEMY_3_BEHAVIOR_ECOLOGY_ROADMAP.md', import.meta.url), 'utf8');

assert.match(
  mainSource,
  /import ['"]\.\/patches\/battle2RoadmapComplete\.js['"];/,
  'main must globally install the Battle 2/Enemy 3 patch chain before battles are created',
);

const rankIndex = completeSource.indexOf("import './enemy2RankVariants.js';");
const storyIndex = completeSource.indexOf("import './enemy2StoryMigration.js';");
const roleIndex = completeSource.indexOf("import './enemy3RoleAi.js';");
const targetingIndex = completeSource.indexOf("import './enemy3Targeting.js';");
assert.ok(rankIndex >= 0 && rankIndex < roleIndex, 'Enemy 2 rank identity must resolve before Enemy 3 role AI');
assert.ok(storyIndex >= 0 && storyIndex < roleIndex, 'Ch1–30 migration must resolve before Enemy 3 role AI');
assert.ok(roleIndex >= 0 && roleIndex < targetingIndex, 'B1 role bridge must install before B2+ targeting');

for (const modulePath of [
  './enemy3EliteAffixes.js',
  './enemy3RareBehaviors.js',
  './enemy3EncounterSynergy.js',
  './enemy3BossPhaseAI.js',
  './enemy3CodexAnalysis.js',
]) {
  assert.ok(
    targetingSource.includes(`import '${modulePath}';`),
    `${modulePath} must stay on the globally installed Enemy 3 chain`,
  );
}

// There is no separate Abyss battle engine. goAbyssList()'s stage callback
// sets the same pendingStage used by goStageSelect(), and both routes end at
// the single confirmStartBtn handler that calls the one shared startBattle().
assert.match(
  mainSource,
  /function goAbyssList\(\)\{renderAbyssList\(stage=>\{cameFromAbyss=true;pendingStage=stage;renderStageConfirm\(stage\);showScreen\('stageConfirmScreen'\);\}\);showScreen\('abyssScreen'\);\}/,
  'Abyss stage selection must set pendingStage and route through the shared stage-confirm screen, not a separate Abyss battle flow',
);
assert.match(
  mainSource,
  /document\.getElementById\('confirmStartBtn'\)\.addEventListener\('click',\(\)=>\{Audio_\.tap\(\);startBattle\(pendingStage,getSelectedBlessingId\(\)\);\}\)/,
  'Ch1–30 and Abyss stages must launch through the same confirmStartBtn -> startBattle(pendingStage, ...) call',
);
assert.equal(
  (mainSource.match(/function startBattle\(/g) || []).length,
  1,
  'there must be exactly one startBattle definition — no second, Abyss-specific battle engine',
);
assert.match(
  mainSource,
  /function startBattle\(stage,blessingId\)\{[\s\S]*?battle\.start\(stage\.id,/,
  'the single shared battle entry point must still start the shared BattleEngine',
);

assert.equal(enemy3WorldTierAiPolicy(0).attackerExecuteHp, 0.35, 'World I must keep rank-0 behavior (existing B9 contract)');
assert.equal(enemy3WorldTierAiPolicy(5).attackerExecuteHp, 0.45, 'World VI must reach decision rank 5 (existing B9 contract)');
assert.equal(
  enemy3WorldTierAiPolicy(undefined).attackerExecuteHp,
  0.35,
  'Abyss engines never receive engine.worldTier, so the policy must resolve the same as rank 0',
);

const isAbyssGuardIndex = worldTierSource.indexOf('if(this.stage?.isAbyss)return enemy;');
const worldTierAssignIndex = worldTierSource.indexOf('this.worldTier=tier;');
assert.ok(
  isAbyssGuardIndex >= 0 && worldTierAssignIndex >= 0 && isAbyssGuardIndex < worldTierAssignIndex,
  'Abyss must return before engine.worldTier is ever assigned, so Enemy 3 tactical context always resolves rank 0 for Abyss',
);

const behaviorSources = [
  '../js/patches/enemy3RoleAi.js',
  '../js/patches/enemy3Targeting.js',
  '../js/patches/enemy3EliteAffixes.js',
  '../js/patches/enemy3RareBehaviors.js',
  '../js/patches/enemy3EncounterSynergy.js',
  '../js/patches/enemy3BossPhaseAI.js',
].map(path => readFileSync(new URL(path, import.meta.url), 'utf8')).join('\n');
assert.doesNotMatch(
  behaviorSources,
  /addAbyssShards|_grantKillRewards|gainGold|gainExp/,
  'Enemy 3 behavior integration must not own rewards or Abyss shard semantics',
);

assert.match(roadmapSource, /- \[x\] B10 — Ch1–30 \+ Endgame Integration/, 'B10 roadmap must be complete');

console.log('Enemy 3.0 B10 integration tests passed');
