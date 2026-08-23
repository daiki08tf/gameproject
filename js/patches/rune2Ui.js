/* ============================================================
   Progression 2.0 Phase 5 — Rune 2.0 UI patch
   Replaces the legacy blacksmith rune tab content after it renders.
   ============================================================ */

import { state } from '../state.js';
import { RUNE2_DEFS, rune2EffectText } from '../data/runes2.js';

function renderRune2Dashboard() {
  const screen = document.getElementById('blacksmithScreen');
  const content = document.getElementById('blacksmithContent');
  const activeRuneTab = screen?.querySelector('.tab-btn[data-tab="rune"].active');
  if (!content || !activeRuneTab) return;

  const capacity = state.rune2Capacity();
  const used = state.rune2ActiveTotal();
  const remaining = Math.max(0, capacity - used);

  const cards = RUNE2_DEFS.map((r) => {
    const owned = state.rune2OwnedMarks(r.id);
    const active = state.rune2ActiveMarks(r.id);
    const starred = state.rune2Starred(r.id);
    const discovered = !!state.data.rune2Discovered?.[r.id];
    const stageText = r.stageIds.join(' / ');
    const effect = rune2EffectText(r, active || 1);
    const star = r.starAt ? `　★ ${owned >= r.starAt ? '突破済み' : `${owned}/${r.starAt}`}` : '';
    return `
      <div class="forge-card rune2-card" data-rune2="${r.id}">
        <div class="forge-card-top">
          <div class="forge-card-name">${discovered ? r.name : '？？？'} <span class="mastered-badge">${r.english}</span></div>
          <div>所持 ${owned} / 有効 ${active}${starred ? ' ★' : ''}</div>
        </div>
        <div class="forge-card-sub">${discovered ? `${effect}<br>獲得場所：${stageText}　基本Drop ${(r.dropRate*100).toFixed(2)}%${star}` : `未発見　ヒント：Stage ${stageText}`}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px;">
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
      <div class="forge-card-top"><div class="forge-card-name">Rune 2.0 — 永久刻印</div><div>${used.toLocaleString()} / ${capacity.toLocaleString()}</div></div>
      <div class="forge-card-sub">取得したRuneは継承しても消えません。有効化できる総刻数は歴代最高Character Lvと同じ（最大99,999）。旧武器Runeスロットは廃止されました。</div>
    </div>
    <div class="section-heading">刻印一覧</div>
    ${cards}`;

  content.querySelectorAll('[data-rune2]').forEach((card) => {
    const id = card.dataset.rune2;
    const refresh = () => setTimeout(renderRune2Dashboard, 0);
    card.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
      const now = state.rune2ActiveMarks(id);
      state.setRune2ActiveMarks(id, now + Number(btn.dataset.add)); refresh();
    }));
    card.querySelector('[data-max]')?.addEventListener('click', () => { state.setRune2ActiveMarks(id, state.rune2OwnedMarks(id)); refresh(); });
    card.querySelector('[data-remove]')?.addEventListener('click', () => { state.setRune2ActiveMarks(id, Math.max(0, state.rune2ActiveMarks(id) - 1)); refresh(); });
    card.querySelector('[data-clear]')?.addEventListener('click', () => { state.setRune2ActiveMarks(id, 0); refresh(); });
  });
}

// blacksmith.js owns the original tab listener. Run after its synchronous render.
document.querySelectorAll('#blacksmithScreen .tab-btn[data-tab="rune"]').forEach((btn) => {
  btn.addEventListener('click', () => setTimeout(renderRune2Dashboard, 0));
});

export { renderRune2Dashboard };
