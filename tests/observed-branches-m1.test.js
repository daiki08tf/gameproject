import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OBSERVED_BRANCHES,
  OBSERVED_BRANCH_TECHNOLOGY_AXES,
  OBSERVED_BRANCH_PROFILE_LEVELS,
  observedBranchById,
  observedBranchesForPrimeRegion,
  observedBranchDiscoverySatisfied,
} from '../js/data/observedBranches.js';

test('M1 defines the first authored Branch against the existing Chapter 2 Prime Region',()=>{
  const branch=observedBranchById('tree-sovereign-deep-green');
  assert.ok(branch);
  assert.equal(branch.name,'王樹領・深緑の森');
  assert.equal(branch.observedLabel,'観測分岐：王樹領');
  assert.deepEqual(branch.primeRegionRef,{worldRegionId:'frontier',chapterId:'ch2',chapterNum:2,regionName:'深緑の森'});
  assert.equal(branch.traversable,false);
});

test('M1 technology profile uses the authored six axes without a global Tech Lv',()=>{
  const branch=OBSERVED_BRANCHES[0];
  assert.deepEqual(OBSERVED_BRANCH_TECHNOLOGY_AXES,['mechanical','arcane','bio','boundary','information','material']);
  assert.equal(branch.technologyProfile.mechanical,'regressedMajor');
  assert.equal(branch.technologyProfile.arcane,'advancedMajor');
  assert.equal(branch.technologyProfile.bio,'dominant');
  assert.equal(branch.technologyProfile.material,'advanced');
  assert.equal(OBSERVED_BRANCH_PROFILE_LEVELS.dominant,'↑↑↑');
  assert.equal('techLevel' in branch,false);
});

test('M1 keeps route and scene references authored but empty until traversal milestones',()=>{
  const branch=OBSERVED_BRANCHES[0];
  assert.deepEqual(branch.routeRefs,[]);
  assert.deepEqual(branch.sceneRefs,[]);
  assert.equal(branch.traversable,false);
});

test('M1 discovery conditions reuse the CP4 anchor deterministically',()=>{
  const branch=OBSERVED_BRANCHES[0];
  assert.deepEqual(branch.discoveryConditions.allDiscoveries,['cp4:branch-anchor:tree-sovereign']);
  assert.equal(branch.discoveryConditions.rngRequired,false);
  assert.equal(observedBranchDiscoverySatisfied(branch,{discoveries:{}}),false);
  assert.equal(observedBranchDiscoverySatisfied(branch,{discoveries:{'cp4:branch-anchor:tree-sovereign':{observed:true}}}),true);
});

test('M1 can resolve Branches by the existing Prime Region reference',()=>{
  const matches=observedBranchesForPrimeRegion({worldRegionId:'frontier',chapterNum:2});
  assert.equal(matches.length,1);
  assert.equal(matches[0].id,'tree-sovereign-deep-green');
  assert.deepEqual(observedBranchesForPrimeRegion({worldRegionId:'elemental'}),[]);
});

test('M1 Branch definitions contain no combat or reward authority',()=>{
  const forbidden=['combat','battle','rewards','reward','dropTable','loot','itemPower','currency','worldTierId'];
  for(const branch of OBSERVED_BRANCHES){
    for(const key of forbidden)assert.equal(Object.hasOwn(branch,key),false,`${branch.id} must not own ${key}`);
  }
});
