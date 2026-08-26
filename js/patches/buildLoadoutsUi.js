/* Phase 14.3 — three lightweight equipment presets inside the existing Equipment screen. */
import { state } from '../state.js';

const SLOT_IDS=['weapon','shield','head','body','accessory1','accessory2'];
function data(){
  if(!state.data.ui14)state.data.ui14={recentStageIds:[],favoriteStageIds:[]};
  state.data.ui14.loadouts ||= [null,null,null];
  while(state.data.ui14.loadouts.length<3)state.data.ui14.loadouts.push(null);
  return state.data.ui14;
}
function snapshot(){return Object.fromEntries(SLOT_IDS.map(slot=>[slot,state.data.equipped?.[slot]||null]));}
function savePreset(index){data().loadouts[index]={equipment:snapshot()};state.save();render();}
function canApply(preset){
  if(!preset?.equipment)return {ok:false,reason:'未登録'};
  const missing=[];
  for(const [slot,id] of Object.entries(preset.equipment)){
    if(!SLOT_IDS.includes(slot)||!id)continue;
    if(!state.ownsItem?.(id))missing.push(id);
  }
  return missing.length?{ok:false,reason:`不足 ${missing.length}点`}:{ok:true};
}
function applyPreset(index){
  const preset=data().loadouts[index],check=canApply(preset);if(!check.ok)return check;
  const before=snapshot(),changed=[];
  for(const slot of SLOT_IDS){
    const target=preset.equipment[slot]||null;
    if((state.data.equipped?.[slot]||null)===target)continue;
    if(!state.equipItem(slot,target)){
      for(const rollbackSlot of changed.reverse())state.equipItem(rollbackSlot,before[rollbackSlot]||null);
      return {ok:false,reason:'現在の職業・所持状態では装備できません'};
    }
    changed.push(slot);
  }
  state.save();render();document.getElementById('goEquipBtn')?.click();return {ok:true};
}
function render(){
  const screen=document.getElementById('equipmentScreen'),layout=screen?.querySelector('.equip-layout');if(!layout)return;
  let box=screen.querySelector('#phase14Loadouts');if(!box){box=document.createElement('div');box.id='phase14Loadouts';box.className='forge-card phase14-loadouts';layout.prepend(box);}
  box.innerHTML='<div class="forge-card-name">BUILD PRESET</div><div class="forge-card-sub">現在の6装備枠を3つまで保存。消失した装備があるプリセットは適用しない。</div>';
  const row=document.createElement('div');row.className='phase14-loadout-row';
  data().loadouts.forEach((preset,index)=>{
    const unit=document.createElement('div');unit.className='phase14-loadout-unit';
    const label=document.createElement('span');label.textContent=`P${index+1}${preset?' ●':' —'}`;unit.appendChild(label);
    const apply=document.createElement('button');apply.className='btn-sub';apply.textContent='適用';const check=canApply(preset);apply.disabled=!check.ok;apply.title=check.ok?'この装備セットへ切替':check.reason;apply.addEventListener('click',()=>applyPreset(index));unit.appendChild(apply);
    const save=document.createElement('button');save.className='btn-sub';save.textContent=preset?'上書き':'保存';save.addEventListener('click',()=>savePreset(index));unit.appendChild(save);row.appendChild(unit);
  });box.appendChild(row);
}
const screen=document.getElementById('equipmentScreen');if(screen&&typeof MutationObserver!=='undefined')new MutationObserver(()=>queueMicrotask(render)).observe(screen,{childList:true,subtree:true});
document.addEventListener('click',e=>{if(e.target?.closest?.('#goEquipBtn,#autoEquipBtn,.equip-slot,.pick-row button'))queueMicrotask(render);});
render();
export { savePreset,applyPreset,canApply };
