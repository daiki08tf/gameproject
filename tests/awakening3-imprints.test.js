import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { awakeningImprintList, getAwakeningImprint } from '../js/data/awakeningImprints.js';

test('Awakening 3.0 exposes three permanent build routes',()=>{
  const list=awakeningImprintList();
  assert.equal(list.length,3);
  assert.deepEqual(new Set(list.map(x=>x.id)),new Set(['conquest','guardian','arcana']));
});

test('imprint effects scale gently with awakening rank',()=>{
  const conquest=getAwakeningImprint('conquest');
  const guardian=getAwakeningImprint('guardian');
  const arcana=getAwakeningImprint('arcana');
  assert.equal(conquest.effectForRank(1).kind,'dmgBonusAdd');
  assert.equal(guardian.effectForRank(1).kind,'bossSpecialMitigation');
  assert.equal(arcana.effectForRank(1).kind,'mpCostReduce');
  assert.ok(conquest.effectForRank(4).power>conquest.effectForRank(1).power);
  assert.ok(conquest.effectForRank(4).power<0.05);
  assert.ok(guardian.effectForRank(4).power<0.1);
  assert.ok(arcana.effectForRank(4).power<0.1);
});

test('runtime locks an already selected rank and loads after Awakening 2 cleanup',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/awakening3Imprints.js',import.meta.url),'utf8');
  assert.match(runtime,/if\(this\.awakening3ImprintForRank\(r\)\)return false/);
  assert.match(runtime,/getEquippedEffectsWithAwakening3/);
  const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');
  const v2=main.indexOf("./patches/systemCleanupAwakeningV2.js");
  const v3=main.indexOf("./patches/awakening3Imprints.js");
  assert.ok(v2>=0&&v3>v2);
});
