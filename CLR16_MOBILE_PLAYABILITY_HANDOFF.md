# CLR-16 Mobile Navigation & Playability Pass

## Scope
CLR-16 treats mobile usability as a release criterion for the Stage-first Story/Hunt flow established by CLR-13〜15.

## Story smoke path

```text
Home
→ 冒険
→ Chapter
→ Stage
→ Stage detail
→ 物語を進める / 再戦する
→ Battle
→ Result
→ 次Stage / Stage一覧
```

## Hunt smoke path

```text
Home
→ 冒険
→ cleared Stage
→ Hunt
→ Adventure4 repeated battle route
→ aftermath choice
→ Elite/Boss
→ 安全に帰還する
```

## Mobile corrections
- Stage and Chapter lists remain vertically scrollable inside the viewport.
- Stage state pills (`CLEAR`, `NEXT`, `OPEN`, `LOCKED`) are compact on narrow screens.
- Stage detail Story/Hunt/Back actions are sticky and ordered by primary intent.
- Result progression actions remain reachable even with long loot output.
- Adventure Back now says `← 中断` because it suspends rather than returns.
- The suspend action explicitly says it returns to base while preserving the run.
- `帰還路` is presented as `安全に帰還する`, keeping it distinct from suspend.

## Authority
No changes to Story progress, Adventure Session, BattleEngine, rewards, Loot, EXP, World Tier or save schema.

## Next
CLR-17 — Stage / Region Loot Identity.
