/* Content Pack II E — final world-mystery / ecology integration data. */

export const CP2_STAGE_LABELS=Object.freeze({
  'secret-old-king-tomb':'古王墓',
  'secret-phantom-beast-forest':'幻獣の森',
  'secret-dragonbone-canyon':'竜骸峡谷',
  'secret-inverted-library':'反転図書館',
  'secret-black-moon-temple':'黒月神殿',
  'secret-zero-station':'零番境界駅',
});

export const CP2_CODEX_ECOLOGY=Object.freeze({
  cp2_reverse_guard:{habitat:'古王墓・空列の回廊周辺',ecology:'巡回方向を反転させ、使われていない警備路を隠していた近衛個体。王墓の封鎖記録と無鳴獣の移送記録に接点がある。'},
  cp2_silver_deer:{habitat:'幻獣の森・無音の産室周辺',ecology:'季節の異なる足跡を同時に残す銀角個体。無音の産室へ至る円環状の移動を繰り返す。'},
  cp2_pulse_bone:{habitat:'竜骸峡谷・第八肋骨路',ecology:'死骸ではなく導線のように周期発光する骨片。第八肋骨路と零番境界駅の規格一致を示す証拠になった。'},
  cp2_margin_record:{habitat:'反転図書館・逆棚回廊',ecology:'頁の本文ではなく余白を移動する記録体。観測票の内外二系列と第零線への保守記録を保持していた。'},
  cp2_still_eye:{habitat:'黒月神殿・盲壁観測孔',ecology:'こちらを追わず盲壁の一点だけを測り続ける観測個体。二つの観測方向が同一対象へ向くことを示した。'},
  cp2_boss_nest_mother:{habitat:'幻獣の森・無音の産室最深部',ecology:'複数層で同じ系譜を育てる無鳴獣群の母体。個体よりも「系譜」そのものが観測単位になっている。'},
  cp2_boss_cinder_hart:{habitat:'古王墓・空列の回廊',ecology:'王墓へ移送された無鳴獣系譜の残響個体。灰と記憶の影響で別系統へ分岐したと考えられる。'},
  cp2_boss_octave_warden:{habitat:'竜骸峡谷・第八肋骨路最深部',ecology:'第八肋骨を生体器官ではなく保守導線として守る個体。零番境界駅との接続仮説を強く支持する。'},
  cp2_boss_palimsest:{habitat:'反転図書館・逆棚回廊',ecology:'上書きされた記録を何層も保持する司書個体。消去された第零線保守記録を別の余白へ退避していた。'},
  cp2_boss_parallax:{habitat:'黒月神殿・盲壁観測孔最深部',ecology:'内側と外側、二方向から同一の未定義対象を測る観測体。対象の正体と位置は依然として確定していない。'},
});

export const CP2_CHAIN_LORE=Object.freeze({
  silent_beast:{id:'cp2:lore:silent-lineage',name:'断片：重層生育記録',text:'無鳴獣は一つの場所で繁殖しているのではない。同じ系譜が複数層へ投影され、それぞれが別個体として成長している可能性がある。The Veilは壁だけでなく、生態情報を分配する網でもあるのかもしれない。'},
  eighth_rib:{id:'cp2:lore:eighth-maintenance',name:'断片：第零線保守規格',text:'第八肋骨路の導線幅と零番境界駅の線路規格は一致した。竜骸の一部は生物構造を模した境界インフラであり、第八の経路は既知七系統の外側にある保守線だった可能性が高い。'},
  blind_wall:{id:'cp2:lore:double-observation',name:'断片：二重観測票',text:'二系列の観測票は互いを観測していない。内側と外側から、まだ座標を与えられない同じ対象を測定している。外部信号との関係は強まったが、対象がどこにあるかは依然として不明。'},
});

export const CP2_ROUTE_OUTCOMES=Object.freeze({
  'route-empty-procession':'声なき獣の系譜へ接続。王墓の無鳴獣移送記録と灰角個体へ繋がった。',
  'route-silent-nest':'声なき獣の系譜へ接続。無鳴銀仔と特殊配合系統へ繋がった。',
  'route-eighth-rib':'第八肋骨の行先へ接続。零番境界駅との保守導線仮説へ繋がった。',
  'route-backward-shelf':'第八肋骨 / 盲壁の二連鎖へ接続。消去記録と二重観測票を復元した。',
  'route-blind-wall':'声なき獣 / 盲壁の二連鎖へ接続。外側・内側の二方向観測へ繋がった。',
});

export function cp2SuggestedDestination(rumorId,{discoveries={},isStageCleared=()=>false}={}){
  const routeByRumor={
    'backward-guard':'secret-old-king-tomb','empty-throne-shadow':'secret-old-king-tomb',
    'silver-deer':'secret-phantom-beast-forest','silent-nest':'secret-phantom-beast-forest',
    'nameless-bone-pulse':'secret-dragonbone-canyon','eighth-rib':'secret-dragonbone-canyon',
    'margin-walker':'secret-inverted-library','book-without-past':'secret-inverted-library',
    'still-eye':'secret-black-moon-temple','second-signal':'secret-black-moon-temple',
  };
  const stageId=routeByRumor[rumorId];
  if(!stageId)return null;
  const encounterSeen=!!discoveries[`cp2:encounter:${rumorId}`];
  return {stageId,label:CP2_STAGE_LABELS[stageId]||stageId,reason:encounterSeen?'隠し経路と秘密連鎖の記録を確認':'噂の生態を追跡'};
}
