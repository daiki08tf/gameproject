# Phase 13 — Replayability / Challenge Expansion

> Current design note: Phase 13 is the replayability pass agreed after Phase 12 horizontal expansion. **13.4 Rotating Challenges is intentionally omitted.** Visual-identity cleanup moves into the final integration pass rather than creating another mandatory feature layer.

## Status

- **13.1 Challenge Modifiers — ✅ Complete**
- **13.2 Personal Records — ✅ Complete**
- **13.3 Titles / Recognition — ✅ Complete**
- **13.4 Rotating Challenges — ⛔ Intentionally omitted**
- **13.5 Boss REMATCH+ — ✅ Complete**
- **13.6 Rare Hunt Expansion — ✅ Complete**
- **13.7 Build Challenges — ✅ Complete**
- **13.8 Replay UI Integration — ✅ Complete**

## 13.1 Challenge Modifiers

Stage confirmation reuses the existing surface and offers optional challenge rules. No new Home button, screen, currency or progression tier is added.

- 鋼鉄の誓約 — HP/ATK pressure, +15% existing rewards
- 硝子の進軍 — speed/healing pressure, +20%
- 破砕試練 — DEF/ATK pressure, +25%
- REMATCH+ — cleared Boss/Secret Realm only, +40%

Reward bonuses reuse EXP, Gold and ordinary Drop probability.

## 13.2 Personal Records

Each cleared stage can keep:

- fewest turns
- largest player damage observed in the battle log events
- best remaining HP percentage
- total clears
- Challenge clears
- REMATCH+ clears

Records are shown again when revisiting the stage confirmation screen.

## 13.3 Titles

Titles are prestige/history only and provide no stats.

- 境界の挑戦者
- 不屈の再戦者
- 無装具の狩人
- 記録破り
- 五界超越者
- 希少観測追跡者

The Character/Status surface receives a compact Challenge Records summary.

## 13.5 Boss REMATCH+

REMATCH+ appears only after the target Boss-like stage is already cleared. It lives inside Challenge selection instead of becoming another Boss menu.

## 13.6 Rare Hunt Expansion

Five Phase 12 horizontal dungeons receive an additional ultra-low-frequency tracked species (0.8% → 0.2%). They reuse the dungeon's existing hidden Unique as the chase reward rather than introducing another rarity/currency.

## 13.7 Build Challenges

Automatic build feats recognize clears using systems the player already owns:

- Artifactなし
- 盾なし
- MASTER済みJob
- minimal REMATCH+ (Artifact <= 1 + 盾なし)

These are recognition goals, not mandatory power progression.

## 13.8 Replay UI

- Stage Confirm: compact horizontally scrollable Challenge picker + existing record
- Result: Challenge record / Rare Hunt / new title and Build Feat
- Character Status: aggregate Challenge wins / REMATCH+ wins / feats / titles

No new top-level navigation is introduced.

## Safety

- no rotating/daily/weekly schedule
- no new currency
- no new Home button
- no mandatory story gate
- no level or Item Power cap increase
- titles/feats have no stat bonuses
- old save data lazily initializes Phase 13 history
