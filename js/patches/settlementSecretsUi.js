import { state } from '../state.js';

function rewardText(gained={}){return Object.entries(gained).filter(([,v])=>v>0).map(([k,v])=>`${k} +${v}`).join(' / ');}
function facilityCard(facility){return `<div class="forge-card" data-settlement-secret-facility="${facility.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${facility.discovered?facility.icon:'❔'} ${facility.discovered?facility.name:'???'}</div><strong>${facility.discovered?'DISCOVERED':'SECRET'}</strong></div><div class="forge-card-sub">${facility.discovered?`${facility.area} ／ ${facility.desc}`:'探索・住民・実績を重ねると、街の隠された区画が見つかる。'}</div></div>`;}
function questCard(quest){
 if(!quest.unlocked)return'';
 const current=quest.current,done=quest.completed,pending=quest.pending;
 const status=done?'COMPLETE':pending?'BOSS READY':`STEP ${Math.min(quest.stage+1,quest.stages.length)}/${quest.stages.length}`;
 const body=done?'秘密クエスト完了。':pending?`${pending.name}との遭遇準備が整っている。戦闘解決は既存バトル側へ渡す。`:current?.text||'';
 const action=done?'完了':pending?'遭遇待機中':current?.encounter?'遭遇地点を開く':'調査を進める';
 return `<div class="forge-card" data-settlement-secret-quest="${quest.id}" style="padding:10px 12px;"><div class="forge-card-top"><div class="forge-card-name">${quest.icon} ${quest.name}</div><strong>${status}</strong></div><div class="forge-card-sub">${body}</div>${!done&&!pending&&current?`<div class="forge-card-sub" style="margin-top:5px;">次：${current.title}</div>`:''}<button class="forge-card-btn settlement-secret-advance" data-quest="${quest.id}" ${done||pending?'disabled':''} style="margin-top:8px;">${action}</button></div>`;
}
export function renderSettlementSecrets(){
 const root=document.getElementById('settlementContent');if(!root||root.querySelector('[data-settlement-secrets]'))return;
 const facilities=state.settlementHiddenFacilities?.()||[],quests=state.settlementSecretQuests?.()||[],summary=state.settlementSecretSummary?.()||{facilities:0,totalFacilities:facilities.length,quests:0,totalQuests:quests.length};
 const visible=facilities.some(x=>x.discovered);if(!visible)return;
 const section=document.createElement('section');section.dataset.settlementSecrets='true';section.style.marginTop='14px';
 section.innerHTML=`<details class="forge-card"><summary>🔐 隠し施設 ${summary.facilities}/${summary.totalFacilities} ／ Secret Quest ${summary.quests}/${summary.totalQuests}</summary><div class="forge-card-sub" style="margin:8px 0;">S9探索と既存住民・Codex/Boss実績から発見される街の秘密。新通貨や日課は使わない。</div><div style="display:grid;gap:8px;">${facilities.map(facilityCard).join('')}</div><div style="display:grid;gap:8px;margin-top:8px;">${quests.map(questCard).join('')}</div></details>`;
 root.appendChild(section);
 section.querySelectorAll('.settlement-secret-advance').forEach(btn=>btn.addEventListener('click',()=>{const r=state.advanceSettlementSecretQuest?.(btn.dataset.quest);if(!r?.ok)return;const reward=rewardText(r.gained);alert(`${r.quest.icon} ${r.quest.name}\n${r.step.title}\n${r.step.text}${r.pendingEncounter?`\n遭遇: ${r.encounter.name}`:''}${reward?`\n獲得: ${reward}`:''}`);section.remove();renderSettlementSecrets();}));
}
function install(){if(typeof document==='undefined')return;const root=document.getElementById('settlementContent');if(!root)return;if(typeof MutationObserver!=='undefined'){const observer=new MutationObserver(()=>{if(!root.querySelector('[data-settlement-secrets]'))queueMicrotask(renderSettlementSecrets);});observer.observe(root,{childList:true});}queueMicrotask(renderSettlementSecrets);}
install();
