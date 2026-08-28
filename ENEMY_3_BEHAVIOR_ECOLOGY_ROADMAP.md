# Enemy 3.0 — Behavior & Ecology Roadmap

Enemy 2.0 completed enemy identity, level, encounter roles, ranks/variants, endgame integration and Codex ecology. Enemy 3.0 deepens how those enemies behave instead of adding another raw enemy-count layer.

## Development rules
- Existing Combat 2/3 contracts are authoritative.
- Reuse existing AI/status/intent systems before adding new mechanics.
- Authored Boss behavior always wins over generic behavior.
- No new currency, save root or Home route.
- Generic Elite must never leak Abyss-only `enemy.elite` reward semantics.
- World Tier behavior escalation must not duplicate stat scaling.
- Story progression cannot depend on random lucky encounters.
- Save compatibility is mandatory.
- When regression tests fail: inspect the failing assertion and existing contract first; prefer minimal implementation fixes over weakening tests.

## Phases
- [x] B0 — Current AI Audit
- [x] B1 — Role AI 2.0 bridge
- [x] B2 — Targeting Logic
- [x] B3 — Weakness / Resistance (Enemy Affinity / Weakness 2.0, PR #283)
- [x] B4 — Elite Affix System
- [ ] B5 — Rare Monster Behaviors
- [ ] B6 — Encounter Synergy
- [ ] B7 — Boss Phase AI 2.0
- [ ] B8 — Codex Analysis 2.0
- [ ] B9 — World Tier AI Escalation
- [ ] B10 — Ch1–30 + Endgame Integration

## B1 scope
Enemy 2.0 added advanced regional roles (`attacker`, `caster`, `trickster`, `support`) after the older Combat 3 enemy profiles were authored. B1 connects those role identities to the already-existing Combat 3 tactical skill engine rather than creating a second AI engine.

Role bridge:
- attacker → frontline / power attack
- caster → caster / slow spell
- trickster → skirmisher / ATK disruption
- support → support / ally heal

`normal`, `fast`, `tank`, Rare and Boss identities remain on their existing paths. Rare behavior is intentionally reserved for B5. Boss AI remains fully authored and bypasses the bridge.

## B2 scope
B2 keeps Combat 3's existing random intent reservation as the default, then applies bounded deterministic overrides only when a role has a clear tactical reason to act.

- attacker: prioritises its existing power attack when player HP is at or below 35%.
- caster: prioritises slow against an active player SPD buff; avoids refreshing an already-active SPD debuff.
- trickster: prioritises ATK disruption against an active player ATK buff; avoids redundant ATK debuff refreshes.
- support: uses the existing lowest-injured-ally targeter; does not reserve healing above 70% HP and guarantees it at or below 40% HP.

B2 adds no new damage formula, status type, target selector, reward rule or save data. Boss and Rare behavior remain outside this generic targeting layer.

## B4 scope
B4 gives only Enemy 2.0 `genericElite` enemies one visible combat affix. Historical Abyss `enemy.elite`, Rare identities and Bosses are explicitly excluded.

Initial affixes:
- 再生 — restores 3.5% max HP before its action while injured.
- 狂乱 — gains 18% effective ATK at or below 40% HP.
- 鉄壁 — gains 16% effective DEF.
- 迅速 — gains 14% effective SPD.

Affixes reuse existing HP/effective-stat hooks. They add no reward multiplier, currency, save root, new status engine or Abyss shard semantics.
