/* Phase 11 / Story Expansion — Journey story integration.
 * Reuses existing stage data and TextBattleScreen. No new screen, currency,
 * progression gate or save field is introduced.
 */
import { CHAPTERS } from '../data/stages.js';
import { coreStoryBeatForStage } from '../data/storyChapters1to15.js';
import { veilStoryBeatForStage } from '../data/storyChapters16to20.js';
import { outerWorldStoryBeatForStage } from '../data/storyChapters21to25.js';
import { reverseObservationStoryBeatForStage } from '../data/storyChapters26to29.js';
import { storyExpansionIFinaleBeatForStage } from '../data/storyChapters30.js';
import { storyExpansionIICh31BeatForStage } from '../data/storyChapters31.js';
import { worldMysteryClueForStage } from '../data/storyWorldMystery.js';
import { TextBattleScreen } from '../screens/textBattle.js';

function attachJourneyStory(){
  for(const chapter of CHAPTERS){
    if(chapter.num<1||chapter.num>31)continue;
    const mainStages=chapter.stages.filter(stage=>!stage.branch&&!stage.bounty);
    chapter.stages.forEach(stage=>{
      const mainIndex=mainStages.indexOf(stage);
      if(mainIndex<0)return;
      const beat=chapter.num<=15
        ? coreStoryBeatForStage(chapter.num,stage,mainIndex,mainStages.length)
        : chapter.num<=20
          ? veilStoryBeatForStage(chapter.num,stage,mainIndex,mainStages.length)
          : chapter.num<=25
            ? outerWorldStoryBeatForStage(chapter.num,stage,mainIndex,mainStages.length)
            : chapter.num<=29
              ? reverseObservationStoryBeatForStage(chapter.num,stage,mainIndex,mainStages.length)
              : chapter.num===30
                ? storyExpansionIFinaleBeatForStage(chapter.num,stage,mainIndex,mainStages.length)
                : storyExpansionIICh31BeatForStage(chapter.num,stage,mainIndex,mainStages.length);
      if(beat)stage.story11=beat;
    });
  }
}

const attachCoreStory=attachJourneyStory;

function storyStartLines(stage){
  if(!stage)return[];
  const story=stage.story11;
  const lines=[];
  if(story?.opening){if(story.act)lines.push(`【${story.act}】`);lines.push(`【旅の目的】${story.objective}`,story.opening);}
  if(story?.discovery)lines.push(`【発見】${story.discovery}`);
  if(story?.bossIntro)lines.push(`【対峙】${story.bossIntro}`);
  const mystery=worldMysteryClueForStage(stage);
  if(mystery)lines.push(`【境界観測】${mystery}`);
  return lines;
}

function storyClearLines(stage,result){
  if(!result?.cleared||!stage?.story11?.clear)return[];
  return [`【旅の記録】${stage.story11.clear}`];
}

if(!globalThis.__BLADE_VALE_STORY11_CORE_JOURNEY__){
  globalThis.__BLADE_VALE_STORY11_CORE_JOURNEY__=true;
  attachJourneyStory();

  const originalStart=TextBattleScreen.prototype.start;
  TextBattleScreen.prototype.start=function(stageId,onEnd,blessingId){
    const wrappedEnd=(result)=>{
      const clearLines=storyClearLines(this.engine?.stage,result);
      if(clearLines.length){this._pushLines(clearLines);this._render();}
      if(onEnd)onEnd(result);
    };
    originalStart.call(this,stageId,wrappedEnd,blessingId);
    const opening=storyStartLines(this.engine?.stage);
    if(opening.length){
      const battleStartIndex=this.logLines.indexOf('戦闘開始！');
      if(battleStartIndex>=0)this.logLines.splice(battleStartIndex,0,...opening);
      else this.logLines.unshift(...opening);
      this._render();
    }
  };
}

export { attachJourneyStory, attachCoreStory, storyStartLines, storyClearLines };
