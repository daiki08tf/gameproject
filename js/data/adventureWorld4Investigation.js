/* Adventure / World 4.0 — W8 Trace / Clue / Investigation Board.
   Definitions are authored data. Persistent knowledge is owned by world2.investigation. */
export const ADVENTURE4_TRACE_TYPES=Object.freeze(['monster','human','ancient','rift','secret']);
const TRACE_TYPE_SET=new Set(ADVENTURE4_TRACE_TYPES);
const TRACE_LABELS=Object.freeze({monster:'魔物の痕跡',human:'人の痕跡',ancient:'古代の痕跡',rift:'境界の痕跡',secret:'未詳の痕跡'});

function str(value){return typeof value==='string'&&value.length?value:null;}
function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function list(value){return Array.isArray(value)?value:[];}
function strings(value){return [...new Set(list(value).filter(item=>typeof item==='string'&&item.length))];}

export function normalizeAdventure4Trace(value){
  const src=object(value),id=str(src.id),regionId=str(src.regionId),requested=String(src.type||'').toLowerCase();
  if(!id||!regionId)return null;
  const type=TRACE_TYPE_SET.has(requested)?requested:'human';
  return Object.freeze({id,regionId,type,name:str(src.name)||'未詳の痕跡',text:str(src.text)||'',secret:type==='secret'||!!src.secret,sourceId:str(src.sourceId),tags:Object.freeze(strings(src.tags))});
}

export function normalizeAdventure4Clue(value){
  const src=object(value),id=str(src.id),regionId=str(src.regionId);
  if(!id||!regionId)return null;
  return Object.freeze({
    id,regionId,
    name:str(src.name)||'未整理の手掛かり',
    summary:str(src.summary)||'',
    requiresTraces:Object.freeze(strings(src.requiresTraces)),
    requiresClues:Object.freeze(strings(src.requiresClues)),
    secret:!!src.secret,
    tags:Object.freeze(strings(src.tags)),
  });
}

export function normalizeAdventure4InvestigationCatalog(value={}){
  const traces=[],clues=[],traceIds=new Set(),clueIds=new Set();
  for(const raw of list(value.traces)){const item=normalizeAdventure4Trace(raw);if(item&&!traceIds.has(item.id)){traceIds.add(item.id);traces.push(item);}}
  for(const raw of list(value.clues)){const item=normalizeAdventure4Clue(raw);if(item&&!clueIds.has(item.id)){clueIds.add(item.id);clues.push(item);}}
  return Object.freeze({traces:Object.freeze(traces),clues:Object.freeze(clues)});
}

export const ADVENTURE4_INVESTIGATION_CATALOG=normalizeAdventure4InvestigationCatalog({
  traces:[
    {id:'frontier-pilot-fresh-tracks',regionId:'frontier',type:'human',name:'主要路へ続く新しい足跡',text:'分かれ道から主要路へ、まだ崩れていない新しい足跡が続いている。',sourceId:'pilot-fork'},
    {id:'frontier-pilot-broken-marker',regionId:'frontier',type:'human',name:'削られた道標',text:'同じ道沿いの道標には、意図的に文字を削った跡が残っている。',sourceId:'future-investigation'},
  ],
  clues:[
    {id:'frontier-pilot-someone-ahead',regionId:'frontier',name:'主要路の先にいる何者か',summary:'新しい足跡と削られた道標は、誰かが最近この道を通り、行き先を隠そうとした可能性を示している。',requiresTraces:['frontier-pilot-fresh-tracks','frontier-pilot-broken-marker']},
  ],
});

export function adventure4TraceById(catalog,id){return catalog?.traces?.find(item=>item.id===id)||null;}
export function adventure4ClueById(catalog,id){return catalog?.clues?.find(item=>item.id===id)||null;}
export function adventure4TraceTypeLabel(type){return TRACE_LABELS[type]||'痕跡';}

function requirementsMet(clue,knownTraces,knownClues){
  return clue.requiresTraces.every(id=>knownTraces.has(id))&&clue.requiresClues.every(id=>knownClues.has(id));
}

export function deriveAdventure4Clues(catalog,records={}){
  const knownTraces=new Set(Object.keys(object(records.traces))),knownClues=new Set(Object.keys(object(records.clues))),derived=[];
  let changed=true;
  while(changed){
    changed=false;
    for(const clue of catalog?.clues||[]){
      if(knownClues.has(clue.id)||!requirementsMet(clue,knownTraces,knownClues))continue;
      knownClues.add(clue.id);derived.push(clue);changed=true;
    }
  }
  return derived;
}

export function adventure4InvestigationBoard(catalog,records={},regions=[]){
  const traceRecords=object(records.traces),clueRecords=object(records.clues);
  const regionNames=new Map(list(regions).map(region=>[region.id,region.name]));
  const knownTraceDefs=(catalog?.traces||[]).filter(trace=>!!traceRecords[trace.id]);
  const knownClueDefs=(catalog?.clues||[]).filter(clue=>!!clueRecords[clue.id]);
  const regionIds=[...new Set([...knownTraceDefs.map(x=>x.regionId),...knownClueDefs.map(x=>x.regionId)])];
  return regionIds.map(regionId=>{
    const traces=knownTraceDefs.filter(trace=>trace.regionId===regionId).map(trace=>Object.freeze({...trace,typeLabel:adventure4TraceTypeLabel(trace.type),recordedAt:traceRecords[trace.id]?.at||0}));
    const clues=knownClueDefs.filter(clue=>clue.regionId===regionId).map(clue=>{
      const evidence=[...clue.requiresTraces.map(id=>adventure4TraceById(catalog,id)?.name),...clue.requiresClues.map(id=>adventure4ClueById(catalog,id)?.name)].filter(Boolean);
      return Object.freeze({...clue,evidence:Object.freeze(evidence),recordedAt:clueRecords[clue.id]?.at||0});
    });
    return Object.freeze({regionId,regionName:regionNames.get(regionId)||'未詳の地域',traces:Object.freeze(traces),clues:Object.freeze(clues)});
  });
}
