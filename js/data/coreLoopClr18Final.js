/* CLR-18 Final Bulk Migration
   Canonical authored beats are preserved; remaining main Story Stages receive
   a conservative presentation-only aftermath derived from existing CHAPTERS metadata.
   No save/progression/reward authority is added. */
import { CHAPTERS } from './stages.js';
import { clr18StoryAftermath as authoredStoryAftermath } from './coreLoopClr18.js';

const MAIN_STAGE_INDEX=new Map();
for(const chapter of CHAPTERS){
  for(const stage of chapter.stages||[]){
    if(stage?.branch||stage?.bounty)continue;
    MAIN_STAGE_INDEX.set(String(stage.id),{chapter,stage});
  }
}

function genericAftermath(chapter,stage){
  const stageId=String(stage.id);
  if(stage.boss){
    return {
      stageId,
      title:`${stage.name}を越えて`,
      text:`${stage.name}を倒すと、${chapter.name}を覆っていた強い気配が崩れる。戦いの跡から、この場所が章の到達点だったことが分かる。`,
      generated:true,
    };
  }
  if(stage.midBoss){
    return {
      stageId,
      title:`${stage.name}の先へ`,
      text:`${stage.name}での戦いを越えると、守りの配置と進路が見えてくる。${chapter.name}のさらに奥へ続く道が残されている。`,
      generated:true,
    };
  }
  return {
    stageId,
    title:`${stage.name}の戦いの跡`,
    text:`戦いが終わると、${stage.name}に残った敵の痕跡と進路が見える。${chapter.name}の奥へ続く流れが、次のStageを指している。`,
    generated:true,
  };
}

export function clr18StoryAftermath(stageId){
  const id=String(stageId||'');
  const authored=authoredStoryAftermath(id);
  if(authored)return authored;
  const entry=MAIN_STAGE_INDEX.get(id);
  if(!entry)return null;
  return genericAftermath(entry.chapter,entry.stage);
}

export function clr18ShouldShowAftermath({stageId,cleared,wasCleared=false,retreated=false}={}){
  return !!(cleared&&!retreated&&!wasCleared&&clr18StoryAftermath(stageId));
}

export function clr18CoveredMainStageIds(){return [...MAIN_STAGE_INDEX.keys()];}
