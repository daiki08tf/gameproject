// Session 7 — World Off the Main Road II / Monster Hunting / Tactical Combat 2.0 /
// Loot Evolution 2.0:
//   - 12の新規探索地点の登録・参照整合・進行非混入
//   - 地点可視状態（open / field-locked / foreshadow / hidden）
//   - Monster Field Ability（所有仲間由来の開錠判定）
//   - アイテム位階（rank）抽選の境界値と「鍛冶は位階を作らない」制約
//   - 地点署名Affixの生息地ゲート（地点タグなしでは絶対に出ない）
//   - Formation（隊列）係数と絆ゲート付き号令
//   - Denlord 再臨/超再臨の導出解放（既存進行からの additive 状態）
//   - Arc VIII（ch42–45）の章・敵・装備・Boss profile 参照整合
import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { CHAPTERS, findStage, isChapterUnlocked, finalStageOf } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem, allItems, RARITY_ORDER } from '../js/data/equipment.js';
import { getRune } from '../js/data/runes.js';
import { nextStageAfter } from '../js/data/resultNextStage.js';
import {
  sideLocationVisibility, sideLocationForeshadowed, sideLocationRequiresField,
} from '../js/data/sideLocations.js';
import { SIDE_LOCATION_CHAPTERS_2 } from '../js/data/sideLocations2.js';
import { FIELD_ABILITIES, fieldAbilitiesForSpecies } from '../js/data/fieldAbilities.js';
import { ITEM_RANKS, rollItemRank, itemRankStatMult, effectiveItemRank } from '../js/data/itemRanks.js';
import { generateWeaponAffixes, AFFIXES } from '../js/data/affixes.js';
import { bossEncounterProfile } from '../js/data/bossEncounters.js';
import { COMPANION_ORDERS, COMPANION_FORMATION } from '../js/patches/companionBattle.js';
import { ROAMERS } from '../js/data/roamers.js';
import { DENLORDS } from '../js/data/denlords.js';
import { BattleEngine } from '../js/battleEngine.js';
import { getCompanionSpecies } from '../js/data/companions.js';

function fresh() {
  state.data.stageProgress = {};
  state.data.speciesMastery = {};
  state.data.claimedMilestones = {};
  state.data.monsterCodex = {};
  state.data.companionInstances = {};
  state.data.companionParty = [];
  state.data.denlordPrestigeClears = {};
  state.data.weaponInstances = {};
  state.data.inventory = {};
  state.data.nextInstanceSeq = 1;
  state.data.gold = 0;
  state.data.manastone = 0;
}

function installCompanionStubs() {
  if (!state.getCompanion) {
    state.getCompanion = function getCompanionStub(id) {
      const inst = this.data.companionInstances?.[id];
      if (!inst) return null;
      const species = getCompanionSpecies(inst.speciesId);
      if (!species) return null;
      return { id, species, instance: inst, stats: { hp: 60, mp: 12, atk: 10, def: 8, mag: 6, spd: 8 } };
    };
  }
  if (!state.activeCompanions) {
    state.activeCompanions = function activeCompanionsStub() {
      return (this.data.companionParty || []).map(id => this.getCompanion(id)).filter(Boolean);
    };
  }
}

// ---- 探索地点2（12箇所） ---------------------------------------------

test('Session7: twelve new side locations are registered as non-progression chapters', () => {
  assert.equal(SIDE_LOCATION_CHAPTERS_2.length, 12);
  for (const ch of SIDE_LOCATION_CHAPTERS_2) {
    const idx = CHAPTERS.findIndex(c => c.id === ch.id);
    assert.ok(idx >= 0, `${ch.id} must be registered in CHAPTERS`);
    assert.equal(ch.sideLocation, true);
    assert.equal(ch.gaiden, true, `${ch.id} keeps the gaiden flag`);
    assert.ok(ch.unlocksAfter, `${ch.id} needs an authored unlock beat`);
    assert.ok(findStage(ch.unlocksAfter)?.stage, `${ch.id} unlocksAfter '${ch.unlocksAfter}' must resolve`);
    for (const s of ch.stages) assert.equal(findStage(s.id)?.stage.id, s.id);
  }
});

test('Session7: side locations never chain into or from main-story stage progression', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS_2) {
    for (const s of ch.stages) assert.equal(nextStageAfter(s), null, `${s.id} must not chain`);
  }
});

test('Session7: side-location stage refs resolve — enemies, equipment, runes, roamer lairs', () => {
  const itemIds = new Set(allItems().map(i => i.id));
  for (const ch of SIDE_LOCATION_CHAPTERS_2) {
    for (const s of ch.stages) {
      for (const wave of s.waves) {
        const t = wave.type.startsWith('roamer:') ? wave.type.slice(7) : wave.type;
        if (wave.type.startsWith('roamer:')) assert.ok(ROAMERS[t], `${s.id} lair roamer '${t}' must exist in ROAMERS`);
        else assert.ok(ENEMY_TYPES[wave.type], `${s.id} wave type '${wave.type}' missing from ENEMY_TYPES`);
      }
      for (const drop of s.dropTable || []) assert.ok(itemIds.has(drop.itemId) || getRune(drop.itemId), `${s.id} dropTable '${drop.itemId}' must resolve`);
      if (s.firstClear?.itemId) assert.ok(itemIds.has(s.firstClear.itemId) || getRune(s.firstClear.itemId), `${s.id} firstClear '${s.firstClear.itemId}' must resolve`);
      if (s.encounterPool) {
        for (const entry of [...s.encounterPool.types, ...(s.encounterPool.rareTypes || [])]) {
          assert.ok(ENEMY_TYPES[entry.type], `${s.id} pool type '${entry.type}' missing`);
        }
      }
    }
  }
});

// ---- 可視状態 / 予兆 / Field Ability --------------------------------

test('Session7: field-locked locations report field-locked until the requirement is owned', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS_2) {
    const req = sideLocationRequiresField(ch);
    if (!req?.length) continue;
    assert.ok(isChapterUnlocked(CHAPTERS.indexOf(ch), id => id === ch.unlocksAfter), `${ch.id} prerequisite resolves`);
    assert.equal(sideLocationVisibility(ch, { unlocked: true, foreshadowed: false, fieldOk: false }), 'field-locked', `${ch.id} must be field-locked without the ability`);
    assert.equal(sideLocationVisibility(ch, { unlocked: true, foreshadowed: false, fieldOk: true }), 'open', `${ch.id} opens once the ability is owned`);
  }
});

test('Session7: foreshadowed locations surface as ??? before their unlock beat', () => {
  const foreshadowable = SIDE_LOCATION_CHAPTERS_2.filter(ch => ch.foreshadowAfter);
  assert.ok(foreshadowable.length >= 3, 'several locations should be foreshadowed');
  for (const ch of foreshadowable) {
    const cleared = id => id === ch.foreshadowAfter;
    assert.equal(sideLocationForeshadowed(ch, cleared), true, `${ch.id} foreshadows after ${ch.foreshadowAfter}`);
    assert.equal(sideLocationVisibility(ch, { unlocked: false, foreshadowed: true, fieldOk: false }), 'foreshadow');
    assert.equal(sideLocationForeshadowed(ch, () => false), false);
  }
  // hidden地点は予兆も出さない
  const hidden = SIDE_LOCATION_CHAPTERS_2.find(ch => ch.poiKind === 'hidden' && !ch.foreshadowAfter);
  if (hidden) {
    assert.equal(sideLocationVisibility(hidden, { unlocked: false, foreshadowed: false, fieldOk: false }), 'hidden');
  }
});

test('Session7: field abilities derive from owned companions by family or species tag', () => {
  for (const [id, ab] of Object.entries(FIELD_ABILITIES)) {
    assert.ok(ab.label && ab.desc, `field ability '${id}' needs a label and desc`);
  }
  const slimeSpecies = getCompanionSpecies('slime');
  assert.ok(slimeSpecies, 'slime species must exist');
  const abilities = fieldAbilitiesForSpecies(slimeSpecies);
  assert.ok(abilities.includes('fissure'), 'slime family grants fissure');
  const bat = getCompanionSpecies('bat');
  assert.ok(fieldAbilitiesForSpecies(bat).includes('soar'), 'bat species tag grants soar');
  // soarはfamily推論ではなく個別タグ — 誤付与されていないか1件確認
  const crab = getCompanionSpecies('crab');
  if (crab) assert.ok(!fieldAbilitiesForSpecies(crab).includes('soar'), 'non-flying species must not grant soar');
});

// ---- アイテム位階 -----------------------------------------------------

test('Session7: rank ladder extends past mythic with relic and primordial', () => {
  assert.deepEqual(ITEM_RANKS, ['normal', 'rare', 'epic', 'legendary', 'mythic', 'relic', 'primordial']);
  assert.deepEqual(RARITY_ORDER, ITEM_RANKS);
});

test('Session7: plain drops cannot reach the top ranks; context is required', () => {
  const rareWeapon = { rarity: 'rare', slot: 'weapon' };
  const normal = { rarity: 'normal', slot: 'weapon' };
  for (let i = 0; i < 3000; i++) {
    assert.ok(['rare', 'epic'].includes(rollItemRank(rareWeapon, {})), 'plain rare drop must stay rare/epic');
    assert.ok(['normal', 'rare'].includes(rollItemRank(normal, {})), 'plain normal drop must stay normal/rare');
  }
  let sawLegendary = false;
  for (let i = 0; i < 4000; i++) {
    const r = rollItemRank(rareWeapon, { boss: true, rankBonus: .18 });
    assert.ok(['rare', 'epic', 'legendary', 'primordial'].includes(r), `unexpected rank ${r} from rare drop`);
    if (r === 'legendary') sawLegendary = true;
  }
  assert.ok(sawLegendary, 'secret-boss context must be able to upgrade a rare drop');
});

test('Session7: primordial only comes from the deepest contexts and stays very rare', () => {
  const legendaryWeapon = { rarity: 'legendary', slot: 'weapon' };
  for (let i = 0; i < 500; i++) {
    assert.notEqual(rollItemRank(legendaryWeapon, {}), 'primordial');
    assert.notEqual(rollItemRank(legendaryWeapon, { boss: true }), 'primordial');
  }
  let primordial = 0, relic = 0;
  for (let i = 0; i < 20000; i++) {
    const r = rollItemRank(legendaryWeapon, { boss: true, rankBonus: .18 });
    if (r === 'primordial') primordial++;
    if (r === 'relic') relic++;
  }
  assert.ok(primordial > 0 && primordial / 20000 < .02, 'primordial must exist but stay below ~2%');
  assert.ok(relic > 0, 'relic must be reachable on top-tier secret drops');
});

test('Session7: rank stat multiplier only exists when the instance actually upgraded', () => {
  const item = { rarity: 'rare' };
  assert.equal(itemRankStatMult(item, null), 1);
  assert.equal(itemRankStatMult(item, {}), 1, 'old saves without rank field are unaffected');
  assert.equal(effectiveItemRank(item, {}), 'rare');
  assert.ok(itemRankStatMult(item, { rank: 'relic' }) > 1);
  assert.ok(itemRankStatMult(item, { rank: 'primordial' }) > itemRankStatMult(item, { rank: 'relic' }));
});

// ---- 地点署名Affix -----------------------------------------------------

test('Session7: location-signature affixes only roll in matching habitats', () => {
  const item = { rarity: 'epic', slot: 'weapon', weaponType: 'sword' };
  const locIds = Object.keys(AFFIXES).filter(id => AFFIXES[id].locTags);
  assert.ok(locIds.length >= 5, 'several location-signature affixes exist');
  for (let i = 0; i < 600; i++) {
    for (const a of generateWeaponAffixes(item, {})) {
      assert.ok(!locIds.includes(a.id), `location affix ${a.id} must never roll without locTags`);
    }
  }
  let sawBeast = false;
  for (let i = 0; i < 800 && !sawBeast; i++) {
    for (const a of generateWeaponAffixes(item, { locTags: ['beast'] })) {
      if (a.id === 'loc_beastmark') sawBeast = true;
    }
  }
  assert.ok(sawBeast, 'beast habitat must be able to roll 追獣の痕');
});

test('Session7: affixBiasCats biases the pool toward the authored category', () => {
  const item = { rarity: 'epic', slot: 'weapon', weaponType: 'sword' };
  const count = ctx => {
    const cats = {};
    for (let i = 0; i < 400; i++) {
      for (const a of generateWeaponAffixes(item, ctx)) {
        const c = AFFIXES[a.id]?.category || 'OTHER';
        cats[c] = (cats[c] || 0) + 1;
      }
    }
    return cats;
  };
  const biased = count({ affixBiasCats: ['SPEED'] });
  const plain = count({});
  assert.ok((biased.SPEED || 0) > (plain.SPEED || 0), 'SPEED bias must raise SPEED affix share');
});

// ---- Formation / 号令 --------------------------------------------------

test('Session7: formation assigns front/center/rear semantics to the three slots', () => {
  assert.equal(COMPANION_FORMATION[0].key, 'front');
  assert.equal(COMPANION_FORMATION[1].key, 'center');
  assert.equal(COMPANION_FORMATION[2].key, 'rear');
  assert.ok(COMPANION_FORMATION[0].targetWeight > COMPANION_FORMATION[2].targetWeight, 'front must draw more attacks than rear');
  assert.ok(COMPANION_FORMATION[2].magMult > 1, 'rear should favor casters');
});

test('Session7: bond-gated orders reject without the required bond level', () => {
  installCompanionStubs();
  fresh();
  state.data.companionInstances['t1'] = { id: 't1', speciesId: 'slime', level: 5, rarity: 'normal', nature: 'balanced' };
  state.data.companionParty = ['t1'];
  const eng = new BattleEngine('1-1');
  assert.deepEqual(Object.keys(COMPANION_ORDERS).sort(), ['brace', 'charge', 'focus', 'protect', 'rally', 'unleash']);
  for (const id of ['protect', 'rally', 'charge']) assert.equal(eng.issueCompanionOrder(id), false, `${id} must reject at Bond Lv1`);
  state.companionBond = () => ({ level: 10 });
  const eng2 = new BattleEngine('1-1');
  assert.equal(eng2.issueCompanionOrder('protect'), true, 'Bond Lv10 unlocks protect');
  assert.equal(eng2.issueCompanionOrder('rally'), true);
  assert.equal(eng2.issueCompanionOrder('charge'), true);
  delete state.companionBond;
});

// ---- Denlord 2.0 --------------------------------------------------------

test('Session7: super-prestige denlord profiles and recruitment floors exist', () => {
  for (const d of Object.values(DENLORDS)) {
    assert.ok(d.super, `${d.id} needs a super-prestige profile`);
    assert.equal(d.super.recruitRarity, 'mythic', 'super-prestige recruits at mythic floor');
    assert.equal(d.super.trait, '超再臨', 'super-prestige recruits inherit 超再臨');
    assert.ok(d.prestige, `${d.id} keeps its prestige profile`);
  }
  for (const type of ['bt_denlord', 'tp_denlord', 'af_denlord']) {
    const p = bossEncounterProfile(`${type}__super`);
    assert.ok(p, `${type}__super boss profile must exist`);
    assert.ok(p.phases?.length >= 2, `${type}__super should run two authored phases`);
    assert.ok(p.counterHint, `${type}__super needs a counter hint`);
  }
});

test('Session7: roamer lair waves reference real roamers with territorial intel', () => {
  for (const ch of SIDE_LOCATION_CHAPTERS_2) {
    for (const s of ch.stages) {
      for (const w of s.waves.filter(w => w.type.startsWith('roamer:'))) {
        const roamer = ROAMERS[w.type.slice(7)];
        assert.ok(roamer?.territory?.lairStage, `lair roamer '${w.type}' must declare a lair stage`);
        assert.ok(roamer.territory.hint, `lair roamer '${w.type}' should carry a territorial hint`);
      }
    }
  }
});

// ---- Arc VIII ----------------------------------------------------------

test('Session7: Arc VIII chapters 42–45 resolve enemies, items and boss profiles', () => {
  for (const id of ['ch42', 'ch43', 'ch44', 'ch45']) {
    const ch = CHAPTERS.find(c => c.id === id);
    assert.ok(ch, `${id} must be registered`);
    assert.ok(ch.stages.some(s => s.boss), `${id} needs a boss stage`);
    for (const s of ch.stages) {
      for (const wave of s.waves) assert.ok(ENEMY_TYPES[wave.type], `${s.id} wave type '${wave.type}' missing`);
      for (const drop of s.dropTable || []) assert.ok(getItem(drop.itemId) || getRune(drop.itemId), `${s.id} dropTable '${drop.itemId}' must resolve`);
    }
    const profile = bossEncounterProfile(`${id}_boss`);
    assert.ok(profile, `${id}_boss needs a readability profile`);
    assert.ok(profile.counterHint || profile.dangerTags?.length, `${id}_boss needs a counter hint or danger tags`);
  }
});

test('Session7: secret-loot uniques resolve and the overlord core never rolls in the generic chase pool', async () => {
  const { huntUniquesForChapter } = await import('../js/data/huntUniques.js');
  for (const id of ['uq_hunt_forgeheart_relay', 'uq_hunt_unwritten_leaf', 'uq_hunt_overlord_core']) {
    const item = getItem(id);
    assert.ok(item, `${id} must resolve via getItem`);
    assert.equal(item.unique, true);
  }
  for (let n = 1; n <= 45; n++) {
    assert.ok(!huntUniquesForChapter(n).some(i => i.id === 'uq_hunt_overlord_core'), 'overlord core must be super-prestige exclusive');
  }
});
