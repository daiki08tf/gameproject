import { state } from '../state.js';
import { ABYSS_CHALLENGES, abyssChallenge, abyssChallengeDanger, abyssChallengeFlags } from '../data/abyssChallenges.js';

function ensure(){
  if(!Array.isArray(state.data.abyssChallenges)) state.data.abyssChallenges=[];
  state.data.abyssChallenges=[...new Set(state.data.abyssChallenges)].filter(id=>abyssChallenge(id));
}
ensure();
state.abyssChallenges=ABYSS_CHALLENGES;
state.activeAbyssChallenges=function(){ ensure(); return [...this.data.abyssChallenges]; };
state.abyssChallengeDanger=function(){ return abyssChallengeDanger(this.activeAbyssChallenges()); };
state.abyssChallengeFlags=function(){ return abyssChallengeFlags(this.activeAbyssChallenges()); };
state.toggleAbyssChallenge=function(id){
  ensure(); if(!abyssChallenge(id)) return false;
  const current=[...this.data.abyssChallenges],i=current.indexOf(id);
  if(i>=0) current.splice(i,1); else current.push(id);
  this.data.abyssChallenges=current; this.save(); return true;
};
state.clearAbyssChallenges=function(){ this.data.abyssChallenges=[]; this.save(); };
