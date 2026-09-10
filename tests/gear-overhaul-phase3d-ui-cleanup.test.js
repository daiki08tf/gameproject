import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../js/patches/gearOverhaulCraftingConsolidation.js', import.meta.url), 'utf8');

test('Option4 blacksmith clearly retires numeric Temper and crafted Greater', () => {
  assert.match(source, /値＝Option Lv/);
  assert.match(source, /★ドロップ限定/);
  assert.match(source, /Option 4\.0では数値はレアリティとOption Lvから決まります/);
});

test('blacksmith presents reroll as family replacement with growth reset', () => {
  assert.match(source, /Option再抽選/);
  assert.match(source, /Lv1・EXP0から育成/);
  assert.match(source, /1枠変更：Option再抽選/);
});

test('Legendary package is presented as fixed identity management', () => {
  assert.match(source, /固定能力を抽出/);
  assert.match(source, /固定能力（Legendary Power）/);
  assert.match(source, /固定能力として刻印/);
});

test('legacy Affix-facing empty-state wording is replaced for the player', () => {
  assert.match(source, /Optionなし/);
  assert.match(source, /Option鍛造/);
  assert.doesNotMatch(source, /\p{Extended_Pictographic}/u);
});
