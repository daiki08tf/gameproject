import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const nav = readFileSync(new URL('../js/patches/homeNavigation.js', import.meta.url), 'utf8');
const css = readFileSync(new URL('../css/home3.css', import.meta.url), 'utf8');

test('home UI keeps one primary adventure action and grouped secondary navigation', () => {
  assert.match(nav, /home-adventure-primary/);
  assert.match(nav, /HOME_HUBS/);
  assert.match(nav, /育成/);
  assert.match(nav, /仲間・拠点/);
  assert.match(nav, /記録・その他/);
  assert.match(nav, /goStageBtn/);
  assert.match(nav, /goAbyssBtn/);
});

test('home UI uses progressive disclosure instead of rendering every action at once', () => {
  assert.match(nav, /panel\.hidden = true/);
  assert.match(nav, /aria-expanded/);
  assert.match(nav, /closeAllHubs/);
});

test('home UI has compact mobile rules and small-height fallback', () => {
  assert.match(css, /grid-template-columns:repeat\(3/);
  assert.match(css, /@media\(max-width:390px\)/);
  assert.match(css, /@media\(max-height:700px\)/);
  assert.match(css, /home-secondary-action/);
});
