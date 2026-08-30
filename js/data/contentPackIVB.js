/* Content Pack IV B — deterministic Parallax Core first-contact investigation. */

export const CP4_PARALLAX_CONTACT=Object.freeze({
  id:'deep-green-parallax-contact',
  prerequisiteDiscoveryId:'cp4:deepgreen:overlap-coordinate',
  investigationStageId:'2-5',
  discoveryId:'cp4:parallax:first-contact',
  name:'視差核との初接触',
  label:'重複座標の再調査',
  intro:'三つの履歴が一点で重なる座標へ戻る。壊れた記録ではなく、観測そのものの食い違いを確かめる。',
  core:Object.freeze({
    name:'視差核',
    description:'根でも鉱物でも機械でもない小さな核が、三つの履歴の座標誤差を同時にゼロへ揃えている。触れた瞬間、知覚だけがずれる。',
  }),
  perceptions:Object.freeze([
    '音が一瞬だけ二重に鳴り、既知の深緑の森がそのまま残る。',
    '同じ地形へ生きた根の回廊が重なり、樹冠へ続く道と人影が見える。',
    'さらに同じ道が森のない白い境界傷として瞬き、そこにいた人影は存在すると同時に存在しない。',
  ]),
  collapse:'重なりは数呼吸でPrimeの深緑の森へ収束する。移動は起きていない。ただ、同じ座標に別の整合した景色が重なっていた。',
  next:'NEXT — 視差核との同期を再現し、変化した知覚を安定させる。',
});

export function cp4ParallaxProgress({discoveries={}}={}){
  const event=CP4_PARALLAX_CONTACT;
  if(!discoveries[event.prerequisiteDiscoveryId])return Object.freeze({state:'locked',ready:false,complete:false,nextStageId:null});
  if(discoveries[event.discoveryId])return Object.freeze({state:'contacted',ready:false,complete:true,nextStageId:null});
  return Object.freeze({state:'investigate',ready:true,complete:false,nextStageId:event.investigationStageId});
}

export function cp4ParallaxContactForStage(stageId,{discoveries={}}={}){
  const progress=cp4ParallaxProgress({discoveries});
  if(!progress.ready||stageId!==progress.nextStageId)return null;
  return CP4_PARALLAX_CONTACT;
}
