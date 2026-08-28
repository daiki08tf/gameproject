import test from 'node:test';
import assert from 'node:assert/strict';
import { runDeepSurveyAcceptance } from '../scripts/deep-survey-acceptance.js';

test('Deep Survey acceptance keeps target farming useful without starving Fusion materials', () => {
  for (const result of runDeepSurveyAcceptance(10000)) {
    assert.ok(result.targetRate > 0.30 && result.targetRate < 0.38, `${result.id}: target rate ${(result.targetRate * 100).toFixed(2)}%`);
    assert.ok(result.feedableRate > 0.70, `${result.id}: feedable rate ${(result.feedableRate * 100).toFixed(2)}%`);
    assert.ok(result.feedableRate < 0.99, `${result.id}: premium protection disappeared`);
    assert.ok(result.ancientItemRate > 0 && result.ancientItemRate < 0.30, `${result.id}: Ancient rate ${(result.ancientItemRate * 100).toFixed(2)}%`);
    assert.equal(result.option4Rate, 1, `${result.id}: every simulated Option must remain Option 4.0`);
    assert.ok(result.maxOptions <= 3, `${result.id}: max Options ${result.maxOptions}`);
    assert.ok(result.fusionXp > 0, `${result.id}: preferred families must produce Fusion XP`);
    for (const [familyId, hits] of Object.entries(result.familyHits)) {
      assert.ok(hits > 100, `${result.id}: ${familyId} lacks repeatable material supply (${hits})`);
    }
  }
});
