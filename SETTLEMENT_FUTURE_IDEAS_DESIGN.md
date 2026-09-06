# Settlement — Future Ideas Pool Design

> Parent: `SETTLEMENT_3_LIVING_FRONTIER_ROADMAP.md` §Future ideas pool.
>
> Status: **DESIGN DRAFT — none implemented yet**
>
> Scope: turn the ten pooled ideas (釣り場 / 教会・祠 / 宿屋の夢 / 住民関係 / 治安事件 / 占い / 失踪事件 / Rift街区異界化 / Nemesis襲撃 / Secret Realm門) into concrete, existing-loop-safe designs. This is a personal hobby project — the CI/PR rigor described elsewhere in this repo is a nice-to-have here, not a requirement. Keep changes small enough not to corrupt existing saves.

## Design philosophy

Every idea below must satisfy the pool's own adoption rule: **it must create a loop back into an existing system**, not sit beside it. Concretely:

- No new currency. Reuse `wood / ore / hide / veilstone / gold / manastone / abyssShards / bountyMarks`.
- No new Home button or top-level screen. Everything lives inside the existing Settlement screen, Tavern, Exploration, Defense, or Adventure/Investigation surfaces.
- No new save root. Extend `state.data.settlement*` / `state.data.world2.discoveries` shapes that already exist.
- No permanent-loss or daily/weekly FOMO mechanics (matches Settlement 3.0's own non-negotiable contracts).
- Tone stays "Dark Chronicle": restrained, record/ledger flavored, not whimsical minigame skin. Settlement content can be warmer/slice-of-life than the cosmic Story layer, but should still feel like it belongs in the same world (occasional boundary/observation undertones are fine, explicit revelations are not — see `STORY_CANON.md`).

## The ten designs

### 1. 釣り場 — Fishing Spot
**Reuses:** `settlementExploration.js` (discoverable locations) + `settlementProduction.js` (idle yield pattern).
Design: a new discoverable Exploration location ("河岸の釣り場" etc.) that behaves like a Production node — visiting it periodically yields existing materials (`wood/ore/hide`, weighted toward `hide`) at a modest rate, plus a low chance of a **flavor catch** (a named fish record, purely a Codex-style collectible, no new stat item). No new economy; it's reskinned Production with a location.
Loop-back: feeds the existing crafting/Ranch material economy; the flavor-catch log gives one more thing worth reading in the Chronicle screen.

### 2. 教会・祠 — Church / Shrine
**Reuses:** `settlementSecrets.js` (hidden-facility discovery pattern) + the existing per-stage **blessing** selection already used at stage confirm (`getSelectedBlessingId()`).
Design: a hidden facility discovered through Settlement Exploration progress. Once found, it lets the player pick one of the game's existing blessings as a **standing Settlement blessing** for a materials cost, refreshed on the existing season/festival cadence (`settlementSeasons.js`) instead of daily. It does not add new blessing types — it just gives the existing blessing system a second, slower-cadence access point tied to the settlement instead of only the stage-confirm screen.
Loop-back: pulls players back into Settlement each season change; consumes existing materials.

### 3. 宿屋の夢 — Inn Dream
**Reuses:** `settlementTavern.js` (rumor/local-request slot) + `worldLoreFragments` / Codex 世界断片 disclosure already used for CP2/CP3 lore.
Design: occasionally a Tavern guest "dream" fills the existing rumor slot instead of an ordinary local request. It's pure authored flavor text (a short vignette), and — like existing rumors — can occasionally point at a real `world2.discoveries` target (reusing `cp2SuggestedDestination`-style hinting) so it isn't purely decorative. No new data shape: it's a rumor entry with a distinct `kind`.
Loop-back: sends the player toward a real Adventure/Exploration target through the existing Rumor Notebook.

### 4. 住民関係 — Resident Relationships
**Reuses:** the existing resident roster (`settlementCore.js`/`settlementUi.js`) + the exact math pattern already proven by Companion Bond (`companionBond.js`: level, milestones, small stat/flavor payoff).
Design: named residents gain a bond-like `favor` counter (same growth curve as Companion Bond, just a second instance of the same formula keyed by resident id, not a new system). Milestones unlock short flavor scenes and a small existing-Market discount for that resident's shop, if any — never a stat/combat bonus, to avoid a hidden second progression currency in disguise.
Loop-back: rewards revisiting Settlement and talking to residents; discount feeds the existing Market economy.

### 5. 治安事件 — Security Incident
**Reuses:** `settlementDefense.js` incidents wholesale, just at a smaller scale than existing invasions.
Design: a lightweight incident tier ("酔漢の乱闘", "市場荒らし") that resolves via either a short existing Text Battle (reusing the invasion battle path) or a materials-cost "dispatch a guard" choice modeled directly on `settlementExpeditions.js`'s agent-dispatch UI. Outcome nudges the existing Policy/Faction standing (`settlementIdentity.js`), it does not add a new standing track.
Loop-back: gives Defense screen more to do between real invasions; feeds existing faction/policy state.

### 6. 占い — Fortune-Telling
**Reuses:** `endgameGuidanceUi.js` almost verbatim. This is the lowest-risk idea in the pool.
Design: a Tavern/Market NPC re-presents the existing `buildEndgameGuidance()` "what to do next" computation as an in-fiction fortune reading, for a small existing-currency cost. No new logic — just a diegetic wrapper and new flavor strings per guidance lane (`story`, `awakening`, `transcendent`, …), reusing the lane ids that already exist.
Loop-back: none needed beyond what `endgameGuidance` already does — it's a costume, not a new feature.

### 7. 失踪事件 — Disappearance Incident
**Reuses:** the Adventure4 Investigation board wholesale (`adventureWorld4InvestigationUi.js`, `ADVENTURE4_INVESTIGATION_CATALOG`, `adventure4NpcNetwork`, Rumor Notebook).
Design: a named resident goes missing; a Tavern rumor opens a short trace/clue chain using the exact same trace/clue card components already built for world Investigation, just rooted at the Settlement instead of a Region. Resolution is a normal battle or a clue-gated confirm, same as existing Mystery resolution (`researchAdventure4Mystery`). Reward is an existing material bundle or a Ranch egg — never a new item tier.
Loop-back: strongest thematic fit for Blade Vale's "records/observation" tone (per `STORY_CANON.md` — a person vanishing without a trace) while staying entirely optional flavor, no new Story progression.

### 8. Rift街区異界化 — Rift District Reality-Shift
**Reuses:** `riftKeyCore.js` / World III Rift Keys + the existing Rift stage builder.
Design: periodically (season-tied, like #2), one Settlement district visually flags as "shifted" and offers one Rift-tier encounter built with the same `buildAbyssStage`/Rift route machinery already used in World III, at existing Rift reward rates. It is not a new Rift source, just an additional access point for players who already hold a Rift Key.
Loop-back: ties Settlement directly into the existing endgame Rift loop, exactly the kind of "loop back" the pool rule asks for.

### 9. Nemesis襲撃 — Nemesis Raid
**Reuses:** `settlementDefense.js` incidents + the existing Bounty/Nemesis system (`nemesis3.js`, `bounty2Foundation.js`, `bountyNemesisInfo`) — two fully-built systems, zero new data model.
Design: once a Nemesis has grown past a small level threshold from prior bounty losses, it can appear as a special Defense incident instead of purely waiting at its bounty stage. Combat uses the exact existing Nemesis-scaled enemy build; victory grants existing Bounty Marks plus normal Defense-incident rewards.
Loop-back: gives the existing Nemesis-growth system a second place to matter, and gives Defense a marquee threat. My top pick alongside #7 for "feels new, costs almost nothing" — it is pure recombination of two already-shipped systems.

### 10. Secret Realm門 — Secret Realm Gate
**Reuses:** `state.explorationSites` / `buildSecretRealmStage` wholesale.
Design: a hidden Settlement Exploration facility ("封じられた門") that, once discovered, exposes ONE existing Secret Realm as directly enterable from Settlement — an alternate access point, not a new Realm. Unlock condition is a Settlement Rank/facility-Lv threshold rather than the original world-map discovery clue, giving Settlement-focused players a second route into content they might otherwise miss.
Loop-back: feeds the existing Secret Realm reward loop; encourages Settlement investment to matter for combat progression too.

## Suggested implementation order

Not because any single one is required first, but because later items reuse the same UI insertion points as earlier ones and are cheaper once those exist:

1. **#6 占い** — smallest possible slice; validates the "reskin an existing computation" pattern.
2. **#5 治安事件** and **#9 Nemesis襲撃** — same Defense-incident card component, do together.
3. **#3 宿屋の夢** and **#7 失踪事件** — same Tavern-rumor entry point; #7 is the bigger of the two (reuses Investigation board).
4. **#1 釣り場**, **#4 住民関係** — self-contained, no shared risk with the others.
5. **#2 教会・祠**, **#8 Rift街区異界化**, **#10 Secret Realm門** — all three reuse the hidden-facility discovery pattern from `settlementSecrets.js`; batch them once that pattern is confirmed still correct.

## Non-goals (explicit)

- No new top-level Settlement building slot beyond the existing 5 core + hidden-facility system.
- No relationship/dating-sim depth for #4 beyond flavor text + one Market discount.
- No new enemy authority for #9 — it must call the existing Nemesis scaling code, not a parallel one.
- No permanent missable content for #7 — a missed disappearance chain should be able to resolve later, not vanish forever (matches the "no permanent-loss" Settlement 3.0 contract).
