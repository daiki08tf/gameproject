import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { enemy3TacticalContext,enemy3ShouldReserveSkill } from '../js/data/enemy3Targeting.js';

function ctx(role,overrides={}){
  return {role,ready:true,playerHpRatio:1,playerAtkBuffed:false,playerAtkDebuffed:false,playerSpdBuffed:false,playerSpdDebuffed:false,lowestAllyHpRatio:1,hasInjuredAlly:false,...overrides};
}

test('attacker keeps random baseline but executes low-HP pressure',()=>{
  assert.equal(enemy3ShouldReserveSkill(ctx('attacker'),false),false);
  assert.equal(enemy3ShouldReserveSkill(ctx('attacker',{playerHpRatio:.35}),false),true);
  assert.equal(enemy3ShouldReserveSkill(ctx('attacker',{ready:false,playerHpRatio:.2}),true),false);
});

test('caster reacts to speed setup without redundant slow refresh',()=>{
  assert.equal(enemy3ShouldReserveSkill(ctx('caster',{playerSpdBuffed:true}),false),true);
  assert.equal(enemy3ShouldReserveSkill(ctx('caster',{playerSpdDebuffed:true}),true),false);
});

test('trickster reacts to attack setup without redundant weaken refresh',()=>{
  assert.equal(enemy3ShouldReserveSkill(ctx('trickster',{playerAtkBuffed:true}),false),true);
  assert.equal(enemy3ShouldReserveSkill(ctx('trickster',{playerAtkDebuffed:true}),true),false);
});

test('support only reserves meaningful healing and keeps lowest-ally targeting external',()=>{
  assert.equal(enemy3ShouldReserveSkill(ctx('support'),true),false);
  assert.equal(enemy3ShouldReserveSkill(ctx('support',{hasInjuredAlly:true,lowestAllyHpRatio:.8}),true),false);
  assert.equal(enemy3ShouldReserveSkill(ctx('support',{hasInjuredAlly:true,lowestAllyHpRatio:.55}),true),true);
  assert.equal(enemy3ShouldReserveSkill(ctx('support',{hasInjuredAlly:true,lowestAllyHpRatio:.4}),false),true);
});

test('context reads player buffs and lowest injured ally without mutating combat state',()=>{
  const engine={player:{hp:30,maxHp:100,buffs:{atk:{mult:1.2,turnsLeft:2},spd:{mult:.8,turnsLeft:1}}},aliveEnemies:[{hp:90,maxHp:100},{hp:25,maxHp:100},{hp:100,maxHp:100}]};
  const enemy={role:'support',combat3Skill:{kind:'healAlly'},combat3SkillCd:0};
  const got=enemy3TacticalContext(engine,enemy);
  assert.equal(got.playerHpRatio,.3);
  assert.equal(got.playerAtkBuffed,true);
  assert.equal(got.playerSpdDebuffed,true);
  assert.equal(got.lowestAllyHpRatio,.25);
});

test('runtime wrapper protects Boss/Rare scope and is wired after B1 bridge',()=>{
  const targeting=fs.readFileSync(new URL('../js/patches/enemy3Targeting.js',import.meta.url),'utf8');
  const bridge=fs.readFileSync(new URL('../js/patches/battle2RoadmapComplete.js',import.meta.url),'utf8');
  assert.match(targeting,/enemy\.boss/);
  assert.match(targeting,/enemy3RoleBehaviorProfile\(enemy\)/);
  assert.match(bridge,/enemy3RoleAi\.js'[\s\S]*enemy3Targeting\.js'/);
});
