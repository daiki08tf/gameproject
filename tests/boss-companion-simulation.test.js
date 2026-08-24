import test from 'node:test';
import assert from 'node:assert/strict';
import { buildAbyssStage } from '../js/data/abyss.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { COMPANION_SPECIES, companionStats } from '../js/data/companions.js';
import { BOSS_AI_LAYER } from '../js/data/balance.js';
import { BOSS_COMPANION_COMBAT, bossDamageToCompanion } from '../js/patches/companionBattle.js';

function withRandom(v,fn){const old=Math.random;Math.random=()=>v;try{return fn();}finally{Math.random=old;}}
function makeCompanion(level,nature){const species=COMPANION_SPECIES.iron_hound,stats=companionStats(species,{level,nature,talent:{}});return{id:`${nature}-${level}`,name:nature,nature,traits:[...species.traits],...stats,hp:stats.hp,maxHp:stats.hp,down:false};}
function bossFor(depth){const stage=buildAbyssStage(depth);const wave=stage.waves.find(w=>String(w.type).endsWith('_boss'));return{stage,boss:ENEMY_TYPES[wave.type]};}

test('Boss special collateral stays meaningful and role-sensitive from Lv3,000 to Lv99,999',()=>{
  const checkpoints=[100,500,1000,2000,3000],rows=[];
  for(const depth of checkpoints){
    const {stage,boss}=bossFor(depth),level=stage.recLevel,kindMult=BOSS_COMPANION_COMBAT.SPECIAL_KIND_MULT.slam,mult=(BOSS_AI_LAYER.SLAM_DAMAGE_MULT||1)*BOSS_COMPANION_COMBAT.SPECIAL_SPLASH_MULT;
    const opts={floorPct:BOSS_COMPANION_COMBAT.SPECIAL_HP_FLOOR*kindMult,capPct:BOSS_COMPANION_COMBAT.SPECIAL_HP_CAP*kindMult};
    const tank=makeCompanion(level,'cautious'),support=makeCompanion(level,'clever'),dps=makeCompanion(level,'brave');
    const damage=x=>withRandom(.5,()=>bossDamageToCompanion(boss,x,mult,opts));
    const tankRatio=damage(tank)/tank.maxHp,supportRatio=damage(support)/support.maxHp,dpsRatio=damage(dps)/dps.maxHp;
    rows.push({depth,level,tank:Number(tankRatio.toFixed(3)),support:Number(supportRatio.toFixed(3)),dps:Number(dpsRatio.toFixed(3))});
    assert.ok(tankRatio>=.07&&tankRatio<=.20,`tank pressure ${tankRatio} at ${depth}`);
    assert.ok(supportRatio>=.10&&supportRatio<=.25,`support pressure ${supportRatio} at ${depth}`);
    assert.ok(dpsRatio>=.12&&dpsRatio<=.30,`dps pressure ${dpsRatio} at ${depth}`);
    assert.ok(tankRatio<supportRatio&&supportRatio<dpsRatio,`role ordering failed at depth ${depth}`);
  }
  console.log('BOSS_COMPANION_SURVIVAL',JSON.stringify(rows));
});
