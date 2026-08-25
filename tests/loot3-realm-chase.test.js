import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  grantHeavenRelicChase,
  grantUnderworldUniqueEcho,
  installLoot3RealmChase,
  HEAVEN_COST_SHARE,
  UNIQUE_ECHO_MAX,
  UNIQUE_ECHO_TRIAL_SHARE,
} from '../js/patches/loot3RealmChaseRewards.js';
import { RELICS } from '../js/data/artifacts.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';

function seq(...values){let i=0;return()=>values[Math.min(i++,values.length-1)] ?? 0;}

function fakeTarget(){
  return {
    data:{gold:100,manastone:10,loot3RealmChase:{uniqueEchoes:{}}},
    save(){},
    isArtifactUnlocked(){return false;},
    artifactProgressionGate(id){return {met:id===RELICS[0].id};},
    artifactUnlockCostV2(){return {gold:2000,manastone:40};},
    isBountyDefeated(id){return id===BOUNTY_UNIQUES[0].bountyId;},
    getUniqueTrialProgress(id){return BOUNTY_UNIQUES.some(u=>u.id===id)?{awakened:false,counts:{kill:75},trials:[{event:'kill',target:100,count:75,done:false}],ready:false}:null;},
  };
}

test('Heaven only accelerates a Relic whose normal progression gate is already met',()=>{
  const target=fakeTarget();
  const reward=grantHeavenRelicChase(target,seq(0,0));
  assert.equal(reward.id,RELICS[0].id);
  assert.equal(reward.gold,Math.round(2000*HEAVEN_COST_SHARE));
  assert.equal(reward.manastone,Math.round(40*HEAVEN_COST_SHARE));
  assert.equal(target.data.gold,100+reward.gold);
  assert.equal(target.data.manastone,10+reward.manastone);

  target.artifactProgressionGate=()=>({met:false});
  assert.equal(grantHeavenRelicChase(target,seq(0,0)),null);
});

test('Underworld echoes require a defeated Bounty Unique and stop at the hard cap',()=>{
  const target=fakeTarget();
  for(let i=1;i<=UNIQUE_ECHO_MAX;i++){
    const reward=grantUnderworldUniqueEcho(target,seq(0,0));
    assert.equal(reward.id,BOUNTY_UNIQUES[0].id);
    assert.equal(reward.echoes,i);
  }
  assert.equal(grantUnderworldUniqueEcho(target,seq(0,0)),null);
  assert.equal(target.data.loot3RealmChase.uniqueEchoes[BOUNTY_UNIQUES[0].id],UNIQUE_ECHO_MAX);
});

test('five Unique echoes can cover only 25% of the initial mastery trial',()=>{
  const target=fakeTarget();
  const id=BOUNTY_UNIQUES[0].id;
  target.data.loot3RealmChase.uniqueEchoes[id]=UNIQUE_ECHO_MAX;
  installLoot3RealmChase(target);
  const progress=target.getUniqueTrialProgress(id);
  assert.equal(progress.echoBonusPct,UNIQUE_ECHO_MAX*UNIQUE_ECHO_TRIAL_SHARE*100);
  assert.equal(progress.trials[0].count,100);
  assert.equal(progress.trials[0].realmEchoBonus,25);
  assert.equal(progress.ready,true);
});

test('realm chase is installed after Unique trial foundation and is visible in results',()=>{
  const foundation=fs.readFileSync(new URL('../js/patches/uniqueTrialFoundation.js',import.meta.url),'utf8');
  const result=fs.readFileSync(new URL('../js/screens/result.js',import.meta.url),'utf8');
  assert.match(foundation,/installLoot3RealmChase\(state\)/);
  assert.match(result,/TARGET FARM BONUS/);
  assert.match(result,/RELIC RESONANCE/);
  assert.match(result,/UNIQUE ECHO/);
});
