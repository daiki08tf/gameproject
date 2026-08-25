# Phase 7 — Loot 3.0 COMPLETE

Status: COMPLETE

Loot 3.0 is the canonical loot layer for Blade Vale. It is complete when the player can understand why a drop matters, decide whether to keep it, target a destination for a build, and pursue a final endgame chase without introducing a second inventory or rarity framework.

## Final player loop

Battle / World destination
→ exact equipment instance drop
→ Item Power + Affix quality + special package evaluation
→ result-screen excitement / reason display
→ compare / KEEP / lock / favorite / Smart Loot decision
→ equip or dismantle / refine
→ select the next target-farm destination
→ pursue ENDGAME PIECE / APEX DROP / GOD ROLL

## Canonical value layers

Loot value is intentionally multi-axis:
- Base item rarity ends at Mythic.
- Item Power spans the long-term progression through IP10000.
- Affix rarity is separate from base rarity and can reach Ancient.
- Build Affixes, Greater Affixes, Legendary Power, Curse, Set/Unique identity and target-farm origin may make an item valuable even when its raw power score is not the maximum.
- `ENDGAME PIECE`, `APEX DROP` and `GOD ROLL` are completion labels only. They are not new rarities.

## GOD ROLL rule

A GOD ROLL requires all of the following:
- IP9500+
- at least one Ancient Affix
- a build-defining axis: Build Affix or Legendary Power
- at least one Greater Affix

Raw IP10000 alone is never enough.

## Target-farm identity

### Heaven
- Light / Wind Affix steering.
- High-quality / Legendary-oriented pressure.
- Eligible locked Relics may trigger bounded `RELIC RESONANCE` support.
- Resonance never bypasses the normal Awakening/Abyss Relic gate.

### Underworld
- Dark / Fire Affix steering.
- Legendary / Cursed high-risk identity.
- Defeated Bounty Unique lines may receive bounded `UNIQUE ECHO` trial support.
- Echo support caps at 25% and cannot replace actual Unique mastery gameplay.

### Abyss
- Item Power and Affix quality rise through the long-term depth roadmap.
- Route / pact / boss / Nemesis sources create distinct risk-reward and build-farm pressure.
- Set and endgame routes remain meaningful alongside random high-ceiling gear.

### Unknown anomaly
- Remains informational until the Story phase resolves the world mystery.
- Do not turn it into another generic loot target early.

## Inventory rules

- Weapon and gear instance IDs remain canonical for random rolls.
- Moving/equipping items must preserve their exact instance metadata.
- Fixed Unique and Set items remain canonical fixed items unless their existing design explicitly says otherwise.
- Smart Loot, lock and favorite must protect build-defining pieces.
- Auto-equip may consider strategic value, but the bonus is bounded so obsolete low-IP gear cannot dominate forever.
- Do not use raw power score as the sole definition of a good item.

## Compatibility audit

The final regression suite covers or already asserts:
- unique random weapon instances and exact instance IDs in battle results;
- persistent/random Affix metadata for weapons and generic gear;
- legacy Loot Filter normalization and Equipment 3.0 load repair;
- fixed Unique / Set safety;
- Item Power and Affix quality scaling through the endgame;
- Greater / Legendary / Cursed package behavior;
- World 3.0 target-farm profiles and real drop multipliers;
- Heaven Relic Resonance and Underworld Unique Echo bounds;
- Inventory strategic-value behavior;
- endgame chase labels and GOD ROLL guardrails.

## Guardrails for future development

1. Do not add `Ancient` as a new base equipment rarity. Ancient is an Affix quality.
2. Do not add another inventory, gear-instance, or loot-quality framework.
3. Do not create a rarity above Mythic merely to make future content feel stronger; use IP, Affix quality, special packages and build synergy.
4. Do not let target farming guarantee perfect items. It should narrow the search, not remove the hunt.
5. Do not let Heaven/Underworld farming bypass the original Relic/Bounty progression gates.
6. Do not let Smart Loot or auto-equip destroy specialized items because their flat score is slightly lower.
7. New loot content should plug into the existing loop: destination → drop → explanation → inventory decision → build/chase.

Phase 7 is complete. Future loot additions should be content expansion or balance work inside this architecture, not Loot 4.0 by default.
