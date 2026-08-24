import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { elementMultiplier, resolveRandomElement } from '../js/data/combat2Elements.js';

test('element advantage and resistance are bounded', () => {
  assert.equal(elementMultiplier('fire', { element: 'ice' }), 1.25);
  assert.equal(elementMultiplier('fire', { element: 'fire' }), 0.82);
  assert.equal(elementMultiplier('light', { element: 'dark' }), 1.25);
  assert.equal(elementMultiplier('fire', { elementResist: { fire: 0.9 } }), 0.65);
  assert.equal(elementMultiplier('fire', { elementResist: { fire: -1 } }), 1.55);
});

test('random element resolution is deterministic and valid', () => {
  const a = resolveRandomElement(42);
  const b = resolveRandomElement(42);
  assert.equal(a, b);
  assert.ok(['fire','ice','lightning','wind','light','dark'].includes(a));
});

test('Combat 2.0 element patch is loaded before battle UI starts', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const element = main.indexOf("./patches/combat2ElementCore.js");
  const battle = main.indexOf("./screens/textBattle.js");
  assert.ok(element > 0 && battle > element);
});
