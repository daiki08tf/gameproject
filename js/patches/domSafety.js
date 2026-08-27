/* ============================================================
   DOM mutation-observer safety helpers
   ------------------------------------------------------------
   This session repeatedly found the same bug shape across many
   patch files: a decorator function rewrites a DOM node (textContent,
   innerHTML, classList.add, or parent.appendChild(existingChild)) and
   is itself invoked by a MutationObserver watching that same node or
   subtree. textContent=, innerHTML=, and classList.add() all queue a
   mutation record even when the result is byte-for-byte identical to
   what was already there, and appendChild() of a node that is already
   the target's last child still performs a remove+insert (another
   childList record). A decorator that writes unconditionally on every
   call therefore retriggers its own observer forever — freezing the
   tab, or in one case (smartLoot4EquipmentUi.js's advanced-filter
   badge) crashing the whole browser process before the screen even
   finished opening.

   classList.toggle(token, force) is the one exception worth knowing:
   per spec, when the token's current presence already matches force,
   toggle() returns without touching the attribute at all — no write,
   no mutation record. It's already self-guarding; there's no helper
   for it here because none is needed.

   Every helper below performs the DOM write ONLY when it would
   actually change something, and returns whether it did (useful for
   tests and for chaining follow-up work off "did I just change this").
   Use these — instead of the raw DOM call — anywhere a function is or
   might later be invoked from a MutationObserver callback that
   watches the node being written to.

   See docs/MUTATION_OBSERVER_SAFETY.md for the full writeup and the
   list of real bugs this pattern caused this session.
   ============================================================ */

export function setTextIfChanged(el, text) {
  if (!el || el.textContent === text) return false;
  el.textContent = text;
  return true;
}

export function setHtmlIfChanged(el, html) {
  if (!el || el.innerHTML === html) return false;
  el.innerHTML = html;
  return true;
}

export function addClassIfMissing(el, ...classNames) {
  if (!el) return false;
  const missing = classNames.filter((name) => !el.classList.contains(name));
  if (!missing.length) return false;
  el.classList.add(...missing);
  return true;
}

export function appendIfDetached(parent, node) {
  if (!parent || !node || node.parentElement === parent) return false;
  parent.appendChild(node);
  return true;
}

// For the "remove + recreate a whole block" shape (e.g. a panel rebuilt
// from scratch on every render()) rather than a single-node mutation:
// only run insert() when exists() says the thing isn't there yet.
export function ensureInserted(exists, insert) {
  if (exists()) return false;
  insert();
  return true;
}
