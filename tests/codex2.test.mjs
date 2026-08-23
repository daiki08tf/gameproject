import test from 'node:test';
import assert from 'node:assert/strict';
import { CODEX_MILESTONES, codexEntryPoints, codexCompletion, codexBonuses } from '../js/data/codex.js';

test('Codex 2.0 milestones and permanent bonuses', () => {
  assert.equal(CODEX_MILESTONES.length, 7);
  assert.equal(codexEntryPoints({ seen:true, kills:1 }), 2);
  assert.equal(codexEntryPoints({ seen:true, kills:100, recruited:true, rare:true, legendary:true }), 7);

  const ids = ['grunt','fast'];
  const c = codexCompletion({ grunt:{ seen:true, kills:100, recruited:true, rare:true, legendary:true } }, ids);
  assert.equal(c.points, 7);
  assert.equal(c.maxPoints, 14);
  assert.equal(c.pct, 50);

  assert.equal(codexBonuses(24.9).allStatMult, 1);
  assert.equal(codexBonuses(25).allStatMult, 1.01);
  assert.equal(codexBonuses(50).dropMult, 1.05);
  assert.equal(codexBonuses(75).allStatMult, 1.02);
  assert.equal(codexBonuses(75).expMult, 1.10);
  assert.equal(codexBonuses(90).rareEncounterMult, 1.05);
  assert.equal(codexBonuses(100).complete, true);
});
