import test from 'node:test';
import assert from 'node:assert/strict';
import { COMPANION_ROLES, PHASE12_RECRUITABLE_SPECIES, PHASE12_SPECIAL_HYBRIDS } from '../js/data/phase12CompanionPack.js';
import { COMPANION_SPECIES, getCompanionSpecies } from '../js/data/companions.js';
import { getCompanionSkill } from '../js/data/companionSkills.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE } from '../js/data/monsterRanchSpecies.js';
import { breedingSpecies, hybridSpeciesIds } from '../js/data/companionBreeding.js';
import { CHAPTER_EXPANSION_21_25 } from '../js/data/chapters21to25.js';

const recruits=Object.values(PHASE12_RECRUITABLE_SPECIES);

test('Phase 12.2 adds fourteen recruitable species across all eight party roles',()=>{
  assert.equal(recruits.length,14);
  const used=new Set(recruits.map(s=>s.role));
  assert.deepEqual([...used].sort(),Object.keys(COMPANION_ROLES).sort());
  for(const s of recruits){
    assert.equal(COMPANION_SPECIES[s.id]?.id,s.id);
    assert.ok(s.roleName);
    assert.ok(s.recruit.baseChance>0&&s.recruit.baseChance<=.03);
  }
});

test('chapters 21-25 expose both normal and fast enemies as Ranch recruits',()=>{
  for(const ch of CHAPTER_EXPANSION_21_25){
    for(const role of ['normal','fast']){
      const enemyType=`${ch.id}_${role}`;
      const speciesId=RANCH_RECRUIT_BY_ENEMY_TYPE[enemyType];
      assert.ok(speciesId,`${enemyType} should be recruitable`);
      assert.equal(getCompanionSpecies(speciesId)?.enemyType,enemyType);
    }
  }
});

test('Boundary Ruins add four rare recruit targets without a new capture route',()=>{
  const enemyTypes=['phase12_echo_wisp','phase12_forge_hammer','phase12_memory_moth','phase12_null_hound'];
  for(const enemyType of enemyTypes){
    const id=RANCH_RECRUIT_BY_ENEMY_TYPE[enemyType];
    assert.ok(id,`${enemyType} should map into existing recruitment`);
    assert.equal(PHASE12_RECRUITABLE_SPECIES[id]?.rarityTag,'ruin');
  }
  const fieldAvg=recruits.filter(s=>s.rarityTag==='field').reduce((n,s)=>n+s.recruit.baseChance,0)/recruits.filter(s=>s.rarityTag==='field').length;
  const ruinAvg=recruits.filter(s=>s.rarityTag==='ruin').reduce((n,s)=>n+s.recruit.baseChance,0)/4;
  assert.ok(ruinAvg<fieldAvg,'ruin species should remain rarer than ordinary field recruits');
});

test('every new recruit uses only existing executable companion skills',()=>{
  for(const s of recruits)for(const entry of s.skills)assert.ok(getCompanionSkill(entry.id),`${s.id}:${entry.id}`);
  for(const h of Object.values(PHASE12_SPECIAL_HYBRIDS))for(const entry of h.skills)assert.ok(getCompanionSkill(entry.id),`${h.id}:${entry.id}`);
});

test('Phase 12.2 adds four breeding-only hybrids through existing breeding rules',()=>{
  assert.equal(Object.keys(PHASE12_SPECIAL_HYBRIDS).length,4);
  const ids=new Set(hybridSpeciesIds());
  for(const [pair,def] of Object.entries(PHASE12_SPECIAL_HYBRIDS)){
    const [a,b]=pair.split('+');
    assert.equal(breedingSpecies(a,b),def.id);
    assert.equal(breedingSpecies(b,a),def.id);
    assert.ok(ids.has(def.id));
    const species=getCompanionSpecies(def.id);
    assert.equal(species?.hybrid,true);
    assert.equal(species?.recruit?.baseChance,0);
    assert.ok(species?.roleName);
  }
});
