import { state } from '../state.js';
import { getItem, RARITY, rarityIndex } from '../data/equipment.js';
import { describeAffix } from '../data/affixes.js';
import { getRune } from '../data/runes.js';
import { getRune2 } from '../data/runes2.js';
import { equipment3Presentation, equipment3MetaText, equipment3SpecialLines, equipment3DropHeadline } from '../data/equipment3Presentation.js';

function resolveDrop(itemId) {
  const item = getItem(itemId);
  if (item) {
    const isWeaponInstance = state.isWeaponInstance(itemId);
    const isGearInstance = state.isGearInstance?.(itemId) || false;
    const isInstance = isWeaponInstance || isGearInstance;
    const legacyAffixes = isWeaponInstance ? state.weaponInstanceAffixes(itemId) : [];
    const inst = isInstance
      ? (state.equipmentInstance?.(itemId) || state.data.weaponInstances?.[itemId] || state.data.gearInstances?.[itemId] || null)
      : null;
    const p = equipment3Presentation(item, inst);
    if (p && isWeaponInstance && inst && p.affixes.length === 0 && legacyAffixes.length > 0) {
      p.affixes = legacyAffixes.map((a) => {const d = describeAffix(a);return {id:a.id,name:d.name,desc:d.desc,rarity:a.rarity,rarityLabel:a.rarity,greater:!!a.greater,roll:a.roll};});
    }
    const stars = '★'.repeat(rarityIndex(item.rarity));
    let name = `${item.unique ? '◆ UNIQUE ' : ''}${stars ? stars + ' ' : ''}${p?.name || item.name}`;
    const lines = [];
    const meta = equipment3MetaText(p);
    if (meta) lines.push(`⚙ ${meta}`);
    if (!item.unique && inst) {
      if (p.affixes.length) for (const a of p.affixes) lines.push(`${a.greater ? '★ ' : ''}[${a.rarityLabel}] ${a.name}: ${a.desc}`);
      else lines.push('⚙ オプションなし');
      lines.push(...equipment3SpecialLines(p));
    }
    if (item.unique && item.lore) lines.push(`「${item.lore}」`);
    if (lines.length) name += `\n${lines.join('\n')}`;
    return {name,color:RARITY[item.rarity].color,equipment3:p,headline:equipment3DropHeadline(p)};
  }
  const rune = getRune(itemId);
  if (rune) return { name: `✨ ${rune.name}`, color: 'var(--accent)', equipment3: null, headline: null };
  return { name: itemId, color: '', equipment3: null, headline: null };
}

function appendDropChip(itemsEl, resolved) {
  const wrap = document.createElement('div');wrap.className = `result-drop-wrap${resolved.equipment3 ? ` eq3-${resolved.equipment3.quality}` : ''}`;
  if (resolved.headline) {const headline=document.createElement('div');headline.className='result-loot-headline';headline.textContent=resolved.headline;wrap.appendChild(headline);}
  const chip=document.createElement('div');chip.className='result-item-chip';chip.style.color=resolved.color;chip.style.whiteSpace='pre-line';chip.textContent=resolved.name;wrap.appendChild(chip);itemsEl.appendChild(wrap);
}

function renderLoot3Chase(result, itemsEl) {
  const chase=result?.loot3Chase;if(!chase)return;
  const wrap=document.createElement('div');wrap.className='result-drop-wrap eq3-special';
  const headline=document.createElement('div');headline.className='result-loot-headline';headline.textContent='――TARGET FARM BONUS――';wrap.appendChild(headline);
  const chip=document.createElement('div');chip.className='result-item-chip';chip.style.whiteSpace='pre-line';
  if(chase.type==='relicResonance') chip.textContent=`☀ RELIC RESONANCE — ${chase.name}\n解放資源 +${chase.gold.toLocaleString()} Gold / +${chase.manastone} 魔石`;
  else if(chase.type==='uniqueEcho') chip.textContent=`🔥 UNIQUE ECHO — ${chase.name}\n試練残響 ${chase.echoes}/${chase.maxEchoes}（初期試練を最大25%補助）`;
  else chip.textContent='TARGET FARM BONUS';
  wrap.appendChild(chip);itemsEl.appendChild(wrap);
}

function renderWorldEvent(result,itemsEl){
  const event=result?.world2?.event;
  if(!event)return;
  const card=document.createElement('div');card.className='stage-card branch';card.style.cssText='margin-top:12px;display:block';
  const head=document.createElement('div');head.innerHTML=`<div class="name">探索イベント — ${event.name}</div><div class="rec">${event.text||'旅の途中で何かを見つけた。'}</div>`;card.appendChild(head);
  const actions=document.createElement('div');actions.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-top:8px';
  (event.choices||[]).forEach((label,index)=>{const btn=document.createElement('button');btn.className=index===0?'btn-main':'btn-sub';btn.textContent=label;btn.addEventListener('click',()=>{const resolved=state.world2ResolveEvent?.(event.id,index);actions.innerHTML='';const line=document.createElement('div');line.className='rec';if(resolved?.ok){const r=resolved.result||{};const gains=[r.gold?`Gold +${r.gold}`:'',r.keyFragments?`鍵片 +${r.keyFragments}`:''].filter(Boolean).join(' / ');line.textContent=`${r.hint||'選択した。'}${r.discovery?`　【発見：${r.discovery}】`:''}${gains?`　${gains}`:''}`;}else line.textContent='この出来事はすでに解決している。';card.appendChild(line);});actions.appendChild(btn);});
  card.appendChild(actions);itemsEl.appendChild(card);
}

export function renderResult(result) {
  const title=document.getElementById('resultTitle'),stats=document.getElementById('resultStats'),itemsEl=document.getElementById('resultItems');
  if(result.retreated){title.textContent='RETREAT';title.style.color='#b9c0cc';}else if(result.bountyUnique){title.textContent='BOUNTY CLEARED — UNIQUE FOUND';title.style.color='#f2c94c';}else if(result.bountyNemesis?.grew){title.textContent=`DEFEATED — ${result.bountyNemesis.title || 'NEMESIS'}`;title.style.color='#e6425a';}else if(result.cleared){title.textContent='STAGE CLEAR';title.style.color='';}else{title.textContent='DEFEATED...';title.style.color='#e6425a';}
  stats.textContent=`獲得経験値: ${result.expGained} / 獲得ゴールド: ${result.goldGained}`+(result.world2?.fragment?` / 鍵片 +${result.world2.fragment}`:'')+(result.world2?.keyDungeon?` / 境界鍵路報酬 鍵片 +${result.world2.keyDungeon.keyFragments}`:'')+(result.bounty2?` / 賞金首の証 +${result.bounty2.marks}（所持 ${result.bounty2.totalMarks}）`:'')+(result.bounty2?.nemesisDefeated?' / 宿敵討伐ボーナス！':'')+(result.bountyNemesis?.grew?` / 宿敵Lv.${result.bountyNemesis.level}へ成長`:'')+(result.cleared?'':'（撃破分のみ・レベルや装備は失われません）');
  itemsEl.innerHTML='';
  const normalItems=Array.isArray(result.items)?result.items:[],rune2Drops=Array.isArray(result.rune2Drops)?result.rune2Drops:[];
  if(normalItems.length===0&&rune2Drops.length===0&&!result.world2?.event&&!result.loot3Chase)itemsEl.innerHTML='<span class="hint" style="opacity:.6;font-size:12px;">ドロップなし</span>';
  else{
    for(const itemId of normalItems)appendDropChip(itemsEl,resolveDrop(itemId));
    for(const drop of rune2Drops){const rune=getRune2(drop.id);if(!rune)continue;const chip=document.createElement('div');chip.className='result-item-chip';chip.style.color='var(--accent)';chip.textContent=`✨ RUNE ${rune.name} +${drop.amount}刻（${drop.owned}刻）`;itemsEl.appendChild(chip);}
  }
  renderLoot3Chase(result,itemsEl);
  renderWorldEvent(result,itemsEl);
  const equipBtn=document.getElementById('resultEquipBtn');equipBtn.classList.toggle('hidden',normalItems.length===0);
  attachScrollHint(stats);
}

function attachScrollHint(afterEl) {
  const panel=afterEl.closest('.panel');if(!panel)return;
  requestAnimationFrame(()=>{panel.querySelector('.scroll-hint')?.remove();if(panel.scrollHeight>panel.clientHeight+2){const hint=document.createElement('div');hint.className='scroll-hint';hint.textContent='▼ 下にスクロールできます';afterEl.after(hint);}});
}
