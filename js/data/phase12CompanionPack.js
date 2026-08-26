/* ============================================================
   Phase 12.2 — Companion & Monster Expansion
   Fourteen recruitable species placed in existing outer-world regions
   and Boundary Ruins. Roles are descriptive build identities; no new
   capture screen, currency or progression track is introduced.
   ============================================================ */

export const COMPANION_ROLES=Object.freeze({
  attacker:{id:'attacker',name:'アタッカー',desc:'単体火力・弱った敵への詰め'},
  breaker:{id:'breaker',name:'ブレイカー',desc:'高ATKの手数でBreak攻略を補助'},
  guardian:{id:'guardian',name:'ガーディアン',desc:'高HP/DEFで長期戦を支える'},
  sustain:{id:'sustain',name:'サステイン',desc:'自己回復を含む継戦能力'},
  support:{id:'support',name:'サポート',desc:'弱体や魔法圧力で味方を補助'},
  debuffer:{id:'debuffer',name:'デバッファー',desc:'敵ATK低下などの妨害'},
  speed:{id:'speed',name:'スピード',desc:'高SPDで先手と手数を取る'},
  specialist:{id:'specialist',name:'スペシャリスト',desc:'特定地域・特殊戦向けの尖った性能'},
});

function species(id,name,{family,regionId,regionName,enemyType,icon,role,baseStats,growth,recruitChance,traits,skills,rarityTag='field'}){
  return {id,name,type:'monster',family,regionId,regionName,enemyType,icon,role,roleName:COMPANION_ROLES[role]?.name||role,baseStats,growth,recruit:{baseChance:recruitChance},traits,skills,phase12:true,rarityTag};
}

export const PHASE12_RECRUITABLE_SPECIES=Object.freeze({
  ash_devourer:species('ash_devourer','灰喰らい',{family:'undead',regionId:'ch21',regionName:'灰燼の外縁',enemyType:'ch21_normal',icon:'🔥',role:'attacker',baseStats:{hp:160,mp:18,atk:34,def:24,mag:10,spd:15},growth:{hp:13.0,mp:1.2,atk:4.4,def:3.0,mag:1.4,spd:1.1},recruitChance:.026,traits:['灰の執念'],skills:[{level:1,id:'ash_slash'},{level:34,id:'dirty_trick'}]}),
  phosphor_hound:species('phosphor_hound','燐火の猟犬',{family:'beast',regionId:'ch21',regionName:'灰燼の外縁',enemyType:'ch21_fast',icon:'🐺',role:'speed',baseStats:{hp:132,mp:22,atk:30,def:18,mag:17,spd:34},growth:{hp:10.8,mp:1.5,atk:3.8,def:2.2,mag:2.2,spd:2.2},recruitChance:.024,traits:['急襲'],skills:[{level:1,id:'bite'},{level:32,id:'sonic'}]}),

  glass_soldier:species('glass_soldier','氷玻璃兵',{family:'construct',regionId:'ch22',regionName:'玻璃凍原',enemyType:'ch22_normal',icon:'🧊',role:'guardian',baseStats:{hp:178,mp:28,atk:26,def:38,mag:25,spd:13},growth:{hp:14.2,mp:1.8,atk:3.2,def:4.6,mag:3.0,spd:.9},recruitChance:.024,traits:['晶殻'],skills:[{level:1,id:'crystal_ray'},{level:36,id:'body_attack'}]}),
  mirror_fairy:species('mirror_fairy','鏡雪の妖精',{family:'spirit',regionId:'ch22',regionName:'玻璃凍原',enemyType:'ch22_fast',icon:'🧚',role:'sustain',baseStats:{hp:118,mp:44,atk:17,def:17,mag:38,spd:31},growth:{hp:9.6,mp:2.7,atk:2.0,def:2.0,mag:4.7,spd:2.0},recruitChance:.021,traits:['魔力感知'],skills:[{level:1,id:'crystal_ray'},{level:28,id:'slime_heal'},{level:42,id:'sonic'}]}),

  thunder_burial:species('thunder_burial','雷葬兵',{family:'construct',regionId:'ch23',regionName:'天雷墓標群',enemyType:'ch23_normal',icon:'⚡',role:'breaker',baseStats:{hp:170,mp:22,atk:38,def:29,mag:16,spd:22},growth:{hp:13.4,mp:1.4,atk:4.8,def:3.5,mag:2.0,spd:1.5},recruitChance:.022,traits:['野生本能'],skills:[{level:1,id:'thunder_claw'},{level:38,id:'club_hit'}]}),
  flash_wing:species('flash_wing','閃雷翼',{family:'spirit',regionId:'ch23',regionName:'天雷墓標群',enemyType:'ch23_fast',icon:'🦅',role:'speed',baseStats:{hp:126,mp:30,atk:29,def:16,mag:27,spd:42},growth:{hp:10.0,mp:1.9,atk:3.5,def:1.9,mag:3.3,spd:2.6},recruitChance:.020,traits:['先駆け'],skills:[{level:1,id:'thunder_claw'},{level:36,id:'sonic'}]}),

  hollow_flower:species('hollow_flower','虚花の従者',{family:'plant',regionId:'ch24',regionName:'虚花の庭園',enemyType:'ch24_normal',icon:'🌺',role:'debuffer',baseStats:{hp:166,mp:40,atk:24,def:25,mag:40,spd:20},growth:{hp:12.8,mp:2.5,atk:2.9,def:3.0,mag:4.9,spd:1.4},recruitChance:.020,traits:['腐食嗅覚'],skills:[{level:1,id:'rot_bite'},{level:32,id:'sonic'}]}),
  dream_moth:species('dream_moth','夢喰い蝶',{family:'spirit',regionId:'ch24',regionName:'虚花の庭園',enemyType:'ch24_fast',icon:'🦋',role:'support',baseStats:{hp:120,mp:48,atk:18,def:16,mag:43,spd:38},growth:{hp:9.4,mp:2.9,atk:2.1,def:1.8,mag:5.1,spd:2.3},recruitChance:.018,traits:['幻走'],skills:[{level:1,id:'sonic'},{level:34,id:'slime_heal'}]}),

  boundary_executor:species('boundary_executor','境界執行体',{family:'construct',regionId:'ch25',regionName:'境界王座',enemyType:'ch25_normal',icon:'◈',role:'specialist',baseStats:{hp:192,mp:36,atk:42,def:38,mag:34,spd:25},growth:{hp:14.8,mp:2.2,atk:5.1,def:4.5,mag:4.0,spd:1.7},recruitChance:.017,traits:['異界適応'],skills:[{level:1,id:'iron_fang'},{level:40,id:'crystal_ray'}],rarityTag:'outer'}),
  phase_hound:species('phase_hound','位相猟犬',{family:'beast',regionId:'ch25',regionName:'境界王座',enemyType:'ch25_fast',icon:'🐺',role:'attacker',baseStats:{hp:146,mp:30,atk:44,def:21,mag:24,spd:44},growth:{hp:11.2,mp:1.8,atk:5.3,def:2.5,mag:2.9,spd:2.7},recruitChance:.016,traits:['狩猟眼'],skills:[{level:1,id:'bite'},{level:38,id:'dirty_trick'}],rarityTag:'outer'}),

  echo_lux:species('echo_lux','残響灯・ルクス',{family:'spirit',regionId:'echo_observatory',regionName:'残響観測塔',enemyType:'phase12_echo_wisp',icon:'💡',role:'support',baseStats:{hp:150,mp:52,atk:20,def:20,mag:46,spd:40},growth:{hp:11.0,mp:3.1,atk:2.4,def:2.3,mag:5.4,spd:2.4},recruitChance:.012,traits:['魔力感知'],skills:[{level:1,id:'crystal_ray'},{level:34,id:'sonic'}],rarityTag:'ruin'}),
  anvil_unit:species('anvil_unit','重槌機兵・アンヴィル',{family:'construct',regionId:'drowned_foundry',regionName:'沈降鋳造所',enemyType:'phase12_forge_hammer',icon:'🔨',role:'guardian',baseStats:{hp:230,mp:18,atk:45,def:52,mag:10,spd:10},growth:{hp:17.0,mp:1.1,atk:5.2,def:6.0,mag:1.3,spd:.8},recruitChance:.011,traits:['機械装甲'],skills:[{level:1,id:'club_hit'},{level:40,id:'iron_fang'}],rarityTag:'ruin'}),
  memoria_moth:species('memoria_moth','追憶蛾・メモリア',{family:'spirit',regionId:'memory_orchard',regionName:'記憶果樹園',enemyType:'phase12_memory_moth',icon:'🦋',role:'debuffer',baseStats:{hp:142,mp:58,atk:18,def:19,mag:50,spd:43},growth:{hp:10.5,mp:3.4,atk:2.1,def:2.2,mag:5.8,spd:2.6},recruitChance:.009,traits:['幻走'],skills:[{level:1,id:'sonic'},{level:38,id:'crystal_ray'}],rarityTag:'ruin'}),
  null_hound:species('null_hound','軌道猟犬・NULL',{family:'construct',regionId:'zero_station',regionName:'零番境界駅',enemyType:'phase12_null_hound',icon:'🚉',role:'specialist',baseStats:{hp:176,mp:32,atk:52,def:30,mag:24,spd:56},growth:{hp:12.8,mp:1.9,atk:6.0,def:3.5,mag:2.8,spd:3.2},recruitChance:.007,traits:['自己学習'],skills:[{level:1,id:'iron_fang'},{level:42,id:'sonic'}],rarityTag:'ruin'}),
});

export const PHASE12_SPECIAL_HYBRIDS=Object.freeze({
  'ash_devourer+iron_hound':{id:'cinder_gear_hound',name:'燼鋼猟獣',icon:'🔥⚙️',role:'breaker',baseStats:{hp:188,mp:20,atk:44,def:39,mag:13,spd:20},growth:{hp:14.6,mp:1.3,atk:5.3,def:4.7,mag:1.6,spd:1.4},traits:['灰の執念','機械装甲'],skills:[{level:1,id:'iron_fang'},{level:36,id:'ash_slash'}]},
  'mirror_fairy+rot_beast':{id:'twilight_dryad',name:'黄昏樹精',icon:'🌙🌿',role:'sustain',baseStats:{hp:162,mp:50,atk:22,def:27,mag:44,spd:24},growth:{hp:12.5,mp:3.0,atk:2.6,def:3.3,mag:5.2,spd:1.6},traits:['魔力感知','腐食嗅覚'],skills:[{level:1,id:'crystal_ray'},{level:28,id:'slime_heal'},{level:40,id:'sonic'}]},
  'flash_wing+phase_hound':{id:'rift_gryphon',name:'裂界グリフォン',icon:'🦅🐺',role:'speed',baseStats:{hp:168,mp:34,atk:48,def:26,mag:29,spd:52},growth:{hp:12.6,mp:2.0,atk:5.6,def:3.0,mag:3.4,spd:3.0},traits:['先駆け','狩猟眼'],skills:[{level:1,id:'thunder_claw'},{level:34,id:'dirty_trick'}]},
  'echo_lux+null_hound':{id:'zero_signal_beast',name:'零響獣シグナル',icon:'📡',role:'specialist',baseStats:{hp:190,mp:48,atk:48,def:34,mag:48,spd:50},growth:{hp:14.0,mp:2.8,atk:5.5,def:4.0,mag:5.5,spd:2.9},traits:['魔力感知','自己学習'],skills:[{level:1,id:'crystal_ray'},{level:36,id:'iron_fang'},{level:44,id:'sonic'}]},
});

export function phase12CompanionRole(speciesId){return PHASE12_RECRUITABLE_SPECIES[speciesId]?.role||Object.values(PHASE12_SPECIAL_HYBRIDS).find(x=>x.id===speciesId)?.role||null;}
