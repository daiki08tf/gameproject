import { BOUNTIES } from './bounties.js';
import { abyssRecommendedLevel, abyssTargetItemPower, abyssEraForDepth } from './abyssEndgame.js';

const VARIANT_SCALE={hp:1.55,atk:1.25,def:1.15,spd:1.10};
const EX_SCALE={hp:2.15,atk:1.55,def:1.30,spd:1.20};

// Progression 3.0: EX bounties are no longer tiny chapter-level rematches.
// Each base bounty becomes a landmark hunt in a different Abyss era after Chapter 20.
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
    rewards:{gold:Math.round(base.rewards.gold*(isEx?2.5:1.5)),exp:Math.round(base.rewards.exp*(isEx?2.5:1.5))},
    waves:[{type:base.enemyType,count:1,interval:0}],
    dropTable:[],
  };
}

export const BOUNTY2_STAGES=BOUNTIES.flatMap(b=>[buildTierStage(b,'variant'),buildTierStage(b,'EX')]);
export function bounty2StageById(id){return BOUNTY2_STAGES.find(s=>s.id===id)||null;}
export function bountyBaseIdForStage(stage){return stage?.bountyBaseId||stage?.id||null;}
