import test from 'node:test';
import assert from 'node:assert/strict';
import { SECRET_JOB_PHASE2, secretJobPhase2 } from '../js/data/secretJobPhase2.js';

const ORIGINAL=['secret_spellblade','secret_darkknight','secret_necromancer','secret_beastlord','secret_executioner'];

test('all secret jobs with Phase 2 identities have complete growth and combat definitions',()=>{
  assert.ok(Object.keys(SECRET_JOB_PHASE2).length>=5);
  for(const [id,def] of Object.entries(SECRET_JOB_PHASE2)){
    assert.equal(secretJobPhase2(id),def);
    for(const k of ['hp','mp','atk','def','mag','mdef','spd']) assert.ok(Number.isFinite(def.growth[k]),`${id}:${k}`);
    assert.ok(def.techniques.length>=3,id);
    assert.ok(Object.keys(def.rules).length>0,id);
  }
  assert.ok(ORIGINAL.every(id=>SECRET_JOB_PHASE2[id]));
});

test('original secret jobs specialize in intentionally different permanent growth',()=>{
  assert.ok(SECRET_JOB_PHASE2.secret_spellblade.growth.mag>SECRET_JOB_PHASE2.secret_spellblade.growth.def);
  assert.ok(SECRET_JOB_PHASE2.secret_darkknight.growth.hp>SECRET_JOB_PHASE2.secret_darkknight.growth.mag);
  assert.ok(SECRET_JOB_PHASE2.secret_necromancer.growth.mdef>SECRET_JOB_PHASE2.secret_executioner.growth.mdef);
  assert.ok(SECRET_JOB_PHASE2.secret_executioner.growth.atk>SECRET_JOB_PHASE2.secret_executioner.growth.mag);
});
