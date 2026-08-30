/* Content Pack IV F — reward / identity handoff. */

export const CP4_IDENTITY_REWARD=Object.freeze({
  prerequisiteDiscoveryId:'cp4:branch-anchor:tree-sovereign',
  rewardDiscoveryId:'cp4:reward:parallax-echo-emblem',
  item:Object.freeze({
    id:'uq_cp4_parallax_echo_emblem',
    bountyId:null,
    name:'視差残響章',
    slot:'accessory',
    rarity:'mythic',
    stats:Object.freeze({atk:150,mag:150,def:90,spd:72}),
    unique:true,
    contentPackIV:true,
    cp4IdentityReward:true,
    primeSideArtifact:true,
    branchTechnology:false,
    branchSightRequiredForEffect:false,
    effects:Object.freeze([
      Object.freeze({trigger:'passive',kind:'actionDiversityBuff',power:.24,turns:3}),
    ]),
    lore:'視差核との同期後、Prime側に残った観測残響を封じた記念章。王樹領から持ち帰った技術ではなく、同じ場所に複数の整合した履歴があったという観測事実だけを刻んでいる。',
  }),
  record:Object.freeze({
    name:'報酬：視差残響章',
    hint:'王樹領を観測した証として、Prime側に残った視差核の残響が既存Unique装備へ固定された。装備は任意で、分岐視・Branch表示・今後の進行条件には使われない。',
  }),
});

export function cp4IdentityRewardProgress({discoveries={}}={}){
  const def=CP4_IDENTITY_REWARD;
  const eligible=Boolean(discoveries[def.prerequisiteDiscoveryId]);
  const granted=Boolean(discoveries[def.rewardDiscoveryId]);
  return Object.freeze({eligible,granted,itemId:def.item.id,rewardDiscoveryId:def.rewardDiscoveryId});
}
