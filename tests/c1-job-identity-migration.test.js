import test from 'node:test';
import assert from 'node:assert/strict';
import { allJobs } from '../js/data/jobs.js';
import { ALL_FUSION_JOBS } from '../js/data/jobFusion.js';
import { BattleEngine } from '../js/battleEngine.js';
import { readFileSync } from 'node:fs';
import {
  C1_JOB_IDENTITIES,
  C1_LEGACY_JOB_MIGRATION,
  C1_RUNTIME_JOBS,
  c1MigrationAudit,
  c1MigrationTargetForLegacyJob,
  migrateC1JobSave,
} from '../js/data/jobIdentityMigration.js';

test('C1 keeps ten tactical identities, each with a concrete loop', () => {
  assert.equal(C1_JOB_IDENTITIES.length, 10);
  for (const job of C1_JOB_IDENTITIES) assert.ok(job.loop.length > 0, job.id);
});

test('every persisted legacy job id has one valid C1 migration destination', () => {
  const audit = c1MigrationAudit();
  assert.equal(audit.ok, true, JSON.stringify(audit));
  assert.equal(audit.legacyJobCount, 131);
  assert.equal(audit.fusionJobCount, 105);
  assert.equal(audit.mappedJobCount, 131);
  for (const job of allJobs()) assert.ok(c1MigrationTargetForLegacyJob(job.id), job.id);
});

test('all 105 fusion ids remain explicitly migratable before their UI is removed', () => {
  for (const fusion of ALL_FUSION_JOBS) {
    assert.ok(C1_LEGACY_JOB_MIGRATION[fusion.id], fusion.id);
  }
});

test('basic and special save anchors migrate to their intended tactical loops', () => {
  assert.equal(c1MigrationTargetForLegacyJob('craftsman'), 'c1_bastion');
  assert.equal(c1MigrationTargetForLegacyJob('scholar'), 'c1_elementalist');
  assert.equal(c1MigrationTargetForLegacyJob('battlemaster'), 'c1_vanguard');
  assert.equal(c1MigrationTargetForLegacyJob('greatsage'), 'c1_elementalist');
  assert.equal(c1MigrationTargetForLegacyJob('hero'), 'c1_vanguard');
});

test('C1 save migration keeps legacy records while activating one non-colliding curated job', () => {
  const migrated = migrateC1JobSave({ currentJobId:'battlemaster', jobs:{ warrior:{level:16,exp:4}, battlemaster:{level:22,exp:9} }, mastered:['warrior','battlemaster'], job3Specializations:{ battlemaster:'sword_blademaster' }, job3LegacySlots:['warrior','battlemaster'] });
  assert.equal(migrated.currentJobId, 'c1_vanguard');
  assert.deepEqual(migrated.jobs.battlemaster, {level:22,exp:9});
  assert.deepEqual(migrated.jobs.c1_vanguard, {level:22,exp:9});
  assert.ok(migrated.mastered.includes('c1_vanguard'));
  assert.equal(migrated.job3Specializations.c1_vanguard, 'sword_blademaster');
  assert.deepEqual(migrated.job3LegacySlots, ['c1_bastion','c1_vanguard']);
  assert.equal(C1_RUNTIME_JOBS.length, 10);
});

test('C1 starter combat loops reuse the established guard, mark and detonation authority', () => {
  const byId = new Map(C1_RUNTIME_JOBS.map((job) => [job.id, job]));
  const skillIds = (id) => new Set(byId.get(id).skills.map((skill) => skill.id));
  assert.deepEqual([...skillIds('c1_bastion')].filter((id) => ['craftsman_parry','craftsman_counter'].includes(id)), ['craftsman_parry','craftsman_counter']);
  assert.deepEqual([...skillIds('c1_ranger')].filter((id) => ['huntking_mark','huntking_followup'].includes(id)), ['huntking_followup','huntking_mark']);
  assert.deepEqual([...skillIds('c1_alchemist')].filter((id) => ['alchemist_poison_potion','alchemist_detonate'].includes(id)), ['alchemist_poison_potion','alchemist_detonate']);
});

test('C1 Vanguard defines a bounded combat-only Pressure loop', () => {
  const vanguard = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_vanguard');
  assert.deepEqual(vanguard.c1Combat, {
    kind:'pressure', maxStacks:3, damagePerStack:0.12,
    gainSkillIds:['fighter_flurry','battlemaster_rapid_break'],
    spendSkillIds:['fighter_straight_punch','battlemaster_armor_breaker','battlemaster_peerless'],
  });
});

test('C1 Elementalist defines a combat-only alternate-element MP cycle', () => {
  const elementalist = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_elementalist');
  assert.deepEqual(elementalist.c1Combat, { kind:'elementCycle', mpRefundPct:0.25 });
});

test('C1 Shadow defines an affliction-to-execution combat loop', () => {
  const shadow = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_shadow');
  assert.deepEqual(shadow.c1Combat, {
    kind:'execution', bonusPower:3,
    setupSkillIds:['thief_dark_slash','thief_poison_blade','ninja_poison_star','ninja_pin'],
    executionSkillIds:['phantomthief_backstab'],
  });
});

test('C1 Shadow execution reads the canonical weaken and DoT state without affecting legacy jobs', () => {
  const engine = Object.create(BattleEngine.prototype);
  engine.job = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_shadow');
  const execution = { id:'phantomthief_backstab' };
  assert.equal(engine._c1ShadowExecutionPower(execution, { weaken:{ atk:{ power:0.2, turnsLeft:2 } }, dotStacks:0 }), 3);
  assert.equal(engine._c1ShadowExecutionPower(execution, { weaken:null, dotStacks:1 }), 3);
  assert.equal(engine._c1ShadowExecutionPower(execution, { weaken:null, dotStacks:0 }), 0);
  engine.job = { id:'phantomthief', c1Combat:null };
  assert.equal(engine._c1ShadowExecutionPower(execution, { dotStacks:1 }), 0);
});

test('C1 Maestro turns an existing active buff into a dance finale without new state', () => {
  const maestro = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_maestro');
  assert.deepEqual(maestro.c1Combat, { kind:'chorus', bonusPower:2, finaleSkillIds:['dancer_blade_dance','primadiva_sword_aria'] });
  const engine = Object.create(BattleEngine.prototype);
  engine.job = maestro;
  engine.player = { buffs:{ atk:{ turnsLeft:2 } } };
  assert.equal(engine._c1MaestroChorusPower({ id:'dancer_blade_dance' }), 2);
  engine.player.buffs.atk.turnsLeft = 0;
  assert.equal(engine._c1MaestroChorusPower({ id:'dancer_blade_dance' }), 0);
  engine.job = { c1Combat:null };
  assert.equal(engine._c1MaestroChorusPower({ id:'dancer_blade_dance' }), 0);
});

test('C1 Chaplain turns a guarded heal into the established regeneration buff', () => {
  const chaplain = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_chaplain');
  assert.deepEqual(chaplain.c1Combat, { kind:'sanctuary', regenAdd:0.02, regenTurns:2, healSpellIds:['priest_heal','priest_full_heal'] });
  const engine = Object.create(BattleEngine.prototype);
  engine.job = chaplain;
  engine.player = { buffs:{ def:{ turnsLeft:2 } } };
  engine._applyBuffPayload = (buff) => { engine.applied = buff; };
  const result = {};
  engine._c1ChaplainSanctuary(result, { id:'priest_heal' });
  assert.deepEqual(engine.applied, { regenAdd:0.02, turns:2 });
  assert.deepEqual(result.sanctuary, { regenAdd:0.02, turns:2 });
});

test('C1 Quartermaster refunds MP only after an existing Gold payment', () => {
  const quartermaster = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_quartermaster');
  assert.deepEqual(quartermaster.c1Combat, { kind:'supply', mpRefundPct:0.25 });
  const engine = Object.create(BattleEngine.prototype);
  engine.job = quartermaster;
  engine.player = { mp:10, maxMp:20 };
  engine._effectiveMpCost = () => 8;
  const result = { goldSpent:15 };
  engine._c1QuartermasterSupply(result, { id:'guildmaster_supply' });
  assert.equal(engine.player.mp, 12);
  assert.deepEqual(result.supply, { mpRestored:2 });
  engine.player.mp = 10;
  engine._c1QuartermasterSupply({ goldSpent:0 }, { id:'merchant_coin_toss' });
  assert.equal(engine.player.mp, 10);
});

test('C1 Oracle reads the existing crit buff to strengthen star spells', () => {
  const oracle = C1_RUNTIME_JOBS.find((job) => job.id === 'c1_oracle');
  assert.deepEqual(oracle.c1Combat, { kind:'omen', critBonus:15, attackSpellIds:['astromancer_star_bullet'] });
  const engine = Object.create(BattleEngine.prototype);
  engine.job = oracle;
  engine.player = { buffs:{ critAdd:{ turnsLeft:2 } } };
  assert.equal(engine._c1OracleOmenCritBonus({ id:'astromancer_star_bullet' }), 15);
  engine.player.buffs.critAdd.turnsLeft = 0;
  assert.equal(engine._c1OracleOmenCritBonus({ id:'astromancer_star_bullet' }), 0);
});

test('C1 boot keeps legacy fusion data migratable but does not activate its combat runtime', () => {
  const main = readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  assert.doesNotMatch(main, /fusionCombatRuntime|fusionBattleIntegration|fusionBattleUi/);
  assert.equal(C1_RUNTIME_JOBS.length, 10);
});
