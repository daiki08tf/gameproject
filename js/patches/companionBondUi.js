/* Monster Ranch 1.5 — Bond UI enhancement
   Session 5: カードの実セレクタ（.companion-card[data-companion-id]）に
   追従し、絆Lv3の署名スキル解放を次回解放表示へ反映する。 */
import { state } from '../state.js';
import { bondLabel, BOND_MILESTONES } from './companionBond.js';
import { bondSkillsFor, bondSignatureSkillFor, BOND_SKILL2_LEVEL } from '../data/companionBondSkills.js';

function esc(v){return String(v??'').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#39;');}
function nextUnlock(c,level){
  if(level<BOND_SKILL2_LEVEL){const sig=c?bondSignatureSkillFor({id:c.instance?.id||c.id,speciesId:c.instance?.speciesId,species:c.species,...c.stats,bondLevel:level}):null;return`絆Lv${BOND_SKILL2_LEVEL}：署名技${sig?`『${sig.name}』`:''}`;}
  if(level<4)return`絆Lv4：${BOND_MILESTONES[4]} — 連心撃 / 共鳴波`;
  if(level<6)return'絆Lv6：阿吽';
  if(level<8)return`絆Lv8：${BOND_MILESTONES[8]} — 魂牙 / 魂光`;
  if(level<10)return'絆Lv10：魂の契り';
  return'すべて解放済み';
}
export function refreshBondUi(){
  document.querySelectorAll('#companionContent .companion-card[data-companion-id], .ranch-card[data-id]').forEach(card=>{
    const id=card.dataset.companionId||card.dataset.id,c=state.getCompanion?.(id),bond=state.companionBond?.(id);if(!c||!bond)return;
    card.querySelector('.ranch-bond-info')?.remove();
    const pct=bond.level>=10?100:Math.max(0,Math.min(100,Math.round((bond.exp/Math.max(1,bond.next))*100)));
    const skills=bondSkillsFor({id,speciesId:c.instance?.speciesId,species:c.species,...c.stats,bondLevel:bond.level});
    const skillText=skills.length?skills.map(s=>s.name).join(' / '):'まだ絆技はない';
    const el=document.createElement('div');el.className='ranch-bond-info';el.style.marginTop='7px';
    el.innerHTML=`<div class="forge-card-sub"><strong>Bond Lv.${bond.level} — ${esc(bondLabel(bond.level))}</strong>　同行 ${bond.battles}戦</div><div style="height:6px;border:1px solid rgba(255,255,255,.22);border-radius:4px;overflow:hidden;margin:4px 0 5px;"><div style="height:100%;width:${pct}%;background:currentColor;opacity:.72;"></div></div><div class="forge-card-sub">${bond.level>=10?'MAX':`${bond.exp} / ${bond.next}`}　／　絆技: ${esc(skillText)}</div><div class="forge-card-sub">次の絆: ${esc(nextUnlock(c,bond.level))}</div>`;
    const actions=card.querySelector('.confirm-actions');if(actions)card.insertBefore(el,actions);else card.appendChild(el);
  });
}

document.addEventListener('click',event=>{if(event.target?.closest?.('#goCompanionBtn,.ranch-fav,.ranch-slot,.ranch-board,.ranch-board-buy,.ranch-release,#companionBreedBtn,.companion-slot-btn,.companion-release-btn'))queueMicrotask(refreshBondUi);});
queueMicrotask(refreshBondUi);
