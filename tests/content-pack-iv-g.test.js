import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read=path=>fs.readFileSync(new URL(`../${path}`,import.meta.url),'utf8');
const cp4Runtime=[
  'js/data/contentPackIVA.js','js/data/contentPackIVB.js','js/data/contentPackIVC.js',
  'js/data/contentPackIVD.js','js/data/contentPackIVE.js','js/data/contentPackIVF.js',
  'js/patches/contentPackIVA.js','js/patches/contentPackIVB.js','js/patches/contentPackIVC.js',
  'js/patches/contentPackIVD.js','js/patches/contentPackIVE.js','js/patches/contentPackIVF.js',
].map(read).join('\n');

test('CP4-7 keeps CP4 bootstrapped in-place without a new Home mode',()=>{
  const home=read('js/patches/homeNavigation.js');
  assert.match(home,/import '\.\/contentPackIVA\.js';/);
  assert.doesNotMatch(cp4Runtime,/homeButton|homeEntry|renderHome|new Home/i);
});

test('CP4-7 keeps Branch Sight authored and non-combat',()=>{
  const data=read('js/data/contentPackIVC.js');
  const runtime=read('js/patches/contentPackIVC.js');
  assert.match(data,/numeric:false/);
  assert.match(data,/trainable:false/);
  assert.match(data,/equippable:false/);
  assert.match(data,/battleBonus:false/);
  assert.match(runtime,/hasBranchSight/);
  assert.doesNotMatch(`${data}\n${runtime}`,/worldTier|gearScore|Math\.random|difficulty/i);
});

test('CP4-7 leaves the first observed Branch non-traversable',()=>{
  const runtime=read('js/patches/contentPackIVD.js');
  assert.match(runtime,/traversable:false/);
  assert.doesNotMatch(runtime,/teleport|portal|onPick|travelTo|startBranch/i);
});

test('CP4-7 reward is optional and stays on existing Unique/inventory authority',()=>{
  const data=read('js/data/contentPackIVF.js');
  const runtime=read('js/patches/contentPackIVF.js');
  assert.match(runtime,/BOUNTY_UNIQUES/);
  assert.match(runtime,/state\.addItem/);
  assert.match(data,/mandatoryEquipment:false|branchSightRequiredForEffect:false/);
  assert.match(runtime,/progressionGate:false/);
  assert.doesNotMatch(`${data}\n${runtime}`,/itemPower\s*:|options\s*:|fourthOption|branchCurrency|branchXp/i);
});

test('CP4-7 runtime does not introduce mandatory RNG, difficulty or real-world reveals',()=>{
  assert.doesNotMatch(cp4Runtime,/Math\.random/);
  assert.doesNotMatch(cp4Runtime,/Japan|Tokyo|Earth/);
  assert.doesNotMatch(cp4Runtime,/Transcendent/);
  assert.doesNotMatch(cp4Runtime,/multiverseToken|branchCurrency|branchStamina|branchEnergy|branchLevel|branchXp/i);
});

test('CP4-7 preserves hidden branch-count and absent-history boundaries',()=>{
  const anchor=read('js/patches/contentPackIVD.js');
  assert.match(anchor,/deepGreenAbsentHidden:true/);
  assert.match(anchor,/totalBranchCountHidden:true/);
  assert.doesNotMatch(cp4Runtime,/深緑消失域/);
});

test('CP4-7 audit hands off to Observed Branches M0-M4',()=>{
  const audit=read('CONTENT_PACK_IV_CP4_7_AUDIT.md');
  const roadmap=read('OBSERVED_BRANCHES_MULTIVERSE_ROADMAP.md');
  assert.match(audit,/M0–M4/);
  assert.match(roadmap,/M0 — Multiverse \/ authority audit/);
  assert.match(roadmap,/M4 — First Branch vertical slice: 王樹領/);
});
