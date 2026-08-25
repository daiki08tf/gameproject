import { getFusionJobById } from '../data/jobFusion.js';

export const CONSTELLATION_SCHEMA_VERSION = 1;

export function createConstellation(jobId) {
  const job = getFusionJobById(jobId);
  if (!job) throw new Error(`Unknown Fusion Job: ${jobId}`);
  const [a,b] = job.parents;
  return Object.freeze({
    schemaVersion: CONSTELLATION_SCHEMA_VERSION,
    jobId,
    nodes: Object.freeze([
      { id:'core', type:'core', cost:0, requires:[], label:job.name },
      { id:`${a}_I`, type:'branch', branch:a, cost:1, requires:['core'], label:`${a} I` },
      { id:`${b}_I`, type:'branch', branch:b, cost:1, requires:['core'], label:`${b} I` },
      { id:`${a}_II`, type:'branch', branch:a, cost:2, requires:[`${a}_I`], label:`${a} II` },
      { id:`${b}_II`, type:'branch', branch:b, cost:2, requires:[`${b}_I`], label:`${b} II` },
      { id:'fusion_trait', type:'fusionTrait', cost:2, requires:[`${a}_I`,`${b}_I`], label:'Fusion Trait' },
      { id:'keystone_a', type:'keystone', branch:a, cost:3, requires:[`${a}_II`,'fusion_trait'], label:'Keystone A' },
      { id:'keystone_b', type:'keystone', branch:b, cost:3, requires:[`${b}_II`,'fusion_trait'], label:'Keystone B' },
      { id:'ultimate', type:'ultimate', cost:5, requires:['keystone_a','keystone_b'], label:'Ultimate' },
    ]),
  });
}

export function canUnlockNode(constellation,nodeId,ownedNodeIds,points){
  const node=constellation.nodes.find(n=>n.id===nodeId);
  if(!node) return {ok:false,reason:'unknown-node'};
  if(ownedNodeIds.has(nodeId)) return {ok:false,reason:'already-owned'};
  if(points<node.cost) return {ok:false,reason:'insufficient-points'};
  if(!node.requires.every(id=>ownedNodeIds.has(id))) return {ok:false,reason:'requirements'};
  return {ok:true,reason:null};
}

export function unlockNode(constellation,nodeId,state){
  const owned=new Set(state.ownedNodeIds||[]);
  const check=canUnlockNode(constellation,nodeId,owned,state.points||0);
  if(!check.ok) return {...state,lastError:check.reason};
  const node=constellation.nodes.find(n=>n.id===nodeId);
  owned.add(nodeId);
  return {points:(state.points||0)-node.cost,ownedNodeIds:[...owned],lastError:null};
}

export function constellationProgress(constellation,state){
  const owned=new Set(state.ownedNodeIds||[]);
  const spent=constellation.nodes.filter(n=>owned.has(n.id)).reduce((s,n)=>s+n.cost,0);
  return {owned:owned.size,total:constellation.nodes.length,spent,ultimateUnlocked:owned.has('ultimate')};
}
