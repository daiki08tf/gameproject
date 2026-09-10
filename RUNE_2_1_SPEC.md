# Blade Vale — Rune 2.1 Canonical Spec

> Status: LOCKED

Rune 2.1 is the canonical permanent-inscription system. `js/data/runes2.js`
owns definitions and chapter assignment; `js/patches/rune2Core.js` owns the
save-compatible level/activation loop; `js/patches/rune2Special.js` connects
effects to the existing BattleEngine hooks.

## Acquisition and growth

- Story Chapters 1–36 each own exactly one Rune.
- A Rune is **not** granted by chapter completion, first clear, Story progress,
  Region discovery or UI state.
- After a real cleared battle, the existing `rollRune2DropForStage(stage.id)`
  pipeline rolls the Rune assigned to that numbered chapter.
- Any numbered Stage in the chapter is eligible. Non-numbered Observed Branch,
  Secret Realm, Rift and other special Stage ids do not inherit a Story Rune.
- The first successful roll grants Lv1 and marks the Rune discovered.
- Once discovered, it no longer drops repeatedly. Further levels are forged in
  the Blacksmith with existing Gold and Manastone.
- Do not add a Rune currency, save root, alternate drop pipeline or chapter-clear
  unlock flag. `rune2Owned`, `rune2Active` and `rune2Discovered` remain authority.
- Old oversized mark values remain stored for save compatibility; gameplay reads
  the explicit per-Rune maximum.

## Locked balance rules

- 剛撃 / 鉄壁 / 賢者 / 不倒 / 精神 / 神速: +1% per active mark, maximum 100 marks.
- Every chance, mitigation, reward and compound effect has an explicit maximum.
- `starAt` is presentation only; it must never be mistaken for an effect cap.
- Challenge improves the chance of a still-undiscovered Rune dropping, but a
  successful acquisition is always Lv1. It does not bypass Blacksmith growth.

## Chapter catalogue

| Ch | Rune | Maximum effect |
|---:|---|---|
| 1 | 剛撃 | ATK +100% |
| 2 | 鉄壁 | DEF +100% |
| 3 | 賢者 | MAG +100% |
| 4 | 不倒 | HP +100% |
| 5 | 精神 | MP +100% |
| 6 | 鷹目 | Critical chance +10pt |
| 7 | 幻影 | Boss special damage -25% |
| 8 | 祝福 | Heal 5% max HP after each round |
| 9 | 俊足 | Initiative speed +50% |
| 10 | 百烈 | Normal attack interval -50% |
| 11 | 強欲 | Remove up to six lowest ordinary-drop rarity bands |
| 12 | 黄金 | Gold +50% |
| 13 | 挑戦 | Challenge Lv20 |
| 14 | 観察 | Full five-tier enemy analysis |
| 15 | 絶壁 | Guarding damage -25% |
| 16 | 縁 | Existing capped companion recruitment/EXP/Rare package |
| 17 | 匠 | Manastone amount +50% |
| 18 | 運命 | Bonus drop chance +50% |
| 19 | 神速 | SPD +100% |
| 20 | 会心 | Critical chance +10pt |
| 21 | 猛撃 | Damage +50% |
| 22 | 会心撃 | Critical damage +50% |
| 23 | 討伐 | Boss/Elite damage +50% |
| 24 | 幸運 | Bonus drop chance +50% |
| 25 | 韋駄天 | Evasion +10pt |
| 26 | 穿甲 | Armor penetration +10pt |
| 27 | 知識 | EXP +50% |
| 28 | 富貴 | Gold +50% |
| 29 | 疾風 | Enemy SPD -50% |
| 30 | 再生 | Heal 5% max HP after each round |
| 31 | 守護 | Incoming damage -30% |
| 32 | 破陣 | Debuff power +50% |
| 33 | 収集 | 50% chance to retry a failed weapon-drop roll |
| 34 | 錬成 | Manastone amount +50% |
| 35 | 破邪 | Damage / EXP / Gold +30% each |
| 36 | 分岐点 | Damage / EXP / Gold / bonus Drop +50% each |

## Observed Branch M5

生脈 / 根唱 / 測界 / 残響 are Branch-native equipment identities, not four
extra stat-mult Runes. Their item data and old save keys may remain for
compatibility, but they must not appear in `RUNE2_DEFS` or the Rune drop loop.

