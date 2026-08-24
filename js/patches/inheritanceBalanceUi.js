/* Keep the inheritance screen honest about the balance gate. */
import { state } from '../state.js';

function syncInheritanceGate(){
  const btn=document.getElementById('doInheritanceBtn');
  if(!btn)return;
  const can=state.canPerformInheritance?.()??false;
  btn.disabled=!can;
  if(!can){
    btn.textContent=`継承する（Lv.${Number(state.inheritanceMinLevel||2000).toLocaleString()}必要）`;
    const panel=btn.closest('.rebirth-panel');
    if(panel&&!panel.querySelector('.inheritance-gate-hint')){
      const hint=document.createElement('p');hint.className='sub inheritance-gate-hint';hint.textContent=`継承はCharacter Lv.${Number(state.inheritanceMinLevel||2000).toLocaleString()}から解放されます。`;btn.before(hint);
    }
  }
}
if(typeof MutationObserver!=='undefined'){
  const root=document.getElementById('rebirthContent');
  if(root)new MutationObserver(syncInheritanceGate).observe(root,{childList:true,subtree:true});
}
syncInheritanceGate();
export { syncInheritanceGate };
