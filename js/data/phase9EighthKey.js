/* ============================================================
   Phase 9.5 — The Eighth Key
   Post-region-mastery bridge into the next world layer.
   ============================================================ */

export const EIGHTH_KEY_STAGES=Object.freeze([
  {id:'secret-eighth-key-1',name:'第八鍵・観測回廊',depth:950,recLabel:'境界観測',requires:null,modifier:{id:'eighth_key_static',name:'位相雑音',desc:'回復効果-20% ／ 敵速度+15% ／ 高Item Power報酬'},tags:['fusion','analysis','fate']},
  {id:'secret-eighth-key-2',name:'第八鍵・人工境界',depth:1200,recLabel:'人工構造',requires:'secret-eighth-key-1',modifier:{id:'eighth_key_grid',name:'人工重力格子',desc:'回復効果-35% ／ 敵攻撃+20% ／ 高Item Power報酬'},tags:['construct','lightning','fortify']},
  {id:'secret-eighth-key-3',name:'第八鍵・零号門',depth:1500,recLabel:'門番決戦',requires:'secret-eighth-key-2',modifier:{id:'eighth_key_zero',name:'零号境界圧',desc:'回復効果-50% ／ 敵攻防+25% ／ 第八鍵の向こう側を開く'},tags:['fusion','dark','fate','construct'],final:true},
]);

export function eighthKeyStageDef(id){return EIGHTH_KEY_STAGES.find(s=>s.id===id)||null;}
export function eighthKeyProgress(isCleared){const cleared=EIGHTH_KEY_STAGES.filter(s=>isCleared(s.id)).length;return{cleared,total:EIGHTH_KEY_STAGES.length,open:cleared===EIGHTH_KEY_STAGES.length,next:EIGHTH_KEY_STAGES.find(s=>!isCleared(s.id))||null};}
