# MutationObserver self-loop bugs — pattern, history, and prevention

## The bug class

A pattern showed up repeatedly across this codebase's UI "decorator" patch
files (the ones under `js/patches/` that watch a screen's DOM and re-apply
classes/labels/layout after the base screen re-renders):

1. A decorator function mutates a DOM node — `el.textContent = x`,
   `el.innerHTML = x`, `el.classList.add(cls)`, or
   `parent.appendChild(existingChild)`.
2. The same function is invoked from a `MutationObserver` callback that
   watches the node (or an ancestor subtree) it just mutated.

The trap: `textContent =`, `innerHTML =`, and `classList.add()` all queue a
mutation record **even when the result is identical to what was already
there** — there is no browser-side "no-op, nothing actually changed" check.
`appendChild()` of a node that is already the target's last child still
performs a remove+insert, which is also a `childList` mutation. So if the
decorator runs unconditionally every time its own observer fires, it
requeues the exact mutation the observer is watching for, which fires the
observer again, forever. Depending on how much work the decorator does per
call, this either freezes the tab (spinning the microtask queue) or, in the
worst case found this session, floods it fast enough to OOM-kill the whole
browser process before any error handler gets a chance to run.

The one built-in exception: **`classList.toggle(token, force)` is already
safe.** Per spec, when `force` already matches whether `token` is present,
`toggle()` returns immediately without touching the attribute — no write, no
mutation record. Plain `classList.add()` / `classList.remove()` have no such
check; only `toggle()` with an explicit `force` argument does.

## Real instances found this session

All of the following were confirmed (not just suspected) to cause an actual
freeze or crash, reproduced with a Playwright repro before being fixed:

| File | What looped | Symptom |
|---|---|---|
| `js/patches/smartLoot4EquipmentUi.js` (`syncAdvancedBadge`) | `button.textContent =` on the "⚙ 詳細" badge, watched by `equipmentFusion.js`'s `filterObserver` | Browser process crashed/OOM-killed within ~300ms of opening the Equipment screen |
| `js/patches/equipmentCompactUi.js` (`compactEquipmentScreen`) | `classList.add()` on `#equipPicker`/`#lootFilterRow`/`#paperdoll`, watched by its own `installEquipmentCompactUi` observer | `page.goto()` itself hung — the game never reached the title screen |
| `js/patches/monsterRanch2CompleteUi.js` (`render`) | Full panel remove+recreate, watched by its own observer on `#companionContent` | Tab froze on opening Monster Ranch |
| `js/patches/monsterRanchCompactUi.js` (`foldBondIntoDetails`) | `body.appendChild(bond)` even when `bond` was already `body`'s last child | Tab froze on opening Monster Ranch after a companion had bond info |
| `js/patches/gearOverhaulCraftingConsolidation.js` (`decorateCraftingButtons`) | `button.textContent =` on temper/greater/reroll buttons, watched by its own observer on `#blacksmithContent` | Tab froze on opening the Blacksmith with an Option 4.0 item equipped |
| `js/patches/contentPackIIE.js` (`decorateNotebook`) | Lore-fragment block remove+recreate, watched by its own observer on `#monsterCodexContent` | Tab froze after collecting at least one world-lore fragment |
| `js/patches/inheritanceBalanceUi.js` (`syncInheritanceGate`) | `btn.textContent =` on the inheritance gate button, watched by its own observer on `#rebirthContent` | Tab froze/crashed opening the Rebirth screen before the level gate was met |

`js/patches/phase12FinaleRuntime.js` and `js/patches/contentPackIIE.js`'s
startup-dependency issue had a related but distinct root cause (an import
ordering bug, not a self-observing loop) fixed independently upstream.

Every `new MutationObserver(...)` usage in the codebase (21 files as of this
audit — grep for `new MutationObserver` under `js/`) has been individually
re-read and confirmed not to have this shape.

## The fix pattern

**Only mutate if the new value/position/presence would actually differ from
the current one.** Concretely:

- `if (el.textContent !== next) el.textContent = next;`
- `if (!el.classList.contains(cls)) el.classList.add(cls);`
- `if (node.parentElement !== target) target.appendChild(node);`
- For "remove the old block and rebuild from scratch" decorators: keep a
  signature (a count, a JSON fingerprint, an existence check) and bail out
  before touching the DOM at all when the signature hasn't changed.
- Prefer `classList.toggle(token, someBoolean)` over
  `classList.add()`/`classList.remove()` when the desired state is a boolean
  — it's self-guarding for free.

## Use the shared helpers

`js/patches/domSafety.js` packages the common cases so new patch files don't
need to hand-roll the guard (and can't forget it):

```js
import { setTextIfChanged, addClassIfMissing, appendIfDetached, ensureInserted } from './domSafety.js';

setTextIfChanged(button, nextLabel);          // instead of button.textContent = nextLabel
addClassIfMissing(el, 'foo', 'bar');          // instead of el.classList.add('foo', 'bar')
appendIfDetached(parent, node);               // instead of parent.appendChild(node)
ensureInserted(() => document.getElementById('myPanel'), renderPanel); // instead of calling renderPanel() unconditionally
```

Each helper returns whether it actually wrote anything, which is also handy
if a caller wants to chain follow-up work off "did this just change".

Most of the fixes in the table above have been retrofitted onto these
helpers (see `tests/mutation-observer-self-loop-regression.test.js` and
`tests/home-scroll-and-badge-loop-regression.test.js`, which assert the
guard is present in each file's source). `contentPackIIE.js`'s lore-fragment
guard is bespoke (it compares a fragment-count fingerprint, not a single
node's value) and is left as a direct guard rather than forced into one of
these generic shapes.

## When adding a new MutationObserver-driven decorator

Before writing a new one, ask: does this callback write to (or under) the
same node the observer watches? If yes, use one of the helpers above (or an
equivalent signature-based guard for "rebuild a whole block" cases) —
never write unconditionally inside an observer callback that watches its own
output.
