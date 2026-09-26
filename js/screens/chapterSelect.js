import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../data/stages.js';
import { journeyName, latestVeilFragment } from '../data/worldVeil.js';
import { WORLD3_REGIONS, world3RegionState } from '../data/world3Regions.js';
import { world3BranchLabel } from '../data/world3Branches.js';
import { visibleWorld3RealmNodes, resolveWorld3RealmRoute } from '../data/world3Realms.js';
import { sideLocationVisible, sideLocationKindLabel } from '../data/sideLocations.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

function renderChapterCard(ch,idx,onPick){
  const unlocked=isChapterUnlocked(idx,(id)=>state.isStageCleared(id));
  const bossStage=finalStageOf(ch);
  const allCleared=ch.stages.every((s)=>state.isStageCleared(s.id));
  const mastery=state.phase9RegionMastery?.(ch.id);
  const masteryLine=mastery&&unlocked?mastery.mastered?`<br><span class="accent-note">◆ REGION MASTER — ${mastery.facility.name}</span><br><small>${mastery.facility.desc}</small>`:`<br><span>探索 ${mastery.explored}/${mastery.total} / 隠し強敵 ${mastery.hiddenBossCleared?'討伐済':'未討伐'}</span>`:'';
  const card=document.createElement('div');
  card.className='stage-card'+(!unlocked?' locked':'')+(allCleared?' boss':'');
  card.dataset.chapterState=!unlocked?'locked':allCleared?'clear':'open';
  card.dataset.chapterIndex=idx;
  card.style.margin='6px 0 0';
  const state2Label=!unlocked?'LOCKED':mastery?.mastered?'◆':allCleared?'CLEAR':'';
  card.innerHTML=`<div><div class="name">${unlocked?journeyName(ch):'？？？'}</div><div class="rec">${unlocked?`推奨Lv ${ch.stages[0].recLevel}〜${bossStage.recLevel}${masteryLine}`:'ひとつ前の土地の主を倒すと道が開く'}</div></div><div class="cleared">${state2Label}</div>`;
  if(unlocked)card.addEventListener('click',()=>{Audio_.tap();onPick(idx);});
  return card;
}

function renderRealmNodes(list,onPick){
  const visibility=state.world2RealmVisibility?.()||{};
  const flags=state.data.world2?.flags||{};
  const nodes=visibleWorld3RealmNodes(visibility,flags);
  const head=document.createElement('div');
  head.className='stage-card branch';
  head.innerHTML='<div><div class="name">世界層</div><div class="rec">旅の進行と境界探索によって、別世界の存在そのものが地図に刻まれていく。</div></div>';
  list.appendChild(head);
  for(const node of nodes){
    const card=document.createElement('div');
    card.className='stage-card branch'+(node.state==='hint'||node.state==='unknown'?' locked':'');
    const badge=node.badge?`<span class="world3-badge">${node.badge}</span>`:'';
    card.innerHTML=`<div><div class="name">${node.name} ${badge}</div><div class="rec">${node.detail||node.subtitle}</div></div><div class="cleared">${node.selectable?'→':node.state==='open'?'OPEN':'LOCKED'}</div>`;
    // main's route was a stale numeric CHAPTERS index (PR #410, DBG-09) — keep
    // this UIX-6 batch's emoji-free badge/label rendering, but resolve the
    // route the same semantic way main now does, or this merge would
    // silently reintroduce the Machine World routing bug #410 just fixed.
    const route=resolveWorld3RealmRoute(node.route,CHAPTERS);
    if(node.selectable&&route!==null&&route!==undefined)card.addEventListener('click',()=>{Audio_.tap();onPick(route);});
    list.appendChild(card);
  }
}

function renderRegionalMasterySummary(list){
  const masteries=state.phase9RegionalMasteries?.()||[];
  if(!masteries.length)return;
  const visible=masteries.filter(m=>CHAPTERS.find(ch=>ch.id===m.chapterId)&&isChapterUnlocked(m.chapter-1,(id)=>state.isStageCleared(id)));
  if(!visible.length)return;
  const mastered=masteries.filter(m=>m.mastered).length,bonus=state.phase9RegionalBonuses?.()||{};
  const card=document.createElement('div');card.className='stage-card boss';
  const stats=[bonus.atk?`ATK +${Math.round(bonus.atk*100)}%`:null,bonus.mag?`MAG +${Math.round(bonus.mag*100)}%`:null,bonus.spd?`SPD +${Math.round(bonus.spd*100)}%`:null,bonus.hp?`HP +${Math.round(bonus.hp*100)}%`:null,bonus.def?`DEF +${Math.round(bonus.def*100)}%`:null].filter(Boolean).join(' / ');
  card.innerHTML=`<div><div class="name">◆ 外縁地域踏破 ${mastered}/5</div><div class="rec">探索3地点＋隠し強敵の討伐で地域施設が恒久解禁。${stats?`<br>${stats}`:''}${state.phase9NextWorldUnlocked?.()?'<br><span class="accent-note">第八鍵観測：境界のさらに外側から応答を検出。</span>':''}</div></div><div class="cleared">${mastered===5?'COMPLETE':mastered}</div>`;
  list.appendChild(card);
}

export function renderChapterSelect(onPick) {
  const list=document.getElementById('chapterList');
  list.innerHTML='';
  const latestLore=latestVeilFragment((id)=>state.isStageCleared(id));
  if(latestLore){const record=document.createElement('div');record.className='stage-card boss';record.innerHTML=`<div><div class="name">${latestLore.title}</div><div class="rec">${latestLore.text}</div></div>`;list.appendChild(record);}

  renderRealmNodes(list,onPick);
  renderRegionalMasterySummary(list);

  WORLD3_REGIONS.forEach(region=>{
    const progress=world3RegionState(region,CHAPTERS,(id)=>state.isStageCleared(id),(idx)=>isChapterUnlocked(idx,(id)=>state.isStageCleared(id)));
    if(!progress.unlocked&&progress.clearedCount===0)return;
    const wrap=document.createElement('section');wrap.className='world3-region';wrap.style.cssText='margin:10px 0;border:1px solid var(--dc-iron-500);border-radius:var(--dc-radius-panel);padding:8px;background:rgba(18,24,32,.5)';
    const header=document.createElement('button');header.type='button';header.className='btn-sub';header.style.cssText='width:100%;text-align:left;display:flex;justify-content:space-between;gap:8px;padding:9px';
    const current=region.chapters.some(n=>{const idx=n-1,ch=CHAPTERS[idx];return ch&&isChapterUnlocked(idx,(id)=>state.isStageCleared(id))&&!state.isStageCleared(finalStageOf(ch).id);});
    header.innerHTML=`<span><strong>${region.name}</strong><br><small>${region.subtitle}</small></span><span>${progress.completed?'★ COMPLETE':`${progress.clearedCount}/${progress.total}`}</span>`;
    const body=document.createElement('div');body.className='world3-region-body';body.hidden=!current&&region.id!=='frontier';
    for(const num of region.chapters){const idx=num-1,ch=CHAPTERS[idx];if(ch)body.appendChild(renderChapterCard(ch,idx,onPick));}
    header.addEventListener('click',()=>{body.hidden=!body.hidden;});wrap.append(header,body);list.appendChild(wrap);
  });

  // 外伝(gaiden)：本編の連番に入れない寄り道章を、独自の節として描く。
  // sideLocationは「探索地点」節へ振り分けるため、ここでは除く。
  const gaidens=CHAPTERS.map((ch,idx)=>({ch,idx})).filter(x=>x.ch.gaiden&&!x.ch.sideLocation);
  if(gaidens.length){
    const unlockedAny=gaidens.some(({idx})=>isChapterUnlocked(idx,(id)=>state.isStageCleared(id)));
    if(unlockedAny){
      const wrap=document.createElement('section');wrap.className='world3-region';wrap.style.cssText='margin:10px 0;border:1px solid var(--dc-iron-500);border-radius:var(--dc-radius-panel);padding:8px;background:rgba(18,24,32,.5)';
      const header=document.createElement('button');header.type='button';header.className='btn-sub';header.style.cssText='width:100%;text-align:left;display:flex;justify-content:space-between;gap:8px;padding:9px';
      const clearedCount=gaidens.filter(({ch})=>state.isStageCleared(finalStageOf(ch).id)).length;
      const current=gaidens.some(({idx,ch})=>isChapterUnlocked(idx,(id)=>state.isStageCleared(id))&&!state.isStageCleared(finalStageOf(ch).id));
      header.innerHTML=`<span><strong>外伝</strong><br><small>本編の傍らに在る獣径。名付きの番獣は倒して仲間にできる。</small></span><span>${clearedCount===gaidens.length?'★ COMPLETE':`${clearedCount}/${gaidens.length}`}</span>`;
      const body=document.createElement('div');body.className='world3-region-body';body.hidden=!current;
      for(const {ch,idx} of gaidens)body.appendChild(renderChapterCard(ch,idx,onPick));
      header.addEventListener('click',()=>{body.hidden=!body.hidden;});wrap.append(header,body);list.appendChild(wrap);
    }
  }

  // 探索地点（Session 6）：街道を外れた小さな寄り道。外伝より小粒で、
  // 本編と直接関係しない場所を束ねる。hidden（隠し場所）は解放条件を
  // 満たすまで描画しない——「気づくと道が増えている」を表現する。
  const sideLocs=CHAPTERS.map((ch,idx)=>({ch,idx})).filter(x=>x.ch.sideLocation&&sideLocationVisible(x.ch,()=>isChapterUnlocked(x.idx,(id)=>state.isStageCleared(id))));
  if(sideLocs.length){
    const unlockedAny=sideLocs.some(({idx})=>isChapterUnlocked(idx,(id)=>state.isStageCleared(id)));
    if(unlockedAny){
      const wrap=document.createElement('section');wrap.className='world3-region';wrap.style.cssText='margin:10px 0;border:1px solid var(--dc-iron-500);border-radius:var(--dc-radius-panel);padding:8px;background:rgba(18,24,32,.5)';
      const header=document.createElement('button');header.type='button';header.className='btn-sub';header.style.cssText='width:100%;text-align:left;display:flex;justify-content:space-between;gap:8px;padding:9px';
      const clearedCount=sideLocs.filter(({ch})=>state.isStageCleared(finalStageOf(ch).id)).length;
      const current=sideLocs.some(({idx,ch})=>isChapterUnlocked(idx,(id)=>state.isStageCleared(id))&&!state.isStageCleared(finalStageOf(ch).id));
      header.innerHTML=`<span><strong>探索地点</strong><br><small>街道を外れた場所。確定Rare・固有の戦利品・巣の主たちが眠る。</small></span><span>${clearedCount===sideLocs.length?'★ COMPLETE':`${clearedCount}/${sideLocs.length}`}</span>`;
      const body=document.createElement('div');body.className='world3-region-body';body.hidden=!current;
      for(const {ch,idx} of sideLocs){
        const card=renderChapterCard(ch,idx,onPick);
        const nameEl=card.querySelector('.name');
        if(nameEl&&isChapterUnlocked(idx,(id)=>state.isStageCleared(id)))nameEl.innerHTML=`${sideLocationKindLabel(ch)}｜${nameEl.innerHTML}`;
        body.appendChild(card);
      }
      header.addEventListener('click',()=>{body.hidden=!body.hidden;});wrap.append(header,body);list.appendChild(wrap);
    }
  }

  if((state.world2Progress?.()||0)>=5){
    const secretSites=(state.explorationSites||[]).map(site=>state.explorationProgress?.(site.id)).filter(Boolean);
    const summary={keyFragments:state.world2KeyFragments?.()||0,keyCount:Object.values(state.data.world2?.keys||{}).reduce((a,b)=>a+(Number(b)||0),0),secretSites,riftKeys:state.riftKeys?.()||[]};
    const card=document.createElement('div');card.className='stage-card branch';card.innerHTML=`<div><div class="name">発見された分岐</div><div class="rec">${world3BranchLabel(summary)}　—　鍵穴・異界・境界異常をまとめて確認</div></div><div class="cleared">→</div>`;card.addEventListener('click',()=>{Audio_.tap();onPick('world3-branches');});list.appendChild(card);
  }
}
