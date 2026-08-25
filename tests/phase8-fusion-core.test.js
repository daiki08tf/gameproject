import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_FUSION_JOBS,
  LEGACY_FUSION_JOBS,
  NEW_FUSION_JOBS,
  getFusionJob,
  validateFusionDefinitions,
} from '../js/data/jobFusion.js';
import { FUSION_JOBS, getFusionJobByParents, fusionRegistryAudit } from '../js/data/jobFusionRegistry.js';
import { fusionConstellationFor } from '../js/data/fusionConstellation.js';

test('Phase 8 catalog contains exactly 105 unique pairs: 30 legacy + 75 new', () => {
  assert.equal(ALL_FUSION_JOBS.length, 105);
  assert.equal(LEGACY_FUSION_JOBS.length, 30);
  assert.equal(NEW_FUSION_JOBS.length, 75);
  const audit = validateFusionDefinitions();
  assert.equal(audit.ok, true, audit.errors.join('\n'));
  assert.deepEqual(audit.counts, { ids: 105, pairs: 105, names: 105, legacy: 30, new: 75 });
  assert.equal(FUSION_JOBS.length, 105);
  assert.equal(fusionRegistryAudit().ok, true);
});

test('legacy IDs survive while canonical Phase 8 names are exposed', () => {
  assert.equal(getFusionJob('warrior', 'fighter').id, 'battlemaster');
  assert.equal(getFusionJob('warrior', 'fighter').name, '羅刹');
  assert.equal(getFusionJobByParents('mage', 'priest').id, 'sage');
  assert.equal(getFusionJobByParents('warrior', 'thief').id, 'swordsaint2');
  assert.equal(getFusionJobByParents('thief', 'merchant').id, 'treasurehunter');
  assert.equal(getFusionJobByParents('thief', 'merchant').name, 'トレジャーハンター');
});

test('new audited pairs have deterministic IDs and no name collision', () => {
  const ruins = getFusionJobByParents('thief', 'scholar');
  assert.equal(ruins.id, 'fusion_thief_scholar');
  assert.equal(ruins.name, '遺物探究家');
  assert.equal(getFusionJobByParents('warrior', 'merchant').name, '傭兵団長');
  assert.equal(getFusionJobByParents('merchant', 'ninja').name, '影商人');
  assert.equal(getFusionJobByParents('priest', 'merchant').name, '聖務官');
});

test('every Fusion Job gets two exclusive specialization paths and one shared Ultimate', () => {
  for (const fusion of FUSION_JOBS) {
    const nodes = fusionConstellationFor(fusion.id);
    assert.equal(nodes.length, 6, fusion.id);
    const trait = nodes.filter(n => n.kind === 'fusionTrait');
    const paths = nodes.filter(n => n.kind === 'fusionSpecialization');
    const keys = nodes.filter(n => n.kind === 'fusionKeystone');
    const ult = nodes.filter(n => n.kind === 'fusionUltimate');
    assert.equal(trait.length, 1, fusion.id);
    assert.equal(paths.length, 2, fusion.id);
    assert.equal(keys.length, 2, fusion.id);
    assert.equal(ult.length, 1, fusion.id);
    assert.equal(paths[0].exclusiveGroup, paths[1].exclusiveGroup, fusion.id);
    assert.equal(ult[0].requiresAny.length, 2, fusion.id);
    assert.ok(ult[0].requiresAny.includes(keys[0].id), fusion.id);
    assert.ok(ult[0].requiresAny.includes(keys[1].id), fusion.id);
  }
});

test('old three-node purchase IDs remain represented after branch expansion', () => {
  for (const fusion of FUSION_JOBS) {
    const ids = new Set(fusionConstellationFor(fusion.id).map(n => n.id));
    assert.ok(ids.has(`${fusion.id}_trait`), fusion.id);
    assert.ok(ids.has(`${fusion.id}_keystone`), fusion.id);
    assert.ok(ids.has(`${fusion.id}_ultimate`), fusion.id);
  }
});
