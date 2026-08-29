# Phase 8 — Legacy Job Compatibility Audit

Status: SUPERSEDED — see `PHASE8_JOB_COMPATIBILITY_AUDIT.md`

This document is kept for history only. Several of the display-name proposals
below (e.g. `傭兵` for `swordsaint2`, `城塞騎士` for `armsknight`) were later
reverted — the shipped `js/data/jobFusion.js` `LEGACY` table keeps every
existing advanced job's original display name unchanged. The later
`PHASE8_JOB_COMPATIBILITY_AUDIT.md` documents that correction explicitly and
matches what actually shipped; read that one instead.

Status (original): IMPLEMENTATION CONTRACT

This document bridges the current 30 advanced jobs into the Phase 8 `15C2 = 105` Fusion Job system. The primary rule is **save compatibility first**: an existing advanced-job ID is never casually deleted or repurposed.

## Migration rules

1. Existing IDs remain canonical wherever the same parent pair survives in the 105 matrix.
2. A display-name change does **not** require an ID change. Existing Job Lv / EXP / MASTER / specialization data remains attached to the old ID.
3. Existing manually-authored skills/spells remain attached to that ID unless a later combat-design PR explicitly replaces them.
4. When the Phase 8 matrix uses a different fantasy for an existing pair, prefer a **rename + identity evolution** rather than introducing a second job for the same pair.
5. Special jobs that currently require old advanced IDs must continue to resolve. If a future ID migration is unavoidable, add an alias/migration table before changing the requirement.
6. Existing specialization selections and inherited MASTER specialization slots must survive the transition into Skill Constellation. Constellation is an evolution of this data, not a reset.
7. New Fusion Jobs fill the currently missing 75 pairs. They must use new IDs and must not collide with any legacy, secret, special, or hero ID.

## Existing 30 advanced jobs → Phase 8 pair mapping

| Legacy ID | Current name | Parent pair | Phase 8 target | Migration decision |
|---|---|---|---|---|
| `battlemaster` | バトルマスター | 戦士×武闘家 | 羅刹 | **KEEP ID**, rename display name to 羅刹; preserve skills initially |
| `spellblade` | 魔法剣士 | 戦士×魔法使い | 魔法剣士 | Exact match; keep everything |
| `paladin` | パラディン | 戦士×僧侶 | パラディン | Exact match; keep everything |
| `swordsaint2` | 剣豪 | 戦士×盗賊 | 傭兵 | **KEEP ID**, evolve identity/name; retain old techniques until replacement is ready |
| `armsknight` | アームズナイト | 戦士×大工 | 城塞騎士 | **KEEP ID**, rename/evolve toward fortress defense |
| `sage` | 賢者 | 魔法使い×僧侶 | 賢者 | Exact match |
| `archmage` | 大魔導士 | 魔法使い×学者 | 大魔導研究家（要Naming Audit） | **KEEP ID**; current name may actually be stronger than draft target |
| `astromancer` | 星詠みの魔女 | 魔法使い×占い師 | 星術師 | **KEEP ID**; Naming Audit before display rename |
| `miko` | 巫女 | 僧侶×占い師 | 神託師 | **KEEP ID**; identity collision: Phase 8 also drafts 巫女 for 僧侶×踊り子, so current `miko` cannot be reused there |
| `choirmaster` | 聖歌隊長 | 僧侶×吟遊詩人 | 聖歌師 | **KEEP ID**, rename/evolve |
| `phantomthief` | 怪盗 | 盗賊×忍者 | 暗殺者 | **KEEP ID**; preserve current stealth/theft techniques initially; identity requires combat audit |
| `treasurehunter` | トレジャーハンター | 盗賊×商人 | 闇商人 | **KEEP ID**; IMPORTANT: draft matrix currently assigns トレジャーハンター to 盗賊×学者, creating a name collision. New 盗賊×学者 must use a different ID and the display-name decision must be finalized before runtime work |
| `scoutmaster` | 密偵 | 盗賊×狩人 | 追跡者 | **KEEP ID**, rename/evolve |
| `enchantdancer` | 幻惑の舞姫 | 盗賊×踊り子 | 幻影盗賊 | **KEEP ID**, rename/evolve |
| `fistsaint` | 拳聖 | 武闘家×忍者 | 修羅 | **KEEP ID**, rename/evolve |
| `assassinfist` | 暗殺拳 | 武闘家×盗賊 | 拳盗士（要Naming Audit） | **KEEP ID**; current name is likely stronger than draft target |
| `beasttamer` | 猛獣使い | 武闘家×狩人 | 獣闘士 | **KEEP ID**, rename/evolve |
| `sumo` | 剛力士 | 武闘家×農民 | 豪傑 | **KEEP ID**, rename/evolve |
| `huntking` | 狩猟王 | 狩人×忍者 | 影狩人 | **KEEP ID**, rename/evolve |
| `forestbard` | 森の吟遊詩人 | 狩人×吟遊詩人 | 狩猟楽師（要Naming Audit） | **KEEP ID**; current name may be preferable |
| `primadiva` | プリマ・ディーヴァ | 吟遊詩人×踊り子 | 芸聖 | **KEEP ID**; retain performance identity |
| `loremaster` | 語り部 | 吟遊詩人×学者 | 伝承学者 | **KEEP ID**, rename/evolve |
| `fatedancer` | 運命の踊り子 | 踊り子×占い師 | 運命舞姫 | **KEEP ID**, rename/evolve |
| `illusionist` | 幻術師 | 踊り子×錬金術師 | 香術舞師 | **KEEP ID**, identity evolution required |
| `arcanist` | アルカニスト | 錬金術師×学者 | 真理探究者 | **KEEP ID**, identity evolution required |
| `artificer` | 魔導技師 | 錬金術師×大工 | 機工錬金師 | **KEEP ID**, rename/evolve |
| `merchantlord` | 大商人 | 商人×学者 | 鑑定士 | **KEEP ID**, evolve economy/loot identity |
| `guildmaster` | ギルドマスター | 商人×大工 | 工房主 | **KEEP ID**, rename/evolve |
| `healerfolk` | 村の癒し手 | 僧侶×農民 | 豊穣司祭 | **KEEP ID**, rename/evolve |
| `ironyeoman` | 鉄農兵 | 農民×大工 | 開拓者 | **KEEP ID**, rename/evolve |

## Compatibility findings

### 1. IDs are more important than names

The save system and progression systems already refer to job IDs. Therefore Phase 8 should treat the table above as the canonical legacy-ID ownership map. The visible fantasy can evolve without moving progression data.

### 2. Two draft naming collisions need resolution before implementation

- `miko` already belongs to **僧侶×占い師**, while the rough matrix proposes **巫女** for 僧侶×踊り子.
- `treasurehunter` already belongs to **盗賊×商人**, while the rough matrix proposes **トレジャーハンター** for 盗賊×学者.

Do not solve these by silently moving the old IDs. Resolve the new display names instead.

### 3. Special-job dependency chain must remain valid

Current special jobs depend on legacy advanced IDs, including:

- 大賢者 ← `sage` + `archmage`
- 剣聖 ← `battlemaster` + `swordsaint2`
- 拳帝 ← `fistsaint` + `assassinfist`
- 教皇 ← `paladin` + `miko`
- 盗賊王 ← `phantomthief` + `treasurehunter`
- 歌姫女王 ← `primadiva` + `enchantdancer`
- 大錬金術師 ← `arcanist` + `artificer`
- 商業王 ← `merchantlord` + `guildmaster`
- 精霊王 ← `huntking` + `forestbard`
- 星降る予言者 ← `astromancer` + `miko`

Keeping those IDs makes Phase 8 additive and avoids a risky save migration.

## Skill Constellation migration contract

The current specialization system is not discarded.

- Existing Job specialization selection becomes the **first major branch choice** in that Job's Constellation.
- Existing Lv5 / Lv10 / MASTER specialization nodes become seed nodes in the new graph.
- Existing MASTER inheritance (up to 3 inherited specializations) remains valid during migration.
- New Constellation nodes are layered around those seeds: Core → Branch → Keystone → MASTER Star → Fusion link.
- No player loses a learned specialization node because of the visual/UI migration.

## Implementation order after this audit

1. Final Naming Audit for all 105 Fusion Jobs, prioritizing the collision/weak-name list.
2. Add a machine-readable Fusion registry containing all 105 parent pairs.
3. Reuse the 30 legacy IDs from this document; allocate IDs only for the missing 75 pairs.
4. Add validation tests: exactly 105 unique unordered pairs, no duplicate IDs, no duplicate parent pairs, all parents are basic jobs.
5. Wire unlock discovery without changing battle behavior yet.
6. Migrate Job UI to Constellation/Fusion discovery presentation.
7. Only after save/unlock/UI stability, add unique Fusion Traits and deeper combat identities.

## Hard rule

**Do not mass-rename IDs and do not rewrite all 105 combat kits in one PR.** Phase 8 must remain incremental, testable, and save-compatible.