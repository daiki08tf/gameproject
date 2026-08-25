import test from 'node:test';
import assert from 'node:assert/strict';
import { FUSION_COMBAT_IDENTITIES, fusionCombatIdentity, auditFusionCombatIdentities } from '../js/data/fusionCombatIdentity.js';

test('all 105 Fusion Jobs have combat identities',()=>{const a=auditFusionCombatIdentities();assert.equal(a.ok,true);assert.equal(a.count,105);});
test('every Fusion identity has gauge trait command and mastery',()=>{for(const x of FUSION_COMBAT_IDENTITIES){assert.ok(x.gauge);assert.ok(x.trait);assert.ok(x.command);assert.ok(x.mastery);assert.equal(x.command.cost,100);assert.equal(x.mastery.level,50);}});
test('representative jobs combine both parent identities',()=>{const merc=fusionCombatIdentity('fusion_warrior_merchant');assert.deepEqual(merc.command.effects,['break','supply']);const ruin=fusionCombatIdentity('fusion_thief_scholar');assert.deepEqual(ruin.command.effects,['crit','analysis']);});
