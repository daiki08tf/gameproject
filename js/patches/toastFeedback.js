/* ============================================================
   UIX-7 Phase 3 — shared toast feedback helper
   ------------------------------------------------------------
   js/main.js already had one inline toast use (Abyss Synergy Unlocked).
   showToast() extracts that exact logic so other genuine "unlock" moments
   — currently confirmed by sound only (Audio_.jobMastered()), with no
   visual feedback at all — can reuse the same #toast element instead of
   each hand-rolling its own popup.
   ============================================================ */

let hideTimer = null;

export function showToast(text, ms = 2200) {
  const toast = document.getElementById('toast');
  if (!toast || !text) return;
  toast.textContent = text;
  // .toast's CSS animation (toastPop) is keyed to display leaving
  // "none" — a plain classList.remove('hidden') on a toast that's
  // already showing wouldn't restart it, so back-to-back toasts would
  // silently sit on the first one's already-finished animation state.
  // Force it back to display:none and flush layout before showing again.
  toast.classList.add('hidden');
  void toast.offsetWidth;
  toast.classList.remove('hidden');
  if (hideTimer) clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.add('hidden'), ms);
}
