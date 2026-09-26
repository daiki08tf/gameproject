/* Combat 3.3 / Phase 9.2 — Boss Encounter profiles
   Bossを「高HPの単体敵」ではなく、取り巻き・段階変化・守護役を持つ
   Encounterとして扱う。Phase 9.2では外縁世界5Bossを完全個別設計する。 */

const GENERIC_PHASE_NAMES = Object.freeze({
  2:'第二形態',3:'最終局面',4:'決死の猛攻',5:'境界突破',6:'深層覚醒',
  7:'天空の号令',8:'魔界侵蝕',9:'虚無共鳴',11:'灰冠再臨',12:'天雷解放',
  13:'晶界共鳴',14:'腐界開花',21:'灰燼再燃',22:'零度共鳴',23:'天雷過給',24:'虚花開花',25:'境界反転',
});

function chapterFromType(type){
  const m=/^ch(\d+)_boss$/.exec(type||'');
  return m?Number(m[1]):null;
}
function escortType(chapter,kind){ return chapter ? `ch${chapter}_${kind}` : null; }
function genericProfile(chapter){
  if(!chapter)return null;
  const hard=chapter>=10,mid=chapter>=5;
  return {
    id:`chapter-${chapter}`,
    startEscorts: hard
      ? [{type:escortType(chapter,'tank'),count:1,guard:true},{type:escortType(chapter,'fast'),count:1}]
      : mid ? [{type:escortType(chapter,'tank'),count:1,guard:true}]
      : [],
    guardDefMult: hard?1.65:1.45,
    phases:[
      {ratio:.62,name:GENERIC_PHASE_NAMES[chapter]||'戦況変化',atkMult:1.12,spawn:[{type:escortType(chapter,'fast'),count:1}]},
      {ratio:.28,name:chapter>=11?'境界崩壊':'最後の猛攻',atkMult:1.22,spdMult:1.14,accelerateBossAI:.72},
    ],
  };
}

const SPECIAL = Object.freeze({
  boss_orcking:{id:'orc-king',startEscorts:[{type:'tank',count:1,guard:true}],guardDefMult:1.45,phases:[{ratio:.60,name:'王の号令',atkMult:1.12,spawn:[{type:'grunt',count:2}]},{ratio:.25,name:'暴君の咆哮',atkMult:1.30,spdMult:1.12,accelerateBossAI:.75}]},
  ch5_boss:{id:'flame-emperor',startEscorts:[{type:'ch5_tank',count:1,guard:true},{type:'ch5_fast',count:1}],guardDefMult:1.70,phases:[{ratio:.70,name:'溶岩の護壁',defMult:1.18,spawn:[{type:'ch5_tank',count:1,guard:true}]},{ratio:.35,name:'炎帝覚醒',atkMult:1.30,spdMult:1.16,accelerateBossAI:.68}]},
  ch10_boss:{id:'true-demon-king',startEscorts:[{type:'ch10_tank',count:2,guard:true},{type:'ch10_fast',count:1}],guardDefMult:1.75,phases:[{ratio:.72,name:'魔王結界',defMult:1.20,spawn:[{type:'ch10_tank',count:1,guard:true}]},{ratio:.42,name:'終焉の号令',atkMult:1.22,spawn:[{type:'ch10_fast',count:2}]},{ratio:.18,name:'真・魔王',atkMult:1.32,spdMult:1.20,accelerateBossAI:.58}]},
  ch15_boss:{id:'ark-zero',startEscorts:[{type:'ch15_tank',count:2,guard:true},{type:'ch15_fast',count:1}],guardDefMult:1.80,phases:[{ratio:.75,name:'零式防衛陣',defMult:1.22,spawn:[{type:'ch15_tank',count:1,guard:true}]},{ratio:.45,name:'過負荷演算',atkMult:1.25,spdMult:1.18,accelerateBossAI:.70},{ratio:.20,name:'最終プロトコル',atkMult:1.30,spdMult:1.15,accelerateBossAI:.55,spawn:[{type:'ch15_fast',count:2}]}]},
  ch21_boss:{id:'cinder-lord-vulcan',dangerTags:['burn','guard','escalate'],counterHint:'守護兵を落とし、灰燼再燃で加速する猛攻に備えて先手を取る。',startEscorts:[{type:'ch21_tank',count:1,guard:true},{type:'ch21_fast',count:1}],guardDefMult:1.86,phases:[{ratio:.76,name:'焼鉄城壁',defMult:1.18,spawn:[{type:'ch21_tank',count:1,guard:true}]},{ratio:.48,name:'灰燼再燃',atkMult:1.23,spawn:[{type:'ch21_fast',count:2}]},{ratio:.19,name:'心火解放',atkMult:1.34,spdMult:1.14,accelerateBossAI:.57}]},
  ch22_boss:{id:'zero-king-crystalia',dangerTags:['slow','sustain','burst'],counterHint:'回復役を優先し、絶対零界に入る前に押し切る速度を保つ。',startEscorts:[{type:'ch22_tank',count:1,guard:true},{type:'ch22_fast',count:1}],guardDefMult:1.90,phases:[{ratio:.74,name:'鏡氷結界',defMult:1.21,spawn:[{type:'ch22_tank',count:1,guard:true}]},{ratio:.44,name:'零度共鳴',spdMult:1.16,spawn:[{type:'ch22_fast',count:1}]},{ratio:.17,name:'絶対零界',atkMult:1.30,defMult:1.08,accelerateBossAI:.55}]},
  ch23_boss:{id:'sky-burial-indrag',dangerTags:['haste','multi','burst'],counterHint:'加速役を放置しない。天雷過給後の連続行動に耐える立ち回りを。',startEscorts:[{type:'ch23_fast',count:2},{type:'ch23_tank',count:1,guard:true}],guardDefMult:1.88,phases:[{ratio:.72,name:'雷葬陣',spdMult:1.16,spawn:[{type:'ch23_fast',count:1}]},{ratio:.39,name:'天雷過給',atkMult:1.28,spdMult:1.20,accelerateBossAI:.66},{ratio:.14,name:'雷神墜とし',atkMult:1.38,spdMult:1.16,accelerateBossAI:.50}]},
  ch24_boss:{id:'void-flower-elsia',dangerTags:['poison','heal','attrition'],counterHint:'再生役を倒して長期戦を拒否。虚花開花後の増援に押し切られないように。',startEscorts:[{type:'ch24_tank',count:1,guard:true},{type:'ch24_midboss',count:1}],guardDefMult:1.92,phases:[{ratio:.78,name:'根脈結界',defMult:1.20,spawn:[{type:'ch24_tank',count:1,guard:true}]},{ratio:.47,name:'虚花開花',atkMult:1.20,spawn:[{type:'ch24_fast',count:1},{type:'ch24_midboss',count:1}]},{ratio:.18,name:'記憶喰いの満開',atkMult:1.32,spdMult:1.13,accelerateBossAI:.54}]},
  ch25_boss:{id:'boundary-king-archeon',dangerTags:['guard','resource','phase'],counterHint:'七鍵守護機を崩し、位相反転のたびに勢いを保って畳みかける。最終局面は短期決戦。',startEscorts:[{type:'ch25_tank',count:2,guard:true},{type:'ch25_fast',count:1}],guardDefMult:2.00,phases:[{ratio:.82,name:'七鍵封鎖',defMult:1.18,spawn:[{type:'ch25_tank',count:1,guard:true}]},{ratio:.58,name:'位相反転',atkMult:1.18,spdMult:1.12,spawn:[{type:'ch25_fast',count:1}]},{ratio:.34,name:'第八鍵・観測破棄',atkMult:1.26,defMult:1.10,accelerateBossAI:.64},{ratio:.12,name:'境界王座崩壊',atkMult:1.40,spdMult:1.20,accelerateBossAI:.46}]},
  raid_archeon:{id:'raid-boundary-king-archeon',dangerTags:['guard','resource','phase'],counterHint:'守護機を優先して排除し、位相反転直後の隙を逃さず攻めきる。終盤は長期戦を避ける。',startEscorts:[{type:'ch25_tank',count:2,guard:true},{type:'ch25_fast',count:1}],guardDefMult:2.12,phases:[{ratio:.84,name:'七鍵・再封鎖',defMult:1.16,spawn:[{type:'ch25_tank',count:1,guard:true}]},{ratio:.62,name:'零界位相反転',atkMult:1.16,spdMult:1.10,spawn:[{type:'ch25_fast',count:2}]},{ratio:.36,name:'境界観測崩壊',atkMult:1.26,defMult:1.08,accelerateBossAI:.60,spawn:[{type:'ch25_tank',count:1,guard:true}]},{ratio:.12,name:'断界王座・最終観測',atkMult:1.38,spdMult:1.20,accelerateBossAI:.44}]},

  // Phase 12.7 — horizontal signature bosses.
  phase12_tomb_king:{id:'nameless-king-regnas',dangerTags:['guard','counter','burst'],counterHint:'墓守近衛のGuardを外し、王印反転後の一瞬の隙を逃さない。',startEscorts:[{type:'phase12_tomb_guard',count:2,guard:true},{type:'phase12_tomb_magus',count:1}],guardDefMult:1.92,phases:[{ratio:.72,name:'王墓封陣',defMult:1.18,spawn:[{type:'phase12_tomb_guard',count:1,guard:true}]},{ratio:.41,name:'王印反転',atkMult:1.22},{ratio:.15,name:'名なき戴冠',atkMult:1.34,spdMult:1.12,accelerateBossAI:.52}]},
  phase12_phantom_lord:{id:'phantom-lord-alcyon',dangerTags:['speed','element','adds'],counterHint:'季節妖精を減らし、属性転換の直後に攻勢へ転じる。',startEscorts:[{type:'phase12_phantom_sprite',count:2},{type:'phase12_phantom_horn',count:1,guard:true}],guardDefMult:1.82,phases:[{ratio:.70,name:'四季転輪',spdMult:1.14,spawn:[{type:'phase12_phantom_sprite',count:1}]},{ratio:.38,name:'幻獣分身',atkMult:1.22,spawn:[{type:'phase12_phantom_horn',count:2}]},{ratio:.13,name:'白虹疾駆',atkMult:1.30,spdMult:1.24,accelerateBossAI:.50}]},
  phase12_bone_tyrant:{id:'dragonbone-emperor-valdrake',dangerTags:['phase','armor','burst'],counterHint:'髄晶騎士を崩し、骨格共振で加速する連撃に対応する。',startEscorts:[{type:'phase12_marrow_knight',count:2,guard:true}],guardDefMult:2.02,phases:[{ratio:.75,name:'竜骸装甲',defMult:1.22},{ratio:.46,name:'髄晶共振',atkMult:1.24,spawn:[{type:'phase12_bone_drake',count:2}]},{ratio:.16,name:'始祖骨格起動',atkMult:1.38,spdMult:1.10,accelerateBossAI:.48}]},
  phase12_archive_master:{id:'inverted-librarian-paradoxa',dangerTags:['magic','analysis','phase'],counterHint:'索引霊を処理し、因果逆読の展開を先読みして動く。',startEscorts:[{type:'phase12_index_wisp',count:2},{type:'phase12_reverse_scribe',count:1}],guardDefMult:1.84,phases:[{ratio:.73,name:'索引封鎖',defMult:1.14,spawn:[{type:'phase12_index_wisp',count:1}]},{ratio:.43,name:'因果逆読',atkMult:1.26,spdMult:1.14},{ratio:.14,name:'未刊結末',atkMult:1.34,spdMult:1.18,accelerateBossAI:.47}]},
  phase12_moon_deity:{id:'black-moon-noctil',dangerTags:['heal','observer','phase'],counterHint:'蝕眼を優先し、遮断解除のたびに短く生まれる隙へ全力を合わせる。',startEscorts:[{type:'phase12_moon_eye',count:2},{type:'phase12_moon_acolyte',count:1,guard:true}],guardDefMult:2.06,phases:[{ratio:.80,name:'黒月遮断膜',defMult:1.18,spawn:[{type:'phase12_moon_acolyte',count:1,guard:true}]},{ratio:.57,name:'蝕信号受信',atkMult:1.20,spdMult:1.12,spawn:[{type:'phase12_moon_eye',count:1}]},{ratio:.31,name:'月外同期',atkMult:1.29,accelerateBossAI:.58},{ratio:.10,name:'黒月完全蝕',atkMult:1.42,spdMult:1.20,accelerateBossAI:.42}]},

  /* Session 6 — 探索地点・隠し場所のBoss。
     sd_warden: 獣径最深部の相位の番人。位相がずれるたびに守りが薄く
     なり攻めが鋭くなる「反転装甲」型。長期戦は危険、短期決戦が有効。 */
  sd_warden:{id:'deeplord-phase-warden',dangerTags:['phase','armor','burst'],counterHint:'守りの相位では装甲が厚い。位相が反転するたび攻撃が鋭くなるが守りは薄くなる——反転直後の隙に畳みかける。',startEscorts:[{type:'ch5_normal',count:2}],guardDefMult:1.55,phases:[{ratio:.68,name:'相位反転・攻の位相',atkMult:1.24,defMult:.85,spawn:[{type:'ch5_fast',count:1}]},{ratio:.34,name:'相位反転・守の位相',defMult:1.30,atkMult:.92},{ratio:.14,name:'相位崩壊・乱',atkMult:1.36,spdMult:1.15,accelerateBossAI:.55}]},

  /* Session 6 — Arc VI 終端 Boss。単一化中枢ユニタスの段階演出を
     一般プロファイルから個別プロファイルへ。 */
  ch39_boss:{id:'unification-core-unitas',dangerTags:['guard','phase','burst'],counterHint:'統合衛兵を崩し、単一化が進むほど加速する演算に押し負けないよう短期で削りきる。',startEscorts:[{type:'ch39_tank',count:1,guard:true},{type:'ch39_fast',count:1}],guardDefMult:1.85,phases:[{ratio:.72,name:'統合環・展開',defMult:1.16,spawn:[{type:'ch39_tank',count:1,guard:true}]},{ratio:.40,name:'単一化収束',atkMult:1.26,spdMult:1.12,spawn:[{type:'ch39_fast',count:1}]},{ratio:.15,name:'二系統畳み込み',atkMult:1.36,spdMult:1.16,accelerateBossAI:.52}]},

  /* Session 6 — Arc VII 終端 Boss。分流圃の剪定者。芽（取り巻き）を
     摘みながら戦う「手入れ」を中断させると本領を発揮する。 */
  ch41_boss:{id:'pruner-severance',dangerTags:['adds','phase','burst'],counterHint:'芽体を放置すると圃が整う——取り巻きを間引きつつ、剪定モードの隙に本体へ刃を届かせる。',startEscorts:[{type:'ch41_tank',count:1,guard:true},{type:'ch41_fast',count:1}],guardDefMult:1.95,phases:[{ratio:.74,name:'剪定・間引き',defMult:1.15,spawn:[{type:'ch41_fast',count:1}]},{ratio:.46,name:'圃の管理権',atkMult:1.20,spawn:[{type:'ch41_tank',count:1,guard:true},{type:'ch41_normal',count:2}]},{ratio:.20,name:'切り落とす者',atkMult:1.34,spdMult:1.14,accelerateBossAI:.55}]},

  /* Session 6 — 再臨Denlord（巣の主の再戦）。boss:falseなので勧誘は
     そのまま、再臨個体だけが位相を持つ。1段階＝「主の本領」で
     取り巻きを呼び猛攻に転じる。撃破すると『再臨』特性の個体になる。 */
  bt_denlord:{id:'denlord-beast-returned',dangerTags:['phase','escalate'],counterHint:'再臨した主は途中で本領を発揮する。呼ばれる護り手を放置しない。',startEscorts:[{type:'ch4_normal',count:1}],guardDefMult:1.40,phases:[{ratio:.55,name:'主の本領・咆哮',atkMult:1.22,spdMult:1.10,spawn:[{type:'ch4_fast',count:1}]}]},
  tp_denlord:{id:'denlord-tide-returned',dangerTags:['phase','sustain'],counterHint:'潮の主は再生する。甲殻の護り手を先に崩して潮位を下げる。',startEscorts:[{type:'tp_bulwark',count:1,guard:true}],guardDefMult:1.50,phases:[{ratio:.55,name:'主の本領・満潮',atkMult:1.18,defMult:1.14,spawn:[{type:'tp_skimmer',count:1}]}]},
  af_denlord:{id:'denlord-ash-returned',dangerTags:['phase','burst'],counterHint:'灰の主は終盤ほど激しい。亡兵の群れを捌きながら短期で仕留める。',startEscorts:[{type:'af_revenant',count:1}],guardDefMult:1.45,phases:[{ratio:.55,name:'主の本領・灰燼の合唱',atkMult:1.26,spdMult:1.08,spawn:[{type:'af_moth',count:1}]}]},

  /* Session 7 — 超再臨Denlord。再臨個体を撃破した後の再来戦。
     「でかいだけ」ではなく、主の本領が二段階で読める構成。 */
  'bt_denlord__super':{id:'denlord-beast-super',dangerTags:['phase','escalate','burst'],counterHint:'超再臨の主は二度本領を見せる。咆哮のあとの猛攻に備えて守りを固め、群れの号令が出たら撃ち漏らさない。',startEscorts:[{type:'ch4_normal',count:2},{type:'ch4_fast',count:1}],guardDefMult:1.50,phases:[{ratio:.70,name:'主の覚醒・獣群号令',atkMult:1.16,spdMult:1.08,spawn:[{type:'ch4_fast',count:1},{type:'ch4_attacker',count:1}]},{ratio:.32,name:'主の本領・無尽の吼',atkMult:1.34,spdMult:1.18,accelerateBossAI:.62}]},
  'tp_denlord__super':{id:'denlord-tide-super',dangerTags:['phase','sustain','guard'],counterHint:'満潮の主は長期戦で潮位を上げる。護り手を間引き、干潮の隙に押し切る。',startEscorts:[{type:'tp_bulwark',count:2,guard:true}],guardDefMult:1.65,phases:[{ratio:.70,name:'満潮・甲殻の群れ',defMult:1.18,spawn:[{type:'tp_shambler',count:2}]},{ratio:.34,name:'主の本領・大海嘯',atkMult:1.28,spdMult:1.12,accelerateBossAI:.60}]},
  'af_denlord__super':{id:'denlord-ash-super',dangerTags:['phase','burst','adds'],counterHint:'灰の主の合唱は終盤に増幅する。亡兵を捌き続け、合唱前の間隙に全力を合わせる。',startEscorts:[{type:'af_revenant',count:2},{type:'af_moth',count:1}],guardDefMult:1.55,phases:[{ratio:.70,name:'灰燼の合唱・第一声',atkMult:1.18,spawn:[{type:'af_moth',count:2}]},{ratio:.30,name:'主の本領・灰燼完全燃焼',atkMult:1.38,spdMult:1.15,accelerateBossAI:.55}]},

  /* Session 7 — 第二波の秘密Boss。
     fh_overseer: 炉心回廊の古代管理機構。攻めの号令（UNLEASH）を
       検知して防御反応を張る「対号令カウンター」型。
     ur_sentinel: 未記録の座標を守る番人。記録への追記（フェーズ）が
       進むほど形が失われていく。最深の隠し狩場。 */
  fh_overseer:{id:'forge-warden-overseer',dangerTags:['guard','machine','counter'],counterHint:'監督機は命令を読み取る。号令「解放しろ」を張り続けると対応装甲を固める——号令を温存する時機を読む。',orderReaction:{unleash:{atkMult:1.10,defMult:1.30,message:'対応装甲・起動'}},startEscorts:[{type:'ch22_tank',count:1,guard:true},{type:'ch22_fast',count:1}],guardDefMult:1.70,phases:[{ratio:.66,name:'炉心防衛・監査開始',defMult:1.16,spawn:[{type:'ch22_fast',count:1}]},{ratio:.30,name:'管理権限・過負荷',atkMult:1.28,spdMult:1.12,accelerateBossAI:.62}]},
  ur_sentinel:{id:'unwritten-sentinel',dangerTags:['phase','erase','burst'],counterHint:'番人は記録を消していく。形が失われるほど刃が通りにくくなる前に、位相の変わり目を逃さず畳みかける。',startEscorts:[{type:'ch41_fast',count:1},{type:'ch41_tank',count:1,guard:true}],guardDefMult:1.90,phases:[{ratio:.72,name:'記録の遮断',defMult:1.22,spawn:[{type:'ch41_fast',count:2}]},{ratio:.44,name:'未記述化・形の喪失',atkMult:1.24,spdMult:1.14},{ratio:.18,name:'記録の番人・最後の頁',atkMult:1.40,spdMult:1.18,accelerateBossAI:.50}]},
  /* Session 7 — Arc VIII (ch42–45)。未踏座標のボスたち。
     各章の enemy type（ch42_boss …）に合わせた位相表。 */
  ch42_boss:{id:'binder-unrecorded',dangerTags:['guard','phase','erase'],counterHint:'綴じ手は頁を綴じ込む。帳外装甲殻を崩し、綴じ込みの隙に本体を削る。',startEscorts:[{type:'ch42_tank',count:1,guard:true},{type:'ch42_fast',count:1}],guardDefMult:1.88,phases:[{ratio:.70,name:'頁綴じ・帳簿外拘束',defMult:1.18,spawn:[{type:'ch42_tank',count:1,guard:true}]},{ratio:.40,name:'座標綴じ込み',atkMult:1.24,spawn:[{type:'ch42_fast',count:2}]},{ratio:.15,name:'未記録の綴じ手',atkMult:1.36,spdMult:1.14,accelerateBossAI:.54}]},
  ch43_boss:{id:'librarian-mutos',dangerTags:['sustain','magic','phase'],counterHint:'守架は読まれることを拒む。頁影の増援を捌き、閉架のあとの短い隙を逃さない。',startEscorts:[{type:'ch43_normal',count:2},{type:'ch43_tank',count:1,guard:true}],guardDefMult:1.86,phases:[{ratio:.72,name:'閉架・黙録封鎖',defMult:1.20,spawn:[{type:'ch43_normal',count:1}]},{ratio:.42,name:'棚崩し・黙読拒絶',atkMult:1.22,spawn:[{type:'ch43_fast',count:2}]},{ratio:.16,name:'全棚解放',atkMult:1.34,magMult:1.0,spdMult:1.16,accelerateBossAI:.52}]},
  ch44_boss:{id:'wildmark-feral',dangerTags:['haste','multi','burst'],counterHint:'獣王は群れを率いて加速する。疾駆獣を間引き、咆哮後の連撃を凌ぐ立て直しを。',startEscorts:[{type:'ch44_fast',count:2},{type:'ch44_tank',count:1,guard:true}],guardDefMult:1.80,phases:[{ratio:.74,name:'群れの号令',spdMult:1.14,spawn:[{type:'ch44_fast',count:1}]},{ratio:.45,name:'荒野の咆哮',atkMult:1.26,spdMult:1.14,spawn:[{type:'ch44_normal',count:2}]},{ratio:.18,name:'囲い外の獣王',atkMult:1.38,spdMult:1.20,accelerateBossAI:.50}]},
  ch45_boss:{id:'terminus-warden',dangerTags:['guard','phase','burst'],counterHint:'守り手は接続の形跡を守る。終端装甲を崩し、接続試行が始まったら全力で削りきる。',startEscorts:[{type:'ch45_tank',count:2,guard:true},{type:'ch45_fast',count:1}],guardDefMult:2.00,phases:[{ratio:.75,name:'終端封鎖・第一層',defMult:1.18,spawn:[{type:'ch45_tank',count:1,guard:true}]},{ratio:.50,name:'接続試行・波形受信',atkMult:1.22,spdMult:1.10,spawn:[{type:'ch45_fast',count:2}]},{ratio:.26,name:'端部同期・仮接続',atkMult:1.30,defMult:1.08,accelerateBossAI:.60},{ratio:.10,name:'接続端・最終守護',atkMult:1.42,spdMult:1.18,accelerateBossAI:.44}]},

  /* Session 8 — Arc IX (ch46–48)。応答層のボスたち。 */
  ch46_boss:{id:'answer-keeper',dangerTags:['phase','counter','burst'],counterHint:'司り手はこちらの動きをそのまま返してくる。返礼装甲を崩し、応答の合間の一拍を突いて削る。',startEscorts:[{type:'ch46_tank',count:1,guard:true},{type:'ch46_fast',count:1}],guardDefMult:1.90,phases:[{ratio:.72,name:'応答開始・返礼の構え',defMult:1.18,spawn:[{type:'ch46_tank',count:1,guard:true}]},{ratio:.44,name:'追響・二度目の応答',atkMult:1.24,spawn:[{type:'ch46_fast',count:2}]},{ratio:.16,name:'畦道の全応答',atkMult:1.36,spdMult:1.16,accelerateBossAI:.50}]},
  ch47_boss:{id:'gather-voice',dangerTags:['sustain','multi','phase'],counterHint:'集音の司り手は束ねた噂を盾にする。噂殻の増援を間引き、束が解けた瞬間に本体を狙う。',startEscorts:[{type:'ch47_normal',count:2},{type:'ch47_tank',count:1,guard:true}],guardDefMult:1.88,phases:[{ratio:.70,name:'集音・噂の束',defMult:1.18,spawn:[{type:'ch47_normal',count:1}]},{ratio:.40,name:'解束・伝聞放出',atkMult:1.22,spdMult:1.12,spawn:[{type:'ch47_fast',count:2}]},{ratio:.14,name:'谷の大集音',atkMult:1.34,spdMult:1.18,accelerateBossAI:.48}]},
  ch48_boss:{id:'listener-spring',dangerTags:['guard','phase','attrition'],counterHint:'聴き手は全ての声を聞いている。湧き水の守りを崩し、泉が応答を返す前に仕留める。',startEscorts:[{type:'ch48_tank',count:2,guard:true},{type:'ch48_fast',count:1}],guardDefMult:1.95,phases:[{ratio:.74,name:'聴取開始・静寂の壁',defMult:1.20,spawn:[{type:'ch48_tank',count:1,guard:true}]},{ratio:.48,name:'湧声・水源の応答',atkMult:1.24,spdMult:1.12,spawn:[{type:'ch48_fast',count:2}]},{ratio:.24,name:'全聴・囁きの奔流',atkMult:1.32,defMult:1.08,accelerateBossAI:.56},{ratio:.10,name:'水源・最後の聴き手',atkMult:1.44,spdMult:1.18,accelerateBossAI:.42}]},
});

export function bossEncounterProfile(type){
  if(SPECIAL[type])return SPECIAL[type];
  return genericProfile(chapterFromType(type));
}
export function bossEncounterHasProfile(type){ return !!bossEncounterProfile(type); }
