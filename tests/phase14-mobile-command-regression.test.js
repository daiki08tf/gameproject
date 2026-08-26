import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const css=fs.readFileSync(new URL('../css/finalIntegration.css',import.meta.url),'utf8');
const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
const battle=fs.readFileSync(new URL('../js/screens/textBattle.js',import.meta.url),'utf8');

test('battle command bar remains reachable when enemy list grows',()=>{
  assert.match(css,/#textBattleScreen\s*\{[^}]*min-height:\s*0/s);
  assert.match(css,/\.tb-enemy-list\s*\{[^}]*max-height:/s);
  assert.match(css,/\.tb-enemy-list\s*\{[^}]*overflow-y:\s*auto/s);
  assert.match(css,/\.tb-command-grid\s*\{[^}]*position:\s*sticky/s);
  assert.match(css,/\.tb-command-grid\s*\{[^}]*bottom:/s);
  assert.match(css,/\.tb-command-grid\s*\{[^}]*z-index:/s);
  assert.match(css,/\.tb-log\s*\{[^}]*min-height:\s*0/s);
});

test('attack button stays outside enemy and log scrollers and only disables with no living enemy',()=>{
  const enemyIndex=html.indexOf('id="tbEnemyList"');
  const logIndex=html.indexOf('id="tbLog"');
  const commandIndex=html.indexOf('id="tbCommandGrid"');
  const attackIndex=html.indexOf('id="tbAttackBtn"');
  assert.ok(enemyIndex>=0&&logIndex>enemyIndex&&commandIndex>logIndex&&attackIndex>commandIndex);
  assert.match(battle,/this\.el\.attackBtn\.disabled\s*=\s*engine\.over\s*\|\|\s*engine\.aliveEnemies\.length\s*===\s*0/);
});

test('mobile command buttons keep a usable tap target',()=>{
  assert.match(css,/\.tb-cmd-btn\s*\{[^}]*min-height:\s*44px/s);
});
