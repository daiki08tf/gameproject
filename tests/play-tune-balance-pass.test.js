import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import '../js/patches/progression3OuterStory.js';
import { state } from '../js/state.js';
import { CHAPTERS, finalStageOf } from '../js/data/stages.js';
import { abyssRecommendedLevel } from '../js/data/abyssEndgame.js';
import { CP3_REWARDS } from '../js/data/contentPackIIIB.js';
import { getItem, powerScore } from '../js/data/equipment.js';
import { ABYSS_CHALLENGES } from '../js/data/abyssChallenges.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('balance pass: live story curve bridges Ch20 through Ch30 without level regression',()=>{
  const bosses=CHAPTERS.filter(ch=>ch.num>=16&&ch.num<=30).map(ch=>({chapter:ch.num,level:Number(finalStageOf(ch).recLevel)}));
  for(let i=1;i<bosses.length;i++)assert.ok(bosses[i].level>=bosses[i-1].level,`Ch${bosses[i].chapter} regressed below Ch${bosses[i-1].chapter}`);
  const ch20=CHAPTERS.find(ch=>ch.num===20),ch21=CHAPTERS.find(ch=>ch.num===21),ch30=CHAPTERS.find(ch=>ch.num===30);
  assert.equal(finalStageOf(ch20).recLevel,3000);
  assert.equal(ch21.stages.find(s=>s.id==='21-1').recLevel,3000);
  assert.equal(finalStageOf(ch30).recLevel,7600);
});

test('balance pass: Abyss remains the canonical Lv3000 fork after Ch20',()=>{
  assert.equal(abyssRecommendedLevel(1),3000);
  const original=state.isStageCleared;
  try{
    state.isStageCleared=id=>id!=='20-8';
    assert.equal(state.isAbyssUnlocked(),false,'Abyss must stay locked before Ch20 finale');
    state.isStageCleared=id=>!String(id).startsWith('21-');
    assert.equal(state.isAbyssUnlocked(),true,'Ch21+ must not be required for the Lv3000 Abyss fork');
  }finally{state.isStageCleared=original;}
});

test('balance pass: post-Ch30 CP3 encounters benchmark combat stats against Ch30 archetypes',()=>{
  const a=read('js/patches/contentPackIIIA.js'),b=read('js/patches/contentPackIIIB.js');
  assert.match(a,/postStoryBaseline/);
  assert.match(a,/ENEMY_TYPES\[`ch30_\$\{suffix\}`\]/);
  assert.match(a,/cp3PostStoryScaled:true/);
  assert.match(b,/postStoryBossBaseline/);
  assert.match(b,/ENEMY_TYPES\[`ch30_\$\{suffix\}`\]/);
  assert.match(b,/cp3PostStoryScaled:true/);
});

test('balance pass: CP3 boss rewards remain meaningful versus Ch30 regular gear',()=>{
  const benchmark={shield:'ch30_shield',head:'ch30_head',body:'ch30_body',accessory:'ch30_accessory'};
  for(const reward of CP3_REWARDS){
    const base=getItem(benchmark[reward.slot]);
    assert.ok(base,`missing Ch30 ${reward.slot} benchmark`);
    assert.ok(powerScore(reward)>=powerScore(base)*2,`${reward.id} should remain a meaningful post-story reward`);
  }
});

test('balance pass: selectable Abyss challenges stay sharp but bounded',()=>{
  for(const c of ABYSS_CHALLENGES){
    if(c.enemyHpMult)assert.ok(c.enemyHpMult<=1.5,`${c.id} HP multiplier too large`);
    if(c.enemyAtkMult)assert.ok(c.enemyAtkMult<=1.5,`${c.id} ATK multiplier too large`);
    if(c.healMult)assert.ok(c.healMult>=0.5,`${c.id} healing penalty too severe`);
    for(const key of ['dropMult','greaterBonus','legendaryBonus','setBonus'])if(c[key]!=null)assert.ok(c[key]<=1.3,`${c.id} reward modifier ${key} exploded`);
  }
});
