export const WORLD3_REALM_NODES=Object.freeze([
  {id:'mortal',icon:'🌍',name:'人界',subtitle:'旅の起点となる世界',route:null},
  {id:'heaven',icon:'☀️',name:'天界',subtitle:'光・Relic・高位素材を狙う聖域',route:'world3-branches'},
  {id:'underworld',icon:'🌑',name:'冥界',subtitle:'高危険・Unique探索を狙う奈落領域',route:'world3-branches'},
  {id:'modern',icon:'📡',name:'？？？',subtitle:'境界の向こうから機械音が響く',route:null},
]);

export function world3RealmNodeState(node,visibility={},flags={}){
  const raw=visibility?.[node.id]||'hidden';
  if(node.id==='mortal')return{...node,state:'open',selectable:false,badge:'CURRENT',detail:'現在いる世界。地上の旅路はここから広がっている。'};
  if(node.id==='modern'){
    if(raw==='hidden')return{...node,state:'hidden',selectable:false,badge:'',detail:''};
    if(flags.modernTrace)return{...node,state:'trace',selectable:false,badge:'TRACE',detail:'同じ間隔で並ぶ光点、直線的な構造物、周期的な低い振動。自然物では説明できない痕跡が重なっている。まだ世界名は特定できない。'};
    if(flags.modernSignal)return{...node,state:'signal',selectable:false,badge:'SIGNAL',detail:'機械音だけではない。規則的な光、硬質な反響、人工物らしき気配が返ってくる。'};
    if(flags.modernContact)return{...node,state:'hint',selectable:false,badge:'CONTACT',detail:'鍵穴の向こうから、聞いたことのない機械音がする。こちら側とは違う文明の気配がある。'};
    return{...node,state:'unknown',selectable:false,badge:'???',detail:'境界異常点の向こうに、既知の天界・冥界とは異なる何かがある。'};
  }
  if(raw==='hidden')return{...node,state:'hidden',selectable:false,badge:'',detail:''};
  if(raw==='hint')return{...node,state:'hint',selectable:false,badge:'兆候',detail:node.id==='heaven'?'空の裂け目から光が漏れている。天門の先にはRelicに反応する高位の気配がある。':'深い場所ほど死者の声が近い。奈落の先にはUnique装備を求める冒険者が消えている。'};
  return{...node,state:'open',selectable:true,badge:'OPEN',detail:node.id==='heaven'?'天門は開いた。天光圧の中でBreak/Burstを通し、Relic・光属性装備を狙う聖域探索が始まる。':'奈落門は開いた。回復制限を抱えた高危険戦で、Unique・闇/炎系装備を狙う冥界探索が始まる。'};
}

export function visibleWorld3RealmNodes(visibility={},flags={}){
  return WORLD3_REALM_NODES.map(node=>world3RealmNodeState(node,visibility,flags)).filter(node=>node.state!=='hidden');
}
