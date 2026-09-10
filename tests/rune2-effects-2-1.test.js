import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { RUNE2_DEFS, rune2EffectText } from '../js/data/runes2.js';

const runtime = fs.readFileSync(new URL('../js/patches/rune2Special.js', import.meta.url), 'utf8');
const core = fs.readFileSync(new URL('../js/patches/rune2Core.js', import.meta.url), 'utf8');
const ui = fs.readFileSync(new URL('../js/patches/rune2Ui.js', import.meta.url), 'utf8');

test('all seven formerly-placeholder base Runes now expose honest concrete effects', () => {
  for (const id of ['hawkeye', 'illusion', 'bless', 'gold', 'bastion', 'craft', 'fate']) {
    const rune = RUNE2_DEFS.find((r) => r.id === id);
    assert.ok(rune?.effect, id);
    assert.doesNotMatch(rune2EffectText(rune, rune.maxMarks), /後続|プレースホルダー|効果なし/);
  }
});

test('all proposed battle and reward hooks are chained rather than replaced blindly', () => {
  for (const hook of [
    '_effectiveCritPct', '_effectiveEvasion', '_effectiveArmorPen', '_mainDmgMult',
    '_critDamageBoostMult', '_bossDmgMult', '_dropChanceBonusMult', '_effectiveEnemyStat',
    '_debuffPowerMult', '_enemyAttackDamage', '_afterRoundChecks', '_rollWeaponDrop', '_rollManastone',
  ]) assert.match(runtime, new RegExp(`const legacy[A-Za-z]+ = BattleEngine\\.prototype\\.${hook.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`), hook);
});

test('drop pipeline only grants the first mark and then leaves growth to the Blacksmith', () => {
  assert.match(runtime, /rune2Discovered/);
  assert.match(runtime, /const amount = 1/);
  assert.match(core, /forgeRune2/);
  assert.match(ui, /章クリアだけでは解放されません/);
  assert.match(ui, /data-forge/);
});

