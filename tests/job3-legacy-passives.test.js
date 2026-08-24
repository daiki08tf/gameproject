import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { inheritedNodePayload, JOB3_LEGACY_SLOT_COUNT } from '../js/patches/job3LegacyPassives.js';

test('Job 3.0 provides exactly three inherited MASTER slots', () => {
  assert.equal(JOB3_LEGACY_SLOT_COUNT, 3);
});

test('inherited MASTER node is scaled to half strength', () => {
  const payload = inheritedNodePayload({
    name:'Test',
    statMult:{ atk:1.10, hp:1.08 },
    statAdd:{ critPct:6 },
    effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.12 },{ trigger:'onCrit', kind:'critExtraAttack', chance:0.20, power:0.50 }],
  }, 'warrior');
  assert.equal(payload.statMult.atk, 1.05);
  assert.equal(payload.statMult.hp, 1.04);
  assert.equal(payload.statAdd.critPct, 3);
  assert.equal(payload.effects[0].power, 0.06);
  assert.equal(payload.effects[1].chance, 0.10);
  assert.equal(payload.effects[1].power, 0.25);
});

test('legacy runtime explicitly suppresses inheritance from current Job', () => {
  const src = fs.readFileSync(new URL('../js/patches/job3LegacyPassives.js', import.meta.url), 'utf8');
  assert.ok(src.includes('if (jobId === this.currentJobId) continue'));
});

test('legacy passive layer loads after specialization core and before jobs screen', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const spec = main.indexOf("./patches/job3SpecializationCore.js");
  const legacy = main.indexOf("./patches/job3LegacyPassives.js");
  const screen = main.indexOf("./screens/jobs.js");
  assert.ok(spec > 0 && legacy > spec && screen > legacy);
});
