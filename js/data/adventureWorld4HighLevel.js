/* Adventure / World 4.0 — W29 High-Level / Lv99,999 World.
   Existing Region catalog, World Tier, Nemesis Hunt and Reward Scaling stay
   authoritative. This module only derives a flavor/atmosphere state for an
   already-completed Region — it does not invent a new Region, level axis,
   currency, or reward multiplier. */
import { adventure4WorldTierAvailability } from './adventureWorld4LivingWorld.js';

export const ADVENTURE4_HIGHLEVEL_STATES=Object.freeze({
  normal:Object.freeze({id:'normal',name:'平穏',desc:'既知の地域そのまま。物語当時と変わらない。'}),
  corrupted:Object.freeze({id:'corrupted',name:'浸食地帯',desc:'World Tierの圧力で、見知った土地に不穏な気配が混じり始めている。'}),
  nemesisTerritory:Object.freeze({id:'nemesisTerritory',name:'宿敵の縄張り',desc:'高いWorld Tier圧力が、地域そのものを強者の縄張りへ変えつつある。'}),
  riftOverrun:Object.freeze({id:'riftOverrun',name:'裂界氾濫',desc:'境界の圧力が最大化し、地域の隅々まで異界の気配が入り込んでいる。'}),
});

export const ADVENTURE4_HIGHLEVEL_STATE_ORDER=Object.freeze(['normal','corrupted','nemesisTerritory','riftOverrun']);

/* Reuses the exact W22 World Tier availability thresholds
   (elite/nemesis:1, anomaly:2, endgame:4) instead of introducing a second,
   incompatible rank scale. A Region only escalates once its Story route is
   already completed (Free Adventure/W28 dungeon mode), so authored Story
   scenes never get an endgame-flavored overlay they weren't written for. */
export function adventure4HighLevelState({rank=0,nemesisHere=false,regionCompleted=false}={}){
  if(!regionCompleted)return{...ADVENTURE4_HIGHLEVEL_STATES.normal,regionCompleted:false,worldTierRank:Math.max(0,Math.floor(Number(rank)||0))};
  const n=Math.max(0,Math.floor(Number(rank)||0));
  const availability=adventure4WorldTierAvailability(n);
  let stateDef=ADVENTURE4_HIGHLEVEL_STATES.normal;
  if(availability.endgame)stateDef=ADVENTURE4_HIGHLEVEL_STATES.riftOverrun;
  else if(availability.anomaly)stateDef=ADVENTURE4_HIGHLEVEL_STATES.nemesisTerritory;
  else if(availability.elite||availability.nemesis||nemesisHere)stateDef=ADVENTURE4_HIGHLEVEL_STATES.corrupted;
  return{...stateDef,regionCompleted:true,worldTierRank:n};
}
