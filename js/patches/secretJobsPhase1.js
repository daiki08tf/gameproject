import { state } from '../state.js';
import { SECRET_JOBS, getSecretJob } from '../data/secretJobs.js';

state.data.discoveredSecretJobs ??= [];
state.data.secretJobProgress ??= {};
state.data.activeSecretJobId ??= null;

const baseJobProgress = state.jobProgress.bind(state);
const baseIsMastered = state.isMastered.bind(state);
const baseChangeJob = state.changeJob.bind(state);
const baseGainExp = state.gainExp.bind(state);

state.secretJobConditions = function(id){
  const job=getSecretJob(id); if(!job)return [];
  return job.conditions.map(c=>({id:c.id,label:c.label,done:!!c.check(this)}));
};
state.canDiscoverSecretJob = function(id){
  const job=getSecretJob(id); return !!job && job.conditions.every(c=>c.check(this));
};
state.discoverSecretJobs = function(){
  const newly=[];
  for(const job of SECRET_JOBS){
    if(!this.data.discoveredSecretJobs.includes(job.id) && this.canDiscoverSecretJob(job.id)){
      this.data.discoveredSecretJobs.push(job.id); newly.push(job.id);
    }
  }
  if(newly.length)this.save();
  return newly;
};
state.isSecretJobDiscovered = function(id){ return this.data.discoveredSecretJobs.includes(id); };
state.getSecretJobs = function(){ this.discoverSecretJobs(); return SECRET_JOBS; };
state.activeSecretJob = function(){ return getSecretJob(this.data.activeSecretJobId); };
state.displayJob = function(){ return this.activeSecretJob() || this.currentJob; };

state.jobProgress = function(id){
  const secret=getSecretJob(id);
  if(!secret)return baseJobProgress(id);
  this.data.secretJobProgress[id] ??= {level:1,exp:0};
  return this.data.secretJobProgress[id];
};
state.isMastered = function(id){
  const secret=getSecretJob(id);
  if(!secret)return baseIsMastered(id);
  return (this.data.mastered||[]).includes(id);
};
state.changeToSecretJob = function(id){
  this.discoverSecretJobs();
  const secret=getSecretJob(id);
  if(!secret || !this.isSecretJobDiscovered(id))return {ok:false,reason:'secret_locked'};
  const res=baseChangeJob(secret.carrierJobId);
  if(!res.ok)return res;
  this.data.activeSecretJobId=id;
  this.jobProgress(id);
  this.save();
  return {ok:true};
};
state.changeJob = function(id){
  const res=baseChangeJob(id);
  if(res.ok){ this.data.activeSecretJobId=null; this.save(); }
  return res;
};

state.gainExp = function secretJobGainExp(amount){
  const secret=this.activeSecretJob();
  const result=baseGainExp(amount);
  if(!secret){ this.discoverSecretJobs(); return result; }
  const p=this.jobProgress(secret.id);
  const gained=Math.max(1,Math.round((result.gained||0)*0.15));
  p.exp+=gained;
  let leveled=false;
  while(p.exp>=this.expToNext(p.level)){
    p.exp-=this.expToNext(p.level); p.level+=1; leveled=true;
    if(p.level>=secret.masteryLv && !this.data.mastered.includes(secret.id)) this.data.mastered.push(secret.id);
  }
  this.discoverSecretJobs(); this.save();
  return {...result,secretJobExp:gained,secretJobLeveledUp:leveled};
};

// 初回ロード時にも、既に条件達成済みなら発見済みにする。
state.discoverSecretJobs();
