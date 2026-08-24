/* ============================================================
   Patch chain utility
   ------------------------------------------------------------
   Many files in this directory extend a state/BattleEngine method
   by capturing its current implementation and replacing it with a
   wrapper that calls through to it:

     const previous = state.getStats.bind(state);
     state.getStats = function name() { ...; return previous(); };

   That two-line boilerplate is copy-pasted independently in every
   patch file, so the final chained behavior depends entirely on
   js/main.js's import order (whichever patch loads first captures
   the "outermost" original at that point) with no single place
   documenting it. A bug already shipped from a variant of this
   pattern (a MutationObserver in inheritanceBalanceUi.js rewriting
   its own observed subtree caused an infinite loop) — see git
   history for the fix.

   chainMethod() does not change that ordering or behavior at all —
   it is the exact same "capture, then reassign" shape, just
   factored into one place so each patch file is left with only its
   own added logic, and every link in a chain looks the same.
   ============================================================ */
export function chainMethod(target, name, buildFn) {
  const previous = typeof target[name] === 'function' ? target[name].bind(target) : undefined;
  target[name] = buildFn(previous);
}
