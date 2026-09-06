/* Content Pack IV H — M7 comparative Branch record runtime.
   Wraps the same existing Codex ("歴史的不整合") and Chronicle timeline
   surfaces contentPackIVE.js already feeds, the same way IVE itself layers
   on top of the base implementations. No new Codex/Chronicle authority, no
   new save field: the comparative row is derived on read, every time. */
import { state } from '../state.js';
import { CP4_COMPARATIVE_RECORD, cp4ComparativeRecordReady, cp4ComparativeRecordSummary } from '../data/contentPackIVH.js';

function discoveries(){return state.data.world2?.discoveries||{};}
function ready(){return cp4ComparativeRecordReady({discoveries:discoveries()});}

state.cp4ComparativeRecord=function(){
  if(!ready())return null;
  return{...CP4_COMPARATIVE_RECORD,summary:cp4ComparativeRecordSummary()};
};

if(state.cp4CodexHistoricalInconsistencies&&!state.cp4CodexHistoricalInconsistencies.__cp4h){
  const previous=state.cp4CodexHistoricalInconsistencies.bind(state);
  const wrapped=function cp4HCodexRows(){
    const rows=previous();
    if(!ready())return rows;
    if(rows.some(x=>x.id===CP4_COMPARATIVE_RECORD.id))return rows;
    return[...rows,{id:CP4_COMPARATIVE_RECORD.id,title:CP4_COMPARATIVE_RECORD.title,text:cp4ComparativeRecordSummary()}];
  };
  wrapped.__cp4h=true;
  state.cp4CodexHistoricalInconsistencies=wrapped;
}

if(state.settlementChronicleTimeline&&!state.settlementChronicleTimeline.__cp4h){
  const previous=state.settlementChronicleTimeline.bind(state);
  const wrapped=function cp4HChronicleTimeline(){
    const rows=previous();
    if(!ready())return rows;
    if(rows.some(x=>x.id===CP4_COMPARATIVE_RECORD.id))return rows;
    const currentIndex=rows.findIndex(x=>x.kind==='current');
    const current=currentIndex>=0?rows.splice(currentIndex,1)[0]:null;
    const anchorAts=CP4_COMPARATIVE_RECORD.requiredDiscoveryIds.map(id=>discoveries()[id]?.at).filter(Boolean);
    rows.push({id:CP4_COMPARATIVE_RECORD.id,kind:'cp4-comparative',generation:null,title:CP4_COMPARATIVE_RECORD.title,text:cp4ComparativeRecordSummary(),at:anchorAts.length?Math.max(...anchorAts):null});
    if(current)rows.push(current);
    return rows;
  };
  wrapped.__cp4h=true;
  state.settlementChronicleTimeline=wrapped;
}
