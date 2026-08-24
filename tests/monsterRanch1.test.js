import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPANION_SPECIES } from '../js/data/companions.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE, ranchSpeciesCount } from '../js/data/monsterRanchSpecies.js';
import { godRollProfile, ranchCapacity, researchLevel, researchUnlocked, talentGrade } from '../js/data/monsterRanch.js';

test('Monster Ranch exposes 40+ compatible species',()=>{
  assert.ok(Object.keys(COMPANION_SPECIES).length>=40);
  assert.equal(ranchSpeciesCount(),Object.keys(COMPANION_SPECIES).length);
});

test('regional recruitment spans early and final regions',()=>{
  assert.ok(RANCH_RECRUIT_BY_ENEMY_TYPE.ch2_normal);
  assert.ok(RANCH_RECRUIT_BY_ENEMY_TYPE.ch2_fast);
  assert.ok(RANCH_RECRUIT_BY_ENEMY_TYPE.ch20_normal);
  assert.ok(RANCH_RECRUIT_BY_ENEMY_TYPE.ch20_fast);
});

test('research milestones and ranch capacity are bounded',()=>{
  assert.equal(researchLevel(0),0);
  assert.equal(researchUnlocked(100,'mastered'),true);
  assert.equal(ranchCapacity(0),12);
  assert.equal(ranchCapacity(5),100);
});

test('talent grading and God Roll archetypes are deterministic',()=>{
  assert.equal(talentGrade(1.20),'SS');
  const profile=godRollProfile({talent:{hp:1,mp:1,atk:1.18,def:1,mag:1,spd:1.15}});
  assert.equal(profile.isGodRoll,true);
  assert.equal(profile.profile,'物理高速');
});
