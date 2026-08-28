/* Enemy 2.0 E5 — optional Encounter Pool contract.
   Fixed waves remain the fallback. E6 will add role-first party templates. */

function weightedPick(entries,rng=Math.random){
  const valid=(entries||[]).filter(x=>x&&x.type&&Number(x.weight)>0);
  if(!valid.length)return null;
  const total=valid.reduce((s,x)=>s+Number(x.weight),0);
  let roll=Math.max(0,Math.min(.999999999,Number(rng())||0))*total;
  for(const entry of valid){roll-=Number(entry.weight);if(roll<0)return entry.type;}
  return valid[valid.length-1].type;
}

export function buildEncounterQueue(stage,enemyTypes,{groupSize=3,rng=Math.random}={}){
  const waves=Array.isArray(stage?.waves)?stage.waves:[];
  const pool=stage?.encounterPool;
  const queue=[];
  const maxGroup=Math.max(1,Math.floor(Number(groupSize)||1));
  for(const wave of waves){
    const originalType=wave.type;
    const boss=!!enemyTypes?.[originalType]?.boss;
    let remaining=Math.max(0,Math.floor(Number(wave.count)||0));
    while(remaining>0){
      const count=Math.min(maxGroup,remaining);
      const usePool=!!pool&&!boss&&Array.isArray(pool.types)&&pool.types.length>0;
      const type=usePool?(weightedPick(pool.types,rng)||originalType):originalType;
      queue.push({type,count,sourceType:originalType,pooled:usePool});
      remaining-=count;
    }
  }
  return queue;
}

export function encounterPoolTotal(stage){return (stage?.waves||[]).reduce((s,w)=>s+(Number(w.count)||0),0);}

export function deterministicEncounterRng(seed='enemy2'){
  let h=2166136261>>>0;
  for(const ch of String(seed)){h^=ch.charCodeAt(0);h=Math.imul(h,16777619)>>>0;}
  return ()=>{h=(Math.imul(h,1664525)+1013904223)>>>0;return h/0x100000000;};
}
