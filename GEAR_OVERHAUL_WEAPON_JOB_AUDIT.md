# Blade Vale — Gear Overhaul Weapon × Job Audit

> Phase 0C audit. This file exists so weapon-family decisions are based on live job coverage rather than fantasy-weapon wishlists.

## 1. Current mastery weapon families

Current mastery families: **8**

| Family | Basic jobs using it | Basic count |
|---|---|---:|
| sword | warrior / merchant | 2 |
| axe | farmer / craftsman | 2 |
| staff | mage / alchemist / scholar | 3 |
| bow | hunter | 1 |
| dagger | thief / ninja | 2 |
| knuckle | fighter | 1 |
| instrument | bard / dancer | 2 |
| rod | priest / fortune | 2 |

Immediate conclusion: there is already uneven basic-job support. `bow` and `knuckle` each have only one basic owner, while `staff` has three.

## 2. Existing archetype coverage

Equipment 3.0 already turns the 8 mastery families into **24 distinct loot archetypes**:

| Family | Archetypes |
|---|---|
| sword | 片手剣 / 大剣 / 刀 |
| axe | 戦斧 / 大斧 / 軽斧 |
| staff | 魔杖 / 戦杖 / 魔導書 |
| bow | 長弓 / 短弓 / 弩 |
| dagger | 短刀 / 双短剣 / 暗殺刃 |
| knuckle | 拳甲 / 爪 / セスタス |
| instrument | 竪琴 / 笛 / 戦鼓 |
| rod | 聖杖 / 祭杖 / 宝珠杖 |

Therefore the following are **already represented** and should not be promoted to new mastery families without a strong mechanical reason:

- 大剣
- 刀
- 大斧
- 魔導書
- 弩
- 双短剣 / dual-blade identity
- 爪
- 戦鼓

## 3. Fusion Job weapon problem

There are 105 Fusion Jobs from all 15C2 basic-job pairs.

Current generated Fusion runtime behavior chooses:

```js
weapon: parents[0]?.weapon || 'sword'
```

The parent order is canonical and follows the fixed `BASIC_JOB_ORDER`. That means a Fusion Job does **not** truly inherit both parent weapon identities; it takes whichever parent appears first in the global ordering.

This is mechanically arbitrary.

### Resulting weapon distribution across 105 Fusion pairs

Using the current canonical basic-job order and `parents[0].weapon` rule:

| Fusion primary weapon | Fusion jobs |
|---|---:|
| sword | 23 |
| staff | 19 |
| dagger | 17 |
| knuckle | 13 |
| rod | 11 |
| instrument | 11 |
| bow | 8 |
| axe | **3** |

This is not an authored balance decision. It is a side effect of ordering.

Example consequence: farmer/craftsman are late in `BASIC_JOB_ORDER`, so axe almost disappears from generated Fusion Jobs even though axe has two valid basic-job identities.

## 4. Recommended Fusion affinity model

### Decision: preserve `weapon` for compatibility, add multi-affinity

Do not immediately delete the legacy single `job.weapon` field because many systems may assume a string.

Preferred migration:

```js
job.weapon      // legacy primary, preserved for old callers/save/UI compatibility
job.weapons     // canonical array of all valid weapon affinities
```

For a Fusion Job:

```text
warrior(sword) + hunter(bow)
=> weapons: ['sword', 'bow']
```

For parents sharing the same family:

```text
thief(dagger) + ninja(dagger)
=> weapons: ['dagger']
```

This makes Fusion identity actually reflect both parents without breaking the old primary field immediately.

### Gameplay rule

Weapon affinity/mastery bonus should trigger if the equipped weapon family is present in `job.weapons`, falling back to `[job.weapon]` for old jobs.

This immediately improves support for underrepresented existing weapons without adding a ninth family.

## 5. Why this comes before new weapon families

If new weapon families are added while Fusion still uses the first-parent rule, their job support will depend heavily on where the new basic job is inserted into `BASIC_JOB_ORDER`.

That would create another accidental bias.

Therefore:

> **New mastery weapon families are blocked until multi-affinity is stable or an explicit alternative design is chosen.**

## 6. New-family candidate test

After Fusion affinity is fixed, any proposed ninth+ mastery family must pass:

1. Does an existing archetype already cover the fantasy/mechanic?
2. Are there at least two credible job identities for it, or a deliberate plan to create them?
3. Does it have a distinct combat identity?
4. Can its Option bias differ meaningfully from existing families?
5. Can it support multiple Named/Unique items?
6. Does adding it improve the game more than deepening one of the existing 24 archetypes?

If not, keep it as an archetype.

## 7. Current likely decisions

### Do not add as new family yet

- 大剣 — already sword archetype
- 双剣 — existing dual-blade identity under dagger (`双短剣`)
- 魔導書 — already staff archetype
- 大斧 — already axe archetype
- 弩 — already bow archetype

### Worth future investigation after affinity fix

- 槍 / polearm — currently lacks a direct mastery/archetype home and could support reach/first-strike/armor-penetration identity
- ハンマー — could potentially be axe/knuckle-adjacent; needs stronger reason than “heavy weapon”
- 銃 — mechanically distinct but world/job integration cost is high
- 大鎌 — fantasy already partially appears through farmer/axe skill language, so may be an axe archetype rather than a new family

These are **candidates, not roadmap commitments**.

## 8. Phase 0C conclusion

Phase 0C audit result:

- no new weapon family is currently justified by the audit
- existing 24 archetypes should be strengthened first
- Fusion weapon assignment contains an accidental first-parent bias
- multi-affinity is the highest-value weapon/job structural fix
- only after that fix should a spear/polearm or other genuinely missing family be reconsidered

## 9. Implementation handoff

Before changing Fusion affinity, inspect every caller of:

- `job.weapon`
- weapon affinity calculation
- weapon mastery/technique unlocks
- equipment UI job-match tags
- Fusion Job presentation
- Smart Loot weapon filters

Compatibility rule:

```js
const affinities = job.weapons?.length ? job.weapons : [job.weapon].filter(Boolean);
```

Do not change save IDs or the 105 Fusion pair registry while implementing this migration.
