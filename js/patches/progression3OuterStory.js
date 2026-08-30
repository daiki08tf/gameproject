/* ============================================================
   PLAY / TUNE — outer story progression bridge
   ------------------------------------------------------------
   Ch16–20 runtime progression ends at Lv3,000. Ch21+ Story was authored
   later from multiple raw level bands, so this bridge keeps the live curve
   continuous. Abyss 1F stays at its canonical Lv3,000 Ch20 fork while the
   outer Story continues in parallel, now through Ch35 / Lv10,600.
   ============================================================ */
import './progression3StoryExpansion.js';
import { state } from '../state.js';
import { CHAPTERS, finalStageOf } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { cumulativeCharacterExpToLevel } from '../data/progression.js';

export const OUTER_STORY_LEVEL_ROADMAP = Object.freeze([
  { chapter:21, min:3000, max:3300, oldMin:700,  oldMax:950  },
  { chapter:22, min:3300, max:3650, oldMin:950,  oldMax:1250 },
  { chapter:23, min:3650, max:4050, oldMin:1250, oldMax:1600 },
  { chapter:24, min:4050, max:4500, oldMin:1600, oldMax:2000 },
  { chapter:25, min:4500, max:5000, oldMin:2000, oldMax:2500 },
  { chapter:26, min:5000, max:5500, oldMin:2500, oldMax:3200 },
  { chapter:27, min:5500, max:6000, oldMin:3200, oldMax:4000 },
  { chapter:28, min:6000, max:6500, oldMin:4000, oldMax:5000 },
  { chapter:29, min:6500, max:7000, oldMin:5000, oldMax:6200 },
  { chapter:30, min:7000, max:7600, oldMin:6200, oldMax:7600 },
  { chapter:31, min:7600, max:8200, oldMin:7600, oldMax:8200 },
  { chapter:32, min:8200, max:8800, oldMin:8200, oldMax:8800 },
  { chapter:33, min:8800, max:9400, oldMin:8800, oldMax:9400 },
  { chapter:34, min:9400, max:10000, oldMin:9400, oldMax:10000 },
  { chapter:35, min:10000, max:10600, oldMin:10000, oldMax:10600 },
]);

const ONE_PASS_TARGET_SHARE=0.82;
const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));

function chapterEnemyKeys(chapter){
  const p=`ch${chapter}`;
  return [`${p}_normal`,`${p}_fast`,`${p}_tank`,`${p}_midboss`,`${p}_boss`,`${p}_branchboss`];
}
function remap(oldLevel,entry){
  const t=(Number(oldLevel)-entry.oldMin)/Math.max(1,entry.oldMax-entry.oldMin);
  return Math.round(entry.min+(entry.max-entry.min)*clamp(Number.isFinite(t)?t:0,0,1));
}
function currentExpBudget(chapter){
  let total=0;
  for(const stage of chapter.stages){
    if(stage.branch)continue;
    total+=Number(stage.rewards?.exp)||0;
    for(const wave of stage.waves||[]){
      const enemy=ENEMY_TYPES[wave.type];
      if(enemy)total+=(Number(enemy.xp)||0)*Math.max(1,Number(wave.count)||1);
    }
  }
  return Math.max(1,total);
}
function targetExp(entry){
  const need=cumulativeCharacterExpToLevel(entry.max)-cumulativeCharacterExpToLevel(entry.min);
  return Math.max(1,need*ONE_PASS_TARGET_SHARE);
}
function applyEntry(entry){
  const chapter=CHAPTERS.find(ch=>ch.num===entry.chapter);if(!chapter)return null;
  const oldBudget=currentExpBudget(chapter),expFactor=Math.max(1,targetExp(entry)/oldBudget);
  const levelRatio=entry.max/Math.max(1,entry.oldMax);
  const hpFactor=levelRatio,atkFactor=Math.pow(levelRatio,.90),defFactor=Math.pow(levelRatio,.85);
  for(const stage of chapter.stages){
    stage.recLevel=remap(stage.recLevel,entry);
    if(Number.isFinite(stage.rewards?.exp))stage.rewards.exp=Math.max(1,Math.round(stage.rewards.exp*expFactor));
  }
  for(const key of chapterEnemyKeys(entry.chapter)){
    const enemy=ENEMY_TYPES[key];if(!enemy)continue;
    enemy.hp=Math.max(1,Math.round(enemy.hp*hpFactor));
    enemy.atk=Math.max(1,Math.round(enemy.atk*atkFactor));
    enemy.def=Math.max(0,Math.round(enemy.def*defFactor));
    enemy.xp=Math.max(1,Math.round(enemy.xp*expFactor));
  }
  return {...entry,levelRatio,hpFactor,atkFactor,defFactor,expFactor,rawExpBudget:oldBudget,targetExp:targetExp(entry)};
}
function applyOuterStoryProgression(){
  if(globalThis.__BLADE_VALE_OUTER_STORY_PROGRESSION__)return;
  globalThis.__BLADE_VALE_OUTER_STORY_PROGRESSION__=true;
  const applied=OUTER_STORY_LEVEL_ROADMAP.map(applyEntry).filter(Boolean);
  state.progression3OuterStory={min:3000,max:10600,onePassTargetShare:ONE_PASS_TARGET_SHARE,applied};
  if(state.levelRoadmap99999)state.levelRoadmap99999.outerStory=OUTER_STORY_LEVEL_ROADMAP;
  state.isAbyssUnlocked=function outerStoryAbyssGate(){
    return CHAPTERS.filter(ch=>ch.num<=20).every(ch=>this.isStageCleared(finalStageOf(ch).id));
  };
}
applyOuterStoryProgression();
