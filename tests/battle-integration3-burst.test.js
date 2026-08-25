import test from 'node:test';
import assert from 'node:assert/strict';
import { breakDamage } from '../js/data/battle2Tactics.js';

test('status combos amplify Break damage',()=>{
  const base=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1});
  const wildfire=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1,combo:'wildfire'});
  const shock=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1,combo:'shock'});
  const necrosis=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1,combo:'necrosis'});
  assert.ok(wildfire>base);
  assert.ok(necrosis>wildfire);
  assert.ok(shock>necrosis);
});

test('weakness and shatter reward tactical setup',()=>{
  const normal=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1});
  const weak=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1.25});
  const resist=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:.8});
  const shatter=breakDamage({damage:100,maxHp:1000,capacity:50,elementMultiplier:1,physical:true,frosted:true,combo:'shatter'});
  assert.ok(weak>normal);
  assert.ok(normal>resist);
  assert.ok(shatter>weak);
});
