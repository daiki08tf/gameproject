import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { enemyCombatProfile } from '../js/data/enemyCombat3.js';
import { PHASE9_ENEMY_COMBAT } from '../js/data/enemyCombatPhase9.js';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';

const SUPPORTED = new Set(['power','multi','guardAll','hasteAll','healAlly','mpDrain','slow','weakenAtk','poison','burn']);

test('Phase 9.2 gives every chapter 21-25 field monster an authored combat identity',()=>{
  for(let ch=21;ch<=25;ch++){
    const profiles=['normal','fast','tank'].map(kind=>enemyCombatProfile(`ch${ch}_${kind}`));
    assert.equal(profiles.length,3);
    assert.equal(new Set(profiles.map(p=>p.skill.name)).size,3,`ch${ch} skill names`);
    for(const profile of profiles){
      assert.ok(profile.skill);
      assert.ok(SUPPORTED.has(profile.skill.kind),`${ch}:${profile.skill.kind}`);
      assert.ok(profile.skill.chance>=.42,`ch${ch} chance`);
    }
  }
});

test('Phase 9.2 authors midboss and secret-branch identities for all five regions',()=>{
  for(let ch=21;ch<=25;ch++){
    for(const suffix of ['midboss','branchboss']){
      const profile=PHASE9_ENEMY_COMBAT[`ch${ch}_${suffix}`];
      assert.ok(profile,`ch${ch}_${suffix}`);
      assert.ok(SUPPORTED.has(profile.skill.kind));
    }
  }
});

test('all five outer-world bosses have bespoke multi-phase encounter profiles',()=>{
  const ids=[];
  for(let ch=21;ch<=25;ch++){
    const profile=bossEncounterProfile(`ch${ch}_boss`);
    assert.ok(profile);
    ids.push(profile.id);
    assert.ok(profile.phases.length>=3,`ch${ch} phase count`);
    assert.ok(profile.startEscorts.length>=2,`ch${ch} escorts`);
    assert.ok(profile.guardDefMult>=1.8,`ch${ch} guard pressure`);
    assert.ok(profile.counterHint?.length>10,`ch${ch} counter hint`);
    assert.ok(profile.dangerTags?.length>=3,`ch${ch} danger tags`);
    assert.ok(profile.phases.some(p=>p.breakGaugePct),`ch${ch} Break window`);
    for(let i=1;i<profile.phases.length;i++)assert.ok(profile.phases[i].ratio<profile.phases[i-1].ratio,`ch${ch} phase ordering`);
  }
  assert.equal(new Set(ids).size,5);
});

test('Boundary King is the most elaborate Phase 9.2 story boss',()=>{
  const final=bossEncounterProfile('ch25_boss');
  assert.equal(final.phases.length,4);
  assert.equal(final.phases.at(-1).name,'境界王座崩壊');
  assert.ok(final.phases.at(-1).atkMult>=1.4);
  assert.ok(final.phases.at(-1).breakGaugePct<=.3);
});

test('boss runtime implements non-healing Break windows and exposes counterplay metadata',()=>{
  const src=fs.readFileSync(new URL('../js/patches/combat3BossEncounter.js',import.meta.url),'utf8');
  assert.match(src,/Math\.min\(before,target\)/);
  assert.match(src,/bossCounterHint/);
  assert.match(src,/bossDangerTags/);
  assert.match(src,/breakWindow/);
});
