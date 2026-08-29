/* Adventure / World 4.0 — W10 Event Chains & Persistent Memory.
   Pure helpers for durable event outcomes. Storage is supplied by the runtime
   and remains under existing world2 rather than creating a parallel root. */
function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function str(value){return typeof value==='string'&&value.length?value:null;}
function number(value,fallback=0){return Number.isFinite(value)?value:fallback;}

export function normalizeAdventure4EventMemory(value){
  const src=object(value),out={};
  for(const [id,raw] of Object.entries(src)){
    if(!str(id))continue;
    const item=object(raw);
    out[id]={
      visits:Math.max(0,Math.floor(number(item.visits,0))),
      status:['recorded','resolved','failed','abandoned'].includes(item.status)?item.status:null,
      outcome:str(item.outcome),
      firstAdventure:Math.max(0,Math.floor(number(item.firstAdventure,0))),
      lastAdventure:Math.max(0,Math.floor(number(item.lastAdventure,0))),
      flags:{...object(item.flags)},
    };
  }
  return out;
}

export function nextAdventure4EventMemory(store,eventId,patch={},adventureIndex=0){
  if(!str(eventId))return normalizeAdventure4EventMemory(store);
  const out=normalizeAdventure4EventMemory(store),current=out[eventId]||{visits:0,status:null,outcome:null,firstAdventure:0,lastAdventure:0,flags:{}};
  const visit=patch.visit!==false;
  if(visit)current.visits++;
  if(!current.firstAdventure)current.firstAdventure=Math.max(0,Math.floor(number(adventureIndex,0)));
  current.lastAdventure=Math.max(0,Math.floor(number(adventureIndex,0)));
  if(['recorded','resolved','failed','abandoned'].includes(patch.status))current.status=patch.status;
  if(str(patch.outcome))current.outcome=patch.outcome;
  if(patch.flags&&typeof patch.flags==='object'&&!Array.isArray(patch.flags))current.flags={...current.flags,...patch.flags};
  out[eventId]=current;
  return out;
}

export function adventure4EventMemoryFlags(store){
  const memory=normalizeAdventure4EventMemory(store),flags={};
  for(const [id,item] of Object.entries(memory)){
    flags[`memory:${id}:seen`]=item.visits>0;
    if(item.status)flags[`memory:${id}:status:${item.status}`]=true;
    if(item.outcome)flags[`memory:${id}:outcome:${item.outcome}`]=true;
    for(const [key,value] of Object.entries(item.flags||{}))flags[`memory:${id}:${key}`]=value;
  }
  return flags;
}

export function adventure4EventMemoryView(store,eventId){
  const item=normalizeAdventure4EventMemory(store)[eventId];
  return item?Object.freeze({...item,flags:Object.freeze({...item.flags})}):null;
}
