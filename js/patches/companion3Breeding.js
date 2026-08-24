/* ============================================================
   Companion 3.0 — Breeding runtime / inherited traits / UI
   ============================================================ */
import { state } from '../state.js';
import {
  BREEDING_COST,
  breedingSpecies,
  inheritTalent,
  inheritNature,
  inheritRarity,
  inheritTraits,
} from '../data/companionBreeding.js';
import { COMPANION_NATURES, COMPANION_RARITY_LABEL } from '../data/companions.js';
import { renderCompanionScreen } from './companionFoundation.js';

function ensureBreedingShape(){
  if(!Number.isFinite(state.data.companionBreedingCount)) state.data.companionBreedingCount=0;
}
ensureBreedingShape();

const previousGetCompanion=state.getCompanion.bind(state);
state.getCompanion=function companion3GetCompanion(instanceId){
  const c=previousGetCompanion(instanceId);
  if(!c)return c;
  const inherited=Array.isArray(c.instance.inheritedTraits)?c.instance.inheritedTraits.filter(Boolean):[];
  if(!inherited.length)return c;
  return {...c,species:{...c.species,traits:[...new Set([...(c.species.traits||[]),...inherited])]}};
};

state.companionBreedingCost=function companionBreedingCost(){return {...BREEDING_COST};};
state.canBreedCompanions=function canBreedCompanions(parentAId,parentBId){
  ensureBreedingShape();
  if(!parentAId||!parentBId||parentAId===parentBId)return{ok:false,reason:'parents'};
  const a=this.getCompanion(parentAId),b=this.getCompanion(parentBId);
  if(!a||!b)return{ok:false,reason:'missing'};
  if(this.data.gold<BREEDING_COST.gold||this.data.manastone<BREEDING_COST.manastone)return{ok:false,reason:'cost'};
  return{ok:true,a,b};
};
state.breedCompanions=function breedCompanions(parentAId,parentBId,rng=Math.random){
  const probe=this.canBreedCompanions(parentAId,parentBId);
  if(!probe.ok)return{ok:false,reason:probe.reason};
  const {a,b}=probe;
  const speciesId=breedingSpecies(a.instance.baseSpeciesId||a.instance.speciesId,b.instance.baseSpeciesId||b.instance.speciesId,rng);
  const generation=Math.max(Number(a.instance.generation)||0,Number(b.instance.generation)||0)+1;
  const talent=inheritTalent(a.instance.talent,b.instance.talent,rng);
  const nature=inheritNature(a.instance.nature,b.instance.nature,rng);
  const rarity=inheritRarity(a.instance.rarity,b.instance.rarity,rng);
  const inheritedTraits=inheritTraits(a,b,speciesId,rng);
  this.data.gold-=BREEDING_COST.gold;
  this.data.manastone-=BREEDING_COST.manastone;
  const childId=this.createCompanion(speciesId,{rarity,nature,talent,origin:'breeding'});
  const child=this.data.companionInstances[childId];
  child.generation=generation;
  child.parents=[parentAId,parentBId];
  child.inheritedTraits=inheritedTraits;
  child.bredAt=Date.now();
  this.data.companionBreedingCount=(this.data.companionBreedingCount||0)+1;
  this.save();
  return{ok:true,childId,child:this.getCompanion(childId),speciesId,generation,inheritedTraits};
};

function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function optionHtml(c){
  const name=c.instance.nickname||c.species.name;
  return `<option value="${esc(c.id)}">${esc(name)} Lv.${c.instance.level} / ${esc(COMPANION_RARITY_LABEL[c.instance.rarity]||c.instance.rarity)} / ${esc((COMPANION_NATURES[c.instance.nature]||{}).name||c.instance.nature)}</option>`;
}
function installBreedingPanel(){
  const content=document.getElementById('companionContent');
  if(!content||document.getElementById('companion3BreedingPanel'))return;
  const list=state.companionList?.()||[];
  const panel=document.createElement('div');panel.id='companion3BreedingPanel';panel.className='forge-card';
  if(list.length<2){panel.innerHTML='<div class="forge-card-name">🧬 配合</div><div class="forge-card-sub">配合には仲間が2体必要です。</div>';content.prepend(panel);return;}
  const options=list.map(optionHtml).join('');
  panel.innerHTML=`<div class="forge-card-name">🧬 配合</div><div class="forge-card-sub">親は残ります。子は才能・性格・レアリティ・特性を遺伝し、組み合わせによって交配種が誕生します。</div><div class="forge-card-sub">費用: ${BREEDING_COST.gold.toLocaleString()} Gold / 魔石 ${BREEDING_COST.manastone}</div><label class="forge-card-sub">親A<select id="companionBreedA" style="width:100%;margin-top:4px;">${options}</select></label><label class="forge-card-sub" style="margin-top:6px;display:block;">親B<select id="companionBreedB" style="width:100%;margin-top:4px;">${options}</select></label><button id="companionBreedBtn" class="btn-highlight" style="margin-top:8px;">配合する</button><div id="companionBreedMsg" class="forge-card-sub" style="margin-top:6px;"></div>`;
  content.prepend(panel);
  const a=panel.querySelector('#companionBreedA'),b=panel.querySelector('#companionBreedB'),btn=panel.querySelector('#companionBreedBtn'),msg=panel.querySelector('#companionBreedMsg');
  if(b.options.length>1)b.selectedIndex=1;
  btn.addEventListener('click',()=>{
    const r=state.breedCompanions(a.value,b.value);
    if(!r.ok){msg.textContent=r.reason==='cost'?'Goldまたは魔石が足りません。':r.reason==='parents'?'異なる2体を選んでください。':'配合できません。';return;}
    const child=r.child;msg.textContent=`✨ ${child.instance.nickname||child.species.name} が誕生！ 第${r.generation}世代${r.inheritedTraits.length?` / 継承特性: ${r.inheritedTraits.join('・')}`:''}`;
    renderCompanionScreen();
  });
}

if(typeof MutationObserver!=='undefined'){
  const observer=new MutationObserver(()=>installBreedingPanel());
  const root=document.getElementById('companionContent');if(root)observer.observe(root,{childList:true});
  installBreedingPanel();
}

export { installBreedingPanel };
