/* Blade Vale — World 2.0 */
export const WORLD2_REALMS=Object.freeze({
 mortal:{id:'mortal',name:'人界',state:'open'},
 heaven:{id:'heaven',name:'天界',state:'sealed',hint:'空の裂け目は、境界の向こうから光を漏らしている。'},
 underworld:{id:'underworld',name:'冥界',state:'sealed',hint:'深い場所ほど、死者の声が近い。'},
 modern:{id:'modern',name:'？？？',state:'unknown',hint:'鍵穴の向こうから、聞いたことのない機械音がする。'},
});
export const KEY_DUNGEON_TYPES=Object.freeze({
 verdant:{id:'verdant',name:'翠界の鍵穴',minProgress:5,fragmentCost:3,realm:'mortal',rewardBias:'monster'},
 celestial:{id:'celestial',name:'天門の鍵穴',minProgress:12,fragmentCost:5,realm:'heaven',rewardBias:'relic'},
 infernal:{id:'infernal',name:'奈落門の鍵穴',minProgress:15,fragmentCost:5,realm:'underworld',rewardBias:'unique'},
 anomaly:{id:'anomaly',name:'境界異常点',minProgress:18,fragmentCost:7,realm:'modern',rewardBias:'mystery'},
});
export const WORLD_EVENTS=Object.freeze([
 {id:'traveler',name:'傷ついた旅人',weight:24,choices:['助ける','立ち去る'],kind:'choice'},
 {id:'shrine',name:'朽ちた祠',weight:20,choices:['祈る','調べる'],kind:'choice'},
 {id:'tracks',name:'巨大な足跡',weight:18,choices:['追う','避ける'],kind:'choice'},
 {id:'merchant',name:'行商人',weight:16,choices:['取引する','情報を聞く'],kind:'choice'},
 {id:'rift',name:'揺らぐ境界',weight:12,choices:['触れる','離れる'],kind:'choice'},
 {id:'keyhole',name:'古い鍵穴',weight:10,choices:['調べる','印を残す'],kind:'choice'},
]);
export function worldProgressFromClears(chapters,isCleared){let n=0;for(const ch of chapters){const boss=ch.stages?.[ch.stages.length-1];if(boss&&isCleared(boss.id))n++;else break;}return n;}
export function availableKeyDungeons(progress,fragments=0){return Object.values(KEY_DUNGEON_TYPES).filter(x=>progress>=x.minProgress&&fragments>=x.fragmentCost);}
export function rollWorldEvent(rng=Math.random){const total=WORLD_EVENTS.reduce((s,x)=>s+x.weight,0);let roll=rng()*total;for(const event of WORLD_EVENTS){roll-=event.weight;if(roll<0)return event;}return WORLD_EVENTS[0];}
export function realmVisibility(progress,flags={}){return{mortal:'open',heaven:flags.heavenOpened?'open':progress>=12?'hint':'hidden',underworld:flags.underworldOpened?'open':progress>=15?'hint':'hidden',modern:flags.modernContact?'hint':progress>=18?'unknown':'hidden'};}
