import test from 'node:test';
import assert from 'node:assert/strict';
import { world3BranchSummary, world3BranchLabel } from '../js/data/world3Branches.js';

test('World 3 branch summary counts discovered and unlocked routes',()=>{
  const summary=world3BranchSummary({keyFragments:7,keyCount:2,secretSites:[{state:'hidden',unlocked:false},{state:'discovered',unlocked:false},{state:'unlocked',unlocked:true}],riftKeys:[{id:'a'},{id:'b'}]});
  assert.deepEqual(summary,{keyFragments:7,keyCount:2,discovered:2,unlocked:1,riftKeyCount:2});
  const label=world3BranchLabel({keyFragments:7,keyCount:2,secretSites:[{state:'unlocked',unlocked:true}],riftKeys:[{}]});
  assert.match(label,/鍵片 7/);assert.match(label,/異界 1/);assert.match(label,/裂界鍵 1/);
});
