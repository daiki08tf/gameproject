/* Enemy 3.0 B1 — reuse existing Combat 3 AI for Enemy 2.0 advanced roles. */
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_ROLES } from '../data/enemyCombat3.js';
import { enemy3RoleBehaviorProfile } from '../data/enemy3RoleBehaviors.js';
import { planCombat3Skill } from './combat3EnemyAI.js';

const proto=BattleEngine.prototype;
const originalSpawn=proto._spawnEnemy;

proto._spawnEnemy=function(type){
  const enemy=originalSpawn.call(this,type);
  if(!enemy||enemy.boss)return enemy;

  const profile=enemy3RoleBehaviorProfile(enemy);
  if(!profile)return enemy;

  // Enemy 2.0 role metadata is authoritative here. We only replace the generic
  // Combat 3 fallback profile for the four advanced regional roles; normal,
  // fast, tank, Rare and authored Boss behavior remain untouched.
  enemy.combat3Role=ENEMY_ROLES[profile.combat3Role]||enemy.combat3Role;
  enemy.combat3Skill=profile.skill;
  enemy.combat3SkillCd=0;
  enemy.combat3Buffs=enemy.combat3Buffs||{def:{mult:1,turns:0},spd:{mult:1,turns:0}};
  planCombat3Skill(enemy);
  return enemy;
};
