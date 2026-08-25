export const WORLD3_EVENT_STAGES=Object.freeze({
  travelerBond:{
    id:'secret-worldevent-traveler',name:'旅人の依頼：忘れられた荷車',recLevel:110,
    worldEventStage:true,worldEventFlag:'travelerBond',branch:true,
    waves:[{type:'ch6_normal',count:5,interval:1.0},{type:'ch6_fast',count:3,interval:.8},{type:'ch6_branchboss',count:1,interval:0}],
    rewards:{gold:900,exp:1500},firstClear:{itemId:'ch6_branch'},dropTable:[{itemId:'ch6_accessory',weight:1}],
    modifiers:[{id:'escort_rescue',name:'救援依頼',desc:'助けた旅人から託された場所。通常ルート外の戦闘。'}],
  },
  oldMap:{
    id:'secret-worldevent-old-map',name:'古地図の地下礼拝堂',recLevel:165,
    worldEventStage:true,worldEventFlag:'oldMap',branch:true,
    waves:[{type:'ch8_normal',count:5,interval:1.0},{type:'ch8_tank',count:2,interval:1.4},{type:'ch8_branchboss',count:1,interval:0}],
    rewards:{gold:1500,exp:2600},firstClear:{itemId:'ch8_branch'},dropTable:[{itemId:'ch8_accessory',weight:1}],
    modifiers:[{id:'forgotten_route',name:'古地図の道',desc:'朽ちた祠で見つけた地図だけが示す地下区画。'}],
  },
  beastTrail:{
    id:'secret-worldevent-beast-trail',name:'獣王の隠れ巣',recLevel:240,
    worldEventStage:true,worldEventFlag:'beastTrail',branch:true,
    waves:[{type:'ch10_fast',count:5,interval:.75},{type:'ch10_normal',count:3,interval:1.0},{type:'ch10_branchboss',count:1,interval:0}],
    rewards:{gold:2400,exp:4200},firstClear:{itemId:'ch10_branch'},dropTable:[{itemId:'ch10_weapon',weight:1}],
    modifiers:[{id:'apex_hunt',name:'獣道追跡',desc:'巨大な足跡の主を追った者だけが辿り着く狩場。'}],
  },
});

export function world3EventStageByFlag(flag){return WORLD3_EVENT_STAGES[flag]||null;}
export function world3EventStageById(id){return Object.values(WORLD3_EVENT_STAGES).find(stage=>stage.id===id)||null;}
