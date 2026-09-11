export const SETTLEMENT_DEFENSE_PROJECTS=Object.freeze([
{id:'wall',name:'外縁防壁',icon:'🧱',maxLevel:3,costs:[{wood:20,ore:12},{wood:35,ore:22,hide:8},{wood:55,ore:38,veilstone:2}],desc:'街の外周を固め、侵入経路を絞る。'},
{id:'watchpost',name:'前哨見張り',icon:'🗼',maxLevel:3,costs:[{wood:14,ore:10},{wood:24,ore:18,hide:6},{wood:36,ore:28,veilstone:2}],desc:'既存の見張り塔と連携し、襲撃の兆候を早期発見する。'},
{id:'traps',name:'迎撃罠',icon:'🪤',maxLevel:3,costs:[{wood:12,ore:8,hide:6},{wood:20,ore:14,hide:10},{wood:30,ore:22,hide:14,veilstone:1}],desc:'侵入経路へ罠を置く。戦闘を自動解決せず、迎撃準備として扱う。'}
]);

// `resolvedHint` (Living World & Discovery C7-2) is the past-tense outcome
// text shown in the Rumor Notebook once an incident has been cleared at
// least once -- the same {unresolved desc -> resolved outcome} two-stage
// shape C7-1 already established for 謎の遺物漂着. These incidents stay
// re-triggerable (see settlementDefenseUi.js's "再戦可"), so the hint
// reads as "this is what happened", not "this is over forever".
export const SETTLEMENT_INVASIONS=Object.freeze([
{id:'beastRaid',name:'魔物襲撃',icon:'🐗',kind:'monster',minHall:5,minWatch:5,desc:'群れを成した魔物が外縁へ押し寄せている。',resolvedHint:'外縁へ押し寄せた魔物の群れは、退けられた。またいつ現れるかは分からない。',encounter:{type:'settlementDefense',id:'beastRaid',label:'外縁魔物群'},firstReward:{hide:8,wood:6},recLevel:20,rewards:{gold:180,exp:140},waves:[{type:'ch5_normal',count:3,interval:1},{type:'ch5_tank',count:1,interval:0}]},
{id:'banditRaid',name:'盗賊襲撃',icon:'🗡️',kind:'bandit',minHall:8,minWatch:6,minMarket:5,desc:'交易路を狙う盗賊団が街へ接近している。',resolvedHint:'交易路を狙っていた盗賊団は、退けられた。しばらくは鳴りを潜めるだろう。',encounter:{type:'settlementDefense',id:'banditRaid',label:'境界盗賊団'},firstReward:{ore:6,wood:8},recLevel:45,rewards:{gold:380,exp:300},waves:[{type:'ch8_fast',count:2,interval:.8},{type:'ch8_normal',count:2,interval:1}]},
{id:'nemesisRaid',name:'Nemesis襲来',icon:'☠️',kind:'nemesis',minHall:12,minWatch:10,minBossKills:1,requiresActiveNemesis:true,desc:'討伐記録に残る強敵の気配が、街の周囲を周回している。',resolvedHint:'街を周回していた強敵の気配は、一度は退けられた。討伐記録に、また一つ痕跡が残った。',encounter:{type:'settlementDefense',id:'nemesisRaid',label:'Nemesis侵攻個体'},firstReward:{ore:8,hide:8,veilstone:2}},
{id:'riftCorruption',name:'異界侵食',icon:'🌀',kind:'rift',minHall:15,minWatch:12,minSecrets:1,desc:'異界由来の裂け目が街区へ侵食を始めた。',resolvedHint:'街区へ侵食しかけた裂け目は、閉じられた。異界の気配は、まだ完全には消えていない。',encounter:{type:'settlementDefense',id:'riftCorruption',label:'異界侵食核'},firstReward:{ore:10,veilstone:4},recLevel:250,rewards:{gold:900,exp:750},waves:[{type:'ch15_tank',count:2,interval:1.2},{type:'ch15_normal',count:2,interval:1}]},
{id:'marketTheft',name:'市場荒らし',kind:'security',minHall:1,minMarket:1,desc:'市場の売り子から、盗みが相次いでいると相談を受けた。',resolvedHint:'市場を荒らしていたこそ泥は、取り押さえられた。',encounter:{type:'settlementDefense',id:'marketTheft',label:'市場のこそ泥'},firstReward:{wood:4,hide:2},recLevel:8,rewards:{gold:60,exp:40},waves:[{type:'ch2_fast',count:2,interval:.8}]},
{id:'curfewBrawl',name:'酔漢の乱闘',kind:'security',minHall:2,minWatch:1,desc:'夜の酒場で乱闘騒ぎが起きている。放っておくと治安が荒れる。',resolvedHint:'酒場の乱闘は、収まった。',encounter:{type:'settlementDefense',id:'curfewBrawl',label:'酒場の乱闘'},firstReward:{wood:6,ore:3},recLevel:14,rewards:{gold:110,exp:80},waves:[{type:'ch3_normal',count:2,interval:1}]}
]);

export function settlementDefenseIncidentEligible(incident,context={}){
 if((context.hall||0)<(incident.minHall||0))return false;
 if((context.watch||0)<(incident.minWatch||0))return false;
 if((context.market||0)<(incident.minMarket||0))return false;
 if((context.bossKills||0)<(incident.minBossKills||0))return false;
 if((context.completedSecrets||0)<(incident.minSecrets||0))return false;
 if(incident.requiresActiveNemesis&&!context.hasActiveNemesis)return false;
 return true;
}
