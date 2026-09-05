import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const stageFirst = fs.readFileSync('js/patches/stageFirstNavigationUi.js', 'utf8');
const chapterSelect = fs.readFileSync('js/screens/chapterSelect.js', 'utf8');

// Bug report: after clearing a Stage, the Result screen's "ステージ一覧へ"
// button (showExistingStageList()) let the player keep playing forward via
// "次へ", but the Adventure tab's own Stage list still showed the
// newly-unlocked Stage as an unidentified "<id> ???" card with a NEXT badge
// that did nothing when tapped. Root cause: showExistingStageList() only
// toggled screen visibility over whatever #stageList last rendered (the
// pre-battle DOM, where the just-unlocked Stage was still a LOCKED
// placeholder created by enhanceStageFirstStageList() below), and that
// function's own patch logic ("if the id is already in the name, the name
// must already be correct") never replaces a placeholder's "??? " text —
// nor does a patched-in-place placeholder ever gain the onPick click
// handler renderStageSelect() attaches to a freshly rendered card.

test('showExistingStageList() re-enters via the canonical Chapter-card click so renderStageSelect() actually re-runs', () => {
  const fn = stageFirst.slice(stageFirst.indexOf('function showExistingStageList()'), stageFirst.indexOf('function ensureStageResultContext()'));
  assert.match(fn, /canonicalStageById\(selectedStageId\)/);
  assert.match(fn, /CHAPTERS\.indexOf\(found\.chapter\)/);
  assert.match(fn, /goStage\.click\(\)/);
  assert.match(fn, /document\.querySelector\(`#chapterList \[data-chapter-index="\$\{chapterIndex\}"\]`\)/);
  assert.match(fn, /chapterCard\.click\(\)/);
});

test('showExistingStageList() keeps a fallback for stages with no CHAPTERS entry (Observed Branch) instead of stranding the player', () => {
  const fn = stageFirst.slice(stageFirst.indexOf('function showExistingStageList()'), stageFirst.indexOf('function ensureStageResultContext()'));
  assert.match(fn, /document\.querySelectorAll\('\.screen'\)\.forEach\(screen=>screen\.classList\.remove\('active'\)\)/);
  assert.match(fn, /document\.getElementById\('stageSelectScreen'\)\?\.classList\.add\('active'\)/);
});

test('chapterSelect.js tags each rendered Chapter card with its CHAPTERS index so it can be re-clicked programmatically', () => {
  assert.match(chapterSelect, /card\.dataset\.chapterIndex=idx;/);
});

test('the fix still calls enhanceStageFirstStageList() so stage-id prefixing and further LOCKED placeholders keep working', () => {
  const fn = stageFirst.slice(stageFirst.indexOf('function showExistingStageList()'), stageFirst.indexOf('function ensureStageResultContext()'));
  const calls = fn.match(/enhanceStageFirstStageList\(\)/g) || [];
  assert.ok(calls.length >= 2, 'expected enhanceStageFirstStageList() on both the fixed path and the fallback path');
});
