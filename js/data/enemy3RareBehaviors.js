/* Enemy 3.0 B5 — Rare-only combat behavior identities. */
export const ENEMY3_RARE_BEHAVIORS=Object.freeze({
  predator:Object.freeze({id:'predator',name:'狩人',playerHpRatio:.40,atkMult:1.18}),
  leech:Object.freeze({id:'leech',name:'吸命',healPct:.05}),
  survivor:Object.freeze({id:'survivor',name:'窮地',selfHpRatio:.35,defMult:1.20,spdMult:1.10}),
  ambusher:Object.freeze({id:'ambusher',name:'急襲',firstTurnAtkMult:1.25}),
});

const IDS=Object.freeze(Object.keys(ENEMY3_RARE_BEHAVIORS));
const boundedRoll=rng=>Math.max(0,Math.min(.999999999,Number(rng?.())||0));

export function isEnemy3Rare(enemy){
  return !!(enemy&&(enemy.rareIdentity||enemy.rare)&&enemy.rank==='rare'&&!enemy.boss&&!enemy.genericElite&&!enemy.elite);
}

export function chooseEnemy3RareBehavior(enemy,rng=Math.random){
  if(!isEnemy3Rare(enemy))return null;
  return ENEMY3_RARE_BEHAVIORS[IDS[Math.floor(boundedRoll(rng)*IDS.length)]]||null;
}

export function assignEnemy3RareBehavior(enemy,rng=Math.random){
  if(!isEnemy3Rare(enemy)||enemy.enemy3RareBehavior)return enemy;
  const behavior=chooseEnemy3RareBehavior(enemy,rng);
  if(behavior){enemy.enemy3RareBehavior=behavior;enemy.enemy3RareBehaviorId=behavior.id;enemy.enemy3RareFirstTurn=true;}
  return enemy;
}

export function enemy3RareStatMultiplier(enemy,stat,player){
  const b=enemy?.enemy3RareBehavior;
  if(!b)return 1;
  if(b.id==='predator'&&stat==='atk'&&player?.maxHp>0&&player.hp/player.maxHp<=b.playerHpRatio)return b.atkMult;
  if(b.id==='survivor'&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<=b.selfHpRatio){
    if(stat==='def')return b.defMult;
    if(stat==='spd')return b.spdMult;
  }
  if(b.id==='ambusher'&&stat==='atk'&&enemy.enemy3RareFirstTurn)return b.firstTurnAtkMult;
  return 1;
}

export function enemy3RareLeechAmount(enemy,damage){
  const pct=enemy?.enemy3RareBehavior?.id==='leech'?enemy.enemy3RareBehavior.healPct:0;
  if(!pct||enemy.dead||enemy.hp>=enemy.maxHp||!(damage>0))return 0;
  return Math.max(1,Math.min(enemy.maxHp-enemy.hp,Math.round(enemy.maxHp*pct)));
}
