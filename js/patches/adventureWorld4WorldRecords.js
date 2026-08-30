/* Adventure / World 4.0 — W32 World Records runtime.
   Read-only bridge into Settlement Chronicle. No save writes or new root. */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { buildWorld4RegionCatalog } from '../data/adventureWorld4Regions.js';
import { ADVENTURE4_CONTENT_PACK_I_EVENTS } from '../data/adventureWorld4ContentPackI.js';
import { ADVENTURE4_CONTENT_PACK_II_EVENTS } from '../data/adventureWorld4ContentPackII.js';
import { adventure4ExplorationRecords,adventure4ExplorationRecordSummary } from '../data/adventureWorld4WorldRecords.js';

const WORLD4_EVENT_CATALOG=Object.freeze([...ADVENTURE4_CONTENT_PACK_I_EVENTS,...ADVENTURE4_CONTENT_PACK_II_EVENTS]);

function chapterByNumber(number){return CHAPTERS.find(ch=>Number(ch.num)===Number(number))||CHAPTERS[Number(number)-1]||null;}
function canonicalBoss(chapter){return chapter?.stages?.find(stage=>stage.boss&&!stage.branch)||chapter?.stages?.find(stage=>stage.boss)||chapter?.stages?.at(-1)||null;}
function regionBossRecords(manager){
  return buildWorld4RegionCatalog(CHAPTERS).map(region=>{
    const chapter=chapterByNumber(region.chapterNumbers.at(-1)),boss=canonicalBoss(chapter);
    return boss?{id:boss.id,name:boss.name,regionId:region.id,cleared:!!manager.isStageCleared?.(boss.id)}:null;
  }).filter(Boolean);
}

state.adventure4WorldRecords=function(){
  const world2=this.data.world2||{};
  return adventure4ExplorationRecords({
    discoveries:world2.discoveries||{},
    regionBosses:regionBossRecords(this),
    nemesis:this.data.bountyNemesis||{},
    eventsSeen:world2.eventsSeen||{},
    eventCatalog:WORLD4_EVENT_CATALOG,
  });
};
state.adventure4WorldRecordSummary=function(){return adventure4ExplorationRecordSummary(this.adventure4WorldRecords());};
