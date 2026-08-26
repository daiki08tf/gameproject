/* Phase 9.9 — regional content density pass on top of Phase 9.3 exploration. */
import { CHAPTERS } from '../data/stages.js';
import { regionalExplorationFor } from '../data/phase9RegionalExploration.js';

const ROUTE_DENSITY = Object.freeze({
  lore:{rewardMult:1.05,dropMult:1.15,itemPowerBonus:20,farm:'EXP・Codex調査'},
  loot:{rewardMult:1.12,dropMult:1.65,itemPowerBonus:70,farm:'地域装備ターゲット'},
  choice:{rewardMult:1.22,dropMult:1.35,itemPowerBonus:45,farm:'高密度混成戦・素材'},
});

function levelAt(ch,t){return Math.round(ch.stages[0].recLevel+(ch.stages.find(s=>s.boss&&!s.branch)?.recLevel-ch.stages[0].recLevel)*t)}
function routeProfile(kind){return ROUTE_DENSITY[kind]||ROUTE_DENSITY.choice;}
function storyAnchor(chapter,route){return chapter.stages.find(s=>s.id===route.unlockAfter)||chapter.stages[0];}
function scaledFromAnchor(anchor,profile){
  return{
    gold:Math.max(1,Math.round((Number(anchor.rewards?.gold)||1)*profile.rewardMult)),
    exp:Math.max(1,Math.round((Number(anchor.rewards?.exp)||1)*profile.rewardMult)),
  };
}
function anchorIp(anchor,profile){return Math.min(10000,Math.max(1,Math.round((Number(anchor.itemPowerTarget)||Number(anchor.recLevel)||1)+profile.itemPowerBonus)));}

function routeWaves(chapter,kind){
  const id=chapter.id;
  if(kind==='lore')return[{type:`${id}_normal`,count:4,interval:1},{type:`${id}_fast`,count:3,interval:.8}];
  if(kind==='loot')return[{type:`${id}_tank`,count:3,interval:1.35},{type:`${id}_midboss`,count:1,interval:0}];
  return[{type:`${id}_fast`,count:4,interval:.75},{type:`${id}_normal`,count:3,interval:1},{type:`${id}_tank`,count:2,interval:1.3}];
}

for(const chapter of CHAPTERS){
  const def=regionalExplorationFor(chapter.id);
  if(!def||chapter.phase9RegionalExploration)continue;
  chapter.phase9RegionalExploration=def;
  const storyBoss=chapter.stages.find(s=>s.boss&&!s.branch);
  const bossIndex=chapter.stages.findIndex(s=>s===storyBoss);
  const routes=def.routes.map((route,index)=>{
    const profile=routeProfile(route.kind),anchor=storyAnchor(chapter,route);
    return{
      id:`${chapter.num}-X${index+1}`,
      name:route.name,
      recLevel:levelAt(chapter,route.levelT),
      branch:true,
      phase9Exploration:true,
      phase9ExplorationIndex:index,
      phase9ExplorationId:route.id,
      phase9ExplorationKind:route.kind,
      phase9RewardTag:route.rewardTag,
      phase9Description:route.desc,
      phase9RewardAnchorId:anchor.id,
      phase9FarmIdentity:profile.farm,
      phase9Repeatable:true,
      phase9DensityPass:'9.9',
      requires:index===0?route.unlockAfter:`${chapter.num}-X${index}`,
      phase9StoryGate:index===0?route.unlockAfter:null,
      waves:routeWaves(chapter,route.kind),
      rewards:scaledFromAnchor(anchor,profile),
      dropMult:(Number(anchor.dropMult)||1)*profile.dropMult,
      itemPowerTarget:anchorIp(anchor,profile),
      dropTable:index===0?[{itemId:`${chapter.id}_accessory`,weight:1}]:index===1?[{itemId:`${chapter.id}_weapon`,weight:1},{itemId:`${chapter.id}_head`,weight:1}]:[{itemId:`${chapter.id}_body`,weight:1},{itemId:`${chapter.id}_accessory`,weight:1}],
    };
  });
  chapter.stages.splice(Math.max(0,bossIndex),0,...routes);
  const hidden=chapter.stages.find(s=>s.id===`${chapter.num}-B`);
  if(hidden){
    hidden.requires=routes.at(-1)?.id||hidden.requires;
    hidden.phase9HiddenBoss=true;
    hidden.phase9ExplorationChain=routes.map(s=>s.id);
    hidden.phase9Description=`3つの地域探索を完遂した者だけが辿り着ける隠し強敵。地域踏破の証「${def.reward}」へ続く最終調査。`;
    hidden.phase9RegionalApexReward=def.reward;
    hidden.phase9FarmIdentity='地域踏破ボス・高品質戦利品';
    hidden.phase9Repeatable=true;
    hidden.phase9DensityPass='9.9';
    if(storyBoss){
      hidden.rewards={
        gold:Math.max(Number(hidden.rewards?.gold)||0,Math.round((Number(storyBoss.rewards?.gold)||1)*1.45)),
        exp:Math.max(Number(hidden.rewards?.exp)||0,Math.round((Number(storyBoss.rewards?.exp)||1)*1.45)),
      };
      hidden.dropMult=Math.max(Number(hidden.dropMult)||1,(Number(storyBoss.dropMult)||1)*1.75);
      hidden.itemPowerTarget=Math.min(10000,Math.max(Number(hidden.itemPowerTarget)||0,(Number(storyBoss.itemPowerTarget)||Number(storyBoss.recLevel)||1)+100));
    }
  }
}

export function phase9RegionalRouteIds(chapterId){
  const chapter=CHAPTERS.find(ch=>ch.id===chapterId);
  return chapter?.stages?.filter(s=>s.phase9Exploration).map(s=>s.id)||[];
}
