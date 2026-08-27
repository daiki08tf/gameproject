# Content Pack III — Observation Reflux

> Parent source of truth: `ROADMAP.md`.
>
> Theme: after Ch30 proves observation is bidirectional, returned observation begins changing already-known regions.

## Design rule

CP3 must deepen old places instead of opening a parallel game mode.

```text
Ch30 response
   ↓
old region changes
   ↓
Rumor → revisit → anomalous ecology
   ↓
hidden route → multi-region chain
   ↓
Hidden Boss / Companion / Unique / Lore
```

Use existing Adventure / regional exploration / Rumor Notebook / Codex / Ranch / Text Battle / `world2.discoveries`.

No new Home route, currency, save root, daily/weekly loop or mandatory side-content gate.

## A — Observation Reflux Clusters ✅ IMPLEMENTED

Three initial post-Ch30 clusters:

### 灰燼の外縁
- 噂：動き続ける焼影
- 噂：灰に刻まれた返信印
- Hidden Encounter: 残照追跡体・AFTERIMAGE
- Hidden Route: 返信炉床

### 天雷墓標群
- 噂：戻ってくる落雷
- 噂：第九照準線
- Hidden Encounter: 帰還雷標・BACKTRACE
- Hidden Route: 第九照準廊

### 虚花の庭園
- 噂：知らない生活を咲かせる花
- 噂：根脈からの返答
- Hidden Encounter: 外記憶花・OFFWORLD BLOOM
- Hidden Route: 異記憶根室

Rules:
- Ch30 clear is required before these rumors exist.
- the target old region must already be cleared.
- hidden encounters are low-frequency follow-up encounters, never added to the visible initial enemy pile.
- CP3 anomalies are transformed local ecology / infrastructure / memory, not casual alien invasions.
- Japan / Tokyo remains unidentified.

## B — Multi-region Convergence ← NEXT

Turn the three routes into 2–3 authored secret chains with different structures.

Preferred chain patterns:
- **Ash → Thunder:** reply mark is identified as a targeting acknowledgment rather than writing.
- **Thunder → Garden:** outbound lightning and memory roots share the same returned timing signature.
- **Garden → Ash / external record:** living memory preserves a fragment that infrastructure could not.

Deliver in one large batch:
- 2–3 Secret Chains
- 4–6 Hidden Boss / elite encounters
- 5–8 secret/recruitable companions or variants
- deterministic special breeding where ecology supports it
- ~10–16 meaningful Unique / Relic rewards
- Codex ecology entries and persistent Lore fragments

Boss conditional Hidden Drops remain deferred. Discovery + clear should produce deterministic signature rewards where appropriate.

## C — Integration / Density

Final CP3 pass:
- close every route and chain; no dead clues
- compact `NEXT` guidance in existing Rumor Notebook
- Codex habitat / ecology text
- old-region revisit density audit
- reward/build identity audit
- Challenge / REMATCH+ compatibility
- save compatibility
- startup/import-order regression
- MutationObserver idempotence
- mobile battle command safety
- update `GAME_CONTENT_CATALOG.md` and `WORLD_LORE_BIBLE.md`

If B is cohesive enough, C may be folded into the same large PR rather than becoming a micro-phase.

## Human-readable documentation contract

Maintain with significant content additions:
- `GAME_CONTENT_CATALOG.md` — named enemies, bosses, authored events, secret companions/routes and system unlock index
- `WORLD_LORE_BIBLE.md` — cosmology, chronology, terminology, known facts and intentionally unresolved mysteries
- `STORY_CANON.md` — high-level writing/canon guardrails

Exact numeric combat values stay in code rather than being duplicated in documentation.

## Permanent guardrails

- Lv99,999 remains canonical.
- Ch1–30 story progression is not retroactively gated by CP3.
- Abyss gate remains Ch1–25 unless deliberately redesigned later.
- no FOMO schedule.
- no extra Home button/currency by default.
- SD-4 conditional Boss hidden drops remain deferred.
- Modern World identity remains restrained.
- mobile command safety, startup dependency guards and MutationObserver convergence are release-blocking regressions.
