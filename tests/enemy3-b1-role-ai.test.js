import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { ENEMY3_ROLE_BEHAVIORS, enemy3RoleBehaviorProfile } from '../js/data/enemy3RoleBehaviors.js';

test('Enemy 3 B1 maps advanced Enemy 2 roles onto existing Combat 3 skill kinds',()=>{
  assert.equal(ENEMY3_ROLE_BEHAVIORS.attacker.combat3Role,'frontline');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.attacker.skill.kind,'power');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.caster.combat3Role,'caster');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.caster.skill.kind,'slow');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.trickster.combat3Role,'skirmisher');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.trickster.skill.kind,'weakenAtk');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.support.combat3Role,'support');
  assert.equal(ENEMY3_ROLE_BEHAVIORS.support.skill.kind,'healAlly');
});

test('B1 deliberately leaves legacy roles, Rare and Boss identities outside the bridge',()=>{
  for(const role of ['normal','fast','tank','rare','boss'])assert.equal(enemy3RoleBehaviorProfile(role),null);
});

test('B1 bridge keeps Boss authored AI authoritative and reuses Combat 3 planner',async()=>{
  const source=await readFile(new URL('../js/patches/enemy3RoleAi.js',import.meta.url),'utf8');
  assert.match(source,/if\(!enemy\|\|enemy\.boss\)return enemy/);
  assert.match(source,/planCombat3Skill\(enemy\)/);
  assert.doesNotMatch(source,/performEnemyTurn\s*=|_performBossTurn\s*=/);
});

test('B1 is activated after Enemy 2 migration in the battle roadmap patch',async()=>{
  const source=await readFile(new URL('../js/patches/battle2RoadmapComplete.js',import.meta.url),'utf8');
  const migration=source.indexOf("import './enemy2StoryMigration.js';");
  const bridge=source.indexOf("import './enemy3RoleAi.js';");
  assert.ok(migration>=0&&bridge>migration);
});
