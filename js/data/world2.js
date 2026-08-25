/* Blade Vale — World 2.0 / World 3.0 foundations */
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

// World 3.0: each event has a lightweight immediate reward and a persistent discovery.
// Persistent flags are intentionally generic so later phases can connect them to NPCs,
// hidden stages, jobs, monsters or uniques without inventing a parallel event system.
export const WORLD_EVENTS=Object.freeze([
 {id:'traveler',name:'傷ついた旅人',weight:24,text:'道端に傷ついた旅人が倒れている。遠くの集落から来たらしい。',choices:['助ける','立ち去る'],kind:'choice',outcomes:[{flag:'rescuedTraveler',discovery:'旅人の縁',hint:'助けた旅人は、いつか集落で再会できるかもしれない。'},{flag:null,discovery:null,hint:'あなたは先を急いだ。'}]},
 {id:'shrine',name:'朽ちた祠',weight:20,text:'苔むした祠の奥に、削り取られた古い地図が残っている。',choices:['祈る','地図を調べる'],kind:'choice',outcomes:[{flag:'shrineBlessing',discovery:'祠の加護',hint:'微かな加護が旅路を照らした。'},{flag:'shrineMap',discovery:'古い地図',hint:'現在の街道にはない脇道が記されている。'}]},
 {id:'tracks',name:'巨大な足跡',weight:18,text:'人のものではない巨大な足跡が、街道から森の奥へ続いている。',choices:['追う','避ける'],kind:'choice',outcomes:[{flag:'hiddenTrail',discovery:'獣道の痕跡',hint:'足跡の先に、地図にない道を見つけた。'},{flag:null,discovery:null,hint:'危険を避け、街道へ戻った。'}]},
 {id:'merchant',name:'行商人',weight:16,text:'見慣れない品を積んだ行商人が、境界の向こうの噂を知っているようだ。',choices:['取引する','情報を聞く'],kind:'choice',outcomes:[{flag:'merchantContact',discovery:'行商人との縁',hint:'行商人は次に会えば珍しい品を見せると約束した。'},{flag:'borderRumor',discovery:'境界の噂',hint:'「空にも地下にも、同じ形の門がある」と聞いた。'}]},
 {id:'rift',name:'揺らぐ境界',weight:12,text:'空間そのものが水面のように揺れている。向こう側から規則的な音が響く。',choices:['触れる','離れる'],kind:'choice',outcomes:[{flag:'riftAttunement',discovery:'境界共鳴',hint:'一瞬だけ、人工的な光の列が見えた。'},{flag:null,discovery:null,hint:'揺らぎはしばらくして消えた。'}]},
 {id:'keyhole',name:'古い鍵穴',weight:10,text:'壁面に巨大な鍵穴だけが残っている。周囲には複数世界の紋様が刻まれている。',choices:['調べる','印を残す'],kind:'choice',outcomes:[{flag:'ancientKeyhole',discovery:'古い鍵穴の位置',hint:'鍵穴の形を記録した。別の場所にも同型があるらしい。'},{flag:'markedKeyhole',discovery:'鍵穴の目印',hint:'帰路からでも見つけられるよう印を残した。'}]},
]);

export function worldEventOutcome(event,choiceIndex=0){return event?.outcomes?.[choiceIndex]||event?.outcomes?.[0]||null;}
export function worldProgressFromClears(chapters,isCleared){let n=0;for(const ch of chapters){const boss=ch.stages?.[ch.stages.length-1];if(boss&&isCleared(boss.id))n++;else break;}return n;}
export function availableKeyDungeons(progress,fragments=0){return Object.values(KEY_DUNGEON_TYPES).filter(x=>progress>=x.minProgress&&fragments>=x.fragmentCost);}
export function rollWorldEvent(rng=Math.random){const total=WORLD_EVENTS.reduce((s,x)=>s+x.weight,0);let roll=rng()*total;for(const event of WORLD_EVENTS){roll-=event.weight;if(roll<0)return event;}return WORLD_EVENTS[0];}
export function realmVisibility(progress,flags={}){return{mortal:'open',heaven:flags.heavenOpened?'open':progress>=12?'hint':'hidden',underworld:flags.underworldOpened?'open':progress>=15?'hint':'hidden',modern:flags.modernContact?'hint':progress>=18?'unknown':'hidden'};}
