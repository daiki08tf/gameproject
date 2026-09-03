import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const status = readFileSync(new URL('../js/screens/status.js', import.meta.url), 'utf8');
const rebirth = readFileSync(new URL('../js/screens/rebirthModern.js', import.meta.url), 'utf8');
const jobCodexUi = readFileSync(new URL('../js/patches/jobCodexUi.js', import.meta.url), 'utf8');
const jobsPhase8 = readFileSync(new URL('../js/screens/jobsPhase8.js', import.meta.url), 'utf8');
const jobConstellation = readFileSync(new URL('../js/screens/jobConstellation.js', import.meta.url), 'utf8');
const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');
const characterCss = readFileSync(new URL('../css/character.css', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-6 batch 1 removes rendered-UI emoji from Status, Rebirth and the Job screen\'s Codex entry point', () => {
  for (const [name, source] of [
    ['js/screens/status.js', status],
    ['js/screens/rebirthModern.js', rebirth],
    ['js/patches/jobCodexUi.js', jobCodexUi],
    ['js/screens/jobsPhase8.js', jobsPhase8],
    ['js/screens/jobConstellation.js', jobConstellation],
  ]) {
    assert.doesNotMatch(source, PICTOGRAPH, `${name} must not render platform emoji`);
  }
});

test('UIX-6 batch 1 replaces bare glyph state markers with text/non-pictographic symbols', () => {
  // Awakening rank checklist: met/unmet, previously ✅/⬜.
  assert.match(rebirth, /c\.met \? '✓' : '○'/);
  // Artifact slot: locked/filled/empty, previously 🔒/✨/+.
  assert.match(rebirth, /!unlocked \? '✕' : a \? '●' : '\+'/);
  // Gold/manastone cost text follows the UIX-5 Gold/魔石 convention.
  assert.match(rebirth, /Gold\$\{cost\.gold\.toLocaleString\(\)\} \+ 魔石\$\{cost\.manastone\}/);
  // Character avatar shows the current job's initial instead of a fixed emoji.
  assert.match(status, /character-avatar">\$\{\(job\.name \|\| ''\)\.charAt\(0\) \|\| '\?'\}/);
});

test('UIX-6 batch 1 gives Status/Rebirth/Character surfaces Dark Chronicle tokens instead of bare rgba/hex colors', () => {
  assert.match(styleCss, /\.status-section h3 \{[^}]*var\(--dc-ash-300/s);
  assert.match(styleCss, /\.status-row \.status-cap\.maxed \{[^}]*var\(--dc-brass-300/s);
  assert.match(styleCss, /\.rebirth-count \{[^}]*var\(--dc-brass-300/s);
  assert.match(characterCss, /var\(--dc-brass-500/);
  assert.match(characterCss, /var\(--dc-ink-900, var\(--bg,#101014\)\)|var\(--dc-ink-950/);
  assert.match(characterCss, /\.character-avatar \{[^}]*var\(--dc-brass-300/s);
});

test('UIX-6 batch 1 leaves the Job Constellation/Fusion Galaxy visual system untouched (deferred, no emoji present)', () => {
  // jobConstellation.js and its inline styles (phase8JobUiStyles.js) already
  // have zero rendered emoji and a deliberate space/star identity distinct
  // from the rest of the app. Full token harmonization is real, separate
  // work (many hardcoded #f2c94c/rgba(242,201,76,..) golds and glow
  // box-shadows tied to mastered/discovered states) deferred to its own
  // pass rather than a partial, unverified retouch inside this batch.
  assert.doesNotMatch(jobConstellation, PICTOGRAPH);
  assert.match(jobConstellation, /★|◇/); // decorative, non-pictographic — untouched by design
});

test('UIX-6 batch 1 introduces no new calculation authority — Status/Rebirth/Job read existing state only', () => {
  for (const source of [status, rebirth, jobCodexUi, jobsPhase8, jobConstellation]) {
    assert.doesNotMatch(source, /localStorage/);
  }
  assert.match(status, /state\.getStats\(\)/);
  assert.match(status, /state\.getCombatStats\(\)/);
  assert.match(rebirth, /state\.inheritancePreview\(\)/);
  assert.match(rebirth, /state\.awakeningV2Rank\(\)/);
});
