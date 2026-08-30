import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_DEEP_GREEN_CHAIN,cp4DeepGreenProgress,cp4DeepGreenStepForStage } from '../js/data/contentPackIVA.js';

const clear=id=>id==='35-8';

test('CP4-1 is a three-step deterministic Deep Green contradiction chain after Ch35',()=>{
  const chain=CP4_DEEP_GREEN_CHAIN;
  assert.equal(chain.prerequisiteStageId,'35-8');
  assert.equal(chain.primeChapter,2);
  assert.deepEqual(chain.steps.map(x=>x.stageId),['2-1','2-3','2-5']);
  assert.equal(new Set(chain.steps.map(x=>x.discoveryId)).size,3);
  assert.match(chain.steps[0].text,/大樹霊は討たれ/);
  assert.match(chain.steps[1].text,/大樹霊は生存/);
  assert.match(chain.steps[1].text,/樹冠/);
  assert.match(chain.steps[2].text,/森林|森/);
  assert.match(chain.overlap.text,/同じ一点/);
});

test('CP4-1 cannot begin before Ch35 and never uses difficulty, World Tier, gear or RNG gates',()=>{
  assert.equal(cp4DeepGreenProgress({discoveries:{},isStageCleared:()=>false}).state,'locked');
  const src=fs.readFileSync(new URL('../js/data/contentPackIVA.js',import.meta.url),'utf8');
  assert.doesNotMatch(src,/Math\.random|World Tier|worldTier|gearScore|difficulty|Hard Mode|Extreme|currency|token|daily|weekly/i);
});

test('CP4-1 advances only through the authored revisit order',()=>{
  const d={};
  let p=cp4DeepGreenProgress({discoveries:d,isStageCleared:clear});
  assert.deepEqual({state:p.state,next:p.nextStageId},{state:'rumor',next:'2-1'});
  assert.equal(cp4DeepGreenStepForStage('2-3',{discoveries:d,isStageCleared:clear}),null);
  const first=cp4DeepGreenStepForStage('2-1',{discoveries:d,isStageCleared:clear});
  assert.equal(first?.id,'prime-record');d[first.discoveryId]={};
  p=cp4DeepGreenProgress({discoveries:d,isStageCleared:clear});assert.equal(p.nextStageId,'2-3');
  const second=cp4DeepGreenStepForStage('2-3',{discoveries:d,isStageCleared:clear});d[second.discoveryId]={};
  assert.equal(cp4DeepGreenProgress({discoveries:d,isStageCleared:clear}).nextStageId,'2-5');
  const third=cp4DeepGreenStepForStage('2-5',{discoveries:d,isStageCleared:clear});d[third.discoveryId]={};
  p=cp4DeepGreenProgress({discoveries:d,isStageCleared:clear});
  assert.equal(p.state,'resolved');assert.equal(p.complete,false);
  d[CP4_DEEP_GREEN_CHAIN.overlap.discoveryId]={};
  assert.equal(cp4DeepGreenProgress({discoveries:d,isStageCleared:clear}).complete,true);
});

test('CP4-1 runtime reuses world2 discoveries, Rumor Notebook and existing TextBattleScreen',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVA.js',import.meta.url),'utf8');
  const boot=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  assert.match(runtime,/state\.data\.world2/);
  assert.match(runtime,/state\.rumorNotebook/);
  assert.match(runtime,/TextBattleScreen\.prototype\.start/);
  assert.match(runtime,/contentPackIV:true/);
  assert.match(boot,/import '\.\/contentPackIVA\.js';/);
  assert.doesNotMatch(runtime,/branchSightSave|multiverseProgress|Branch XP|currency|token|goContentPackIV|contentPackIVScreen/i);
});

test('CP4-1 language stops before explicit Branch terminology or Parallax Core activation',()=>{
  const text=JSON.stringify(CP4_DEEP_GREEN_CHAIN);
  assert.doesNotMatch(text,/王樹領|深緑消失域|観測分岐世界|Observed Branch|Branch Sight|分岐視|視差核|Parallax Core|Transcendent|超観測者/i);
});
