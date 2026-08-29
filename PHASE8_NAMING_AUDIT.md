# Phase 8 — Fusion Job Naming Audit

Status: HISTORICAL DRAFT — predates the shipped registry

Naming continued to evolve after this document (and the parallel
`PHASE8_JOB_NAMING_AUDIT.md`) was written. Neither fully matches what
shipped; the `NEW_NAMES`/`LEGACY` tables in `js/data/jobFusion.js` are the
current source of truth for all 105 Fusion Job display names. Kept for
history only.

Status (original): FINAL NAMING CONTRACT

This audit freezes the player-facing names for the 105 basic-job Fusion pairs before the machine-readable registry is implemented.

## Naming principles

- A job name must work as a standalone RPG class name.
- Avoid mechanical `親職A + 親職B` compounds when a stronger fantasy exists.
- Preserve strong existing names when they already own a legacy ID.
- Never move a legacy ID merely to reuse its display name elsewhere.
- Similar archetypes should still be distinguishable at a glance in the Constellation UI.
- Japanese fantasy terms are preferred where natural; established RPG loanwords are allowed when clearer.

## Changes from the rough matrix

| Pair | Rough name | Final name | Reason |
|---|---|---|---|
| 戦士×盗賊 | 傭兵 | **剣豪** | Preserve strong legacy `swordsaint2` identity and its existing technique set |
| 武闘家×盗賊 | 拳盗士 | **暗殺拳** | Existing name is substantially stronger and already has a coherent kit |
| 魔法使い×学者 | 大魔導研究家 | **大魔導士** | Existing name is cleaner and stronger |
| 魔法使い×占い師 | 星術師 | **星詠みの魔女** | Preserve established legacy fantasy |
| 僧侶×踊り子 | 巫女 | **神楽巫女** | Avoid collision with legacy `miko` on 僧侶×占い師 |
| 僧侶×占い師 | 神託師 | **巫女** | Preserve legacy `miko` identity and special-job dependencies |
| 盗賊×商人 | 闇商人 | **トレジャーハンター** | Preserve legacy `treasurehunter` ID/name/loot kit |
| 盗賊×学者 | トレジャーハンター | **遺物探究家** | Removes collision while keeping Codex/trap/rare-discovery fantasy |
| 盗賊×忍者 | 暗殺者 | **怪盗** | Preserve legacy `phantomthief`; stealth + theft remains distinct from 暗殺拳 |
| 商人×狩人 | 交易猟師 | **賞金稼ぎ** | Clear target-farming/trophy/Gold fantasy |
| 狩人×吟遊詩人 | 狩猟楽師 | **森の吟遊詩人** | Existing name is more natural and established |
| 踊り子×学者 | 戦舞研究家 | **舞踏軍師** | Stronger class fantasy; analysis translated into tactical dance |
| 錬金術師×学者 | 真理探究者 | **アルカニスト** | Preserve legacy identity; concise established fantasy term |
| 商人×学者 | 鑑定士 | **大商人** | Preserve legacy `merchantlord`; appraisal remains part of its kit |
| 商人×大工 | 工房主 | **ギルドマスター** | Preserve legacy `guildmaster`; broader settlement/craft command fantasy |
| 吟遊詩人×踊り子 | 芸聖 | **プリマ・ディーヴァ** | Preserve legacy identity and performance kit |
| 踊り子×錬金術師 | 香術舞師 | **幻術師** | Preserve legacy `illusionist`; poison/mist/hallucination already support this identity |

## Final 105 names

| # | Parent A | Parent B | Final Fusion Job |
|---:|---|---|---|
| 1 | 戦士 | 武闘家 | 羅刹 |
| 2 | 戦士 | 魔法使い | 魔法剣士 |
| 3 | 戦士 | 僧侶 | パラディン |
| 4 | 戦士 | 盗賊 | 剣豪 |
| 5 | 戦士 | 商人 | 傭兵団長 |
| 6 | 戦士 | 狩人 | 魔獣騎士 |
| 7 | 戦士 | 忍者 | 影武者 |
| 8 | 戦士 | 吟遊詩人 | 戦歌騎士 |
| 9 | 戦士 | 踊り子 | 剣舞士 |
| 10 | 戦士 | 錬金術師 | 錬装騎士 |
| 11 | 戦士 | 学者 | 戦術士 |
| 12 | 戦士 | 農民 | 守土兵 |
| 13 | 戦士 | 大工 | 城塞騎士 |
| 14 | 戦士 | 占い師 | 運命騎士 |
| 15 | 武闘家 | 魔法使い | 魔闘士 |
| 16 | 武闘家 | 僧侶 | 羅漢 |
| 17 | 武闘家 | 盗賊 | 暗殺拳 |
| 18 | 武闘家 | 商人 | 剣闘士 |
| 19 | 武闘家 | 狩人 | 獣闘士 |
| 20 | 武闘家 | 忍者 | 修羅 |
| 21 | 武闘家 | 吟遊詩人 | 鼓舞闘士 |
| 22 | 武闘家 | 踊り子 | 舞闘家 |
| 23 | 武闘家 | 錬金術師 | 錬体士 |
| 24 | 武闘家 | 学者 | 拳理士 |
| 25 | 武闘家 | 農民 | 豪傑 |
| 26 | 武闘家 | 大工 | 鉄拳工 |
| 27 | 武闘家 | 占い師 | 星拳士 |
| 28 | 魔法使い | 僧侶 | 賢者 |
| 29 | 魔法使い | 盗賊 | 魔導暗殺者 |
| 30 | 魔法使い | 商人 | 魔晶商 |
| 31 | 魔法使い | 狩人 | 魔弓士 |
| 32 | 魔法使い | 忍者 | 忍術師 |
| 33 | 魔法使い | 吟遊詩人 | 詠唱楽師 |
| 34 | 魔法使い | 踊り子 | 幻術舞師 |
| 35 | 魔法使い | 錬金術師 | 錬成魔導師 |
| 36 | 魔法使い | 学者 | 大魔導士 |
| 37 | 魔法使い | 農民 | 自然術師 |
| 38 | 魔法使い | 大工 | 魔導工匠 |
| 39 | 魔法使い | 占い師 | 星詠みの魔女 |
| 40 | 僧侶 | 盗賊 | 異端審問官 |
| 41 | 僧侶 | 商人 | 聖務官 |
| 42 | 僧侶 | 狩人 | 聖猟師 |
| 43 | 僧侶 | 忍者 | 退魔忍 |
| 44 | 僧侶 | 吟遊詩人 | 聖歌師 |
| 45 | 僧侶 | 踊り子 | 神楽巫女 |
| 46 | 僧侶 | 錬金術師 | 薬師 |
| 47 | 僧侶 | 学者 | 神学者 |
| 48 | 僧侶 | 農民 | 豊穣司祭 |
| 49 | 僧侶 | 大工 | 神殿守 |
| 50 | 僧侶 | 占い師 | 巫女 |
| 51 | 盗賊 | 商人 | トレジャーハンター |
| 52 | 盗賊 | 狩人 | 追跡者 |
| 53 | 盗賊 | 忍者 | 怪盗 |
| 54 | 盗賊 | 吟遊詩人 | トリックスター |
| 55 | 盗賊 | 踊り子 | 幻影盗賊 |
| 56 | 盗賊 | 錬金術師 | 毒術師 |
| 57 | 盗賊 | 学者 | 遺物探究家 |
| 58 | 盗賊 | 農民 | 野伏 |
| 59 | 盗賊 | 大工 | 罠師 |
| 60 | 盗賊 | 占い師 | 詐術師 |
| 61 | 商人 | 狩人 | 賞金稼ぎ |
| 62 | 商人 | 忍者 | 影商人 |
| 63 | 商人 | 吟遊詩人 | 興行師 |
| 64 | 商人 | 踊り子 | 旅芸商 |
| 65 | 商人 | 錬金術師 | 錬金商 |
| 66 | 商人 | 学者 | 大商人 |
| 67 | 商人 | 農民 | 豪農 |
| 68 | 商人 | 大工 | ギルドマスター |
| 69 | 商人 | 占い師 | 相場師 |
| 70 | 狩人 | 忍者 | 影狩人 |
| 71 | 狩人 | 吟遊詩人 | 森の吟遊詩人 |
| 72 | 狩人 | 踊り子 | 風弓舞 |
| 73 | 狩人 | 錬金術師 | 魔弾師 |
| 74 | 狩人 | 学者 | 魔物学者 |
| 75 | 狩人 | 農民 | 開拓猟師 |
| 76 | 狩人 | 大工 | 機巧弓師 |
| 77 | 狩人 | 占い師 | 星狩人 |
| 78 | 忍者 | 吟遊詩人 | 影奏者 |
| 79 | 忍者 | 踊り子 | 幻舞忍 |
| 80 | 忍者 | 錬金術師 | 煙術師 |
| 81 | 忍者 | 学者 | 忍軍師 |
| 82 | 忍者 | 農民 | 草忍 |
| 83 | 忍者 | 大工 | 絡繰忍 |
| 84 | 忍者 | 占い師 | 星影 |
| 85 | 吟遊詩人 | 踊り子 | プリマ・ディーヴァ |
| 86 | 吟遊詩人 | 錬金術師 | 音響錬成師 |
| 87 | 吟遊詩人 | 学者 | 伝承学者 |
| 88 | 吟遊詩人 | 農民 | 牧歌詩人 |
| 89 | 吟遊詩人 | 大工 | 楽器工匠 |
| 90 | 吟遊詩人 | 占い師 | 星詠み |
| 91 | 踊り子 | 錬金術師 | 幻術師 |
| 92 | 踊り子 | 学者 | 舞踏軍師 |
| 93 | 踊り子 | 農民 | 豊穣舞姫 |
| 94 | 踊り子 | 大工 | 機巧舞師 |
| 95 | 踊り子 | 占い師 | 運命舞姫 |
| 96 | 錬金術師 | 学者 | アルカニスト |
| 97 | 錬金術師 | 農民 | 薬草錬金師 |
| 98 | 錬金術師 | 大工 | 機工錬金師 |
| 99 | 錬金術師 | 占い師 | 星辰錬金師 |
| 100 | 学者 | 農民 | 博物学者 |
| 101 | 学者 | 大工 | 技術士 |
| 102 | 学者 | 占い師 | 天文学者 |
| 103 | 農民 | 大工 | 開拓者 |
| 104 | 農民 | 占い師 | 風水師 |
| 105 | 大工 | 占い師 | 宮大工 |

## Freeze rule

These names are the Phase 8 implementation baseline. Future flavor improvements are allowed, but once the machine-readable registry ships, a rename must not change the job ID or erase progression.

## Next implementation step

Create the Fusion Registry:

- all 105 unordered basic-job pairs exactly once;
- reuse the 30 legacy IDs defined by `PHASE8_COMPATIBILITY_AUDIT.md`;
- allocate stable new IDs for the missing 75 pairs;
- validate 105 unique pairs / 105 unique IDs / valid basic parents;
- initially reuse shared parent mechanics and avoid implementing 105 bespoke combat kits in the registry PR.