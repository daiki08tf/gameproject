/* Abyss Run Build — lightweight choice overlay */
import { state } from '../state.js';

function remove(){document.getElementById('abyssRunChoiceOverlay')?.remove();}

export function showAbyssRunChoice(depth,onDone){
  const choices=state.abyssRunChoices?.(depth)||[];
  if(!choices.length){onDone?.(null);return;}
  remove();
  const overlay=document.createElement('div');overlay.id='abyssRunChoiceOverlay';Object.assign(overlay.style,{position:'fixed',inset:'0',zIndex:'9999',background:'rgba(0,0,0,.78)',display:'flex',alignItems:'center',justifyContent:'center',padding:'18px'});
  const panel=document.createElement('div');panel.className='panel';panel.style.width='min(520px,96vw)';
  const run=state.abyssRun();const currentSyn=new Set((state.abyssRunSynergies?.()||[]).map(s=>s.id));
  panel.innerHTML=`<h2 style="text-align:center;">深淵の残響</h2><p class="sub" style="text-align:center;">${run.clears}階踏破。今回の潜行だけ有効な力を1つ選ぶ。</p><div id="abyssRunChoiceList" style="display:grid;gap:8px;margin-top:14px;"></div>`;
  const list=panel.querySelector('#abyssRunChoiceList');
  for(const boon of choices){
    const rank=(run.ranks[boon.id]||0)+1;const btn=document.createElement('button');btn.className='menu-card';btn.style.textAlign='left';btn.innerHTML=`<strong>${boon.icon} ${boon.name}　Rank ${rank}</strong><br><span class="hint">${boon.desc}</span>`;
    btn.addEventListener('click',()=>{const picked=state.abyssRunPick(boon.id);if(!picked)return;const unlocked=(picked.synergies||[]).filter(s=>!currentSyn.has(s.id));remove();onDone?.({picked,unlocked});});list.appendChild(btn);
  }
  overlay.appendChild(panel);document.body.appendChild(overlay);
}

export function abyssRunSummaryText(){
  const r=state.abyssRun?.();if(!r?.active)return'';
  const names=Object.entries(r.ranks||{}).filter(([,rank])=>rank>0).map(([id,rank])=>{const c=state.abyssRunChoices?.(r.lastDepth||1)?.find?.(x=>x.id===id);return c?`${c.name}×${rank}`:`${id}×${rank}`;});
  const syn=(state.abyssRunSynergies?.()||[]).map(s=>s.name);
  return [...names,...syn].join(' / ');
}
