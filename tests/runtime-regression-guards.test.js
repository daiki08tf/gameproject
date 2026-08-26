// Permanent guards for two confirmed high-severity runtime regressions.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => fs.readFileSync(new URL(path, import.meta.url), 'utf8');

test('runtime guard: phase12 finale imports exploration core before binding explorationProgress',()=>{
  const runtime=read('../js/patches/phase12FinaleRuntime.js');
  const importIndex=runtime.indexOf("import './exploration1Core.js';");
  const bindIndex=runtime.indexOf('state.explorationProgress.bind(state)');
  assert.ok(importIndex>=0,'phase12FinaleRuntime must explicitly import exploration1Core.js');
  assert.ok(bindIndex>=0,'phase12FinaleRuntime still wraps explorationProgress');
  assert.ok(importIndex<bindIndex,'exploration1Core import must occur before explorationProgress.bind(state)');
});

test('runtime guard: exploration core remains the owner of state.explorationProgress',()=>{
  const core=read('../js/patches/exploration1Core.js');
  assert.match(core,/state\.explorationProgress\s*=\s*function/);
});

test('runtime guard: CP2 lore decoration is idempotent under MutationObserver',()=>{
  const runtime=read('../js/patches/contentPackIIE.js');
  const guard='if(existingLore&&Number(existingLore.dataset.cp2eLoreCount)===lore.length)return;';
  const remove='existingLore?.remove();';
  const countWrite="details.dataset.cp2eLoreCount=String(lore.length);";
  const guardIndex=runtime.indexOf(guard);
  const removeIndex=runtime.indexOf(remove);
  assert.ok(guardIndex>=0,'CP2 E must skip DOM mutation when lore count is unchanged');
  assert.ok(removeIndex>=0,'CP2 E may replace lore block only after the idempotence guard');
  assert.ok(guardIndex<removeIndex,'idempotence guard must run before removing the observed lore block');
  assert.ok(runtime.includes(countWrite),'rendered lore block must persist the fragment count used by the guard');
  assert.match(runtime,/new MutationObserver\(\(\)=>queueMicrotask\(decorateNotebook\)\)/);
});

test('runtime guard: CP2 notebook NEXT lines are append-once',()=>{
  const runtime=read('../js/patches/contentPackIIE.js');
  assert.match(runtime,/if\(card\.querySelector\('\.cp2e-next'\)\)return;/);
});
