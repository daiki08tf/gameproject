/* ============================================================
   Living World & Discovery C3 — Fish Codex entry inside the
   existing Monster Codex screen (no new Codex surface/screen).
   ============================================================ */
import { state } from '../state.js';
import './fishing.js'; // guarantees state.fishCodex()/fishCodexSummary()/fishCodexBonuses() exist
import { fishStatBonus } from '../data/fishing.js';

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

// Each fish's own contribution grows with how many you've caught, capped
// per fish (see FISH_STAT_BONUS_BY_RARITY in js/data/fishing.js) -- so the
// catch log doubles as the bonus breakdown instead of a separate checklist.
function fishRow(f) {
  if (!f.seen) return `<div class="forge-card-sub" style="margin:4px 0;">${f.master ? 'ヌシ：' : ''}？？？</div>`;
  const bonus = fishStatBonus(f, f.caught);
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(f.name)}</b>${f.master ? '（ヌシ）' : ''} ×${f.caught}　全基礎ステータス +${bonus.bonusPct.toFixed(2)}%${bonus.capped ? '（上限）' : ` （${bonus.effective}/${bonus.cap}匹）`}<br>${escapeHtml(f.flavor)}</div>`;
}

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-fish-codex]')) return;
  const fish = state.fishCodex?.() || [];
  const summary = state.fishCodexSummary?.() || { seen: 0, total: fish.length, mastersSeen: 0, mastersTotal: 0 };
  const bonuses = state.fishCodexBonuses?.() || { allStatMult: 1, bonusPct: 0 };
  const box = document.createElement('section');
  box.dataset.fishCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">FISH ${summary.seen}/${summary.total}（ヌシ ${summary.mastersSeen}/${summary.mastersTotal}）</div><div class="sub">現在の永続ボーナス：全基礎ステータス +${bonuses.bonusPct.toFixed(2)}%（同じ魚を釣るほど伸びる。各魚に個別の上限あり）</div><details class="ui-detail-disclosure" style="margin-top:6px;" open><summary>釣果記録・ボーナス内訳</summary><div class="ui-detail-body">${fish.map(fishRow).join('')}</div></details>`;
  const heading = [...root.querySelectorAll('h3')].find((h) => h.textContent?.includes('魔物一覧')) || root.querySelector('h3');
  root.insertBefore(box, heading || root.firstChild?.nextSibling || null);
}

document.getElementById('goMonsterCodexBtn')?.addEventListener('click', () => queueMicrotask(render));
if (typeof MutationObserver !== 'undefined') {
  const root = document.getElementById('monsterCodexContent');
  if (root) new MutationObserver(() => { if (root.childElementCount && !root.querySelector('[data-fish-codex]')) queueMicrotask(render); }).observe(root, { childList: true });
}
render();
export { render as renderFishCodex };
