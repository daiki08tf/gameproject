import { state } from '../state.js';
import { SETTLEMENT_EXPLORATION_LOCATIONS,settlementExplorationEligible } from '../data/settlementExploration.js';

const META_KEY='__settlement3';
function ensureMeta(){
 if(!state.data.settlementBuildings)state.data.settlementBuildings={hall:0,inn:0,market:0,watch:0,ranch:0};
 let root=state.data.settlementBuildings[META_KEY];
 if(!root||typeof root!=='object'||Array.isArray(root)){root={};state.data.settlementBuildings[META_KEY]=root;}
 let exp=root.exploration;
 if(!exp||typeof exp!=='object'||Array.isArray(exp)){exp={discovered:[],completed:[],visits:{}};root.exploration=exp;state.save();}
 if(!Array.isArray(exp.discovered))exp.discovered=[];
 if(!Array.isArray(exp.completed))exp.completed=[];
 if(!exp.visits||typeof exp.visits!=='object'||Array.isArray(exp.visits))exp.visits={};
 return exp;
}
function levels(){return Object.fromEntries(['hall','inn','market','watch','ranch'].map(id=>[id,state.settlementLevel?.(id)??Math.max(0,Math.floor(state.data.settlementBuildings?.[id]||0))]));}
function syncDiscoveries(){const meta=ensureMeta(),lv=levels();let changed=false;for(const location of SETTLEMENT_EXPLORATION_LOCATIONS){if(settlementExplorationEligible(location,lv)&&!meta.discovered.includes(location.id)){meta.discovered.push(location.id);changed=true;}}if(changed)state.save();return meta;}

state.settlementExplorationLocations=function(){
 const meta=syncDiscoveries();
 return SETTLEMENT_EXPLORATION_LOCATIONS.map(location=>({...location,discovered:meta.discovered.includes(location.id),completed:meta.completed.includes(location.id),visits:Number(meta.visits[location.id]||0)}));
};
state.settlementExplorationSummary=function(){const list=this.settlementExplorationLocations();return{discovered:list.filter(x=>x.discovered).length,completed:list.filter(x=>x.completed).length,total:list.length,repeatable:list.filter(x=>x.discovered&&x.repeatable).length};};
state.exploreSettlementLocation=function(id){
 const meta=syncDiscoveries(),location=SETTLEMENT_EXPLORATION_LOCATIONS.find(x=>x.id===id);
 if(!location)return{ok:false,reason:'unknown'};
 if(!meta.discovered.includes(id))return{ok:false,reason:'locked'};
 const completed=meta.completed.includes(id),visits=Number(meta.visits[id]||0);
 if(completed&&!location.repeatable)return{ok:false,reason:'completed',location};
 meta.visits[id]=visits+1;
 let gained={};
 let first=!completed;
 if(first){meta.completed.push(id);gained=this.addSettlementMaterials?.(location.reward||{})||{};}
 this.refreshSettlementResidents?.();
 this.save();
 return{ok:true,first,repeatable:location.repeatable,location,event:first?location.firstEvent:location.revisitEvent,gained};
};
state.settlementExplorationState=function(){const meta=syncDiscoveries();return{discovered:[...meta.discovered],completed:[...meta.completed],visits:{...meta.visits}};};
