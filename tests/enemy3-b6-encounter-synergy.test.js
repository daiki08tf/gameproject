import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  enemy3SynergyContext,enemy3SynergyShouldReserveSkill,enemy3SynergyStatMultiplier,
} from '../js/data/enemy3EncounterSynergy.js';

const role=id=>({id});

test('B6 guardian cover reserves existing guardAll for uncovered backliners',()=>{
  const guardian={role:'tank',combat3Role:role('guardian'),combat3Skill:{kind:'guardAll'},combat3SkillCd:0};
  const caster={role:'caster',combat3Role:role('caster'),combat3Buffs:{def:{mult:1,turns:0}},hp:100,maxHp:100};
  const engine={aliveEnemies:[guardian,caster]};
  assert.equal(enemy3SynergyShouldReserveSkill(engine,guardian,false),true);
  caster.combat3Buffs.def.turns=2;
  assert.equal(enemy3SynergyShouldReserveSkill(engine,guardian,false),false);
});

test('B6 support triage extends existing heal reservation only to meaningful wounds',()=>{
  const support={role:'support',combat3Role:role('support'),combat3Skill:{kind:'healAlly'},combat3SkillCd:0};
  const ally={role:'attacker',combat3Role:role('frontline'),hp:55,maxHp:100};
  const engine={aliveEnemies:[support,ally]};
  assert.equal(enemy3SynergyShouldReserveSkill(engine,support,false),true);
  ally.hp=56;
  assert.equal(enemy3SynergyShouldReserveSkill(engine,support,false),false);
});

test('B6 screened offense and pack pressure stay capped',()=>{
  const guardian={role:'tank',combat3Role:role('guardian'),speciesId:'golem',hp:100,maxHp:100};
  const attacker={role:'attacker',combat3Role:role('frontline'),speciesId:'wolf',hp:100,maxHp:100};
  const packmate={role:'normal',combat3Role:role('frontline'),speciesId:'wolf',hp:100,maxHp:100};
  const caster={role:'caster',combat3Role:role('caster'),speciesId:'wisp',hp:100,maxHp:100};
  const engine={aliveEnemies:[guardian,attacker,packmate,caster]};
  assert.equal(enemy3SynergyStatMultiplier(engine,attacker,'atk'),1.10);
  assert.equal(enemy3SynergyStatMultiplier(engine,caster,'spd'),1.06);
  assert.equal(enemy3SynergyContext(engine,attacker).sameSpecies,2);
});

test('B6 excludes authored/special enemy identities',()=>{
  const ally={role:'tank',combat3Role:role('guardian'),hp:100,maxHp:100};
  for(const enemy of [
    {boss:true,role:'attacker'},
    {elite:true,role:'attacker'},
    {rare:true,rank:'rare',role:'attacker'},
    {rareIdentity:true,rank:'rare',role:'attacker'},
  ]){
    enemy.hp=enemy.maxHp=100;enemy.combat3Skill={kind:'power'};enemy.combat3SkillCd=0;
    const engine={aliveEnemies:[enemy,ally]};
    assert.equal(enemy3SynergyStatMultiplier(engine,enemy,'atk'),1);
    assert.equal(enemy3SynergyShouldReserveSkill(engine,enemy,false),false);
  }
});

test('B6 runtime is loaded without new reward or status semantics',()=>{
  const runtime=readFileSync(new URL('../js/patches/enemy3EncounterSynergy.js',import.meta.url),'utf8');
  const bridge=readFileSync(new URL('../js/patches/enemy3Targeting.js',import.meta.url),'utf8');
  assert.match(bridge,/import '\.\/enemy3EncounterSynergy\.js'/);
  assert.match(runtime,/encounter-level synergy runtime/);
  assert.doesNotMatch(runtime,/gainGold|gainExp|_grantKillRewards|addAbyssShards|_setBuff/);
});
