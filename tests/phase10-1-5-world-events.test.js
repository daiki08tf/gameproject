import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  WORLD_EVENT_BASE_CHANCE,WORLD_EVENT_COOLDOWN_CLEARS,WORLD_EVENT_CHAINS,WORLD_EVENT_SINGLES,
  eventChanceForDryStreak,eligibleChainFollowups,materializeWorldEvent,rollWorldEvent2
} from '../js/data/worldEvents2.js';

test('World Event 2.0 is deliberately low frequency with light pity',()=>{
  assert.equal(WORLD_EVENT_BASE_CHANCE,.07);
  assert.equal(WORLD_EVENT_COOLDOWN_CLEARS,2);
  assert.equal(eventChanceForDryStreak(0),.07);
  assert.equal(eventChanceForDryStreak(17),.07);
  assert.equal(eventChanceForDryStreak(18),.08);
  assert.equal(eventChanceForDryStreak(22),.10);
  assert.equal(eventChanceForDryStreak(26),.12);
});

test('eight event chains each contain four meaningful branching beats',()=>{
  const chains=Object.values(WORLD_EVENT_CHAINS);
  assert.equal(chains.length,8);
  for(const chain of chains){
    assert.equal(chain.steps.length,4,`${chain.id} must have four beats`);
    for(const [index,event] of chain.steps.entries()){
      assert.ok(event.text?.length>15,`${event.id} needs narrative text`);
      assert.ok(event.choices.length>=2,`${event.id} needs branching choices`);
      for(const c of event.choices){
        assert.ok(c.label);
        assert.ok(c.outcome?.hint);
        if(index<3)assert.ok(Number.isInteger(c.outcome.next),`${event.id}/${c.label} must continue chain`);
        else assert.equal(c.outcome.chainEnd,true,`${event.id}/${c.label} must close chain`);
      }
    }
  }
  assert.ok(WORLD_EVENT_SINGLES.length>=6);
});

test('job-specific choices are hidden unless their condition is met',()=>{
  const event=WORLD_EVENT_CHAINS.beast.steps[0];
  const warrior=materializeWorldEvent(event,{currentJobId:'warrior'});
  const hunter=materializeWorldEvent(event,{currentJobId:'hunter'});
  assert.equal(warrior.choices.includes('痕跡を読む'),false);
  assert.equal(hunter.choices.includes('痕跡を読む'),true);
});

test('chain followups respect active chain state and special chains stay gated',()=>{
  const state={traveler:{started:true,step:1,wait:0,completed:false}};
  const ctx={progress:20,currentJobId:'warrior',flags:{},machineUnlocked:false,nemesisEligible:false};
  const followups=eligibleChainFollowups(state,ctx);
  assert.equal(followups.some(x=>x.chain.id==='traveler'&&x.step===1),true);
  const event=rollWorldEvent2({chainState:{},ctx,rng:()=>0});
  assert.ok(event);
  assert.notEqual(event.chainId,'machine');
  assert.notEqual(event.chainId,'nemesis');
});

test('runtime persists dry streak, cooldown, chain waits and outcome flags',()=>{
  const core=fs.readFileSync(new URL('../js/patches/world2Core.js',import.meta.url),'utf8');
  assert.match(core,/eventDryClears/);
  assert.match(core,/eventCooldown/);
  assert.match(core,/eventChains/);
  assert.match(core,/chain\.wait=4/);
  assert.match(core,/outcome\?\.flag/);
  assert.match(core,/followupChance:\.30/);
});
