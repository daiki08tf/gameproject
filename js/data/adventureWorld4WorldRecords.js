/* Adventure / World 4.0 — W32 Exploration Chronicle & World Records.
   Pure derived helpers. Persistent authorities stay in world2, Story progress,
   Nemesis, Settlement Chronicle and Codex. */

function entries(value){return value&&typeof value==='object'?Object.entries(value):[];}
function truthyIds(value){return entries(value).filter(([,seen])=>!!seen).map(([id])=>id);}

export function adventure4ExplorationRecords({discoveries={},regionBosses=[],nemesis={},eventsSeen={},eventCatalog=[]}={}){
  const discoveryRecords=truthyIds(discoveries).map(id=>Object.freeze({kind:'discovery',id,title:id}));
  const bossRecords=(Array.isArray(regionBosses)?regionBosses:[]).filter(record=>record?.cleared).map(record=>Object.freeze({kind:'regionBoss',id:record.id,title:record.name||record.id,regionId:record.regionId||null}));
  const nemesisRecords=entries(nemesis).filter(([,value])=>value&&typeof value==='object').map(([id,value])=>Object.freeze({kind:'nemesis',id,title:value.name||value.enemyName||id,rank:Number(value.rank)||0}));
  const eventTags=new Map((Array.isArray(eventCatalog)?eventCatalog:[]).map(event=>[event.id,event.tags||[]]));
  const seenIds=entries(eventsSeen).filter(([,count])=>Number(count)>0).map(([id])=>id);
  const mysteryRecords=[],secretRecords=[];
  for(const id of seenIds){
    const tags=eventTags.get(id)||[];
    if(tags.includes('mystery')||/mystery/i.test(id))mysteryRecords.push(Object.freeze({kind:'mystery',id,title:id}));
    if(tags.includes('secret')||/secret/i.test(id))secretRecords.push(Object.freeze({kind:'secret',id,title:id}));
  }
  const all=Object.freeze([...discoveryRecords,...bossRecords,...nemesisRecords,...mysteryRecords,...secretRecords]);
  return Object.freeze({
    total:all.length,
    all,
    discoveries:Object.freeze(discoveryRecords),
    regionBosses:Object.freeze(bossRecords),
    nemesis:Object.freeze(nemesisRecords),
    mysteries:Object.freeze(mysteryRecords),
    secrets:Object.freeze(secretRecords),
  });
}

export function adventure4ExplorationRecordSummary(records){
  const value=records||adventure4ExplorationRecords();
  return Object.freeze({
    total:Number(value.total)||0,
    discoveries:value.discoveries?.length||0,
    regionBosses:value.regionBosses?.length||0,
    nemesis:value.nemesis?.length||0,
    mysteries:value.mysteries?.length||0,
    secrets:value.secrets?.length||0,
  });
}
