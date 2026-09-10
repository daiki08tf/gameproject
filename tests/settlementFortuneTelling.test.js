import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const data = fs.readFileSync('js/data/settlementFortuneTelling.js', 'utf8');
const runtime = fs.readFileSync('js/patches/settlementFortuneTelling.js', 'utf8');
const ui = fs.readFileSync('js/patches/settlementFortuneTellingUi.js', 'utf8');
const nav = fs.readFileSync('js/patches/homeNavigation.js', 'utf8');

test('fortune-telling is registered in the home navigation import chain', () => {
  assert.match(nav, /import '\.\/settlementFortuneTelling\.js';/);
  assert.match(nav, /import '\.\/settlementFortuneTellingUi\.js';/);
});

test('fortune-telling reuses the existing endgame-guidance computation, not a new one', () => {
  assert.match(runtime, /import\s*\{\s*buildEndgameGuidance\s*\}\s*from\s*'\.\.\/data\/endgameGuidance\.js'/);
  assert.doesNotMatch(runtime, /ENDGAME_GUIDANCE_LANES\s*=/);
});

test('fortune-telling spends existing gold only, no new currency field', () => {
  assert.match(runtime, /this\.data\.gold\s*-=\s*cost/);
  assert.doesNotMatch(runtime, /this\.data\.\w*[Ff]ortune\w*\s*(=|\+=|-=)\s*\d/);
});

test('fortune-telling gates on the existing inn building, not a new unlock flag', () => {
  assert.match(runtime, /settlementLevel\?\.\('inn'\)/);
});

test('every endgame-guidance lane id has an authored flavor line', () => {
  for (const laneId of ['story', 'story_gate', 'awakening', 'transcendent', 'divine', 'cataclysm', 'boundary_zero', 'limit']) {
    assert.match(data, new RegExp(`${laneId}:\\s*'`));
  }
});

test('fortune-telling UI renders inside the existing settlement content root only', () => {
  assert.match(ui, /getElementById\('settlementContent'\)/);
  assert.doesNotMatch(ui, /createElement\('section'\)[\s\S]*document\.body\.append/);
});
