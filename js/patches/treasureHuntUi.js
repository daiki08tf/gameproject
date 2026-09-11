/* ============================================================
   Living World & Discovery C5 — Treasure Hunt 2.0 UI (Settlement
   screen)
   ------------------------------------------------------------
   The Rumor/clue/decoded half of the chain already renders for
   free in the existing Rumor Notebook (see treasureHunt.js). This
   file only needs to surface the final step -- claiming a find
   once its clue has decoded -- as one compact card next to
   Archaeology. Lives inside the existing Settlement screen -- no
   new screen, no new Home button. Follows the same idempotent-
   append pattern as archaeologyUi.js/fishingUi.js.
   ============================================================ */
import { state } from '../state.js';
import './treasureHunt.js'; // guarantees state.treasureHunts()/claimTreasureHunt() exist
import './fieldKnowledge.js'; // guarantees state.treasureHuntFieldNote() exists

function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;'); }
function rewardText(gained = {}) { return Object.entries(gained).filter(([, v]) => v > 0).map(([k, v]) => `${k} +${v}`).join(' / '); }

function huntCard(hunt) {
  if (hunt.stage === 'locked') {
    return `<div class="forge-card-sub" style="margin:4px 0;">？？？（LOCKED） その地域の冒険を進めると、噂帳に手掛かりが現れる。</div>`;
  }
  if (hunt.stage === 'resolved') {
    // C9-1: a field note (flavor only, never a gate) appended once the
    // player has genuinely fought through roughly half this chain's
    // region's own native creatures -- see data/fieldKnowledge.js.
    const fieldNote = state.treasureHuntFieldNote?.(hunt.id);
    return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(hunt.name)}</b>　発見済み<br>${escapeHtml(hunt.resolutionText)}${fieldNote ? `<br><span class="hint">${escapeHtml(fieldNote)}</span>` : ''}</div>`;
  }
  if (hunt.stage === 'ready') {
    return `<div class="forge-card-sub" style="margin:4px 0;" data-treasure-hunt-card="${hunt.id}"><b>${escapeHtml(hunt.name)}</b>　解読済み<br>${escapeHtml(hunt.decodedText)}<br><button class="forge-card-btn treasure-hunt-claim" data-hunt="${hunt.id}" style="margin-top:6px;">掘り当てる</button></div>`;
  }
  // unresolved / tracking -- progress is visible, but the payoff isn't
  // claimable yet; the full text already lives in the Rumor Notebook, so
  // this stays a one-line status rather than duplicating it.
  return `<div class="forge-card-sub" style="margin:4px 0;"><b>${escapeHtml(hunt.name)}</b>　${escapeHtml(hunt.stageLabel)}</div>`;
}

function render() {
  const root = document.getElementById('settlementContent');
  if (!root || root.querySelector('[data-treasure-hunt]')) return;
  const hunts = state.treasureHunts?.() || [];
  const section = document.createElement('section');
  section.dataset.treasureHunt = 'true';
  section.style.marginTop = '14px';
  section.innerHTML = `<details class="forge-card"><summary>宝探し</summary><div class="forge-card-sub" style="margin:8px 0;">発掘で見つけた欠片の中に、時々宝の手掛かりが混ざっている。地域の記録を復元すると、手掛かりが読み解ける。噂の詳細は図鑑の噂帳でも確認できる。</div><div>${hunts.map(huntCard).join('')}</div></details>`;
  root.appendChild(section);
  section.querySelectorAll('.treasure-hunt-claim').forEach((btn) => btn.addEventListener('click', () => {
    const result = state.claimTreasureHunt(btn.dataset.hunt);
    if (!result?.ok) return;
    const card = section.querySelector(`[data-treasure-hunt-card="${result.chain.id}"]`);
    if (card) {
      const reward = rewardText(result.gained);
      // C6-8: flavor-only companion reaction line, no icon/badge -- see
      // data/companionDiscoveryReactions.js.
      const reaction = result.companionReaction ? `<br>${escapeHtml(result.companionReaction.text)}` : '';
      const fieldNote = state.treasureHuntFieldNote?.(result.chain.id);
      const note = fieldNote ? `<br><span class="hint">${escapeHtml(fieldNote)}</span>` : '';
      card.innerHTML = `<b>${escapeHtml(result.chain.name)}</b>　発見済み<br>${escapeHtml(result.chain.resolutionText)}${reward ? `<br>獲得: ${reward}` : ''}${reaction}${note}`;
    }
  }));
}

function install() {
  if (typeof document === 'undefined') return;
  const root = document.getElementById('settlementContent');
  if (!root) return;
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver(() => {
      if (!root.querySelector('[data-treasure-hunt]')) queueMicrotask(render);
    });
    observer.observe(root, { childList: true });
  }
  queueMicrotask(render);
}
install();
