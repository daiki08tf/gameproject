/* Content Pack IV — CP4-1 Deep Green contradiction chain.
   This pack stops at identifying the overlap coordinate. The Parallax Core and
   perception-change event belong to CP4-2+. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';
import { normalizeAdventure4EventCatalog } from './adventureWorld4Events.js';

export const CP4_REQUIRED_STAGE_ID='35-8';
export const CP4_REGION_ID='frontier';
export const CP4_CHAIN_ID='cp4-deep-green-contradiction';
export const CP4_RUMOR_ID='deep-green-three-records';
export const CP4_OVERLAP_DISCOVERY_ID='cp4:overlap-coordinate:deep-green';

const scenes=[
  {id:'cp4-deep-green-prime-record',name:'倒れた大樹霊の痕',tags:['investigation','deep-green','history-conflict'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'深緑の森・旧戦場',text:'Ch35の共観測記録が指した座標は、かつて森の大樹霊と戦った場所と重なっている。見慣れた倒木痕も、今の獣道も、こちらが知る旅の記録と矛盾しない。',choices:[
      {id:'inspect',label:'大樹霊の痕を確かめる',nextStepId:'inspect'},
      {id:'compare',label:'共観測記録と照合する',nextStepId:'inspect'},
    ]},
    {id:'inspect',phase:'investigation',title:'一致する現在',text:'樹皮の傷、周辺の植生、討伐後に開かれた道。すべてが「森の大樹霊は倒された」という現在の記録を支持している。',choices:[{id:'record',label:'現在の記録として残す',nextStepId:'resolved'}]},
    {id:'resolved',phase:'resolution',title:'第一の記録',text:'問題は現在ではない。共観測点に残った別の輪郭だけが、この場所をまるで違う森として示している。古い記録庫に同じ座標の資料がないか調べる価値がある。',choices:[{id:'finish',label:'記録庫を探す'}]},
  ]},
  {id:'cp4-deep-green-survival-record',name:'樹冠に続く古記録',tags:['investigation','deep-green','history-conflict'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'封じられた古記録',text:'同じ座標を示す古い記録が一枚だけ残っている。そこには、倒されたはずの森の大樹霊が「現在も森を統べる」と記されている。',choices:[{id:'read',label:'続きを読む',nextStepId:'read'}]},
    {id:'read',phase:'investigation',title:'存在しない森の暮らし',text:'記録では集落は地上から樹冠へ退き、道や住居は生きた根と枝で組まれている。鉄の設備はほとんどなく、大樹霊の成長に合わせて森そのものを建築として使っている。',choices:[
      {id:'date',label:'年代を照合する',nextStepId:'compare'},
      {id:'material',label:'材質記録を照合する',nextStepId:'compare'},
    ]},
    {id:'compare',phase:'resolution',title:'偽物では説明できない',text:'年代も座標も内部の記録規則も正しい。こちらの歴史とは両立しないのに、資料そのものは一貫している。次に残る照合先は、機械記録より古い森の根脈記憶だけだ。',choices:[{id:'finish',label:'根脈記憶を調べる'}]},
  ]},
  {id:'cp4-deep-green-no-forest-memory',name:'森を知らない根脈',tags:['investigation','deep-green','living-memory','history-conflict'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'根脈記憶の空白',text:'生きた根の記憶を同じ年代まで遡る。しかし、大樹霊が生きている記憶も、倒された記憶も出てこない。森そのものの記憶が途中で途切れている。',choices:[{id:'trace',label:'座標だけを追う',nextStepId:'trace'}]},
    {id:'trace',phase:'investigation',title:'森が存在しない記録',text:'座標は残っている。だが、その地点に森が形成された痕跡がない。根脈は「何も記録できなかった」のではなく、「森という生態系が存在しなかった」かのように終端している。',choices:[{id:'overlay',label:'三つの記録を重ねる',nextStepId:'overlay'}]},
    {id:'overlay',phase:'resolution',title:'同じ座標、三つの結果',text:'現在の森、大樹霊が生き続ける森、森そのものがない記録。互いに両立しない三つの結果は、すべて同じ一点で最も強く重なる。異常の中心座標を特定した。',choices:[{id:'finish',label:'重なりの座標を記録する'}]},
  ]},
].map(normalizeAdventure4Scene).filter(Boolean);

export const CP4_CONTRADICTION_SCENES=Object.freeze(scenes);
export const CP4_CONTRADICTION_EVENTS=normalizeAdventure4EventCatalog([
  {id:'cp4-deep-green-prime-record',sceneId:'cp4-deep-green-prime-record',name:'倒れた大樹霊の痕',oneShot:true,repeatable:false,condition:{stageCleared:CP4_REQUIRED_STAGE_ID},chain:{id:CP4_CHAIN_ID,step:0},tags:['investigation','deep-green','history-conflict']},
  {id:'cp4-deep-green-survival-record',sceneId:'cp4-deep-green-survival-record',name:'樹冠に続く古記録',oneShot:true,repeatable:false,condition:{stageCleared:CP4_REQUIRED_STAGE_ID},chain:{id:CP4_CHAIN_ID,step:1},tags:['investigation','deep-green','history-conflict']},
  {id:'cp4-deep-green-no-forest-memory',sceneId:'cp4-deep-green-no-forest-memory',name:'森を知らない根脈',oneShot:true,repeatable:false,condition:{stageCleared:CP4_REQUIRED_STAGE_ID},chain:{id:CP4_CHAIN_ID,step:2,terminal:true},tags:['investigation','deep-green','living-memory','history-conflict']},
]);

export const CP4_EVIDENCE=Object.freeze({
  'cp4-deep-green-prime-record':Object.freeze({id:'cp4:evidence:deep-green:prime',name:'記録矛盾：現在の深緑',hint:'討伐痕・植生・獣道は、森の大樹霊が倒された現在の歴史と一致する。'}),
  'cp4-deep-green-survival-record':Object.freeze({id:'cp4:evidence:deep-green:survival',name:'記録矛盾：樹冠の古記録',hint:'同じ座標の古記録では大樹霊が生存し、集落は樹冠へ移り、生きた根の建築が発達している。'}),
  'cp4-deep-green-no-forest-memory':Object.freeze({id:'cp4:evidence:deep-green:no-forest',name:'記録矛盾：森のない根脈',hint:'生体記録では座標だけが残り、深緑の森という生態系そのものが形成されていない。'}),
});

export function cp4ContradictionProgress({eventsSeen={},storyComplete=false}={}){
  if(!storyComplete)return Object.freeze({step:0,total:3,complete:false,nextEventId:null});
  const ordered=CP4_CONTRADICTION_EVENTS;
  let step=0;
  while(step<ordered.length&&Number(eventsSeen?.[ordered[step].id]||0)>0)step++;
  return Object.freeze({step,total:ordered.length,complete:step>=ordered.length,nextEventId:ordered[step]?.id||null});
}

export function cp4ContradictionSceneById(id){return CP4_CONTRADICTION_SCENES.find(scene=>scene.id===id)||null;}
