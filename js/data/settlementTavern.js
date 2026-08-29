export const TAVERN_UNLOCK_HALL_LEVEL=5;

export const TAVERN_REQUESTS=Object.freeze([
{id:'road_supply',type:'normal',title:'街道補給の手伝い',desc:'近隣の冒険路を巡り、補給隊が安全に動けるだけの実績を作る。',goal:{key:'stageClears',value:3,label:'冒険クリア 3回'},reward:{gold:300,materials:{wood:18,ore:8}}},
{id:'field_notes',type:'normal',title:'討伐記録の整理',desc:'酒場に集まる証言と照合するため、魔物の討伐記録を増やす。',goal:{key:'codexKills',value:25,label:'Codex累計討伐 25体'},reward:{gold:450,materials:{hide:10,ore:10}}},
{id:'ranch_contacts',type:'normal',title:'魔物使いの紹介状',desc:'仲間になった魔物の記録を増やし、牧舎に新しい縁を呼び込む。',goal:{key:'recruitedCodex',value:2,label:'Codex仲間化 2種'},reward:{gold:500,materials:{hide:16,wood:12}}},
{id:'deep_survey',type:'long',title:'深淵調査報告',desc:'深淵へ踏み込み、帰還者しか持ち帰れない情報を酒場へ届ける。',goal:{key:'abyssBestDepth',value:50,label:'Abyss 50F到達'},reward:{gold:1500,materials:{ore:30,veilstone:4}}},
{id:'frontier_archive',type:'long',title:'辺境生態誌',desc:'遭遇記録を積み上げ、学者と記録官が使える生態資料を完成させる。',goal:{key:'codexSeen',value:20,label:'Codex遭遇 20種'},reward:{gold:1200,materials:{wood:24,hide:24,veilstone:2}}},
]);

export function tavernContextValue(context,key){return Math.max(0,Number(context?.[key])||0);}
export function tavernRequestComplete(request,context){return tavernContextValue(context,request.goal.key)>=request.goal.value;}

export function buildTavernRumors(context={}){
 const rumors=[];
 const nemesis=context.activeNemesis;
 if(nemesis)rumors.push({id:'nemesis',kind:'bounty',icon:'🎯',title:'手配書の噂',text:`${nemesis.title||'危険な標的'}がまだ活動中らしい。敗北を重ねるほど厄介になる。`,source:'賞金首'});
 if((context.abyssBestDepth||0)>0)rumors.push({id:'abyss',kind:'abyss',icon:'🕳️',title:'深淵帰りの話',text:`現在の到達記録は ${context.abyssBestDepth}F。深層ほど境界石に関する話が増えている。`,source:'Abyss'});
 if((context.rareSeen||0)>0)rumors.push({id:'rare',kind:'rare',icon:'👁️',title:'珍しい個体の目撃談',text:`CodexにはRare以上の観測が ${context.rareSeen}件ある。見張り塔では再遭遇地点を照合している。`,source:'Codex'});
 if((context.hall||0)>=10)rumors.push({id:'secret',kind:'secret',icon:'🗝️',title:'境界の向こう側',text:'交易町の旅人が「普通の地図には残らない道」を語っている。Secret Realmにつながる兆候かもしれない。',source:'旅人'});
 if(context.worldEventText)rumors.push({id:'world_event',kind:'world',icon:'🌐',title:'世界情勢',text:context.worldEventText,source:'World Event'});
 if(!rumors.length)rumors.push({id:'quiet',kind:'local',icon:'🍺',title:'今夜は静かだ',text:'大きな事件の噂はまだない。冒険を重ねれば、街に持ち帰られる話も増えていくだろう。',source:'酒場'});
 return rumors;
}
