import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';import {COMBAT3_FORMATION} from '../js/patches/combat3Formation.js';
async function src(p){return readFile(new URL(`../${p}`,import.meta.url),'utf8');}
test('formation protects only caster/support backline',()=>{assert.deepEqual([...COMBAT3_FORMATION.BACKLINE_ROLES],['caster','support']);});
test('guardian protection is stronger than frontline screening',()=>{assert.ok(COMBAT3_FORMATION.GUARDIAN_INTERCEPT_CHANCE>COMBAT3_FORMATION.FRONTLINE_SCREEN_CHANCE);assert.ok(COMBAT3_FORMATION.GUARDIAN_INTERCEPT_CHANCE<1);});
test('single target picker can redirect guarded backline',async()=>{const s=await src('js/patches/combat3Formation.js');assert.match(s,/originalPick/);assert.match(s,/roleId\(e\)==='guardian'/);assert.match(s,/roleId\(e\)==='frontline'/);assert.match(s,/targetIntercept/);});
test('AoE and random target resolution remain outside intercept hook',async()=>{const b=await src('js/battleEngine.js');assert.match(b,/tech\.target === 'allEnemies'/);assert.match(b,/tech\.target === 'randomEnemies'/);});
test('formation patch loads after enemy roles are assigned',async()=>{const m=await src('js/main.js');assert.ok(m.indexOf('combat3Formation.js')>m.indexOf('combat3EnemyAI.js'));});
