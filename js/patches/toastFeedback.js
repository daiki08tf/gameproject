/* ============================================================
   UIX-7 Phase 3 — shared toast feedback helper
   ------------------------------------------------------------
   js/main.js already had one inline toast use (Abyss Synergy Unlocked).
   showToast() extracts that exact logic so other genuine "unlock" moments
   — currently confirmed by sound only (Audio_.jobMastered()), with no
   visual feedback at all — can reuse the same #toast element instead of
   each hand-rolling its own popup.
   ============================================================ */

// Queue (2026-11): the single #toast element used to be overwritten by each
// new call, so when several things happened at once -- a battle ending with a
// Codex knowledge level-up, a companion joining and an incident result -- only
// the last message was ever readable. Messages now wait their turn. Callers
// are unchanged: showToast(text, ms) still returns immediately.
//   - while something is waiting, the current toast is cut to QUEUED_MS so a
//     burst does not take many seconds to drain;
//   - an identical message already showing or already last in line is dropped;
//   - at most MAX_QUEUE wait; older ones are discarded first.
const QUEUED_MS = 1700;
const MIN_REMAINING_MS = 350;
const MAX_QUEUE = 4;

let hideTimer = null;
let showing = null; // { text, ms, at }
const queue = [];

function display(toast, item) {
  showing = { ...item, at: Date.now() };
  toast.textContent = item.text;
  // .toast's CSS animation (toastPop) is keyed to display leaving
  // "none" — a plain classList.remove('hidden') on a toast that's
  // already showing wouldn't restart it, so back-to-back toasts would
  // silently sit on the first one's already-finished animation state.
  // Force it back to display:none and flush layout before showing again.
  toast.classList.add('hidden');
  void toast.offsetWidth;
  toast.classList.remove('hidden');
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => advance(toast), queue.length ? Math.min(item.ms, QUEUED_MS) : item.ms);
}

function advance(toast) {
  hideTimer = null;
  showing = null;
  const next = queue.shift();
  if (next) display(toast, next);
  else toast.classList.add('hidden');
}

export function showToast(text, ms = 2200) {
  const toast = document.getElementById('toast');
  if (!toast || !text) return;
  const item = { text: String(text), ms: Number(ms) > 0 ? Number(ms) : 2200 };
  if (!showing) { display(toast, item); return; }
  if (showing.text === item.text || queue[queue.length - 1]?.text === item.text) return;
  queue.push(item);
  if (queue.length > MAX_QUEUE) queue.shift();
  // Something is now waiting: do not let the current toast sit for its full duration.
  const remaining = Math.max(MIN_REMAINING_MS, Math.min(showing.ms, QUEUED_MS) - (Date.now() - showing.at));
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => advance(toast), remaining);
}
