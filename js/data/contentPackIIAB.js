/* Content Pack II A+B — rumor-led hidden ecology and textual routes. */

export const CP2_RUMORS=Object.freeze([
  {id:'backward-guard',siteId:'old_king_tomb',stageId:'secret-old-king-tomb',name:'後ろ向きに巡回する近衛',text:'王墓の奥で、足跡だけが出口から玄室へ向かって増えているという。',tracking:'墓誌の欠番と同じ場所で、鎧の擦れる音が一度だけ逆向きに響く。'},
  {id:'empty-throne-shadow',siteId:'old_king_tomb',stageId:'secret-old-king-tomb',name:'空位の玉座に残る影',text:'誰も座っていない玉座の前だけ、灯りが二つ分の影を落とすらしい。',tracking:'王名を持たない記録ほど、二つ目の影について同じ行を欠いている。'},
  {id:'silver-deer',siteId:'phantom_beast_forest',stageId:'secret-phantom-beast-forest',name:'季節を外れた銀鹿',text:'雪の匂いがしない日に限って、白ではなく銀色の角が霧を横切るという。',tracking:'異なる季節の足跡が重なる地点で、蹄跡だけが一つ増えている。'},
  {id:'silent-nest',siteId:'phantom_beast_forest',stageId:'secret-phantom-beast-forest',name:'鳴かない巣',text:'幻獣の森には、周囲の獣が一切鳴かなくなる巣があるらしい。',tracking:'その周囲では幼獣の痕跡より先に、観測用らしい円形の傷が見つかる。'},
  {id:'nameless-bone-pulse',siteId:'dragonbone_canyon',stageId:'secret-dragonbone-canyon',name:'名のない竜骨の脈動',text:'死んだ竜骸の一部だけが、雷鳴と無関係に周期的な光を返すという。',tracking:'第零座標に近い骨ほど、導線の明滅が外部信号と似た間隔になる。'},
  {id:'eighth-rib',siteId:'dragonbone_canyon',stageId:'secret-dragonbone-canyon',name:'八本目の肋骨',text:'七方向へ分かれるはずの竜骸に、地図にない八本目の骨道を見た者がいる。',tracking:'星図片を重ねると、既知の七方向から僅かに外れた線だけが消えない。'},
  {id:'margin-walker',siteId:'inverted_library',stageId:'secret-inverted-library',name:'頁の外を歩く記録体',text:'書かれていない余白だけを移動する人影が、閲覧者より先に頁をめくるという。',tracking:'未刊記録の余白に、現在の閲覧位置と一致する小さな印が現れる。'},
  {id:'book-without-past',siteId:'inverted_library',stageId:'secret-inverted-library',name:'過去を持たない本',text:'最終頁だけ存在し、冒頭へ向かうほど紙そのものが薄くなる本があるらしい。',tracking:'欠番目録では、その本だけ貸出日より返却日の方が古い。'},
  {id:'still-eye',siteId:'black_moon_temple',stageId:'secret-black-moon-temple',name:'瞬きをしない観測眼',text:'黒月神殿の最奥で、こちらを追わず一点だけを見続ける眼が目撃されている。',tracking:'眼が見ている先には壁しかないが、無月観測紙ではその先へ線が続いている。'},
  {id:'second-signal',siteId:'black_moon_temple',stageId:'secret-black-moon-temple',name:'二つ目の周期信号',text:'既知の外部信号とは半拍だけずれた、弱い応答が混じる夜があるという。',tracking:'二つの信号は会話ではなく、同じ何かを別方向から測っているように見える。'},
]);

export const CP2_HIDDEN_ENCOUNTERS=Object.freeze({
  'secret-old-king-tomb':{rumorId:'backward-guard',enemyId:'cp2_reverse_guard',sourceEnemyId:'phase12_tomb_rare',name:'逆歩近衛・RETROGRADE',chance:.026,routeId:'route-empty-procession'},
  'secret-phantom-beast-forest':{rumorId:'silver-deer',enemyId:'cp2_silver_deer',sourceEnemyId:'phase12_phantom_rare',name:'季外銀鹿・ARGENT',chance:.022,routeId:'route-silent-nest'},
  'secret-dragonbone-canyon':{rumorId:'nameless-bone-pulse',enemyId:'cp2_pulse_bone',sourceEnemyId:'phase12_bone_rare',name:'無銘脈骨・PULSE',chance:.018,routeId:'route-eighth-rib'},
  'secret-inverted-library':{rumorId:'margin-walker',enemyId:'cp2_margin_record',sourceEnemyId:'phase12_library_rare',name:'頁外記録体・MARGIN',chance:.014,routeId:'route-backward-shelf'},
  'secret-black-moon-temple':{rumorId:'still-eye',enemyId:'cp2_still_eye',sourceEnemyId:'phase12_moon_rare',name:'静止観測眼・STILL',chance:.010,routeId:'route-blind-wall'},
});

export const CP2_HIDDEN_ROUTES=Object.freeze({
  'route-empty-procession':{name:'空列の回廊',siteId:'old_king_tomb',clue:'近衛が逆向きに辿った歩哨路。壁の継ぎ目に、行列一つ分だけ使われていない通路がある。',rewardHint:'王墓系Lore / 反撃ビルド手掛かり'},
  'route-silent-nest':{name:'無音の産室',siteId:'phantom_beast_forest',clue:'銀鹿が消えた地点では霧まで音を失う。獣道ではなく、巣を囲む円を追うべきらしい。',rewardHint:'Rare Companion / 配合手掛かり'},
  'route-eighth-rib':{name:'第八肋骨路',siteId:'dragonbone_canyon',clue:'七方向の導線から外れた骨道。第零座標と重ねると、骨の内側へ折り返している。',rewardHint:'竜骸系Unique / 観測座標Lore'},
  'route-backward-shelf':{name:'逆棚回廊',siteId:'inverted_library',clue:'頁外記録体が消える棚だけ、背表紙を右から左へ読むと一つの文章になる。',rewardHint:'Analysis装備 / 追加Codex記録'},
  'route-blind-wall':{name:'盲壁観測孔',siteId:'black_moon_temple',clue:'観測眼が見続ける壁には何もない。ただし外部信号の間だけ、壁の厚みが記録上ゼロになる。',rewardHint:'世界外Lore / 次Secret Chainの種'},
});

export function cp2RumorState({rumor,discoveries={},isStageCleared=()=>false}={}){
  if(!rumor)return'unresolved';
  if(discoveries[`cp2:encounter:${rumor.id}`])return'resolved';
  if(discoveries[`trace:${rumor.siteId}`]||isStageCleared(rumor.stageId))return'tracking';
  return'unresolved';
}

export function cp2EncounterChance({baseChance=0,rumorState='unresolved',mastered=false,codexKnown=false}={}){
  if(rumorState==='unresolved')return 0;
  let mult=1;
  if(rumorState==='tracking')mult*=1.25;
  if(mastered)mult*=1.05;
  if(codexKnown)mult*=1.08;
  return Math.min(.05,baseChance*mult);
}
