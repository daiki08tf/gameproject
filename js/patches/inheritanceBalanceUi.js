/* Keep the inheritance screen honest about the balance gate. */
import { state } from '../state.js';

function syncInheritanceGate(){
  const btn=document.getElementById('doInheritanceBtn');
  if(!btn)return;
  const can=state.canPerformInheritance?.()??false;
  if(btn.disabled!==!can)btn.disabled=!can;
  if(!can){
    // btn.textContentへの代入は値が同じでも childList mutation を発生させる。
    // このobserverは自分自身がobserveしているrebirthContent配下を書き換える
    // ため、無条件に代入すると「mutation→observer再発火→mutation→…」の
    // 無限ループでタブがフリーズ/クラッシュする（実機で確認済みのバグ）。
    // 値が変わる時だけ書き込み、ループを断ち切る。
    const label=`継承する（Lv.${Number(state.inheritanceMinLevel||2000).toLocaleString()}必要）`;
    if(btn.textContent!==label)btn.textContent=label;
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
