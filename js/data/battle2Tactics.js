/* Blade Vale — Battle 2.0 tactical rules */
export const BREAK_RULES=Object.freeze({normal:1,weak:1.6,resist:.65,shatter:.25,bossMult:1.25,brokenDamageMult:1.18});
export const COMPANION_TACTICS=Object.freeze({
 balanced:{id:'balanced',name:'おまかせ',nature:null,desc:'性格どおりに行動'},
 assault:{id:'assault',name:'攻撃重視',nature:'brave',desc:'弱った敵を狙いやすい'},
 defense:{id:'defense',name:'防御重視',nature:'cautious',desc:'危険な敵を優先する'},
 support:{id:'support',name:'支援優先',nature:'clever',desc:'回復・支援寄りの判断'},
});
export function breakCapacity(enemy={}){const def=Math.max(1,Number(enemy.def)||1),hp=Math.max(1,Number(enemy.maxHp||enemy.hp)||1);return Math.max(12,Math.round(10+Math.sqrt(def)*2+Math.log10(hp+9)*5)*(enemy.boss?2:1));}
export function breakDamage({damage=0,maxHp=1,capacity=20,elementMultiplier=1,boss=false,physical=false,frosted=false}={}){const ratio=Math.max(0,damage)/Math.max(1,maxHp);let mult=elementMultiplier>1?BREAK_RULES.weak:elementMultiplier<1?BREAK_RULES.resist:BREAK_RULES.normal;if(boss)mult/=BREAK_RULES.bossMult;let value=Math.max(1,Math.round((1+ratio*capacity*3)*mult));if(physical&&frosted)value+=Math.max(1,Math.round(capacity*BREAK_RULES.shatter));return value;}
export function comboForHit(element,status={}){if(!element&&status.frost>0)return'shatter';if(element==='wind'&&status.burn>0)return'wildfire';if(element==='lightning'&&(status.wet>0||status.frost>0))return'shock';if((element==='poison'&&status.bleed>0)||(element==='bleed'&&status.poison>0))return'necrosis';return null;}
export function tickCombatStatuses(status={}){const out={...status};for(const k of Object.keys(out))if(Number.isFinite(out[k])&&out[k]>0)out[k]=Math.max(0,out[k]-1);return out;}
