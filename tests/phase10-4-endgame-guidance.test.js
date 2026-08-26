import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildEndgameGuidance, guidanceLaneForLevel, suggestedAbyssDepth, ENDGAME_ABYSS_MAX_DEPTH } from '../js/data/endgameGuidance.js';
import { endgameRewardProfile } from '../js/data/endgameRewardScaling.js';
import { WORLD_TIERS } from '../js/data/worldTiers.js';

test('guidance lanes cover the Lv1-99999 roadmap without gaps',()=>{
  const cases=[
    [1,'story'],[2999,'story'],[3000,'awakening'],[9998,'awakening'],
    [9999,'transcendent'],[29998,'transcendent'],[29999,'divine'],[49998,'divine'],
    [49999,'cataclysm'],[74998,'cataclysm'],[74999,'boundary_zero'],[99998,'boundary_zero'],[99999,'limit'],
  ];
  for(const [level,lane] of cases)assert.equal(guidanceLaneForLevel(level).id,lane,`Lv${level}`);
});

test('recommended Abyss depth follows the canonical 3000F roadmap',()=>{
  const cases=[[1,0],[2999,0],[3000,4],[4500,24],[7000,99],[9999,249],[16000,499],[29999,999],[49999,1999],[74999,2999],[99999,3000]];
  let previous=0;
  for(const [level,depth] of cases){
    const actual=suggestedAbyssDepth(level);
    assert.equal(actual,depth,`Lv${level}`);
    assert.ok(actual>=previous);
    assert.ok(actual<=ENDGAME_ABYSS_MAX_DEPTH);
    previous=actual;
  }
});

test('guidance reward summary uses the shared Phase 10.3 reward curve',()=>{
  for(const level of [1,3000,9999,29999,49999,74999,99999]){
    const g=buildEndgameGuidance({level,abyssUnlocked:true});
    const p=endgameRewardProfile(level);
    assert.equal(g.reward.drop,p.drop);
    assert.equal(g.reward.gold,p.gold);
    assert.equal(g.reward.itemPowerBonus,p.itemPowerBonus);
  }
  const cap=buildEndgameGuidance({level:99999,abyssBestDepth:99999,worldTierId:'boundary_zero',abyssUnlocked:true});
  assert.equal(cap.recommendedAbyssDepth,3000);
  assert.equal(cap.abyssBestDepth,3000);
  assert.equal(cap.reward.drop,2.8);
  assert.equal(cap.reward.gold,4.25);
  assert.equal(cap.reward.itemPowerBonus,1250);
});

test('guidance recommends the highest unlocked World Tier and warns when active tier lags',()=>{
  for(const tier of WORLD_TIERS){
    const g=buildEndgameGuidance({level:tier.unlockLevel,worldTierId:'normal',abyssUnlocked:true});
    assert.equal(g.recommendedWorldTier,tier.id);
    if(tier.rank>0)assert.match(g.reason,/解禁済み/);
  }
});

test('guidance never sends a story-blocked character into locked Abyss',()=>{
  const blocked=buildEndgameGuidance({level:50000,abyssBestDepth:0,worldTierId:'cataclysm',abyssUnlocked:false});
  assert.equal(blocked.laneId,'story_gate');
  assert.equal(blocked.targetButtonId,'goStageBtn');
  assert.match(blocked.reason,/全章ボス/);
  const open=buildEndgameGuidance({level:50000,abyssBestDepth:1000,worldTierId:'cataclysm',abyssUnlocked:true});
  assert.equal(open.targetButtonId,'goAbyssBtn');
});

test('Nemesis pressure becomes the recommendation reason once tier is current',()=>{
  const g=buildEndgameGuidance({level:9999,abyssBestDepth:249,worldTierId:'transcendent',nemesisLevel:5,abyssUnlocked:true});
  assert.match(g.reason,/Nemesis/);
});

test('home guidance stays compact and is wired into UI Foundation home navigation',()=>{
  const nav=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  const ui=fs.readFileSync(new URL('../js/patches/endgameGuidanceUi.js',import.meta.url),'utf8');
  const css=fs.readFileSync(new URL('../css/endgameGuidance.css',import.meta.url),'utf8');
  assert.match(nav,/import '\.\/endgameGuidanceUi\.js';/);
  assert.match(ui,/data-endgame-guide/);
  assert.match(ui,/state\.isAbyssUnlocked\(\)/);
  assert.match(css,/\.endgame-guide-card/);
  assert.doesNotMatch(ui,/childList:true/);
});
