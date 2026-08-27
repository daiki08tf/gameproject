import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { CHAPTER_EXPANSION_21_25 } from '../js/data/chapters21to25.js';
import { PHASE9_REGION_PROFILES, phase9ExplorationEvents } from '../js/data/regionsPhase9.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';

const phase9Chapters=()=>CHAPTERS.filter(ch=>ch.num>=21&&ch.num<=25);

test('Phase 9.1 preserves canonical chapters 21 through 25 as later story chapters are appended',()=>{
  assert.ok(CHAPTERS.length>=25);
  assert.deepEqual(phase9Chapters().map(ch=>ch.num),[21,22,23,24,25]);
});
test('new regions stretch recommended level curve to 2500',()=>{assert.equal(CHAPTER_EXPANSION_21_25[0].recLevel[0],700);assert.equal(CHAPTER_EXPANSION_21_25.at(-1).recLevel[1],2500);for(let i=1;i<CHAPTER_EXPANSION_21_25.length;i++)assert.ok(CHAPTER_EXPANSION_21_25[i].recLevel[0]>=CHAPTER_EXPANSION_21_25[i-1].recLevel[1]);});
test('each Phase 9.1 region has identity and exploration content without BGM metadata',()=>{for(const ch of CHAPTER_EXPANSION_21_25){const p=PHASE9_REGION_PROFILES[ch.id];assert.ok(p,ch.id);assert.ok(p.fieldRule?.desc,ch.id);assert.equal(phase9ExplorationEvents(ch.id).length,3,ch.id);assert.equal('bgm' in p,false,ch.id);}});
test('each Phase 9.1 chapter generates 8 stages plus a secret branch and region metadata',()=>{for(const ch of phase9Chapters()){assert.equal(ch.stages.length,9,ch.id);assert.ok(ch.stages.some(s=>s.midBoss),ch.id);assert.ok(ch.stages.some(s=>s.boss),ch.id);assert.ok(ch.stages.some(s=>s.branch),ch.id);for(const st of ch.stages){assert.ok(st.regionId,ch.id);assert.ok(st.fieldRule?.id,ch.id);assert.equal(st.explorationEvents.length,3,ch.id);}}});
test('enemy and equipment pipelines include chapters 21 to 25',()=>{for(const ch of CHAPTER_EXPANSION_21_25){for(const suffix of ['normal','fast','tank','boss','midboss','branchboss'])assert.ok(ENEMY_TYPES[`${ch.id}_${suffix}`],`${ch.id}_${suffix}`);for(const id of [`${ch.id}_weapon`,`${ch.id}_shield`,`${ch.id}_head`,`${ch.id}_body`,`${ch.id}_accessory`,`${ch.id}_weapon_epic`,`${ch.id}_branch`])assert.ok(getItem(id),id);}});
