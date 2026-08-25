import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../data/stages.js';
import { journeyName, latestVeilFragment } from '../data/worldVeil.js';
import { WORLD3_REGIONS, world3RegionState } from '../data/world3Regions.js';
import { world3BranchLabel } from '../data/world3Branches.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

function renderChapterCard(ch,idx,onPick){
  const unlocked=isChapterUnlocked(idx,(id)=>state.isStageCleared(id));
  const bossStage=finalStageOf(ch);
  const allCleared=ch.stages.every((s)=>state.isStageCleared(s.id));
  const card=document.createElement('div');
  card.className='stage-card'+(!unlocked?' locked':'')+(allCleared?' boss':'');
  card.style.margin='6px 0 0';
  card.innerHTML=`<div><div class="name">${unlocked?journeyName(ch):'🔒 ???'}</div><div class="rec">${unlocked?`推奨Lv ${ch.stages[0].recLevel}〜${bossStage.recLevel}`:'ひとつ前の土地の主を倒すと道が開く'}</div></div><div class="cleared">${allCleared?'★':''}</div>`;
  if(unlocked)card.addEventListener('click',()=>{Audio_.tap();onPick(idx);});
  return card;
}

export function renderChapterSelect(onPick) {
  const list=document.getElementById('chapterList');
  list.innerHTML='';
  const latestLore=latestVeilFragment((id)=>state.isStageCleared(id));
  if(latestLore){const record=document.createElement('div');record.className='stage-card boss';record.innerHTML=`<div><div class="name">📖 ${latestLore.title}</div><div class="rec">${latestLore.text}</div></div>`;list.appendChild(record);}
  const realm=state.world2RealmVisibility?.()||{};
  const realmLine=document.createElement('div');realmLine.className='stage-card branch';
  const labels=[['mortal','人界'],['heaven','天界'],['underworld','冥界'],['modern','？？？']].filter(([id])=>realm[id]&&realm[id]!=='hidden').map(([id,name])=>`${name}:${realm[id]==='open'?'OPEN':realm[id]==='hint'?'兆候':'???'}`);
  realmLine.innerHTML=`<div><div class="name">WORLD 3.0</div><div class="rec">${labels.join(' / ')||'人界を探索中'}</div></div>`;list.appendChild(realmLine);
  WORLD3_REGIONS.forEach(region=>{
    const progress=world3RegionState(region,CHAPTERS,(id)=>state.isStageCleared(id),(idx)=>isChapterUnlocked(idx,(id)=>state.isStageCleared(id)));
    if(!progress.unlocked&&progress.clearedCount===0)return;
    const wrap=document.createElement('section');wrap.className='world3-region';wrap.style.cssText='margin:10px 0;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:8px;background:rgba(255,255,255,.025)';
    const header=document.createElement('button');header.type='button';header.className='btn-sub';header.style.cssText='width:100%;text-align:left;display:flex;justify-content:space-between;gap:8px;padding:9px';
    const current=region.chapters.some(n=>{const idx=n-1,ch=CHAPTERS[idx];return ch&&isChapterUnlocked(idx,(id)=>state.isStageCleared(id))&&!state.isStageCleared(finalStageOf(ch).id);});
    header.innerHTML=`<span><strong>${region.name}</strong><br><small>${region.subtitle}</small></span><span>${progress.completed?'★ COMPLETE':`${progress.clearedCount}/${progress.total}`}</span>`;
    const body=document.createElement('div');body.className='world3-region-body';body.hidden=!current&&region.id!=='frontier';
    for(const num of region.chapters){const idx=num-1,ch=CHAPTERS[idx];if(ch)body.appendChild(renderChapterCard(ch,idx,onPick));}
    header.addEventListener('click',()=>{body.hidden=!body.hidden;});wrap.append(header,body);list.appendChild(wrap);
  });
  if((state.world2Progress?.()||0)>=5){
    const secretSites=(state.explorationSites||[]).map(site=>state.explorationProgress?.(site.id)).filter(Boolean);
    const summary={keyFragments:state.world2KeyFragments?.()||0,keyCount:Object.values(state.data.world2?.keys||{}).reduce((a,b)=>a+(Number(b)||0),0),secretSites,riftKeys:state.riftKeys?.()||[]};
    const card=document.createElement('div');card.className='stage-card branch';card.innerHTML=`<div><div class="name">🧭 発見された分岐</div><div class="rec">${world3BranchLabel(summary)}　—　鍵穴・異界・境界異常をまとめて確認</div></div><div class="cleared">→</div>`;card.addEventListener('click',()=>{Audio_.tap();onPick('world3-branches');});list.appendChild(card);
  }
}
