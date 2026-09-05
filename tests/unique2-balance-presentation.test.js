import test from 'node:test';
import assert from 'node:assert/strict';
import {
  UNIQUE2_WEAPON_IDENTITIES,
  unique2IdentityById,
} from '../js/data/unique2IdentityLibrary.js';
import { BOUNTY_UNIQUES } from '../js/data/uniqueEquipment.js';
import {
  fixedEquipmentIdentities,
  fixedIdentitySummary,
  FIXED_IDENTITY_KIND,
} from '../js/data/equipmentFixedIdentity.js';

const allIdentities = Object.values(UNIQUE2_WEAPON_IDENTITIES).flat();

function effectOf(identity, kind) {
  return identity.effects.find((effect) => effect.kind === kind) || null;
}

test('Unique 2.0 proc and specialization recipes stay inside authored safety envelopes', () => {
  for (const identity of allIdentities) {
    for (const effect of identity.effects) {
      switch (effect.kind) {
        case 'critExtraAttack':
          assert.ok(effect.chance <= 0.22, `${identity.id}: crit follow-up chance`);
          assert.ok(effect.power <= 0.62, `${identity.id}: crit follow-up power`);
          assert.equal(effect.perActionCap, 1, `${identity.id}: crit follow-up needs per-action cap`);
          break;
        case 'spellEcho':
          assert.ok(effect.chance <= 0.15, `${identity.id}: spell echo chance`);
          assert.equal(effect.spellOnly, true, `${identity.id}: spell echo must stay spell-only`);
          break;
        case 'hitApplyDot':
          assert.ok(effect.chance <= 0.20, `${identity.id}: DoT proc chance`);
          assert.ok(effect.power <= 0.42, `${identity.id}: DoT proc power`);
          assert.ok(effect.maxStacks <= 4, `${identity.id}: DoT max stacks`);
          assert.equal(effect.perActionCap, 1, `${identity.id}: DoT application needs per-action cap`);
          break;
        case 'executioner':
          assert.ok(effect.power <= 0.30, `${identity.id}: execution bonus`);
          assert.ok(effect.hpThreshold <= 0.25, `${identity.id}: execution threshold`);
          break;
        case 'actionDiversityBuff':
          assert.ok(effect.power <= 0.22, `${identity.id}: diversity bonus`);
          assert.ok(effect.turns <= 3, `${identity.id}: diversity duration`);
          break;
        case 'guardCounter':
          assert.ok(effect.power <= 0.72, `${identity.id}: guard counter power`);
          break;
        case 'guardNextAtkBuff':
          assert.ok(effect.power <= 0.58, `${identity.id}: guard-next-attack power`);
          break;
        case 'spellArmsStarStrike':
          assert.ok(effect.magRatio <= 0.72, `${identity.id}: spell-arms MAG ratio`);
          break;
        case 'healOnKill':
        case 'mpOnKill':
          assert.ok(effect.power <= 0.04, `${identity.id}: kill sustain`);
          break;
        case 'highHpDoubleAttack':
          assert.ok(effect.threshold >= 0.50 && effect.threshold <= 0.70, `${identity.id}: high-HP threshold`);
          break;
        case 'defPenalty':
          assert.ok(effect.power <= 0.15, `${identity.id}: recipe defensive tradeoff`);
          break;
        case 'bossDmg':
          assert.ok(effect.power <= 0.30, `${identity.id}: boss specialization`);
          break;
        case 'normalEnemyDmgPenalty':
          assert.ok(effect.power <= 0.15, `${identity.id}: normal-enemy tradeoff`);
          break;
        case 'noRecoveryDmgBonus':
          assert.ok(effect.power > 0 && effect.power <= 0.22, `${identity.id}: absence damage bonus`);
          break;
        case 'burnDamage':
          assert.ok(effect.chance <= 0.30, `${identity.id}: burn proc chance`);
          assert.ok(effect.power <= 0.35, `${identity.id}: burn proc power`);
          break;
        default:
          assert.fail(`${identity.id}: ungated Unique 2.0 effect kind ${effect.kind}`);
      }
    }

    const boss = effectOf(identity, 'bossDmg');
    if (boss) {
      assert.ok(effectOf(identity, 'normalEnemyDmgPenalty'), `${identity.id}: Boss specialization needs an explicit opportunity cost`);
    }
  }
});

test('Unique 2.0 uses the existing UNIQUE FIXED detail to show identity name and combat loop', () => {
  const mapped = BOUNTY_UNIQUES.filter((item) => item.slot === 'weapon' && item.unique2IdentityId);
  assert.equal(new Set(mapped.map((item) => item.weaponType)).size, 8);

  for (const item of mapped) {
    const authored = unique2IdentityById(item.unique2IdentityId);
    const [fixed] = fixedEquipmentIdentities(item);
    assert.equal(fixed.kind, FIXED_IDENTITY_KIND.UNIQUE);
    assert.equal(fixed.name, authored.name, `${item.id}: detail should show identity name`);
    assert.equal(fixed.desc, authored.loop, `${item.id}: detail should explain the combat loop`);
    assert.equal(fixed.sourceItemName, item.name);
    assert.equal(fixed.identityId, authored.id);
    assert.deepEqual(fixed.buildLaneIds, authored.buildLaneIds);
    assert.equal(fixed.consumesOptionSlot, false);
    assert.equal(fixed.optionFusionEligible, false);
    assert.match(fixedIdentitySummary(fixed), new RegExp(authored.name));
    assert.match(fixedIdentitySummary(fixed), new RegExp(authored.loop.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  }
});

test('legacy Unique presentation is unchanged when no Unique 2.0 identity is mapped', () => {
  const legacy = BOUNTY_UNIQUES.find((item) => item.id === 'uq_ash_knight_shield');
  const [fixed] = fixedEquipmentIdentities(legacy);
  assert.equal(fixed.name, legacy.name);
  assert.equal(fixed.desc, legacy.lore);
  assert.equal(fixed.identityId, null);
  assert.deepEqual(fixed.buildLaneIds, []);
});
