# Gear Overhaul Phase 6 — Weapon Identity

Status: **Phase 6A ✅ / Phase 6B ACTIVE — existing 8 families / 24 archetypes only**

## Goal

Make the equipped weapon change **how the player fights**, not only the size of ATK/MAG/SPD/CRIT numbers.

Phase 6 deliberately deepens the existing systems:

- 8 mastery families remain the compatibility root.
- 24 Equipment 3.0 archetypes remain the loot identity layer.
- 24 existing Combat 2.0 Weapon Techniques remain the active-skill layer.
- Job / Fusion Job weapon affinity remains unchanged.
- Option 4.0 remains the random-build layer.

No new currency, progression root, Home button, daily/weekly loop, or weapon family is introduced here.

## 6A — Family + Archetype combat identity ✅

Each mastery family now has a canonical loop:

| Family | Combat loop |
|---|---|
| 剣 | 安定・崩し・反撃 |
| 斧 | 破甲・処刑・Boss |
| 杖 | 魔法・属性・MP循環 |
| 弓 | 貫通・手数・精密射撃 |
| 短剣 | 手数・会心・毒・処刑 |
| 拳具 | 連撃・圧力・継戦 |
| 楽器 | 戦律・自己強化・テンポ |
| 錫杖 | 聖光・弱体・持久戦 |

The 24 existing archetypes specialize the already-existing Weapon Techniques. Examples:

- 大剣: higher packet power, higher MP burden.
- 刀: added crit bonus.
- 戦斧 / 弩: stronger armor penetration.
- 大斧 / 暗殺刃: low-HP execution windows.
- 魔導書 / 笛: stronger MP efficiency.
- 短弓 / 双短剣 / 爪: extra hit opportunities while roughly preserving raw packet total.
- セスタス / 聖杖: sustain-oriented temporary buffs.
- 戦鼓: offensive tempo buffs.

The key balance rule is: **fast archetypes gain proc opportunities, not a free multiplicative DPS explosion**.

PR #249 establishes this layer.

## 6B — Three-technique mini rotations 🔄

The existing Lv1 / Lv100 / Lv350 Weapon Techniques now form a soft three-step chain:

`Opener → Setup → Finisher`

- no visible meter or saved resource
- the chain exists only on the active `BattleEngine`
- Job skills and normal attacks can be woven between weapon techniques
- using Weapon Techniques in the intended order earns family-specific bonuses
- wrong order simply loses the chain bonus; it never blocks the command

Family payoffs remain distinct:

| Family | Setup payoff | Finisher payoff |
|---|---|---|
| 剣 | stronger DEF break | power + crit |
| 斧 | penetration + break | heavier execution |
| 杖 | cheaper setup spell | stronger efficient nova |
| 弓 | extra penetration | precision power + crit |
| 短剣 | stronger DoT | crit + execution |
| 拳具 | stronger slow/break | extra proc hit without runaway raw packet damage |
| 楽器 | stronger tempo buff | larger finale buff package |
| 錫杖 | added weaken | stronger holy hit + regeneration |

This is a **soft reward**, not a mandatory rotation. Brute-force and mixed Job/Weapon builds remain valid.

## Runtime contract

`BattleEngine` still derives the equipped weapon from the existing `state.data.equipped.weapon` slot. The weapon's existing `weaponArchetype` metadata is passed into `weaponTechniquesFor(...)`.

Calling `weaponTechniquesFor(type, level)` without an archetype remains backward compatible and returns the canonical base techniques.

Weapon-chain state is encounter-local (`BattleEngine._weaponTechniqueChain`) and is not written to saves.

## Next

### Phase 6C — Job + Option synergy

Verify each family has multiple credible builds across Basic/Fusion Jobs and Option bias. Avoid one mandatory Option package per weapon. Add authored synergy guidance only where it corresponds to real combat behavior.

### Phase 6D — Balance / presentation / closeout

Run comparative combat checks, expose concise identity text in existing Equipment/Codex presentation, update audits, then decide whether Phase 7 needs any genuinely new weapon family.

## Permanent gate for Phase 7

Do **not** add spear, gun, scythe, etc. merely for variety. A new family must:

1. not duplicate one of the existing 24 archetypes,
2. have a distinct combat loop,
3. have credible job coverage,
4. have a distinct Option bias,
5. support multiple Named/Unique weapons,
6. add more value than deepening the current family set.
