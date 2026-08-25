/* Phase 9.3 — turn region lore/events into playable side routes. */
import { CHAPTERS } from '../data/stages.js';
import { regionalExplorationFor } from '../data/phase9RegionalExploration.js';

function scaleReward(base,mult){return{gold:Math.round(base.gold*mult),exp:Math.round(base.exp*mult)}}
function levelAt(ch,t){return Math.round(ch.stages[0].recLevel+(ch.stages.find(s=>s.boss)?.recLevel-ch.stages[0].recLevel)*t)}

function routeWaves(chapter,index){
  const id=chapter.id;
  if(index===0)return[{type:`${id}_normal`,count:4,interval:1},{type:`${id}_fast`,count:3,interval:.8}];
  if(index===1)return[{type:`${id}_tank`,count:3,interval:1.35},{type:`${id}_midboss`,count:1,interval:0}];
  return[{type:`${id}_fast`,count:4,interval:.75},{type:`${id}_normal`,count:3,interval:1},{type:`${id}_tank`,count:2,interval:1.3}];
}

for(const chapter of CHAPTERS){
  const def=regionalExplorationFor(chapter.id);
  if(!def||chapter.phase9RegionalExploration)continue;
  chapter.phase9RegionalExploration=def;
  const bossIndex=chapter.stages.findIndex(s=>s.boss);
  const routes=def.routes.map((route,index)=>({
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
    requires:index===0?route.unlockAfter:`${chapter.num}-X${index}`,
    phase9StoryGate:index===0?route.unlockAfter:null,
    waves:routeWaves(chapter,index),
    rewards:scaleReward({gold:180+index*30,exp:150+index*25},1+chapter.num*.16),
    dropTable:index===0?[{itemId:`${chapter.id}_accessory`,weight:1}]:index===1?[{itemId:`${chapter.id}_weapon`,weight:1},{itemId:`${chapter.id}_head`,weight:1}]:[{itemId:`${chapter.id}_body`,weight:1},{itemId:`${chapter.id}_accessory`,weight:1}],
  }));
  chapter.stages.splice(bossIndex,0,...routes);
  const hidden=chapter.stages.find(s=>s.id===`${chapter.num}-B`);
  if(hidden){
    hidden.requires=routes.at(-1)?.id||hidden.requires;
    hidden.phase9HiddenBoss=true;
    hidden.phase9ExplorationChain=routes.map(s=>s.id);
    hidden.phase9Description=`3つの地域探索を完遂した者だけが辿り着ける隠し強敵。地域踏破の証「${def.reward}」へ続く最終調査。`;
  }
}

export function phase9RegionalRouteIds(chapterId){
  const chapter=CHAPTERS.find(ch=>ch.id===chapterId);
  return chapter?.stages?.filter(s=>s.phase9Exploration).map(s=>s.id)||[];
}
