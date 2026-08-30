import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { E8_MIGRATED_STAGE_IDS } from '../js/patches/enemy2StoryMigration.js';
import { E8_TEMPLATE_IDS, globalRosterForRegionTags } from '../js/data/encounterMigration2.js';
import { chooseEnvironmentalVariant } from '../js/data/enemyRankVariants2.js';

const roleSet=pool=>new Set((pool?.types||[]).map(x=>ENEMY_TYPES[x.type]?.role).filter(Boolean));
const globals=pool=>(pool?.types||[]).filter(x=>ENEMY_TYPES[x.type]?.e8Global).map(x=>ENEMY_TYPES[x.type]?.speciesId);

test('E8 migrates all eligible Ch1-32 story stages and leaves tutorial/branches fixed',()=>{
  assert.equal(CHAPTERS.length,32);
  const expected=CHAPTERS.flatMap(ch=>ch.stages.filter(st=>!st.branch&&st.id!=='1-1').map(st=>st.id));
  assert.deepEqual([...E8_MIGRATED_STAGE_IDS].sort(),expected.sort());
  assert.equal(CHAPTERS[0].stages.find(s=>s.id==='1-1').encounterPool,undefined);
  for(const ch of CHAPTERS){
    for(const st of ch.stages.filter(s=>s.branch))assert.equal(st.encounterPool,undefined,`${st.id} branch must stay fixed`);
  }
});

test('every migrated chapter keeps all seven regional roles as the encounter core',()=>{
  const required=['normal','fast','tank','attacker','caster','trickster','support'];
  for(const ch of CHAPTERS){
    const st=ch.stages.find(s=>s.encounterPool);
    assert.ok(st,`${ch.id} should have a migrated field stage`);
    const roles=roleSet(st.encounterPool);
    for(const role of required)assert.ok(roles.has(role),`${ch.id} missing ${role}`);
    assert.deepEqual(st.encounterPool.templates,E8_TEMPLATE_IDS);
    assert.equal(st.encounterPool.rareTypes[0]?.type,`${ch.id}_rare`);
  }
});

test('Global Species are chapter-anchored, bounded and region-sensitive instead of one universal pool',()=>{
  for(const ch of CHAPTERS){
    const pool=ch.stages.find(s=>s.encounterPool).encounterPool;
    const ids=globals(pool);
    assert.ok(ids.includes('slime'),`${ch.id} should retain true-global slime`);
    assert.ok(ids.length<=4,`${ch.id} global roster must remain bounded`);
    for(const entry of pool.types.filter(x=>ENEMY_TYPES[x.type]?.e8Global)){
      assert.equal(ENEMY_TYPES[entry.type].chapterId,ch.id);
      assert.equal(ENEMY_TYPES[entry.type].boss,false);
    }
  }
  assert.deepEqual(globalRosterForRegionTags(['fire'],'ch5'),['slime','lizard','golem','wisp']);
  assert.deepEqual(globalRosterForRegionTags(['dark'],'ch8'),['slime','skeleton','bat','wandering_armor']);
  assert.notDeepEqual(globals(CHAPTERS[4].stages.find(s=>s.encounterPool).encounterPool),globals(CHAPTERS[7].stages.find(s=>s.encounterPool).encounterPool));
});

test('Boss and midboss wave order remains authored while only ordinary pre-waves can pool',()=>{
  for(const ch of CHAPTERS){
    for(const st of ch.stages.filter(s=>s.boss||s.midBoss)){
      const last=st.waves.at(-1);
      assert.ok(ENEMY_TYPES[last.type]?.boss,`${st.id} must still end in authored boss type`);
      assert.ok(st.encounterPool,`${st.id} ordinary pre-wave should be migration-capable`);
      assert.equal(st.encounterPool.types.some(x=>ENEMY_TYPES[x.type]?.boss),false);
    }
  }
});

test('E8 region tags activate bounded environmental variants without changing species identity contract',()=>{
  const fireStage=CHAPTERS.find(ch=>ch.id==='ch5').stages.find(s=>s.encounterPool);
  const template={boss:false,rareIdentity:false,role:'normal'};
  const rolls=[0,0];
  const variant=chooseEnvironmentalVariant(fireStage.encounterPool,template,()=>rolls.shift()??0);
  assert.equal(variant?.id,'fire_ash');
  assert.equal(fireStage.encounterPool.variantChance,.10);
  const ch1=CHAPTERS[0].stages.find(s=>s.id==='1-2');
  assert.ok(ch1.encounterPool.regionTags.includes('grassland'));
});

test('fixed wave headcounts remain unchanged by migration metadata',()=>{
  const checks=[['1-4',13],['2-4',13],['16-7',10],['30-8',5],['32-8',5]];
  for(const [id,total] of checks){
    const stage=CHAPTERS.flatMap(ch=>ch.stages).find(s=>s.id===id);
    assert.ok(stage,`missing ${id}`);
    assert.equal(stage.waves.reduce((sum,w)=>sum+w.count,0),total,id);
  }
});
