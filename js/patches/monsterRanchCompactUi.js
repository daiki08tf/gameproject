/* ============================================================
   Blade Vale 3.0 — Monster Ranch Compact UI
   Adds tabbed Ranch navigation and progressive disclosure without
   changing Ranch progression, breeding, training or expedition logic.
   ============================================================ */
import { appendIfDetached } from './domSafety.js';

const TABS = [
  ['companions', '仲間'],
  ['eggs', '卵'],
  ['breeding', '配合'],
  ['training', '訓練'],
  ['expeditions', '派遣'],
  ['facilities', '施設'],
  ['research', '研究'],
];

let activeTab = 'companions';
let searchQuery = '';
let compactScheduled = false;

function ensureStyles(){
  if(document.querySelector('link[data-ranch-compact-style]')) return;
  const link=document.createElement('link');
  link.rel='stylesheet';
  link.href='css/monsterRanchCompact.css';
  link.dataset.ranchCompactStyle='true';
  document.head.appendChild(link);
}

function summaryCard(root){
  return [...root.children].find(el=>el.classList?.contains('forge-card')&&!el.classList.contains('ranch-card')&&el.id!=='monsterRanch2Panel'&&el.id!=='ranch2Advanced')||null;
}

function installTabs(root){
  const summary=summaryCard(root);
  if(!summary||summary.querySelector('.ranch-compact-nav')) return;
  const nav=document.createElement('div');
  nav.className='ranch-compact-nav';
  nav.setAttribute('role','tablist');
  for(const [id,label] of TABS){
    const button=document.createElement('button');
    button.type='button';
    button.className='ranch-compact-tab';
    button.dataset.ranchTab=id;
    button.textContent=label;
    button.setAttribute('role','tab');
    button.addEventListener('click',()=>{
      activeTab=id;
      applyTab(root);
    });
    nav.appendChild(button);
  }
  const search=document.createElement('input');
  search.type='search';
  search.className='ranch-compact-search';
  search.placeholder='仲間を名前・種族・Traitで検索';
  search.autocomplete='off';
  search.addEventListener('input',()=>{
    searchQuery=search.value.trim().toLowerCase();
    filterCompanions(root);
  });
  summary.append(nav,search);
}

function tagFacilitySections(root){
  const panel=root.querySelector('#monsterRanch2Panel');
  if(panel){
    const cards=[...panel.children].filter(el=>el.classList?.contains('forge-card'));
    cards.forEach(card=>{
      card.classList.add('ranch2-section');
      const text=card.textContent||'';
      if(text.includes('孵化場')) card.classList.add('ranch2-eggs');
      else if(text.includes('配合卵')) card.classList.add('ranch2-breeding');
      else card.classList.add('ranch2-facility-item');
    });
  }
  const advanced=root.querySelector('#ranch2Advanced');
  if(advanced){
    [...advanced.children].filter(el=>el.classList?.contains('forge-card')).forEach(card=>{
      card.classList.add('ranch2-advanced-section');
      const text=card.textContent||'';
      if(text.includes('訓練場')) card.classList.add('ranch2-training');
      else if(text.includes('魔物研究所')) card.classList.add('ranch2-research');
      else if(text.includes('派遣')) card.classList.add('ranch2-expeditions');
    });
  }
}

function compactCompanionCard(card){
  if(card.dataset.ranchCompacted==='true') return;
  const fav=card.querySelector('.ranch-fav');
  if(fav?.dataset.id&&!card.dataset.id) card.dataset.id=fav.dataset.id;
  const directSubs=[...card.children].filter(el=>el.classList?.contains('forge-card-sub'));
  if(directSubs[0]) directSubs[0].classList.add('ranch-quick-meta');

  const actions=[...card.children].find(el=>el.classList?.contains('confirm-actions'))||null;
  const board=[...card.children].find(el=>el.classList?.contains('forge-card')&&(el.textContent||'').includes('Species Board'))||null;
  const details=document.createElement('details');
  details.className='ranch-compact-details';
  const summary=document.createElement('summary');
  summary.textContent='個体詳細';
  const body=document.createElement('div');
  body.className='ranch-detail-body';

  [...card.children].forEach(child=>{
    if(child===actions||child===board||child===directSubs[0]||child.classList?.contains('forge-card-top')) return;
    if(child===details) return;
    body.appendChild(child);
  });
  if(board) body.appendChild(board);
  details.append(summary,body);
  if(actions) card.insertBefore(details,actions); else card.appendChild(details);
  card.dataset.ranchCompacted='true';
}

function foldBondIntoDetails(card){
  const bond=card.querySelector(':scope > .ranch-bond-info');
  const body=card.querySelector('.ranch-detail-body');
  // appendChild() re-queues a childList mutation (remove+insert) even when the
  // node is already body's last child, and this function runs from the
  // MutationObserver watching this same subtree (childList:true) below — so
  // calling it unconditionally retriggers the observer forever.
  // appendIfDetached() only moves the node when it isn't already there.
  if(bond&&body) appendIfDetached(body,bond);
}

function filterCompanions(root){
  const q=searchQuery;
  root.querySelectorAll(':scope > .ranch-card').forEach(card=>{
    const match=!q||(card.textContent||'').toLowerCase().includes(q);
    card.classList.toggle('ranch-filter-hidden',!match);
  });
  const search=root.querySelector('.ranch-compact-search');
  if(search) search.hidden=activeTab!=='companions';
}

function applyTab(root){
  root.dataset.ranchTab=activeTab;
  root.querySelectorAll('.ranch-compact-tab').forEach(button=>{
    const active=button.dataset.ranchTab===activeTab;
    button.classList.toggle('active',active);
    button.setAttribute('aria-selected',String(active));
  });
  filterCompanions(root);
}

function applyCompactRanch(){
  compactScheduled=false;
  const root=document.getElementById('companionContent');
  if(!root) return;
  ensureStyles();
  root.dataset.ranchCompact='true';
  installTabs(root);
  tagFacilitySections(root);
  root.querySelectorAll(':scope > .ranch-card').forEach(card=>{
    compactCompanionCard(card);
    foldBondIntoDetails(card);
  });
  applyTab(root);
}

function scheduleCompactRanch(){
  if(compactScheduled) return;
  compactScheduled=true;
  queueMicrotask(applyCompactRanch);
}

const root=document.getElementById('companionContent');
if(root&&typeof MutationObserver!=='undefined'){
  new MutationObserver(scheduleCompactRanch).observe(root,{childList:true,subtree:true});
}
document.addEventListener('click',event=>{
  if(event.target?.closest?.('#goCompanionBtn,.ranch-fav,.ranch-slot,.ranch-board,.ranch-board-buy,.ranch-release,.ranch2-upgrade,.ranch2-hatch,#ranch2BreedEgg,#r2trainBtn,.r2exp,.r2claim')) scheduleCompactRanch();
});
scheduleCompactRanch();

export { applyCompactRanch, TABS };
