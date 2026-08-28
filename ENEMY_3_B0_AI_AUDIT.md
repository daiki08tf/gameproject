# Enemy 3.0 B0 — Current AI Audit

## Existing contracts found

### Base BattleEngine
- Non-Boss enemies eventually fall back to a standard attack.
- Bosses already have authored phase handling, including a phase transition around the existing HP threshold, telegraphs and special actions.
- Normal-enemy attacker count per round is already capped to preserve the original real-time balance assumptions.

### Combat 3 enemy AI
`js/patches/combat3EnemyAI.js` already provides a tactical skill layer on top of the base enemy turn:
- power attacks
- multi-hit attacks
- party DEF buffs
- party SPD buffs
- ally healing
- MP drain
- slow
- ATK weaken
- poison/burn damage
- cooldown/reservation logic for intent consistency

Therefore Enemy 3.0 must extend this system rather than create a parallel AI engine.

### Role mismatch discovered
Enemy 2.0 expanded encounter identity to include regional roles:
- attacker
- caster
- trickster
- support

The older Combat 3 profile table primarily understands its own five combat roles and legacy enemy IDs/suffixes. Enemy 2.0 advanced regional IDs can therefore fall through to a generic profile instead of expressing their intended encounter role in combat.

## B1 decision
Add a small spawn-time bridge after Enemy 2.0 migration:
1. Read the authoritative spawned enemy `role`.
2. Only map `attacker/caster/trickster/support`.
3. Reuse existing Combat 3 skill kinds and action resolver.
4. Do not override Boss, Rare, normal, fast or tank behavior.
5. Re-run the existing Combat 3 skill planner after the bridged profile is installed.

## Explicit non-goals
- No new status framework.
- No Boss rewrite.
- No Rare special behavior yet.
- No World Tier behavior scaling yet.
- No reward/drop changes.
- No save schema changes.
