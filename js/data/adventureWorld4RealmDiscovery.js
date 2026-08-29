/* Adventure / World 4.0 — W23-W25 Realm discovery / dynamic Region contracts.
   Existing World2 / Rift / Machine progression remains authoritative. */

export const ADVENTURE4_REALM_SIGNALS=Object.freeze([
  {id:'rift',name:'境界裂け目',regionId:'fracture',category:'anomaly',hint:'空間の継ぎ目に、既存Riftと同じ歪みが残っている。'},
  {id:'heaven',name:'天界の残光',regionId:'veil',category:'anomaly',hint:'上空の裂け目から、人界とは異なる光が漏れている。'},
  {id:'underworld',name:'冥界の反響',regionId:'last-mortal',category:'anomaly',hint:'地の底から、死者の声に似た反響が届く。'},
  {id:'modern',name:'未知の機械音',regionId:'outer-world',category:'anomaly',hint:'境界の向こうから、規則的な機械音が聞こえる。'},
  {id:'machine',name:'機界への観測線',regionId:'reverse-observation',category:'secret',hint:'既存の機界経路と一致する観測線が、地形の奥へ続いている。'},
]);

export function adventure4RealmSignalStage(def,ctx={}){
  if(!def)return'hidden';
  if(ctx.recorded?.[def.id])return'discovered';
  if(def.id==='rift')return (ctx.riftKeyCount||0)>0||ctx.flags?.riftAttunement?'trace':ctx.expeditionLeadIds?.includes('boundarySignal')?'rumor':'hidden';
  if(def.id==='machine')return ctx.machineUnlocked?'open':ctx.flags?.modernTrace?'trace':ctx.flags?.modernSignal||ctx.flags?.modernContact?'rumor':'hidden';
  const realm=ctx.realmVisibility?.find?.(x=>x.id===def.id);
  if(realm?.state==='open')return'open';
  if(realm?.state==='hint'||realm?.state==='unknown')return realm.state==='hint'?'rumor':'trace';
  return'hidden';
}

export function adventure4RealmSignals(ctx={}){
  return ADVENTURE4_REALM_SIGNALS.map(def=>({...def,stage:adventure4RealmSignalStage(def,ctx)})).filter(x=>x.stage!=='hidden');
}

export function adventure4DynamicRegionState(regionId,ctx={}){
  const overlays=[];
  const local=(ctx.realmSignals||[]).filter(x=>x.regionId===regionId);
  if(local.length)overlays.push({id:'realm-pressure',name:'境界影響',detail:local.map(x=>x.name).join(' / ')});
  if(ctx.worldEvent)overlays.push({id:'world-event',name:'世界事件',detail:ctx.worldEvent.name||'World Event'});
  if(ctx.nemesisHere)overlays.push({id:'nemesis',name:'追跡対象',detail:'Nemesisの活動痕跡が濃い'});
  if(ctx.weatherId==='mist'||ctx.weatherId==='rain')overlays.push({id:'weather',name:'環境変化',detail:ctx.weatherId==='mist'?'霧で視界が変質':'雨で痕跡が浮き出る'});
  if((ctx.shortcutCount||0)>0)overlays.push({id:'known-routes',name:'既知の抜け道',detail:`恒久Shortcut ${ctx.shortcutCount}件`});
  const pressure=overlays.filter(x=>['realm-pressure','world-event','nemesis'].includes(x.id)).length;
  const status=pressure>=3?'transformed':pressure>=2?'unstable':pressure>=1?'watch':'stable';
  return Object.freeze({regionId,status,overlays:Object.freeze(overlays),authoredIdentityPreserved:true});
}

export function buildAdventure4RealmSignalScene(signal){
  if(!signal)return null;
  const label={rumor:'噂を確かめる',trace:'痕跡を記録する',open:'既知の入口を確認する',discovered:'記録を照合する'}[signal.stage]||'調べる';
  return {
    id:`realm-signal-${signal.id}`,name:signal.name,entryStepId:'observe',tags:['realm-discovery','optional'],
    steps:[{id:'observe',phase:'observation',title:'境界の違和感',text:signal.hint,choices:[
      {id:'inspect',label,detail:'入口の開放や鍵消費は行わない',resultText:'痕跡をAdventureの発見記録へ持ち帰った。既存Realm進行そのものには触れていない。',consequences:[{scope:'world',type:'realmDiscovery',realmId:signal.id,regionId:signal.regionId}]},
      {id:'leave',label:'今は追わない',detail:'後のAdventureで再調査できる',resultText:'場所だけ覚えて、その場を離れた。',consequences:[]},
    ]}],
  };
}
