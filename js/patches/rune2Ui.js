/* ============================================================
   Progression 2.0 Phase 5 — Rune 2.0 UI patch
   Replaces the legacy blacksmith rune tab content after it renders.
   ============================================================ */

import { state } from '../state.js';
import { RUNE2_DEFS, rune2EffectText, runeSourceLabel } from '../data/runes2.js';

function renderRune2Dashboard() {
  const screen = document.getElementById('blacksmithScreen');
  const content = document.getElementById('blacksmithContent');
  const activeRuneTab = screen?.querySelector('.tab-btn[data-tab="rune"].active');
  if (!content || !activeRuneTab) return;

  const capacity = state.rune2Capacity();
  const used = state.rune2ActiveTotal();
  const totalOwned = RUNE2_DEFS.reduce((sum, rune) => sum + state.rune2OwnedMarks(rune.id), 0);
  const remaining = Math.max(0, capacity - used);

  const cards = RUNE2_DEFS.map((r) => {
    const owned = state.rune2OwnedMarks(r.id);
    const active = state.rune2ActiveMarks(r.id);
    const starred = state.rune2Starred(r.id);
    const discovered = !!state.data.rune2Discovered?.[r.id];
    const stageText = runeSourceLabel(r);
    const effect = rune2EffectText(r, active || 1);
    const forgeOne = state.rune2ForgeCost(r.id, 1);
    const canForge = discovered && forgeOne.levels > 0 && state.data.gold >= forgeOne.gold && state.data.manastone >= forgeOne.manastone;
    const star = r.starAt ? `　★ ${owned >= r.starAt ? '突破済み' : `${owned}/${r.starAt}`}` : '';
    return `
      <div class="forge-card rune2-card" data-rune2="${r.id}">
        <div class="forge-card-top">
          <div class="forge-card-name">${discovered ? r.name : '？？？'} <span class="mastered-badge">${r.english}</span></div>
          <div>Lv ${owned}/${r.maxMarks} / 有効 ${active}${starred ? ' ★' : ''}</div>
        </div>
        <div class="forge-card-sub">${discovered ? `${effect}<br>獲得場所：${stageText}　初回Drop ${(r.dropRate*100).toFixed(2)}%${star}<br>${forgeOne.levels ? `次の強化：${forgeOne.gold.toLocaleString()} Gold / 魔石 ${forgeOne.manastone}` : '最大Lv到達'}` : `未発見　ヒント：${stageText}で実ドロップ`}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
          <button class="forge-card-btn" data-forge="1" ${canForge ? '' : 'disabled'}>強化+1</button>
          <button class="forge-card-btn" data-add="1" ${owned <= active || remaining <= 0 ? 'disabled' : ''}>+1</button>
          <button class="forge-card-btn" data-add="10" ${owned <= active || remaining <= 0 ? 'disabled' : ''}>+10</button>
          <button class="forge-card-btn" data-max ${owned <= active || remaining <= 0 ? 'disabled' : ''}>MAX</button>
          <button class="forge-card-btn" data-remove="1" ${active <= 0 ? 'disabled' : ''}>-1</button>
          <button class="forge-card-btn" data-clear ${active <= 0 ? 'disabled' : ''}>0</button>
        </div>
      </div>`;
  }).join('');

  content.innerHTML = `
    <div class="forge-card">
      <div class="forge-card-top"><div class="forge-card-name">Rune 2.1 — 章別永久刻印</div><div>総Lv ${totalOwned.toLocaleString()}</div></div>
      <div class="forge-card-sub">有効 ${used.toLocaleString()} / 容量 ${capacity.toLocaleString()}　（残り ${remaining.toLocaleString()}）<br>各章の戦闘後に初回Runeが実ドロップします。入手後はGoldと魔石で強化します。章クリアだけでは解放されません。</div>
    </div>
    <div class="section-heading">刻印一覧</div>
    ${cards}`;

  content.querySelectorAll('[data-rune2]').forEach((card) => {
    const id = card.dataset.rune2;
    const refresh = () => setTimeout(renderRune2Dashboard, 0);
    card.querySelector('[data-forge]')?.addEventListener('click', () => {
      state.forgeRune2(id, Number(card.querySelector('[data-forge]').dataset.forge));
      const badge = document.getElementById('manastoneText');
      if (badge) badge.textContent = `魔石 ${state.data.manastone}`;
      refresh();
    });
    card.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
      const now = state.rune2ActiveMarks(id);
      state.setRune2ActiveMarks(id, now + Number(btn.dataset.add)); refresh();
    }));
    card.querySelector('[data-max]')?.addEventListener('click', () => { state.setRune2ActiveMarks(id, state.rune2OwnedMarks(id)); refresh(); });
    card.querySelector('[data-remove]')?.addEventListener('click', () => { state.setRune2ActiveMarks(id, Math.max(0, state.rune2ActiveMarks(id) - 1)); refresh(); });
    card.querySelector('[data-clear]')?.addEventListener('click', () => { state.setRune2ActiveMarks(id, 0); refresh(); });
  });
}

// blacksmith.js's renderBlacksmith() calls renderRune2Dashboard() directly for
// the "rune" tab (no more setTimeout race against a legacy renderer here).
export { renderRune2Dashboard };
