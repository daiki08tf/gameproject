# Blade Vale — Gear Overhaul Phase 1 / Option 4.0

> Status: **ACTIVE — Phase 1B/1C/1D implementation**
>
> This file is the exact handoff contract for the current Gear Overhaul implementation. Read it with `ROADMAP.md` and `GEAR_OVERHAUL_ROADMAP.md`.

## Phase split

### Phase 1A — Option Data Model ✅

Completed in PRs #229–#231:
- random Options capped at 3 on new gear
- stable `familyId`
- seven Option rarities
- `level / xp`
- legacy `roll` compatibility
- old 4–5 Affix saves are not destructively trimmed

### Phase 1B — Rarity Identity 🔄

Core raw-stat families now receive authored seven-name rarity ladders:

| Family | Common | Uncommon | Rare | Epic | Legendary | Mythic | Ancient |
|---|---|---|---|---|---|---|---|
| ATK | 怪力 | 剛力 | 豪腕 | 鬼力 | 覇力 | 神力 | 天威 |
| MAG | 魔力 | 魔導 | 秘術 | 魔極 | 賢者 | 神秘 | 天啓 |
| DEF | 頑健 | 堅牢 | 鉄壁 | 金剛 | 不壊 | 神鎧 | 絶対防壁 |
| HP | 体力 | 壮健 | 不屈 | 豪胆 | 不死身 | 神命 | 天命 |
| MP | 精神 | 魔泉 | 深魔 | 魔海 | 大魔源 | 神泉 | 無窮 |
| SPD | 軽快 | 疾風 | 迅雷 | 瞬迅 | 神速 | 雷神 | 天駆 |
| Crit | 鋭眼 | 鷹眼 | 慧眼 | 心眼 | 天眼 | 神眼 | 万象視 |
| Evasion | 身軽 | 軽業 | 見切り | 幻歩 | 無影 | 神避 | 空蝉 |
| Armor Pen | 貫き | 甲砕き | 破甲 | 断甲 | 穿界 | 神穿 | 天断 |

Stable save identity remains the family ID, never the display name.

Remaining Phase 1B work:
- author ladders for damage/sustain/resource/utility/status/trigger/build families
- decide family merges such as execution and crit-MP
- set rarity floors for unusual utility/build Options

### Phase 1C — Lv1–100 Value Curves 🔄

Core nine stat families have authored curves.

Rules:
- rarity changes Lv1 base value
- higher rarity also gets stronger per-level growth
- Lv25 / 50 / 75 / 100 grant small mastery multipliers
- low rarity Lv100 is meaningful
- high rarity remains stronger at the same investment
- Lv100 must not be required for intended-build clears

The intended game philosophy remains:

> **Knowledge saves time. Time can compensate for imperfect knowledge.**
>
> **「知らん、火力と耐久で押し切る」も正しい。**

Curve classes still to author:
- small capped percentages: lifesteal/CDR/mitigation
- proc chance
- trigger magnitude
- discrete values such as DoT stack count
- conservative utility curves for EXP/Gold/Drop

### Phase 1D — Combat / Drop Migration 🔄

For newly generated gear, the core nine families now use:

`family + rarity + Option Lv -> roll -> existing combat pipeline`

This deliberately writes the new calculated value into the existing `roll` field so battle code does not need a second damage/stat formula.

Old saved gear is not silently recomputed during backfill.

New drop starting Option Lv:
- low Item Power starts low
- high Item Power starts substantially higher
- Elite/Boss/EX/Nemesis provide a premium
- natural drops normally cap at Lv90
- extremely rare high-end jackpots can reach Lv91–97
- **Lv100 remains a fusion/mastery endpoint**

## Current implementation boundary

Authoritative rarity+level combat values currently apply only to:
- `atk_pct`
- `mag_pct`
- `def_pct`
- `hp_pct`
- `mp_pct`
- `spd_pct`
- `crit_pct`
- `evasion_pct`
- `armorpen_pct`

Other families receive Option metadata and starting level, but keep their legacy roll value until a specific curve is authored. This is intentional to avoid silently breaking proc/cooldown/utility caps.

## Next bold batch

Do not stop at naming tables. Next implementation batch should:
1. finish direct damage + sustain + resource curves
2. merge duplicate family concepts where approved
3. add rarity floors for utility/trigger/build Options
4. finish status/discrete curves
5. migrate display to show `<rarity-name> LvXX`
6. then begin Phase 2 Option Fusion

No new currency, Home button, parallel inventory or rarity auto-promotion.
