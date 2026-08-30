import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  knownObservedBranches,
  knownObservedBranchesForPrimeRegion,
  observedBranchRegionDiscoveryView,
} from '../js/data/observedBranchDiscovery.js';

const anchorId='cp4:branch-anchor:tree-sovereign';

test('M2 exposes no Branch identity or placeholder before discovery',()=>{
  assert.deepEqual(knownObservedBranches({discoveries:{}}),[]);
  const view=observedBranchRegionDiscoveryView({worldRegionId:'frontier',chapterNum:2},{discoveries:{}});
  assert.deepEqual(view,{branches:[]});
  assert.equal(Object.hasOwn(view,'hiddenBranches'),false);
  assert.equal(Object.hasOwn(view,'totalBranchCount'),false);
  assert.equal(Object.hasOwn(view,'unknownCount'),false);
});

test('M2 exposes 王樹領 only after the existing CP4 discovery is recorded',()=>{
  const discoveries={[anchorId]:{name:'観測分岐：王樹領',observedBranchAnchor:true}};
  const known=knownObservedBranches({discoveries});
  assert.equal(known.length,1);
  assert.equal(known[0].id,'tree-sovereign-deep-green');
  assert.equal(known[0].name,'王樹領・深緑の森');
});

test('M2 scopes known Branches to the existing Prime Region context',()=>{
  const discoveries={[anchorId]:{observedBranchAnchor:true}};
  assert.equal(knownObservedBranchesForPrimeRegion({worldRegionId:'frontier',chapterNum:2},{discoveries}).length,1);
  assert.deepEqual(knownObservedBranchesForPrimeRegion({worldRegionId:'elemental'},{discoveries}),[]);
});

test('M2 first required Branch discovery remains deterministic and RNG-free',()=>{
  const branchData=fs.readFileSync(new URL('../js/data/observedBranches.js',import.meta.url),'utf8');
  const discovery=fs.readFileSync(new URL('../js/data/observedBranchDiscovery.js',import.meta.url),'utf8');
  const cp4=fs.readFileSync(new URL('../js/patches/contentPackIVD.js',import.meta.url),'utf8');
  assert.match(branchData,/cp4:branch-anchor:tree-sovereign/);
  assert.match(branchData,/rngRequired:false/);
  assert.match(cp4,/observeCP4FirstBranchAnchor/);
  assert.doesNotMatch(`${branchData}\n${discovery}\n${cp4}`,/Math\.random/);
});

test('M2 discovery projection owns no menu, traversal, currency or progression state',()=>{
  const source=fs.readFileSync(new URL('../js/data/observedBranchDiscovery.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/homeButton|renderHome|branchMenu|teleport|travelTo|branchCurrency|branchLevel|branchStamina|branchEnergy/i);
});
