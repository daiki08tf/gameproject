import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD3_REGIONS, world3RegionForChapter } from '../js/data/world3Regions.js';

test('World regional hierarchy covers every implemented story chapter exactly once',()=>{
  const chapters=WORLD3_REGIONS.flatMap(r=>r.chapters);
  assert.equal(chapters.length,41);
  assert.deepEqual([...chapters].sort((a,b)=>a-b),Array.from({length:41},(_,i)=>i+1));
  assert.equal(new Set(chapters).size,41);
});

test('The Veil and later Story Regions remain ordered through Arc VII',()=>{
  const veil=WORLD3_REGIONS.find(r=>r.id==='veil');
  const outer=WORLD3_REGIONS.find(r=>r.id==='outer-world');
  const reverse=WORLD3_REGIONS.find(r=>r.id==='reverse-observation');
  const shared=WORLD3_REGIONS.find(r=>r.id==='shared-observation');
  const branch=WORLD3_REGIONS.find(r=>r.id==='branch-record');
  const stratum=WORLD3_REGIONS.find(r=>r.id==='stratum-band');
  assert.deepEqual(veil?.chapters,[16,17,18,19,20]);
  assert.deepEqual(outer?.chapters,[21,22,23,24,25]);
  assert.deepEqual(reverse?.chapters,[26,27,28,29,30]);
  assert.deepEqual(shared?.chapters,[31,32,33,34,35]);
  assert.deepEqual(branch?.chapters,[36,37,38,39]);
  assert.deepEqual(stratum?.chapters,[40,41]);
  assert.ok(WORLD3_REGIONS.indexOf(veil)<WORLD3_REGIONS.indexOf(outer));
  assert.ok(WORLD3_REGIONS.indexOf(outer)<WORLD3_REGIONS.indexOf(reverse));
  assert.ok(WORLD3_REGIONS.indexOf(reverse)<WORLD3_REGIONS.indexOf(shared));
  assert.ok(WORLD3_REGIONS.indexOf(shared)<WORLD3_REGIONS.indexOf(branch));
  assert.ok(WORLD3_REGIONS.indexOf(branch)<WORLD3_REGIONS.indexOf(stratum));
  assert.equal(world3RegionForChapter(20)?.id,'veil');
  assert.equal(world3RegionForChapter(25)?.id,'outer-world');
  assert.equal(world3RegionForChapter(30)?.id,'reverse-observation');
  assert.equal(world3RegionForChapter(31)?.id,'shared-observation');
  assert.equal(world3RegionForChapter(32)?.id,'shared-observation');
  assert.equal(world3RegionForChapter(33)?.id,'shared-observation');
  assert.equal(world3RegionForChapter(34)?.id,'shared-observation');
  assert.equal(world3RegionForChapter(35)?.id,'shared-observation');
  assert.equal(world3RegionForChapter(36)?.id,'branch-record');
  assert.equal(world3RegionForChapter(40)?.id,'stratum-band');
  assert.equal(world3RegionForChapter(41)?.id,'stratum-band');
});
