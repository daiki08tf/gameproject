import { state } from '../state.js';
import { getJob } from '../data/jobs.js';

function inject(){
  const content=document.getElementById('statusContent');
  if(!content||document.getElementById('progression3Panel')) return;
  const stats=state.getStats();
  const history=Object.entries(state.getGrowthHistory?.()||{}).filter(([,n])=>n>0).sort((a,b)=>b[1]-a[1]);
  const growth=state.getGrowthPerCharacterLevel?.()||{};
  const panel=document.createElement('div');
  panel.id='progression3Panel'; panel.className='status-section';
  panel.innerHTML=`<h3>Progression 3.0</h3>
    <div class="status-grid">
      <div class="status-row"><span class="status-label">MDEF</span><span class="status-value">${stats.mdef??0}</span></div>
      <div class="status-row"><span class="status-label">次Lv HP</span><span class="status-value">+${Number(growth.hp||0).toFixed(2)}</span></div>
      <div class="status-row"><span class="status-label">次Lv ATK</span><span class="status-value">+${Number(growth.atk||0).toFixed(2)}</span></div>
      <div class="status-row"><span class="status-label">次Lv DEF</span><span class="status-value">+${Number(growth.def||0).toFixed(2)}</span></div>
      <div class="status-row"><span class="status-label">次Lv MAG</span><span class="status-value">+${Number(growth.mag||0).toFixed(2)}</span></div>
      <div class="status-row"><span class="status-label">次Lv MDEF</span><span class="status-value">+${Number(growth.mdef||0).toFixed(2)}</span></div>
    </div>
    <div class="item-stats" style="margin-top:8px">Character Lvアップ履歴：${history.length?history.map(([id,n])=>`${getJob(id)?.name||id} ${n}回`).join(' / '):'まだ記録なし'}<br>※転職しても過去の成長は残ります。現在職は最終ステータスへ小さな補正を与えます。</div>`;
  content.appendChild(panel);
}

const host=document.getElementById('statusContent');
if(host){
  let scheduled=false;
  new MutationObserver(()=>{
    if(scheduled) return; scheduled=true;
    queueMicrotask(()=>{ scheduled=false; inject(); });
  }).observe(host,{childList:true});
}
