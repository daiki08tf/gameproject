import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { cumulativeCharacterExpToLevel } from '../js/data/progression.js';
import { abyssStageExpBudget } from '../js/data/abyssEndgame.js';
import '../js/patches/levelRoadmap99999.js';
import '../js/patches/progression3StoryExpansion.js';
import { simulateStory, simulateAbyss, ONE_PASS_TARGET_SHARE } from '../scripts/phase10-7-exp-simulation.js';

const STORY = [
  [1,1,15],[2,15,30],[3,30,45],[4,45,65],[5,65,90],[6,90,120],[7,120,150],[8,150,180],[9,180,230],[10,230,300],
  [11,300,360],[12,360,430],[13,430,510],[14,510,600],[15,600,700],[16,700,1000],[17,1000,1350],[18,1350,1750],[19,1750,2250],[20,2250,3000],
];

function mainRouteBudget(chapterNumber) {
  const chapter = CHAPTERS.find(ch=>ch.num===chapterNumber || ch.id===`ch${chapterNumber}`);
  assert.ok(chapter,`chapter ${chapterNumber} exists`);
  let total=0;
  for(const stage of chapter.stages){
    if(stage.branch) continue;
    total += Number(stage.rewards?.exp)||0;
    for(const wave of stage.waves||[]){
      const enemy=ENEMY_TYPES[wave.type];
      if(enemy) total += (Number(enemy.xp)||0)*Math.max(1,Number(wave.count)||1);
    }
  }
  return total;
}

test('all 20 story chapters award about 85% of their level-span EXP on the main route',()=>{
  for(const [chapter,min,max] of STORY){
    const need=cumulativeCharacterExpToLevel(max)-cumulativeCharacterExpToLevel(min);
    const share=mainRouteBudget(chapter)/need;
    assert.ok(share>=0.83 && share<=0.87,`chapter ${chapter} share ${share}`);
  }
});

test('story simulation never overshoots its target on a canonical one-pass clear',()=>{
  const rows=simulateStory();
  assert.equal(rows.length,20);
  for(const row of rows){
    assert.ok(row.endLevel>=row.min,`chapter ${row.chapter} regressed below its start`);
    assert.ok(row.endLevel<row.target,`chapter ${row.chapter} should preserve side-content headroom`);
    assert.ok(Math.abs(row.targetShare-ONE_PASS_TARGET_SHARE)<0.001);
    assert.ok(row.remainingExp>0);
  }
  assert.equal(rows.at(-1).target,3000);
});

test('Abyss stage EXP contributes a stable share toward the Lv3,000 -> 99,999 roadmap',()=>{
  let stageExp=0;
  for(let depth=1;depth<3000;depth+=1){
    const value=abyssStageExpBudget(depth);
    assert.ok(Number.isSafeInteger(value) && value>0,`depth ${depth}`);
    stageExp+=value;
  }
  const need=cumulativeCharacterExpToLevel(99999)-cumulativeCharacterExpToLevel(3000);
  const share=stageExp/need;
  // Stage-clear EXP is designed around 55%; enemy EXP supplies the rest. Because
  // the budget uses the current floor's per-level approximation, allow drift.
  assert.ok(share>=0.45 && share<=0.65,`Abyss stage share ${share}`);
});

test('Abyss canonical checkpoints stay monotonic and finite through 3000F',()=>{
  const rows=simulateAbyss();
  let previous=0;
  for(const row of rows){
    assert.ok(row.recommendedLevel>=previous);
    assert.ok(Number.isSafeInteger(row.stageExp) && row.stageExp>0);
    assert.ok(row.nextRecommendedLevel>=row.recommendedLevel);
    previous=row.recommendedLevel;
  }
  assert.equal(rows.at(-1).recommendedLevel,99999);
});

test('branch stages are not part of the canonical main-route EXP budget contract',()=>{
  const source15=await import('node:fs').then(fs=>fs.readFileSync(new URL('../js/patches/levelRoadmap99999.js',import.meta.url),'utf8'));
  const source20=await import('node:fs').then(fs=>fs.readFileSync(new URL('../js/patches/progression3StoryExpansion.js',import.meta.url),'utf8'));
  assert.match(source15,/if \(stage\.branch\) continue/);
  assert.match(source20,/if \(stage\.branch\) continue/);
});
