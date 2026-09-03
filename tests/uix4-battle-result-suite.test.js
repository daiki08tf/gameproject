import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const textBattle = readFileSync(new URL('../js/screens/textBattle.js', import.meta.url), 'utf8');
const result = readFileSync(new URL('../js/screens/result.js', import.meta.url), 'utf8');
const fusionBattleUi = readFileSync(new URL('../js/patches/fusionBattleUi.js', import.meta.url), 'utf8');
const combat2ModifierUi = readFileSync(new URL('../js/patches/combat2SkillModifierUi.js', import.meta.url), 'utf8');
const styleCss = readFileSync(new URL('../css/style.css', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-4 removes rendered-UI emoji from the Battle and Result suite', () => {
  for (const [name, source] of [
    ['js/screens/textBattle.js', textBattle],
    ['js/screens/result.js', result],
    ['js/patches/fusionBattleUi.js', fusionBattleUi],
    ['js/patches/combat2SkillModifierUi.js', combat2ModifierUi],
  ]) {
    assert.doesNotMatch(source, PICTOGRAPH, `${name} must not render platform emoji`);
  }
});

test('UIX-4 gives the Result panel an outcome tone without depending on color alone', () => {
  // Text (STAGE CLEAR / DEFEATED... / RETREAT / BOUNTY CLEARED...) already
  // says what happened; data-tone is a reinforcing accent, not the only signal.
  assert.match(result, /panel\.dataset\.tone\s*=\s*'neutral'/);
  assert.match(result, /panel\.dataset\.tone\s*=\s*'success'/);
  assert.match(result, /panel\.dataset\.tone\s*=\s*'danger'/);
  assert.match(styleCss, /#resultScreen \.panel\[data-tone="success"\]\s*\{[^}]*var\(--dc-brass-500/s);
  assert.match(styleCss, /#resultScreen \.panel\[data-tone="danger"\]\s*\{[^}]*var\(--dc-danger-500/s);
});

test('UIX-4 gives Battle/Result surfaces Dark Chronicle tokens instead of bare rgba colors', () => {
  assert.match(styleCss, /\.tb-enemy-card \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.tb-enemy-card\.boss \{[^}]*var\(--dc-danger-500/s);
  assert.match(styleCss, /\.tb-enemy-card\.selected \{[^}]*var\(--dc-brass-500/s);
  assert.match(styleCss, /\.tb-log \{[^}]*var\(--dc-ink-900/s);
  assert.match(styleCss, /\.tb-log p\.tb-log-danger \{[^}]*var\(--dc-danger-300/s);
  assert.match(styleCss, /\.tb-cmd-btn \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.tb-cmd-btn\.tb-cmd-guard \{[^}]*var\(--dc-observe-400/s);
  assert.match(styleCss, /\.tb-fusion-panel \{[^}]*var\(--dc-observe-400/s);
  assert.match(styleCss, /\.result-item-chip \{[^}]*var\(--dc-ink-800/s);
  assert.match(styleCss, /\.result-loot-headline \{/);
});

test('UIX-4 keeps combat authority (BattleEngine) and Result reads untouched', () => {
  assert.match(textBattle, /import \{ BattleEngine \} from '\.\.\/battleEngine\.js'/);
  assert.match(result, /state\.isWeaponInstance\(itemId\)/);
  assert.match(result, /result\.expGained/);
  assert.match(result, /result\.goldGained/);
  for (const source of [textBattle, result, fusionBattleUi, combat2ModifierUi]) {
    assert.doesNotMatch(source, /localStorage/);
  }
});

test('UIX-4 preserves the permanent mobile release blockers: reachable commands and a next action from Result', () => {
  // Commands must never be off-screen or all-disabled with enemies alive.
  assert.match(textBattle, /this\.el\.attackBtn\.disabled = engine\.over \|\| engine\.aliveEnemies\.length === 0/);
  assert.match(textBattle, /this\.el\.guardBtn\.disabled = engine\.over/);
  // Result always renders a Home action; resultNextBtn/Hunt are wired in main.js (CLR-13/UIX-3).
  assert.match(result, /getElementById\('resultTitle'\)/);
});
