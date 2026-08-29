import test from 'node:test';
import assert from 'node:assert/strict';
import { buildWorld4RegionCatalog,world4RegionPresentation,world4RegionState } from '../js/data/adventureWorld4Regions.js';

const chapters=[
  {num:1,name:'第一章',stages:[
    {id:'1-1',name:'草原',recLevel:1,regionTheme:'草原と遺跡',explorationEvents:[{id:'old-stone',name:'古い石碑',kind:'lore'}]},
    {id:'1-2',name:'砦',recLevel:8,boss:true,regionTheme:'草原と遺跡',explorationEvents:[{id:'old-stone',name:'古い石碑',kind:'lore'}]},
  ]},
  {num:2,name:'第二章',stages:[
    {id:'2-1',name:'森道',recLevel:10,regionTheme:'森林',explorationEvents:[{id:'lost-cache',name:'失われた物資',kind:'loot'}]},
    {id:'2-2',name:'森王',recLevel:20,boss:true,regionTheme:'森林'},
  ]},
];
const regions=[{id:'frontier',name:'開拓辺境',subtitle:'はじまりの地',chapters:[1,2],tone:'mortal'}];

test('W1 catalog adapts existing chapter/stage metadata without cloning combat data',()=>{
  const [region]=buildWorld4RegionCatalog(chapters,regions);
  assert.equal(region.id,'frontier');
  assert.equal(region.name,'開拓辺境');
  assert.deepEqual(region.recommended,{min:1,max:20});
  assert.deepEqual(region.routeEntries.map(x=>x.stageId),['1-1','2-1']);
  assert.deepEqual(region.discoveryRefs.map(x=>x.id),['old-stone','lost-cache']);
  assert.equal('rewards' in region,false);
  assert.equal('waves' in region,false);
});

test('W1 state derives lock/progress/route entry from canonical callbacks',()=>{
  const [region]=buildWorld4RegionCatalog(chapters,regions);
  const cleared=new Set(['1-1','1-2']);
  const state=world4RegionState(region,chapters,{isStageCleared:id=>cleared.has(id),isChapterUnlocked:()=>true});
  assert.equal(state.status,'active');
  assert.equal(state.clearedChapters,1);
  assert.equal(state.routeEntry.stageId,'2-1');
});

test('W1 presentation exposes labels instead of raw internal IDs',()=>{
  const [region]=buildWorld4RegionCatalog(chapters,regions);
  const state=world4RegionState(region,chapters,{isStageCleared:()=>false,isChapterUnlocked:()=>true});
  const view=world4RegionPresentation(region,state);
  assert.equal(view.name,'開拓辺境');
  assert.equal(view.recommendedLabel,'推奨Lv 1〜20');
  assert.equal(view.stateLabel,'探索可能');
  assert.equal(view.routeLabel,'第一章：草原');
  assert.deepEqual(view.discoveries,[{name:'古い石碑',kind:'lore'},{name:'失われた物資',kind:'loot'}]);
  assert.equal('id' in view,false);
  assert.equal('stageId' in view,false);
  assert.equal(JSON.stringify(view).includes('frontier'),false);
  assert.equal(JSON.stringify(view).includes('1-1'),false);
});

test('W1 state reports locked and completed without adding new persistent state',()=>{
  const [region]=buildWorld4RegionCatalog(chapters,regions);
  const locked=world4RegionState(region,chapters,{isChapterUnlocked:()=>false});
  assert.equal(locked.status,'locked');
  assert.equal(locked.routeEntry,null);
  const completed=world4RegionState(region,chapters,{isStageCleared:()=>true,isChapterUnlocked:()=>true});
  assert.equal(completed.status,'completed');
  assert.equal(completed.clearedChapters,2);
  assert.equal(completed.routeEntry,null);
});
