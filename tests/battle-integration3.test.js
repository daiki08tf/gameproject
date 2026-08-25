import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const patch=fs.readFileSync(new URL('../js/patches/battleIntegration3.js',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');

test('Battle Integration 3 is loaded after Codex foundation',()=>{
  const codex=main.indexOf("import './patches/codexFoundation.js';");
  const integration=main.indexOf("import './patches/battleIntegration3.js';");
  assert.ok(codex>=0);
  assert.ok(integration>codex);
});

test('element observations persist into Monster Codex knowledge',()=>{
  assert.match(patch,/markEnemyElementObserved/);
  assert.match(patch,/elementKnowledge/);
  assert.match(patch,/enemyElementKnowledge/);
});

test('battle UI exposes known tactical information without revealing unknown data',()=>{
  assert.match(patch,/攻略情報：未解析/);
  assert.match(patch,/ROLE/);
  assert.match(patch,/観測技/);
  assert.match(patch,/特殊行動の予兆/);
  assert.match(patch,/tb-tech-tactical/);
});
