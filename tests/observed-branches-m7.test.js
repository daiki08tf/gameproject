import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  CP4_COMPARATIVE_RECORD,
  cp4ComparativeRecordReady,
  cp4ComparativeRecordAxisDiffs,
  cp4ComparativeRecordSummary,
} from '../js/data/contentPackIVH.js';

const FIRST_ANCHOR = 'cp4:branch-anchor:tree-sovereign';
const SECOND_ANCHOR = 'cp4:branch-anchor:deep-green-absence';

test('M7 comparative record never exposes an undiscovered Branch', () => {
  assert.equal(cp4ComparativeRecordReady({ discoveries: {} }), false);
  assert.equal(cp4ComparativeRecordReady({ discoveries: { [FIRST_ANCHOR]: { at: 1 } } }), false, 'only 王樹領 discovered must not reveal the comparison');
  assert.equal(cp4ComparativeRecordReady({ discoveries: { [SECOND_ANCHOR]: { at: 1 } } }), false, '深緑消失域 alone (impossible in practice, but still) must not reveal the comparison');
  assert.equal(cp4ComparativeRecordReady({ discoveries: { [FIRST_ANCHOR]: { at: 1 }, [SECOND_ANCHOR]: { at: 2 } } }), true);
});

test('M7 reuses the existing authored Prime-history line instead of inventing new canon', () => {
  const chainSrc = fs.readFileSync('js/data/contentPackIVA.js', 'utf8');
  assert.match(chainSrc, new RegExp(CP4_COMPARATIVE_RECORD.primeText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), 'Prime line must be the literal contentPackIVA.js prime-record text, not a paraphrase');
});

test('M7 axis diffs are a compact derivation, not a six-axis dump', () => {
  const diffs = cp4ComparativeRecordAxisDiffs();
  assert.ok(diffs.length > 0 && diffs.length < 6, 'must omit axes where the two Branches do not diverge (e.g. material, which both share)');
  assert.ok(!diffs.some(d => d.axis === 'material'), '王樹領/深緑消失域 share the same material level and must be omitted');
  for (const row of diffs) assert.notEqual(row.treeLevel, row.absenceLevel);
  // Largest divergence (bio: dominant vs regressedMajor) sorts first.
  assert.equal(diffs[0].axis, 'bio');
  const summary = cp4ComparativeRecordSummary();
  assert.match(summary, /^Prime：/);
  assert.match(summary, /bio：王樹領 ↑↑↑ ⇔ 深緑消失域 ↓↓↓/);
  assert.doesNotMatch(summary, /material：/, 'shared axis must not appear in the compact summary');
});

test('M7 wires the comparative record into the existing Codex ("歴史的不整合") and Chronicle timeline surfaces, adding no new authority', () => {
  const patchSrc = fs.readFileSync('js/patches/contentPackIVH.js', 'utf8');
  assert.match(patchSrc, /state\.cp4CodexHistoricalInconsistencies/);
  assert.match(patchSrc, /state\.settlementChronicleTimeline/);
  assert.doesNotMatch(patchSrc, /localStorage|innerHTML|Math\.random|worldTier|currency|stamina/i);
  assert.doesNotMatch(patchSrc, /◈|🌿|🔒|✅|❌/u);
  const dataSrc = fs.readFileSync('js/data/contentPackIVH.js', 'utf8');
  assert.doesNotMatch(dataSrc, /OBSERVED_BRANCH_TECHNOLOGY_AXES\s*=\s*\[/, 'must import the existing axis list, not redefine one');
});
