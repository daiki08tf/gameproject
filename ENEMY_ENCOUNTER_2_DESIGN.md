# Enemy 2.0 / Encounter 2.0 — Design Authority

Status: **DESIGNED / NOT YET IMPLEMENTED**

This document is the authoritative design for the next major enemy/content expansion after Gear Overhaul and the post-CP3 vertical extension.

The goal is not to create another top-level system. The goal is to make the existing Adventure / Text Battle / Abyss / Rift / Secret Realm / Deep Survey world feel populated, variable, and reusable from Lv1 through Lv99,999.

---

## 1. Core fantasy

Blade Vale enemies should stop feeling like one fixed list attached to one fixed stage.

The target experience is:

> 平原へ入る
> → 今回はスライムと狼が出た
> → 次はゴブリン術師が混ざった
> → 稀に見たことのない強敵が現れる
> → 同じスライムでも Lv12 と Lv87 と Lv8,400 では明確に強さが違う
> → 高難度では昔の敵も現役の獲物として再登場する

Enemy identity is therefore split into five independent concepts:

1. **Species** — what the enemy is.
2. **Role** — what it does in battle.
3. **Level** — how strong this individual is.
4. **Habitat / availability** — where it may appear.
5. **Rank / variant** — common, regional variant, Rare, Elite, Boss, etc.

A species is no longer permanently tied to a single Chapter.

---

## 2. Non-negotiable rules

- Enemy Lv uses the existing global cap: **1–99,999**.
- Existing Boss encounters remain authored/fixed unless explicitly converted later.
- Existing stage `waves` remain a valid fallback during migration.
- Save compatibility is mandatory.
- No new currency.
- No new Home button or top-level screen.
- No daily/weekly/FOMO spawn system.
- World Tier, Abyss, Rift, Secret Realm and Deep Survey keep their identities.
- Encounter randomness must never make required story progression impossible.
- Randomness creates variety, not unavoidable hard counters.
- No Single Correct Build remains authoritative.

---

# PART A — Enemy Level

## 3. Every spawned enemy has a visible level

Every runtime enemy receives:

```js
{
  level: 1047,
  speciesId: 'slime',
  role: 'normal',
  rank: 'common'
}
```

Text Battle displays, for example:

```text
スライム　Lv.1047
```

Bosses also display a level.

Enemy Lv is not merely cosmetic. It becomes the long-term universal strength axis for enemies.

---

## 4. Stage level range

A stage continues to own `recLevel`.

For ordinary encounters, initial target ranges are:

| Spawn class | Relative Enemy Lv |
|---|---:|
| ordinary | 92–108% of stage recLevel |
| strong roll | 105–118% |
| Rare | 115–135% |
| Elite | 120–145% |
| authored Boss | normally 100–112%, or fixed by content |

All results clamp to Lv1–99,999.

These numbers are starting targets and must be simulation-tested before final tuning.

At Lv99,999 content, the cap naturally compresses the upper range instead of introducing a new prestige level.

---

## 5. Migration-safe stat scaling

Do **not** immediately replace the current Chapter scaling formula.

Current generated stats become the species/Chapter **anchor stats** at an **anchor level**.

Conceptually:

```text
current enemy stats at current stage level
        = anchor

runtime stat
        = anchor stat
        × levelCurve(runtimeLv) / levelCurve(anchorLv)
```

Therefore:

- an enemy rolled exactly at the current reference level is nearly unchanged,
- Lv +8% is somewhat stronger,
- Lv -8% is somewhat weaker,
- old balance does not collapse on migration day,
- the same species can later scale from early game to Lv99,999.

HP / ATK / DEF may use separate bounded level curves if necessary.

SPD should scale much more softly than HP/ATK/DEF so high-level enemies do not automatically invalidate initiative builds.

---

## 6. Enemy Level and rewards

Enemy Lv may influence **kill-level rewards**, but stage clear rewards remain authored.

Allowed level-linked effects:

- enemy EXP contribution,
- enemy Gold contribution,
- Item Power floor/context,
- quality context for normal equipment drops,
- Rare/Elite reward bonus.

Do not create an Enemy Lv currency or a second loot tier.

At the anchor level, rewards should remain close to current live values.

---

# PART B — Species model

## 7. Global enemies

Some enemies belong to the whole world rather than one Chapter.

They are called **Global Species**.

A Global Species can appear in many regions when its level and encounter rules permit it. `global` does not necessarily mean equal probability everywhere.

Initial target: **10–12 Global Species**.

Recommended first set:

| Species | Primary role | Identity |
|---|---|---|
| スライム | normal | universal baseline monster; can appear almost anywhere |
| コウモリ | fast | widespread fast nuisance |
| ゴブリン | attacker / trickster | opportunistic humanoid |
| ウルフ | attacker | direct burst pressure |
| スケルトン | normal | broad ruins/night compatibility |
| ゴーレム | tank | durable roaming construct |
| ウィスプ | caster | magical ranged pressure |
| 毒キノコ | trickster | poison/status identity |
| 小精霊 | support | buffs/healing/support identity |
| リザード | fast / attacker | adaptable predator |
| ミミック | Rare trickster | low-frequency treasure ambush |
| 彷徨う鎧 | Rare tank/attacker | dangerous roaming strong enemy |

`スライム` is the archetypal true-global enemy: it can remain relevant across the whole game because its runtime level, variant and rank determine its actual danger.

A Lv8 slime and a Lv8,000 slime are the same broad species but not the same fight.

---

## 8. Regional enemies

Regional enemies remain important.

Each Chapter/region should eventually support **7 ordinary combat roles**:

1. `normal` — balanced baseline
2. `fast` — initiative / low durability
3. `tank` — high durability / low tempo
4. `attacker` — high damage / lower defense
5. `caster` — magic / elemental pressure
6. `trickster` — poison, weaken, evade, disruption, unusual rules
7. `support` — heal, buff, protect, accelerate allies

The existing `normal / fast / tank` become the first three roles rather than being deleted.

### Content target

Across 30 story Chapters:

- existing 3 ordinary identities per Chapter ≈ 90
- add 4 new regional role identities per Chapter = **+120**
- add 1 Rare identity per Chapter = **+30**
- Global Species = **+10–12**

Target catalog size after Enemy Content Pack I: roughly **240+ ordinary/Rare enemy identities**, excluding Bosses and special endgame enemies.

This is intentionally a content expansion, not 240 bespoke combat engines.

---

# PART C — Variants

## 9. Species and variant are separate

A species can have regional/environmental variants.

Example:

```text
スライム
├─ スライム
├─ 毒沼スライム
├─ 灰熱スライム
├─ 雷光スライム
├─ 深淵スライム
└─ 観測異常スライム
```

A variant may change:

- name,
- element,
- one or two stat tendencies,
- role tag,
- one existing combat behavior/effect,
- spawn tags,
- drop flavor.

A variant does **not** automatically require a new progression system.

---

## 10. Variant selection rules

Variants come from context tags such as:

```js
regionTags: ['forest', 'poison']
activityTags: ['abyss']
worldTier: 3
```

Priority:

```text
regional authored variant
  > activity variant
  > ordinary global species
```

Do not force a variant every time. Seeing the plain `スライム` deep into the game is allowed and desirable when its Enemy Lv makes it relevant.

---

# PART D — Rank

## 11. Common / Rare / Elite are orthogonal to species

Enemy rank is separate from species and level.

```text
Species: スライム
Lv: 2,840
Rank: Elite
Variant: 雷光
```

This could display as:

```text
⚡ 雷光スライム　Lv.2840　[ELITE]
```

### Common
Normal pool spawn.

### Rare
Low-frequency authored species/variant.

Initial ordinary-stage target: around **3–6% encounter presence**, tuned by activity.

Rare enemies should feel exciting but must not become mandatory daily chores.

### Elite
A stronger runtime rank applied to eligible ordinary enemies.

Elite may increase:

- level roll,
- HP/ATK/DEF,
- behavior pressure,
- drop quality context.

Important: existing Abyss-specific `enemy.elite` reward behavior must not accidentally award Abyss currencies in ordinary content. Rank metadata must distinguish generic Elite from Abyss reward-eligible Elite.

### Boss
Usually authored and fixed.

---

# PART E — Encounter Pools

## 12. Fixed waves become fallback, not the primary future model

Current stages define exact waves such as:

```js
waves: [
  { type: normal, count: 4 },
  { type: fast, count: 3 }
]
```

Encounter 2.0 adds an optional contract:

```js
encounterProfile: {
  levelRange: [0.92, 1.08],
  regionTags: ['forest'],
  globalWeight: 0.25,
  rareChance: 0.05,
  eliteChance: 0.04,
  templates: ['mixed', 'ambush', 'escort']
}
```

If `encounterProfile` is absent, the old `waves` behavior remains unchanged.

This enables chapter-by-chapter migration.

---

## 13. Pool composition

Each ordinary stage pool may contain:

### Regional core — ~60–75%
Enemies matching the Chapter/region.

### Global species — ~20–30%
World-spanning enemies such as slime, bat or goblin.

### Rare / roaming slot — ~3–8%
Rare species, unusual variants, or roaming strong enemies.

Exact percentages are authored per region/activity.

A volcanic region can still contain a normal slime, but a volcanic slime variant should be weighted more heavily there.

---

# PART F — Encounter Templates

## 14. Random does not mean meaningless

Do not independently roll every enemy slot with no composition rules.

Encounter 2.0 uses weighted templates.

Initial templates:

### `mixed`
Balanced mixture of 2–4 roles.

### `pack`
Several fast/normal/attacker enemies. Allows repeated species.

### `frontline`
Tank/normal front with attacker/caster pressure.

### `escort`
Support or caster protected by tank/normal enemies.

### `ambush`
Fast/trickster-heavy encounter.

### `bulwark`
Tank-heavy attrition encounter.

### `rare_invasion`
One Rare or roaming strong enemy plus a small normal group.

### `solo_threat`
One unusually high-level non-Boss enemy.

The template chooses roles first; the pool resolves actual species second.

This keeps random groups readable and tactically coherent.

---

## 15. Anti-frustration rules

Encounter generation must obey:

- no impossible story-gating combination,
- avoid 3+ Support loops unless explicitly authored,
- avoid excessive Tank-only encounters,
- avoid stacking too many hard-control/status enemies,
- Boss remains predictable enough to build around,
- a Stage should not roll wildly outside its intended difficulty band,
- repeated runs should vary without becoming roulette.

Randomness is variety, not punishment.

---

# PART G — World Tier and endgame

## 16. World Tier interaction

World Tier can influence:

- Enemy Lv band,
- Elite chance,
- Rare weighting,
- variant availability.

Prefer adjusting level/rank/context rather than multiplying every stat again through another independent formula.

Avoid double-scaling Chapter × Enemy Lv × World Tier into uncontrolled exponential growth.

---

## 17. Abyss

Abyss keeps its depth identity.

Enemy 2.0 may supply species variety while Abyss depth remains the primary vertical scaler.

Abyss can draw from:

- Global Species,
- region-agnostic Abyss variants,
- route-specific species,
- authored Abyss Bosses.

Do not replace Abyss route/challenge logic with Encounter 2.0.

---

## 18. Rift

Rift pools strongly weight enemies/variants matching the Rift element.

Example:

```text
Lightning Rift
→ 雷光スライム
→ 雷霊
→ 雷装ゴーレム
→ regional lightning enemies
```

Existing Rift loot identity remains unchanged.

---

## 19. Secret Realm / Deep Survey

These should use curated pools, not the broad ordinary-world pool.

Deep Survey may mix high-level Global Species with its authored regional threats, but Survey Conditions and Convergence Apex remain authoritative.

Apex Boss phases stay fixed.

---

# PART H — UI / readability

## 20. Enemy card

Text Battle enemy cards should eventually show compactly:

```text
雷光スライム　Lv.2840
ELITE · 雷
```

Priority order:

1. name,
2. level,
3. important rank/status,
4. HP bar.

Do not dump internal tags into the battle UI.

---

## 21. Stage preview

Ordinary stage confirm may show one compact line:

```text
敵Lv 920–1080 / 地域種＋広域種 / Rareあり
```

Do not list every possible enemy by default.

Codex can later become the detailed discovery surface.

---

# PART I — Data contracts

## 22. Species definition target

Illustrative shape:

```js
{
  id: 'slime',
  name: 'スライム',
  role: 'normal',
  global: true,
  spawnWeight: 1.0,
  tags: ['slime', 'organic', 'global'],
  anchorLevel: 1,
  anchorStats: { hp: 24, atk: 5, def: 1, spd: 80 },
  variants: ['poison_slime', 'ash_slime']
}
```

Do not require every old `ENEMY_TYPES` caller to understand this immediately. A compatibility resolver should continue producing the current runtime enemy shape.

---

## 23. Runtime enemy target

```js
{
  id: 'enemy-42',
  speciesId: 'slime',
  variantId: null,
  name: 'スライム',
  role: 'normal',
  rank: 'common',
  level: 1047,
  hp: 1234,
  maxHp: 1234,
  atk: 231,
  def: 82,
  spd: 91,
  ...existingRuntimeFields
}
```

All existing combat patches should continue consuming the resolved numeric fields.

---

# PART J — Implementation roadmap

## E0 — Inventory / calibration audit

- inventory all current enemy sources,
- map current Chapter enemy stats to stage `recLevel`,
- identify every direct `ENEMY_TYPES[...]` consumer,
- identify Boss/Elite/Abyss assumptions,
- establish regression snapshots for current difficulty.

**No gameplay change.**

---

## E1 — Enemy Level foundation

- add runtime `level`,
- derive ordinary level from stage `recLevel`,
- display Enemy Lv in Text Battle,
- initially preserve anchor stats closely,
- Bosses receive explicit/fallback level.

No random encounter conversion yet.

---

## E2 — Level-relative stat bridge

- add anchor-level relative scaling,
- calibrate HP / ATK / DEF / SPD separately,
- preserve current difficulty at anchor levels,
- clamp Lv1–99,999,
- add simulations for ±level bands.

---

## E3 — Global Species Pack

Add initial 10–12 reusable world species.

First priority is the true-global slime family.

No Chapter enemy replacement required yet; global species can exist in data before pools are activated.

---

## E4 — Regional Enemy Content Pack I

Expand each story Chapter toward:

```text
normal
fast
tank
attacker
caster
trickster
support
+ Rare
```

Target: roughly 240+ ordinary/Rare identities across Ch1–30 plus Global Species.

This is the major content-volume phase.

---

## E5 — Encounter Pool foundation

- add optional `encounterProfile`,
- retain fixed `waves` fallback,
- weighted Regional / Global / Rare selection,
- deterministic test seed support for simulations/debugging,
- convert only a small pilot Chapter first.

---

## E6 — Encounter Templates

Implement role-first templates:

`mixed / pack / frontline / escort / ambush / bulwark / rare_invasion / solo_threat`.

Add anti-frustration composition guards.

---

## E7 — Rare / Elite / Variant integration

- generic Elite rank separate from Abyss reward-eligible Elite,
- Rare spawn rules,
- environmental variants,
- World Tier influence,
- bounded reward quality interaction.

---

## E8 — Story migration

Convert Ch1–30 ordinary encounters progressively.

Recommended batches:

1. Ch1–5
2. Ch6–10
3. Ch11–15
4. Ch16–20
5. Ch21–25
6. Ch26–30

Boss waves stay authored.

---

## E9 — Endgame integration

Apply curated versions to:

- Abyss,
- Rift,
- Secret Realm,
- selected post-game content,
- Deep Survey where appropriate.

Do not randomize Convergence Apex Boss phases.

---

## E10 — Codex / discovery polish

Only after encounter variety is proven fun:

- species discovery,
- variant discovery,
- region hints,
- Rare sightings.

Reuse the existing Codex. No new bestiary Home button.

---

# PART K — Acceptance gates

Enemy/Encounter 2.0 is successful when:

1. the same ordinary stage can produce visibly different but coherent encounters,
2. Global Species make the world feel connected,
3. regional enemies still make locations distinctive,
4. Enemy Lv explains individual danger at a glance,
5. a familiar enemy can remain relevant far later in progression,
6. Rare/Elite appearances feel exciting rather than mandatory,
7. Boss identity remains authored,
8. current saves and stage clears remain valid,
9. no current activity loses its loot/progression identity,
10. mobile Text Battle remains readable,
11. deterministic simulations can reproduce encounter distributions,
12. current story difficulty at reference levels does not materially drift during migration.

---

# Final design principle

The world should feel like it contains **species**, not stage props.

A slime is not "the enemy from Stage 1-1."

It is a creature that exists in Blade Vale.

Sometimes it is Lv3.
Sometimes it is Lv3,000.
Sometimes it has adapted to poison, ash, lightning or the Abyss.
Sometimes a far stronger individual appears where the player did not expect it.

The stage decides **what kinds of things may live here and roughly how dangerous they are**.
The encounter system decides **who actually appears this time**.
Enemy Lv decides **how strong that individual is**.

That is the foundation for all future monster, Boss and world-content expansion.
