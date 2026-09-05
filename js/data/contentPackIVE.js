/* Content Pack IV E — horizontal reactions after the first observed Branch anchor. */

export const CP4_HORIZONTAL_REACTIONS=Object.freeze({
  prerequisiteDiscoveryId:'cp4:branch-anchor:tree-sovereign',
  parallaxDiscoveryId:'cp4:parallax:first-contact',
  branchSightDiscoveryId:'cp4:branch-sight:active',
  rumorId:'rumor:cp4:deep-green-record-conflict',
  rumor:Object.freeze({
    hint:'矛盾していた深緑の記録は誤記ではなかった。分岐視によって、王樹領という別の固定された履歴として同じ座標に存在すると確認された。',
    nextAction:'視差核と王樹領の観測結果を、既存の記録・研究体系で照合する。',
  }),
  codex:Object.freeze({
    id:'cp4-tree-sovereign-history',
    title:'深緑の森 — 歴史的不整合',
    text:'Primeの生態記録と、大樹霊が生存して樹冠集落が発達した王樹領の記録は互いに上書きされない。分岐視では、同じ座標に属する別々の整合した履歴として識別される。',
  }),
  secondaryCodex:Object.freeze({
    id:'cp4-deep-green-absence-history',
    sourceDiscoveryId:'cp4:branch-anchor:deep-green-absence',
    title:'深緑の森 — 観測分岐：深緑消失域',
    text:'分岐点：正史の旅より前の境界崩壊で、大樹霊との戦いより先に森林圏そのものが消失した。生態：森の種族は消滅し、根の記憶だけが地形に残る。集落は観測杭と測線で空白域を航行する。技術：Mechanical → / Arcane ↓ / Bio ↓↓ / Boundary ↑↑↑ / Information ↑↑ / Material ↑。',
  }),
  chronicle:Object.freeze([
    Object.freeze({id:'cp4-parallax-contact',sourceDiscoveryId:'cp4:parallax:first-contact',title:'視差核との接触',text:'深緑の重複座標で視差核に触れ、同じ場所へ複数の整合した景色が重なる瞬間を観測した。'}),
    Object.freeze({id:'cp4-tree-sovereign-observed',sourceDiscoveryId:'cp4:branch-anchor:tree-sovereign',title:'観測分岐：王樹領',text:'大樹霊が生存した記録は誤りではなく、Primeと同じ座標に固定された別の履歴だと確認した。'}),
    Object.freeze({id:'cp4-deep-green-absence-observed',sourceDiscoveryId:'cp4:branch-anchor:deep-green-absence',title:'観測分岐：深緑消失域',text:'境界崩壊で森林圏が消え、根の記憶と空白域だけが残った履歴を、Primeや王樹領とは別の固定された歴史として確認した。'}),
  ]),
  research:Object.freeze({
    id:'cp4-tree-sovereign-ecology-comparison',
    icon:'🌿',
    title:'Prime生態と樹冠史の比較',
    source:'分岐視',
    text:'既知の深緑生態と、大樹霊が生存し樹冠集落・生体建築が発達した王樹領の観測記録を比較する。同じ種の未観測能力や未発見地域を推測で補完せず、確認済みの履歴差だけを研究対象とする。',
  }),
});

export function cp4HorizontalReactionState({discoveries={}}={}){
  const def=CP4_HORIZONTAL_REACTIONS;
  const active=Boolean(discoveries[def.prerequisiteDiscoveryId]);
  return Object.freeze({active,prerequisiteDiscoveryId:def.prerequisiteDiscoveryId});
}
