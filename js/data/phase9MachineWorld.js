/* ============================================================
   Phase 9.6 — Machine World
   First playable district beyond the Eighth Key.
   ============================================================ */

export const MACHINE_WORLD_ENEMIES=Object.freeze({
  machine_scout:{name:'索敵機・アイリス',base:'ch25_fast',mult:{hp:1.18,atk:1.12,def:1.05,speed:1.22},role:'skirmisher'},
  machine_drone:{name:'演算ドローン・ラムダ',base:'ch25_normal',mult:{hp:1.12,atk:1.18,def:1.04,speed:1.10},role:'caster'},
  machine_guard:{name:'城塞機兵・バルク',base:'ch25_tank',mult:{hp:1.35,atk:1.08,def:1.28,speed:.92},role:'guardian'},
  machine_repair:{name:'修復端末・ミュウ',base:'ch24_midboss',mult:{hp:1.05,atk:.94,def:1.12,speed:1.05},role:'support'},
  machine_boss:{name:'中央演算核・MOTHER-0',base:'ch25_boss',mult:{hp:1.75,atk:1.32,def:1.35,speed:1.15},role:'boss'},
});

export const MACHINE_WORLD_STAGES=Object.freeze([
  {id:'machine-world-1',name:'機界・零号接続路',requires:null,depth:1650,desc:'第八鍵の出口。無人の直線都市へ初めて足を踏み入れる。',modifier:{id:'machine_scan',name:'常時走査',desc:'敵速度+15% ／ Break系Lootが出やすい'},tags:['construct','analysis','break'],waves:[{type:'machine_scout',count:4,interval:.75},{type:'machine_drone',count:3,interval:.95}]},
  {id:'machine-world-2',name:'機界・自律搬送区',requires:'machine-world-1',depth:1750,desc:'都市を循環する搬送網。侵入者を排除する機兵が連携してくる。',modifier:{id:'machine_grid',name:'同期戦術網',desc:'敵攻撃+15% ／ 敵支援行動が増加'},tags:['construct','lightning','supply'],waves:[{type:'machine_scout',count:3,interval:.7},{type:'machine_guard',count:2,interval:1.2},{type:'machine_drone',count:3,interval:.9}]},
  {id:'machine-world-3',name:'機界・記憶保管塔',requires:'machine-world-2',depth:1875,desc:'消去された世界記録を保存する塔。修復端末が戦線を維持する。',modifier:{id:'machine_archive',name:'自動修復領域',desc:'回復効果-20% ／ 敵回復・防御支援あり'},tags:['analysis','insight','construct'],waves:[{type:'machine_guard',count:2,interval:1.2},{type:'machine_repair',count:1,interval:0},{type:'machine_drone',count:4,interval:.85}]},
  {id:'machine-world-4',name:'機界・母機製造層',requires:'machine-world-3',depth:2000,desc:'機械生命が組み立てられる製造層。ここから生体に似た反応が検出される。',modifier:{id:'machine_factory',name:'増産命令',desc:'敵HP+20% ／ ドロップ率+30% ／ 機械生命加入候補'},tags:['construct','fortify','reaction'],waves:[{type:'machine_scout',count:4,interval:.65},{type:'machine_guard',count:3,interval:1.1},{type:'machine_repair',count:1,interval:0}]},
  {id:'machine-world-5',name:'機界・中央演算宮',requires:'machine-world-4',depth:2150,desc:'機界第一都市を統括する中央演算核。人界を「観測対象」と呼ぶ存在との初接触。',modifier:{id:'machine_mother',name:'中央演算支配',desc:'回復効果-35% ／ 敵攻防+25% ／ 機界第一地区の主'},tags:['construct','fusion','fate','analysis'],boss:true,waves:[{type:'machine_guard',count:2,interval:1.1},{type:'machine_repair',count:1,interval:0},{type:'machine_boss',count:1,interval:0}]},
]);

export function machineWorldStageDef(id){return MACHINE_WORLD_STAGES.find(s=>s.id===id)||null;}
export function machineWorldProgress(isCleared){const cleared=MACHINE_WORLD_STAGES.filter(s=>isCleared(s.id)).length;return{cleared,total:MACHINE_WORLD_STAGES.length,completed:cleared===MACHINE_WORLD_STAGES.length,next:MACHINE_WORLD_STAGES.find(s=>!isCleared(s.id))||null};}
