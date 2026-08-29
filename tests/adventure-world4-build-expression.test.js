import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import { adventure4SceneChoices,validateAdventure4Scene } from '../js/data/adventureWorld4Scenes.js';
import { buildAdventure4BuildExpressionScene } from '../js/data/adventureWorld4FieldActions.js';
import '../js/patches/adventureWorld4BuildExpressionRuntime.js';

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.currentJobId='none';
  state.data.companionInstances={};state.data.companionParty=[null,null,null];
  state.data.rune2Active={};state.data.rune2Owned={};
  state.data.weaponInstances={};state.data.gearInstances={};
  state.data.equipped={weapon:null,shield:null,head:null,body:null,accessory1:null,accessory2:null};
}
function choiceIds(){const scene=buildAdventure4BuildExpressionScene('frontier'),session=state.adventure4Session();return adventure4SceneChoices(scene,'observe',{flags:session.temporaryFlags||{}}).map(x=>x.id);}

test('W14 Job changes available solution in the same Scene while normal solution remains',()=>{
  reset();state.data.currentJobId='warrior';state.startAdventure4({regionId:'frontier'});state.adventure4RefreshFieldActionFlags();
  assert.deepEqual(validateAdventure4Scene(buildAdventure4BuildExpressionScene('frontier')),{ok:true,errors:[]});
  assert.ok(choiceIds().includes('normal'));assert.ok(choiceIds().includes('force'));assert.equal(choiceIds().includes('scout'),false);
  state.data.currentJobId='thief';state.adventure4RefreshFieldActionFlags();
  assert.ok(choiceIds().includes('normal'));assert.ok(choiceIds().includes('scout'));assert.equal(choiceIds().includes('force'),false);
});

test('W15 active Companion species traits and nature create field reactions without becoming mandatory',()=>{
  reset();state.data.companionInstances['bat#1']={speciesId:'bat',nature:'cautious',level:1};state.data.companionParty=['bat#1',null,null];
  state.startAdventure4({regionId:'frontier'});state.adventure4RefreshFieldActionFlags();
  const sources=state.adventure4FieldActionSources();assert.ok(sources.scout.some(x=>x.kind==='companion'));assert.ok(choiceIds().includes('normal'));assert.ok(choiceIds().includes('scout'));
});

test('W16 Regional Gear annotates the existing equipment instance and contributes field actions',()=>{
  reset();state.data.gearInstances['test_head#1']={displayName:'試作兜',itemPower:500,affixes:[]};state.data.equipped.head='test_head#1';
  const tagged=state.adventure4TagRegionalGear('test_head#1','frontier');assert.equal(tagged.ok,true);assert.equal(state.data.gearInstances['test_head#1'].itemPower,500);assert.deepEqual(state.data.gearInstances['test_head#1'].affixes,[]);
  const sources=state.adventure4FieldActionSources();assert.ok(sources.scout.some(x=>x.kind==='equipment'));assert.ok(sources.track.some(x=>x.kind==='equipment'));
});

test('W17 Rune 2.0 active marks add exploration information actions',()=>{
  reset();state.data.rune2Active={observe:1,hawkeye:2,fate:1};
  const sources=state.adventure4FieldActionSources();assert.ok(sources.analyze.some(x=>x.kind==='rune'&&x.id==='observe'));assert.ok(sources.scout.some(x=>x.kind==='rune'&&x.id==='hawkeye'));assert.ok(sources.anomaly.some(x=>x.kind==='rune'&&x.id==='fate'));
});

test('W14-W17 field flags are Adventure-scoped and do not add progression currencies',()=>{
  reset();state.data.currentJobId='scholar';state.startAdventure4({regionId:'frontier'});state.adventure4RefreshFieldActionFlags();
  const session=state.adventure4Session();assert.equal(session.temporaryFlags['field:analyze'],true);assert.equal(session.temporaryFlags['field:anomaly'],true);
  for(const forbidden of ['adventureXp','explorationXp','worldToken','energy','stamina'])assert.equal(Object.hasOwn(state.data,forbidden),false);
});
