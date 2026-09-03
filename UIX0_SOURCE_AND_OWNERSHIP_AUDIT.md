# Blade Vale UIX-0 — Source and Ownership Audit

> **Status: SOURCE AUDIT COMPLETE / LIVE VIEWPORT PASS PENDING**
>
> Baseline: main `b844f4d511c2c4ef6d9767032be87c807a23cd98` (PR #404)
>
> Runtime evidence baseline: PR #403 completed a live browser sweep and repaired the Stage-first Home entry, Observed Branch label duplication, unreachable Home actions and MutationObserver loops. This document does not claim new live screenshots.

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

UIX-0 source, ownership and migration planning is complete. UIX-0 itself remains open solely for the required live viewport pass.

Do not start UIX-1 production restyling until that pass either:

1. confirms this ownership map; or
2. updates this audit with any additional runtime-created surfaces and blockers.
