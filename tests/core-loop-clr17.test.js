import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CLR17_REGION_LOOT_PROFILES,clr17MergeDropContext } from '../js/data/coreLoopClr17.js';

const targetFarm=fs.readFileSync('js/patches/loot3RealmTargetFarm.js','utf8');
const ui=fs.readFileSync('js/patches/coreLoopClr17LootIdentityUi.js','utf8');
const home=fs.readFileSync('js/patches/homeNavigation.js','utf8');

test('CLR-17 gives frontier and elemental distinct bounded Hunt targets',()=>{
  assert.deepEqual(CLR17_REGION_LOOT_PROFILES.frontier.preferredAffixIds,['atk_pct','def_pct','hp_pct','dmg_boss']);
  assert.deepEqual(CLR17_REGION_LOOT_PROFILES.elemental.preferredAffixIds,['mag_pct','mp_pct','dmg_spell','spd_pct']);
  assert.ok(CLR17_REGION_LOOT_PROFILES.frontier.targetAffixChance>0&&CLR17_REGION_LOOT_PROFILES.frontier.targetAffixChance<0.5);
  assert.equal(CLR17_REGION_LOOT_PROFILES.frontier.targetAffixChance,CLR17_REGION_LOOT_PROFILES.elemental.targetAffixChance);
});

test('CLR-17 enriches ordinary context without replacing an existing canonical target farm',()=>{
  const regional=clr17MergeDropContext({itemPower:123},'frontier');
  assert.equal(regional.itemPower,123);
  assert.equal(regional.targetFarm,'region:frontier');
  assert.deepEqual(regional.preferredAffixIds,CLR17_REGION_LOOT_PROFILES.frontier.preferredAffixIds);

  const realm={preferredAffixIds:['mag_pct'],targetAffixChance:.9,targetFarm:'realm:test'};
  assert.equal(clr17MergeDropContext(realm,'frontier'),realm);
});

test('CLR-17 applies Region identity only to active free-adventure Hunt routes',()=>{
  assert.match(targetFarm,/session\.routeId[\s\S]*endsWith\('-free-adventure'\)/);
  assert.match(targetFarm,/clr17MergeDropContext\(dropCtx, session\.regionId\)/);
  assert.match(targetFarm,/previousAddItem\(itemId, qty, ctx\)/);
});

test('CLR-17 reuses existing target-farm steering and preserves Equipment authority',()=>{
  assert.match(targetFarm,/applyItemPowerAffixQuality\(inst, ctx, instanceId\)/);
  assert.match(targetFarm,/steerRealmAffix\(inst, ctx, id\)/);
  assert.doesNotMatch(targetFarm,/newRarity|huntCurrency|huntXp|huntLevel/i);
});

test('CLR-17 tells the player why to Hunt a Region without promising new Unique rules',()=>{
  assert.match(home,/import '\.\/coreLoopClr17LootIdentityUi\.js'/);
  assert.match(ui,/狙い目：\$\{profile\.label\}/);
  assert.match(ui,/Elite \/ Bossまで進むほど通常の戦闘報酬機会も増える/);
  assert.match(ui,/Item Power・rarity・Unique取得条件は既存ルールのまま/);
});
