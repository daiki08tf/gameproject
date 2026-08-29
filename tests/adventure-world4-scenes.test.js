import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4SceneRuntime.js';
import { normalizeAdventure4Scene,validateAdventure4Scene,adventure4SceneChoices,resolveAdventure4SceneChoice,buildAdventure4PilotSceneCatalog } from '../js/data/adventureWorld4Scenes.js';
import { buildAdventure4PilotRoute } from '../js/data/adventureWorld4Pilot.js';

function reset(){state.data.adventure4=defaultAdventure4Session();state.data.world2={discoveries:{},flags:{},eventChains:{}};state.data.stageProgress={};}

const scene=normalizeAdventure4Scene({
  id:'test-scene',entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',text:'足跡がある。',choices:[
      {id:'inspect',label:'調べる',nextStepId:'inspect'},
      {id:'secret',label:'隠し道を見る',condition:{discovery:'map'},consequences:[{scope:'immediate',type:'routeTarget',targetId:'secret'}]},
    ]},
    {id:'inspect',phase:'investigation',text:'新しい痕跡だ。',choices:[
      {id:'record',label:'記録する',resultText:'手掛かりを記録した。',consequences:[{scope:'adventure',type:'clue',key:'track-1'},{scope:'adventure',type:'flag',key:'inspected',value:true},{scope:'region',type:'npcState',key:'scout',value:'alert'}]},
    ]},
  ],
});

test('W5 validates Observation -> Investigation scene graphs',()=>{
  assert.equal(validateAdventure4Scene(scene).ok,true);
  const bad=normalizeAdventure4Scene({id:'bad',steps:[{id:'a',choices:[{id:'x',label:'進む',nextStepId:'missing'}]}]});
  const result=validateAdventure4Scene(bad);
  assert.equal(result.ok,false);
  assert.ok(result.errors.includes('missing_step:a->missing'));
});

test('W5 supports requirement-gated choices without exposing unavailable choices',()=>{
  assert.deepEqual(adventure4SceneChoices(scene,'observe',{}).map(choice=>choice.id),['inspect']);
  assert.deepEqual(adventure4SceneChoices(scene,'observe',{hasDiscovery:id=>id==='map'}).map(choice=>choice.id),['inspect','secret']);
  assert.equal(resolveAdventure4SceneChoice(scene,'observe','secret',{}).reason,'requirement_unmet');
});

test('W5 supports nested investigation and Resolution payloads',()=>{
  const first=resolveAdventure4SceneChoice(scene,'observe','inspect',{});
  assert.equal(first.ok,true);
  assert.equal(first.nextStepId,'inspect');
  assert.equal(first.complete,false);
  const final=resolveAdventure4SceneChoice(scene,'inspect','record',{});
  assert.equal(final.ok,true);
  assert.equal(final.complete,true);
  assert.equal(final.resultText,'手掛かりを記録した。');
  assert.deepEqual(final.consequences.map(effect=>effect.scope),['adventure','adventure','region']);
});

test('W5 runtime applies only Adventure scope and surfaces Region/World effects',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const final=resolveAdventure4SceneChoice(scene,'inspect','record',{});
  const applied=state.applyAdventure4SceneResolution(final);
  assert.equal(applied.ok,true);
  assert.deepEqual(applied.session.cluesThisRun,['track-1']);
  assert.equal(applied.session.temporaryFlags.inspected,true);
  assert.equal(applied.external.length,1);
  assert.equal(applied.external[0].scope,'region');
  assert.equal(state.data.world2.flags.scout,undefined);
});

test('W5 pilot fork is a real three-phase Scene with nested investigation and route outcomes',()=>{
  const region={id:'frontier',name:'開拓辺境'};
  const route=buildAdventure4PilotRoute(region,{routeEntry:{stageId:'1-1',stageName:'草原'}});
  const fork=route.nodes.find(node=>node.id==='fork');
  assert.equal(fork.sceneId,'pilot-fork');
  const pilot=buildAdventure4PilotSceneCatalog(region,route)[0];
  assert.equal(validateAdventure4Scene(pilot).ok,true);
  const observe=pilot.steps.find(step=>step.id==='observe');
  assert.equal(observe.phase,'observation');
  assert.deepEqual(observe.choices.map(choice=>choice.id),['inspect','story','return']);
  const inspect=resolveAdventure4SceneChoice(pilot,'observe','inspect',{});
  assert.equal(inspect.nextStepId,'inspect');
  const inspectedChoice=resolveAdventure4SceneChoice(pilot,'inspect','story-after-inspect',{});
  assert.equal(inspectedChoice.nextStepId,'resolve-story-inspected');
  const resolutionStep=pilot.steps.find(step=>step.id==='resolve-story-inspected');
  assert.equal(resolutionStep.phase,'resolution');
  const finish=resolveAdventure4SceneChoice(pilot,'resolve-story-inspected','continue-story-inspected',{});
  assert.equal(finish.consequences.find(effect=>effect.type==='routeTarget').targetId,'story');
  assert.equal(finish.consequences.find(effect=>effect.type==='flag').key,'inspectedPilotFork');
});
