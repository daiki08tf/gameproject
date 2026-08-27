import test from 'node:test';
import assert from 'node:assert/strict';
import {
  OPTION_RARITY,
  OPTION_NAME_LADDERS,
  OPTION_FAMILY_CURVES,
  optionDisplayName,
  optionValueAtLevel,
  optionStartingLevel,
  applyAuthoredOptionValue,
} from '../js/data/options4.js';

const CORE = ['atk_pct','mag_pct','def_pct','hp_pct','mp_pct','spd_pct','crit_pct','evasion_pct','armorpen_pct'];

test('Phase 1B authors seven rarity names for all nine core stat Option families', () => {
  assert.equal(OPTION_RARITY.length, 7);
  for (const id of CORE) {
    assert.ok(OPTION_FAMILY_CURVES[id], id);
    assert.deepEqual(Object.keys(OPTION_NAME_LADDERS[id]), OPTION_RARITY, id);
    assert.ok(OPTION_RARITY.every((rarity) => optionDisplayName(id, rarity).length > 0), id);
  }
  assert.equal(optionDisplayName('atk_pct', 'common'), '怪力');
  assert.equal(optionDisplayName('atk_pct', 'legendary'), '覇力');
  assert.equal(optionDisplayName('atk_pct', 'ancient'), '天威');
});

test('Phase 1C rarity and Option Lv both materially increase core Option value', () => {
  const common1 = optionValueAtLevel('atk_pct', 'common', 1);
  const common100 = optionValueAtLevel('atk_pct', 'common', 100);
  const ancient1 = optionValueAtLevel('atk_pct', 'ancient', 1);
  const ancient100 = optionValueAtLevel('atk_pct', 'ancient', 100);
  assert.ok(common100 > common1 * 3, { common1, common100 });
  assert.ok(ancient1 > common1, { common1, ancient1 });
  assert.ok(ancient100 > common100, { common100, ancient100 });
  assert.ok(ancient100 >= 35, { ancient100 });
});

test('drop-time Option Lv rises with Item Power but natural drops do not reach Lv100', () => {
  const low = Array.from({ length: 50 }, (_, i) => optionStartingLevel(100, {}, `low:${i}`));
  const high = Array.from({ length: 50 }, (_, i) => optionStartingLevel(10000, { boss: true, nemesis: true }, `high:${i}`));
  assert.ok(Math.max(...low) <= 12, Math.max(...low));
  assert.ok(Math.min(...high) >= 35, Math.min(...high));
  assert.ok(Math.max(...high) <= 97, Math.max(...high));
  assert.ok(high.reduce((a,b)=>a+b,0) / high.length > low.reduce((a,b)=>a+b,0) / low.length);
});

test('Phase 1D writes authored core value into the legacy roll field for combat compatibility', () => {
  const out = applyAuthoredOptionValue(
    { id:'def_pct', rarity:'legendary', roll:1 },
    { itemPower:8000, ctx:{ boss:true }, key:'def-test', initializeLevel:true },
  );
  assert.equal(out.familyId, 'def_pct');
  assert.equal(out.optionSchemaVersion, 1);
  assert.equal(out.optionValueVersion, 1);
  assert.ok(out.level > 1 && out.level < 100, out.level);
  assert.equal(out.roll, optionValueAtLevel('def_pct', 'legendary', out.level));
});

test('non-authored families remain on legacy roll until their curve is deliberately migrated', () => {
  const out = applyAuthoredOptionValue(
    { id:'lifesteal', rarity:'rare', roll:4.25 },
    { itemPower:9000, ctx:{ boss:true }, key:'legacy-test', initializeLevel:true },
  );
  assert.equal(out.familyId, 'lifesteal');
  assert.equal(out.roll, 4.25);
  assert.ok(out.level > 1 && out.level < 100);
  assert.equal(out.optionValueVersion, undefined);
});
