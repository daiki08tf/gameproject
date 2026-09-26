# BLADE VALE — HUMAN PLAYTEST GUIDE

Release-candidate playtest pass. Goal: play like a player, report what is
fun, broken, or confusing.

## Start the game

```bash
./dev play
```

Opens a local server and your browser automatically.
Manual fallback: `python3 -m http.server 8000` → http://localhost:8000

Stop: `Ctrl+C` in the terminal running `./dev play`.

## Fresh playthrough

1. Title screen → `はじめる`.
2. Home shows `NEXT STORY` — follow `冒険する` → chapter → stage → `出撃`.
3. Battle is command-based (`こうげき / じゅもん / とくぎ / ぼうぎょ / どうぐ / にげる`).
   You start with 2 やくそう — use `どうぐ` if HP gets low.
4. On defeat you keep XP and loot; retry is expected.
5. After victory, check the result screen for drops, then continue.

## Save / resume

Saving is automatic (localStorage, key `bladevale_save_v1`).
Close the tab or reload anytime; `はじめる` resumes where you left off.
`ふっかつのじゅもん` (records hub → じゅもん) exports/imports a save string.

## What to pay attention to

- Early battle pacing: is 1-1 fair/readable? Do you understand どうぐ usage
  and that defeat keeps your loot/XP?
- Reading the world: weather/daypart (季節・天候 in settlement → 防衛),
  `？？？` foreshadow cards, `◆ 道を見つけた` discovery notices.
- Whether optional content feels *found* rather than gated.
- Japanese text wrapping and button sizes on your phone/browser.
- Anything you can't explain from what the screen shows.

## Optional content map (all optional)

- Companions/ranch: `キャラクター` hub → 仲間 (recruit, breed, field abilities).
- Settlement: `記録` hub → 開拓拠点 (tabs: 拠点/くらし/探索/防衛/遠征/記録;
  header buttons 生産/交易/研究 open sub-screens).
- Tavern rumors: settlement → くらし → 酒場. Rumors resolve into real places.
- Hidden merchants: appear in 交易 market only when their conditions hold
  (some only "lit" during certain weather/daypart — `今は不在` = come back later).
- Hidden locations: `？？？` cards in 冒険 turn into places when you satisfy
  weather/companion/rumor conditions.
- Codex: `記録` hub → 図鑑 (species mastery, mutations, milestones).
- Abyss: unlocks after all 10 story arcs' bosses.

## Known issues to ignore for now

- Stage 1-1 can occasionally defeat a fresh save if you attack-only —
  using the starting やくそう (or retrying once) is intended gameplay.
- The first settlement visit at 集会所 Lv.5+ can queue several
  "NEW RESIDENT" popups in a row — dismiss each; it self-limits.
- Some systems are deliberately long-tail (Abyss, mastery caps) — do not
  expect to see them in one sitting.

## Report immediately (P0/P1)

- Crash, blank screen, or a screen you cannot leave.
- Progress permanently blocked (no way forward at all).
- Save loss or corruption on reload.
- Anything rendering as an emoji/icon glyph where text should be.

## Report at end (P2/polish)

- Swingy fights, unclear wording, awkward layout, typos.
- Systems that feel pointless or over-explain themselves.
