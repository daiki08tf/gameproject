/* Enemy 3.0 B7 — bounded phase-pressure rules layered onto authored Boss AI. */
export const ENEMY3_BOSS_PHASE2=Object.freeze({hpThreshold:.50,atkMult:1.08,spdMult:1.08,extraCadenceEvery:2});
export function isEnemy3BossPhase2(enemy){return !!(enemy?.boss&&!enemy?.dead&&((enemy.aiPhase||1)>=2||(enemy.maxHp>0&&enemy.hp/enemy.maxHp<=ENEMY3_BOSS_PHASE2.hpThreshold)));}
export function enemy3BossPhaseStatMultiplier(enemy,stat){if(!isEnemy3BossPhase2(enemy))return 1;if(stat==='atk')return ENEMY3_BOSS_PHASE2.atkMult;if(stat==='spd')return ENEMY3_BOSS_PHASE2.spdMult;return 1;}
export function shouldAdvanceBossCadence(enemy){if(!isEnemy3BossPhase2(enemy)||enemy.pendingSpecial)return false;const n=Math.max(0,Math.floor(Number(enemy._enemy3BossPhaseActionCount)||0));return n>0&&n%ENEMY3_BOSS_PHASE2.extraCadenceEvery===0;}
export function advanceBossSpecialCadence(enemy){if(!shouldAdvanceBossCadence(enemy))return [];const advanced=[];for(const key of ['slamTurns','chargeTurns','projectileTurns','summonTurns'])if(Number.isFinite(enemy[key])&&enemy[key]>1){enemy[key]-=1;advanced.push(key);}return advanced;}
