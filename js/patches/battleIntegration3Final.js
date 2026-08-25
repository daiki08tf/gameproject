/* ============================================================
   Battle Integration 3.0 — final encounter hierarchy pass
   ------------------------------------------------------------
   Finalizes the distinction between normal enemies, Elites and Bosses while
   reusing the existing Combat 2/3 systems.

   Normal  = role/formation puzzle
   Elite   = faster tactical skill cadence and extra pressure
   Boss    = readable multi-phase encounter with Break counterplay
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { bossEncounterProfile } from '../data/bossEncounters.js';

export const BATTLE3_ELITE_RULES=Object.freeze({
  hpMult:1.18,
  atkMult:1.12,
  defMult:1.08,
  skillCooldownAfterUse:1,
});

const proto=BattleEngine.prototype;

// Elite should feel like a priority target rather than a recolored normal enemy.
// This layer intentionally stays modest because Combat3DifficultyRebalance has
// already scaled every text-battle enemy.
const previousSpawn=proto._spawnEnemy;
proto._spawnEnemy=function battleIntegration3FinalSpawn(type){
  const enemy=previousSpawn.call(this,type);
  if(!enemy||enemy.boss||!enemy.elite)return enemy;
  enemy.hp=enemy.maxHp=Math.max(1,Math.round(enemy.maxHp*BATTLE3_ELITE_RULES.hpMult));
  enemy.atk=Math.max(1,Math.round(enemy.atk*BATTLE3_ELITE_RULES.atkMult));
  enemy.def=Math.max(0,Math.round(enemy.def*BATTLE3_ELITE_RULES.defMult));
  enemy.combat3ElitePressure=true;
  return enemy;
};

// Combat3EnemyAI normally gives skills a 2-turn cooldown. Elite enemies recover
// one turn faster so their identity comes from tactical pressure, not only HP.
const previousEnemyTurn=proto.performEnemyTurn;
proto.performEnemyTurn=function battleIntegration3FinalEnemyTurn(enemy){
  const result=previousEnemyTurn.call(this,enemy);
  if(enemy?.combat3ElitePressure&&result?.enemySkill){
    enemy.combat3SkillCd=Math.min(enemy.combat3SkillCd||0,BATTLE3_ELITE_RULES.skillCooldownAfterUse);
    result.elitePressure=true;
  }
  return result;
};

export function bossPhaseSummary(enemy){
  if(!enemy?.boss)return null;
  const encounter=enemy.combat3Encounter;
  const profile=encounter?.profile||bossEncounterProfile(enemy.type);
  if(!profile)return null;
  const completed=Math.max(0,encounter?.nextPhase||0);
  const phaseNumber=Math.min(profile.phases.length+1,completed+1);
  const total=profile.phases.length+1;
  const next=profile.phases[completed]||null;
  return {
    phaseNumber,total,
    nextRatio:next?.ratio??null,
    nextName:next?.name||null,
  };
}

function encounterLabel(enemy){
  if(enemy?.boss){
    const phase=bossPhaseSummary(enemy);
    if(!phase)return 'BOSS';
    const next=phase.nextRatio!=null
      ? ` / 次 ${Math.round(phase.nextRatio*100)}%「${phase.nextName}」`
      : ' / 最終局面';
    return `BOSS PHASE ${phase.phaseNumber}/${phase.total}${next}`;
  }
  if(enemy?.combat3ElitePressure||enemy?.elite)return 'ELITE / 特殊行動の再使用が速い';
  return null;
}

const previousRender=TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render=function battleIntegration3FinalRender(){
  previousRender.call(this);
  if(!this.engine)return;
  const cards=[...(this.el.enemyList?.querySelectorAll('.tb-enemy-card')||[])];
  cards.forEach((card,index)=>{
    const enemy=this.engine.enemies?.[index];
    if(!enemy||enemy.dead)return;
    const text=encounterLabel(enemy);
    let line=card.querySelector('.tb-encounter-line');
    if(!text){if(line)line.remove();return;}
    if(!line){
      line=document.createElement('div');
      line.className='tb-encounter-line';
      line.style.cssText='font-size:10px;font-weight:700;opacity:.88;margin-top:3px;line-height:1.3';
      card.appendChild(line);
    }
    line.textContent=text;
  });
};

export { encounterLabel };
