import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const abyss = readFileSync(new URL('../js/screens/abyss.js', import.meta.url), 'utf8');
const livingWorldUi = readFileSync(new URL('../js/patches/adventureWorld4LivingWorldUi.js', import.meta.url), 'utf8');
const abyssRoutesData = readFileSync(new URL('../js/data/abyssRoutes.js', import.meta.url), 'utf8');
const abyssChallengesData = readFileSync(new URL('../js/data/abyssChallenges.js', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-6 batch 5 removes rendered-UI emoji from the Abyss screen (Raid/Exploration/Pacts/Challenges/Route choices/Tree)', () => {
  assert.doesNotMatch(abyss, PICTOGRAPH, 'js/screens/abyss.js must not render platform emoji');
});

test('UIX-6 batch 5 stops rendering route/challenge icon fields (category 2) without touching the canonical Abyss data', () => {
  // route.icon (armory/beast_den/blood_mist/golden_vault/rift_scar/veil_fracture
  // — the source of this batch's "Rift" debt) and c.icon (abyssChallenges,
  // e.g. the vitality/boss_technique challenge modifiers) are presentation
  // metadata on canonical Abyss data objects — stop rendering, leave data.
  assert.doesNotMatch(abyss, /route\.icon|c\.icon/);
  assert.match(abyssRoutesData, /icon: '🌀'/); // rift_scar's data field is untouched
  assert.match(abyssChallengesData, /icon:'🫀'/); // vitality's data field is untouched
});

test('UIX-6 batch 5 replaces bare glyph markers with text/non-pictographic symbols', () => {
  assert.match(abyss, /unlocked\?'RAID ':'LOCKED '/);
  assert.match(abyss, /<div class="rec">▲ \$\{route\.risk\}<\/div>/);
  assert.match(abyss, /盟約: \$\{stage\.abyssPacts/);
  assert.match(abyss, /誓約: \$\{stage\.abyssChallenges/);
  assert.match(abyss, /強化する（\$\{cost\}）/);
});

test('UIX-6 batch 5 resolves "Rift/Secret Realm/Machine Realm/Bounty-Nemesis" to their real owning screens, none of which needed further changes', () => {
  // Rift (rift_scar) and Secret Realm are both entered as route/exploration
  // variants FROM this same Abyss screen (already covered above), not
  // separate screens. Bounty/Nemesis is a Living World feature rendered
  // into the Adventure Route screen (UIX-3 territory) and was already
  // emoji-free; confirmed unchanged here. "Machine Realm" has no
  // implemented standalone screen — only authored flavor/lore text
  // ("機械装甲" trait, "未知の機械音" discovery hint) — nothing to migrate.
  assert.doesNotMatch(livingWorldUi, PICTOGRAPH);
  assert.match(livingWorldUi, /Nemesisを捕捉|Nemesisを追跡/);
});

test('UIX-6 batch 5 introduces no new calculation authority — Abyss screen reads existing state only', () => {
  assert.doesNotMatch(abyss, /localStorage/);
  assert.match(abyss, /buildAbyssStage/);
  assert.match(abyss, /state\.activeAbyssPacts/);
});
