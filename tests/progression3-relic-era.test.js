import test from 'node:test';
import assert from 'node:assert/strict';
import { RELICS } from '../js/data/artifacts.js';
import { abyssRecommendedLevel, abyssTargetItemPower } from '../js/data/abyssEndgame.js';

test('Relics form ordered Abyss-era build milestones',()=>{
  const expectedDepths=[1,100,500,1000,2000];
  assert.equal(RELICS.length,5);
  assert.deepEqual(RELICS.map(r=>r.abyssDepthRequired),expectedDepths);
  for(const relic of RELICS){
    assert.ok(relic.kind,'Relic must remain a build-rule effect');
    assert.ok(relic.progressionEra,'Relic must name its progression era');
    assert.ok(abyssRecommendedLevel(relic.abyssDepthRequired)>=3000);
    assert.ok(abyssTargetItemPower(relic.abyssDepthRequired)>=3000);
  }
});

test('Relic milestone strength targets rise with long-term progression',()=>{
  let prevLv=0,prevIp=0;
  for(const relic of RELICS){
    const lv=abyssRecommendedLevel(relic.abyssDepthRequired);
    const ip=abyssTargetItemPower(relic.abyssDepthRequired);
    assert.ok(lv>prevLv);
    assert.ok(ip>prevIp);
    prevLv=lv; prevIp=ip;
  }
});
