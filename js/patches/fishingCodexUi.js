/* ============================================================
   Living World & Discovery C3 — Fish Codex entry inside the
   existing Monster Codex screen (no new Codex surface/screen).
   ============================================================ */
import { state } from '../state.js';
import './fishing.js'; // guarantees state.fishCodex()/fishCodexSummary()/fishCodexBonuses() exist
import { fishStatBonus } from '../data/fishing.js';

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

const STAT_LABEL = { hp: 'HP', mp: 'MP', atk: 'ATK', def: 'DEF', mag: 'MAG', spd: 'SPD' };

// Each fish's own contribution grows with how many you've caught -- no cap
// -- and only feeds that ONE fish's own statTarget (see
// FISH_STAT_BONUS_BY_RARITY / fish.statTarget in js/data/fishing.js), so
// the catch log doubles as the bonus breakdown instead of a separate
// discovery checklist.
function fishRow(f) {
  if (!f.seen) return `<div class="forge-card-sub" style="margin:4px 0;">${f.master ? 'ヌシ：' : ''}？？？</div>`;
  const bonus = fishStatBonus(f, f.caught);
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(f.name)}</b>${f.master ? '（ヌシ）' : ''} ×${f.caught}　${STAT_LABEL[bonus.stat] || bonus.stat} +${bonus.bonusPct.toFixed(2)}%<br>${escapeHtml(f.flavor)}</div>`;
}

function byStatSummaryLine(byStat) {
  const parts = Object.entries(byStat).filter(([, v]) => v > 0).map(([k, v]) => `${STAT_LABEL[k] || k} +${v.toFixed(2)}%`);
  return parts.length ? parts.join(' / ') : 'まだボーナスなし';
}

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-fish-codex]')) return;
  const fish = state.fishCodex?.() || [];
  const summary = state.fishCodexSummary?.() || { seen: 0, total: fish.length, mastersSeen: 0, mastersTotal: 0 };
  const bonuses = state.fishCodexBonuses?.() || { byStat: {}, totalPct: 0 };
  const box = document.createElement('section');
  box.dataset.fishCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">FISH ${summary.seen}/${summary.total}（ヌシ ${summary.mastersSeen}/${summary.mastersTotal}）</div><div class="sub">現在の永続ボーナス：${escapeHtml(byStatSummaryLine(bonuses.byStat))}（合計 +${bonuses.totalPct.toFixed(2)}%）<br>同じ魚を釣るほど、その魚の対応ステータスが上限なく伸びる。</div><details class="ui-detail-disclosure" style="margin-top:6px;" open><summary>釣果記録・ボーナス内訳</summary><div class="ui-detail-body">${fish.map(fishRow).join('')}</div></details>`;
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
