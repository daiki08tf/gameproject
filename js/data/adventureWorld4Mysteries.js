/* Adventure / World 4.0 — W11-W13 Mystery / Hidden Route / NPC data. */
export const ADVENTURE4_NPC_ROLES=Object.freeze(['merchant','traveler','scholar','tamer']);
export const ADVENTURE4_NPCS=Object.freeze([
  Object.freeze({id:'sera-wanderer',name:'旅する学者セラ',role:'scholar',home:'settlement',regions:Object.freeze(['frontier','elemental']),rumorId:'frontier-bell-rumor'}),
  Object.freeze({id:'gray-peddler',name:'灰布の行商人',role:'merchant',home:'settlement',regions:Object.freeze(['frontier','fracture'])}),
  Object.freeze({id:'beast-listener',name:'獣声を聞く旅人',role:'tamer',home:'settlement',regions:Object.freeze(['elemental','frontier'])}),
]);
export const ADVENTURE4_MYSTERIES=Object.freeze([Object.freeze({
  id:'frontier-buried-bell',regionId:'frontier',name:'土の下で鳴る鐘',storyOptional:true,stages:Object.freeze(['unknown','rumor','trace','discovery','research','resolved']),
  rumor:Object.freeze({id:'frontier-bell-rumor',text:'開拓辺境では、風のない夜に地面の下から鐘が鳴るという。旅する学者セラは「音そのものより、鳴る場所が毎回ずれる」ことを気にしている。'}),
  traceId:'frontier-bell-metal-dust',discoveryId:'frontier-bell-stone-ring',researchKey:'frontier-bell-pattern',
  secret:Object.freeze({id:'frontier-bell-vault',name:'沈鐘の地下室',sceneId:'frontier-bell-vault-scene',shortcutId:'frontier-bell-shortcut'}),
  hints:Object.freeze(['まず酒場や旅人の噂を聞く。','鐘の噂があるなら、開拓辺境で金属粉の痕跡を探す。','痕跡を得たら石環の発見と照合する。','研究所で二つの記録を整理すると、再探索地点が絞れる。']),
})]);
export const ADVENTURE4_MYSTERY_TRACES=Object.freeze([Object.freeze({id:'frontier-bell-metal-dust',regionId:'frontier',type:'ancient',name:'土に混じる青黒い金属粉',text:'地表にはない合金の微粉末。一定方向へ薄く続いている。',sourceId:'frontier-buried-bell'})]);
export const ADVENTURE4_MYSTERY_DISCOVERIES=Object.freeze([Object.freeze({id:'frontier-bell-stone-ring',regionId:'frontier',category:'ancient',name:'沈みかけた石環',hint:'半分埋まった石の輪。中心だけ地面の響きが違う。',major:false,secret:false,sourceId:'frontier-buried-bell'})]);
export function adventure4MysteryById(id){return ADVENTURE4_MYSTERIES.find(item=>item.id===id)||null;}
export function adventure4NpcById(id){return ADVENTURE4_NPCS.find(item=>item.id===id)||null;}
export function adventure4MysteryHint(mystery,stage){const index=Math.max(0,mystery?.stages?.indexOf(stage)??0);return mystery?.hints?.[Math.min(index,mystery.hints.length-1)]||null;}
export function adventure4MysteryStage(mystery,{rumors={},traces={},discoveries={},research={}}={}){if(!mystery)return'unknown';if(research[mystery.researchKey]?.resolved)return'resolved';if(research[mystery.researchKey])return'research';if(discoveries[mystery.discoveryId])return'discovery';if(traces[mystery.traceId])return'trace';if(rumors[mystery.rumor.id])return'rumor';return'unknown';}
export function adventure4MysterySecretVisible(mystery,context={}){const stage=adventure4MysteryStage(mystery,context);if(stage==='research'||stage==='resolved')return true;const oldSluice=context.eventMemory?.['frontier-old-sluice'];return stage==='discovery'&&oldSluice?.status==='resolved';}
