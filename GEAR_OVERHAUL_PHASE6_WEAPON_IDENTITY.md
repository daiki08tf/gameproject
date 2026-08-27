# Gear Overhaul Phase 6 — Weapon Identity

Status: **Phase 6A ✅ / Phase 6B ✅ / Phase 6C ACTIVE — existing 8 families / 24 archetypes only**

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

All 24 existing Equipment 3.0 archetypes specialize the existing Weapon Techniques. Fast archetypes gain proc opportunities while roughly preserving raw packet total; heavy archetypes bias toward packet power; resource/sustain archetypes change MP or temporary buffs.

PR #249 establishes this layer.

## 6B — Three-technique mini rotations ✅

The existing Lv1 / Lv100 / Lv350 Weapon Techniques form a soft three-step chain:

`Opener → Setup → Finisher`

- no visible meter or saved resource
- chain state exists only on the active `BattleEngine`
- Job skills and normal attacks can be woven between weapon techniques
- intended order earns family-specific bonuses
- wrong order only loses the bonus; it never blocks a command

PR #250 establishes this layer. Its duplicate validation job passed on rerun with no gameplay change, confirming the original one-off CI failure was transient.

## 6C — Job × Weapon × Option build lanes 🔄

Every family now has **three authored credible build routes** made only from live Option families. These routes are descriptive data, not hidden combat bonuses.

| Family | Route A | Route B | Route C |
|---|---|---|---|
| 剣 | 鉄壁反撃 | 剣閃会心 | 不屈の剣 |
| 斧 | 破甲巨斧 | 巨獣狩り | 断頭処刑 |
| 杖 | 純魔導 | 魔力循環 | 反響詠唱 |
| 弓 | 先制狙撃 | 巨獣狙撃 | 五月雨 |
| 短剣 | 毒心暗殺 | 会心連刃 | 死線暗殺 |
| 拳具 | 千撃連環 | 不倒拳 | 会心拳 |
| 楽器 | 高速戦律 | 循環演奏 | 英雄奏者 |
| 錫杖 | 聖域持久 | 魔導防壁 | 審判術 |

Permanent rule: **one weapon family must not collapse into one mandatory Option package**. Regression coverage requires three distinct routes, broad Option-family coverage, and no universal package shared by all routes.

`js/data/weaponBuildSynergy.js` is reusable authored content for later Equipment/Codex guidance, Unique design, Smart Loot presets, and high-difficulty loot placement. It does not modify damage or stats.

## Runtime contract

`BattleEngine` derives the equipped weapon from the existing `state.data.equipped.weapon` slot. Existing `weaponArchetype` metadata specializes Weapon Techniques.

Calling `weaponTechniquesFor(type, level)` without an archetype remains backward compatible and returns canonical base techniques.

Weapon-chain state is encounter-local (`BattleEngine._weaponTechniqueChain`) and is not written to saves.

## Next

### Phase 6D — Balance / presentation / closeout

- run comparative checks across all 8 families / 24 archetypes
- ensure rapid-hit, heavy, execution, sustain and resource identities have bounded outputs
- expose concise family/archetype/build identity through an existing Equipment/Codex presentation surface only
- update Gear audit / roadmap and close Phase 6
- make an explicit Phase 7 go/no-go decision for genuinely new weapon families

## Permanent gate for Phase 7

Do **not** add spear, gun, scythe, etc. merely for variety. A new family must:

1. not duplicate one of the existing 24 archetypes,
2. have a distinct combat loop,
3. have credible job coverage,
4. have a distinct Option bias,
5. support multiple Named/Unique weapons,
6. add more value than deepening the current family set.
