# Post-CP3 Endgame Roadmap

## Direction

Content Pack III completed the Observation Reflux mystery loop. The next horizontal expansion should make existing build choices matter in dangerous places rather than add another parallel progression system.

Permanent rules remain unchanged:

- Character cap stays Lv99,999 and Item Power cap stays 10,000.
- No new Home button, currency, save root, daily/weekly/FOMO loop, or mandatory gate for Ch1-30.
- Reuse Adventure / Exploration / Secret Realm / Abyss combat / Codex / Ranch / Equipment / Job surfaces first.
- New high-end rewards should widen build choices, not become universal mandatory BiS.
- Mobile battle commands and bounded encounter presentation remain release blockers.

---

## Phase 1 — Deep Survey ✅

CP3 hidden routes become reusable post-cap high-difficulty exploration targets after their related hidden bosses are defeated.

### 1. 返信炉床・深層観測

- Unlock: ACK-WARDEN + CINDER-REPLY defeated.
- Combat target: durability / guard-counter / sustain.
- Pressure: enemy HP +30%, healing -50% plus the deterministic Abyss-depth environment.
- Baseline: Lv99,999 / IP10,000, post-cap depth 3200 combat scale.

### 2. 第九照準廊・深層観測

- Unlock: RETURN-CLOCK defeated.
- Combat target: speed / first strike / burst.
- Pressure: enemy ATK +40%, Elite threat +2 plus the deterministic Abyss-depth environment.
- Baseline: Lv99,999 / IP10,000, post-cap depth 3600 combat scale.

### 3. 異記憶根室・深層観測

- Unlock: ROOT-RECEIVER + LIVING-ARCHIVE defeated.
- Combat target: sustain / magic / action rotation.
- Pressure: enemy HP +30%, healing -50%, Boss technique +1 plus the deterministic Abyss-depth environment.
- Baseline: Lv99,999 / IP10,000, post-cap depth 4200 combat scale.

### Integration

- Appears inside the existing Exploration / Secret Realm list.
- Uses existing CP3 `world2.discoveries` as the unlock source.
- Uses normal stage clear records for completion/rematches.
- Uses Abyss 3.0 combat/challenge/reward machinery but is not an Abyss run.
- No extra save progression field is required.

---

## Phase 2 — Survey Conditions

After Phase 1 playtesting, add a small set of authored optional conditions to Deep Survey replays.

Goal: let the player deliberately ask, “Can this build survive a harsher version?” without creating a new currency or season system.

Preferred implementation:

- reuse existing Abyss Challenge clauses where possible;
- 2-3 selectable conditions per region;
- show which build archetypes gain or lose value before entering;
- reward bias toward existing Greater / Legendary / Set / region-tagged loot;
- store only ordinary stage/challenge records if persistence is needed.

Do not implement a generic infinite modifier tree.

---

## Phase 3 — Convergence Apex

Only after all three Deep Surveys have been cleared should a final convergence target become visible.

Design goal:

- one authored multi-phase apex encounter;
- mechanics should require switching between durability, tempo and action-diversity thinking learned in the three regions;
- no new level cap;
- no new mandatory equipment tier;
- first-clear reward should be distinctive but side-grade oriented;
- lore should advance the unresolved question of why returned observation behaves differently in living, mechanical and burned-record media without naming the external world.

This phase should be built only after Phase 1 difficulty and build diversity are validated.

---

## Phase 4 — Next vertical expansion decision

After Deep Survey + Convergence Apex are tuned, decide whether the project has earned Ch31+.

If story continues, derive it from unresolved WORLD_LORE_BIBLE questions:

- who initiated or shaped the bidirectional observation;
- why Blade Vale was observable;
- what the observation directions actually measure;
- why living systems preserve data missing from machine records.

Do not reveal a literal Japan/Tokyo identity unless the canon direction is deliberately changed first.
