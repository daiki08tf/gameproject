/* ============================================================
   Phase 9.1 — Regional Identity
   BGMなし。地域ごとの戦闘傾向・推奨対策・探索イベントをデータ化する。
   ============================================================ */

export const PHASE9_REGION_PROFILES = Object.freeze({
  ch21:{
    id:'ashen_rim',name:'灰燼の外縁',theme:'火傷と重装',hazards:['burn','armor'],favored:['break','guard','ice'],resisted:['fire'],
    enemyBias:{fast:'低',tank:'高',status:'火傷'},lootFocus:['fire','break','heavy'],
    fieldRule:{id:'cinder_pressure',name:'灰熱圧',desc:'長期戦ほど敵の攻撃圧が高まる。Breakで流れを断ち切る地域。'},
    events:[
      {id:'ash_grave',name:'灰に埋もれた王墓',kind:'lore',rewardTag:'dark'},
      {id:'ember_forge',name:'消えない鍛炉',kind:'loot',rewardTag:'fire'},
      {id:'border_survivor',name:'境界の生存者',kind:'choice',rewardTag:'break'},
    ],
  },
  ch22:{
    id:'glass_tundra',name:'玻璃凍原',theme:'凍結と反射',hazards:['freeze','reflect'],favored:['fire','tempo','analysis'],resisted:['ice'],
    enemyBias:{fast:'中',tank:'中',status:'凍結'},lootFocus:['ice','spell','analysis'],
    fieldRule:{id:'mirror_frost',name:'鏡霜',desc:'同じ攻め方を繰り返すほど敵が適応する。物理・魔法・Fusionを切り替えて崩す地域。'},
    events:[
      {id:'frozen_record',name:'凍結記録体',kind:'lore',rewardTag:'analysis'},
      {id:'mirror_cache',name:'反射氷庫',kind:'loot',rewardTag:'ice'},
      {id:'zero_observer',name:'停止した観測者',kind:'choice',rewardTag:'insight'},
    ],
  },
  ch23:{
    id:'thunder_graves',name:'天雷墓標群',theme:'高速と感電',hazards:['shock','haste'],favored:['mark','evade','fortify'],resisted:['lightning'],
    enemyBias:{fast:'高',tank:'中',status:'感電'},lootFocus:['lightning','speed','mark'],
    fieldRule:{id:'storm_chain',name:'雷鎖',desc:'高速敵を放置すると行動が連鎖する。Mark・先制・行動阻害が強い地域。'},
    events:[
      {id:'fallen_marker',name:'落雷墓標',kind:'lore',rewardTag:'lightning'},
      {id:'storm_armory',name:'雷神兵工廠跡',kind:'loot',rewardTag:'speed'},
      {id:'broken_skyrail',name:'断線天路',kind:'choice',rewardTag:'evade'},
    ],
  },
  ch24:{
    id:'hollow_garden',name:'虚花の庭園',theme:'毒と記憶侵食',hazards:['poison','sleep'],favored:['status','reaction','heal'],resisted:['poison'],
    enemyBias:{fast:'高',tank:'中',status:'毒・睡眠'},lootFocus:['poison','reaction','regen'],
    fieldRule:{id:'memory_pollen',name:'記憶花粉',desc:'状態異常を受けるほど敵が活性化する。解除・回復・状態異常返しが有効な地域。'},
    events:[
      {id:'memory_flower',name:'記憶を咲かせる花',kind:'lore',rewardTag:'insight'},
      {id:'poison_hive',name:'毒蜜の巣',kind:'loot',rewardTag:'poison'},
      {id:'root_archive',name:'根脈記憶庫',kind:'choice',rewardTag:'reaction'},
    ],
  },
  ch25:{
    id:'boundary_throne',name:'境界王座',theme:'位相変化と複合耐性',hazards:['phase','seal'],favored:['fusion','analysis','fate'],resisted:['light','dark'],
    enemyBias:{fast:'高',tank:'高',status:'封印'},lootFocus:['fusion','light','dark'],
    fieldRule:{id:'veil_shift',name:'境界転位',desc:'敵の有効属性・弱点が戦闘中に変化する。解析と複数の攻撃軸を要求する最終地域。'},
    events:[
      {id:'seventh_key',name:'七鍵封鎖端末',kind:'lore',rewardTag:'fusion'},
      {id:'world_layer',name:'失われた世界層',kind:'loot',rewardTag:'dark'},
      {id:'eighth_key',name:'存在しない第八鍵',kind:'choice',rewardTag:'fate'},
    ],
  },
});

export function regionProfileForChapter(chapterId){return PHASE9_REGION_PROFILES[chapterId]||null;}
export function phase9ExplorationEvents(chapterId){return regionProfileForChapter(chapterId)?.events||[];}
