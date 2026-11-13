// Battle Tempo (2026-11 rebalance): story-chapter enemies get shorter and
// sharper as chapters advance, through one layer applied in one place.
// Pins the contract that keeps this from leaking into chapter 1 (whose
// difficulty the user explicitly kept) or into Abyss/Rift/side content.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { BATTLE_TEMPO_LAYER, battleTempoMult, ENEMY_SCALING } from '../js/data/balance.js';

const close = (a, b) => Math.abs(a - b) < 1e-9;

test('chapter 1 is untouched and the ramp ends at the configured values', () => {
  for (const key of ['HP_AT_TO', 'ATK_AT_TO', 'BOSS_HP_AT_TO', 'BOSS_ATK_AT_TO']) {
    assert.equal(battleTempoMult(1, key), 1, `${key} must not change chapter 1`);
    assert.equal(battleTempoMult(undefined, key), 1);
    assert.equal(battleTempoMult(NaN, key), 1);
  }
  const L = BATTLE_TEMPO_LAYER;
  assert.ok(close(battleTempoMult(L.HP_TO, 'HP_AT_TO'), L.HP_AT_TO));
  assert.ok(close(battleTempoMult(48, 'HP_AT_TO'), L.HP_AT_TO), 'flat after the ramp');
  assert.ok(close(battleTempoMult(L.ATK_TO, 'ATK_AT_TO'), L.ATK_AT_TO));
  assert.ok(close(battleTempoMult(L.ATK_TO, 'BOSS_ATK_AT_TO'), L.BOSS_ATK_AT_TO));
  assert.ok(close(battleTempoMult(L.ATK_LATE_TO, 'ATK_AT_TO'), L.ATK_AT_TO * Math.pow(L.ATK_LATE_RATE, L.ATK_LATE_TO - L.ATK_TO)));
  assert.equal(battleTempoMult(48, 'ATK_AT_TO'), battleTempoMult(L.ATK_LATE_TO, 'ATK_AT_TO'), 'attack growth stops at ATK_LATE_TO');
  assert.equal(battleTempoMult(L.ATK_FROM, 'ATK_AT_TO'), 1, 'attack pressure starts after ATK_FROM');
});

test('the ramp is monotonic: enemies only get shorter-lived and harder-hitting', () => {
  for (let n = 1; n < 20; n++) {
    assert.ok(battleTempoMult(n + 1, 'HP_AT_TO') <= battleTempoMult(n, 'HP_AT_TO'));
    assert.ok(battleTempoMult(n + 1, 'ATK_AT_TO') >= battleTempoMult(n, 'ATK_AT_TO'));
  }
  assert.ok(BATTLE_TEMPO_LAYER.BOSS_HP_AT_TO >= BATTLE_TEMPO_LAYER.HP_AT_TO, 'bosses keep more of their HP than trash');
});

test('it is applied once, only to story chapters, and ENEMY_SCALING is left as calibrated', () => {
  const src = fs.readFileSync(new URL('../js/patches/combat3DifficultyRebalance.js', import.meta.url), 'utf8');
  assert.equal(src.match(/battleTempoMult\(/g).length, 2, 'one HP and one ATK application for story chapters');
  // Abyss proper gets its own flat multipliers; templates built from Abyss stages (secret realms etc.) do not.
  assert.match(src, /else if \(this\.stage\?\.isAbyss && String\(this\.stage\.id \|\| ''\)\.startsWith\('abyss-'\)\)/);
  assert.match(src, /\/\^ch\\d\+\$\/\.test\(this\.chapter\?\.id \|\| ''\) && !this\.stage\?\.isAbyss && !this\.stage\?\.isRift/);
  const others = fs.readdirSync(new URL('../js/patches/', import.meta.url)).filter((f) => f !== 'combat3DifficultyRebalance.js')
    .filter((f) => fs.readFileSync(new URL(`../js/patches/${f}`, import.meta.url), 'utf8').includes('battleTempoMult'));
  assert.deepEqual(others, []);
  assert.equal(ENEMY_SCALING.HP_LATE_RATE, 1.22);
  assert.equal(ENEMY_SCALING.ATK_LATE_RATE, 1.16);
});
