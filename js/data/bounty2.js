import { BOUNTIES } from './bounties.js';
import { abyssRecommendedLevel, abyssTargetItemPower, abyssEraForDepth, abyssStageExpBudget } from './abyssEndgame.js';
import { endgameRewardProfile, endgameBossRewardMult } from './endgameRewardScaling.js';

const VARIANT_SCALE={hp:1.55,atk:1.25,def:1.15,spd:1.10};
const EX_SCALE={hp:2.15,atk:1.55,def:1.30,spd:1.20};

// Progression 3.0: EX bounties are landmark hunts in different Abyss eras.
const EX_ABYSS_DEPTH=Object.freeze({
  'bounty-redfang-varg':1,
  'bounty-ash-knight':100,
  'bounty-fallen-oracle':500,
  'bounty-crownless':1000,
  'bounty-omega-zero':2000,
});

function buildTierStage(base,tier){
  const isEx=tier==='EX';
  const suffix=isEx?'【EX】':'【変異】';
  const id=`${base.id}-${isEx?'ex':'variant'}`;
  const requires=isEx?`${base.id}-variant`:base.id;
  const scale=isEx?EX_SCALE:VARIANT_SCALE;
  const abyssDepth=isEx?(EX_ABYSS_DEPTH[base.id]||1):null;
  const recLevel=isEx?abyssRecommendedLevel(abyssDepth):Math.round(base.recLevel*1.25);
  const itemPowerTarget=isEx?abyssTargetItemPower(abyssDepth):null;
  const era=isEx?abyssEraForDepth(abyssDepth):null;
  const rewardProfile=isEx?endgameRewardProfile(recLevel):null;
  const bossReward=isEx?endgameBossRewardMult({boss:true}):1;
  const rewards=isEx?{
    gold:Math.max(Math.round(base.rewards.gold*2.5),Math.round(1500*rewardProfile.gold*bossReward)),
    exp:Math.max(Math.round(base.rewards.exp*2.5),Math.round(abyssStageExpBudget(abyssDepth)*1.35)),
  }:{gold:Math.round(base.rewards.gold*1.5),exp:Math.round(base.rewards.exp*1.5)};
  const dropMult=isEx?Number((rewardProfile.drop*bossReward).toFixed(3)):1.25;
  return {
    id,
    name:`${suffix}${base.name}`,
    recLevel,
    itemPowerTarget,
    bounty:true,
    bounty2:true,
    bountyBaseId:base.id,
    bountyRank:isEx?'EX':base.rank,
    bounty2Tier:isEx?'ex':'variant',
    bounty2Scale:scale,
    bountyAbyssDepth:abyssDepth,
    bountyEra:era,
    branch:true,
    requires,
    rumor:isEx?`深淵${abyssDepth}F級の異常個体が確認された。${era}に到達する冒険者を狩る「宿敵」として再出現する。`:'再出現した個体に通常とは異なる兆候が見られる。',
    bountyGimmick:isEx?'深淵Era相当の基礎能力と固有ギミックを持つ。敗北するたびNemesisが学習し、次戦でさらに強化される。':'基礎能力と固有ギミックが強化される。',
    bountyRewardHint:isEx?`大量の賞金首の証。目標IP ${itemPowerTarget}級の育成帯向け。`:'賞金首の証を多く獲得できる。',
    rewards,
    dropMult,
    endgameRewardProfile:rewardProfile,
    waves:[{type:base.enemyType,count:1,interval:0}],
    dropTable:[],
  };
}

export const BOUNTY2_STAGES=BOUNTIES.flatMap(b=>[buildTierStage(b,'variant'),buildTierStage(b,'EX')]);
export function bounty2StageById(id){return BOUNTY2_STAGES.find(s=>s.id===id)||null;}
export function bountyBaseIdForStage(stage){return stage?.bountyBaseId||stage?.id||null;}
