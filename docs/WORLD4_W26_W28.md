# World 4.0 — W26-W28 Story / Boss / Dungeon integration

## W26 Story → Free Adventure Integration
- Existing `CHAPTERS` / Stage progression remains authoritative.
- Before Region Story completion, Adventure wraps the canonical next Story Stage as a Region Story Route.
- After Region Story completion, the same Region opens an authored Free Adventure route.
- No Adventure-specific Story completion flag, XP, currency, or unlock namespace is introduced.

## W27 Region Boss / Secret Boss Framework
- Region Boss endpoints reference the canonical Boss Stage from the Region's final owned chapter.
- Battle resolution stays in the existing BattleEngine/Stage pipeline.
- Optional Secret Boss nodes require an explicitly supplied canonical `stageId`; the Adventure layer does not invent or duplicate Boss definitions.
- Secret Boss visibility can be gated by compound Adventure knowledge/flags without changing Boss progression.

## W28 Dungeon Adventures & Shortcuts
- Free Adventure uses an authored Route Graph with branch, treasure, camp, boss gate, boss, and return nodes.
- Permanent shortcuts are represented by a Region-scoped discovery id and therefore can reuse the existing `world2.discoveries` authority.
- No separate dungeon level, stamina, daily reset, or real-time respawn state is added.

## Safety contracts
- Story save/progression compatibility is preserved.
- Existing Boss/Battle/Reward/Loot logic is never reimplemented.
- Free Adventure unlock is derived from canonical Region Story completion.
- Hidden/Secret content is not exposed until its existing knowledge condition is satisfied.
