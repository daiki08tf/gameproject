/* ============================================================
   Phase 9.7 — Machine World Expansion
   Two connected machine-city districts beyond the Eighth Key.
   ============================================================ */

export const MACHINE_WORLD_ENEMIES=Object.freeze({
  machine_scout:{name:'索敵機・アイリス',base:'ch25_fast',mult:{hp:1.18,atk:1.12,def:1.05,speed:1.22},role:'skirmisher'},
  machine_drone:{name:'演算ドローン・ラムダ',base:'ch25_normal',mult:{hp:1.12,atk:1.18,def:1.04,speed:1.10},role:'caster'},
  machine_guard:{name:'城塞機兵・バルク',base:'ch25_tank',mult:{hp:1.35,atk:1.08,def:1.28,speed:.92},role:'guardian'},
  machine_repair:{name:'修復端末・ミュウ',base:'ch24_fast',mult:{hp:1.25,atk:.94,def:1.22,speed:1.05},role:'support'},
  machine_boss:{name:'中央演算核・MOTHER-0',base:'ch25_boss',mult:{hp:1.75,atk:1.32,def:1.35,speed:1.15},role:'boss'},
  machine_hunter:{name:'追跡機・ケルベロス',base:'ch25_fast',mult:{hp:1.42,atk:1.38,def:1.12,speed:1.34},role:'skirmisher'},
  machine_null:{name:'無効化端末・NULL-7',base:'ch25_normal',mult:{hp:1.38,atk:1.26,def:1.24,speed:1.16},role:'caster'},
  machine_colossus:{name:'重装機神・ギガント',base:'ch25_tank',mult:{hp:1.82,atk:1.34,def:1.62,speed:.84},role:'guardian'},
  machine_architect:{name:'設計主機・ARCHITECT-1',base:'ch25_boss',mult:{hp:2.35,atk:1.58,def:1.72,speed:1.22},role:'boss'},
});

export const MACHINE_WORLD_STAGES=Object.freeze([
  {id:'machine-world-1',district:1,name:'機界・零号接続路',requires:null,depth:1650,desc:'第八鍵の出口。無人の直線都市へ初めて足を踏み入れる。',modifier:{id:'machine_scan',name:'常時走査',desc:'敵速度+15% ／ Break系Lootが出やすい'},tags:['construct','analysis','break'],waves:[{type:'machine_scout',count:4,interval:.75},{type:'machine_drone',count:3,interval:.95}]},
  {id:'machine-world-2',district:1,name:'機界・自律搬送区',requires:'machine-world-1',depth:1750,desc:'都市を循環する搬送網。侵入者を排除する機兵が連携してくる。',modifier:{id:'machine_grid',name:'同期戦術網',desc:'敵攻撃+15% ／ 敵支援行動が増加'},tags:['construct','lightning','supply'],waves:[{type:'machine_scout',count:3,interval:.7},{type:'machine_guard',count:2,interval:1.2},{type:'machine_drone',count:3,interval:.9}]},
  {id:'machine-world-3',district:1,name:'機界・記憶保管塔',requires:'machine-world-2',depth:1875,desc:'消去された世界記録を保存する塔。修復端末が戦線を維持する。',modifier:{id:'machine_archive',name:'自動修復領域',desc:'回復効果-20% ／ 敵回復・防御支援あり'},tags:['analysis','insight','construct'],waves:[{type:'machine_guard',count:2,interval:1.2},{type:'machine_repair',count:1,interval:0},{type:'machine_drone',count:4,interval:.85}]},
  {id:'machine-world-4',district:1,name:'機界・母機製造層',requires:'machine-world-3',depth:2000,desc:'機械生命が組み立てられる製造層。ここから生体に似た反応が検出される。',modifier:{id:'machine_factory',name:'増産命令',desc:'敵HP+20% ／ ドロップ率+30% ／ 機械生命加入候補'},tags:['construct','fortify','reaction'],waves:[{type:'machine_scout',count:4,interval:.65},{type:'machine_guard',count:3,interval:1.1},{type:'machine_repair',count:1,interval:0}]},
  {id:'machine-world-5',district:1,name:'機界・中央演算宮',requires:'machine-world-4',depth:2150,desc:'機界第一都市を統括する中央演算核。人界を「観測対象」と呼ぶ存在との初接触。',modifier:{id:'machine_mother',name:'中央演算支配',desc:'回復効果-35% ／ 敵攻防+25% ／ 機界第一地区の主'},tags:['construct','fusion','fate','analysis'],boss:true,waves:[{type:'machine_guard',count:2,interval:1.1},{type:'machine_repair',count:1,interval:0},{type:'machine_boss',count:1,interval:0}]},

  {id:'machine-world-6',district:2,name:'機界・禁制演算街',requires:'machine-world-5',depth:2350,desc:'MOTHER-0の記録から開いた第二都市。自己改変を禁止された機械生命が徘徊する。',modifier:{id:'machine_forbidden',name:'禁制プロトコル',desc:'敵SPD+20% ／ 状態異常・Breakを起点にしたLootが増加'},tags:['construct','break','status','analysis'],waves:[{type:'machine_hunter',count:4,interval:.65},{type:'machine_null',count:3,interval:.9}]},
  {id:'machine-world-7',district:2,name:'機界・消去庭園',requires:'machine-world-6',depth:2500,desc:'不要と判断された記憶と人格を廃棄する庭園。消去命令そのものが敵として現れる。',modifier:{id:'machine_nullfield',name:'記憶消去領域',desc:'回復効果-30% ／ MP圧力上昇 ／ Insight系Lootが増加'},tags:['construct','insight','fate','dark'],waves:[{type:'machine_null',count:4,interval:.82},{type:'machine_hunter',count:3,interval:.72},{type:'machine_repair',count:1,interval:0}]},
  {id:'machine-world-8',district:2,name:'機界・巨神格納庫',requires:'machine-world-7',depth:2650,desc:'都市戦争用に封印された超大型機兵群。正面突破では押し潰される。',modifier:{id:'machine_colossus_field',name:'重力固定',desc:'敵DEF+35% ／ Break時の報酬補正上昇'},tags:['construct','fortify','break','physical'],waves:[{type:'machine_colossus',count:2,interval:1.4},{type:'machine_hunter',count:4,interval:.7}]},
  {id:'machine-world-9',district:2,name:'機界・設計記録中枢',requires:'machine-world-8',depth:2825,desc:'MOTHER系列を設計した存在の記録庫。「観測者」は単なる機械文明ではなかった。',modifier:{id:'machine_origin',name:'原型照合',desc:'敵攻防+20% ／ Fusion・Analysis系Lootが増加'},tags:['construct','fusion','analysis','fate'],waves:[{type:'machine_null',count:3,interval:.8},{type:'machine_colossus',count:2,interval:1.3},{type:'machine_repair',count:1,interval:0}]},
  {id:'machine-world-10',district:2,name:'機界・設計神殿',requires:'machine-world-9',depth:3000,desc:'機界第二都市の最深部。MOTHER-0を作った設計主機が、人界と機界を同じ「実験層」と呼ぶ。',modifier:{id:'machine_architect_rule',name:'設計者権限',desc:'回復効果-45% ／ 敵攻防+30% ／ Fusion・Unique報酬強化'},tags:['construct','fusion','fate','analysis','unique'],boss:true,final:true,waves:[{type:'machine_colossus',count:2,interval:1.2},{type:'machine_null',count:2,interval:.8},{type:'machine_architect',count:1,interval:0}]},
]);

export function machineWorldStageDef(id){return MACHINE_WORLD_STAGES.find(s=>s.id===id)||null;}
export function machineWorldProgress(isCleared){const cleared=MACHINE_WORLD_STAGES.filter(s=>isCleared(s.id)).length;return{cleared,total:MACHINE_WORLD_STAGES.length,completed:cleared===MACHINE_WORLD_STAGES.length,next:MACHINE_WORLD_STAGES.find(s=>!isCleared(s.id))||null,district1:MACHINE_WORLD_STAGES.filter(s=>s.district===1&&isCleared(s.id)).length,district2:MACHINE_WORLD_STAGES.filter(s=>s.district===2&&isCleared(s.id)).length};}
