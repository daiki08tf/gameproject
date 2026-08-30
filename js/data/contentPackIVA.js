/* Content Pack IV A — deterministic Deep Green contradictory-history chain. */

export const CP4_DEEP_GREEN_CHAIN=Object.freeze({
  id:'deep-green-contradiction',
  name:'深緑の森の記録不一致',
  prerequisiteStageId:'35-8',
  primeChapter:2,
  rumor:Object.freeze({
    id:'deep-green-record-conflict',
    name:'同じ森の、三つの記録',
    text:'共観測点に残った二重輪郭を照合すると、深緑の森の古い記録だけが現在史と噛み合わない。現地で座標を取り直す必要がある。',
  }),
  steps:Object.freeze([
    Object.freeze({
      id:'prime-record',stageId:'2-1',discoveryId:'cp4:deepgreen:prime-record',label:'現在史の確認',
      text:'現在の深緑の森は既知の旅の記録と一致する。森の大樹霊は討たれ、その後の道・集落・生態もPrimeの履歴と矛盾しない。',
      next:'森の中央部に残る、現在の地図にない古い樹冠記録を確認する。',
    }),
    Object.freeze({
      id:'survival-record',stageId:'2-3',discoveryId:'cp4:deepgreen:survival-record',label:'存在しない生存記録',
      text:'古い観測板には「森の大樹霊は生存し、今も森を統治する」と記録されている。集落は地表から樹冠へ退き、金属構造は減る一方で生体・根脈建築だけが異常に発達している。',
      next:'根脈の生体記憶を照合し、記録板とは別系統の履歴を確認する。',
    }),
    Object.freeze({
      id:'no-forest-memory',stageId:'2-5',discoveryId:'cp4:deepgreen:no-forest-memory',label:'森が存在しない生体記憶',
      text:'根脈記憶は、深緑の森が形成されたはずの時点で途切れている。座標は存在するのに、樹木・森・大樹霊の生体履歴そのものが最初から記録されていない。',
      next:'三つの履歴が同時に成立している重複座標を調査する。',
    }),
  ]),
  overlap:Object.freeze({
    discoveryId:'cp4:deepgreen:overlap-coordinate',
    name:'重複座標：深緑の森',
    text:'現在史・大樹霊生存記録・森林不存在の生体記憶は、どれも同じ一点だけ座標誤差がゼロになる。記録破損では説明できない。',
    next:'NEXT — 重複座標で観測不一致の原因を調べる。',
  }),
});

export function cp4DeepGreenProgress({discoveries={},isStageCleared=()=>false}={}){
  const chain=CP4_DEEP_GREEN_CHAIN;
  if(!isStageCleared(chain.prerequisiteStageId))return Object.freeze({state:'locked',step:0,nextStageId:null,complete:false});
  let completed=0;
  for(const step of chain.steps){
    if(discoveries[step.discoveryId])completed++;
    else return Object.freeze({state:completed===0?'rumor':'tracking',step:completed,nextStageId:step.stageId,complete:false});
  }
  return Object.freeze({state:'resolved',step:completed,nextStageId:null,complete:!!discoveries[chain.overlap.discoveryId]});
}

export function cp4DeepGreenStepForStage(stageId,{discoveries={},isStageCleared=()=>false}={}){
  const progress=cp4DeepGreenProgress({discoveries,isStageCleared});
  if(progress.state==='locked'||progress.complete)return null;
  return CP4_DEEP_GREEN_CHAIN.steps.find(step=>step.stageId===stageId&&step.stageId===progress.nextStageId)||null;
}
