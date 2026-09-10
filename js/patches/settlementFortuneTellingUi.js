/* Settlement Future Ideas #6 — Fortune-telling UI card. */
import { state } from '../state.js';

function render(){
  const root = document.getElementById('settlementContent');
  if (!root || root.querySelector('[data-settlement-fortune]')) return;
  if (!state.settlementFortuneUnlocked?.()) return;
  const cost = state.settlementFortuneCost?.() || 0;
  const section = document.createElement('section');
  section.dataset.settlementFortune = 'true';
  section.style.marginTop = '14px';
  section.innerHTML = `<details class="forge-card"><summary>占い師</summary><div class="forge-card-sub" style="margin:8px 0;">宿の奥に座る占い師は、旅の記録から次に進むべき道を読み解く。新しい仕組みは増えない——既存の道標を、少し違う言葉で語るだけだ。</div><div data-settlement-fortune-reading class="forge-card-sub"></div><button class="forge-card-btn settlement-fortune-draw">占ってもらう（Gold ${cost}）</button></details>`;
  root.appendChild(section);
  const btn = section.querySelector('.settlement-fortune-draw');
  const out = section.querySelector('[data-settlement-fortune-reading]');
  btn.addEventListener('click', () => {
    const r = state.drawSettlementFortune?.();
    if (!r?.ok) {
      out.textContent = '今はゴールドが足りない。';
      return;
    }
    out.innerHTML = `${r.reading.flavor}<br><strong>${r.reading.title}</strong>——${r.reading.reason}`;
  });
}

function install(){
  if (typeof document === 'undefined') return;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!root.querySelector('[data-settlement-fortune]')) queueMicrotask(render);
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
