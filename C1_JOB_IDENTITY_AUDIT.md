# C1 — Job Identity Audit and Migration Contract

## Audited runtime facts

- `js/data/jobsPhase8.js` currently exposes 15 basic jobs, 105 pair fusions, 10 special jobs and the hero: **131 selectable records**.
- `js/data/fusionRuntime.js` generates 75 of the 105 fusion records with empty `skills` and `spells`; all fusion records share a generic cooldown MASTER effect. They are catalogue identities, not 105 distinct playable kits.
- Phase 8 locks every fusion behind the two parent basic-job MASTER records. Removing a parent without a translation would make old `currentJobId`, `jobs`, `mastered`, Job 3 routes and inherited MASTER slots unsafe.
- C0 retired ANALYSIS as a universal combat taxonomy. The former Scholar loop therefore cannot remain “analysis build”; its elemental kit migrates to Elementalist.

## Curated C1 roster

| C1 ID | Tactical identity | Primary legacy sources |
| --- | --- | --- |
| `c1_vanguard` | Build Pressure with consecutive attacks, then spend it on a heavy strike. | fighter |
| `c1_bastion` | Turn guarding and taking hits into counterattack windows. | warrior, craftsman, farmer |
| `c1_elementalist` | Rotate elements while managing an MP cycle. | mage, scholar |
| `c1_chaplain` | Choose recovery or protection to rescue dangerous turns. | priest |
| `c1_shadow` | Apply afflictions, then execute once their condition is met. | thief, ninja |
| `c1_ranger` | Mark a target and collect follow-up attacks. | hunter |
| `c1_maestro` | Build Tempo through song and dance to manipulate initiative and support. | bard, dancer |
| `c1_alchemist` | Apply reagents, trigger reactions, then detonate. | alchemist |
| `c1_quartermaster` | Convert money and supplies into an in-combat resource decision. | merchant |
| `c1_oracle` | Read omens, accept risk and reverse an outcome at the right moment. | fortune |

No roster entry is retained for a stat profile or an EXP/drop/gold multiplier alone. Those values move to mastery credit, gear, runes or ordinary skill rewards during the runtime migration.

## Explicit legacy mapping

`js/data/jobIdentityMigration.js` is the authoritative pre-runtime mapping. It contains all current persisted job IDs: 15 basic, every 105 fusion ID (including the old named 30), 10 special IDs and `hero`.

For a fusion, the mapping is deterministic from its recorded parents and documented priority: reaction, hunt, affliction, tempo, recovery, element, counter, pressure, supply, omen. This is deliberate transitional routing, not a claim that two old kits are mechanically identical.

## Save migration requirements for the next C1 runtime slice

1. Read every old root unchanged; do not add a competing save root.
2. Translate `currentJobId` to the mapped C1 ID before resolving stats or routes.
3. Merge several old `jobs` records into one C1 record without discarding progress: retain the highest level, use EXP from that winning record, and retain all old source IDs in migration credit.
4. If any mapped source is MASTERed, award the target's one-time mastery credit once; do not multiply permanent bonuses by the number of collapsed source records.
5. Preserve unknown IDs and old `job3Specializations` / `job3LegacySlots` on load until their C1 equivalents are installed; then translate only recognized records and leave unknown data untouched.
6. Remove the 105-fusion UI and parent-MASTER unlock rule only after the above migration runs before the first state-dependent calculation.

The accompanying test (`tests/c1-job-identity-migration.test.js`) proves coverage for all current job IDs. The next implementation slice wires this registry into loading and the Jobs screen, then adds save-fixture tests for active, levelled, MASTERed and Job 3-configured legacy saves.
