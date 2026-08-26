# Content Pack II — Horizontal World Expansion

> **Status: ✅ COMPLETE — A+B / C+D / E**
>
> Parent source of truth: `ROADMAP.md`.

## Final connected loop

```text
Rumor → Tracking → Revisit → Encounter / Clue
      → Route → Multi-region Chain → Boss
      → Companion / Unique / Breeding
      → Codex / Lore / another lead
```

## Completed content

### A+B
- 10 authored rumors
- 5 rumor-gated rare encounters
- 5 authored routes: 空列の回廊 / 無音の産室 / 第八肋骨路 / 逆棚回廊 / 盲壁観測孔
- Region Mastery and Codex knowledge only provide small pursuit assistance
- encounter rates are not exposed in ordinary player text

### C+D
Three multi-region chains:
- 声なき獣の系譜
- 第八肋骨の行先
- 盲壁の二重観測

Five optional Boss encounters:
- 無鳴母獣・NEST-MOTHER
- 灰角残響獣・CINDER-HART
- 第八脈守・OCTAVE
- 重記司書・PALIMPSEST
- 双方向観測体・PARALLAX

Rewards:
- 6 secret companions
- 4 deterministic special hybrids
- 12 fixed mythic Unique rewards

### E — Final Integration
- every CP2 rumor has concise `NEXT — ...` destination guidance in the existing Rumor Notebook
- all five routes have authored outcome text
- completed chains gain post-Boss closure text
- existing Codex Field Guide has authored habitat/ecology for all 5 rare encounters + 5 Bosses
- three persistent world-lore fragments are added: 重層生育記録 / 第零線保守規格 / 二重観測票
- Lore supports the multi-layer lineage, Eighth Rib maintenance-line, and dual-observation hypotheses without identifying the unknown subject
- Japan/Tokyo is not explicitly revealed
- UI remains disclosure-based and compact
- no new Home route, screen, currency or save root
- CP2 E uses existing `world2.discoveries`
- existing mobile command safety regression remains authoritative

## Canonical implementation
- `js/data/contentPackIIAB.js`
- `js/patches/contentPackIIAB.js`
- `js/data/contentPackIICD.js`
- `js/patches/contentPackIICD.js`
- `js/data/contentPackIIE.js`
- `js/patches/contentPackIIE.js`
- `tests/content-pack-ii-ab.test.js`
- `tests/content-pack-ii-cd.test.js`
- `tests/content-pack-ii-e.test.js`

## Permanent guardrails
- Lv99,999 remains canonical
- no FOMO schedule
- no unnecessary top-level UI or currency
- optional content does not gate Ch1–25
- Modern World evidence remains restrained
- SD-4 remains deferred
- save compatibility and mobile battle-command safety remain regression gates

## Next

**Story Expansion I — Ch26–30**.

Continue the Eighth Key / external signal / Veil anomaly arc. Content Pack II discoveries may enrich interpretation but must not become mandatory story gates.

### New-session handoff
1. read `ROADMAP.md`
2. read `STORY_CANON.md`
3. read this file
4. do not redo Content Pack II A–E
5. next work is Story Expansion I — Ch26–30
6. preserve Modern World restraint, no rotating challenges, and no new Home/currency by default
7. preserve save/mobile regressions and run both CI workflows
