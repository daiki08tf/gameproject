import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { defaultAdventure4Session,normalizeAdventure4Session,ADVENTURE4_VERSION } from '../js/patches/adventureWorld4Session.js';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');

test('W33 final UI stays mobile-first and reuses the existing Stage entry',()=>{
  const ui=read('js/patches/adventureWorld4Ui.js');
  const css=read('css/adventureWorld4.css');
  assert.match(ui,/getElementById\('goStageBtn'\)/);
  assert.doesNotMatch(ui,/id\s*=\s*['"]adventure4HomeBtn['"]|getElementById\(['"]adventure4HomeBtn['"]\)/i);
  assert.match(css,/@media\(max-width:480px\)/);
  assert.match(css,/-webkit-line-clamp:3/);
  assert.match(css,/text-overflow:ellipsis/);
  assert.match(css,/overflow-x:auto/);
});

test('W33 visible Adventure labels do not expose route/debug identifiers',()=>{
  const ui=read('js/patches/adventureWorld4Ui.js');
  assert.doesNotMatch(ui,/innerHTML=`[^`]*\$\{(?:current|region|route)\.id\}/);
  assert.doesNotMatch(ui,/textContent\s*=\s*(?:current|region|route)\.id/);
  assert.doesNotMatch(ui,/DEBUG|debug text/i);
});

test('W34 missing and unknown fields safely backfill to the current Adventure schema',()=>{
  const normalized=normalizeAdventure4Session({active:true,regionId:'frontier',unknownFutureField:'ignored',visitedNodeIds:['entry','entry',null],temporaryFlags:null});
  assert.equal(normalized.version,ADVENTURE4_VERSION);
  assert.equal(normalized.active,true);
  assert.equal(normalized.regionId,'frontier');
  assert.deepEqual(normalized.visitedNodeIds,['entry']);
  assert.deepEqual(normalized.temporaryFlags,{});
  assert.equal('unknownFutureField' in normalized,false);
});

test('W34 incomplete legacy Adventure state fails safe instead of producing a dead session',()=>{
  assert.deepEqual(normalizeAdventure4Session({active:true}),defaultAdventure4Session());
  assert.deepEqual(normalizeAdventure4Session(null),defaultAdventure4Session());
  assert.deepEqual(normalizeAdventure4Session('bad-save'),defaultAdventure4Session());
});

test('W34 current interrupted Adventure preserves resumable encounter and navigation data',()=>{
  const saved={active:true,suspended:true,regionId:'fracture',routeId:'fracture-story-route',currentNodeId:'story-battle',visitedNodeIds:['entry','fork'],temporaryFlags:{clue:true},pendingEncounter:{nodeId:'story-battle',stageId:'chapter-x'},returnTarget:'home'};
  const normalized=normalizeAdventure4Session(saved);
  assert.equal(normalized.suspended,true);
  assert.equal(normalized.routeId,saved.routeId);
  assert.equal(normalized.currentNodeId,saved.currentNodeId);
  assert.deepEqual(normalized.pendingEncounter,saved.pendingEncounter);
  assert.deepEqual(normalized.temporaryFlags,{clue:true});
});

test('W34 Adventure save owns navigation only and does not duplicate canonical progression roots',()=>{
  const ownedKeys=Object.keys(defaultAdventure4Session()).sort();
  assert.deepEqual(ownedKeys,[
    'active','campUsed','cluesThisRun','currentNodeId','discoveredThisRun','pendingEncounter',
    'regionId','returnTarget','routeId','seed','suspended','temporaryFlags','version','visitedNodeIds'
  ].sort());
  for(const forbidden of ['characterLevel','worldTierId','bountyNemesis','inventory','equipment','stageProgress','discoveries']){
    assert.equal(ownedKeys.includes(forbidden),false,`${forbidden} must remain external to Adventure4 session`);
  }
});

test('W35 Adventure integration never reimplements BattleEngine or endgame multipliers',()=>{
  const files=['js/patches/adventureWorld4Ui.js','js/patches/adventureWorld4ContentPackI.js','js/patches/adventureWorld4ContentPackII.js','js/patches/adventureWorld4WorldRecords.js','js/data/adventureWorld4HorizontalGear.js'];
  const source=files.map(read).join('\n');
  assert.doesNotMatch(source,/class\s+BattleEngine|new\s+BattleEngine/);
  assert.doesNotMatch(source,/dropMultiplier\s*=|goldMultiplier\s*=|rewardMultiplier\s*=|itemPowerBonus\s*=/);
  assert.match(read('js/patches/adventureWorld4Ui.js'),/TextBattleScreen/);
});

test('W35 Story, World Tier, Nemesis, Settlement and endgame gear remain external authorities',()=>{
  const regions=read('js/data/adventureWorld4Regions.js');
  const highLevel=read('js/data/adventureWorld4HighLevel.js');
  const records=read('js/patches/adventureWorld4WorldRecords.js');
  const gear=read('js/data/adventureWorld4HorizontalGear.js');
  assert.match(regions,/CHAPTER|chapter|Stage|stage/);
  assert.match(highLevel,/adventure4WorldTierAvailability/);
  assert.match(records,/bountyNemesis/);
  assert.match(records,/Settlement Chronicle|settlement/i);
  assert.match(gear,/BOUNTY_UNIQUES/);
});

test('W36 final source audit has consumers for the late World 4 runtime hooks',()=>{
  const ui=read('js/patches/adventureWorld4Ui.js');
  const settlement=read('js/patches/settlementChronicle.js');
  assert.match(ui,/adventure4HighLevelStateForRegion/);
  assert.match(ui,/adventure4ContentPackIScene/);
  assert.match(settlement,/adventure4WorldRecords/);
  assert.match(settlement,/adventure4WorldRecordSummary/);
});
