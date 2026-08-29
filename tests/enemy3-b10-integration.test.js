import assert from 'assert';
import { readFileSync } from 'fs';
import { enemy3WorldTierDecisionRank } from '../js/data/enemy3Targeting.js';

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

assert.match(
  mainSource,
  /function startAbyssBattle\(\)[\s\S]*?startBattle\(\);/,
  'Abyss must reuse the common battle entry point and therefore the Enemy 3 patch chain',
);
assert.match(
  mainSource,
  /function startBattle\(\)[\s\S]*?battle\.start\(stage\.id,/,
  'the common Ch1–30/endgame battle entry point must still start the shared BattleEngine',
);

assert.equal(enemy3WorldTierDecisionRank({ worldTier: 1 }), 0, 'World I must keep rank-0 behavior');
assert.equal(enemy3WorldTierDecisionRank({ worldTier: 6 }), 5, 'World VI must reach decision rank 5');
assert.equal(enemy3WorldTierDecisionRank({ isAbyss: true }), 0, 'Abyss without WT runtime must remain rank 0');
assert.match(
  worldTierSource,
  /if \(this\?\.isAbyss\) return enemy;/,
  'Abyss must remain excluded from World Tier spawn scaling',
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
