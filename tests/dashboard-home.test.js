import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path) {
  return readFile(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('character dashboard exposes the growth tab and saved progression', async () => {
  const text = await source('js/screens/status.js');
  assert.match(text, /\['growth','成長'\]/);
  assert.match(text, /state\.data\.reincarnations/);
  assert.match(text, /state\.data\.awakenings/);
  assert.match(text, /state\.data\.abyssBestDepth/);
  assert.match(text, /state\.data\.weaponMastery/);
  assert.match(text, /state\.companionList/);
  assert.match(text, /state\.characterExpToNext\(state\.characterLevel\)/);
  assert.match(text, /state\.expToNext\(state\.currentJobLevel\)/);
  assert.match(text, /最高到達Lv/);
});

test('home navigation groups existing buttons without replacing their IDs', async () => {
  const text = await source('js/patches/homeNavigation.js');
  assert.match(text, /adventureLabel\.textContent = '冒険する'/);
  assert.match(text, /title: 'キャラクター'/);
  assert.match(text, /title: '装備'/);
  assert.match(text, /title: '記録'/);
  for (const id of ['goStageBtn','goAbyssBtn','goStatusBtn','goCompanionBtn','goEquipBtn','goJobBtn','goBlacksmithBtn','goRebirthBtn','goSpellBtn']) {
    assert.match(text, new RegExp(id));
  }
  assert.match(text, /menu\.dataset\.uiFoundation3 === 'true'/, 'grouping must be idempotent');
});

test('home navigation loads after companion UI has installed its button', async () => {
  const text = await source('js/main.js');
  const companion = text.indexOf("./patches/companionRecruitment.js");
  const home = text.indexOf("./patches/homeNavigation.js");
  assert.ok(companion >= 0 && home > companion, 'home grouping must run after companion patches');
});
