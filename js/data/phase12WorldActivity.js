/* Phase 12.8-12.10 — optional lore, rumors and World Event bridges.
   Uses the existing world2.discoveries ledger: no new menu or currency. */

export const PHASE12_LORE_FRAGMENTS=Object.freeze({
  old_king_tomb:[
    '墓誌I：王の名だけが全記録から同じ深さで削られている。',
    '墓誌II：近衛は国境ではなく「観測区画」の封鎖を命じられていた。',
    '墓誌III：最後の命令は「王を守れ」ではなく「中央座標を守れ」だった。',
  ],
  phantom_beast_forest:[
    '獣痕I：同じ骨格の獣が異なる季節の毛皮を同時に持つ。',
    '獣痕II：森の年輪には重なり合う複数の気候周期が刻まれている。',
    '獣痕III：幻獣は変異種ではなく、別層の同型生物が重なった可能性が高い。',
  ],
  dragonbone_canyon:[
    '竜骸I：巨大骨の内部には血管ではなく規則的な導線がある。',
    '竜骸II：導線は七つの方向へ分岐し、既知の境界設備と同じ配置を持つ。',
    '竜骸III：始祖竜は生物であると同時に、座標を固定する構造体だったらしい。',
  ],
  inverted_library:[
    '欠番I：戦闘記録の作成日時が、その戦闘より前になっている。',
    '欠番II：同じ人物について互いに矛盾する勝敗記録が複数存在する。',
    '欠番III：記録は観測結果ではなく、観測候補を事前配布したものと推測される。',
  ],
  black_moon_temple:[
    '黒月I：祭具は祈祷具ではなく、一定周期の外部信号を減衰させる装置だった。',
    '黒月II：信号には自然現象では説明しづらい反復と間隔がある。',
    '黒月III：送信元の正体は不明。神殿はただ「外側」とだけ記している。',
  ],
});

export const PHASE12_RUMORS=Object.freeze([
  {id:'nameless-king',flags:['oldPatrolMark','shrineMap','shrineNameSought'],targetSiteId:'old_king_tomb',name:'名を持たない王',hint:'古い巡回兵が「王名のない墓門」を見たという。深層の墓誌を探せ。'},
  {id:'mist-beast',flags:['beastTrail','beastCompanionBond','beastObserved'],targetSiteId:'phantom_beast_forest',name:'霧の向こうの白い角',hint:'獣道の先で、季節ごと姿が変わる白い角獣が目撃されている。'},
  {id:'giant-bone',flags:['meteorBearing','beastLegendKill'],targetSiteId:'dragonbone_canyon',name:'山より大きな骨',hint:'流星の方角に、谷を跨ぐ巨大な骨が露出したという噂がある。'},
  {id:'falling-books',flags:['borderRumor','merchantLedger','merchantOriginKnown'],targetSiteId:'inverted_library',name:'天井へ落ちる本',hint:'境界商人の帳簿に「本が上へ落ちる書庫」という仕入れ先が記されている。'},
  {id:'black-moon',flags:['riftAttunement','modernSignal','modernTrace'],targetSiteId:'black_moon_temple',name:'月のない夜の月影',hint:'境界の異常が強い夜、月がないのに黒い月影だけが現れるという。'},
]);

export function phase12RumorFromFlag(flag){
  if(!flag)return null;
  return PHASE12_RUMORS.find(r=>r.flags.includes(flag))||null;
}

export function phase12LoreForSite(siteId){return PHASE12_LORE_FRAGMENTS[siteId]||[];}

export function phase12DiscoveryForStage(stage){
  if(!stage?.phase12Horizontal||!stage.secretRealmId)return null;
  const fragments=phase12LoreForSite(stage.secretRealmId);
  return {id:`trace:${stage.secretRealmId}`,name:`世界の痕跡：${stage.name?.replace(/^異界・/,'')||stage.secretRealmId}`,hint:stage.phase12WorldTrace||fragments.at(-1)||'',fragments};
}
