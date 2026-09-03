import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const index = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/darkChronicle.css', import.meta.url), 'utf8');
const ui = readFileSync(new URL('../js/ui/uiFoundation.js', import.meta.url), 'utf8');
const guide = readFileSync(new URL('../UI_DESIGN_SYSTEM.md', import.meta.url), 'utf8');

test('UIX-1 loads Dark Chronicle tokens after the legacy skin', () => {
  assert.match(index, /css\/ui3\.css[\s\S]*css\/darkChronicle\.css/);
  for (const token of ['--dc-ink-950', '--dc-brass-500', '--dc-observe-400', '--dc-danger-500', '--dc-space-1', '--dc-radius-panel', '--dc-motion-fast']) {
    assert.match(css, new RegExp(token));
  }
  assert.match(css, /font-variant-numeric:\s*tabular-nums/);
});

test('UIX-1 exposes semantic shared component contracts', () => {
  for (const name of ['createHeader', 'createSection', 'createRow', 'createBadge', 'createTabs', 'createAction', 'createNotice']) {
    assert.match(ui, new RegExp(`function ${name}`));
    assert.match(ui, new RegExp(`\\b${name},`));
  }
  for (const selector of ['.dc-header', '.dc-section', '.dc-row', '.dc-badge', '.dc-tabs', '.dc-action', '.dc-notice']) {
    assert.match(css, new RegExp(selector.replace('.', '\\.')));
  }
});

test('UIX-1 defines focus, interaction, disabled and reduced-motion states', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /aria-disabled/);
  assert.match(css, /aria-pressed/);
  assert.match(css, /aria-busy/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.match(css, /min-height:\s*44px/);
});

test('UIX-1 keeps the shared shell free of platform pictographs', () => {
  const audit = spawnSync(process.execPath, ['scripts/uix-emoji-check.js'], { encoding: 'utf8' });
  assert.equal(audit.status, 0, audit.stderr || audit.stdout);
  assert.match(audit.stdout, /shared shell clean/);
});

test('UIX-1 documents accepted and rejected visual patterns', () => {
  assert.match(guide, /Good patterns/);
  assert.match(guide, /Rejected patterns/);
  assert.match(guide, /platform emoji/);
  assert.match(guide, /44px/);
});
