# Enemy Affinity / Weakness 2.0

Status: implementation candidate

## Goal

Make elemental choice matter by deriving bounded enemy weaknesses/resistances from species/family and environmental Variant, while keeping Combat 2.0's existing final damage layer authoritative.

## Runtime rules

- existing DEF / damage bucket formula is untouched,
- Affinity is applied only through the existing final element multiplier,
- final multiplier remains bounded to 0.65–1.55,
- explicit authored `elementResist` overrides inferred family/Variant values,
- no new currency, save root, route or reward multiplier.

## Combat families

| Family | Main tendencies |
|---|---|
| Slime | weak Fire, resists Poison |
| Beast | mildly weak Fire / Poison |
| Plant | strongly weak Fire, resists Poison |
| Undead | weak Light, resists Dark / Poison / Bleed |
| Construct | weak Lightning, strongly resists Poison / Bleed |
| Demon | weak Light, resists Dark / Fire |
| Spirit | weak Dark, resists Light / Poison / Bleed |
| Dragon | weak Ice, resists Fire / Poison |

Global Species are normalized into these combat families by `speciesId`, so ecology family names such as `bat`, `wolf`, `mushroom`, and `armor` do not leak into combat rules.

## Environmental Variant affinity

Variants modify rather than replace the base family profile.

Examples:

- `灰熱の`: Fire resistance + Ice weakness,
- `霜晶の`: Ice resistance + Fire weakness,
- `雷光の`: Lightning resistance,
- `疾風の`: Wind resistance + Ice weakness,
- `瘴毒の`: Poison resistance + Fire weakness,
- `影蝕の`: Dark resistance + Light weakness,
- `輝界の`: Light resistance + Dark weakness,
- `深淵映しの`: mild Dark resistance + Light weakness.

## Discovery

- hitting a non-neutral affinity records only the observed element/tier,
- Inspect / Analyze reveals the complete current affinity profile,
- Codex displays family, element, Weakness/Resistance tier and exact multiplier once analyzed,
- observations use the existing `monsterCodex` save root.

## Battle readability

Elemental techniques surface:

- `【大弱点！】`
- `【弱点！】`
- `【耐性】`
- `【強耐性】`

in the text battle log.

## Safety boundaries

- Bosses may still use explicit `elementResist` and therefore remain authored when needed,
- Variant and family resistance values are additive then bounded,
- explicit authored resistance wins last,
- World Tier, Enemy Lv, Rare/Elite rank and endgame reward scaling are not multiplied a second time.
