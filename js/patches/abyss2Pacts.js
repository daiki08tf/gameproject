import { state } from '../state.js';
import { ABYSS_PACTS, abyssPact, abyssPactDanger, maxAbyssPactsForDepth } from '../data/abyssPacts.js';

function ensure(){
  if(!Array.isArray(state.data.abyssPacts)) state.data.abyssPacts=[];
  state.data.abyssPacts=[...new Set(state.data.abyssPacts)].filter(id=>abyssPact(id));
}
ensure();
state.abyssPacts=ABYSS_PACTS;
state.activeAbyssPacts=function(depth=this.data.abyssBestDepth+1){ ensure(); return this.data.abyssPacts.slice(0,maxAbyssPactsForDepth(depth)); };
state.abyssPactDanger=function(depth=this.data.abyssBestDepth+1){ return abyssPactDanger(this.activeAbyssPacts(depth)); };
state.toggleAbyssPact=function(id,depth=this.data.abyssBestDepth+1){
  ensure(); if(!abyssPact(id)) return false;
  const current=[...this.data.abyssPacts]; const i=current.indexOf(id);
  if(i>=0) current.splice(i,1);
  else { if(current.length>=maxAbyssPactsForDepth(depth)) return false; current.push(id); }
  this.data.abyssPacts=current; this.save(); return true;
};
state.clearAbyssPacts=function(){ this.data.abyssPacts=[]; this.save(); };
