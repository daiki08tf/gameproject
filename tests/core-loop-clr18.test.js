import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';
import {
  CH1_STORY_AFTERMATH,CH2_STORY_AFTERMATH,CH3_STORY_AFTERMATH,CH4_STORY_AFTERMATH,CH5_STORY_AFTERMATH,
  CH18_STORY_AFTERMATH,CH35_STORY_AFTERMATH,clr18StoryAftermath,clr18ShouldShowAftermath,
} from '../js/data/coreLoopClr18.js';

function mainStageIds(chapterNumber){
  const chapter=CHAPTERS.find(ch=>Number(ch.num)===chapterNumber);
  return chapter.stages.filter(stage=>!stage.branch&&!stage.bounty).map(stage=>stage.id);
}

test('CLR-18 Chapter 1 keeps the canonical 1-1 -> 1-5 Stage spine',()=>{
  assert.deepEqual(mainStageIds(1),['1-1','1-2','1-3','1-4','1-5']);
  assert.deepEqual(Object.keys(CH1_STORY_AFTERMATH),mainStageIds(1));
});

test('CLR-18 bulk batch Chapters 2-5 covers every canonical main Stage without branches',()=>{
  const maps=new Map([
    [2,CH2_STORY_AFTERMATH],[3,CH3_STORY_AFTERMATH],[4,CH4_STORY_AFTERMATH],[5,CH5_STORY_AFTERMATH],
  ]);
  for(const [chapterNumber,map] of maps){
    const expected=Array.from({length:5},(_,index)=>`${chapterNumber}-${index+1}`);
    assert.deepEqual(mainStageIds(chapterNumber),expected);
    assert.deepEqual(Object.keys(map),expected);
    assert.equal(clr18StoryAftermath(`${chapterNumber}-B`),null);
  }
});

test('CLR-18 Chapter 18 keeps the canonical expanded 18-1 -> 18-8 Stage spine',()=>{
  const ch18=CHAPTERS.find(ch=>Number(ch.num)===18);
  const main=mainStageIds(18);
  assert.deepEqual(main,['18-1','18-2','18-3','18-4','18-5','18-6','18-7','18-8']);
  assert.deepEqual(Object.keys(CH18_STORY_AFTERMATH),main);
  assert.equal(ch18.stages.find(stage=>stage.id==='18-4')?.midBoss,true);
  assert.equal(ch18.stages.find(stage=>stage.id==='18-8')?.boss,true);
});

test('CLR-18 Chapter 35 keeps the canonical expanded 35-1 -> 35-8 Stage spine',()=>{
  const ch35=CHAPTERS.find(ch=>Number(ch.num)===35);
  const main=mainStageIds(35);
  assert.deepEqual(main,['35-1','35-2','35-3','35-4','35-5','35-6','35-7','35-8']);
  assert.deepEqual(Object.keys(CH35_STORY_AFTERMATH),main);
  assert.equal(ch35.stages.find(stage=>stage.id==='35-4')?.midBoss,true);
  assert.equal(ch35.stages.find(stage=>stage.id==='35-8')?.boss,true);
});

test('CLR-18 aftermath stays concise and tied to exact canonical migrated Stages',()=>{
  const maps=[CH1_STORY_AFTERMATH,CH2_STORY_AFTERMATH,CH3_STORY_AFTERMATH,CH4_STORY_AFTERMATH,CH5_STORY_AFTERMATH,CH18_STORY_AFTERMATH,CH35_STORY_AFTERMATH];
  for(const id of maps.flatMap(map=>Object.keys(map))){
    const beat=clr18StoryAftermath(id);
    assert.equal(beat.stageId,id);
    assert.ok(beat.title.length>0);
    assert.ok(beat.text.length>0&&beat.text.length<120);
  }
  for(const id of ['1-B','2-B','3-B','4-B','5-B','18-B','35-B','6-1','17-1','34-1'])assert.equal(clr18StoryAftermath(id),null);
});

test('CLR-18 Story beat appears only after first victory, never on replay/retreat/loss',()=>{
  for(const id of ['1-1','2-1','3-5','4-3','5-5','18-1','18-4','18-8','35-1','35-4','35-8']){
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:true,wasCleared:false}),true);
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:true,wasCleared:true}),false);
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:false,wasCleared:false}),false);
    assert.equal(clr18ShouldShowAftermath({stageId:id,cleared:true,wasCleared:false,retreated:true}),false);
  }
});

test('CLR-18 Chapters 2-5 stay inside existing region/enemy canon instead of adding global revelations',()=>{
  const chapters=[2,3,4,5].map(num=>CHAPTERS.find(ch=>Number(ch.num)===num));
  assert.match(chapters[0].name,/深緑の森/);
  assert.match(chapters[1].name,/忘れられた遺跡/);
  assert.match(chapters[2].name,/凍てつく霊峰/);
  assert.match(chapters[3].name,/灼熱の火山/);
  assert.match(CH2_STORY_AFTERMATH['2-5'].text,/森の大樹霊/);
  assert.match(CH3_STORY_AFTERMATH['3-5'].text,/古代守護者ゴーレム/);
  assert.match(CH4_STORY_AFTERMATH['4-5'].text,/フロストドラゴン/);
  assert.match(CH5_STORY_AFTERMATH['5-5'].text,/炎帝ドレイク/);
});

test('CLR-18 Chapter 18 beats build toward existing world-outside / Veil lore without changing canon data',()=>{
  const ch18=CHAPTERS.find(ch=>Number(ch.num)===18);
  assert.match(ch18.lore,/世界の外側/);
  assert.match(ch18.lore,/The Veil/);
  assert.match(CH18_STORY_AFTERMATH['18-4'].text,/穴/);
  assert.match(CH18_STORY_AFTERMATH['18-8'].text,/世界の外側/);
});

test('CLR-18 Chapter 35 beats preserve the unresolved dual-outline canon',()=>{
  const ch35=CHAPTERS.find(ch=>Number(ch.num)===35);
  assert.match(ch35.lore,/第八鍵/);
  assert.match(ch35.lore,/巨大な樹冠/);
  assert.match(ch35.lore,/森林反応そのものが存在しない/);
  assert.match(ch35.lore,/原因も意味もまだ説明できない/);
  assert.match(CH35_STORY_AFTERMATH['35-6'].text,/巨大な樹冠/);
  assert.match(CH35_STORY_AFTERMATH['35-6'].text,/森林反応/);
  assert.match(CH35_STORY_AFTERMATH['35-8'].text,/原因も意味もまだ説明できず/);
});

test('CLR-18 UI bridges Stage-first result without adding progression/save/reward authority',()=>{
  const ui=fs.readFileSync('js/patches/coreLoopClr18StoryDensityUi.js','utf8');
  const data=fs.readFileSync('js/data/coreLoopClr18.js','utf8');
  assert.match(ui,/confirmStartBtn/);
  assert.match(ui,/resultNextBtn/);
  assert.match(ui,/resultScreen/);
  assert.match(ui,/state\.isStageCleared/);
  assert.doesNotMatch(ui,/state\.data|\.save\(|addItem\(|stageProgress\s*=/);
  assert.doesNotMatch(data,/state\.data|\.save\(|addItem\(|Math\.random/);
});

test('CLR-18 bridge is loaded through the existing CLR mobile/navigation chain',()=>{
  const loader=fs.readFileSync('js/patches/coreLoopClr16MobileUi.js','utf8');
  assert.match(loader,/coreLoopClr18StoryDensityUi\.js/);
});
