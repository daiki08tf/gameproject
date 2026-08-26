import test from 'node:test';
import assert from 'node:assert/strict';
import { ENDGAME_STORY_MEANINGS } from '../js/data/storyCanon.js';
import { WORLD_MYSTERY_SYSTEMS, ABYSS_MYSTERY_MILESTONES, worldMysteryClueForStage } from '../js/data/storyWorldMystery.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { buildWorld2KeyStage } from '../js/data/world2Stages.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { buildRaidStage } from '../js/data/raidBosses.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { EIGHTH_KEY_STAGES } from '../js/data/phase9EighthKey.js';
import { EFFECT_ARTIFACTS, RELICS } from '../js/data/artifacts.js';
import { UNIQUE_TRIALS, UNIQUE_TRIAL_STORY_CLUE } from '../js/data/uniqueTrials.js';
import { NEMESIS_STORY_CLUE } from '../js/data/nemesis3.js';
import { storyStartLines } from '../js/patches/story11CoreJourney.js';

test('Phase 11.4 gives existing systems one shared mystery vocabulary',()=>{
  const required=['abyss','worldTier','keyDungeon','secretRealm','nemesis','uniqueTrial','raid','machineWorld','artifact','relic','anomaly'];
  for(const id of required){
    const entry=WORLD_MYSTERY_SYSTEMS[id];
    assert.ok(entry,`missing ${id}`);
    assert.ok(entry.meaning?.length>=12,`${id} meaning too short`);
    assert.ok(entry.clue?.length>=12,`${id} clue too short`);
  }
  assert.equal(WORLD_MYSTERY_SYSTEMS.abyss.meaning,ENDGAME_STORY_MEANINGS.abyss);
  assert.equal(WORLD_MYSTERY_SYSTEMS.keyDungeon.meaning,ENDGAME_STORY_MEANINGS.keyDungeon);
  assert.equal(WORLD_MYSTERY_SYSTEMS.machineWorld.meaning,ENDGAME_STORY_MEANINGS.machineWorld);
});

test('Abyss mystery advances only at canonical long-term milestones',()=>{
  assert.deepEqual(ABYSS_MYSTERY_MILESTONES,[1,100,500,1000,2000,3000]);
  for(const depth of ABYSS_MYSTERY_MILESTONES)assert.ok(worldMysteryClueForStage(buildAbyssStage(depth)));
  for(const depth of [2,99,101,499,501,999,1001,1999,2001,2999])assert.equal(worldMysteryClueForStage(buildAbyssStage(depth)),null);
  assert.notEqual(worldMysteryClueForStage(buildAbyssStage(1)),worldMysteryClueForStage(buildAbyssStage(500)));
});

test('existing world systems resolve to distinct compact boundary observations',()=>{
  const anomaly=buildWorld2KeyStage('anomaly');
  const secret=buildSecretRealmStage('secret-blood-castle');
  const raid=buildRaidStage('raid-archeon');
  const machine1=buildMachineWorldStage('machine-world-1');
  const machineDeep=buildMachineWorldStage('machine-world-15');
  const eighth=buildSecretRealmStage(EIGHTH_KEY_STAGES[0].id);
  for(const stage of [anomaly,secret,raid,machine1,machineDeep,eighth])assert.ok(stage);
  assert.match(worldMysteryClueForStage(anomaly),/七鍵|座標/);
  assert.match(worldMysteryClueForStage(secret),/異界|世界片/);
  assert.match(worldMysteryClueForStage(raid),/別位相|再観測/);
  assert.match(worldMysteryClueForStage(machine1),/管理層|記録/);
  assert.match(worldMysteryClueForStage(machineDeep),/観測される側|観測番号/);
  assert.match(worldMysteryClueForStage(eighth),/第八鍵|管理系/);
});

test('modern-world anomaly stays unresolved before the dedicated reveal phase',()=>{
  const clue=worldMysteryClueForStage(buildWorld2KeyStage('anomaly'));
  for(const forbidden of ['東京','Tokyo','日本','現代世界'])assert.equal(clue.includes(forbidden),false);
});

test('Artifact, Relic, Unique Trial and Nemesis carry narrative meaning without new mechanics',()=>{
  assert.ok(EFFECT_ARTIFACTS.length>0&&EFFECT_ARTIFACTS.every(x=>x.storyClue===WORLD_MYSTERY_SYSTEMS.artifact.clue));
  assert.equal(RELICS.length,5);
  assert.ok(RELICS.every(x=>x.storyClue===WORLD_MYSTERY_SYSTEMS.relic.clue));
  assert.ok(Object.values(UNIQUE_TRIALS).every(x=>x.storyClue===UNIQUE_TRIAL_STORY_CLUE));
  assert.equal(NEMESIS_STORY_CLUE,WORLD_MYSTERY_SYSTEMS.nemesis.clue);
});

test('mystery integration uses the existing text battle log instead of a new story screen',()=>{
  const abyssMilestone=buildAbyssStage(100);
  const ordinaryAbyss=buildAbyssStage(101);
  const raid=buildRaidStage('raid-archeon');
  assert.ok(storyStartLines(abyssMilestone).some(line=>line.startsWith('【境界観測】')));
  assert.equal(storyStartLines(ordinaryAbyss).some(line=>line.startsWith('【境界観測】')),false);
  assert.ok(storyStartLines(raid).some(line=>line.startsWith('【境界観測】')));
});

test('reading a mystery clue cannot mutate stage rewards or progression metadata',()=>{
  const stage=buildWorld2KeyStage('celestial');
  const before=JSON.stringify({rewards:stage.rewards,recLevel:stage.recLevel,itemPowerTarget:stage.itemPowerTarget,dropMult:stage.dropMult});
  worldMysteryClueForStage(stage);
  const after=JSON.stringify({rewards:stage.rewards,recLevel:stage.recLevel,itemPowerTarget:stage.itemPowerTarget,dropMult:stage.dropMult});
  assert.equal(after,before);
});
