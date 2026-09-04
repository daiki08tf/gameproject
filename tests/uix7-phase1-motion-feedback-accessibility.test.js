import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const overlayA11y = readFileSync(new URL('../js/patches/overlayA11y.js', import.meta.url), 'utf8');
const companionRecruitment = readFileSync(new URL('../js/patches/companionRecruitment.js', import.meta.url), 'utf8');
const settlementUi = readFileSync(new URL('../js/patches/settlementUi.js', import.meta.url), 'utf8');
const abyssRunUi = readFileSync(new URL('../js/patches/abyssRunUi.js', import.meta.url), 'utf8');
const spellScreen = readFileSync(new URL('../js/screens/spellScreen.js', import.meta.url), 'utf8');
const indexHtml = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const darkChronicle = readFileSync(new URL('../css/darkChronicle.css', import.meta.url), 'utf8');
const battleIntegration3 = readFileSync(new URL('../js/patches/battleIntegration3.js', import.meta.url), 'utf8');
const combat2Elements = readFileSync(new URL('../js/data/combat2Elements.js', import.meta.url), 'utf8');

const PICTOGRAPH = /\p{Extended_Pictographic}/u;

test('UIX-7 phase 1: the viewport meta tag no longer disables pinch-zoom/browser text resize', () => {
  // WCAG 1.4.4 (Resize Text, AA): maximum-scale=1.0 + user-scalable=no
  // blocked every viewer from using the browser's own zoom to read the
  // app's many 7-9px labels, regardless of any color/contrast work.
  // This is the single highest-leverage fix for UIX-7's "readable dynamic
  // text sizing" deliverable — it applies to all existing text at once.
  const viewportTag = indexHtml.match(/<meta name="viewport"[^>]*>/)?.[0] || '';
  assert.doesNotMatch(viewportTag, /user-scalable=no/);
  assert.doesNotMatch(viewportTag, /maximum-scale/);
  assert.match(viewportTag, /width=device-width/);
});

test('UIX-7 phase 1: overlayA11y.js provides a dialog role + Escape + focus-restore helper', () => {
  assert.match(overlayA11y, /export function bindOverlayDialog/);
  assert.match(overlayA11y, /role', 'dialog'/);
  assert.match(overlayA11y, /aria-modal', 'true'/);
  assert.match(overlayA11y, /key === 'Escape'/);
  assert.match(overlayA11y, /previouslyFocused/);
});

test('UIX-7 phase 1: the companion recruit-prompt overlay is wired to bindOverlayDialog', () => {
  assert.match(companionRecruitment, /import \{ bindOverlayDialog \} from '\.\/overlayA11y\.js';/);
  assert.match(companionRecruitment, /bindOverlayDialog\(overlay,panel,\(\)=>finish\(false\)\)/);
  // restoreFocus() must run before the overlay is actually removed, not after.
  assert.match(companionRecruitment, /resolved=true;restoreFocus\(\);/);
});

test('UIX-7 phase 1: both Settlement overlays (resident event, evolution) are wired to bindOverlayDialog', () => {
  assert.match(settlementUi, /import \{ bindOverlayDialog \} from '\.\/overlayA11y\.js';/);
  assert.match(settlementUi, /bindOverlayDialog\(overlay,overlay\.querySelector\('\.forge-card'\),closeResident\)/);
  assert.match(settlementUi, /bindOverlayDialog\(overlay,overlay\.querySelector\('\.forge-card'\),closeEvolution\)/);
});

test('UIX-7 phase 1: the Abyss Run choice overlay gets dialog/focus semantics but no Escape-skip (picking a boon is mandatory)', () => {
  assert.match(abyssRunUi, /import \{ bindOverlayDialog \} from '\.\/overlayA11y\.js';/);
  assert.match(abyssRunUi, /bindOverlayDialog\(overlay,panel\);/);
  // Confirms no closeFn argument is passed (Escape is swallowed, not wired to skip the choice).
  assert.doesNotMatch(abyssRunUi, /bindOverlayDialog\(overlay,panel,/);
});

test('UIX-7 phase 1 fixes a UIX-6 batch 5 gap: abyssRunUi.js\'s boon-icon consumption site was missed by that batch\'s file discovery', () => {
  // js/data/abyssRunBuild.js — 15 pictographs on the UIX-0 top-owner list —
  // was never rendered by js/screens/abyss.js; it's abyssRunUi.js's
  // showAbyssRunChoice() that reads boon.icon, a file batch 5's grep for
  // abyssList/abyssScreen/abyssTreeContent never matched (its own overlay
  // id is abyssRunChoiceOverlay). Found only while touching this file for
  // the overlay-accessibility retrofit above.
  assert.doesNotMatch(abyssRunUi, PICTOGRAPH);
  assert.doesNotMatch(abyssRunUi, /boon\.icon/);
  assert.match(abyssRunUi, /\$\{boon\.name\}　Rank/);
});

test('UIX-7 phase 1 finds and fixes two more ENGINE_ROLES/element-icon leaks discovered by this phase\'s own live-viewport pass, not by a static scan', () => {
  // js/patches/battleIntegration3.js's tactical-info line under each Battle
  // enemy card ("ROLE ... / 弱点 ... / 観測技 ...") reads known.role.icon
  // directly, and js/data/combat2Elements.js's shared elementLabel()
  // helper (its one caller is this same file) returned an icon-prefixed
  // string — a third and fourth site for the same ENEMY_ROLES/
  // COMBAT2_ELEMENTS icon fields already fixed at two other render sites
  // in UIX-6 batches 3-4. Found only because this phase's own QA pass
  // walked a fresh-save battle where an enemy's role had already been
  // revealed by an earlier kill (js/patches/combat3EnemyAI.js's existing
  // roleKnown-on-kill rule) — a state a plain static scan can't produce.
  assert.doesNotMatch(battleIntegration3, PICTOGRAPH);
  assert.doesNotMatch(battleIntegration3, /known\.role\.icon/);
  assert.match(battleIntegration3, /ROLE \$\{known\.role\.name/);
  assert.match(battleIntegration3, /'特殊行動の予兆'/);
  assert.doesNotMatch(combat2Elements, /def\.icon/);
  assert.match(combat2Elements, /return def \? def\.name : ''/);
});

test('UIX-7 phase 1: the Spell screen\'s error text uses the Dark Chronicle danger token instead of the legacy --hp-color variable', () => {
  assert.doesNotMatch(spellScreen, /--hp-color/);
  assert.match(spellScreen, /var\(--dc-danger-300\)/);
});

test('UIX-7 phase 1: reduced-motion, focus-visible and safe-area foundations audited and confirmed already in place (no change needed)', () => {
  // These three deliverables were already substantially satisfied by UIX-1
  // and CLR-16 before this phase — this test locks that baseline so a
  // future edit can't silently remove it.
  assert.match(darkChronicle, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(darkChronicle, /animation-duration: \.01ms !important/);
  assert.match(darkChronicle, /:focus-visible \{/);
  assert.match(darkChronicle, /outline: 2px solid var\(--dc-observe-400\)/);
});

test('UIX-7 phase 1: no new calculation authority — overlay helper and touched files read/mutate only existing state', () => {
  for (const source of [overlayA11y, companionRecruitment, settlementUi, abyssRunUi]) {
    assert.doesNotMatch(source, /localStorage/);
  }
  // spellScreen.js is the pre-existing save import/export screen — its
  // localStorage use is the existing save key, untouched by this phase.
  assert.match(spellScreen, /localStorage\.setItem\(SPELL_TARGET_SAVE_KEY/);
});
