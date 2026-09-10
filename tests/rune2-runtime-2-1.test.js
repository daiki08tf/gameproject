import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import '../js/patches/progressionCore.js';
import '../js/patches/rune2Core.js';
import '../js/patches/rune2Special.js';

function resetRunes() {
  state.data.rune2Owned = {};
  state.data.rune2Active = {};
  state.data.rune2Discovered = {};
  state.data.highestCharacterLevel = 99999;
  state.data.gold = 1_000_000;
  state.data.manastone = 100_000;
}

test('a cleared-stage roll can unlock its chapter Rune once, never by chapter state', () => {
  resetRunes();
  const first = state.rollRune2DropForStage('1-3', () => 0);
  assert.deepEqual(first, [{ id:'force', amount:1, owned:1, challenge:0 }]);
  assert.equal(state.data.rune2Discovered.force, true);
  assert.deepEqual(state.rollRune2DropForStage('1-4', () => 0), []);
  assert.deepEqual(state.rollRune2DropForStage('2-1', () => 1), []);
  assert.deepEqual(state.rollRune2DropForStage('observedbranch-tree-sovereign-1', () => 0), []);
});

test('Blacksmith cannot unlock a Rune but can level one after its real drop', () => {
  resetRunes();
  assert.equal(state.forgeRune2('wise', 1), false);
  state.rollRune2DropForStage('3-2', () => 0);
  const gold = state.data.gold;
  const manastone = state.data.manastone;
  const result = state.forgeRune2('wise', 1);
  assert.equal(result.levels, 1);
  assert.equal(state.rune2OwnedMarks('wise'), 2);
  assert.equal(state.data.gold, gold - result.gold);
  assert.equal(state.data.manastone, manastone - result.manastone);
});

test('legacy oversized marks remain stored but their active gameplay value is capped', () => {
  resetRunes();
  state.data.rune2Owned.force = 99999;
  state.data.rune2Active.force = 99999;
  state.data.rune2Discovered.force = true;
  assert.equal(state.rune2OwnedMarks('force'), 100);
  assert.equal(state.rune2ActiveMarks('force'), 100);
  assert.equal(state.data.rune2Owned.force, 99999);
});

test('new Rune effects change the real BattleEngine hooks with bounded values', () => {
  resetRunes();
  const active = {
    hawkeye:500, windfoot:500, piercing:500, fierce_strike:1000,
    critical_edge:1000, slayer:625, gold:1000, insight:1000,
    prosperity:1000, gale:1000, purge:1000, branch_point:1000,
  };
  state.data.rune2Owned = { ...active };
  state.data.rune2Active = { ...active };
  state.data.rune2Discovered = Object.fromEntries(Object.keys(active).map((id) => [id, true]));
  const engine = new BattleEngine('1-1');
  assert.equal(engine._effectiveCritPct(), Math.min(75, engine.player.critPct + 10));
  assert.equal(engine._effectiveEvasion(), .1);
  assert.equal(engine._effectiveArmorPen(), .1);
  assert.equal(engine._mainDmgMult('normal'), 2.3);
  assert.equal(engine._critDamageBoostMult(), 1.5);
  assert.equal(engine._bossDmgMult({ boss:true }), 1.5);
  assert.equal(engine._effectiveEnemyStat({ spd:100 }, 'spd'), 50);
  assert.equal(engine._expMult(), 2.3);
  assert.equal(engine._goldMult(), 2.8);
});
