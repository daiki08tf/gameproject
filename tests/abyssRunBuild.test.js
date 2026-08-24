import assert from 'node:assert/strict';
import { abyssRunBoonChoices, abyssRunSynergies, aggregateAbyssRunEffects } from '../js/data/abyssRunBuild.js';

const a=abyssRunBoonChoices(100,0,{}),b=abyssRunBoonChoices(100,0,{});
assert.equal(a.length,3);
assert.deepEqual(a.map(x=>x.id),b.map(x=>x.id),'choices must be deterministic');
assert.equal(new Set(a.map(x=>x.id)).size,3,'choices must be unique');

const ranks={thunder_edge:2,blood_oath:2};
assert.ok(abyssRunSynergies(ranks).some(x=>x.id==='storm_blood'));
const e=aggregateAbyssRunEffects(ranks);
assert.ok(e.damageAdd>=0.12);
assert.ok(e.atkMultAdd>=0.14);
assert.ok(e.critExtraChance>=0.12);
assert.ok(e.healOnKill>=0.07);

console.log('abyssRunBuild tests passed');
