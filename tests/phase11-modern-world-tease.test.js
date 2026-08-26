import test from 'node:test';
import assert from 'node:assert/strict';
import { MODERN_WORLD_TEASES, modernWorldTeaseForStage } from '../js/data/storyModernWorldTease.js';
import { worldMysteryClueForStage } from '../js/data/storyWorldMystery.js';
import { buildMachineWorldStage } from '../js/data/phase9MachineWorldStages.js';
import { buildWorld2KeyStage } from '../js/data/world2Stages.js';
import { storyStartLines } from '../js/patches/story11CoreJourney.js';

test('Modern World tease uses six ordered clue types without naming the destination',()=>{
  assert.equal(MODERN_WORLD_TEASES.length,6);
  assert.deepEqual(MODERN_WORLD_TEASES.map(x=>x.order),[1,2,3,4,5,6]);
  const kinds=new Set(MODERN_WORLD_TEASES.map(x=>x.kind));
  for(const kind of ['signal','architecture','lights','sound','device-date','writing'])assert.ok(kinds.has(kind),`missing ${kind}`);
  const text=MODERN_WORLD_TEASES.map(x=>x.clue).join(' ');
  for(const forbidden of ['東京','Tokyo','日本','Japan','現代世界'])assert.equal(text.includes(forbidden),false);
});

test('clue ladder moves from anomaly signal into late Machine World sensory evidence',()=>{
  const anomaly=buildWorld2KeyStage('anomaly');
  const stages=[11,12,13,14,15].map(n=>buildMachineWorldStage(`machine-world-${n}`));
  assert.ok(anomaly&&stages.every(Boolean));
  assert.match(modernWorldTeaseForStage(anomaly)?.clue||'',/電波|情報/);
  assert.match(worldMysteryClueForStage(stages[0]),/高層|窓/);
  assert.match(worldMysteryClueForStage(stages[1]),/赤・青・白|直線/);
  assert.match(worldMysteryClueForStage(stages[2]),/金属輪|電子音/);
  assert.match(worldMysteryClueForStage(stages[3]),/20██\/0█\/2█|発光端末/);
  assert.match(worldMysteryClueForStage(stages[4]),/「駅」「線」|暮らす世界/);
});

test('final Machine World clue preserves the observer reveal while adding the strongest tease',()=>{
  const finalStage=buildMachineWorldStage('machine-world-15');
  const clue=worldMysteryClueForStage(finalStage);
  assert.match(clue,/観測される側|観測番号/);
  assert.match(clue,/駅|線/);
});

test('teases use the existing compact battle observation route',()=>{
  const stage=buildMachineWorldStage('machine-world-14');
  const lines=storyStartLines(stage);
  const observation=lines.find(line=>line.startsWith('【境界観測】'));
  assert.ok(observation);
  assert.match(observation,/年月日|発光端末/);
  assert.ok(observation.length<190,'modern-world observation became a text wall');
});

test('Modern World tease does not mutate combat progression reward or save-facing stage data',()=>{
  const stage=buildMachineWorldStage('machine-world-15');
  const before=JSON.stringify({
    id:stage.id,recLevel:stage.recLevel,itemPowerTarget:stage.itemPowerTarget,
    rewards:stage.rewards,waves:stage.waves,dropTable:stage.dropTable,requires:stage.requires,
  });
  worldMysteryClueForStage(stage);
  modernWorldTeaseForStage(stage);
  const after=JSON.stringify({
    id:stage.id,recLevel:stage.recLevel,itemPowerTarget:stage.itemPowerTarget,
    rewards:stage.rewards,waves:stage.waves,dropTable:stage.dropTable,requires:stage.requires,
  });
  assert.equal(after,before);
});
