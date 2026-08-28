/* Enemy 3.0 B4 — generic Elite combat affixes only. */
export const ENEMY3_ELITE_AFFIXES=Object.freeze({
  regenerating:Object.freeze({id:'regenerating',name:'再生',regenPct:.035}),
  frenzied:Object.freeze({id:'frenzied',name:'狂乱',lowHpRatio:.40,atkMult:1.18}),
  bulwark:Object.freeze({id:'bulwark',name:'鉄壁',defMult:1.16}),
  swift:Object.freeze({id:'swift',name:'迅速',spdMult:1.14}),
});

const AFFIX_IDS=Object.freeze(Object.keys(ENEMY3_ELITE_AFFIXES));
const boundedRoll=rng=>Math.max(0,Math.min(.999999999,Number(rng?.())||0));

export function isEnemy3GenericElite(enemy){
  return !!(enemy?.genericElite&&enemy?.rank==='elite'&&!enemy?.boss&&!enemy?.elite&&!enemy?.rareIdentity&&!enemy?.rare);
}

export function chooseEnemy3EliteAffix(enemy,rng=Math.random){
  if(!isEnemy3GenericElite(enemy))return null;
  return ENEMY3_ELITE_AFFIXES[AFFIX_IDS[Math.floor(boundedRoll(rng)*AFFIX_IDS.length)]]||null;
}

export function assignEnemy3EliteAffix(enemy,rng=Math.random){
  if(!isEnemy3GenericElite(enemy)||enemy.enemy3EliteAffix)return enemy;
  const affix=chooseEnemy3EliteAffix(enemy,rng);
  if(affix){enemy.enemy3EliteAffix=affix;enemy.enemy3EliteAffixId=affix.id;}
  return enemy;
}

export function enemy3EliteStatMultiplier(enemy,stat){
  const affix=enemy?.enemy3EliteAffix;
  if(!affix)return 1;
  if(stat==='def')return affix.defMult||1;
  if(stat==='spd')return affix.spdMult||1;
  if(stat==='atk'&&affix.atkMult&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<=affix.lowHpRatio)return affix.atkMult;
  return 1;
}

export function enemy3EliteRegenAmount(enemy){
  const pct=enemy?.enemy3EliteAffix?.regenPct||0;
  if(!pct||enemy.dead||enemy.hp>=enemy.maxHp)return 0;
  return Math.max(1,Math.min(enemy.maxHp-enemy.hp,Math.round(enemy.maxHp*pct)));
}
