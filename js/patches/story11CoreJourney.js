/* Phase 11 — Journey story integration.
 * Reuses existing stage data and TextBattleScreen. No new screen, currency,
 * progression gate or save field is introduced.
 */
import { CHAPTERS } from '../data/stages.js';
import { coreStoryBeatForStage } from '../data/storyChapters1to15.js';
import { veilStoryBeatForStage } from '../data/storyChapters16to20.js';
import { TextBattleScreen } from '../screens/textBattle.js';

function attachJourneyStory(){
  for(const chapter of CHAPTERS){
    if(chapter.num<1||chapter.num>20)continue;
    const mainStages=chapter.stages.filter(stage=>!stage.branch&&!stage.bounty);
    chapter.stages.forEach(stage=>{
      const mainIndex=mainStages.indexOf(stage);
      if(mainIndex<0)return;
      const beat=chapter.num<=15
        ? coreStoryBeatForStage(chapter.num,stage,mainIndex,mainStages.length)
        : veilStoryBeatForStage(chapter.num,stage,mainIndex,mainStages.length);
      if(beat)stage.story11=beat;
    });
  }
}

function storyStartLines(stage){
  const story=stage?.story11;if(!story)return[];
  const lines=[];
  if(story.opening){if(story.act)lines.push(`【${story.act}】`);lines.push(`【旅の目的】${story.objective}`,story.opening);}
  if(story.discovery)lines.push(`【発見】${story.discovery}`);
  if(story.bossIntro)lines.push(`【対峙】${story.bossIntro}`);
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

export { attachJourneyStory, storyStartLines, storyClearLines };
