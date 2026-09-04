/* ============================================================
   UIX-7 — Overlay accessibility helper
   ------------------------------------------------------------
   Several ad-hoc full-screen overlays (companion recruit prompt,
   Settlement resident/evolution overlays, Abyss Run choice) are built
   as plain fixed-position <div>s appended to document.body, each with
   its own bespoke show/close logic. None of them had any keyboard or
   screen-reader affordance: no Escape-to-close, no role="dialog", no
   focus moved into the panel on open or returned to the trigger on
   close.

   bindOverlayDialog() adds those affordances without changing how any
   individual overlay is built or torn down — it does not own removal,
   it only wires focus/keyboard behavior around whatever removal path
   the caller already has.

   Usage: right after appending the overlay to document.body, call

     const restoreFocus = bindOverlayDialog(overlay, panel, closeFn);

   then call restoreFocus() at the same point the overlay is actually
   removed (inside/alongside the caller's existing close/finish path).
   closeFn is invoked on Escape — it should do exactly what clicking
   the overlay's own dismiss/decline action does.
   ============================================================ */

export function bindOverlayDialog(overlay, panel, closeFn) {
  if (!overlay || !panel) return () => {};
  const previouslyFocused = document.activeElement;
  panel.setAttribute('role', 'dialog');
  panel.setAttribute('aria-modal', 'true');
  if (!panel.hasAttribute('tabindex')) panel.setAttribute('tabindex', '-1');
  const focusable = panel.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  (focusable || panel).focus({ preventScroll: true });
  function onKeydown(e) {
    if (e.key === 'Escape') { e.preventDefault(); closeFn?.(); }
  }
  overlay.addEventListener('keydown', onKeydown);
  return function restoreFocus() {
    overlay.removeEventListener('keydown', onKeydown);
    if (previouslyFocused && document.body.contains(previouslyFocused) && typeof previouslyFocused.focus === 'function') {
      previouslyFocused.focus({ preventScroll: true });
    }
  };
}
