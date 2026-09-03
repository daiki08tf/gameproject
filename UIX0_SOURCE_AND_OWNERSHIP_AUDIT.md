# Blade Vale UIX-0 — Source and Ownership Audit

> **Status: SOURCE AUDIT COMPLETE / LIVE VIEWPORT PASS COMPLETE (see §10)**
>
> Baseline: main `b844f4d511c2c4ef6d9767032be87c807a23cd98` (PR #404)
>
> Runtime evidence baseline: PR #403 completed a live browser sweep and repaired the Stage-first Home entry, Observed Branch label duplication, unreachable Home actions and MutationObserver loops. §10 records the first UIX live-viewport pass against this ownership map, run at 390×844/375×667/desktop.

## 1. Scope and method

This is the evidence-gathering phase required before production UIX changes. It audits:

- static and dynamically-created screens;
- renderer, patch and CSS ownership;
- repeated visual primitives;
- rendered-pictograph/emoji sources;
- inline styling and CSS fragmentation;
- MutationObserver risk;
- the exact source families expected in UIX-1 through UIX-6.

The reproducible source scan is:

~~~sh
npm run audit:uix
~~~

The scan deliberately reports candidate pictographs rather than editing them. Many icons live in data records and are later rendered by multiple screens, so source location is not the same as presentation ownership.

## 2. Quantitative baseline

| Signal | Result | Meaning |
|---|---:|---|
| Scanned source files | 476 | `index.html`, `js/**/*.js` and `css/**/*.css` |
| Recognized screen IDs | 24 | Static screens and dynamically-added screens coexist |
| Pictograph code points | 469 | Emoji removal is cross-system, not an `index.html` cleanup |
| Files containing pictographs | 79 | Data, screens and integration patches all contribute |
| `index.html` pictographs | 14 | Home/header shell contains immediate UI decoration |
| `js/screens` pictographs | 98 | Core screens own a large visible share |
| `js/patches` pictographs | 107 | Late UI decoration can reintroduce glyphs after base render |
| `js/data` pictographs | 250 | Canon/data fields are frequently projected into UI |
| MutationObserver call sites | 45 | DOM migration requires ownership checks and idempotent writes |
| Files containing MutationObserver | 43 | Observer risk is distributed across almost every feature family |
| Inline style/write sites | 369 | Screen-specific styling resists a unified visual system |
| Files containing inline style/write sites | 71 | Token adoption must be phased |
| `forge-card` references | 524 | One generic card metaphor dominates many unrelated systems |
| `panel` references | 202 | Generic panel treatment is similarly broad |
| `stage-card` references | 55 | Adventure has a more bounded migration surface |
| `menu-card` references | 21 | Home can be changed as an early vertical slice |
| `tab-row` references | 8 | Shared navigation is present but less widely reused |

Top pictograph owners include:

1. `js/data/settlement.js` — 27;
2. `js/data/phase12CompanionPack.js` — 20;
3. `js/screens/blacksmith.js` — 17;
4. `js/screens/equipment.js` — 17;
5. `js/data/settlementSeasons.js` — 16;
6. `js/data/abyssRunBuild.js` — 15;
7. `js/screens/stageSelect.js` — 15;
8. `index.html` — 14.

## 3. Screen inventory and ownership

### Static shell screens

`index.html` owns 15 initial sections:

- title;
- Home;
- Chapter selection;
- Stage selection;
- Stage dossier/confirm;
- Text Battle;
- Result;
- Equipment;
- weapon Codex;
- Status;
- Job;
- Blacksmith;
- Rebirth;
- Abyss;
- revival spell/save.

### Dynamic screens

Integration patches add or own:

- Adventure World and Adventure Route;
- Companion/Ranch;
- Settlement;
- Settlement production, market and research;
- Monster Codex;
- Job Codex.

Dynamic insertion currently uses `document.body.appendChild`/`insertBefore` and feature-local `innerHTML`. UIX must not assume that every screen exists at module evaluation time.

### High-risk shared screens

| Screen | Known owners/decorators | UIX risk |
|---|---|---|
| Home | `index.html`, `homeNavigation`, `uiFoundationBootstrap`, `finalIntegrationUi`, Companion, Settlement, Codex, Endgame guidance | Multiple features add buttons before Home is regrouped |
| Equipment | base screen plus Equipment 3/4, compact UI, Smart Loot, loadouts, build readability and trials | Highest renderer/observer overlap |
| Stage/confirm | `chapterSelect`, `stageSelect`, `stageFirstNavigationUi`, CLR16/17/18 and final integration | Stage-first contract must survive visual migration |
| Result | base result plus Stage-first, CLR18 and World4 continuation | Next action ownership is distributed |
| Adventure Route | World4 base plus Hidden Route, Living World, Realm/Region and mobile patches | Route boxes are reinserted after repaint |
| Settlement | core UI plus many feature panels and three subordinate screens | Largest pictograph/card/inline-style concentration |

## 4. CSS and component findings

The stylesheet architecture is layered rather than canonical:

- `style.css` and `ui3.css` load statically;
- Home, mobile, final integration, Equipment, Character, Ranch and Endgame styles are injected by JavaScript;
- `style.css` is 579 lines while `ui3.css` is only 11 minified lines with broad overrides;
- `home3.css`, `coreLoopClr16Mobile.css`, `equipment4.css`, `uiFoundation.css` and multiple feature sheets overlap shared selectors;
- `adventureWorld4.css` is currently empty even though the runtime dynamically injects it;
- the existing pixel sprite and `pixelIcons.js` replace some Home emoji after initial render, but do not solve application-wide pictographs or the requested Dark Chronicle identity.

Primary design problem:

> Feature-specific patches repeatedly project their content through `forge-card`, local inline styles and emoji-led headings. The result is consistent at the CSS-class level but visually undifferentiated at the product level.

UIX-1 should introduce semantic tokens and primitives additively. It must not delete legacy classes until all consumers are migrated.

## 5. Emoji/pictograph migration decision

The 469 candidates split into three ownership types:

1. **Direct UI decoration** — Home icons, button prefixes, header badges and literal screen strings. Safe to migrate in the owning UI phase.
2. **Presentation metadata** — `icon` fields on enemies, companions, routes, Settlement facilities and Abyss choices. These may be canonical data objects but the icon field is presentation-only. Consumers must migrate before fields are removed or ignored.
3. **Authored text/canon** — rare cases where a symbol may be part of authored prose or name formatting. These require manual classification and must not be globally replaced.

Therefore:

- UIX-1 adds a rendered-UI prohibition gate and removes shared-shell decoration;
- UIX-2 through UIX-6 remove feature-owned presentation metadata at the point of render;
- data fields may remain temporarily for compatibility while every visible consumer stops rendering them;
- final removal of unused icon fields is a later, evidence-based cleanup, not part of global search/replace.

## 6. MutationObserver and DOM safety

There are 45 observer sites across 43 files. PR #403 already proved that equivalent DOM writes can freeze boot, Equipment, Ranch, Blacksmith and Adventure surfaces.

UIX rules:

- use `js/patches/domSafety.js` for observer-triggered writes when applicable;
- compare value/position before `textContent`, class, attribute or append operations;
- never remove/recreate an observed panel merely to restyle it;
- retain existing screen IDs and click contracts during early phases;
- add live round-trip tests for every screen family whose DOM ownership changes;
- treat module import order as part of the contract.

## 7. Phase implementation map

### UIX-1 — foundation

Primary files:

- `index.html`;
- `css/style.css`;
- `css/ui3.css`;
- `css/uiFoundation.css`;
- `css/pixelIcons.css`;
- new semantic-token/component stylesheet;
- `js/ui/uiFoundation.js`;
- `js/ui/pixelIcons.js`;
- shared UI/pictograph regression tests.

Goal: tokens, shared primitives, focus/reduced-motion rules and shared-shell emoji removal. Do not migrate every feature.

### UIX-2 — Home shell

Primary files:

- `js/screens/home.js`;
- `js/patches/homeNavigation.js`;
- `js/patches/uiFoundationBootstrap.js`;
- `js/patches/finalIntegrationUi.js`;
- `css/home3.css`;
- `css/uiFoundation.css`;
- Home navigation and mobile behavior tests.

### UIX-3 — Stage-first Adventure

Primary files:

- `js/screens/chapterSelect.js`;
- `js/screens/stageSelect.js`;
- `js/patches/stageFirstNavigationUi.js`;
- `js/patches/coreLoopClr16MobileUi.js`;
- `js/patches/coreLoopClr17LootIdentityUi.js`;
- `js/patches/coreLoopClr18StoryDensityUi.js`;
- `js/patches/adventureWorld4Ui.js` and its decorators only where Hunt/route presentation is involved;
- `css/finalIntegration.css`, `css/coreLoopClr16Mobile.css` and Stage selectors in shared CSS;
- CLR13–21 behavioral regressions.

### UIX-4 — Battle and Result

Primary files:

- `js/screens/textBattle.js`;
- `js/screens/result.js`;
- `js/patches/fusionBattleUi.js`;
- `js/patches/combat2SkillModifierUi.js`;
- Battle/Result selectors in `style.css` and mobile CSS;
- permanent mobile-command and result-next-stage regressions.

### UIX-5 — Equipment workbench

Primary files:

- `js/screens/equipment.js`, `equipment4.js`, `equipmentFusion.js`, `blacksmith.js`, `weaponCodex.js`;
- `js/patches/equipmentCompactUi.js`, `smartLoot4EquipmentUi.js`, `gearOverhaulCraftingConsolidation.js`, build/loadout/readability patches;
- `css/equipment4.css`, `equipmentCompact.css`, `character.css` where shared stats are involved;
- Gear Overhaul and observer-loop regressions.

### UIX-6 — remaining screen families

Separate PR batches:

1. Status, Job and Rebirth;
2. Companion and Monster Ranch;
3. Settlement shell and facility panels;
4. Codex, Rumor and records;
5. Abyss, Rift, Secret Realm, Machine Realm, Bounty and Nemesis.

Settlement must be split: it has the highest combined pictograph, `forge-card`, inline-style and observer density.

## 8. Live verification still required

This environment's controlled browser cannot open the local workspace URL, so it could not produce a new viewport capture without bypassing browser policy. No workaround was attempted.

Before UIX-0 may be marked complete, run on a browser-capable checkout:

- screenshots at 390×844, 375×667 and desktop;
- every required path in `UI_OVERHAUL_ROADMAP.md`;
- console/page-error collection;
- scroll-depth and primary-action visibility recording;
- rendered pictograph inventory, including late observer-inserted panels;
- live comparison against the source ownership map above.

PR #403 provides a recent green live-playability baseline, but it does not replace these UIX-specific screenshots and full visual inventory.

## 9. Current completion judgment

UIX-0 source, ownership and migration planning is complete. The required live viewport pass is recorded in §10 below; it confirms this ownership map and adds the runtime-created surfaces and one blocker found while walking it.

## 10. Live viewport pass — completion record (UIX-3 cycle)

Run against a git-archive checkout of the UIX-3 commit, served locally and driven with Playwright/Chromium at 390×844, 375×667 and 1280×900 (desktop), for both a fresh save and a save fast-tracked (via a QA-only `js/__qaHook.js` module, never committed) to: every canonical Stage cleared, the Chapter-2 Observed Branch discovery flag set, and enough gold/EXP to clear the Abyss gate. Console/page-error listeners ran throughout.

Paths walked, all three viewports, both save states unless noted:

- title → Home (fresh and post-clear and post-suspend context);
- Home → Chapter → Stage → Stage confirm → Battle → Result → next Stage → Battle → Result;
- cleared Stage → Hunt (Adventure Route) → suspend → Home (`SUSPENDED EXPEDITION` ledger) → resume;
- Chapter 2 → Observed Branch → Branch Stage confirm → Branch Battle → Result;
- Character (Status) → Job → Companion/Ranch → Rebirth;
- Equipment → filter row / paperdoll slot picker → weapon Codex → Blacksmith;
- Monster Codex, 開拓拠点 (Settlement), 深淵 (Abyss, locked-on-fresh-save and unlocked-after-progress);
- the Home/Adventure/Character/Equipment/Records persistent nav strip.

Result: no page/console errors beyond the browser's own unrelated `favicon.ico` 404 (pre-existing, unrelated to any served file). Confirms this ownership map — no undocumented runtime-created screen was found beyond what §3 already lists.

One real, pre-existing navigation bug was found and fixed by this pass (not a UIX-0 documentation change): `js/patches/stageFirstNavigationUi.js`'s Stage-list decoration (`enhanceStageFirstStageList()` — Stage IDs, LOCKED cards for undiscovered stages, CLEAR/NEXT/OPEN text) previously re-ran only when leaving a Stage confirm via `#confirmBackBtn`, never when *entering* a Chapter's Stage list from a Chapter card. A player's first visit to any Chapter's Stage list therefore showed no Stage ID and no LOCKED placeholders for undiscovered stages — a direct violation of CLR-13's own "always display stage IDs" / "clear/next/locked states are obvious" contract. Fixed by also queuing the enhancement on a `#chapterList .stage-card` click; regression-tested in `tests/core-loop-clr13.test.js`.

Rendered-pictograph inventory during the walk matched this document's per-screen ownership exactly: zero on every UIX-3-owned screen (Chapter/Stage/Stage confirm/Observed Branch, in both save states, all three viewports); pre-existing glyphs only on screens outside UIX-3's scope — Battle (🐾, a default companion-recruitment icon), Result (⚙), Character/Status (⚔), Job (📖), Companion (🧬🔵), Equipment (⚙🔒), Blacksmith (💰), Monster Codex (🗺⚔) and Settlement (33 glyphs — confirms §3's "Settlement must be split" finding) and Abyss (15 glyphs, danger/pact iconography). None of these were touched; each is owned by its own later UIX phase per §7.

Not walked in this pass (residual UIX-0 scope, left for the phase that actually restyles those systems): Rift / Secret Realm / Machine Realm / EX Bounty as "representative endgame entries" (Abyss stood in as the one endgame entry exercised); the Hunt loop's dedicated `安全に帰還する` safe-return wording specifically (only reachable a few combat waves into an Adventure Route session — the generic `冒険を中断して拠点へ戻る` suspend action was exercised instead, at the same call site `stageFirstNavigationUi.js` reads for its suspended-session context).

Do not start further UIX-1/UIX-2 production restyling questioning this record; do treat any newly-discovered runtime surface in a later phase's own walk as an update to this section, not a silent gap.

## 11. Live viewport pass — completion record (UIX-4 cycle)

Same method as §10 (git-archive checkout of the UIX-4 commit; QA-only `js/__qaHook.js`, never committed; 390×844/375×667/desktop; fresh-save and progressed-save; console/page-error listeners throughout).

Paths walked: Chapter → Stage → Battle → Result → next Stage → Battle → Result (fresh-save, all three viewports); Chapter 2 → Observed Branch → Branch Battle → Result (progressed-save).

Result: zero rendered emoji on the Result screen in either save state at any viewport (down from the `⚙` found in §10's fresh-save walk — `js/screens/result.js`'s 6 glyphs are now removed). The Battle screen's one remaining glyph (`🐾`) is confirmed to originate from `js/patches/companionRecruitment.js`'s recruit-prompt overlay, not from `js/screens/textBattle.js` itself — left as UIX-6 Companion scope, as §10 already noted. Zero new console/page errors beyond the pre-existing benign `favicon.ico` 404.

This pass also live-confirmed both outcome tones the source change introduced: the desktop fresh-save run's battle was lost, rendering `#resultScreen .panel[data-tone="danger"]` (`DEFEATED...` in `--dc-danger-300` with a danger-red top border) alongside the more commonly seen `success` tone (`STAGE CLEAR` in brass) captured at every other run. `neutral` (RETREAT) was not observed live in this pass — its CSS/JS wiring is symmetric with the other two tones and is asserted in `tests/uix4-battle-result-suite.test.js`.

No undocumented runtime-created surface was found. Confirms this ownership map for the Battle/Result family.

## 12. Live viewport pass — completion record (UIX-5 cycle)

Same method as §10/§11 (git-archive checkout of the UIX-5 commit; QA-only `js/__qaHook.js`, never committed; 390×844/375×667/desktop; console/page-error listeners throughout). Progressed-save was extended to also grant one rare/epic/legendary sword and one rare/epic shield directly into `state.data.inventory` (plain item IDs, not weapon instances — see the "not walked" note below), so the workbench could be checked with a real rarity/comparison spread rather than only the starting sword.

Paths walked: Equipment (fresh: empty paperdoll/picker; progressed: paperdoll → filter row → a slot → SELECTED DETAIL, including a live ATK/CRIT/MAG comparison of 英雄の剣 against the equipped 鉄の剣) at all three viewports in both save states; weapon Codex; Blacksmith (強化 tab, 整理/dispose tab with populated Gold/欠片 cost lines and ロック buttons, 鍛造3.0/equipment3 tab).

Result: zero rendered emoji on Equipment, weapon Codex and Blacksmith in either save state at any viewport (down from the `⚙🔒`/`💰` the UIX-3 fresh-save walk had found at this phase's source level). Zero new console/page errors beyond the pre-existing benign `favicon.ico` 404. Desktop's two-column `equip-layout` grid (paperdoll+filters+list left, sticky SELECTED DETAIL right, from equipment4.css's `@media (min-width:760px)` rule) renders correctly at 1280×900.

Not walked: the Option Fusion material-consumption panel specifically — reaching it needs a same-family duplicate weapon *instance* with rolled random Options (`state.data.weaponInstances`), which plain `state.data.inventory[id] += 1` grants (used above for the rarity/comparison spread) do not produce; synthesizing a correct instance would mean duplicating `equipment3.js`'s instance-generation logic in the QA hook, which risks testing a fake path instead of the real one. `.option-fusion-panel`/`.equipment4-option` token CSS and the `globalThis.confirm` material-consumption guard are asserted at the source level in `tests/uix5-equipment-blacksmith-workbench.test.js` instead. Monster Codex (5–6 glyphs, confirmed again during this pass) remains untouched, still UIX-6 scope per §7.

No undocumented runtime-created surface was found. Confirms this ownership map for the Equipment/Blacksmith/Codex family.
