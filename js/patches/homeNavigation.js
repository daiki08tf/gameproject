/* ============================================================
   Home navigation organizer
   Groups the growing hub menu without changing existing button IDs.
   ============================================================ */
import './settlementCore.js';
import './settlementUi.js';
import './monsterRanchCore.js';
import './monsterRanch2Facilities.js';
import './monsterRanch2Complete.js';
import './monsterRanchUi.js';
import './monsterRanch2FacilitiesUi.js';
import './companionBondUi.js';
import { applyHomePixelIcons } from '../ui/pixelIcons.js';

const GROUPS = [
  { id: 'adventure', title: '冒険', buttons: ['goStageBtn', 'goAbyssBtn'] },
  { id: 'growth', title: '育成', buttons: ['goStatusBtn', 'goJobBtn', 'goSpellBtn', 'goRebirthBtn'] },
  { id: 'gear', title: '装備', buttons: ['goEquipBtn', 'goBlacksmithBtn'] },
  { id: 'world', title: '拠点・記録', buttons: ['goSettlementBtn', 'goCompanionBtn', 'goCodexBtn'] },
];
function organize(){const root=document.querySelector('#homeScreen .menu-grid');if(!root)return;for(const group of GROUPS){let section=document.getElementById(`homeGroup-${group.id}`);if(!section){section=document.createElement('section');section.id=`homeGroup-${group.id}`;section.className='home-menu-group';const title=document.createElement('div');title.className='home-menu-group-title';title.textContent=group.title;const grid=document.createElement('div');grid.className='home-menu-group-grid';section.append(title,grid);root.appendChild(section);}const grid=section.querySelector('.home-menu-group-grid');for(const id of group.buttons){const btn=document.getElementById(id);if(btn&&btn.parentElement!==grid)grid.appendChild(btn);}}applyHomePixelIcons();}
if(typeof MutationObserver!=='undefined'){const target=document.getElementById('homeScreen');if(target)new MutationObserver(()=>queueMicrotask(organize)).observe(target,{childList:true,subtree:true});}
queueMicrotask(organize);
