import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, finalStageOf, findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { CHAPTER_EXPANSION_16_20 } from '../js/data/chapters16to20.js';
import { WEAPON_TYPES } from '../js/data/weaponTypes.js';
import { nextStageAfter } from '../js/data/resultNextStage.js';

test('main story now contains twenty chapters',()=>{
  assert.equal(CHAPTERS.length,20);
  assert.equal(CHAPTERS.at(-1).id,'ch20');
  assert.equal(finalStageOf(CHAPTERS.at(-1)).id,'20-8');
  assert.equal(finalStageOf(CHAPTERS.at(-1)).recLevel,700);
});

test('chapters 16-20 use eight main stages plus one hidden branch',()=>{
  for(let n=16;n<=20;n++){
    const ch=CHAPTERS.find(x=>x.num===n);assert.ok(ch);assert.equal(ch.stages.filter(s=>!s.branch).length,8);assert.equal(ch.stages.filter(s=>s.branch).length,1);assert.equal(ch.stages.find(s=>s.midBoss)?.id,`${n}-4`);assert.equal(finalStageOf(ch).id,`${n}-8`);
  }
});

test('expanded chapter level ladder bridges chapter 15 to Abyss Lv700',()=>{
  const expected=[[16,260,330],[17,330,410],[18,410,500],[19,500,600],[20,600,700]];
  for(const [n,start,end] of expected){const ch=CHAPTERS.find(x=>x.num===n);const main=ch.stages.filter(s=>!s.branch);assert.equal(main[0].recLevel,start);assert.equal(main.at(-1).recLevel,end);for(let i=1;i<main.length;i++)assert.ok(main[i].recLevel>main[i-1].recLevel);}
});

test('all new stage enemy ids resolve including midbosses',()=>{
  for(let n=16;n<=20;n++){
    const ch=CHAPTERS.find(x=>x.num===n);
    for(const stage of ch.stages)for(const wave of stage.waves)assert.ok(ENEMY_TYPES[wave.type],`${stage.id}:${wave.type}`);
    assert.equal(ENEMY_TYPES[`ch${n}_midboss`].boss,true);
    assert.equal(ENEMY_TYPES[`ch${n}_boss`].boss,true);
  }
});

test('story expansion only uses supported weapon classes',()=>{
  for(const ch of CHAPTER_EXPANSION_16_20)assert.ok(WEAPON_TYPES[ch.weaponType],`${ch.id}:${ch.weaponType}`);
});

test('next-stage flow crosses chapter 15 into the new story and follows eight-stage chapters',()=>{
  assert.equal(nextStageAfter(findStage('15-5').stage).id,'16-1');
  assert.equal(nextStageAfter(findStage('16-4').stage).id,'16-5');
  assert.equal(nextStageAfter(findStage('16-7').stage).id,'16-8');
  assert.equal(nextStageAfter(findStage('20-8').stage),null);
});
