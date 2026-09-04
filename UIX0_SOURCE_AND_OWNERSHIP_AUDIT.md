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

## 13. Live viewport pass — completion record (UIX-6 batch 1 cycle)

Same method as §10–§12 (git-archive checkout of the UIX-6 batch 1 commit; QA-only `js/__qaHook.js`, never committed; 390×844/375×667/desktop; console/page-error listeners throughout).

A full static source scan of this batch's four files (`\p{Extended_Pictographic}` over `js/screens/status.js`, `js/screens/rebirthModern.js`, `js/patches/jobCodexUi.js`, plus `js/screens/jobConstellation.js`/`js/screens/jobsPhase8.js` as a sanity check) was run first as ground truth, ahead of any live pass. It found 10 glyphs, not the 2 recorded in §7/§10's prior notes: 1 in Status (`character-avatar`'s `⚔️`), 8 in Rebirth (an awakening checklist and artifact-slot state that only render once the Character has enough Rebirth/awakening progress to reach those branches — invisible to a fresh-save-only live pass), 1 in the Job screen's Codex button (`📖`). This is the same lesson §10 already drew from the stage-first navigation bug: a live pass only proves what it exercises; a static scan is the reliable ceiling.

Paths walked: Status (基本/装備/詳細/成長 tabs, 戦闘ハイライト highlight cards, Challenge Records, Progression 3.0 growth-history block) at all three viewports, fresh-save; Job (図鑑 button, 星盤 constellation view, 共鳴銀河 fusion galaxy tab) at all three viewports, fresh-save; Rebirth (継承/覚醒/秘宝 tabs) at all three viewports, fresh-save; progressed-save re-walked at 390×844 as part of the same Chapter → Hunt → Equipment → Blacksmith progressed sweep used since §10 (Status/Job/Rebirth are not re-captured as separate progressed-save steps, since their emoji-free contract and token CSS do not depend on save state — the static scan already covers every conditional branch a save state could unlock).

Result: zero rendered emoji across all 27 fresh-run and 20 progressed-run captured steps, at every viewport. Zero new console/page errors beyond the pre-existing benign `favicon.ico` 404 and the already-known UIX-3 residual (`安全に帰還する` only reachable a few Hunt waves into an Adventure Route session — unconnected to this batch's Status/Job/Rebirth scope, and already documented in §10/§7). The Status stat grid, highlight-card row and Progression 3.0 block reflow correctly in desktop's wider layout at 1280×900. The Job Constellation/Fusion Galaxy view renders unchanged, confirming the deliberate decision to leave its bright-gold glow system untouched this batch.

No undocumented runtime-created surface was found. Confirms this ownership map for the Status/Job/Rebirth family.

## 14. Live viewport pass — completion record (UIX-6 batch 2 cycle)

Same method as §10–§13 (git-archive checkout of the UIX-6 batch 2 commit; QA-only `js/__qaHook.js`, never committed, extended this cycle to grant two extra companion instances — a rare/level-35 goblin and an epic/level-12 bat, and to force the starter slime to rare/level-30 — so the breeding and evolution panels render their populated state instead of an empty one; 390×844/375×667/desktop; console/page-error listeners throughout).

A full static source scan covered every file writing into `#companionContent` or the Battle-screen's companion HUD, not only the files a prior note named. It found 16 glyphs across 6 files (§7/§10's note had recorded only `🧬🔵`): `companionFoundation.js` (2), `monsterRanchUi.js` (2, including a `◀` mutation-lineage marker the migration script itself flags as pictographic despite reading as a plain triangle), `monsterRanch2FacilitiesUi.js` (5), `companionRecruitment.js` (2, the Battle-screen recruit-prompt icon named in §10/§11), `companion3Breeding.js` (3), and `companionBattle.js` (2, a second and previously-uncounted `🐾` source — the in-battle companion HUD, distinct from the recruit overlay). `js/patches/monsterRanch2CompleteUi.js`, `companionBondUi.js` and `monsterRanchCompactUi.js` were confirmed already emoji-free and needed no changes. `js/patches/settlementRanch3Ui.js` was scanned and found to carry 5 more (`🐾`/`✨`) but deliberately left untouched — it renders into `#settlementContent`, not `#companionContent`, so it is Settlement-owned (batch 3) despite its Ranch-adjacent content, the same boundary reasoning §13 already applied to `jobCodexUi.js`.

Paths walked: Companion screen (fresh-save, one starter companion) and every Monster Ranch compact tab (仲間/卵/配合/訓練/派遣/施設/研究) at all three viewports; the same walk repeated on the progressed save with the QA-granted rare/epic companion spread, plus an evolve attempt and a breeding attempt; the in-battle companion HUD captured live during the progressed-save Observed Branch battle.

Result: zero rendered emoji across all 35 fresh-run and 29 progressed-run captured steps, at every viewport. Zero new console/page errors beyond the same two pre-existing, already-documented items (benign `favicon.ico` 404; the UIX-3 `安全に帰還する` residual, unconnected to this batch). The in-battle HUD rendered `仲間1 スライム Lv.30 HP 191/191 MP 40/40` cleanly with the companion's real stats. The Ranch compact tab bar's active-tab brass highlight and the breeding panel's two-select layout reflow correctly in desktop's wider layout at 1280×900.

No undocumented runtime-created surface was found. Confirms this ownership map for the Companion/Monster Ranch family, and confirms `settlementRanch3Ui.js`'s deferral to Settlement (batch 3) is a container-ownership decision, not an oversight.

## 15. Live viewport pass — completion record (UIX-6 batch 3 cycle)

Same method as §10–§14 (git-archive checkout of the UIX-6 batch 3 commit; QA-only `js/__qaHook.js`, never committed, extended this cycle to set `state.data.settlementBuildings.hall = 20` and stock all four settlement materials at 99999 so every hall-gated panel — Market/Production/Research (Lv.10) and the rest — renders its populated state rather than LOCKED; 390×844/375×667/desktop; console/page-error listeners throughout).

A full static source scan covered every file writing into `#settlementContent` or a Settlement sub-screen (`#settlementMarketContent`/`#settlementProductionContent`/`#settlementResearchContent`). It found 16 files carrying 51 literal glyphs, not the 33 §7's coarser prior count had recorded, plus two files whose rendered emoji came entirely from category-2 data-object `icon` fields with zero literal glyphs of their own — invisible to a literal-only regex scan: `settlementSeasonsUi.js` (reads `SETTLEMENT_SEASONS`/`WEATHER`/`DAYPARTS`/`FESTIVALS`' icon fields, 16 pictographs living in `js/data/settlementSeasons.js`, §2's #5 top pictograph owner) and `settlementUi.js`'s `rewardText()` (reads `SETTLEMENT_MATERIALS[k].icon`). Both were found only once the live-viewport walk actually rendered the affected `<summary>`/reward text and the screenshots showed 🌱☀️🌧️🌅 and similar glyphs the source-file grep had missed entirely. A 17th file, `js/patches/adventureWorld4InvestigationUi.js` (7 more literal glyphs, a separate Adventure World 4 Investigation Board that injects into the Research sub-screen), was found the same way — its target ids don't contain the string `settlementContent` or `settlementScreen`, so the initial file-discovery grep never surfaced it at all; only walking into the Research sub-screen and reading its screenshot text found it. Total removed: 58 glyphs across 17 files.

Paths walked: Settlement main screen with every `<details>` panel expanded (Tavern, Residents, Defense, Exploration, Identity, Secrets, Expeditions, Endgame Network, Arena, Capital, Chronicle, Seasons, Ranch 3.0) at all three viewports, both save states; the Market/Production/Research sub-screens (including the Investigation Board panel inside Research) at all three viewports, both save states; a settlement-upgrade action on the progressed save.

One QA-script-only issue was found and fixed during this pass, not an app defect: raising the hall level to 20 in the QA hook queues several "NEW RESIDENT" welcome overlays (`js/patches/settlementUi.js`'s `showResidentEvent`/`showPendingResidentEvent`), shown one at a time and blocking all pointer input on the page until dismissed — the first attempt at this pass hung/timed out repeatedly retrying a blocked click against the overlay. Fixed by adding a `dismissSettlementOverlays()` helper to `run_progressed.mjs` that drains any pending resident/evolution overlay before further interaction, the same pattern already used for the mid-battle companion-recruit overlay since UIX-3.

Result: zero rendered emoji across all 40 fresh-run and 35 progressed-run captured steps, at every viewport, from any Settlement-owned file. Two categories of pre-existing, already-documented, genuinely out-of-scope emoji were (correctly) still present and are not regressions: Monster Codex (`🗺⚔`, batch 4 territory) and Abyss (15 glyphs, batch 5 territory). Zero new console/page errors beyond the same two pre-existing, already-documented items (benign `favicon.ico` 404; the UIX-3 `安全に帰還する` residual).

One further real finding, deliberately left unfixed as out of this batch's scope: the `07b-result-next-stage` fresh-save step showed 3 additional glyphs (`⚔⚔⚔`), traced to `js/patches/combat3EnemyAI.js` prefixing a Battle-screen enemy's display name with its `ENEMY_ROLES` icon once the player has researched that enemy's role via Codex knowledge. `tests/codex-enemy-knowledge.test.js` already locks this exact line in as intentional, tested behavior (a Codex-knowledge reward signal, not incidental decoration) — this is Battle/Codex system territory, not a Settlement file, and correcting it means redesigning a tested mechanic, not dropping inert decoration. Recorded as known debt for whichever pass next owns Battle or Codex presentation (candidates: a Battle-system revisit, or UIX-6 batch 4 Codex/Rumor/records).

No undocumented runtime-created surface was found beyond the Investigation Board (now folded into this ownership map). Confirms this ownership map for the Settlement family.

## 16. Live viewport pass — completion record (UIX-6 batch 4 cycle)

Same method as §10–§15 (git-archive checkout of the UIX-6 batch 4 commit; QA-only `js/__qaHook.js`, unchanged this cycle — no new grants were needed, since the existing battle walkthroughs already generate real Codex knowledge via kills/inspects; 390×844/375×667/desktop; console/page-error listeners throughout).

Batch scope was resolved by reading the "records" home hub's button list (`js/patches/homeNavigation.js`'s `HOME_HUBS`): Monster Codex, Abyss, Settlement and Spell. Abyss is batch 5 and Settlement was closed in batch 3, leaving Monster Codex (the roadmap's named "Codex/Rumor" target) and the Spell save-code screen (an un-migrated hub neighbor with no other batch claim) as this batch's real scope.

A full static source scan of every file writing into `#monsterCodexContent` found 6 files: `codexUi.js`, `enemy3CodexUi.js`, `contentPackIIE.js`, `phase12FinaleRuntime.js`, `systemDeepeningPackB.js`, `systemDeepeningPackC.js`. Four of these six showed 0–1 literal pictographs on a plain regex scan — reading each in full (not trusting the literal count alone, per the lesson §15 already drew) found `codexUi.js` reading `COMBAT2_ELEMENTS[id].icon` and `k.role.icon`, and `systemDeepeningPackB.js` reading `g.role.icon` inside its Field Guide detail — the same `ENEMY_ROLES` icon table already found leaking into the Battle screen in §15's own completion record. `systemDeepeningPackC.js`'s one literal (`🗺`) was the Rumor Notebook panel's own title. `enemy3CodexUi.js`, `contentPackIIE.js` and `phase12FinaleRuntime.js` were confirmed to consume no icon fields at all and needed no changes. The Spell screen (`js/screens/spellScreen.js`, a standalone save-export/import feature, static shell already defined emoji-free in `index.html`) had 3 literal glyphs of its own (⚠️×2, ✨×1) in status-message text.

This batch also closed the one deliberately-deferred finding from §15: `js/patches/combat3EnemyAI.js` (Battle-engine-owned, not a Codex file) prefixes a researched enemy's Battle-screen name with its `ENEMY_ROLES` icon. Because `tests/codex-enemy-knowledge.test.js` locks this behavior in as an intentional, tested Codex-knowledge reward signal rather than incidental decoration, the fix replaces the icon with a `【role name】` text tag instead of dropping it outright — preserving the reward-visibility contract while satisfying the no-emoji requirement. The existing test's assertions check only the conditional/assignment shape (`if(known?.roleKnown||known?.analyzed)e.name=`), not the icon literal, so no test needed to change.

Paths walked: Monster Codex with every `<summary>` expanded (Rumor Notebook world-fragment/clue disclosures, per-enemy Field Guide details, Enemy 3.0 tactical-analysis cards, horizontal ecology summary) at all three viewports, both save states; the Spell screen's generate action and an invalid-code submission at all three viewports, fresh-save, plus a generate action on the progressed save. The progressed save's Observed-Branch and Hunt battles (already fought in earlier steps of the same walkthrough) populate real `roleKnown`/`analyzed` Codex entries through the existing kill/inspect-driven knowledge system — no QA-hook shortcut was needed or used for this — confirmed rendering plain text (e.g. `役割：守護`) with no emoji once expanded.

Result: zero rendered emoji across all 44 fresh-run and 39 progressed-run captured steps, at every viewport, from any Codex- or Spell-owned file. The only glyphs present in either run were the already-documented, out-of-scope Abyss glyphs (batch 5 territory, unchanged). Zero new console/page errors beyond the same two pre-existing, already-documented items.

No undocumented runtime-created surface was found. Confirms this ownership map for the Monster Codex/Spell family, and confirms the combat3EnemyAI.js finding from §15 is fully closed.
