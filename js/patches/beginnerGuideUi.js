/*
 * 旅の手引き UI（EXP-2）— ホームの主ボタン直下に、第1章のあいだだけ出す。
 * 判定は js/data/beginnerGuide.js の純粋関数。ここは既存状態を読んで渡すだけで、
 * セーブにも進行にも触れない。手引きが出ている間は、同じ場所にある終盤向けの
 * 案内カード（Lv 3,000 以降の話）を隠す。
 * 描画は endgameGuidanceUi.js と同じく #homeScreen の class 変化で行い、
 * 書き込みは内容が変わったときだけ（冪等）。
 */
import { state } from '../state.js';
import { getConsumable } from '../data/consumables.js';
import { beginnerGuideProgress } from '../data/beginnerGuide.js';

function context() {
  const eq = state.data.equipped || {};
  const enhance = Object.values(state.data.weaponEnhance || {}).reduce((m, v) => Math.max(m, Number(v) || 0), 0);
  const heal = (state.ownedConsumables?.() || []).reduce((n, c) => n + (getConsumable(c.id)?.effect?.kind === 'heal' ? Number(c.count) || 0 : 0), 0);
  return {
    cleared: (id) => state.isStageCleared(id),
    equippedArmor: ['shield', 'head', 'body', 'accessory1', 'accessory2'].filter((slot) => !!eq[slot]).length,
    maxEnhance: enhance,
    healItems: heal,
  };
}

export function renderBeginnerGuide() {
  const menu = document.querySelector('#homeScreen .home-menu');
  if (!menu) return;
  const progress = beginnerGuideProgress(context());
  let card = menu.querySelector('[data-beginner-guide]');
  if (menu.classList.contains('beginner-guide-active') !== progress.active) menu.classList.toggle('beginner-guide-active', progress.active);
  if (!progress.active) { if (card) card.remove(); return; }
  if (!card) {
    card = document.createElement('button');
    card.type = 'button';
    card.className = 'beginner-guide-card';
    card.dataset.beginnerGuide = 'true';
    card.addEventListener('click', () => { document.getElementById(card.dataset.targetButton)?.click(); });
    const anchor = menu.querySelector('.home-primary-action') || menu.querySelector('#goStageBtn');
    if (anchor) anchor.after(card); else menu.prepend(card);
  }
  const next = progress.next;
  const html = `<span class="beginner-guide-kicker">旅の手引き ${progress.doneCount}/${progress.total}</span>`
    + `<strong>${next ? next.label : '手引き完了'}</strong>`
    + (next ? `<span class="beginner-guide-hint">${next.hint}</span>` : '')
    + `<span class="beginner-guide-steps">${progress.steps.map((s) => `<i class="${s.done ? 'done' : s === next ? 'next' : ''}"></i>`).join('')}</span>`;
  if (card.dataset.rendered !== html) { card.innerHTML = html; card.dataset.rendered = html; }
  const target = next?.target || 'goStageBtn';
  if (card.dataset.targetButton !== target) card.dataset.targetButton = target;
}

queueMicrotask(renderBeginnerGuide);
const home = document.getElementById('homeScreen');
if (home) new MutationObserver(() => { if (home.classList.contains('active')) renderBeginnerGuide(); }).observe(home, { attributes: true, attributeFilter: ['class'] });
