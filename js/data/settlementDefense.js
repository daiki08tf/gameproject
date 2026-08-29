export const SETTLEMENT_DEFENSE_PROJECTS=Object.freeze([
{id:'wall',name:'外縁防壁',icon:'🧱',maxLevel:3,costs:[{wood:20,ore:12},{wood:35,ore:22,hide:8},{wood:55,ore:38,veilstone:2}],desc:'街の外周を固め、侵入経路を絞る。'},
{id:'watchpost',name:'前哨見張り',icon:'🗼',maxLevel:3,costs:[{wood:14,ore:10},{wood:24,ore:18,hide:6},{wood:36,ore:28,veilstone:2}],desc:'既存の見張り塔と連携し、襲撃の兆候を早期発見する。'},
{id:'traps',name:'迎撃罠',icon:'🪤',maxLevel:3,costs:[{wood:12,ore:8,hide:6},{wood:20,ore:14,hide:10},{wood:30,ore:22,hide:14,veilstone:1}],desc:'侵入経路へ罠を置く。戦闘を自動解決せず、迎撃準備として扱う。'}
]);

export const SETTLEMENT_INVASIONS=Object.freeze([
{id:'beastRaid',name:'魔物襲撃',icon:'🐗',kind:'monster',minHall:5,minWatch:5,desc:'群れを成した魔物が外縁へ押し寄せている。',encounter:{type:'settlementDefense',id:'beastRaid',label:'外縁魔物群'},firstReward:{hide:8,wood:6}},
{id:'banditRaid',name:'盗賊襲撃',icon:'🗡️',kind:'bandit',minHall:8,minWatch:6,minMarket:5,desc:'交易路を狙う盗賊団が街へ接近している。',encounter:{type:'settlementDefense',id:'banditRaid',label:'境界盗賊団'},firstReward:{ore:6,wood:8}},
{id:'nemesisRaid',name:'Nemesis襲来',icon:'☠️',kind:'nemesis',minHall:12,minWatch:10,minBossKills:1,desc:'討伐記録に残る強敵の気配が、街の周囲を周回している。',encounter:{type:'settlementDefense',id:'nemesisRaid',label:'Nemesis侵攻個体'},firstReward:{ore:8,hide:8,veilstone:2}},
{id:'riftCorruption',name:'異界侵食',icon:'🌀',kind:'rift',minHall:15,minWatch:12,minSecrets:1,desc:'異界由来の裂け目が街区へ侵食を始めた。',encounter:{type:'settlementDefense',id:'riftCorruption',label:'異界侵食核'},firstReward:{ore:10,veilstone:4}}
]);

export function settlementDefenseIncidentEligible(incident,context={}){
 if((context.hall||0)<(incident.minHall||0))return false;
 if((context.watch||0)<(incident.minWatch||0))return false;
 if((context.market||0)<(incident.minMarket||0))return false;
 if((context.bossKills||0)<(incident.minBossKills||0))return false;
 if((context.completedSecrets||0)<(incident.minSecrets||0))return false;
 return true;
}
