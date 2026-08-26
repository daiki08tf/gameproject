/* ============================================================
   Phase 11.6 — Modern World Tease
   ------------------------------------------------------------
   Sensory fragments from beyond the normal Veil management system.
   These clues are narrative-only and intentionally stop short of naming
   Japan, Tokyo or explaining why the worlds are connected.
   ============================================================ */

export const MODERN_WORLD_TEASES=Object.freeze([
  Object.freeze({
    id:'anomaly-signal',source:'anomaly',order:1,kind:'signal',
    clue:'七鍵外の座標から、短・短・長の規則的な電波列が反復している。自然雑音ではなく、誰かが情報を送っている。',
  }),
  Object.freeze({
    id:'machine-architecture',source:'machine-world-11',order:2,kind:'architecture',
    clue:'設計外領域の観測像に、石でも機界合金でもない高層構造が並ぶ。窓は同じ高さで整列し、夜の中で階層ごとに灯っている。',
  }),
  Object.freeze({
    id:'machine-city-lights',source:'machine-world-12',order:3,kind:'lights',
    clue:'遠方の光点は星ではない。赤・青・白が一定周期で切り替わり、直線状の道に沿って連続して動いている。',
  }),
  Object.freeze({
    id:'machine-rail-sound',source:'machine-world-13',order:4,kind:'sound',
    clue:'外部観測窓の向こうから、金属輪が継ぎ目を越えるような反復振動と、短い電子音が周期的に届く。',
  }),
  Object.freeze({
    id:'machine-device-date',source:'machine-world-14',order:5,kind:'device-date',
    clue:'零式隔離門の受信片に、掌ほどの薄い発光端末と「20██/0█/2█ 18:4█」という年月日らしい表記が一瞬だけ映る。',
  }),
  Object.freeze({
    id:'machine-writing',source:'machine-world-15',order:6,kind:'writing',
    clue:'OBSERVER-∅の最終記録に、見慣れた表意文字へ似た「駅」「線」の断片が混じる。観測番号の向こうには、今も誰かが暮らす世界がある。',
  }),
]);

const BY_SOURCE=Object.freeze(Object.fromEntries(MODERN_WORLD_TEASES.map(entry=>[entry.source,entry])));

export function modernWorldTeaseForSource(source){return BY_SOURCE[String(source||'')]||null;}
export function modernWorldTeaseForStage(stage){
  if(!stage)return null;
  if(stage.world2KeyType==='anomaly')return modernWorldTeaseForSource('anomaly');
  return modernWorldTeaseForSource(stage.id);
}

export function modernWorldTeaseSummary(){
  return MODERN_WORLD_TEASES.map(({id,source,order,kind})=>({id,source,order,kind}));
}
