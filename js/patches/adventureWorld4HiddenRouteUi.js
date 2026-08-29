/* Adventure / World 4.0 — W12 permanent shortcut surface.
   Adds only discovered shortcuts to the existing Adventure screen. */
import { state } from '../state.js';
import { renderAdventureRoute } from './adventureWorld4Ui.js';
import './adventureWorld4MysterySceneRuntime.js';
import './adventureWorld4BuildExpressionRuntime.js';

function render(){
  const screen=document.getElementById('adventureRoute4Screen'),body=screen?.querySelector('.adventure4-body');if(!screen||!body||!screen.classList.contains('active'))return;
  body.querySelector('[data-adventure4-shortcuts]')?.remove();
  const session=state.adventure4Session?.();if(!session?.active||session.currentNodeId!=='entry')return;
  const shortcuts=state.adventure4VisibleShortcuts?.(session.regionId)||[];if(!shortcuts.length)return;
  const box=document.createElement('section');box.dataset.adventure4Shortcuts='true';box.className='adventure4-card';
  box.innerHTML='<div class="adventure4-meta">発見済みの近道</div><h3>秘密の経路</h3><p>一度発見した場所は、以後は存在を隠さない。</p>';
  for(const shortcut of shortcuts){const btn=document.createElement('button');btn.type='button';btn.className='adventure4-choice adventure4-secret';btn.innerHTML=`<span><strong>${shortcut.name}</strong><small>恒久Shortcut</small></span><span>›</span>`;btn.addEventListener('click',()=>{const r=state.enterAdventure4MysteryShortcut?.(shortcut.id);if(r?.ok)renderAdventureRoute();});box.appendChild(btn);}body.appendChild(box);
}

const observer=new MutationObserver(()=>queueMicrotask(render));observer.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});queueMicrotask(render);
export { render as renderAdventure4HiddenRoutes };