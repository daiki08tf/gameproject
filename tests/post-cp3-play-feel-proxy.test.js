import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPostCp3PlayFeelProxyReport } from '../scripts/post-cp3-play-feel-proxy.js';

const report = buildPostCp3PlayFeelProxyReport();

test('post-CP3 feel proxy: each region offers three distinct singles and three optional pairs',()=>{
  assert.equal(report.regions.length,3);
  for(const region of report.regions){
    assert.equal(region.conditionCount,3,`${region.id} single count`);
    assert.equal(region.pairCount,3,`${region.id} pair count`);
    const signatures=region.conditionPrimaryKeys.map(keys=>[...keys].sort().join('+'));
    assert.equal(new Set(signatures).size,3,`${region.id} Conditions should test different pressure vectors`);
    assert.ok(signatures.every(Boolean),`${region.id} Conditions need a live pressure effect`);
  }
});

test('post-CP3 feel proxy: reward readability preserves 34 -> 38 -> 42 progression',()=>{
  for(const region of report.regions){
    assert.equal(region.baselineSteering,0.34);
    assert.equal(region.singleSteering,0.38);
    assert.equal(region.pairSteering,0.42);
  }
});

test('post-CP3 feel proxy: Apex remains a readable four-phase climax, not four full Deep Surveys stacked',()=>{
  assert.equal(report.apex.phaseCount,4);
  assert.deepEqual(report.apex.phaseOrder,['ash','ninth','root','convergence']);
  assert.ok(report.apex.phaseHps.every(hp=>hp>0));
  assert.ok(report.apex.totalHpVsMaxBaseline>=1.5,'Apex should feel materially longer than one baseline boss');
  assert.ok(report.apex.totalHpVsMaxBaseline<4,'Apex should not equal four full hardest bosses back-to-back');
  assert.equal(report.apex.mixedSteering,0.36);
  assert.equal(report.apex.finalCyclesReadable,true);
});

test('post-CP3 feel proxy: portrait controls keep compact two-column, thumb-sized semantics',()=>{
  assert.equal(report.mobile.conditionGridColumns,2);
  assert.ok(report.mobile.minTouchHeightPx>=42);
  assert.equal(report.mobile.pressedState,true);
  assert.equal(report.mobile.apexPhaseLabel,true);
});
