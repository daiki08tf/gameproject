# Debug pass notes

## Confirmed and fixed

- Blacksmith 3.0 could overwrite an existing Legendary Effect when imprinting a different extracted effect. The old effect was lost without being extracted. A safety guard now requires the Legendary slot to be empty before imprinting.

## Audited invariants

- Loot Filter 3.0 receives weapon instance ids, so IP / Greater / Legendary / Curse filters can inspect the actual rolled instance.
- Abyss E9 is anchored to Chapter 15 rather than the retired Chapter 10 endgame baseline.
- Abyss stage metadata exposes the target Item Power used by the Equipment 3.0 drop bridge.
- Equipment 3.0 safety patch loads after the blacksmith and Abyss drop-context patches.

## Follow-up candidates

- Auto Equip still ranks equipment primarily through the legacy base-item `powerScore()`. It does not yet make a build-aware decision using Equipment 3.0 Affixes / Legendary Effects. This is not data-destructive, so it is left for a separate design-aware improvement rather than guessing a scoring formula during a bugfix pass.
- Blacksmith UI still offers imprint action buttons on occupied Legendary slots; the operation is now safely rejected by state logic. UI disabling can be added separately without affecting save safety.
