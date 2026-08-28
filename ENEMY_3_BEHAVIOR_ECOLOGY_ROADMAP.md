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
- [x] B5 — Rare Monster Behaviors
- [x] B6 — Encounter Synergy
- [x] B7 — Boss Phase AI 2.0
- [x] B8 — Codex Analysis 2.0
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

## B5 scope
B5 gives Enemy 2.0 Rare identities one visible combat behavior. It does not alter Rare appearance rates, level bands, rewards, Codex denominators or story progression.

Initial behaviors:
- 狩人 — gains 18% effective ATK while the player is at or below 40% HP.
- 吸命 — after dealing damage, restores 5% max HP, capped by missing HP.
- 窮地 — at or below 35% HP, gains 20% effective DEF and 10% effective SPD.
- 急襲 — gains 25% effective ATK on its first actionable turn only.

Only `rank==='rare'` Rare identities are eligible. Bosses, generic Elites and historical Abyss `enemy.elite` are excluded. B5 adds no reward multiplier, currency, save root or new status engine. True Rare escape behavior is intentionally deferred because reward-free departure must be coordinated with encounter completion and Codex semantics rather than faked as a kill.

## B6 scope
B6 makes ordinary Enemy 3.0 groups react to their composition while reusing existing Combat 3 skills and effective-stat hooks.

Encounter synergies:
- Guardian cover — a `guardAll` enemy reserves its existing defense skill when an uncovered caster/support backliner is present.
- Support triage — a `healAlly` enemy reserves healing when the lowest injured ordinary ally falls to 55% HP or below.
- Screened offense — an `attacker` behind a living guardian gains +6% effective ATK; `caster`/`trickster` gain +6% effective SPD.
- Pack pressure — two or more ordinary enemies sharing the same `speciesId` gain +4% effective ATK.

Stat synergy is capped at x1.10. Bosses, Rare identities and historical Abyss `enemy.elite` are excluded; no new skill, status, reward rule, save data or World Tier scaling is introduced.

## B7 scope
B7 deepens only the existing authored Boss phase path. Boss profiles, telegraph kinds, summon rules and damage formulas remain authoritative.

Phase 2 pressure begins at the existing 50% HP transition:
- +8% effective ATK
- +8% effective SPD
- every second actionable Phase 2 turn, each existing special/summon countdown above 1 advances by one extra turn
- active telegraphs are never accelerated or replaced

B7 introduces no new Boss skill, damage formula, reward rule, save data, generic Elite/Rare behavior or World Tier scaling.

## B8 scope
B8 extends the existing `monsterCodex[enemyId]` knowledge object without adding a save root or changing Codex completion points.

Observed Enemy 3.0 knowledge:
- generic Elite Affix names seen in combat
- Rare Behavior names seen in combat
- Boss Phase 2 observation
- Inspect/analysis immediately records the current Elite/Rare identity and marks Boss phase knowledge as analyzed

The existing Role / observed skill / Affinity / Enemy 2.0 ecology records remain authoritative. A supplemental `Enemy 3.0 戦術解析` panel appears inside the Monster Codex and lists only observed/analyzed tactical knowledge. These fields do not add Codex points or permanent stat bonuses.
