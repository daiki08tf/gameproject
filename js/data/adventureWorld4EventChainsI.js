/* Adventure / World 4.0 — W10 authored cross-Adventure chain I. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';
import { normalizeAdventure4EventCatalog } from './adventureWorld4Events.js';

export const ADVENTURE4_EVENT_CHAIN_I_EVENTS=normalizeAdventure4EventCatalog([
  {id:'frontier-sluice-first',sceneId:'frontier-sluice-first',name:'閉ざされた旧水門',weight:1,oneShot:true,chain:{id:'frontier-old-sluice',step:0},tags:['frontier','chain','investigation']},
  {id:'frontier-sluice-return',sceneId:'frontier-sluice-return',name:'旧水門への再訪',weight:1,oneShot:true,chain:{id:'frontier-old-sluice',step:1,terminal:true},tags:['frontier','chain','investigation']},
]);

const first=normalizeAdventure4Scene({id:'frontier-sluice-first',name:'閉ざされた旧水門',tags:['frontier','chain','investigation'],entryStepId:'observe',steps:[
  {id:'observe',phase:'observation',title:'閉ざされた旧水門',text:'干上がった水路の先に鉄の水門がある。錆びた操作輪は固着し、今の装備だけで安全に動かすのは難しそうだ。',choices:[
    {id:'record',label:'位置と構造を記録する',detail:'今は解けないと判断して情報を持ち帰る',nextStepId:'recorded'},
    {id:'force',label:'操作輪を力任せに動かす',detail:'壊れる可能性を承知で試す',nextStepId:'failed'},
  ]},
  {id:'recorded',phase:'resolution',title:'今は解けない',text:'刻印と歯車の向きを写し取った。仕組みを整理してから戻れば、別の見方ができるかもしれない。',choices:[{id:'finish',label:'記録を持ち帰る',consequences:[{scope:'world',type:'eventMemory',key:'frontier-old-sluice',value:{status:'recorded',outcome:'studied',flags:{diagram:true}}}]}]},
  {id:'failed',phase:'resolution',title:'折れた把手',text:'操作輪は動かず、外側の把手だけが折れた。水門そのものは閉じたままだが、次に触るなら別の方法が必要だ。',choices:[{id:'finish',label:'失敗を記録する',consequences:[{scope:'world',type:'eventMemory',key:'frontier-old-sluice',value:{status:'failed',outcome:'forced',flags:{handleBroken:true}}}]}]},
]});

function returnScene(memory){
  const forced=memory?.outcome==='forced'||memory?.flags?.handleBroken;
  return normalizeAdventure4Scene({id:'frontier-sluice-return',name:'旧水門への再訪',tags:['frontier','chain','revisit'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'旧水門への再訪',text:forced?'前に折った把手が足元に残っている。失敗した跡があるぶん、力で開かないことだけははっきりしている。':'前回写した刻印と見比べると、水門脇の石列が操作順を示していることに気付く。記録して帰った意味があった。',choices:[
      {id:'solve',label:forced?'残った軸と石列を照合する':'記録と石列を照合する',nextStepId:'solved'},
      {id:'leave',label:'まだ開けずに残す',nextStepId:'leave'},
    ]},
    {id:'solved',phase:'resolution',title:'噛み合う歯車',text:forced?'壊れた把手を使わず、軸を正しい順に戻すと内部の歯車がゆっくり噛み合った。失敗の記録が解法になった。':'刻印どおりに操作順を組み直すと、固着していた歯車が一段だけ動いた。完全開放ではないが、仕組みは解けた。',choices:[{id:'finish',label:'解決として記録する',consequences:[{scope:'world',type:'eventMemory',key:'frontier-old-sluice',value:{status:'resolved',outcome:forced?'recovered-after-failure':'solved-from-record',flags:{mechanismUnderstood:true}}}]}]},
    {id:'leave',phase:'resolution',title:'保留を続ける',text:'仕組みの見当はついたが、今日は開けないことにした。場所と状態は記録に残っている。',choices:[{id:'finish',label:'また戻る',consequences:[{scope:'world',type:'eventMemory',key:'frontier-old-sluice',value:{status:'recorded',outcome:forced?'deferred-after-failure':'deferred'}}]}]},
  ]});
}

export function adventure4EventChainIScene(event,memory=null){
  if(event?.id==='frontier-sluice-first')return first;
  if(event?.id==='frontier-sluice-return')return returnScene(memory);
  return null;
}
export function adventure4EventChainIForRegion(regionId){return ADVENTURE4_EVENT_CHAIN_I_EVENTS.filter(event=>event.tags.includes(regionId));}
