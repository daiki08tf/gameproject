import test from 'node:test';
import assert from 'node:assert/strict';
import { representativeEnemy2Audit, sourceAudit } from '../scripts/enemy2-e0-audit.js';

function allResolved(snapshot) {
  return snapshot.waves.every(w => !w.enemy.missing);
}

test('Enemy 2.0 E0: representative story stages resolve through current fixed-wave enemy registry', () => {
  const audit = representativeEnemy2Audit();
  assert.ok(audit.chapterCount >= 30);
  assert.ok(audit.enemyTypeCount > 0);
  assert.equal(audit.story.length, 4);
  for (const stage of audit.story) {
    assert.ok(stage.recLevel >= 1);
    assert.ok(stage.waves.length >= 1);
    assert.ok(allResolved(stage), `${stage.id} contains an unresolved enemy type`);
    for (const wave of stage.waves) {
      for (const stat of ['hp','atk','def','speed','xp','gold']) {
        assert.ok(Number.isFinite(wave.enemy[stat]), `${stage.id}/${wave.type} missing ${stat}`);
      }
    }
  }
});

test('Enemy 2.0 E0: story enemy generation still centers on normal/fast/tank roles before migration', () => {
  const audit = representativeEnemy2Audit();
  const storyTypes = audit.story.flatMap(stage => stage.waves.map(w => w.type));
  assert.ok(storyTypes.some(type => type === 'grunt' || type.endsWith('_normal')));
  assert.ok(storyTypes.some(type => type.endsWith('_fast')));
  assert.ok(storyTypes.some(type => type.endsWith('_tank')));
});

test('Enemy 2.0 E0: Abyss remains a dynamic ENEMY_TYPES producer with its own reward identity', () => {
  const audit = representativeEnemy2Audit();
  assert.equal(audit.abyss.isAbyss, true);
  assert.ok(audit.abyss.recLevel >= 1);
  assert.ok(allResolved(audit.abyss));
  assert.ok(audit.abyss.waves.every(w => w.type.startsWith('abyss_1200_')));
});

test('Enemy 2.0 E0: Deep Survey remains Secret Realm content rather than ordinary Abyss content', () => {
  const audit = representativeEnemy2Audit();
  assert.equal(audit.deepSurvey.secretRealm, true);
  assert.equal(audit.deepSurvey.isAbyss, false);
  assert.equal(audit.deepSurvey.recLevel, 99999);
  assert.ok(allResolved(audit.deepSurvey));
});

test('Enemy 2.0 E0: current generic elite flag is coupled to Abyss Shard rewards and must not be reused blindly', () => {
  const { battle } = sourceAudit();
  assert.match(battle, /if \(enemy\.elite\) state\.addAbyssShards\(ABYSS_EXPANSION_LAYER\.ELITE_SHARD_DROP\)/);
  assert.match(battle, /if \(this\.stage\.isAbyss && !t\.boss\)/);
});

test('Enemy 2.0 E0: fixed waves remain the migration fallback and endgame builders remain explicit', () => {
  const { stages, abyss, realms } = sourceAudit();
  assert.match(stages, /waves:/);
  assert.match(stages, /buildAbyssStage/);
  assert.match(stages, /buildSecretRealmStage/);
  assert.match(abyss, /ENEMY_TYPES\[ids\[k\]\]=scaled/);
  assert.match(realms, /buildDeepSurveyStage|buildConvergenceApexStage/);
});
