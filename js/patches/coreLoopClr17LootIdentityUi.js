/* CLR-17 — Player-facing Region loot identity.
   Presentation only: reads canonical Stage/Region grouping and the CLR-17 target profile. */
import { CHAPTERS } from '../data/stages.js';
import { buildWorld4RegionCatalog } from '../data/adventureWorld4Regions.js';
import { clr17RegionLootProfile } from '../data/coreLoopClr17.js';

function stageById(id){
  for(const chapter of CHAPTERS){const stage=chapter.stages.find(item=>item.id===id);if(stage)return{chapter,stage};}
  return null;
}
function regionForChapter(chapter){return buildWorld4RegionCatalog(CHAPTERS).find(region=>region.chapterNumbers.includes(Number(chapter?.num)))||null;}

export function renderClr17LootIdentity(){
  const screen=document.getElementById('stageConfirmScreen');
  const hunt=document.getElementById('stageFirstHuntBtn');
  let panel=document.getElementById('clr17LootIdentity');
  if(!screen?.classList.contains('active')||!hunt){panel?.remove();return false;}
  const stageId=document.getElementById('confirmStageName')?.dataset.stageId;
  const found=stageById(stageId);const region=found?regionForChapter(found.chapter):null;const profile=clr17RegionLootProfile(region?.id);
  if(!profile){panel?.remove();return false;}
  if(!panel){panel=document.createElement('div');panel.id='clr17LootIdentity';panel.className='clr17-loot-identity';hunt.parentElement?.before(panel);}
  panel.innerHTML=`<strong>狙い目：${profile.label}</strong><span>${profile.summary}</span><small>Elite / Bossまで進むほど通常の戦闘報酬機会も増える。Item Power・rarity・Unique取得条件は既存ルールのまま。</small>`;
  return true;
}

function queue(){queueMicrotask(renderClr17LootIdentity);}
document.addEventListener('click',event=>{
  const target=event.target instanceof Element?event.target:null;if(!target)return;
  if(target.closest('#stageList .stage-card')||target.closest('#confirmBackBtn')||target.closest('#stageFirstHuntBtn'))queue();
});
const confirm=document.getElementById('stageConfirmScreen');
if(confirm)new MutationObserver(queue).observe(confirm,{attributes:true,attributeFilter:['class']});
queue();
