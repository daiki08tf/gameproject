import test from 'node:test';
import assert from 'node:assert/strict';
import { runVerticalExtensionAcceptance } from '../scripts/deep-survey-acceptance.js';

const TRIALS=5000;
const RATE_TOLERANCE=0.025;

const report=runVerticalExtensionAcceptance(TRIALS);

test('post-CP3 V5: baseline/single/double target steering stays at 34/38/42% contracts',()=>{
  for(const region of report.regions){
    assert.equal(region.scenarios.length,3);
    for(const scenario of region.scenarios){
      const {result,expectedTargetRate}=scenario;
      assert.equal(result.configuredTargetRate,expectedTargetRate,`${region.id}/${scenario.kind} configured target rate`);
      assert.ok(Math.abs(result.targetRate-expectedTargetRate)<=RATE_TOLERANCE,
        `${region.id}/${scenario.kind} observed ${(result.targetRate*100).toFixed(2)}% vs ${(expectedTargetRate*100).toFixed(0)}%`);
    }
  }
});

test('post-CP3 V5: Condition Legendary contribution stays within +4pp over each baseline profile',()=>{
  for(const region of report.regions){
    const baseline=region.scenarios.find(x=>x.kind==='baseline').result.legendaryChanceAdd;
    for(const scenario of region.scenarios){
      const add=scenario.result.legendaryChanceAdd-baseline;
      assert.ok(add>=-1e-9);
      assert.ok(add<=0.0400001,`${region.id}/${scenario.kind} Legendary add exceeded +4pp`);
    }
  }
});

test('post-CP3 V5: every scenario preserves max-three Options and Greater max-three',()=>{
  const results=[...report.regions.flatMap(r=>r.scenarios.map(s=>s.result)),report.apex];
  for(const result of results){
    assert.ok(result.maxOptions<=3,`${result.id} exceeded max-three Options`);
    assert.ok(result.maxGreater<=3,`${result.id} exceeded Greater max-three`);
    assert.equal(result.greaterMaxContract,3);
    assert.equal(result.option4Rate,1,`${result.id} emitted a non-canonical Option record`);
  }
});

test('post-CP3 V5: Smart Loot still leaves ordinary Fusion material and preferred families feed Fusion XP',()=>{
  const results=report.regions.flatMap(r=>r.scenarios.map(s=>s.result));
  for(const result of results){
    assert.ok(result.feedableRate>0.25,`${result.id} protected too much gear: ${result.feedableRate}`);
    assert.ok(result.fusionXp>0,`${result.id} produced no same-family Fusion XP`);
    assert.ok(Object.values(result.familyHits).every(n=>n>0),`${result.id} missed a preferred family entirely`);
  }
});

test('post-CP3 V5: Convergence Apex remains bounded mixed chase rather than guaranteed target loot',()=>{
  const apex=report.apex;
  assert.equal(apex.configuredTargetRate,0.36);
  assert.ok(Math.abs(apex.targetRate-0.36)<=RATE_TOLERANCE,`Apex observed ${(apex.targetRate*100).toFixed(2)}%`);
  assert.ok(apex.targetRate<0.50,'Apex target steering must remain non-guaranteed');
  assert.ok(apex.legendaryChanceAdd<=0.04);
  assert.ok(apex.feedableRate>0.25,'Apex must leave Fusion material');
  assert.ok(apex.fusionXp>0);
});

test('post-CP3 V5: Greater remains meaningful but bounded at IP10,000 boss pressure',()=>{
  const results=[...report.regions.flatMap(r=>r.scenarios.map(s=>s.result)),report.apex];
  for(const result of results){
    assert.ok(result.greaterItemRate>0.20,`${result.id} Greater item density unexpectedly vanished`);
    assert.ok(result.greaterItemRate<0.65,`${result.id} Greater item density became near-guaranteed`);
    assert.ok(result.greaterOptionRate>0.10&&result.greaterOptionRate<0.30,`${result.id} Greater option rate out of bounds`);
  }
});
