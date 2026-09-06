# C0 — Simplification Audit

> Status: **AUDIT COMPLETE / runtime migration pending**
>
> Parent roadmap: `LIVING_WORLD_DISCOVERY_ROADMAP.md`
>
> Scope: BREAK / GUARD / ANALYSIS deprecation, Job-count structure audit, migration boundaries, and acceptance gates before runtime removal.

## 1. Decision summary

C0 confirms the next-era simplification direction.

1. **BREAK / GUARD / ANALYSIS must stop being universal build labels.**
2. Do **not** replace them with another universal three-way taxonomy.
3. Ordinary concrete mechanics may survive without taxonomy:
   - `ぼうぎょ`, mitigation, parry, counter;
   - stagger / interrupt if a concrete skill or enemy actually owns it;
   - enemy knowledge inside 図鑑 / field research rather than a generic combat build label.
4. Enemy Intent is conceptually independent and should not be deleted merely because its current helper shares a Pack A file.
5. Job count is structurally excessive. The live Phase 8 surface is built from **15 basic jobs + all 105 two-job combinations + special/hero jobs**.
6. C1 must replace combinatorial preservation with a curated set of jobs that genuinely change play.
7. Save value is preserved. Deprecated systems may retain compatibility fields during migration, but they must stop appearing as live player-facing build concepts.

---

## 2. BREAK / GUARD / ANALYSIS dependency inventory

### 2.1 Canonical Pack A data

`js/data/systemDeepeningPackA.js` defines:

- `SD_BUILD_TAGS`
  - `BREAK -> break`
  - `GUARD -> guard`
  - `ANALYSIS -> analysis`
- three fixed Unique identities:
  - `uq_dragonbone_edge` / **竜骸破断** — BREAK window damage
  - `uq_nameless_crown` / **王墓の反勢** — post-guard attack
  - `uq_inverted_codex` / **既知反転** — analyzed-enemy damage
- three MASTER-route synergies:
  - `sword_blademaster` / **剣聖・破断追撃**
  - `sword_guardian` / **護剣・守勢反転**
  - `staff_arcanist` / **秘術師・既知利用**
- `isBreakWindow(enemy)` based on `enemy.breakMax` and `enemy.breakGauge`
- `classifyEnemyIntent(enemy)`

### 2.2 Pack A runtime patch

`js/patches/systemDeepeningPackA.js` adds four concerns in one patch:

1. a `calculateDamage` wrapper for Unique + mastered-route multipliers;
2. a `_playerAttack` wrapper that remembers whether a normal attack followed `ぼうぎょ`;
3. equipment-row `BUILD BREAK / GUARD / ANALYSIS` decoration;
4. enemy-card Intent text rendering.

These concerns must be separated during migration. The first three belong to the deprecated build vocabulary; enemy Intent does not.

### 2.3 Startup wiring finding

The audited `js/main.js` does **not directly import** `js/patches/systemDeepeningPackA.js`.

This matters because the roadmap previously described Pack A as complete, while the current startup list does not make Pack A an obvious live runtime dependency. C0 implementation must therefore:

- verify whether any indirect import exists before deleting files;
- not assume that Pack A effects are active merely because the files exist;
- remove dead/dormant presentation and data rather than reconnecting the deprecated system.

### 2.4 BREAK-window finding

The Pack A helper expects `enemy.breakMax` and `enemy.breakGauge`. The canonical `BattleEngine` inspected during this audit does not establish those fields in its base enemy/player initialization path.

This is another reason not to invest in repairing BREAK as a universal axis. Before deletion, runtime migration should perform one final repository-wide reference check for those field names and then either:

- remove dormant BREAK-window code; or
- if another isolated mechanic owns them, keep that mechanic under a concrete Japanese name without the BUILD BREAK taxonomy.

### 2.5 GUARD distinction

`GUARD` the Pack A build label is deprecated.

`ぼうぎょ` the battle command is **not** deprecated.

Likewise, these concrete behaviors can remain:

- guard mitigation;
- parry;
- counterattack;
- defensive conversion into offense.

The current `王墓の反勢` idea is already concrete enough to survive after removing the generic `GUARD` tag. It should become an ordinary fixed effect if retained.

### 2.6 ANALYSIS distinction

`ANALYSIS` the Pack A combat-build label is deprecated.

Knowledge itself is not. The useful design intent moves toward:

- 図鑑 completion;
- field research;
- enemy ecology;
- archaeology interpretation;
- rumor / secret inference.

`既知反転` must not keep a global “ANALYSIS build” alive by another name. Its long-term identity should be redesigned in C9/C13, or temporarily reduced to a safe ordinary fixed effect during C0 migration.

---

## 3. Job-count structural audit

### 3.1 Current authority stack

The current UI imports `js/data/jobsPhase8.js`.

That layer builds the visible job set from:

- legacy **basic** jobs;
- `fusionRuntimeJobs(...)` for all fusion jobs;
- legacy **special** jobs;
- legacy **hero** jobs.

`js/data/jobFusion.js` explicitly defines the full `15C2 = 105` pair registry.

This means the current issue is not merely “a few redundant jobs”. The architecture deliberately creates every pair of 15 basic jobs.

### 3.2 Why the 105-fusion structure fails the new identity rule

`js/data/fusionRuntime.js` preserves authored legacy fusion jobs when available, but generated fusion jobs default to:

- an averaged parent stat profile;
- inherited weapon affinities;
- `skills: []`;
- `spells: []`;
- a generic cooldown-oriented master ability.

`jobFusion.js` supplies names, tags, metadata summaries and constellation metadata to all pairs, but that does not guarantee a distinct playable combat loop.

Therefore many generated jobs can exist as **data identities without owning a distinct kit**. This directly violates the C1 rule:

> A job exists because it changes how the player fights, not because every pair can be named.

### 3.3 Basic 15 — preliminary identity review

This is a C0 triage, not the final C1 keep/merge decision.

| Basic job | Current visible premise | C1 review direction |
|---|---|---|
| 戦士 | durable sword frontliner | KEEP CANDIDATE — defense / counter identity can be sharpened |
| 武闘家 | fast physical multi-hit | KEEP CANDIDATE — pressure/combo identity |
| 魔法使い | offensive elemental caster | KEEP CANDIDATE — clear resource/casting identity |
| 僧侶 | heal/support caster | REVIEW — solo-game support identity must earn its slot |
| 盗賊 | speed/crit/drop + poison/steal | REVIEW — combat identity and loot utility currently mixed |
| 商人 | gold/drop economy | MERGE/REPURPOSE CANDIDATE — economy bonus alone should not justify a combat job |
| 狩人 | bow / monster hunting | KEEP CANDIDATE — mark/target/monster specialization can be concrete |
| 忍者 | speed/status | REVIEW — overlaps thief/status assassin space |
| 吟遊詩人 | self-buff song | REVIEW — needs a genuinely different tempo/resource loop |
| 踊り子 | evasion/illusion | REVIEW — overlaps bard/ninja/fortune without stronger loop |
| 錬金術師 | bombs/status/reactions | KEEP CANDIDATE — reaction/detonation loop can be distinct |
| 学者 | EXP + weakpoint/analysis | REPURPOSE CANDIDATE — combat ANALYSIS identity is being retired; knowledge may move to 図鑑 systems |
| 農民 | durability/drop | MERGE/REPURPOSE CANDIDATE — currently mostly stats/flavor outside specific skills |
| 大工 | defense/parry/counter | MERGE/KEEP REVIEW — strong concrete counter identity, but overlaps defensive 戦士 |
| 占い師 | crit/fate/omens | REVIEW — can survive only if fate manipulation is an actual loop rather than crit stats |

No deletion is authorized solely by this table. C1 must inspect skills, passives, save progress, special-job prerequisites and weapon ties before changing the canonical roster.

### 3.4 Fusion jobs — C1 default rule

C1 should **not** preserve all 105 fusion jobs by default.

Use this order:

1. identify a small target roster of strong tactical jobs;
2. map legacy jobs to those identities;
3. move useful named skills/effects to retained jobs, mastery, runes, Unique gear or other existing authorities;
4. preserve old mastery investment through migration credit;
5. retire the combinatorial all-pairs UI and unlock requirement.

The previously discussed **8–12 strong jobs** remains a target range, not a quota. If 13 genuinely distinct loops survive the audit, keep 13. If only 9 do, keep 9.

---

## 4. Specialization-route impact

`js/data/job3Specializations.js` currently assigns two specialization routes by preferred weapon family.

Pack A only adds special cross-system bonuses to three route IDs:

- `sword_blademaster`
- `sword_guardian`
- `staff_arcanist`

The routes themselves already have independent ordinary nodes such as ATK, skill damage, mitigation, MP efficiency and debuff power. Therefore:

- do **not** delete those specialization routes merely because Pack A synergies are removed;
- remove only the BREAK/GUARD/ANALYSIS cross-tag bonus layer;
- C1 can later decide whether specialization trees remain useful after the job roster is consolidated.

---

## 5. Migration policy

### 5.1 Saves

C0 must not destroy historical value.

- Old equipped Unique IDs remain valid item IDs.
- Old job mastery records remain readable.
- Old specialization selections remain load-safe even if a route later becomes hidden/deprecated.
- Deprecated fields may be retained as ignored compatibility data for at least one migration generation.
- No new save root is introduced.

### 5.2 Unique gear

Do not delete a player-owned Unique merely because its Pack A identity is removed.

Runtime implementation must choose one of:

- **retain as direct concrete effect** without BUILD tag;
- **author a replacement fixed effect** that preserves rough value and theme;
- **temporarily keep item base stats while scheduling identity rewrite** if no safe equivalent exists.

Current preferred treatment:

- **王墓の反勢**: retain as direct “ぼうぎょ後の次の通常攻撃” effect; remove GUARD taxonomy.
- **竜骸破断**: redesign; do not repair the BREAK gauge merely to preserve it.
- **既知反転**: redesign toward C9/C13; do not preserve ANALYSIS as a hidden combat taxonomy.

### 5.3 MASTER route synergies

Remove the Pack A-only 10% bonuses tied to BREAK/GUARD/ANALYSIS tags.

The underlying Job 3.0 route nodes remain unless C1 later changes them.

### 5.4 UI

Remove live player-facing strings such as:

- `BUILD BREAK`
- `BUILD GUARD`
- `BUILD ANALYSIS`
- generic English build labels used only for this system.

Follow `PLAYER_FACING_LANGUAGE_POLICY.md`.

---

## 6. Enemy Intent preservation plan

Enemy Intent is useful and should survive C0 because it makes enemy behavior readable.

However, its current implementation is coupled to Pack A files.

C0 runtime migration should extract it into a neutral module, for example:

- data/helper: `enemyIntent.js`
- UI patch: `enemyIntentUi.js`

The actual filename is implementation-owned; the design requirement is separation, not a naming mandate.

Intent labels shown to players should also follow the Japanese-first policy. Replace generic visible `ATTACK / GUARD / SUPPORT / DISRUPT / CAST / DANGER` with Japanese equivalents if those strings are live.

---

## 7. C0 runtime work order

1. Final repository-wide reference verification for:
   - `SD_BUILD_TAGS`
   - `SD_UNIQUE_IDENTITIES`
   - `SD_MASTER_SYNERGIES`
   - `systemDeepeningBuildSummary`
   - `_sdGuardAttack`
   - `breakGauge`
   - `breakMax`
2. Extract/preserve Enemy Intent independently.
3. Remove Pack A build-tag damage wrapper and equipment BUILD decoration.
4. Convert or neutralize the three affected Unique identities without deleting owned items.
5. Remove the three Pack A MASTER-route cross-tag bonuses.
6. Preserve ordinary `ぼうぎょ` / parry / mitigation behavior.
7. Update tests and startup/import checks.
8. Confirm old saves load.
9. Mark C0 complete only after runtime and tests pass.
10. Begin C1 with the curated-job identity audit; do not start by deleting jobs blindly.

---

## 8. C0 acceptance gates

C0 is complete only when all are true:

- BREAK / GUARD / ANALYSIS are absent as universal player-facing build systems.
- No replacement universal triad has been introduced.
- `ぼうぎょ`, parry, mitigation and other concrete mechanics still work where intentionally retained.
- Enemy Intent still works independently of deprecated Pack A build vocabulary.
- A player-owned affected Unique is not silently deleted or invalidated.
- Old job mastery/specialization save data loads without failure.
- Job-count structural findings are documented for C1.
- The 105-pair fusion system is explicitly considered deprecated architecture pending C1 migration, not treated as a roster that must all be preserved.
- Player-facing labels affected by this work follow the Japanese-first language policy.
- Existing automated regression baseline remains green.

---

## 9. C1 handoff

C1 starts from this conclusion:

> **Do not ask which of 131-ish jobs can be deleted. Ask which combat loops deserve to be jobs.**

The next artifact should define the target combat loops first, then map old jobs and progress into them.
