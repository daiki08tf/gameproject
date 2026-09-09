import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { COMPANION_TACTICS } from '../js/data/battle2Tactics.js';

test('companion tactics provide four bounded player directives',()=>{assert.deepEqual(Object.keys(COMPANION_TACTICS),['balanced','assault','defense','support']);});
test('Battle 2.0 completion loads after companion battle integration',()=>{const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');assert.ok(main.indexOf("./patches/companionBattle.js")<main.indexOf("./patches/battle2RoadmapComplete.js"));});
// Break/stagger gauge and elemental combos (wildfire/shock/necrosis/shatter)
// removed (user decision 2026-09-08) -- guard against reintroduction.
test('Break gauge and elemental combo system stay removed',()=>{
  const data=fs.readFileSync(new URL('../js/data/battle2Tactics.js',import.meta.url),'utf8');
  const patch=fs.readFileSync(new URL('../js/patches/battle2RoadmapComplete.js',import.meta.url),'utf8');
  assert.doesNotMatch(data,/BREAK_RULES|breakCapacity|breakDamage|comboForHit/);
  assert.doesNotMatch(patch,/breakGauge|breakMax|combat2BrokenTurns|combat2Statuses/);
});
