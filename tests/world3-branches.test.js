import test from 'node:test';
import assert from 'node:assert/strict';
import { EXPLORATION_SITES } from '../js/data/exploration1.js';
import { KEY_DUNGEON_TYPES } from '../js/data/world2.js';

test('World 3 branch layer keeps key dungeons and secret realms as distinct discovery sources',()=>{
  assert.equal(Object.keys(KEY_DUNGEON_TYPES).length,4);
  assert.ok(EXPLORATION_SITES.length>=2);
  assert.ok(EXPLORATION_SITES.some(site=>site.realm?.id==='secret-blood-castle'));
  assert.ok(EXPLORATION_SITES.some(site=>site.finalGoal));
});
