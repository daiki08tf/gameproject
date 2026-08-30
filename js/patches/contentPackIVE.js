/* Content Pack IV E — horizontal reaction layer. */
import { state } from '../state.js';
import { CP4_HORIZONTAL_REACTIONS,cp4HorizontalReactionState } from '../data/contentPackIVE.js';

function discoveries(){return state.data.world2?.discoveries||{};}
function reactionState(){return cp4HorizontalReactionState({discoveries:discoveries()});}
function active(){return reactionState().active;}

export function syncCP4HorizontalRumor(){
  if(!active())return false;
  const rumor=discoveries()[CP4_HORIZONTAL_REACTIONS.rumorId];
  if(!rumor)return false;
  const next=CP4_HORIZONTAL_REACTIONS.rumor;
  let changed=false;
  if(rumor.rumorState!=='resolved'){rumor.rumorState='resolved';changed=true;}
  if(rumor.rumorStateLabel!=='再解釈済み'){rumor.rumorStateLabel='再解釈済み';changed=true;}
  if(rumor.hint!==next.hint){rumor.hint=next.hint;changed=true;}
  if(rumor.nextAction!==next.nextAction){rumor.nextAction=next.nextAction;changed=true;}
  if(changed)state.save();
  return true;
}

state.cp4HorizontalReactions=function(){return{...reactionState(),definition:CP4_HORIZONTAL_REACTIONS};};
state.cp4CodexHistoricalInconsistencies=function(){return active()?[CP4_HORIZONTAL_REACTIONS.codex]:[];};

if(state.rumorNotebook&&!state.rumorNotebook.__cp4e){
  const previous=state.rumorNotebook.bind(state);
  const wrapped=function cp4ErumorNotebook(){syncCP4HorizontalRumor();return previous();};
  wrapped.__cp4e=true;
  state.rumorNotebook=wrapped;
}

if(state.settlementChronicleTimeline&&!state.settlementChronicleTimeline.__cp4e){
  const previous=state.settlementChronicleTimeline.bind(state);
  const wrapped=function cp4EChronicleTimeline(){
    const rows=previous();
    if(!active())return rows;
    const currentIndex=rows.findIndex(x=>x.kind==='current');
    const current=currentIndex>=0?rows.splice(currentIndex,1)[0]:null;
    for(const def of CP4_HORIZONTAL_REACTIONS.chronicle){
      const source=discoveries()[def.sourceDiscoveryId];
      if(!source||rows.some(x=>x.id===def.id))continue;
      rows.push({id:def.id,kind:'cp4-observation',generation:null,title:def.title,text:def.text,at:source.at||null});
    }
    if(current)rows.push(current);
    return rows;
  };
  wrapped.__cp4e=true;
  state.settlementChronicleTimeline=wrapped;
}

if(state.settlementResearchOutlook&&!state.settlementResearchOutlook.__cp4e){
  const previous=state.settlementResearchOutlook.bind(state);
  const wrapped=function cp4EResearchOutlook(){
    const rows=previous();
    if(!active()||!this.settlementResearchUnlocked?.())return rows;
    const reaction=CP4_HORIZONTAL_REACTIONS.research;
    if(!rows.some(x=>x.id===reaction.id))rows.push({...reaction});
    return rows;
  };
  wrapped.__cp4e=true;
  state.settlementResearchOutlook=wrapped;
}
