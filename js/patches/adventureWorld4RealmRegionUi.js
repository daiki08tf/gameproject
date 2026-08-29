/* Adventure / World 4.0 — W23/W24 contextual Realm + Dynamic Region UI.
   Unknown signals are not listed or counted. */
import { state } from '../state.js';
import './adventureWorld4RealmRegionRuntime.js';

const STATUS={stable:'安定',watch:'要観測',unstable:'不安定',transformed:'変質中'};
function render(){
  const screen=document.getElementById('adventureRoute4Screen'),body=screen?.querySelector('.adventure4-body');
  if(!screen||!body||!screen.classList.contains('active'))return;
  body.querySelector('[data-adventure4-region-state]')?.remove();
  const session=state.adventure4Session?.();if(!session?.active)return;
  const region=state.adventure4DynamicRegionState?.(session.regionId);if(!region)return;
  const signal=state.adventure4RealmSignalForRegion?.(session.regionId);
  if(region.status==='stable'&&!signal)return;
  const box=document.createElement('section');box.dataset.adventure4RegionState='true';box.className='adventure4-card';
  box.innerHTML=`<div class="adventure4-meta">Dynamic Region</div><h3>${STATUS[region.status]||region.status}</h3><p>地域そのものは固定された authored identity を保ち、現在の世界状態だけが重なっている。</p>`;
  for(const overlay of region.overlays){const p=document.createElement('p');p.className='hint';p.textContent=`${overlay.name}: ${overlay.detail}`;box.appendChild(p);}
  if(signal){const p=document.createElement('p');p.className='hint';p.textContent=`境界兆候: ${signal.name} / ${signal.stage}`;box.appendChild(p);}
  body.appendChild(box);
}
const observer=new MutationObserver(()=>queueMicrotask(render));observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});queueMicrotask(render);
export {render as renderAdventure4RealmRegionState};
