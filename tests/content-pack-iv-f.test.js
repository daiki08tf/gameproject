import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CP4_IDENTITY_REWARD,cp4IdentityRewardProgress } from '../js/data/contentPackIVF.js';

test('CP4-6 reward is gated only by the observed first Branch anchor',()=>{
  const def=CP4_IDENTITY_REWARD;
  assert.equal(def.prerequisiteDiscoveryId,'cp4:branch-anchor:tree-sovereign');
  assert.equal(cp4IdentityRewardProgress({discoveries:{}}).eligible,false);
  assert.equal(cp4IdentityRewardProgress({discoveries:{[def.prerequisiteDiscoveryId]:{}}}).eligible,true);
});

test('CP4-6 identity reward reuses existing mythic Unique equipment vocabulary',()=>{
  const item=CP4_IDENTITY_REWARD.item;
  assert.equal(item.id,'uq_cp4_parallax_echo_emblem');
  assert.equal(item.name,'視差残響章');
  assert.equal(item.slot,'accessory');
  assert.equal(item.rarity,'mythic');
  assert.equal(item.unique,true);
  assert.equal(item.contentPackIV,true);
  assert.equal(item.branchTechnology,false);
  assert.equal(item.branchSightRequiredForEffect,false);
  assert.deepEqual(item.effects,[{trigger:'passive',kind:'actionDiversityBuff',power:.24,turns:3}]);
});

test('CP4-6 reward is Prime-side identity, not mature Branch technology',()=>{
  const data=fs.readFileSync(new URL('../js/data/contentPackIVF.js',import.meta.url),'utf8');
  assert.match(data,/Prime側/);
  assert.match(data,/王樹領から持ち帰った技術ではなく/);
  assert.doesNotMatch(data,/深緑消失域|Transcendent|超観測者|日本|東京|Earth/i);
});

test('CP4-6 runtime registers through the existing Unique list and inventory pipeline',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVF.js',import.meta.url),'utf8');
  assert.match(runtime,/BOUNTY_UNIQUES/);
  assert.match(runtime,/state\.addItem\(CP4_IDENTITY_REWARD\.item\.id,1/);
  assert.match(runtime,/state\.data\.inventory/);
  assert.match(runtime,/state\.data\.equipped/);
  assert.match(runtime,/world\(\)\.discoveries|return world\(\)\.discoveries/);
});

test('CP4-6 reward record is idempotent and never becomes a progression gate',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVF.js',import.meta.url),'utf8');
  assert.match(runtime,/if\(progress\.granted\)return/);
  assert.match(runtime,/progressionGate:false/);
  assert.match(runtime,/mandatoryEquipment:false/);
  assert.match(runtime,/branchTechnology:false/);
  assert.doesNotMatch(runtime,/Math\.random|branchCurrency|branchXp|branchLevel|stamina|worldTier|gearScore/i);
});

test('CP4-6 introduces no fourth Option, rarity, Item Power override, or Branch Sight combat stat',()=>{
  const data=fs.readFileSync(new URL('../js/data/contentPackIVF.js',import.meta.url),'utf8');
  const runtime=fs.readFileSync(new URL('../js/patches/contentPackIVF.js',import.meta.url),'utf8');
  assert.doesNotMatch(data,/option4|fourthOption|itemPower|branchRarity|multiverseToken/i);
  assert.doesNotMatch(runtime,/option4|fourthOption|itemPower|branchRarity|multiverseToken/i);
  assert.doesNotMatch(runtime,/branchSight.*(?:atk|mag|def|spd|damage|bonus)/i);
});

test('CP4-6 bootstraps from CP4-5 and grants immediately after first anchor observation',()=>{
  const parent=fs.readFileSync(new URL('../js/patches/contentPackIVE.js',import.meta.url),'utf8');
  const anchor=fs.readFileSync(new URL('../js/patches/contentPackIVD.js',import.meta.url),'utf8');
  assert.match(parent,/import '\.\/contentPackIVF\.js';/);
  assert.match(anchor,/import \{ syncCP4IdentityReward \} from '\.\/contentPackIVF\.js';/);
  assert.match(anchor,/function observeAnchor\(/);
  assert.match(anchor,/syncCP4IdentityReward\(\);/);
  assert.match(anchor,/return world\(\)\.discoveries\[anchor\.discoveryId\]/);
});
