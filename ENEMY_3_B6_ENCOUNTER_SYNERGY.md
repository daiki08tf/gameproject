# Enemy 3.0 B6 — Encounter Synergy

B6 adds bounded group-level behavior on top of the existing Combat 3 skill engine. It does not add a second combat AI, new status types, rewards, save data or World Tier stat scaling.

## Contracts
- Existing Combat 3 `guardAll`, `healAlly` and effective-stat hooks remain authoritative.
- Bosses, Rare identities and historical Abyss `enemy.elite` are excluded from generic synergy.
- Generic Elite may participate as an ordinary Enemy 2.0 combatant; its separate affix/reward safety rules remain unchanged.
- Synergy changes reservations only when an existing skill is ready (`combat3SkillCd <= 1`).
- Stat synergy is capped at x1.10.

## Synergies
- Guardian cover: prioritize existing `guardAll` when an uncovered caster/support backliner is alive.
- Support triage: prioritize existing `healAlly` when the lowest injured ordinary ally is at or below 55% HP.
- Screened offense: attacker +6% ATK behind a guardian; caster/trickster +6% SPD behind a guardian.
- Pack pressure: two or more ordinary enemies sharing `speciesId` gain +4% ATK.
