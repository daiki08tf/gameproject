import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS } from '../js/data/stages.js';

const read=p=>fs.readFileSync(new URL(`../${p}`,import.meta.url),'utf8');

test('polish: compact mobile controls preserve the 44px tap contract',()=>{
  const finalCss=read('css/finalIntegration.css');
  const ranchCss=read('css/monsterRanchCompact.css');
  assert.match(finalCss,/--tap-min:44px/);
  assert.match(finalCss,/\.phase14-adventure-strip button\{[^}]*min-height:var\(--tap-min\)/s);
  assert.match(finalCss,/\.phase14-favorite-btn\{[^}]*min-width:var\(--tap-min\);min-height:var\(--tap-min\)/s);
  assert.match(finalCss,/\.phase14-loadout-unit button\{[^}]*min-height:var\(--tap-min\)/s);
  assert.match(ranchCss,/\.ranch-compact-tab\{[^}]*min-height:44px/s);
  assert.match(ranchCss,/\.ranch-compact-search\{[^}]*min-height:44px/s);
  assert.match(ranchCss,/ranch-compact-details>summary\{[^}]*min-height:44px/s);
});

test('polish: Ranch facility observer is idempotent and special breeding feedback survives redraw',()=>{
  const ui=read('js/patches/monsterRanch2FacilitiesUi.js');
  assert.match(ui,/function renderSignature\(\)/);
  assert.match(ui,/existing\?\.dataset\.renderSignature===signature/);
  assert.match(ui,/panel\.dataset\.renderSignature=signature/);
  assert.match(ui,/cp3SpecialHybrid/);
  assert.match(ui,/特殊配合成立/);
  assert.match(ui,/aria-live="polite"/);
});

test('polish: main story recommended levels remain monotonic through Ch30',()=>{
  let previous=0;
  for(const chapter of CHAPTERS){
    const levels=chapter.stages.filter(s=>!s.hidden).map(s=>Number(s.recLevel));
    assert.ok(levels.length>0,`Ch${chapter.num} has no visible stages`);
    for(const level of levels){
      assert.ok(Number.isFinite(level)&&level>=previous,`recommended level regressed at Ch${chapter.num}`);
      previous=level;
    }
  }
  assert.ok(previous>=7600,'Ch30 should finish at the Story Expansion I target band');
});

test('polish: permanent battle command safety remains untouched',()=>{
  const css=read('css/finalIntegration.css');
  assert.match(css,/\.tb-enemy-list\{[^}]*overflow-y:auto/s);
  assert.match(css,/\.tb-command-grid\{[^}]*position:sticky/s);
  assert.match(css,/\.tb-cmd-btn\{[^}]*min-height:44px/s);
});
