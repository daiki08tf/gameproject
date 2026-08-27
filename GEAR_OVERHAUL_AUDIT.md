# Blade Vale — Gear Overhaul Audit

> Phase 0 audit document. Keep this file human-readable and update decisions here before implementing them in code.

## 1. Live system inventory

### Equipment slots

Live equipment slots:
- weapon
- shield
- head
- body
- accessory1
- accessory2

Armor/accessory random Affix generation already exists through Equipment 3.0 for shield/head/body/accessory. Gear Overhaul must migrate it, not recreate it.

### Mastery weapon families

Current mastery families: **8**

| Family | Current identity | Basic-job support |
|---|---|---|
| sword | balanced physical / guard / crit | warrior, merchant |
| axe | heavy offense / defense / boss | farmer, craftsman |
| staff | magic / resource / build | mage, alchemist, scholar |
| bow | offense / crit / boss | hunter |
| dagger | speed / crit / trigger | thief, ninja |
| knuckle | offense / crit / trigger | fighter |
| instrument | build / resource / speed | bard, dancer |
| rod | sustain / resource / magic | priest, fortune |

Immediate finding: bow and knuckle have only one basic-job owner each, while staff has three. New mastery families must not be added until this imbalance and Fusion behavior are audited.

### Existing weapon archetypes

Equipment 3.0 already has **24 sub-archetypes (3 per mastery family)**:

- sword: 片手剣 / 大剣 / 刀
- axe: 戦斧 / 大斧 / 軽斧
- staff: 魔杖 / 戦杖 / 魔導書
- bow: 長弓 / 短弓 / 弩
- dagger: 短刀 / 双短剣 / 暗殺刃
- knuckle: 拳甲 / 爪 / セスタス
- instrument: 竪琴 / 笛 / 戦鼓
- rod: 聖杖 / 祭杖 / 宝珠杖

Therefore 大剣 / 魔導書 / 双剣系 / 弩 etc are **not automatically new mastery-family candidates**; they already exist as archetypes.

### Jobs

- Basic Jobs: 15
- Fusion Jobs: 105 (= 15C2)
- Advanced/Special jobs inherit weapon identity from prerequisite jobs in the legacy job registry.

Weapon expansion must audit how that inheritance and Fusion presentation work before changing the family registry.

## 2. Live option architecture

Current `js/data/affixes.js` defines **77 Affixes** across:

- OFFENSE
- MAGIC
- CRIT
- SPEED
- DEFENSE
- SUSTAIN
- RESOURCE
- STATUS
- BOSS
- UTILITY
- TRIGGER
- BUILD

Current Affix rarity is already seven tiers:

`common -> uncommon -> rare -> epic -> legendary -> mythic -> ancient`

Current endgame Item Power already biases drops toward higher Affix rarity.

### Current Affix-count problem

Current endgame item Affix counts can reach 4–5. Gear Overhaul changes the canonical random Option count to **max 3**.

Target counts:

| Equipment rarity | Random Options |
|---|---:|
| normal | 0–1 |
| rare | 1 |
| epic | 1–2 |
| legendary | 2–3 |
| mythic | 3 |

Named/Unique fixed effects do not consume these three slots.

## 3. Affix audit principles

Because only three Options remain visible on an item, each Option must have a clear identity. The audit therefore favors fewer, stronger families over many tiny near-duplicates.

Classification meanings:

- **KEEP** — mechanic deserves a canonical Option family.
- **RENAME** — keep mechanic, improve name/rarity ladder.
- **MERGE** — mechanically too close to another family for a max-3 system.
- **RARE-LOCK** — useful mechanic but should not exist at Common.
- **BUILD** — build-changing family, intentionally scarce.
- **REVIEW** — keep no implementation commitment until interaction is verified.

## 4. First-pass family audit

### A. Core raw-stat families — KEEP + RENAME

These are essential to both normal builds and the brute-force route.

| Current ID | Current name | Decision | New direction |
|---|---|---|---|
| `atk_pct` | 剛力 | KEEP/RENAME | ATK family; rarity ladder e.g. 怪力→剛力→豪腕→鬼力→覇力→神力→天威 |
| `mag_pct` | 魔力増幅 | KEEP/RENAME | MAG family with authored rarity names |
| `def_pct` | 鉄壁 | KEEP/RENAME | DEF family; important brute-force axis |
| `hp_pct` | 不屈 | KEEP/RENAME | HP family; important brute-force axis |
| `mp_pct` | 深遠なる魔力 | KEEP/RENAME | MP family |
| `spd_pct` | 疾風 | KEEP/RENAME | SPD family |
| `crit_pct` | 鷹の目 | KEEP/RENAME | Crit chance family |
| `evasion_pct` | 風のような身のこなし | KEEP/RENAME | Evasion family; shorten presentation |
| `armorpen_pct` | 甲殺し | KEEP | penetration family |

Rule: these can begin at low rarity. Their rarity changes the display name and the per-level growth coefficient.

### B. Direct damage specialization — KEEP, reduce overlap by weighting

| Current ID | Decision | Notes |
|---|---|---|
| `dmg_all` | KEEP / RARE-LOCK | universal damage is too generically desirable to be Common |
| `dmg_normal` | KEEP | basic-attack identity |
| `dmg_skill` | KEEP | skill identity |
| `dmg_spell` | KEEP | spell identity |
| `dmg_boss` | KEEP / RARE-LOCK | target-farm / boss build |
| `dmg_elite` | KEEP / RARE-LOCK | elite/endgame specialization |
| `dmg_execution` | MERGE/UPGRADE PATH | shares execution identity with `build_executioner`; one family should own this concept |
| `crit_damage_pct` | KEEP | crit build cornerstone |
| `weaken_power_pct` | KEEP | status/debuff build cornerstone |
| `boss_special_mitigation` | KEEP / RARE-LOCK | defensive boss specialization |

Important future decision: `dmg_execution` and `build_executioner` should become **one option family with rarity evolution**, not two competing slots.

### C. Sustain — KEEP

| Current ID | Decision | Notes |
|---|---|---|
| `lifesteal` | KEEP | core brute-force sustain route |
| `regen` | KEEP | passive sustain route |
| `heal_on_kill` | KEEP | farming/wave identity |
| `heal_on_crit` | KEEP | crit sustain |
| `heal_on_guard` | KEEP | guard sustain |

These should be strongly slot-biased rather than removed. Shield/body should naturally surface defensive sustain more often; weapons/accessories can surface offensive sustain.

### D. Resource / tempo — KEEP

| Current ID | Decision | Notes |
|---|---|---|
| `mp_cost_reduce` | KEEP | spell/skill economy |
| `mp_on_kill` | KEEP | farming resource loop |
| `mp_on_crit` | KEEP | crit-resource loop |
| `mp_on_guard` | KEEP | guard-resource loop |
| `cdr_pct` | KEEP / RARE-LOCK | potentially universal; rarity floor likely needed |
| `atk_speed_pct` | KEEP | attack-tempo identity |
| `guard_mitigation_pct` | KEEP | guard identity |

### E. Utility farming — KEEP but high-rarity / low-weight

| Current ID | Current name | Decision | Reason |
|---|---|---|---|
| `gold_pct` | 商才 | KEEP / RARE-LOCK | farming identity, not combat default |
| `exp_pct` | 習熟の心得 | KEEP / RARE-LOCK | should feel rarer than raw ATK/DEF |
| `drop_pct` | 幸運 | KEEP / RARE-LOCK | chase utility; must not become mandatory BiS |

This directly matches the intended rarity philosophy: simple raw-stat Options may exist from Common, while unusual economy Options can begin at Rare/Epic/Legendary depending on balance.

### F. DoT/status — KEEP, with one review

| Current ID | Decision | Notes |
|---|---|---|
| `dot_dmg` | KEEP | DoT core |
| `dot_duration` | KEEP | duration route |
| `dot_stack` | REVIEW | current `% max-stack` expression is awkward; likely convert to discrete milestone behavior |
| `dot_target_dmg` | KEEP | payoff on afflicted targets |
| `dot_mp_on_apply` | KEEP | DoT-resource loop |

`dot_stack` should not literally become “+37% of a stack” after Option Lv scaling; its level formula needs authored breakpoints.

### G. Trigger options — KEEP, mostly higher rarity

Known trigger identities:

- `crit_extra_hit` — extra attack on crit
- `crit_atk_buff` — ATK buff on crit
- `crit_spd_buff` — SPD buff on crit
- `every_n_hits` — periodic extra hit
- `hit_low_dot` — proc DoT on hit
- `hit_low_defdown` — proc DEF down on hit
- `guard_next_atk` — guard into empowered next hit
- `evade_crit_buff` — evade into Crit buff
- `kill_atk_buff` — kill into ATK buff
- `spell_mag_buff` — spell into MAG buff
- `spell_mp_refund` — spell resource refund proc

Decision: **KEEP / RARE-LOCK** as a class. These mechanics change action patterns more than raw stats and should not flood early/Common loot.

Review point: Option Lv must scale a readable property (chance, magnitude, cooldown, threshold) without making proc chance trivially reach 100% unless explicitly intended.

### H. Build options — KEEP as chase families

Current build Affixes are already Legendary-minimum and should remain scarce:

- `build_bloodedge` — low-HP lifesteal
- `build_manaecho` — spell echo
- `build_executioner` — enhanced execution
- `build_thousandblades` — combo finisher
- `build_venomheart` — DoT-stack payoff
- `build_ironvengeance` — guard counter
- `build_manacycle` — enhanced crit MP loop
- `build_predator` — Boss/Elite specialization
- `build_laststand` — low-HP damage
- `build_deathline` — low-HP crit/speed
- `build_arcanebarrier` — high-MP boss mitigation
- `build_quickdraw` — first-strike offense

Decision: **BUILD / KEEP**, with selective merging where they are clearly the high-rarity evolution of an existing ordinary family.

Strong merge candidates:
- `dmg_execution` -> `build_executioner` as one execution family across rarities
- `mp_on_crit` -> `build_manacycle` as one crit-resource family across rarities

Possible but not yet approved:
- ordinary lifesteal -> `build_bloodedge` as a conditional high-rarity branch rather than direct ladder
- boss/elite damage -> `build_predator` as a high-rarity combined form

Do not merge these until value/application behavior is tested; conditional effects can remain distinct if they create genuinely different builds.

## 5. Rarity-name model

Option rarity is both visual and mechanical.

For each canonical Option family, author a seven-name ladder when it improves readability.

Example only:

`ATK%`: 怪力 → 剛力 → 豪腕 → 鬼力 → 覇力 → 神力 → 天威

Rules:
- do not mechanically generate awkward names by prefixing rarity words
- high-rarity name must sound like the same concept becoming stronger
- UI still keeps rarity color/metadata for filtering
- save identity uses stable family ID, **not the display name**

This allows future renaming without save breakage.

## 6. Option-level model

Canonical target: **Lv1–100**.

Each family needs a level curve function. Not all options should use the same formula.

Recommended curve classes:

1. `raw_pct` — ATK/MAG/DEF/HP etc; steady growth
2. `small_pct` — CDR, mitigation, lifesteal; stricter caps
3. `proc_chance` — chance growth with hard safety ceiling
4. `trigger_power` — fixed trigger + growing magnitude
5. `discrete` — DoT stack, hit-count breakpoints etc
6. `utility` — EXP/Gold/Drop; intentionally conservative

This replaces the current idea that every family can simply reuse one generic `[min,max]` roll table forever.

## 7. Existing-axis collision audit

### Greater Affix

Current Greater increases ordinary Affix power and can be crafted upward. With rarity + Option Lv this is likely a redundant fourth strength axis.

Status: **REVIEW / CONSOLIDATE**.

Preferred direction: preserve old-save meaning through migration, but do not keep Greater as an opaque permanent 1.5x layer on top of Lv100 unless playtesting proves a need.

### Temper

Current Temper rerolls numerical value around a baseline. Option Lv makes repeated numerical tempering less important.

Status: **REVIEW / likely redefine or retire**.

### Legendary Effect / Curse

These are separate special-identity packages.

Status: **KEEP separate from random Option count**.

### Unique fixed effects

Current Unique philosophy already focuses on changing play style.

Status: **KEEP**, later standardized as fixed effect(s) + up to 3 random Options.

## 8. Brute-force route requirements

The new Option system must deliberately support raw investment.

Must remain viable:
- ATK/MAG scaling
- HP/DEF scaling
- sustain scaling
- reasonable penetration/crit scaling
- deterministic progress through duplicate fusion

High-difficulty design rule:
- preferred mechanics give a large efficiency advantage
- they generally must not make the enemy literally invulnerable without one exact build
- an extremely developed character should be able to overpower most checks

Test case for future Deep Survey tuning:

```text
Intended route: guard-counter + sustain at moderate Option Lv
Alternative route: very high ATK + HP/DEF + sustain at Option Lv80–100
Both can clear; the second simply costs much more farming time.
```

## 9. Next implementation sequence

1. Finish exact 77-ID classification and encode migration table.
2. Complete Weapon × Job/Fusion audit.
3. Introduce canonical `Option` schema without changing combat behavior.
4. Cap generated options at 3 everywhere.
5. Add rarity-name metadata and Lv1–100 value curves.
6. Add old-Affix -> Option migration tests.
7. Only after stable drops/application: implement Option Fusion.

Do not implement new mastery weapon families before step 2 is complete.
