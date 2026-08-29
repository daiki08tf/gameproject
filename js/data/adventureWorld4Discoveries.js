/* Adventure / World 4.0 — W7 Discovery 4.0 */
export const ADVENTURE4_DISCOVERY_CATEGORIES=Object.freeze(['landmark','lore','creature','civilization','ancient','anomaly','secret']);
const CATEGORY_SET=new Set(ADVENTURE4_DISCOVERY_CATEGORIES);
const CATEGORY_LABELS=Object.freeze({landmark:'Landmark',lore:'Lore',creature:'Creature',civilization:'Civilization',ancient:'Ancient',anomaly:'Anomaly',secret:'Secret'});

function str(value){return typeof value==='string'&&value.length?value:null;}
function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function list(value){return Array.isArray(value)?value:[];}

export function normalizeAdventure4Discovery(value){
  const src=object(value),id=str(src.id),regionId=str(src.regionId);
  if(!id||!regionId)return null;
  const requested=String(src.category||'').toLowerCase();
  const category=CATEGORY_SET.has(requested)?requested:'lore';
  return Object.freeze({id,regionId,category,name:str(src.name)||'未詳の発見',hint:str(src.hint)||'',major:!!src.major,secret:category==='secret'||!!src.secret,sourceId:str(src.sourceId),tags:Object.freeze(list(src.tags).filter(item=>typeof item==='string'&&item.length))});
}

export function discoveryCategoryLabel(category){return CATEGORY_LABELS[category]||'Discovery';}

export function buildAdventure4DiscoveryCatalog(regions){
  const out=[];
  for(const region of list(regions)){
    for(const ref of list(region?.discoveryRefs)){
      const raw=String(ref?.kind||'').toLowerCase();
      const category=CATEGORY_SET.has(raw)?raw:raw.includes('secret')?'secret':raw.includes('monster')||raw.includes('creature')?'creature':raw.includes('ancient')?'ancient':raw.includes('rift')||raw.includes('anomaly')?'anomaly':'lore';
      const item=normalizeAdventure4Discovery({id:ref.id,regionId:region.id,name:ref.name,category,sourceId:ref.id});
      if(item)out.push(item);
    }
  }
  return Object.freeze(out);
}

export function adventure4DiscoveryById(catalog,id){return list(catalog).find(item=>item?.id===id)||null;}

export function adventure4RegionDiscoveryProgress(regionId,catalog,recorded={}){
  const defs=list(catalog).filter(item=>item?.regionId===regionId);
  const visible=defs.filter(item=>!item.secret||!!recorded?.[item.id]);
  const known=visible.filter(item=>!!recorded?.[item.id]);
  const knownByCategory={};for(const item of known)knownByCategory[item.category]=(knownByCategory[item.category]||0)+1;
  const majorDefs=defs.filter(item=>item.major&&!item.secret),majorKnown=majorDefs.filter(item=>!!recorded?.[item.id]);
  return Object.freeze({regionId,knownCount:defs.filter(item=>!!recorded?.[item.id]).length,visibleKnownCount:known.length,visibleTotal:visible.length,majorKnown:majorKnown.length,majorTotal:majorDefs.length,knownByCategory:Object.freeze(knownByCategory),label:visible.length?`${known.length}/${visible.length}件 記録`:'記録なし'});
}

export function adventure4VisibleDiscoveries(regionId,catalog,recorded={}){
  return list(catalog).filter(item=>item?.regionId===regionId&&(!item.secret||!!recorded?.[item.id])).map(item=>Object.freeze({...item,discovered:!!recorded?.[item.id],categoryLabel:discoveryCategoryLabel(item.category)}));
}
