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

## IPHONE PLAY (Tailscale)

The Mac serves Blade Vale over the tailnet — the iPhone never touches the
public internet and you never type a port.

**URL (bookmark this):**

```text
https://macbook-pro.tail44ad27.ts.net/bladevale/
```

1. iPhone must have Tailscale on (same tailnet as the Mac).
2. Open the URL in Safari → play → close Safari anytime → reopen →
   `はじめる` resumes the same save.
3. Home Screen: Safari share sheet → `ホーム画面に追加` → the "Blade Vale"
   icon opens the game fullscreen.

**Saves:** the iPhone's save lives in Safari's storage for that URL —
independent of any save on the Mac's own browser. Deleting the Home Screen
icon does not delete the save; erasing Safari website data does.

**Lifecycle (runs on the Mac, no Terminal needed during normal play):**

```bash
./dev remote start     # install + start (survives Mac restarts)
./dev remote status    # is everything up? one-line answer per layer
./dev remote restart   # bounce the game server (save is safe — it's in the browser)
./dev remote stop      # fully remove: server + tailnet route + login auto-start
./dev remote url       # print the iPhone URL
```

`./dev remote start` is a one-time setup; the service auto-starts at login
and auto-restarts on crash via the existing LaunchAgent convention.

**Page won't load on iPhone — diagnose top-down:**

| `status` shows | meaning | fix |
|---|---|---|
| everything OK | Mac fine; iPhone problem | check Tailscale on iPhone, or Wi-Fi |
| `tailscale : down` | Tailscale off on the Mac | open Tailscale app on the Mac |
| `serve mount : not mounted` | route lost | `./dev remote restart` (then `start` if needed) |
| `local server: ... 000` | game server down | `./dev remote start` |
| `launchagent : not installed` | never set up / stopped | `./dev remote start` |
| Mac asleep or off | — | wake the Mac; the service resumes itself |

Server log if ever needed: `~/Library/Logs/bladevale-remote.log`.

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
