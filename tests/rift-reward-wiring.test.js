// DBG-14: Rift key reward prefixes (大いなる/伝説の/古代の) and the Abyss
// challenges that advertise Greater/Legendary rates used to be declared on the
// stage and never read by any roll. This pins the cross-file contract:
// riftKeys/abyssChallenges field -> endgameDropContextFix ctx field -> roll.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { greaterAffixChance } from '../js/data/equipment3Greater.js';
import { legendaryEffectChance } from '../js/data/equipment3Legendary.js';
import { affixRarityWeightsForItemPower } from '../js/data/equipment3AffixQuality.js';
import { riftReward } from '../js/data/riftKeys.js';
import { buildRiftStage } from '../js/data/riftStages.js';

const close = (a, b) => Math.abs(a - b) < 1e-9;

test('roll functions honour the relative multipliers and keep their caps', () => {
  const g0 = greaterAffixChance(6000, {});
  assert.ok(g0 > 0);
  assert.ok(close(greaterAffixChance(6000, { greaterChanceMult: 1.35 }), g0 * 1.35));
  assert.equal(greaterAffixChance(10000, { nemesis: true, greaterChanceMult: 9 }), 0.30);
  assert.equal(greaterAffixChance(6000, { greaterChanceMult: 0.2 }), g0, 'a multiplier never lowers the chance');

  const item = { rarity: 'legendary' };
  const l0 = legendaryEffectChance(item, 5000, {});
  assert.ok(close(legendaryEffectChance(item, 5000, { legendaryChanceMult: 1.2 }), l0 * 1.2));
  assert.equal(legendaryEffectChance(item, 10000, { nemesis: true, legendaryChanceMult: 9 }), 0.70);

  const w0 = affixRarityWeightsForItemPower(8000, {});
  const w1 = affixRarityWeightsForItemPower(8000, { ancientWeightMult: 1.08 });
  assert.ok(close(w1.ancient, w0.ancient * 1.08));
  assert.equal(w1.mythic, w0.mythic);
});

test('every Rift reward prefix has a consumer for its field', () => {
  const ctxSource = fs.readFileSync(new URL('../js/patches/endgameDropContextFix.js', import.meta.url), 'utf8');
  const keySource = fs.readFileSync(new URL('../js/data/riftKeys.js', import.meta.url), 'utf8');
  assert.equal(riftReward('greater').greaterBonus, 0.35);
  assert.equal(riftReward('legend').legendaryBonus, 0.20);
  assert.equal(riftReward('ancient').ancientBonus, 1.0);
  for (const id of ['greater', 'legend', 'power', 'treasure', 'ancient']) assert.ok(riftReward(id).desc, `${id} tells the player what it does`);
  for (const [field, ctxField] of [['greaterBonus', 'greaterChanceMult'], ['legendaryBonus', 'legendaryChanceMult'], ['ancientBonus', 'ancientWeightMult']]) {
    assert.match(ctxSource, new RegExp(`${ctxField}:[^\\n]*rel\\('${field}'\\)`));
  }
  assert.match(ctxSource, /stage\.isRift \? \(stage\.riftReward/);
  assert.match(ctxSource, /stage\.isAbyss \? \(stage\.abyssChallengeRewards/);
  // 高位の is applied when the key is generated; 黄金の through stage.dropMult.
  assert.match(keySource, /reward\.id==='power'\?1\+\(reward\.itemPowerBonus/);
  const stage = buildRiftStage({ id: 't', recLevel: 5000, itemPowerTarget: 5000, dangers: [], reward: 'treasure' });
  assert.equal(stage.dropMult, 1.5);
  assert.equal(buildRiftStage({ id: 'g', recLevel: 5000, itemPowerTarget: 5000, dangers: [], reward: 'greater' }).riftReward.greaterBonus, 0.35);
});
