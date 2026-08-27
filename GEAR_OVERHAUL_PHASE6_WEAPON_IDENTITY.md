# Gear Overhaul Phase 6 — Weapon Identity

Status: **Phase 6A ACTIVE — existing 8 families / 24 archetypes only**

## Goal

Make the equipped weapon change **how the player fights**, not only the size of ATK/MAG/SPD/CRIT numbers.

Phase 6 deliberately deepens the existing systems:

- 8 mastery families remain the compatibility root.
- 24 Equipment 3.0 archetypes remain the loot identity layer.
- 24 existing Combat 2.0 Weapon Techniques remain the active-skill layer.
- Job / Fusion Job weapon affinity remains unchanged.
- Option 4.0 remains the random-build layer.

No new currency, progression root, Home button, daily/weekly loop, or weapon family is introduced here.

## 6A — Family + Archetype combat identity

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

## Runtime contract

`BattleEngine` still derives the equipped weapon from the existing `state.data.equipped.weapon` slot. The weapon's existing `weaponArchetype` metadata is passed into `weaponTechniquesFor(...)`.

Calling `weaponTechniquesFor(type, level)` without an archetype remains backward compatible and returns the canonical base techniques.

## Next

### Phase 6B — Technique differentiation / mastery payoff

Deepen the three techniques per family so the Lv1 / Lv100 / Lv350 unlocks form a deliberate mini-rotation instead of three independent buttons. Reuse current cooldown, MP, buff, weaken, DoT and hit systems.

### Phase 6C — Job + Option synergy

Verify each family has multiple credible builds across Basic/Fusion Jobs and Option bias. Avoid one mandatory Option package per weapon.

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
