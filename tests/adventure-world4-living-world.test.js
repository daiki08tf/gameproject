import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import {
  adventure4UtilitySetFromRegionalGear,
  adventure4WorldTierAvailability,
  adventure4NemesisHuntStage,
  adventure4NemesisRegion,
  adventure4LivingWorldFlags,
  buildAdventure4LivingWorldScene,
} from '../js/data/adventureWorld4LivingWorld.js';
import { resolveAdventure4SceneChoice } from '../js/data/adventureWorld4Scenes.js';
import '../js/patches/adventureWorld4LivingWorldRuntime.js';
import '../js/patches/adventureWorld4SceneRuntime.js';

function reset(){
  state.data.adventure4=defaultAdventure4Session();
  state.data.stageProgress={};
  state.data.world2={discoveries:{},flags:{},eventsSeen:{},eventChains:{},adventureEventMeta:{adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]},lastEvent:null};
  state.data.bountyNemesis={};state.data.bounty2Wins={};state.data.bountyMarks=0;
  state.data.weaponInstances={};state.data.gearInstances={};
  state.data.equipped={weapon:null,shield:null,head:null,body:null,accessory1:null,accessory2:null};
  state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
  state.data.worldTierId='normal';
}

test('W18 utility set is derived from existing regional gear and contains no combat multiplier',()=>{
  const items=[1,2,3].map(i=>({itemPower:100+i,affixes:[{id:`a${i}`}],adventure4RegionalGear:{regionId:'frontier',profileId:'frontier-field-kit',version:1}}));
  const two=adventure4UtilitySetFromRegionalGear(items.slice(0,2),'frontier');
  const three=adventure4UtilitySetFromRegionalGear(items,'frontier');
  assert.deepEqual(two.effects,['routeIntel','traceLens']);
  assert.deepEqual(three.effects,['routeIntel','traceLens','campToolkit']);
  assert.equal('atk' in three,false);assert.equal('damage' in three,false);assert.equal('mult' in three,false);
});

test('W18 runtime reads equipped Equipment 3.0 instances without a parallel inventory',()=>{
  reset();
  for(let i=1;i<=3;i++)state.data.gearInstances[`g#${i}`]={itemPower:500+i,affixes:[],adventure4RegionalGear:{regionId:'frontier',profileId:'frontier-field-kit',version:1}};
  state.data.equipped.head='g#1';state.data.equipped.body='g#2';state.data.equipped.accessory1='g#3';
  const status=state.adventure4UtilitySetStatus('frontier');
  assert.equal(status.count,3);assert.ok(status.effects.includes('campToolkit'));
  assert.equal(state.data.adventureUtilityInventory,undefined);
});

test('W19 Nemesis hunt derives Activity -> Trace -> Clue -> location from authoritative intel/huntMode',()=>{
  assert.equal(adventure4NemesisHuntStage({active:true,intel:[]}), 'activity');
  assert.equal(adventure4NemesisHuntStage({active:true,intel:['weakness']}), 'trace');
  assert.equal(adventure4NemesisHuntStage({active:true,intel:['weakness','mutation']}), 'clue');
  assert.equal(adventure4NemesisHuntStage({active:true,intel:['weakness','mutation'],huntMode:'preempt'}), 'located');
});

test('W19 Adventure pursuit updates existing Bounty Nemesis authority and preserves it across escape',()=>{
  reset();
  state.data.bountyNemesis['bounty-redfang-varg']={level:3,wins:0,losses:1,bestLevel:3,traits:[],intel:[],huntMode:null};
  const initialRegion=adventure4NemesisRegion('bounty-redfang-varg',0);
  state.startAdventure4({regionId:initialRegion});
  assert.equal(state.adventure4NemesisHuntState().stage,'activity');
  assert.equal(state.advanceAdventure4NemesisHunt().stage,'trace');
  assert.deepEqual(state.data.bountyNemesis['bounty-redfang-varg'].intel,['weakness']);
  const escaped=state.escapeAdventure4NemesisHunt();assert.equal(escaped.ok,true);
  assert.deepEqual(state.data.bountyNemesis['bounty-redfang-varg'].intel,['weakness']);
  state.advanceAdventure4NemesisHunt();
  state.advanceAdventure4NemesisHunt();
  const located=state.adventure4NemesisHuntState();assert.equal(located.stage,'located');assert.equal(located.targetStageId,'bounty-redfang-varg');
});

test('W20 current World Event is injected into Adventure event context, not re-resolved for rewards',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  state.data.world2.lastEvent={id:'storm-caravan',name:'嵐の隊商',choices:[{label:'助ける'}]};
  const ctx=state.adventure4EventContext();
  assert.equal(ctx.flags['living:event:storm-caravan'],true);
  assert.equal(ctx.livingWorld.worldEvent.id,'storm-caravan');
  assert.equal(state.data.world2.eventsSeen['storm-caravan'],undefined);
});

test('W21 deterministic Settlement season/weather/daypart are consumed as Adventure flags',()=>{
  reset();state.startAdventure4({regionId:'frontier'});
  const cycle=state.settlementSeasonState();
  const living=state.adventure4LivingWorldContext();
  assert.equal(living.seasonId,cycle.season.id);assert.equal(living.weatherId,cycle.weather.id);assert.equal(living.daypartId,cycle.daypart.id);
  const flags=adventure4LivingWorldFlags({season:living.seasonId,weather:living.weatherId,daypart:living.daypartId});
  assert.equal(flags[`living:season:${living.seasonId}`],true);assert.equal(flags[`living:weather:${living.weatherId}`],true);assert.equal(flags[`living:daypart:${living.daypartId}`],true);
});

test('W22 World Tier changes optional content availability without defining scaling',()=>{
  const normal=adventure4WorldTierAvailability(0),high=adventure4WorldTierAvailability(4);
  assert.equal(normal.elite,false);assert.equal(normal.anomaly,false);
  assert.equal(high.elite,true);assert.equal(high.nemesis,true);assert.equal(high.anomaly,true);assert.equal(high.secret,true);assert.equal(high.endgame,true);
  assert.equal('enemyHp' in high,false);assert.equal('drop' in high,false);assert.equal('itemPowerBonus' in high,false);
});

test('W19/W21/W22 authored Living World scene remains optional and located Nemesis points to existing battle stage',()=>{
  const scene=buildAdventure4LivingWorldScene({regionId:'frontier',regionName:'開拓辺境',weatherId:'mist',weatherName:'霧',daypartId:'night',daypartName:'夜',utility:{effects:['routeIntel']},nemesisStage:'located',nemesisHere:true,nemesisId:'bounty-redfang-varg',worldTierAvailability:{anomaly:true}});
  const ids=scene.steps[0].choices.map(c=>c.id);
  assert.ok(ids.includes('observe'));assert.ok(ids.includes('conditions'));assert.ok(ids.includes('nemesis'));assert.ok(ids.includes('anomaly'));
  const result=resolveAdventure4SceneChoice(scene,'observe','nemesis',{});
  assert.equal(result.ok,true);assert.deepEqual(result.consequences,[{scope:'immediate',type:'nemesisBattle',key:null,value:true,targetId:'bounty-redfang-varg'}]);
});
