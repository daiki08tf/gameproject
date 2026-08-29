import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import '../js/patches/adventureWorld4RouteEngine.js';
import { normalizeAdventure4Route,validateAdventure4Route,adventure4AvailableNext,adventure4Reachable } from '../js/data/adventureWorld4Routes.js';

const route=normalizeAdventure4Route({
  id:'frontier-story',regionId:'frontier',name:'開拓街道',entryNodeId:'gate',
  nodes:[
    {id:'gate',type:'scene',name:'街道入口',next:['fork']},
    {id:'fork',type:'event',name:'分かれ道',next:['ridge','ruins']},
    {id:'ridge',type:'battle',name:'尾根道',stageId:'1-1',next:['camp']},
    {id:'ruins',type:'discovery',name:'古代遺跡',condition:{discovery:'old-map'},next:['camp']},
    {id:'camp',type:'camp',name:'野営地',next:['boss']},
    {id:'boss',type:'boss',name:'砦門',stageId:'1-2',next:[]},
  ],
});

function reset(){state.data.adventure4=defaultAdventure4Session();state.data.world2={discoveries:{},flags:{},eventChains:{}};state.data.stageProgress={};}

test('W3 validates authored graphs and canonical battle references',()=>{
  assert.equal(validateAdventure4Route(route).ok,true);
  const bad=normalizeAdventure4Route({id:'bad',regionId:'frontier',entryNodeId:'a',nodes:[{id:'a',type:'battle',next:['missing']}]});
  const result=validateAdventure4Route(bad);
  assert.equal(result.ok,false);
  assert.ok(result.errors.includes('stage_missing:a'));
  assert.ok(result.errors.includes('missing_edge:a->missing'));
});

test('W3 supports branch and merge while filtering gated nodes',()=>{
  assert.deepEqual(adventure4AvailableNext(route,'fork',{}).map(n=>n.id),['ridge']);
  const unlocked=adventure4AvailableNext(route,'fork',{hasDiscovery:id=>id==='old-map'});
  assert.deepEqual(unlocked.map(n=>n.id),['ridge','ruins']);
  assert.deepEqual(adventure4AvailableNext(route,'ridge',{}).map(n=>n.id),['camp']);
  assert.deepEqual(adventure4AvailableNext(route,'ruins',{hasDiscovery:()=>true}).map(n=>n.id),['camp']);
});

test('W3 reachable traversal is cycle-safe and hides hidden content by default',()=>{
  const secretRoute=normalizeAdventure4Route({id:'secret-test',regionId:'frontier',nodes:[
    {id:'a',next:['b','s']},{id:'b',next:['a']},{id:'s',type:'secret',hidden:true,next:[]},
  ]});
  assert.deepEqual(adventure4Reachable(secretRoute).map(n=>n.id),['a','b']);
  assert.deepEqual(adventure4Reachable(secretRoute,{includeHidden:true}).map(n=>n.id),['a','b','s']);
});

test('W3 runtime enters route and only moves along currently available edges',()=>{
  reset();
  state.startAdventure4({regionId:'frontier'});
  const entered=state.enterAdventure4Route(route);
  assert.equal(entered.ok,true);
  assert.equal(entered.session.routeId,'frontier-story');
  assert.equal(entered.session.currentNodeId,'gate');
  assert.deepEqual(entered.session.visitedNodeIds,['gate']);

  assert.equal(state.moveAdventure4ToNode(route,'boss').reason,'unreachable_node');
  assert.equal(state.moveAdventure4ToNode(route,'fork').ok,true);
  assert.equal(state.moveAdventure4ToNode(route,'ruins').reason,'unreachable_node');
  assert.equal(state.moveAdventure4ToNode(route,'ridge').ok,true);
  assert.equal(state.moveAdventure4ToNode(route,'camp').ok,true);
  assert.equal(state.moveAdventure4ToNode(route,'boss').ok,true);
  assert.deepEqual(state.adventure4Session().visitedNodeIds,['gate','fork','ridge','camp','boss']);
});

test('W3 runtime reads persistent Discovery without copying it into Adventure state',()=>{
  reset();
  state.data.world2.discoveries['old-map']={name:'古地図'};
  state.startAdventure4({regionId:'frontier'});
  state.enterAdventure4Route(route);
  state.moveAdventure4ToNode(route,'fork');
  const view=state.adventure4RouteState(route);
  assert.deepEqual(view.next.map(n=>n.id),['ridge','ruins']);
  assert.equal('world2' in state.adventure4Session(),false);
  assert.equal(state.data.world2.discoveries['old-map'].name,'古地図');
});
