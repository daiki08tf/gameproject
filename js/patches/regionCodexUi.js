/* ============================================================
   Living World & Discovery C8-1 — Region Codex entry inside the
   existing Monster Codex screen (no new Codex surface/screen).
   Aggregates existing Fishing/Archaeology/Treasure Hunt/fauna data
   per region -- see data/regionCodex.js for the full rationale.
   ============================================================ */
import { state } from '../state.js';
import './regionCodexResearch.js';
import { companionDiscoveryReaction } from '../data/companionDiscoveryReactions.js';
import './regionCodex.js'; // guarantees state.regionCodexList() exists

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }

// C8-2: boss/hidden-threat identity. A boss/threat not yet unlocked keeps
// its `name` withheld (null, set in data/regionCodex.js) -- shown as
// '???', matching chapterSelect.js's own convention, never spoiling story
// content ahead of the player's own progress.
function bossLine(bosses) {
  if (!bosses.length) return null;
  const cleared = bosses.filter((b) => b.cleared).length;
  const next = bosses.find((b) => !b.cleared);
  const nextText = next ? `　次: ${escapeHtml(next.name ?? '???')}` : '';
  return `主脅威 討伐 ${cleared}/${bosses.length}${nextText}`;
}
function hiddenThreatLine(hiddenThreats) {
  if (!hiddenThreats.length) return null;
  const cleared = hiddenThreats.filter((h) => h.cleared).length;
  return `隠し脅威 討伐 ${cleared}/${hiddenThreats.length}`;
}

// 地域研究（B1）：地域の記録を「埋める理由のある帳面」にする。課題は既存の記録から自動判定。
const MATERIAL_LABEL = Object.freeze({ wood: '古木', ore: '鉱石', hide: '魔獣皮', veilstone: '境界石', gold: 'Gold' }); // 拠点画面と同じ呼び名
function rewardText(reward = {}) { return Object.entries(reward).filter(([, v]) => v > 0).map(([k, v]) => `${MATERIAL_LABEL[k] || k} +${v}`).join(' / '); }
function researchHtml(regionId) {
  const row = (state.regionResearchList?.() || []).find((r) => r.regionId === regionId);
  if (!row || !row.total) return '';
  const tasks = row.tasks.map((t) => `<div class="region-research-task${t.done ? ' done' : ''}">${t.done ? '✓' : '○'} ${escapeHtml(t.label)}${t.progress && !t.done ? `（${escapeHtml(t.progress)}）` : ''}</div>`).join('');
  const tiers = row.tiers.map((t) => {
    const state_ = t.claimed ? '受け取り済み' : t.reached ? '' : `あと${t.need - row.done}件`;
    const button = t.reached && !t.claimed ? `<button type="button" class="btn-sub region-research-claim" data-region="${regionId}" data-tier="${t.tier}">受け取る</button>` : `<span class="region-research-state">${state_}</span>`;
    return `<div class="region-research-tier" data-research-tier="${regionId}:${t.tier}"><span>${escapeHtml(t.label)}（${t.need}件）：${escapeHtml(rewardText(t.reward))}</span>${button}</div>`;
  }).join('');
  return `<details class="region-research"><summary>研究課題 ${row.done}/${row.total}</summary>${tasks}${tiers}</details>`;
}

function regionCard(bundle) {
  const { region, faunaSeen, faunaTotal, fishingSpot, fishSeen, fishTotal, archaeologySite, treasureHunts, bosses, hiddenThreats, rareSeen, rareTotal, runesOwned, runesTotal, uniques } = bundle;
  const lines = [];
  lines.push(`既知の生物 ${faunaSeen}/${faunaTotal}`);
  if (fishingSpot) lines.push(`釣果（${escapeHtml(fishingSpot.name)}） ${fishSeen}/${fishTotal}`);
  if (archaeologySite) lines.push(`発掘記録（${escapeHtml(archaeologySite.name)}） ${archaeologySite.foundCount}/${archaeologySite.totalCount}${archaeologySite.recordUnlocked ? '（記録復元済み）' : ''}`);
  const resolvedHunts = treasureHunts.filter((h) => h.stage === 'resolved').length;
  if (treasureHunts.length) lines.push(`宝探し ${resolvedHunts}/${treasureHunts.length}`);
  const boss = bossLine(bosses || []);
  if (boss) lines.push(boss);
  const hiddenThreat = hiddenThreatLine(hiddenThreats || []);
  if (hiddenThreat) lines.push(hiddenThreat);
  if (rareTotal) lines.push(`レア個体 遭遇 ${rareSeen}/${rareTotal}`);
  if (runesTotal) lines.push(`ルーン 入手 ${runesOwned}/${runesTotal}`);
  // 地域固有装備：入手するまで名前は伏せ、どの章で狙えるかだけ示す（Boss 名を伏せるのと同じ流儀）
  for (const u of uniques || []) {
    const range = `${u.huntChapters[0]}〜${u.huntChapters[1]}章の巡回・レア個体`;
    lines.push(u.owned ? `固有装備 ${escapeHtml(u.name)}（入手済み）` : `固有装備 ？？？（${range}で狙える）`);
  }
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(region.name)}</b>　${escapeHtml(region.subtitle)}<br>${lines.join('　/　')}</div>${researchHtml(region.id)}`;
}

function render() {
  const root = document.getElementById('monsterCodexContent');
  if (!root || root.querySelector('[data-region-codex]')) return;
  const bundles = state.regionCodexList?.() || [];
  if (!bundles.length) return;
  const box = document.createElement('section');
  box.dataset.regionCodex = '1';
  box.className = 'forge-card';
  box.innerHTML = `<div class="forge-card-name">地域の記録</div><div class="sub">生物・釣果・発掘・宝探し・主脅威・レア個体・ルーン ―― この地で分かっていることを、地域ごとにまとめて確認できる。</div>${bundles.map(regionCard).join('')}`;
  // C6-8 の続き：縄張り型の仲間を連れていると、地域の記録に一言添える（文章だけ）
  const reaction = companionDiscoveryReaction('region', state.activeCompanions?.() || []);
  if (reaction) { const line = document.createElement('div'); line.className = 'forge-card-sub'; line.dataset.regionCodexReaction = '1'; line.textContent = reaction.text; box.appendChild(line); }
  // 受け取りは押したボタンの行だけを書き換える（節全体は作り直さない＝監視に対して冪等）
  box.addEventListener('click', (event) => {
    const btn = event.target?.closest?.('.region-research-claim');
    if (!btn) return;
    const got = state.claimRegionResearch?.(btn.dataset.region, btn.dataset.tier);
    if (!got) return;
    const note = document.createElement('span');
    note.className = 'region-research-state';
    note.textContent = `受け取った：${rewardText(got.gained)}`;
    btn.replaceWith(note);
  });
  const heading = [...root.querySelectorAll('h3')].find((h) => h.textContent?.includes('魔物一覧')) || root.querySelector('h3');
  root.insertBefore(box, heading || root.firstChild?.nextSibling || null);
}

// Same "safe direct listener" reasoning as archaeologyCodexUi.js -- this
// file is only ever imported from within homeNavigation.js's own import
// list, after codexUi.js has already created #goMonsterCodexBtn/
// #monsterCodexContent synchronously.
document.getElementById('goMonsterCodexBtn')?.addEventListener('click', () => queueMicrotask(render));
if (typeof MutationObserver !== 'undefined') {
  const root = document.getElementById('monsterCodexContent');
  if (root) new MutationObserver(() => { if (root.childElementCount && !root.querySelector('[data-region-codex]')) queueMicrotask(render); }).observe(root, { childList: true });
}
render();
export { render as renderRegionCodex };
