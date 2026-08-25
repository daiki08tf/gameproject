/* Phase 8 — shared Skill Constellation engine */

export const NODE_KIND=Object.freeze({CORE:'core',MINOR:'minor',MAJOR:'major',SPECIALIZATION:'specialization',KEYSTONE:'keystone',ULTIMATE:'ultimate',MASTER:'master'});

export function buildDefaultFusionConstellation(fusion){
  const [a,b]=fusion.parents;
  const core=`${fusion.id}:core`;
  const a1=`${fusion.id}:a1`,a2=`${fusion.id}:a2`,as=`${fusion.id}:spec_a`,ak=`${fusion.id}:key_a`;
  const b1=`${fusion.id}:b1`,b2=`${fusion.id}:b2`,bs=`${fusion.id}:spec_b`,bk=`${fusion.id}:key_b`;
  const ult=`${fusion.id}:ultimate`,master=`${fusion.id}:master`;
  const nodes=[
    {id:core,kind:NODE_KIND.CORE,name:fusion.name,cost:0,requires:[],effect:{type:'fusionTrait',id:fusion.fusionTrait?.id}},
    {id:a1,kind:NODE_KIND.MINOR,name:`${a}の星Ⅰ`,cost:1,requires:[core],effect:{type:'parentIdentity',parent:a,rank:1}},
    {id:a2,kind:NODE_KIND.MAJOR,name:`${a}の星Ⅱ`,cost:1,requires:[a1],effect:{type:'parentIdentity',parent:a,rank:2}},
    {id:as,kind:NODE_KIND.SPECIALIZATION,name:`${a}系統`,cost:2,requires:[a2],exclusiveGroup:`${fusion.id}:spec`,effect:{type:'specialization',parent:a}},
    {id:ak,kind:NODE_KIND.KEYSTONE,name:`${fusion.name}・${a}極`,cost:2,requires:[as],effect:{type:'keystone',parent:a}},
    {id:b1,kind:NODE_KIND.MINOR,name:`${b}の星Ⅰ`,cost:1,requires:[core],effect:{type:'parentIdentity',parent:b,rank:1}},
    {id:b2,kind:NODE_KIND.MAJOR,name:`${b}の星Ⅱ`,cost:1,requires:[b1],effect:{type:'parentIdentity',parent:b,rank:2}},
    {id:bs,kind:NODE_KIND.SPECIALIZATION,name:`${b}系統`,cost:2,requires:[b2],exclusiveGroup:`${fusion.id}:spec`,effect:{type:'specialization',parent:b}},
    {id:bk,kind:NODE_KIND.KEYSTONE,name:`${fusion.name}・${b}極`,cost:2,requires:[bs],effect:{type:'keystone',parent:b}},
    {id:ult,kind:NODE_KIND.ULTIMATE,name:`${fusion.name}奥義`,cost:3,requiresAny:[ak,bk],effect:{type:'ultimate',id:fusion.constellation?.ultimate}},
    {id:master,kind:NODE_KIND.MASTER,name:'MASTER STAR',cost:0,requires:[ult],effect:{type:'masterStar'}},
  ];
  return Object.freeze({jobId:fusion.id,layout:'dual-branch',nodes:Object.freeze(nodes)});
}

export function constellationNodeMap(constellation){return new Map(constellation.nodes.map(n=>[n.id,n]));}
export function canAcquireConstellationNode(constellation,nodeId,ownedIds,sp){
  const map=constellationNodeMap(constellation),node=map.get(nodeId);if(!node)return{ok:false,reason:'unknown'};
  const owned=ownedIds instanceof Set?ownedIds:new Set(ownedIds||[]);if(owned.has(nodeId))return{ok:false,reason:'owned'};
  if((node.cost||0)>sp)return{ok:false,reason:'sp'};
  if((node.requires||[]).some(id=>!owned.has(id)))return{ok:false,reason:'requires'};
  if(node.requiresAny?.length&&!node.requiresAny.some(id=>owned.has(id)))return{ok:false,reason:'requiresAny'};
  if(node.exclusiveGroup){for(const n of constellation.nodes){if(n.exclusiveGroup===node.exclusiveGroup&&owned.has(n.id))return{ok:false,reason:'exclusive'};}}
  return{ok:true,reason:null};
}
export function acquireConstellationNode(constellation,nodeId,state){const owned=new Set(state?.owned||[]),sp=Math.max(0,Number(state?.sp)||0);const check=canAcquireConstellationNode(constellation,nodeId,owned,sp);if(!check.ok)return{...state,owned:[...owned],sp,error:check.reason};const node=constellationNodeMap(constellation).get(nodeId);owned.add(nodeId);return{...state,owned:[...owned],sp:sp-(node.cost||0),error:null};}
export function constellationProgress(constellation,ownedIds){const owned=new Set(ownedIds||[]);return{owned:constellation.nodes.filter(n=>owned.has(n.id)).length,total:constellation.nodes.length,ultimate:constellation.nodes.some(n=>n.kind===NODE_KIND.ULTIMATE&&owned.has(n.id)),master:constellation.nodes.some(n=>n.kind===NODE_KIND.MASTER&&owned.has(n.id))};}
