import test from 'node:test';
import assert from 'node:assert/strict';
import { WORLD3_REGIONS, world3RegionForChapter } from '../js/data/world3Regions.js';

test('World 3.0 regions cover chapters 1 through 20 exactly once',()=>{
  const chapters=WORLD3_REGIONS.flatMap(r=>r.chapters);
  assert.equal(chapters.length,20);
  assert.deepEqual([...chapters].sort((a,b)=>a-b),Array.from({length:20},(_,i)=>i+1));
  assert.equal(new Set(chapters).size,20);
});

test('The Veil is the final regional block',()=>{
  const veil=WORLD3_REGIONS.at(-1);
  assert.equal(veil.id,'veil');
  assert.deepEqual(veil.chapters,[16,17,18,19,20]);
  assert.equal(world3RegionForChapter(20)?.id,'veil');
});
