import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { BOUNTIES, buildBountyStage } from '../data/bounties.js';
import { BOUNTY2_STAGES, bountyBaseIdForStage } from '../data/bounty2.js';

state.data.bountyMarks ??= 0;
state.data.bountyNemesis ??= {};
state.data.bounty2Wins ??= {};

// 読み込み順に依存しないよう、通常手配書を先に保証する。
for(const bounty of BOUNTIES){
  const chapter=CHAPTERS.find(ch=>ch.id===bounty.chapterId);
  if(!chapter) continue;
  if(!chapter.stages.some(s=>s.id===bounty.id)) chapter.stages.push(buildBountyStage(bounty));
}
for(const stage of BOUNTY2_STAGES){
  const chapter=CHAPTERS.find(ch=>ch.stages.some(s=>s.id===stage.bountyBaseId));
  if(!chapter) continue;
  if(!chapter.stages.some(s=>s.id===stage.id)) chapter.stages.push(stage);
}

state.bountyMarks=function(){return this.data.bountyMarks||0;};
state.addBountyMarks=function(amount){this.data.bountyMarks=Math.max(0,(this.data.bountyMarks||0)+Math.max(0,Math.floor(amount||0)));this.save();return this.data.bountyMarks;};
state.bountyNemesisInfo=function(stageOrId){const id=typeof stageOrId==='string'?stageOrId:bountyBaseIdForStage(stageOrId);return this.data.bountyNemesis[id]||{level:0,wins:0};};
state.recordBountyLoss=function(stage){const id=bountyBaseIdForStage(stage);if(!id)return null;const n=this.data.bountyNemesis[id]??={level:0,wins:0};n.level=Math.min(10,(n.level||0)+1);this.save();return {...n};};
state.recordBountyWin=function(stage){const id=bountyBaseIdForStage(stage);if(!id)return null;const n=this.data.bountyNemesis[id]??={level:0,wins:0};const bonusLevel=n.level||0;n.wins=(n.wins||0)+1;n.level=0;this.data.bounty2Wins[id]=(this.data.bounty2Wins[id]||0)+1;this.save();return {bonusLevel,wins:n.wins};};
state.bountyNemesisTitle=function(stageOrId){const n=this.bountyNemesisInfo(stageOrId);if(!n.level)return '';if(n.level>=5)return '【宿命の天敵】';if(n.level>=3)return '【二度殺し】';return '【勇者殺し】';};
