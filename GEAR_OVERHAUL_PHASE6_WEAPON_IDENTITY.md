# Gear Overhaul Phase 6 — Weapon Identity

Status: **COMPLETE — Phase 6A / 6B / 6C / 6D ✅**

## Goal

Make the equipped weapon change **how the player fights**, not only the size of ATK/MAG/SPD/CRIT numbers, while deepening the existing 8 families / 24 archetypes instead of creating another progression system.

No new currency, progression root, Home button, daily/weekly loop, or weapon family was introduced.

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

All 24 Equipment 3.0 archetypes specialize the existing Weapon Techniques. Fast archetypes gain proc opportunities while roughly preserving raw packet total; heavy archetypes bias toward packet power; resource/sustain archetypes change MP or temporary buffs.

PR #249 establishes this layer.

## 6B — Three-technique mini rotations ✅

The existing Lv1 / Lv100 / Lv350 Weapon Techniques form a soft chain:

`Opener → Setup → Finisher`

- no visible meter or saved resource
- chain state exists only on the active `BattleEngine`
- Job skills and normal attacks can be woven between steps
- intended order earns family-specific bonuses
- wrong order only loses the bonus; it never blocks a command

PR #250 establishes this layer. A duplicate validation failure passed on rerun with no code change, confirming a transient CI failure rather than a gameplay defect.

## 6C — Job × Weapon × Option build lanes ✅

Every family has **three authored credible build routes** made only from live Option families. They are descriptive content, not hidden combat bonuses.

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

Permanent rule: **one weapon family must not collapse into one mandatory Option package**.

PR #251 establishes `js/data/weaponBuildSynergy.js`, which can later feed Unique design, Loot placement, Codex guidance or Smart Loot presets without duplicating build logic.

## 6D — Balance / closeout ✅

Regression gates now run every family/archetype through its specialized techniques and earned Setup/Finisher bonuses.

Current closeout bounds:

- raw technique packet ratio: `0.85–1.35×` of canonical technique
- total technique hits: `<= 7`
- technique-added Crit: `<= 60`
- technique Armor Pen: `<= 0.50`
- technique Weaken: `<= 0.40`
- technique MP cost: `1–30`
- execution multiplier: `<= 2.0×`
- execution threshold: `<= 40% HP`

Rapid-hit archetypes (`短弓 / 双短剣 / 爪`) additionally remain capped to roughly `<= 1.05×` raw packet output from their archetype specialization; their reward is proc opportunity rather than free burst damage.

Visual presentation expansion is deliberately deferred while the project prioritizes gameplay/content. All identity/build metadata is already reusable by existing screens later.

## Phase 7 decision — NO-GO for new weapon families

**Do not add a new mastery family now.** The current 24 archetypes already cover several names that would otherwise be mistaken for missing weapon families, including `大剣 / 魔導書 / 双短剣 / 弩`.

A future spear, gun, scythe, etc. remains possible only if it passes all gates:

1. does not duplicate one of the current 24 archetypes,
2. creates a distinct combat loop,
3. has credible Basic/Fusion Job coverage,
4. has a distinct Option bias,
5. supports multiple Named/Unique weapons,
6. adds more value than deepening the current family set.

Re-evaluate after Unique 2.0 exposes real design gaps; do not add a family merely for variety.

## Runtime contract

- equipped weapon still comes from `state.data.equipped.weapon`
- existing `weaponArchetype` metadata specializes Weapon Techniques
- `weaponTechniquesFor(type, level)` remains backward compatible without an archetype
- weapon-chain state is encounter-local and never written to saves
- build lanes do not alter stats or damage

## Next — Phase 8 Unique 2.0

Use the completed Weapon Identity + Option 4.0 foundation to author gameplay-changing Named/Unique equipment:

`Unique FIXED identity + up to 3 random Options`

Duplicates must remain valuable because their random Options / Option rarity / Option Lv can differ and unwanted copies can feed Option Fusion.
