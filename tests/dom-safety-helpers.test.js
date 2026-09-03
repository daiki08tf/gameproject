import test from 'node:test';
import assert from 'node:assert/strict';
import { setTextIfChanged, setHtmlIfChanged, addClassIfMissing, appendIfDetached, ensureInserted } from '../js/patches/domSafety.js';

// Minimal DOM stand-ins. The real bug this module guards against is a
// browser-only behavior (childList/attribute mutation records queuing even
// on a no-op write), so these fakes just need to expose the same surface
// the helpers touch — not reproduce MutationObserver itself.

function fakeElement(initial = {}) {
  const classes = new Set(initial.classes || []);
  return {
    textContent: initial.textContent ?? '',
    innerHTML: initial.innerHTML ?? '',
    classList: {
      contains: (name) => classes.has(name),
      add: (...names) => names.forEach((n) => classes.add(n)),
      has: (name) => classes.has(name), // convenience for assertions below
    },
  };
}

function fakeParent() {
  const children = [];
  return {
    children,
    appendChild(node) {
      const idx = children.indexOf(node);
      if (idx !== -1) children.splice(idx, 1);
      children.push(node);
      node.parentElement = this;
    },
  };
}

test('setTextIfChanged only writes and reports true when the text actually differs', () => {
  const el = fakeElement({ textContent: 'hello' });
  assert.equal(setTextIfChanged(el, 'hello'), false);
  assert.equal(el.textContent, 'hello');
  assert.equal(setTextIfChanged(el, 'world'), true);
  assert.equal(el.textContent, 'world');
  assert.equal(setTextIfChanged(null, 'x'), false);
});

test('setHtmlIfChanged only writes and reports true when the html actually differs', () => {
  const el = fakeElement({ innerHTML: '<b>a</b>' });
  assert.equal(setHtmlIfChanged(el, '<b>a</b>'), false);
  assert.equal(setHtmlIfChanged(el, '<b>b</b>'), true);
  assert.equal(el.innerHTML, '<b>b</b>');
});

test('addClassIfMissing only calls classList.add() for classes not already present, and no-ops when all are present', () => {
  const el = fakeElement({ classes: ['foo'] });
  assert.equal(addClassIfMissing(el, 'foo'), false, 'already-present single class must report no change');
  assert.equal(addClassIfMissing(el, 'foo', 'bar'), true, 'a genuinely new class must report a change');
  assert.ok(el.classList.has('bar'));
  assert.equal(addClassIfMissing(el, 'foo', 'bar'), false, 'both now present -> no-op');
});

test('appendIfDetached only calls appendChild when the node is not already the parent\'s child', () => {
  const parent = fakeParent();
  const node = { parentElement: null };
  assert.equal(appendIfDetached(parent, node), true);
  assert.equal(parent.children.length, 1);
  assert.equal(appendIfDetached(parent, node), false, 'already attached to this exact parent -> no-op');
  assert.equal(parent.children.length, 1);
});

test('ensureInserted only calls insert() when exists() reports the target is absent', () => {
  let present = false;
  let insertCalls = 0;
  const insert = () => {
    insertCalls += 1;
    present = true;
  };
  assert.equal(ensureInserted(() => present, insert), true);
  assert.equal(insertCalls, 1);
  assert.equal(ensureInserted(() => present, insert), false);
  assert.equal(insertCalls, 1, 'insert() must not run again once exists() is true');
});
