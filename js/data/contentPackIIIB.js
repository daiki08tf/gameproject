/* Content Pack III B — multi-region convergence, bosses, companions and rewards. */

export const CP3_SECRET_CHAINS=Object.freeze({
  reply_target:{
    id:'reply_target',name:'返信印の正体',
    steps:[
      {discoveryId:'cp3:route:cp3-route-ash-reply',site:'灰燼の外縁',text:'返信炉床の矩形印は文章ではなく、観測開始を受理した照準応答として並んでいる。'},
      {discoveryId:'cp3:route:cp3-route-ninth-line',site:'天雷墓標群',text:'第九照準廊の追尾線は同じ矩形周期で点灯し、灰の印と同じ対象を追っている。'},
    ],
    resolution:'返信印は文字ではない。こちらの観測を受理し、対象を再照準するための acknowledgement / targeting response だった。'
  },
  returned_pulse:{
    id:'returned_pulse',name:'返送周期の一致',
    steps:[
      {discoveryId:'cp3:route:cp3-route-ninth-line',site:'天雷墓標群',text:'戻る雷は外へ抜けた信号と同じ間隔で帰還する。'},
      {discoveryId:'cp3:route:cp3-route-root-reply',site:'虚花の庭園',text:'異記憶根室の生活音も、雷と同じ短い間隔で途切れながら再生される。'},
      {discoveryId:'cp3:boss:cp3_boss_ack_warden:cleared',site:'灰燼の外縁',text:'照準応答を守る個体の核から、雷と根脈に共通する返送周期が復元される。'},
    ],
    resolution:'雷・根脈・返信印は別現象ではなく、外部から同じ周期で返された一つの観測応答を、それぞれの地域が別の形で受け取っていた。'
  },
  living_archive:{
    id:'living_archive',name:'生きた記憶だけが残したもの',
    steps:[
      {discoveryId:'cp3:route:cp3-route-root-reply',site:'虚花の庭園',text:'根は機界の記録に存在しない生活音を保持している。'},
      {discoveryId:'cp3:boss:cp3_boss_return_clock:cleared',site:'天雷墓標群',text:'返送周期を固定する個体を倒すと、機械側の照合記録には同じ区間だけ欠落がある。'},
      {discoveryId:'cp3:boss:cp3_boss_cinder_reply:cleared',site:'灰燼の外縁',text:'灰の熱痕には削除済みの観測区間が物理的な焼け跡として残っていた。'},
    ],
    resolution:'機械・境界インフラから消えた情報を、生きた根・灰・生態系だけが別媒体として保持している。誰かが記録を消したのか、記録できない性質なのかは未解決。'
  },
});

export const CP3_HIDDEN_BOSSES=Object.freeze({
  cp3_boss_ack_warden:{name:'応答照準守・ACK-WARDEN',sourceEnemyId:'ch21_boss',stageId:'21-8',chainId:'reply_target',hpMult:1.34,atkMult:1.18,defMult:1.16,speedMult:1.08,rewards:['uq_cp3_reply_guard','uq_cp3_ack_lens'],companionId:'cp3_reply_hound'},
  cp3_boss_cinder_reply:{name:'返灰獣・CINDER-REPLY',sourceEnemyId:'ch21_midboss',stageId:'21-8',chainId:'reply_target',hpMult:1.26,atkMult:1.26,defMult:1.08,speedMult:1.16,rewards:['uq_cp3_cinder_shell','uq_cp3_reflux_mark'],companionId:'cp3_cinder_mite'},
  cp3_boss_return_clock:{name:'帰雷時計・RETURN-CLOCK',sourceEnemyId:'ch23_boss',stageId:'23-8',chainId:'returned_pulse',hpMult:1.38,atkMult:1.24,defMult:1.12,speedMult:1.18,rewards:['uq_cp3_return_coil','uq_cp3_ninth_step'],companionId:'cp3_backtrace_wisp'},
  cp3_boss_root_receiver:{name:'受信根母・ROOT-RECEIVER',sourceEnemyId:'ch24_boss',stageId:'24-8',chainId:'returned_pulse',hpMult:1.42,atkMult:1.20,defMult:1.18,speedMult:1.06,rewards:['uq_cp3_memory_bark','uq_cp3_foreign_seed'],companionId:'cp3_memory_sprout'},
  cp3_boss_living_archive:{name:'生体記録核・LIVING-ARCHIVE',sourceEnemyId:'ch24_midboss',stageId:'24-8',chainId:'living_archive',hpMult:1.48,atkMult:1.30,defMult:1.20,speedMult:1.12,rewards:['uq_cp3_living_archive','uq_cp3_blank_record','uq_cp3_reply_crown','uq_cp3_boundary_echo'],companionId:'cp3_archive_moth'},
});

export const CP3_SECRET_COMPANIONS=Object.freeze({
  cp3_reply_hound:{id:'cp3_reply_hound',name:'返信猟犬',family:'beast',regionId:'ash_reflux',regionName:'返信炉床',icon:'🐕',role:'breaker',baseStats:{hp:226,mp:30,atk:65,def:44,mag:28,spd:47},growth:{hp:16.0,mp:1.8,atk:7.1,def:5.0,mag:3.1,spd:2.9},traits:['照準感知'],skills:[{level:1,id:'iron_fang'},{level:42,id:'ash_slash'}]},
  cp3_cinder_mite:{id:'cp3_cinder_mite',name:'返灰小獣',family:'beast',regionId:'ash_reflux',regionName:'返信炉床',icon:'🔥',role:'attacker',baseStats:{hp:190,mp:34,atk:61,def:33,mag:34,spd:54},growth:{hp:13.8,mp:2.0,atk:6.8,def:3.7,mag:3.9,spd:3.2},traits:['残照追跡'],skills:[{level:1,id:'ash_slash'},{level:40,id:'bite'}]},
  cp3_backtrace_wisp:{id:'cp3_backtrace_wisp',name:'帰雷灯',family:'spirit',regionId:'thunder_reflux',regionName:'第九照準廊',icon:'⚡',role:'speed',baseStats:{hp:178,mp:68,atk:36,def:28,mag:64,spd:68},growth:{hp:12.6,mp:3.9,atk:4.0,def:3.1,mag:7.0,spd:3.8},traits:['返送同期'],skills:[{level:1,id:'thunder_claw'},{level:38,id:'sonic'}]},
  cp3_memory_sprout:{id:'cp3_memory_sprout',name:'異記憶芽',family:'plant',regionId:'garden_reflux',regionName:'異記憶根室',icon:'🌱',role:'support',baseStats:{hp:204,mp:76,atk:24,def:42,mag:67,spd:42},growth:{hp:14.8,mp:4.2,atk:2.7,def:4.8,mag:7.2,spd:2.5},traits:['生活音記憶'],skills:[{level:1,id:'slime_heal'},{level:36,id:'crystal_ray'}]},
  cp3_archive_moth:{id:'cp3_archive_moth',name:'記録蛾',family:'spirit',regionId:'garden_reflux',regionName:'生体記録層',icon:'🦋',role:'specialist',baseStats:{hp:188,mp:82,atk:30,def:34,mag:72,spd:61},growth:{hp:13.4,mp:4.5,atk:3.4,def:3.8,mag:7.8,spd:3.5},traits:['欠落記憶読解'],skills:[{level:1,id:'crystal_ray'},{level:40,id:'sonic'},{level:48,id:'slime_heal'}]},
  cp3_echo_seed:{id:'cp3_echo_seed',name:'境界反響種',family:'plant',regionId:'garden_reflux',regionName:'異記憶根室',icon:'🌰',role:'specialist',baseStats:{hp:216,mp:62,atk:42,def:48,mag:62,spd:45},growth:{hp:15.5,mp:3.5,atk:4.8,def:5.3,mag:6.8,spd:2.7},traits:['境界適応'],skills:[{level:1,id:'iron_fang'},{level:40,id:'crystal_ray'}]},
});

export const CP3_SPECIAL_HYBRIDS=Object.freeze({
  'cp3_reply_hound+cp3_backtrace_wisp':{id:'cp3_target_hound',name:'照準雷犬',icon:'🐕⚡',role:'breaker',baseStats:{hp:232,mp:52,atk:68,def:43,mag:50,spd:61},growth:{hp:16.4,mp:3.0,atk:7.3,def:4.9,mag:5.6,spd:3.5},traits:['照準感知','返送同期'],skills:[{level:1,id:'iron_fang'},{level:38,id:'thunder_claw'},{level:46,id:'sonic'}]},
  'cp3_memory_sprout+cp3_archive_moth':{id:'cp3_living_bloom',name:'生体記録花',icon:'🌺',role:'support',baseStats:{hp:214,mp:88,atk:28,def:44,mag:76,spd:53},growth:{hp:15.2,mp:4.8,atk:3.1,def:5.0,mag:8.1,spd:3.1},traits:['生活音記憶','欠落記憶読解'],skills:[{level:1,id:'slime_heal'},{level:36,id:'crystal_ray'},{level:46,id:'sonic'}]},
  'cp3_cinder_mite+cp3_echo_seed':{id:'cp3_reflux_beast',name:'逆流灰種獣',icon:'🔥🌰',role:'attacker',baseStats:{hp:226,mp:44,atk:70,def:46,mag:46,spd:51},growth:{hp:16.1,mp:2.6,atk:7.6,def:5.1,mag:5.2,spd:3.0},traits:['残照追跡','境界適応'],skills:[{level:1,id:'ash_slash'},{level:40,id:'iron_fang'}]},
});

export const CP3_REWARDS=Object.freeze([
  {id:'uq_cp3_reply_guard',name:'返信守の盾',slot:'shield',rarity:'mythic',stats:{def:420,hp:880,mag:120},description:'観測を受けた直後の一撃に耐えるための重盾。'},
  {id:'uq_cp3_ack_lens',name:'受理照準鏡',slot:'accessory',rarity:'mythic',stats:{atk:180,mag:180,crit:24,spd:120},description:'敵の予兆と観測応答を同じ像として重ねる。'},
  {id:'uq_cp3_cinder_shell',name:'返灰外殻',slot:'body',rarity:'mythic',stats:{def:360,hp:1180,atk:130},description:'失われた熱履歴を装甲として固定した外殻。'},
  {id:'uq_cp3_reflux_mark',name:'逆流刻印',slot:'accessory',rarity:'legendary',stats:{atk:210,crit:28,spd:135},description:'遅れて返る攻撃軌跡を読むための刻印。'},
  {id:'uq_cp3_return_coil',name:'帰雷コイル',slot:'accessory',rarity:'mythic',stats:{mag:260,spd:210,crit:18,mp:620},description:'往復する雷の周期だけを増幅する導体。'},
  {id:'uq_cp3_ninth_step',name:'第九歩法輪',slot:'accessory',rarity:'legendary',stats:{atk:140,mag:140,spd:250,crit:20},description:'既知の八方向から外れた踏み込みを補助する。'},
  {id:'uq_cp3_memory_bark',name:'異記憶樹皮',slot:'body',rarity:'mythic',stats:{def:330,hp:980,mag:230,mp:420},description:'生きた記憶を防具へ定着させた樹皮。'},
  {id:'uq_cp3_foreign_seed',name:'外音の種子',slot:'accessory',rarity:'mythic',stats:{mag:280,mp:720,spd:110},description:'未知の生活音を魔力の脈動へ変換する。'},
  {id:'uq_cp3_living_archive',name:'生体記録冠',slot:'head',rarity:'mythic',stats:{def:250,mag:320,mp:820,spd:90},description:'消された記録を生体反応として保持する冠。'},
  {id:'uq_cp3_blank_record',name:'空白記録板',slot:'shield',rarity:'mythic',stats:{def:390,hp:760,mag:210},description:'記録されなかった区間だけが硬質化した板。'},
  {id:'uq_cp3_reply_crown',name:'返答王冠',slot:'head',rarity:'mythic',stats:{def:220,atk:180,mag:260,crit:20},description:'返された観測を力へ変えるが、由来はなお不明。'},
  {id:'uq_cp3_boundary_echo',name:'境界反響核',slot:'accessory',rarity:'mythic',stats:{atk:190,mag:240,spd:170,crit:22,hp:420},description:'複数地域の逆流観測を一つの核に束ねたRelic。'},
]);

export const CP3_CODEX_ECOLOGY=Object.freeze({
  cp3_boss_ack_warden:{habitat:'返信炉床 / 第九照準線',ecology:'文字を守るのではなく、観測の受理と再照準を維持する局所守護体。'},
  cp3_boss_cinder_reply:{habitat:'灰燼の外縁・逆流熱痕',ecology:'焼失した行動履歴を遅延再生する生態へ変質した灰系個体。'},
  cp3_boss_return_clock:{habitat:'天雷墓標群・返送周期点',ecology:'往路と復路の雷撃間隔を固定し、地域全体を一つの時計として同期させる。'},
  cp3_boss_root_receiver:{habitat:'虚花の庭園・異記憶根室',ecology:'外部生活圏の断片音を根脈へ分散保存する受信型植物個体。'},
  cp3_boss_living_archive:{habitat:'生体記録層',ecology:'機械記録に欠落した区間を、生体反応と記憶継承だけで保存する複合記録体。'},
});

export const CP3_CHAIN_LORE=Object.freeze({
  reply_target:{id:'cp3:lore:reply-target',name:'断片：返信は文字ではない',text:'矩形の返信印は文章ではなく、こちらの観測開始を受理し対象を再照準する応答だった。外側は少なくとも接触を「認識」している。'},
  returned_pulse:{id:'cp3:lore:returned-pulse',name:'断片：同じ返送周期',text:'雷・根脈・灰の変化は同じ周期で発生する。一つの返答が、受信媒体ごとに別の現象へ翻訳されている。'},
  living_archive:{id:'cp3:lore:living-archive',name:'断片：記録できない記録',text:'機械から欠落した観測区間を、生態系だけが保持していた。意図的削除なのか、機械では記録できない性質なのかはまだ分からない。'},
});

export function cp3ChainProgress(chain,{discoveries={}}={}){
  let completed=0;
  for(const step of chain.steps){if(!discoveries[step.discoveryId])break;completed++;}
  return{completed,total:chain.steps.length,resolved:completed===chain.steps.length,next:chain.steps[completed]||null};
}

export function cp3HybridFor(aSpeciesId,bSpeciesId){
  const key=[aSpeciesId,bSpeciesId].sort().join('+');
  for(const [pair,def] of Object.entries(CP3_SPECIAL_HYBRIDS))if(pair.split('+').sort().join('+')===key)return def;
  return null;
}
