import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const core = fs.readFileSync(new URL('../js/patches/rune2Core.js', import.meta.url), 'utf8');
const defs = fs.readFileSync(new URL('../js/data/runes2.js', import.meta.url), 'utf8');
const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');

test('Rune 2.0 capacity is tied to highest Character Lv and capped at 99,999', () => {
  assert.match(core, /Math\.min\(99999/);
  assert.match(core, /highestCharacterLevel/);
});

test('legacy weapon rune sockets are disabled', () => {
  assert.match(core, /getRuneSockets = function rune2LegacySocketsDisabled\(\) \{ return \[\]; \}/);
});

test('basic stat runes use +5% per active mark as final multiplier', () => {
  for (const id of ['force','ironclad','wise','notfall','spirit']) {
    assert.match(defs, new RegExp(`id:'${id}'.*perMark:0\\.05`));
  }
  assert.match(core, /1 \+ rune\.perMark \* marks/);
});

test('stage clears roll Rune 2.0 drops separately from ordinary loot', () => {
  assert.match(main, /result\.cleared && state\.rollRune2DropForStage/);
  assert.match(main, /result\.rune2Drops = state\.rollRune2DropForStage\(stage\.id\)/);
});

test('Rune 2.0 includes original Blade Vale progression runes', () => {
  for (const name of ['剛撃','鉄壁','賢者','不倒','精神','強欲','挑戦','縁','匠','運命']) assert.ok(defs.includes(name));
});
