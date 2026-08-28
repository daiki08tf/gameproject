import assert from 'node:assert/strict';
import { ENDGAME_LOOT_ROLES, endgameLootRole, endgameLootRolesForLevel, compactEndgameLootRoleSummary } from '../js/data/endgameLootRoles.js';
import { buildEndgameGuidance } from '../js/data/endgameGuidance.js';

assert.deepEqual(ENDGAME_LOOT_ROLES.map(x=>x.id), ['abyss','rift','nemesis','secret_realm']);
for(const role of ENDGAME_LOOT_ROLES){
  assert.ok(role.label);
  assert.ok(role.short);
  assert.ok(role.primary);
  assert.ok(role.secondary);
  assert.ok(role.avoid);
  assert.equal(endgameLootRole(role.id), role);
}

assert.deepEqual(endgameLootRolesForLevel(2999), []);
assert.deepEqual(endgameLootRolesForLevel(3000).map(x=>x.id), ['abyss','rift','nemesis']);
assert.deepEqual(endgameLootRolesForLevel(10000).map(x=>x.id), ['abyss','rift','nemesis','secret_realm']);

const low=buildEndgameGuidance({level:2000,abyssUnlocked:true});
assert.equal(low.lootRoleSummary, '');
assert.deepEqual(low.lootRoles, []);

const mid=buildEndgameGuidance({level:5000,abyssUnlocked:true});
assert.match(mid.lootRoleSummary,/深淵:Option \/ 生装備/);
assert.match(mid.lootRoleSummary,/Rift:Greater \/ Ancient/);
assert.match(mid.lootRoleSummary,/Nemesis \/ EX:宿敵 \/ 敵テーマ/);
assert.doesNotMatch(mid.lootRoleSummary,/Secret Realm/);

const high=buildEndgameGuidance({level:20000,abyssUnlocked:true});
assert.equal(high.lootRoles.length,4);
assert.match(high.lootRoleSummary,/Secret Realm:Named \/ Build Identity/);

const blocked=buildEndgameGuidance({level:20000,abyssUnlocked:false});
assert.equal(blocked.lootRoleSummary,'');
assert.deepEqual(blocked.lootRoles,[]);

assert.equal(compactEndgameLootRoleSummary(99999).split(' / ').length>=4,true);

console.log('Gear Overhaul Phase 9B activity-role tests passed');
