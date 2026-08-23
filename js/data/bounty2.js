import { BOUNTIES } from './bounties.js';

const VARIANT_SCALE={hp:1.55,atk:1.25,def:1.15,spd:1.10};
const EX_SCALE={hp:2.15,atk:1.55,def:1.30,spd:1.20};

function buildTierStage(base,tier){
  const isEx=tier==='EX';
  const suffix=isEx?'【EX】':'【変異】';
  const id=`${base.id}-${isEx?'ex':'variant'}`;
  const requires=isEx?`${base.id}-variant`:base.id;
  const scale=isEx?EX_SCALE:VARIANT_SCALE;
  return {
    id,
    name:`${suffix}${base.name}`,
    recLevel:Math.round(base.recLevel*(isEx?1.65:1.25)),
    bounty:true,
    bounty2:true,
    bountyBaseId:base.id,
    bountyRank:isEx?'EX':base.rank,
    bounty2Tier:isEx?'ex':'variant',
    bounty2Scale:scale,
    branch:true,
    requires,
    rumor:isEx?'討伐記録を超える異常個体が確認された。既知の攻略法だけでは通用しない。':'再出現した個体に通常とは異なる兆候が見られる。',
    bountyGimmick:isEx?'基礎能力と固有ギミックが大幅強化される。':'基礎能力と固有ギミックが強化される。',
    bountyRewardHint:isEx?'大量の賞金首の証を獲得できる。':'賞金首の証を多く獲得できる。',
    rewards:{gold:Math.round(base.rewards.gold*(isEx?2.5:1.5)),exp:Math.round(base.rewards.exp*(isEx?2.5:1.5))},
    waves:[{type:base.enemyType,count:1,interval:0}],
    dropTable:[],
  };
}

export const BOUNTY2_STAGES=BOUNTIES.flatMap(b=>[buildTierStage(b,'variant'),buildTierStage(b,'EX')]);
export function bounty2StageById(id){return BOUNTY2_STAGES.find(s=>s.id===id)||null;}
export function bountyBaseIdForStage(stage){return stage?.bountyBaseId||stage?.id||null;}
