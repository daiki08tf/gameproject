# Phase 8 — Existing Advanced Job Compatibility Audit

Status: DESIGN / MIGRATION SOURCE OF TRUTH — supersedes `PHASE8_COMPATIBILITY_AUDIT.md`

The "Existing 30 → Fusion pair mapping" table below (all `KEEP ID + name`)
matches the shipped `LEGACY` table in `js/data/jobFusion.js` exactly. The
earlier `PHASE8_COMPATIBILITY_AUDIT.md` proposed renaming several of these
(e.g. `傭兵`, `城塞騎士`); this document's corrections are what actually
shipped.

Phase 8 expands advanced jobs from the current 30 fixed pairs to all 105 pairs of the 15 basic jobs. Existing saves, mastered jobs, learned skills/spells, special-job prerequisites, and specialization/legacy progress must survive the migration.

## Migration rule

1. Existing advanced-job IDs are never silently discarded.
2. If an existing job occupies the same parent pair as a Phase 8 Fusion Job, the existing ID is the preferred canonical compatibility ID unless there is a strong reason to migrate it.
3. Display names may be modernized independently from stable IDs.
4. Existing learned skills/spells remain attached to their legacy/canonical ID.
5. Existing special-job `requires` references must continue to resolve through canonical IDs or explicit aliases.
6. Existing MASTER/specialization/legacy save keys must migrate without resetting player progress.
7. A pair may have only one canonical Fusion Job. Phase 8 does not create a second parallel advanced job for an already occupied pair.

## Existing 30 → Fusion pair mapping

| Legacy ID | Current name | Parents | Phase 8 canonical display | Migration decision |
|---|---|---|---|---|
| paladin | パラディン | 戦士 × 僧侶 | パラディン | KEEP ID + name |
| battlemaster | バトルマスター | 戦士 × 武闘家 | 羅刹 | KEEP ID, rename display to 羅刹; preserve all skills/progress |
| spellblade | 魔法剣士 | 戦士 × 魔法使い | 魔法剣士 | KEEP ID + name |
| swordsaint2 | 剣豪 | 戦士 × 盗賊 | 剣豪 | KEEP ID + existing identity; Fusion Matrix draft `傭兵` is replaced by 剣豪 |
| armsknight | アームズナイト | 戦士 × 大工 | アームズナイト | KEEP ID + name; matrix `城塞騎士` is replaced |
| sage | 賢者 | 魔法使い × 僧侶 | 賢者 | KEEP ID + name |
| archmage | 大魔導士 | 魔法使い × 学者 | 大魔導士 | KEEP ID + name; matrix `大魔導研究家` is replaced |
| astromancer | 星詠みの魔女 | 魔法使い × 占い師 | 星詠みの魔女 | KEEP ID + name; matrix `星術師` is replaced |
| miko | 巫女 | 僧侶 × 占い師 | 巫女 | KEEP ID + name; matrix `神託師` is replaced |
| choirmaster | 聖歌隊長 | 僧侶 × 吟遊詩人 | 聖歌隊長 | KEEP ID + name; matrix `聖歌師` is replaced |
| phantomthief | 怪盗 | 盗賊 × 忍者 | 怪盗 | KEEP ID + name; matrix `暗殺者` is replaced |
| treasurehunter | トレジャーハンター | 盗賊 × 商人 | トレジャーハンター | KEEP ID + name. NOTE: the rough matrix assigned this name to 盗賊×学者; that collision must be resolved in Naming Audit. |
| scoutmaster | 密偵 | 盗賊 × 狩人 | 密偵 | KEEP ID + name; matrix `追跡者` is replaced |
| enchantdancer | 幻惑の舞姫 | 盗賊 × 踊り子 | 幻惑の舞姫 | KEEP ID + name; matrix `幻影盗賊` is replaced |
| fistsaint | 拳聖 | 武闘家 × 忍者 | 拳聖 | KEEP ID + name; matrix `修羅` is replaced for this pair |
| assassinfist | 暗殺拳 | 武闘家 × 盗賊 | 暗殺拳 | KEEP ID + name; matrix `拳盗士` is replaced |
| beasttamer | 猛獣使い | 武闘家 × 狩人 | 猛獣使い | KEEP ID + name; matrix `獣闘士` is replaced |
| sumo | 剛力士 | 武闘家 × 農民 | 剛力士 | KEEP ID + name; matrix `豪傑` is replaced |
| huntking | 狩猟王 | 狩人 × 忍者 | 狩猟王 | KEEP ID + name; matrix `影狩人` is replaced |
| forestbard | 森の吟遊詩人 | 狩人 × 吟遊詩人 | 森の吟遊詩人 | KEEP ID + name; matrix `狩猟楽師` is replaced |
| primadiva | プリマ・ディーヴァ | 吟遊詩人 × 踊り子 | プリマ・ディーヴァ | KEEP ID + name; matrix `芸聖` is replaced |
| loremaster | 語り部 | 吟遊詩人 × 学者 | 語り部 | KEEP ID + name; matrix `伝承学者` is replaced |
| fatedancer | 運命の踊り子 | 踊り子 × 占い師 | 運命の踊り子 | KEEP ID + name; matrix `運命舞姫` is replaced |
| illusionist | 幻術師 | 踊り子 × 錬金術師 | 幻術師 | KEEP ID + name; matrix `香術舞師` is replaced |
| arcanist | アルカニスト | 錬金術師 × 学者 | アルカニスト | KEEP ID + name; matrix `真理探究者` is replaced |
| artificer | 魔導技師 | 錬金術師 × 大工 | 魔導技師 | KEEP ID + name; matrix `機工錬金師` is replaced |
| merchantlord | 大商人 | 商人 × 学者 | 大商人 | KEEP ID + name; matrix `鑑定士` is replaced for this pair |
| guildmaster | ギルドマスター | 商人 × 大工 | ギルドマスター | KEEP ID + name; matrix `工房主` is replaced |
| healerfolk | 村の癒し手 | 僧侶 × 農民 | 村の癒し手 | KEEP ID + name; matrix `豊穣司祭` is replaced |
| ironyeoman | 鉄農兵 | 農民 × 大工 | 鉄農兵 | KEEP ID + name; matrix `開拓者` is replaced |

## Important naming corrections discovered by the audit

The rough 105 matrix is intentionally a draft. Existing content takes priority where it already provides a strong, implemented identity.

- `トレジャーハンター` is already the implemented **盗賊 × 商人** job. Therefore **盗賊 × 学者 needs a new name**. Recommended working name: **遺跡探究家** (Codex / trap analysis / rare discovery).
- `羅刹` remains the approved display rename for legacy `battlemaster` (戦士 × 武闘家). This is safe because the stable ID remains `battlemaster`.
- `修羅` must not replace `fistsaint` at 武闘家 × 忍者. If the name 修羅 is retained, reserve it for a future special/secret identity rather than creating a duplicate pair.
- Existing names with substantial bespoke skill sets (剣豪, 拳聖, 怪盗, 狩猟王, プリマ・ディーヴァ, アルカニスト, etc.) are preferred over rough matrix placeholders.

## Existing special-job dependency impact

Current special jobs reference advanced IDs directly. These dependencies must remain valid:

- 大賢者 → `sage` + `archmage`
- 剣聖 → `battlemaster` + `swordsaint2`
- 拳帝 → `fistsaint` + `assassinfist`
- 教皇 → `paladin` + `miko`
- 盗賊王 → `phantomthief` + `treasurehunter`
- 歌姫女王 → `primadiva` + `enchantdancer`
- 大錬金術師 → `arcanist` + `artificer`
- 商業王 → `merchantlord` + `guildmaster`
- 精霊王 → `huntking` + `forestbard`
- 星降る予言者 → `astromancer` + `miko`

Therefore stable IDs are more important than display-name purity during Phase 8 migration.

## Compatibility architecture for the 75 new pairs

For the 75 previously unimplemented pairs:

- create a new stable `fusion_*` ID derived from sorted parent IDs, e.g. `fusion_mage_thief`;
- store `requires: [parentA, parentB]` exactly as existing advanced jobs do;
- derive the base stat profile through the existing parent-profile merge mechanism;
- add explicit Fusion Trait / Resource interaction / Constellation data separately instead of duplicating stat logic;
- do not auto-generate generic skills as the final identity; generic generation may only be a temporary fallback during staged implementation.

## Save migration contract

Phase 8 implementation must test at least these save cases:

1. no advanced jobs mastered;
2. one legacy advanced job mastered;
3. all 30 legacy advanced jobs mastered;
4. a special job unlocked through legacy IDs;
5. specialization/legacy slots equipped from a legacy advanced job;
6. current active job is a renamed legacy job (`battlemaster` → 羅刹);
7. save created after 105-job expansion with a new `fusion_*` job, then reload;
8. resurrection-password serialization/deserialization with old and new job IDs.

No migration may reset job level, MASTER state, learned skill state, specialization progress, or special-job unlock eligibility.

## Next implementation gate

Before runtime implementation begins:

1. update `PHASE8_JOB_FUSION_MATRIX.md` to reflect the 30 canonical existing mappings;
2. complete Naming Audit for the remaining 75 new pairs;
3. define canonical stable IDs for all 75 new jobs;
4. define a shared Fusion Job schema (`parents`, `fusionTrait`, `resourceInteraction`, `constellation`, `lootTags`);
5. prototype only 4 representative constellations before mass expansion.
