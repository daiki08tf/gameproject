import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enemy3WorldTierAiPolicy } from '../js/data/enemy3WorldTierAI.js';
import { enemy3ShouldReserveSkill } from '../js/data/enemy3Targeting.js';
import { enemy3SynergyShouldReserveSkill } from '../js/data/enemy3EncounterSynergy.js';

test('B9 World I preserves B2 and B6 tactical thresholds',()=>{
  const p=enemy3WorldTierAiPolicy(0);
  assert.equal(p.attackerExecuteHp,.35);
  assert.equal(p.supportForceHealHp,.40);
  assert.equal(p.supportHoldHealHp,.70);
  assert.equal(p.synergyTriageHp,.55);
  assert.equal(p.proactiveDisruption,false);
});

test('B9 World VI escalates decisions without stat fields',()=>{
  const p=enemy3WorldTierAiPolicy({rank:5});
  assert.equal(p.attackerExecuteHp,.45);
  assert.equal(p.supportForceHealHp,.50);
  assert.equal(p.supportHoldHealHp,.80);
  assert.equal(p.synergyTriageHp,.675);
  assert.equal(p.proactiveDisruption,true);
  for(const key of Object.keys(p))assert.doesNotMatch(key,/hpMult|atkMult|defMult|spdMult|reward|eliteChance|aiHaste/i);
});

test('B9 attacker and support thresholds rise monotonically',()=>{
  let prev=enemy3WorldTierAiPolicy(0);
  for(let rank=1;rank<=6;rank++){
    const next=enemy3WorldTierAiPolicy(rank);
    assert.ok(next.attackerExecuteHp>=prev.attackerExecuteHp);
    assert.ok(next.supportForceHealHp>=prev.supportForceHealHp);
    assert.ok(next.supportHoldHealHp>=prev.supportHoldHealHp);
    assert.ok(next.synergyTriageHp>=prev.synergyTriageHp);
    prev=next;
  }
});

test('B9 World V enables proactive disruption but never redundant refresh',()=>{
  const caster={ready:true,role:'caster',worldTierRank:4,playerSpdBuffed:false,playerSpdDebuffed:false};
  assert.equal(enemy3ShouldReserveSkill(caster,false),true);
  caster.playerSpdDebuffed=true;
  assert.equal(enemy3ShouldReserveSkill(caster,true),false);
  const trickster={ready:true,role:'trickster',worldTierRank:4,playerAtkBuffed:false,playerAtkDebuffed:false};
  assert.equal(enemy3ShouldReserveSkill(trickster,false),true);
  trickster.playerAtkDebuffed=true;
  assert.equal(enemy3ShouldReserveSkill(trickster,true),false);
});

test('B9 encounter triage uses World Tier policy while leaving stat synergy unchanged',()=>{
  const support={role:'support',combat3Skill:{kind:'healAlly'},combat3SkillCd:0,hp:100,maxHp:100};
  const ally={role:'attacker',hp:65,maxHp:100};
  const normalEngine={worldTier:{rank:0},aliveEnemies:[support,ally]};
  const highEngine={worldTier:{rank:5},aliveEnemies:[support,ally]};
  assert.equal(enemy3SynergyShouldReserveSkill(normalEngine,support,false),false);
  assert.equal(enemy3SynergyShouldReserveSkill(highEngine,support,false),true);
});

test('B9 source does not duplicate World Tier stats, rewards, Elite chance, or Boss haste',()=>{
  const source=readFileSync(new URL('../js/data/enemy3WorldTierAI.js',import.meta.url),'utf8');
  assert.doesNotMatch(source,/enemyHp|enemyAtk|enemyDef|enemySpd|reward|drop|eliteChance|aiHaste|slamTurns|chargeTurns|projectileTurns|summonTurns/);
});

test('World VII (rank 6) extends every B9 threshold table by exactly one more of its own existing step',()=>{
  const vi=enemy3WorldTierAiPolicy(5),vii=enemy3WorldTierAiPolicy(6);
  assert.equal(vii.rank,6);
  assert.equal(vii.attackerExecuteHp,.47);
  assert.equal(vii.supportForceHealHp,.52);
  assert.equal(vii.supportHoldHealHp,.82);
  assert.equal(vii.synergyTriageHp,.70);
  assert.equal(vii.proactiveDisruption,true);
  assert.ok(vii.attackerExecuteHp-vi.attackerExecuteHp>.019 && vii.attackerExecuteHp-vi.attackerExecuteHp<.021,'same +.02 step as every prior tier');
  assert.ok(vii.supportForceHealHp-vi.supportForceHealHp>.019 && vii.supportForceHealHp-vi.supportForceHealHp<.021,'same +.02 step as every prior tier');
  assert.ok(vii.supportHoldHealHp-vi.supportHoldHealHp>.019 && vii.supportHoldHealHp-vi.supportHoldHealHp<.021,'same +.02 step as every prior tier');
  assert.ok(vii.synergyTriageHp-vi.synergyTriageHp>.024 && vii.synergyTriageHp-vi.synergyTriageHp<.026,'same +.025 step as every prior tier');
});

test('ranks above World VII still clamp to rank 6, matching the historical clamp-to-max-tier behavior',()=>{
  assert.equal(enemy3WorldTierAiPolicy(7).rank,6);
  assert.equal(enemy3WorldTierAiPolicy(99).rank,6);
  assert.deepEqual(enemy3WorldTierAiPolicy(7),enemy3WorldTierAiPolicy(6));
});
