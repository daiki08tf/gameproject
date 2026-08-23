import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const main = fs.readFileSync('js/main.js', 'utf8');
const home = fs.readFileSync('js/patches/homeNavigation.js', 'utf8');
const ui = fs.readFileSync('js/patches/codexUi.js', 'utf8');
const foundation = fs.readFileSync('js/patches/codexFoundation.js', 'utf8');

test('Codex UI is loaded before home grouping', () => {
  assert.ok(main.indexOf("./patches/codexUi.js") < main.indexOf("./patches/homeNavigation.js"));
  assert.match(home, /goMonsterCodexBtn/);
});

test('Codex screen exposes completion, milestones and next goal', () => {
  assert.match(ui, /図鑑完成度/);
  assert.match(ui, /永続ボーナス/);
  assert.match(ui, /次の目標/);
  assert.match(ui, /CODEX_MILESTONES/);
});

test('encounter is recorded before kill', () => {
  assert.match(foundation, /beginNextEncounter/);
  assert.match(foundation, /markCodexSeen/);
  assert.match(foundation, /markCodexKill/);
});
