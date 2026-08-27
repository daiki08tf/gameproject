# Content Pack III — Observation Reflux

> Parent source of truth: `ROADMAP.md`.
>
> Theme: after Ch30 proves observation is bidirectional, returned observation begins changing already-known regions.

## Design rule

CP3 deepens old places instead of opening a parallel game mode.

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

## A — Observation Reflux Clusters ✅ COMPLETE

Three post-Ch30 clusters:

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

## B — Multi-region Convergence ✅ COMPLETE

Three authored Secret Chains:

1. **返信印の正体**
   - 返信炉床 → 第九照準廊
   - conclusion: reply marks are acknowledgement / targeting responses, not ordinary writing.

2. **返送周期の一致**
   - 第九照準廊 → 異記憶根室 → ACK-WARDEN
   - conclusion: returned lightning, roots and ash are local translations of one returned observation pulse.

3. **生きた記憶だけが残したもの**
   - 異記憶根室 → RETURN-CLOCK → CINDER-REPLY
   - conclusion: living ecology preserves an observation interval missing from machine/infrastructure records.
   - unresolved: deliberate deletion vs information machines cannot record.

Implemented:
- 3 Secret Chains
- 5 Hidden Bosses
- 6 secret companions
- 3 deterministic special-breeding outcomes
- 12 fixed Unique / Relic rewards
- 5 Codex ecology entries
- 3 persistent Lore fragments

Hidden Bosses:
- 応答照準守・ACK-WARDEN
- 返灰獣・CINDER-REPLY
- 帰雷時計・RETURN-CLOCK
- 受信根母・ROOT-RECEIVER
- 生体記録核・LIVING-ARCHIVE

Secret companions:
- 返信猟犬
- 返灰小獣
- 帰雷灯
- 異記憶芽
- 記録蛾
- 境界反響種

Special breeding:
- 返信猟犬 × 帰雷灯 → 照準雷犬
- 異記憶芽 × 記録蛾 → 生体記録花
- 返灰小獣 × 境界反響種 → 逆流灰種獣

Boss conditional Hidden Drops remain deferred. Signature rewards are deterministic after authored boss clears.

## C — Integration / Density ✅ FOLDED INTO B

Completed in the same batch:
- every CP3-A route now feeds an authored chain
- compact `NEXT` guidance reuses the existing Rumor Notebook
- Codex habitat / ecology text added for CP3-B bosses
- CP2 + CP3 Lore share the existing `世界断片` disclosure
- no new MutationObserver; existing idempotence guard remains authoritative
- one CP3-B authored boss maximum per run
- bosses stay queued follow-ups, preserving the initial battle-command safety envelope
- canonical equipment catalog resolves all 12 reward IDs
- Ranch special breeding wraps the existing breeding-egg flow instead of replacing it
- save data remains under existing companion / equipment / `world2.discoveries` roots
- startup boot order explicitly loads CP3-A before CP3-B
- automated CP3-B regression coverage added

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

## Status

**✅ CONTENT PACK III COMPLETE**

Next work should be play/tune/system polish or the next story expansion when the existing content has earned it; do not invent a new parallel progression layer by default.
