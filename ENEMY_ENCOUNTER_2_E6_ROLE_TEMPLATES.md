# Enemy 2.0 E6 — Role-First Encounter Templates

Status: **COMPLETE CANDIDATE**

## Why

E5 proved that an opt-in stage can swap ordinary enemy types safely, but independent per-spawn randomness is only plumbing. E6 turns that plumbing into authored-feeling random parties.

## Ch1 templates

- `mixed` — normal / fast / attacker
- `pack` — fast / attacker / fast
- `frontline` — tank / attacker / normal
- `escort` — tank / support / caster
- `ambush` — trickster / fast / attacker
- `bulwark` — tank / support / tank

Templates are weighted, then roles are resolved from the existing Ch1 Encounter Pool. Compatible Global Species may fill a role naturally; for example the true-global slime can fill a normal slot and the global wolf can fill an attacker slot.

## Runtime implementation

E6 does not rewrite BattleEngine queue creation.

`enemy2EncounterTemplates.js` peeks the next existing queue spec immediately before `beginNextEncounter()`, creates a role-first plan with exactly the same count, and stores a transient planned type sequence. The E5 spawn bridge consumes that sequence while delegating every resolved type into the existing Enemy Lv / Combat2 spawn pipeline.

The plan is cleared immediately after encounter creation and is never saved.

## Preserved contracts

- original fixed `waves` remain available,
- total enemy count unchanged,
- encounter count/group-size safety unchanged,
- Boss encounter bypasses templates,
- Chapter Rare absent,
- generic Elite absent,
- no reward/IP/Option changes,
- no save/currency/Home route.

## Tests

`tests/enemy2-e6-role-templates.test.js` locks:
- all six templates and role patterns,
- Ch1-only pilot activation,
- role-before-species resolution,
- no Boss/Rare/Elite resolution,
- deterministic seeded reproducibility,
- all template families reachable,
- count 1–3 never enlarged,
- production import order after E1/E2/E5.

## Next

E7 separates generic enemy rank semantics from historical Abyss Elite and then adds optional Rare / generic Elite / environmental Variant behavior.
