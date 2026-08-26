/* Combat 3.0 — Stage -> Battle Group -> Enemy composition */
import { ENEMY_TYPES } from './enemies.js';

export const BATTLE_GROUP_MAX_ENEMIES = 5;

function safeCount(v){ const n=Math.floor(Number(v)||0); return Math.max(0,n); }
function isBossType(type){ return !!ENEMY_TYPES[type]?.boss; }
function compress(types){
  const order=[]; const counts=new Map();
  for(const type of types){ if(!counts.has(type)) order.push(type); counts.set(type,(counts.get(type)||0)+1); }
  return order.map(type=>({type,count:counts.get(type)}));
}
function explicitGroups(stage){
  if(!Array.isArray(stage?.battleGroups)||!stage.battleGroups.length)return null;
  return stage.battleGroups.map((g,i)=>({
    id:g.id||`team-${i+1}`,
    label:g.label||(/boss/i.test(g.id||'')?'BOSS':`TEAM ${i+1}`),
    bossWave:!!g.bossWave,
    enemies:(g.enemies||[]).map(e=>({type:e.type,count:safeCount(e.count)})).filter(e=>e.type&&e.count>0),
  })).filter(g=>g.enemies.length>0);
}

function distributeMixed(waves, groupCount){
  const groups=Array.from({length:groupCount},()=>[]);
  let cursor=0;
  // Round-robin each species across teams. This preserves all stage counts while
  // preventing the old "one species queues behind another species" behaviour.
  for(const wave of waves){
    const count=safeCount(wave.count);
    for(let i=0;i<count;i++){
      let tries=0;
      while(groups[cursor%groupCount].length>=BATTLE_GROUP_MAX_ENEMIES&&tries<groupCount){cursor++;tries++;}
      groups[cursor%groupCount].push(wave.type); cursor++;
    }
  }
  return groups.filter(g=>g.length).map(compress);
}

function stageWavesForBattleGroups(stage){
  const waves=Array.isArray(stage?.waves)?stage.waves.filter(w=>w?.type&&safeCount(w.count)>0):[];
  // Chapter 3's deepest room predates the text-battle/Combat 3 group model. Its
  // 5+5+3 composition becomes an early-game 13-enemy endurance wall, and the
  // stone soldiers can repeatedly protect the whole group. Keep the encounter's
  // three-enemy identity while capping this one legacy stage at 4+4+2.
  if(stage?.id!=='3-4')return waves;
  return waves.map(w=>{
    if(w.type==='ch3_tank')return {...w,count:Math.min(2,safeCount(w.count))};
    if(w.type==='ch3_normal'||w.type==='ch3_fast')return {...w,count:Math.min(4,safeCount(w.count))};
    return w;
  });
}

export function buildBattleGroups(stage){
  const explicit=explicitGroups(stage); if(explicit)return explicit;
  const waves=stageWavesForBattleGroups(stage);
  const normal=waves.filter(w=>!isBossType(w.type));
  const bosses=waves.filter(w=>isBossType(w.type));
  const normalTotal=normal.reduce((n,w)=>n+safeCount(w.count),0);
  // Story-like stages aim for the DQ-style "Team 1/2/3 -> Boss" rhythm when enough
  // enemies exist. Large Abyss/Rift stages add further teams rather than exceeding 5.
  const minTeams=normalTotal>=3?Math.min(3,normalTotal):normalTotal;
  const needed=Math.ceil(normalTotal/BATTLE_GROUP_MAX_ENEMIES);
  const teamCount=normalTotal?Math.max(1,minTeams,needed):0;
  const mixed=teamCount?distributeMixed(normal,teamCount):[];
  const out=mixed.map((enemies,i)=>({id:`team-${i+1}`,label:`TEAM ${i+1}`,bossWave:false,enemies}));
  if(bosses.length){
    out.push({id:'boss',label:'BOSS',bossWave:true,enemies:bosses.map(w=>({type:w.type,count:safeCount(w.count)}))});
  }
  return out;
}

export function battleGroupEnemyCount(groups){
  return (groups||[]).reduce((sum,g)=>sum+(g.enemies||[]).reduce((n,e)=>n+safeCount(e.count),0),0);
}
