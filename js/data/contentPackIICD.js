/* Content Pack II C+D — multi-region secret chains, hidden bosses and rewards. */

export const CP2_SECRET_CHAINS=Object.freeze({
  silent_beast:{
    id:'silent_beast',name:'声なき獣の系譜',
    steps:[
      {discoveryId:'cp2:route:route-silent-nest',site:'phantom_beast_forest',text:'無音の産室で、幼獣ではなく「孵化前から観測された」爪痕が見つかる。'},
      {discoveryId:'cp2:route:route-empty-procession',site:'old_king_tomb',text:'空列の回廊の封鎖記録に、森から運び込まれた無鳴獣の記述がある。'},
      {discoveryId:'cp2:route:route-blind-wall',site:'black_moon_temple',text:'盲壁観測孔の向こうで、同じ心拍だけが別層から反射している。'},
    ],
    bossStageId:'secret-phantom-beast-forest',bossId:'cp2_boss_nest_mother',bossName:'無鳴母獣・NEST-MOTHER',rewardIds:['uq_cp2_silent_bell','uq_cp2_nest_heart'],companionId:'cp2_silver_fawn',
    resolution:'三地域の記録は、一頭の獣ではなく「同じ系譜が複数層で同時に育つ」生態を示している。'
  },
  eighth_rib:{
    id:'eighth_rib',name:'第八肋骨の行先',
    steps:[
      {discoveryId:'cp2:route:route-eighth-rib',site:'dragonbone_canyon',text:'第八肋骨路は竜骸の外へ出ず、内部で別の座標へ折り返している。'},
      {discoveryId:'cp2:route:route-backward-shelf',site:'inverted_library',text:'逆棚回廊の余白記録が、第八肋骨を「第零線への保守路」と呼んでいる。'},
      {stageId:'secret-zero-station',site:'zero_station',text:'零番境界駅の線路規格と、第八肋骨内部の導線幅が一致する。'},
    ],
    bossStageId:'secret-dragonbone-canyon',bossId:'cp2_boss_octave_warden',bossName:'第八脈守・OCTAVE',rewardIds:['uq_cp2_eighth_edge','uq_cp2_zero_spine'],companionId:'cp2_rib_drake',
    resolution:'竜骸の「八本目」は骨ではなく、零番境界駅へ接続する保守導線だった可能性が高い。'
  },
  blind_wall:{
    id:'blind_wall',name:'盲壁の二重観測',
    steps:[
      {discoveryId:'cp2:route:route-blind-wall',site:'black_moon_temple',text:'盲壁の厚みがゼロになる瞬間、二つの信号が同じ対象へ向く。'},
      {discoveryId:'cp2:route:route-backward-shelf',site:'inverted_library',text:'反転記録には、同じ対象を「内側」と「外側」から測った二系列の観測票がある。'},
      {discoveryId:'secret-chain:buried-observation-coordinate',site:'convergence_observatory',text:'第零座標の収束記録を重ねても、観測対象そのものの位置だけは定まらない。'},
    ],
    bossStageId:'secret-black-moon-temple',bossId:'cp2_boss_parallax',bossName:'双方向観測体・PARALLAX',rewardIds:['uq_cp2_parallax_eye','uq_cp2_blind_wall'],companionId:'cp2_parallax_wisp',
    resolution:'二つの観測方向は互いを見ているのではない。双方が、まだ位置を定義できない同一対象を測っている。'
  },
});

export const CP2_HIDDEN_BOSSES=Object.freeze({
  cp2_boss_nest_mother:{name:'無鳴母獣・NEST-MOTHER',sourceEnemyId:'phase12_phantom_lord',stageId:'secret-phantom-beast-forest',chainId:'silent_beast',hpMult:1.34,atkMult:1.18,defMult:1.10,speedMult:1.08},
  cp2_boss_cinder_hart:{name:'灰角残響獣・CINDER-HART',sourceEnemyId:'phase12_tomb_king',stageId:'secret-old-king-tomb',chainId:'silent_beast',hpMult:1.24,atkMult:1.24,defMult:1.08,speedMult:1.16},
  cp2_boss_octave_warden:{name:'第八脈守・OCTAVE',sourceEnemyId:'phase12_bone_tyrant',stageId:'secret-dragonbone-canyon',chainId:'eighth_rib',hpMult:1.38,atkMult:1.25,defMult:1.18,speedMult:1.04},
  cp2_boss_palimsest:{name:'重記司書・PALIMPSEST',sourceEnemyId:'phase12_archive_master',stageId:'secret-inverted-library',chainId:'eighth_rib',hpMult:1.28,atkMult:1.30,defMult:1.08,speedMult:1.15},
  cp2_boss_parallax:{name:'双方向観測体・PARALLAX',sourceEnemyId:'phase12_moon_deity',stageId:'secret-black-moon-temple',chainId:'blind_wall',hpMult:1.42,atkMult:1.32,defMult:1.16,speedMult:1.12},
});

export const CP2_SECRET_COMPANIONS=Object.freeze({
  cp2_silver_fawn:{id:'cp2_silver_fawn',name:'無鳴銀仔',family:'beast',regionId:'phantom_beast_forest',regionName:'無音の産室',icon:'🦌',role:'speed',baseStats:{hp:178,mp:38,atk:49,def:28,mag:34,spd:58},growth:{hp:13.2,mp:2.2,atk:5.7,def:3.2,mag:4.0,spd:3.3},traits:['白銀の脚'],skills:[{level:1,id:'bite'},{level:38,id:'sonic'}]},
  cp2_cinder_fawn:{id:'cp2_cinder_fawn',name:'燼角仔',family:'beast',regionId:'old_king_tomb',regionName:'空列の回廊',icon:'🦌🔥',role:'attacker',baseStats:{hp:192,mp:28,atk:56,def:34,mag:22,spd:42},growth:{hp:14.0,mp:1.7,atk:6.3,def:3.8,mag:2.6,spd:2.5},traits:['灰の執念'],skills:[{level:1,id:'ash_slash'},{level:40,id:'bite'}]},
  cp2_rib_drake:{id:'cp2_rib_drake',name:'第八骨竜仔',family:'dragon',regionId:'dragonbone_canyon',regionName:'第八肋骨路',icon:'🐉',role:'breaker',baseStats:{hp:224,mp:26,atk:64,def:46,mag:24,spd:32},growth:{hp:16.1,mp:1.6,atk:7.0,def:5.2,mag:2.8,spd:2.0},traits:['機械装甲'],skills:[{level:1,id:'iron_fang'},{level:42,id:'thunder_claw'}]},
  cp2_margin_sprite:{id:'cp2_margin_sprite',name:'余白精',family:'spirit',regionId:'inverted_library',regionName:'逆棚回廊',icon:'📖',role:'support',baseStats:{hp:154,mp:66,atk:20,def:22,mag:61,spd:52},growth:{hp:11.4,mp:3.8,atk:2.3,def:2.5,mag:6.8,spd:3.0},traits:['魔力感知'],skills:[{level:1,id:'crystal_ray'},{level:36,id:'slime_heal'},{level:44,id:'sonic'}]},
  cp2_parallax_wisp:{id:'cp2_parallax_wisp',name:'視差灯',family:'spirit',regionId:'black_moon_temple',regionName:'盲壁観測孔',icon:'◉',role:'specialist',baseStats:{hp:184,mp:72,atk:35,def:34,mag:66,spd:56},growth:{hp:13.4,mp:4.0,atk:4.0,def:3.9,mag:7.2,spd:3.2},traits:['異界適応'],skills:[{level:1,id:'crystal_ray'},{level:40,id:'sonic'}]},
  cp2_zero_larva:{id:'cp2_zero_larva',name:'零線幼体',family:'construct',regionId:'zero_station',regionName:'零番境界駅',icon:'🚉',role:'specialist',baseStats:{hp:198,mp:40,atk:58,def:42,mag:42,spd:54},growth:{hp:14.3,mp:2.4,atk:6.4,def:4.8,mag:4.8,spd:3.1},traits:['自己学習'],skills:[{level:1,id:'iron_fang'},{level:42,id:'sonic'}]},
});

export const CP2_SPECIAL_HYBRIDS=Object.freeze({
  'ash_devourer+cp2_silver_fawn':{id:'cp2_ashen_moonhart',name:'灰月鹿',icon:'🌘🦌',role:'speed',baseStats:{hp:205,mp:34,atk:58,def:35,mag:31,spd:55},growth:{hp:15.0,mp:2.0,atk:6.4,def:4.0,mag:3.6,spd:3.2},traits:['白銀の脚','灰の執念'],skills:[{level:1,id:'ash_slash'},{level:38,id:'sonic'}]},
  'cp2_rib_drake+null_hound':{id:'cp2_zero_drake',name:'零脈竜',icon:'🐉📡',role:'breaker',baseStats:{hp:238,mp:34,atk:68,def:48,mag:36,spd:46},growth:{hp:17.1,mp:2.0,atk:7.4,def:5.4,mag:4.1,spd:2.7},traits:['機械装甲','自己学習'],skills:[{level:1,id:'iron_fang'},{level:40,id:'thunder_claw'}]},
  'cp2_margin_sprite+echo_lux':{id:'cp2_margin_lux',name:'余白残響灯',icon:'📖💡',role:'support',baseStats:{hp:172,mp:72,atk:23,def:26,mag:65,spd:52},growth:{hp:12.5,mp:4.1,atk:2.6,def:2.9,mag:7.1,spd:3.0},traits:['魔力感知'],skills:[{level:1,id:'crystal_ray'},{level:34,id:'slime_heal'},{level:44,id:'sonic'}]},
  'cp2_parallax_wisp+zero_signal_beast':{id:'cp2_dual_observer',name:'双観測獣',icon:'◉📡',role:'specialist',baseStats:{hp:216,mp:62,atk:55,def:42,mag:62,spd:58},growth:{hp:15.6,mp:3.5,atk:6.1,def:4.7,mag:6.8,spd:3.3},traits:['異界適応','自己学習'],skills:[{level:1,id:'crystal_ray'},{level:38,id:'iron_fang'},{level:46,id:'sonic'}]},
});

export function cp2ChainProgress(chain,{discoveries={},isStageCleared=()=>false}={}){
  let completed=0;
  for(const step of chain.steps){
    const ok=step.discoveryId?!!discoveries[step.discoveryId]:step.stageId?isStageCleared(step.stageId):false;
    if(!ok)break; completed++;
  }
  return{completed,total:chain.steps.length,resolved:completed===chain.steps.length,next:chain.steps[completed]||null};
}
