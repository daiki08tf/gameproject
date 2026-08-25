# Phase 5 — Battle Integration 3.0 COMPLETE

Status: **Complete**

This document records the completion gate for ROADMAP Phase 5 so Claude Code / Codex can treat Battle Integration 3.0 as an integration-complete system rather than a feature backlog.

## Integrated combat loop

Blade Vale combat now follows this intended loop:

1. Read enemy role / formation / telegraph.
2. Test elements; discovered effectiveness is persisted to Monster Codex.
3. Use known weakness and status setup to accelerate Break.
4. Status combos amplify Break; Shatter consumes Frost and opens vulnerability.
5. BREAK creates a visible **BURST WINDOW** and cancels pending special telegraphs.
6. Broken/frozen protectors cannot intercept, opening priority backline targets.
7. Companion tactics support the selected plan without requiring full manual companion control.
8. Bosses transition through readable encounter phases and escorts.

## Encounter hierarchy

### Normal enemies

Primary challenge: role + formation.

- Frontline applies direct pressure.
- Guardian protects backline.
- Caster / Support creates priority-target decisions.
- Observed role/skill knowledge returns through Codex and battle UI.

### Elite enemies

Primary challenge: urgency.

- Modest extra HP/ATK/DEF beyond normal text-combat scaling.
- Tactical skills recover faster.
- UI explicitly identifies Elite pressure.

Elite is intentionally not a separate stat-wall system.

### Bosses

Primary challenge: multi-phase execution.

- Escorts / guard units.
- Phase thresholds.
- Phase-specific stat and AI changes.
- Special-action telegraphs.
- Break can cancel a pending special action.
- Battle UI displays current phase and the next phase threshold.

## Battle UI completion gate

Enemy cards expose compact actionable information without leaking undiscovered Codex data:

- HP
- Break / BURST WINDOW
- discovered elemental effectiveness
- known role / observed skill
- special-action telegraph
- Elite pressure label
- Boss phase / next threshold

Technique menus show element and known multiplier against the selected target.

## Completion criteria

The Phase 5 roadmap criterion is considered satisfied when:

> Reading the enemy and choosing actions outperforms mindless normal-attack spam.

Battle systems should now be **balanced and content-tuned**, not replaced by another parallel combat system.

## Rule for future development

Do not create Battle 4.0 merely to add another combat axis. New combat work should first reuse these established axes:

**Element → Status setup → Break → Burst → Formation / Phase response**

Phase 6 (World 3.0) may now proceed.
