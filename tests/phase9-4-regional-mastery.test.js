import test from 'node:test';
import assert from 'node:assert/strict';
import { PHASE9_REGIONAL_MASTERY } from '../js/data/phase9RegionalMastery.js';
import { CHAPTERS } from '../js/data/stages.js';
import '../js/patches/phase9RegionalExplorationRuntime.js';
import { state } from '../js/state.js';
import '../js/patches/phase9RegionalMasteryRuntime.js';

test('Phase 9.4 defines five distinct region facilities and permanent rewards',()=>{
  assert.deepEqual(Object.keys(PHASE9_REGIONAL_MASTERY),['ch21','ch22','ch23','ch24','ch25']);
  assert.equal(new Set(Object.values(PHASE9_REGIONAL_MASTERY).map(x=>x.facility.id)).size,5);
  assert.equal(new Set(Object.values(PHASE9_REGIONAL_MASTERY).map(x=>x.hiddenStage)).size,5);
  assert.equal(PHASE9_REGIONAL_MASTERY.ch24.bonus.recruitChanceBonus,0.02);
  assert.equal(PHASE9_REGIONAL_MASTERY.ch25.bonus.nextWorld,true);
});

test('regional mastery requires all exploration to reach and clear the hidden boss',()=>{
  const original=state.isStageCleared;
  const cleared=new Set(['21-X1','21-X2','21-X3']);
  state.isStageCleared=id=>cleared.has(id);
  try{
    let m=state.phase9RegionMastery('ch21');
    assert.equal(m.explored,3);
    assert.equal(m.mastered,false);
    cleared.add('21-B');
    m=state.phase9RegionMastery('ch21');
    assert.equal(m.mastered,true);
    assert.equal(m.facilityUnlocked,true);
  }finally{state.isStageCleared=original;}
});

test('all five region masteries aggregate into the intended character and ranch bonuses',()=>{
  const original=state.isStageCleared;
  state.isStageCleared=id=>/^(21|22|23|24|25)-(X[123]|B)$/.test(id);
  try{
    const b=state.phase9RegionalBonuses();
    assert.equal(b.atk,0.03);assert.equal(b.mag,0.03);assert.equal(b.spd,0.03);assert.equal(b.hp,0.03);assert.equal(b.def,0.03);
    assert.equal(b.recruitChanceBonus,0.02);
    assert.equal(b.nextWorld,true);
    assert.equal(state.phase9NextWorldUnlocked(),true);
  }finally{state.isStageCleared=original;}
});

test('chapters 21-25 retain the exploration-to-hidden-boss content chain',()=>{
  for(let n=21;n<=25;n++){
    const ch=CHAPTERS.find(x=>x.num===n),routes=ch.stages.filter(s=>s.phase9Exploration);
    assert.equal(routes.length,3);
    assert.equal(ch.stages.find(s=>s.id===`${n}-B`).requires,`${n}-X3`);
  }
});
