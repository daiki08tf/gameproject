/* ============================================================
   Companion System Phase 2
   ------------------------------------------------------------
   Save-compatible companion instances, 3-slot party, EXP growth and UI.
   ============================================================ */
import { state } from '../state.js';
import {
  COMPANION_RARITY,
  COMPANION_RARITY_LABEL,
  COMPANION_NATURES,
  COMPANION_SPECIES,
  getCompanionSpecies,
  companionExpToNext,
  companionStats,
  companionTraitLabel,
} from '../data/companions.js';
import { unlockedCompanionSkills } from '../data/companionSkills.js';

const PARTY_SIZE = 3;
const SAVE_FIELDS = { companionInstances: {}, companionParty: [null, null, null], nextCompanionSeq: 1, companionCodex: {} };
function ensureSaveShape() {
  let changed = false;
  for (const [key, fallback] of Object.entries(SAVE_FIELDS)) {
    if (state.data[key] == null) { state.data[key] = Array.isArray(fallback) ? [...fallback] : { ...fallback }; changed = true; }
  }
  if (!Array.isArray(state.data.companionParty)) { state.data.companionParty = [null, null, null]; changed = true; }
  if (state.data.companionParty.length < PARTY_SIZE) {
    state.data.companionParty = [...state.data.companionParty, ...Array(PARTY_SIZE - state.data.companionParty.length).fill(null)];
    changed = true;
  } else if (state.data.companionParty.length > PARTY_SIZE) {
    state.data.companionParty = state.data.companionParty.slice(0, PARTY_SIZE); changed = true;
  }
  if (state.data.starterCompanionGranted == null) { state.data.starterCompanionGranted = Object.keys(state.data.companionInstances || {}).length > 0; changed = true; }
  if (changed) state.save();
}
ensureSaveShape();

function randomNature() { const ids = Object.keys(COMPANION_NATURES); return ids[Math.floor(Math.random() * ids.length)]; }
function randomRarity(minRarity = null) { const r=Math.random(); let rarity='normal'; if(r<.005)rarity='mythic'; else if(r<.025)rarity='legendary'; else if(r<.10)rarity='epic'; else if(r<.30)rarity='rare'; if(minRarity){const rolled=COMPANION_RARITY.indexOf(rarity),floor=COMPANION_RARITY.indexOf(minRarity);if(floor>=0&&rolled<floor)rarity=minRarity;} return rarity; }
function talentForRarity(rarity){const idx=Math.max(0,COMPANION_RARITY.indexOf(rarity)),min=.94+idx*.018,max=1.06+idx*.028,roll=()=>Math.round((min+Math.random()*(max-min))*1000)/1000;return{hp:roll(),mp:roll(),atk:roll(),def:roll(),mag:roll(),spd:roll()};}

state.createCompanion=function createCompanion(speciesId,opts={}){const species=getCompanionSpecies(speciesId);if(!species)return null;const id=`${speciesId}#${this.data.nextCompanionSeq++}`,rarity=opts.rarity||randomRarity(opts.minRarity||null);this.data.companionInstances[id]={speciesId,nickname:opts.nickname||null,level:Math.max(1,opts.level||1),exp:0,rarity,nature:opts.nature||randomNature(),talent:opts.talent||talentForRarity(rarity),origin:opts.origin||null,createdAt:Date.now()};this.data.companionCodex[speciesId]=true;this.save();return id;};
state.getCompanion=function getCompanion(instanceId){const inst=this.data.companionInstances[instanceId];if(!inst)return null;const species=getCompanionSpecies(inst.speciesId);if(!species)return null;return{id:instanceId,species,instance:inst,stats:companionStats(species,inst)};};
state.companionList=function companionList(){return Object.keys(this.data.companionInstances).map(id=>this.getCompanion(id)).filter(Boolean).sort((a,b)=>b.instance.level-a.instance.level||a.species.name.localeCompare(b.species.name,'ja'));};

state.activeCompanionIds=function activeCompanionIds(){return this.data.companionParty.slice(0,PARTY_SIZE).filter(id=>id&&this.data.companionInstances[id]);};
state.activeCompanions=function activeCompanions(){return this.activeCompanionIds().map(id=>this.getCompanion(id)).filter(Boolean);};
// Backward-compatible aliases: slot 1 remains the "active companion" for older integrations.
state.activeCompanionId=function activeCompanionId(){return this.data.companionParty[0]||null;};
state.activeCompanion=function activeCompanion(){return this.getCompanion(this.activeCompanionId());};
state.setCompanionSlot=function setCompanionSlot(slot, instanceId){if(!Number.isInteger(slot)||slot<0||slot>=PARTY_SIZE)return false;if(instanceId!=null&&!this.data.companionInstances[instanceId])return false;if(instanceId){for(let i=0;i<PARTY_SIZE;i++){if(i!==slot&&this.data.companionParty[i]===instanceId)this.data.companionParty[i]=null;}}this.data.companionParty[slot]=instanceId||null;this.save();return true;};
state.setActiveCompanion=function setActiveCompanion(instanceId){return this.setCompanionSlot(0,instanceId);};

state.gainCompanionExp=function gainCompanionExp(amount,instanceId=this.activeCompanionId()){const inst=instanceId&&this.data.companionInstances[instanceId];if(!inst||amount<=0)return{gained:0,leveledUp:false};const gained=Math.max(1,Math.round(amount));inst.exp+=gained;let leveledUp=false;while(inst.exp>=companionExpToNext(inst.level)){inst.exp-=companionExpToNext(inst.level);inst.level+=1;leveledUp=true;}this.save();return{gained,leveledUp,level:inst.level};};
state.gainPartyCompanionExp=function gainPartyCompanionExp(amount){const out=[];for(const id of this.activeCompanionIds()){out.push({id,...this.gainCompanionExp(amount,id)});}return out;};
state.releaseCompanion = function releaseCompanion(instanceId) {
  if (!this.data.companionInstances[instanceId]) return false;
  if (this.activeCompanionId() === instanceId) this.data.companionParty[0] = null;
  for (let i = 1; i < PARTY_SIZE; i++) if (this.data.companionParty[i] === instanceId) this.data.companionParty[i] = null;
  delete this.data.companionInstances[instanceId];
  this.save();
  return true;
};

if (!state.data.starterCompanionGranted) {
  if (state.companionList().length === 0) {
    const starter = state.createCompanion('slime', { rarity: 'normal', nature: 'balanced', origin: 'starter' });
    state.setActiveCompanion(starter);
  }
  state.data.starterCompanionGranted = true;
  state.save();
}

function showScreen(id){document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));document.getElementById(id)?.classList.add('active');}
function rarityStars(rarity){return'★'.repeat(Math.max(1,COMPANION_RARITY.indexOf(rarity)+1));}
function escapeHtml(value){return String(value??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function partySlotOf(id){return state.data.companionParty.findIndex(x=>x===id);}

function renderCompanionScreen(){
  const content=document.getElementById('companionContent');if(!content)return;
  const party=state.data.companionParty.slice(0,PARTY_SIZE);
  const list=state.companionList();
  const partySummary=party.map((id,i)=>{const c=id?state.getCompanion(id):null;return `<div class="forge-card-sub">枠${i+1}: ${c?`${escapeHtml(c.instance.nickname||c.species.name)} Lv.${c.instance.level}`:'－'}</div>`;}).join('');
  if(!list.length){content.innerHTML=`<div class="forge-card"><div class="forge-card-name">編成</div>${partySummary}</div><p class="hint">まだ仲間はいません。</p>`;return;}
  const cards=list.map(({id,species,instance,stats})=>{
    const slot=partySlotOf(id),active=slot>=0,nature=COMPANION_NATURES[instance.nature]||COMPANION_NATURES.balanced,xpNeed=companionExpToNext(instance.level),displayName=escapeHtml(instance.nickname||species.name),traits=(species.traits||[]).map(companionTraitLabel).join('・')||'なし',skills=unlockedCompanionSkills(species,instance.level),skillText=skills.length?skills.map(s=>`${s.name}${s.mpCost?` MP${s.mpCost}`:''}: ${s.desc}`).join(' / '):'なし',evo=state.companionEvolutionInfo?.(id),evoText=evo?`進化: ${evo.name}（Lv.${evo.level} / ${COMPANION_RARITY_LABEL[evo.minRarity]}以上）`:instance.evolution?'進化済み':'進化先なし';
    const slotButtons=[0,1,2].map(i=>`<button class="btn-sub companion-slot-btn" data-id="${escapeHtml(id)}" data-slot="${i}" ${slot===i?'disabled':''}>${slot===i?`枠${i+1} 編成中`:`枠${i+1}へ`}</button>`).join('');
    return `<div class="forge-card companion-card ${active?'companion-active':''}" data-companion-id="${escapeHtml(id)}"><div class="forge-card-name">${displayName} ${active?`【編成${slot+1}】`:''}</div><div class="forge-card-sub">Lv.${instance.level} / ${COMPANION_RARITY_LABEL[instance.rarity]} ${rarityStars(instance.rarity)} / 性格: ${escapeHtml(nature.name)}</div><div class="forge-card-sub">HP ${stats.hp}　MP ${stats.mp}　ATK ${stats.atk}　DEF ${stats.def}　MAG ${stats.mag}　SPD ${stats.spd}</div><div class="forge-card-sub">EXP ${instance.exp} / ${xpNeed}</div><div class="forge-card-sub">特性: ${escapeHtml(traits)}</div><div class="forge-card-sub">技: ${escapeHtml(skillText)}</div><div class="forge-card-sub">${escapeHtml(evoText)}</div><div class="confirm-actions" style="margin-top:8px;">${slotButtons}${active?`<button class="btn-sub companion-unset-btn" data-slot="${slot}">編成解除</button>`:''}${evo?`<button class="btn-highlight companion-evolve-btn" data-id="${escapeHtml(id)}" ${evo.canEvolve?'':'disabled'}>進化</button>`:''}<button class="btn-sub companion-release-btn" data-id="${escapeHtml(id)}">帰す</button></div></div>`;
  }).join('');
  content.innerHTML=`<div class="forge-card"><div class="forge-card-name">編成（最大3体）</div>${partySummary}</div>${cards}`;
  content.querySelectorAll('.companion-slot-btn').forEach(btn=>btn.addEventListener('click',()=>{state.setCompanionSlot(Number(btn.dataset.slot),btn.dataset.id);renderCompanionScreen();}));
  content.querySelectorAll('.companion-unset-btn').forEach(btn=>btn.addEventListener('click',()=>{state.setCompanionSlot(Number(btn.dataset.slot),null);renderCompanionScreen();}));
  content.querySelectorAll('.companion-evolve-btn').forEach(btn=>btn.addEventListener('click',()=>{const c=state.getCompanion(btn.dataset.id),e=state.companionEvolutionInfo?.(btn.dataset.id);if(!c||!e?.canEvolve)return;if(!window.confirm(`${c.instance.nickname||c.species.name}を${e.name}へ進化させますか？`))return;state.evolveCompanion(btn.dataset.id);renderCompanionScreen();}));
  content.querySelectorAll('.companion-release-btn').forEach(btn=>btn.addEventListener('click',()=>{const c=state.getCompanion(btn.dataset.id);if(!c)return;const name=c.instance.nickname||c.species.name;if(!window.confirm(`${name}を帰しますか？`))return;state.releaseCompanion(btn.dataset.id);renderCompanionScreen();}));
}
function installCompanionUI(){const menu=document.querySelector('.home-menu');if(menu&&!document.getElementById('goCompanionBtn')){const btn=document.createElement('button');btn.id='goCompanionBtn';btn.className='menu-card';btn.innerHTML='<span class="menu-icon" aria-hidden="true"></span><span>仲間</span>';menu.appendChild(btn);btn.addEventListener('click',()=>{renderCompanionScreen();showScreen('companionScreen');});}if(!document.getElementById('companionScreen')){const section=document.createElement('section');section.id='companionScreen';section.className='screen';section.innerHTML='<header class="subbar"><button class="btn-back" id="companionBackBtn">←</button><h2>仲間</h2></header><div id="companionContent" class="blacksmith-content"></div>';document.body.insertBefore(section,document.querySelector('.toast'));document.getElementById('companionBackBtn').addEventListener('click',()=>showScreen('homeScreen'));}}
installCompanionUI();
state.companionSpecies=COMPANION_SPECIES;
state.companionPartySize=PARTY_SIZE;
export { renderCompanionScreen, PARTY_SIZE };
