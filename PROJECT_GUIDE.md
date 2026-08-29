# Blade Vale — Project Guide

このファイルは、Blade Vale の開発時に **「何を知りたいときに、どこを読めばよいか」** を最短で辿るための案内図です。

新規実装や修正の前に、まずこのガイドで **Authority（正本） / Integration（接続層） / Deprecated（触らない旧実装）** を確認してください。

---

## 1. まず読む

| 目的 | 最初に読むファイル |
|---|---|
| ゲーム全体の概要 | `README.md` |
| 開発全体の正式方針・現在地 | `ROADMAP.md` |
| World 4.0 / Living Adventure の設計思想と W0–W36 | `ADVENTURE_WORLD_4_ROADMAP.md` |
| World 4.0 実装前のアーキテクチャ監査 | `ADVENTURE_WORLD_4_W0_AUDIT.md` |
| Lv1–99,999 の進行・報酬・章設計 | `LEVEL_ROADMAP_99999.md` |
| Official Phase 10 最終監査 | `PHASE10_FINAL_AUDIT.md` |

### AI / Claude Code / ChatGPT へ渡すとき

最初に以下を読ませるのを推奨します。

1. `PROJECT_GUIDE.md`
2. 変更対象に応じた Authority ファイル
3. 対象ロードマップ
4. 対象フェーズ周辺の tests

リポジトリ全体を先に探索させるより、正本を指定した方が旧実装を誤って再利用する事故を減らせます。

---

## 2. World 4.0 — どこを読めば何が分かるか

| 知りたいこと | Authority / 最初に読む場所 | 主な Integration |
|---|---|---|
| World / Region 定義 | `js/data/adventureWorld4Regions.js` | `js/patches/adventureWorld4Ui.js` |
| Route / Node / 条件判定 | `js/data/adventureWorld4Routes.js` | `js/patches/adventureWorld4RouteEngine.js` |
| Adventure Session | `js/patches/adventureWorld4Session.js` | 各 Adventure runtime |
| Scene / Observation→Investigation→Resolution | `js/data/adventureWorld4Scenes.js` | `js/patches/adventureWorld4SceneRuntime.js` |
| Event framework | `js/data/adventureWorld4Events.js` 系 | `js/patches/adventureWorld4EventRuntime.js` |
| Discovery | `js/data/adventureWorld4Discoveries.js` 系 | `js/patches/adventureWorld4DiscoveryRuntime.js` |
| Trace / Clue / Investigation | `js/data/adventureWorld4Investigation.js` | `js/patches/adventureWorld4InvestigationRuntime.js` |
| Event chain / persistent memory | `js/data/adventureWorld4EventMemory.js`, `js/data/adventureWorld4EventChainsI.js` | `js/patches/adventureWorld4EventMemoryRuntime.js`, `adventureWorld4EventChainRuntime.js` |
| Mystery / Secret | `js/data/adventureWorld4Mysteries.js` | `js/patches/adventureWorld4MysteryRuntime.js`, `adventureWorld4MysterySceneRuntime.js` |
| Hidden Route / permanent Shortcut | Mystery data + `world2.mysteries.shortcuts` | `js/patches/adventureWorld4HiddenRouteUi.js` |
| NPC / Traveler network | `js/data/adventureWorld4Mysteries.js` の NPC 定義 | `js/patches/adventureWorld4MysteryRuntime.js` |
| Job / Companion / Equipment / Rune の探索連携 | `js/data/adventureWorld4FieldActions.js` | `js/patches/adventureWorld4BuildExpressionRuntime.js` |
| Utility Set / Nemesis Hunt / World Event / Season / World Tier の探索連携 | 各既存 Authority + `js/data/adventureWorld4LivingWorld.js` | `js/patches/adventureWorld4LivingWorldRuntime.js`, `adventureWorld4LivingWorldUi.js` |
| Realm 発見 / Dynamic Region / Settlement feedback | World2 / Rift Key / Machine World / Settlement の既存 Authority + `js/data/adventureWorld4RealmDiscovery.js` | `js/patches/adventureWorld4RealmRegionRuntime.js`, `adventureWorld4RealmRegionUi.js` |
| Adventure UI | UIは正本ではない | `js/patches/adventureWorld4Ui.js` |
| Home から Adventure への入口 | 既存 `goStageBtn` | `js/patches/homeNavigation.js`, `adventureWorld4Ui.js` |

### World 4.0 の基本構造

```text
World → Region → Route Graph → Node → Scene
Observation → Investigation → Resolution
```

情報進行は概ね以下です。

```text
Unknown → Rumor → Trace → Clue → Discovery → Research
```

新しい Knowledge Lv のような別成長軸は作りません。

---

## 3. システム別 Authority / Integration / Deprecated

### Story / Stage

**Authority**
- `js/data/stages.js` — `CHAPTERS` / Stage 定義
- `js/data/storyCanon.js` — Story canon / reveal
- `js/state.js` — `stageProgress`, `isStageCleared`, `recordStageResult`

**Integration**
- `js/patches/adventureWorld4Ui.js`
- `js/screens/textBattle.js`

**ルール**
- World 4.0 は Story を置き換えず、包む。
- Required Story を RNG / Rare Event / 1つの特殊ビルドへ依存させない。

---

### Battle

**Authority**
- `js/battleEngine.js`
- `js/screens/textBattle.js`

**Integration**
- Adventure は `TextBattleScreen.start(stageId, onEnd, blessingId)` から既存戦闘へ入る。

**Deprecated / 禁止**
- Adventure 専用 BattleEngine を作らない。
- World 4.0 側で敵 / 報酬 / World Tier 補正を再計算しない。

---

### Job

**Authority**
- `js/data/jobs.js`
- Phase 8 拡張は `js/data/jobsPhase8.js`
- 現在 Job は `state.data.currentJobId`
- 切替 bridge は `js/patches/phase8JobSwitchRuntime.js`

**Adventure Integration**
- `js/data/adventureWorld4FieldActions.js`
- `js/patches/adventureWorld4BuildExpressionRuntime.js`

**ルール**
- Adventure 専用 Job Lv / Job 通貨を作らない。
- Job 専用選択肢を重要ルートの唯一解にしない。

---

### Companion

**Authority**
- `js/data/companions.js`
- `state.data.companionInstances`
- `state.data.companionParty`（最大3体）
- `js/patches/companionFoundation.js`

**Adventure Integration**
- species trait / nature を `adventureWorld4FieldActions.js` で Field Action へ翻訳
- runtime は `adventureWorld4BuildExpressionRuntime.js`

**ルール**
- Companion がいないと Required Story が詰む構造にしない。
- 仲間の恒久喪失を探索ペナルティにしない。

---

### Equipment 3.0

**Authority**
- `js/data/equipment.js`
- `js/data/equipment3*.js`
- weapon instance: `state.data.weaponInstances`
- armor/accessory instance: `state.data.gearInstances`
- equipped: `state.data.equipped`
- `js/patches/equipment3Foundation.js`
- `js/patches/equipment3GearFoundation.js`

**Adventure Integration**
- Adventure 中に生成された既存装備インスタンスへ `adventure4RegionalGear` メタデータを付与
- `js/patches/adventureWorld4BuildExpressionRuntime.js`
- W18 Utility Set は装備中の regional gear を `adventureWorld4LivingWorldRuntime.js` で数え、情報 / Trace / Camp 用の探索効果だけを派生する

**ルール**
- Regional Gear / Utility Set 用の別 Inventory を作らない。
- Item Power / Affix / Unique / Legendary / World Tier / Loot scaling は既存パイプラインを使う。
- Utility Set を DPS 最強セットにしない。
- Adventure 側で報酬倍率を二重適用しない。

---

### Rune 2.0

**Authority**
- `js/data/runes2.js`
- `js/patches/rune2Core.js`
- owned: `state.data.rune2Owned`
- active: `state.data.rune2Active`

**Adventure Integration**
- active marks を `adventureWorld4FieldActions.js` で探索能力へ翻訳
- runtime は `adventureWorld4BuildExpressionRuntime.js`

**Deprecated / 禁止**
- 旧 equipment socket / Rune socket architecture を復活させない。
- `rune2Core.js` の `getRuneSockets()` は legacy sockets disabled を明示している。

---

### Nemesis / Bounty

**Authority**
- `state.data.bountyNemesis`
- `js/patches/bounty2Foundation.js`
- `js/patches/bounty2Combat.js`
- `js/data/nemesis3.js`

**Adventure Integration**
- `js/patches/adventureWorld4LivingWorldRuntime.js` は既存 `intel` / `huntMode` を Activity → Trace → Clue → location として読む。
- location 到達後は既存 Bounty stage を `TextBattleScreen` へ渡す。

**ルール**
- Adventure 専用 Nemesis Lv / reward store を作らない。
- Nemesis の戦闘倍率・trait・reward を Adventure 側で再実装しない。

---

### World Event

**Authority**
- `js/patches/world2Core.js`
- `state.data.world2.lastEvent`
- `state.data.world2.eventsSeen` / `eventChains`

**Adventure Integration**
- `adventureWorld4LivingWorldRuntime.js` が現在 event を Adventure event context / optional Scene へ渡す。

**ルール**
- World Event reward / outcome / cooldown を Adventure 側で再解決しない。

---

### World Tier

**Authority**
- `js/data/worldTiers.js`
- `state.data.worldTierId`
- `js/patches/worldTierRuntime.js`

**Adventure Integration**
- `adventureWorld4LivingWorldRuntime.js` は既存 Tier の `rank` のみを optional content availability へ使う。

**ルール**
- Adventure 側で enemy / drop / item power の Tier 補正を再適用しない。

---

### Realm / Rift / Machine World

**Authority**
- Heaven / Underworld / Modern visibility: `state.world2RealmVisibility()` / `js/data/world2.js`
- Rift Key: `state.riftKeys()` / `js/patches/riftKeyCore.js`
- Machine World unlock: `state.phase9MachineWorldUnlocked()` / Phase 9 Machine World runtime
- permanent observation record: `state.data.world2.discoveries`

**Adventure Integration**
- `js/data/adventureWorld4RealmDiscovery.js`
- `js/patches/adventureWorld4RealmRegionRuntime.js`
- Adventure は既存 Authority から Realm signal を派生し、発見時は `world2.discoveries` に観測記録だけを残す。
- Dynamic Region は Realm pressure / World Event / Nemesis / weather / known Shortcut から毎回派生し、別の恒久 Region state を保存しない。

**ルール**
- Adventure の Realm 発見だけで鍵を生成・消費しない。
- Heaven / Underworld / Modern / Machine World の既存 unlock を代替・迂回しない。
- Realm 専用 Adventure 通貨・進行 namespace を作らない。
- W5 `adventureWorld4SceneRuntime.js` から後発 Realm runtime を逆 import しない。Scene runtime は optional delegation のみを持ち、W23 runtime は上位 integration からロードする。

---

### Settlement

**Authority / Hub**
- `js/patches/settlementCore.js`
- 各 Settlement runtime / UI

**関連**
- Investigation Board / Mystery Research / NPC network は Settlement UI と接続する。
- W25 は Adventure Realm Discovery を既存 Research / Chronicle の derived view へ渡し、既存 Expedition discovery を次の Adventure context へ返す。
- Home のトップレベルボタンを増やす代わりに Settlement / category hub を使う。

---

### Season / Weather / Daypart

**Authority**
- `js/patches/settlementSeasons.js`

**Adventure Integration**
- `adventureWorld4LivingWorldRuntime.js` が `settlementSeasonState()` を読み、Rain / Mist / Night / Season を optional route/scene 情報へ変換する。

**ルール**
- 現実時計による待ち時間・respawn gate を作らない。
- game-progress based deterministic cycle を再利用する。
- 単純な戦闘倍率だけの天候システムにしない。

---

## 4. Save data ownership

新しいフィールドを追加するときは、先に既存の owner を確認します。

| Namespace | Owner / 用途 |
|---|---|
| `state.data.stageProgress` | Story / Stage progression |
| `state.data.worldTierId` | World Tier |
| `state.data.world2.discoveries` | permanent Discovery（Realm signal の恒久観測記録もここ） |
| `state.data.world2.eventsSeen` | Event seen authority |
| `state.data.world2.eventChains` | Event chain progression |
| `state.data.world2.eventMemory` | cross-Adventure persistent memory |
| `state.data.world2.investigation` | Trace / Clue |
| `state.data.world2.mysteries` | Rumor / Research / permanent Shortcut |
| `state.data.world2.npcNetwork` | recurring NPC / Trade Route |
| `state.data.bountyNemesis` | Nemesis level / intel / huntMode authority |
| `state.data.adventure4` | **current Adventure session only** |
| `state.data.currentJobId` / `jobs` | Job |
| `state.data.companionInstances` / `companionParty` | Companion |
| `state.data.weaponInstances` / `gearInstances` / `equipped` | Equipment |
| `state.data.rune2Owned` / `rune2Active` | Rune 2.0 |

### `state.data.adventure4` に入れてよいもの

- active / suspended
- regionId / routeId / currentNodeId
- visitedNodeIds
- discoveredThisRun / cluesThisRun
- temporaryFlags
- campUsed
- seed
- pendingEncounter
- returnTarget

永久進行の正本をここへ複製しないでください。

---

## 5. 変更前チェックリスト

新しい機能を入れる前に、以下を確認してください。

1. そのデータの既存 Authority はあるか？
2. 同じ意味の save namespace を新設しようとしていないか？
3. Battle / Loot / World Tier / Companion / Equipment modifier を二重適用していないか？
4. Required Story が RNG や Rare Event に依存していないか？
5. Job / Companion / Equipment / Rune の1つだけを唯一解にしていないか？
6. real-world clock / Energy / Stamina / Daily Adventure を追加していないか？
7. 新しい Home button を増やさず既存導線へ入れられないか？
8. mobile で1画面1目的になっているか？
9. legacy save migration を壊していないか？
10. tests を追加・更新したか？

---

## 6. 絶対に避ける重複

- Adventure XP / Exploration XP
- World Token / Adventure Token
- Energy / Stamina / Daily Adventure
- Adventure 専用 Inventory
- Adventure 専用 BattleEngine
- Adventure 専用 Job progression
- Adventure 専用 Companion progression
- Adventure 専用 Nemesis progression / reward store
- Adventure 専用 Realm progression / key / unlock store
- Rune socket 復活
- Loot / Gold / Item Power / World Tier の二重補正
- World Event reward / outcome の二重解決
- permanent Discovery / Clue / Mystery の `adventure4` への複製

---

## 7. World 4.0 Phase 対応表

| Phase | 内容 | 主な PR / ファイル |
|---|---|---|
| W0 | Architecture Audit | PR #318 / `ADVENTURE_WORLD_4_W0_AUDIT.md` |
| W1 | World / Region Data Model | PR #319 / `adventureWorld4Regions.js` |
| W2 | Adventure Session Foundation | PR #320 / `adventureWorld4Session.js` |
| W3 | Route Graph & Node Engine | PR #321 / `adventureWorld4Routes.js`, `adventureWorld4RouteEngine.js` |
| W4 | Adventure UI Foundation | PR #322 / `adventureWorld4Ui.js` |
| W5 | Scene Exploration Engine | PR #323 / `adventureWorld4Scenes.js`, `adventureWorld4SceneRuntime.js` |
| W6 | Data-Driven Event Framework | PR #324 / Adventure event data/runtime |
| W7 | Discovery 4.0 | PR #325 / Discovery data/runtime |
| W8 | Trace / Clue / Investigation Board | PR #326 / `adventureWorld4Investigation.js` + runtime/UI |
| W9 | Ambient & Investigation Content Pack I | PR #327 / authored scene content |
| W10 | Event Chains & Persistent Memory | PR #328 / event memory + chain runtime |
| W11 | Mystery System | PR #329 / Mystery data/runtime |
| W12 | Hidden Routes & Secret Locations | PR #329 / Mystery secret + Hidden Route UI |
| W13 | NPC / Traveler Network | PR #329 / NPC network in Mystery runtime |
| W14 | Job Exploration Actions | PR #330 / `adventureWorld4FieldActions.js` + runtime |
| W15 | Companion Field Actions | PR #330 / same shared Field Action layer |
| W16 | Equipment Expansion I: Regional Gear | PR #330 / regional metadata on existing Equipment 3 instances |
| W17 | Rune 2.0 Adventure Expansion | PR #330 / active Rune 2 marks → Field Actions |
| W18 | Exploration Gear & Utility Sets | PR #332 / `adventureWorld4LivingWorld.js` + runtime |
| W19 | Nemesis Hunt 4.0 | PR #332 / Living World runtime/UI → existing Bounty/Nemesis authority |
| W20 | World Event Adventure Integration | PR #332 / current `world2.lastEvent` → Adventure event context |
| W21 | Seasons / Weather / Daypart Integration | PR #332 / Settlement S12 → Living World context |
| W22 | World Tier Adventure Integration | PR #332 / existing Tier rank → optional content availability |
| W23 | Rift / Secret Realm / Machine Realm Discovery | PR #333 / `adventureWorld4RealmDiscovery.js` + runtime/UI |
| W24 | Dynamic Region State | PR #333 / derived Realm/Event/Nemesis/weather/Shortcut overlays |
| W25 | Settlement ↔ Adventure Feedback Loop | PR #333 / Research/Chronicle derived views + Expedition lead feedback |
| W26–W36 | 未完了 | `ADVENTURE_WORLD_4_ROADMAP.md` を正本として進める |

---

## 8. テストを探す

World 4.0 の変更では、対象機能に近い `tests/adventure-world4-*.test.js` を最初に確認してください。

例：

- Mystery / Secret / NPC: `tests/adventure-world4-mystery-secret-npc.test.js`
- W14–W17 Build Expression: `tests/adventure-world4-build-expression.test.js`
- W18–W22 Living World: `tests/adventure-world4-living-world.test.js`
- W23–W25 Realm / Dynamic Region / Settlement feedback: `tests/adventure-world4-realm-region-settlement.test.js`

CI は GitHub Actions の以下を基準にします。

- `Phase 8 Validation`
- `Blade Vale Tests`

どちらも通ってから main へ merge するのを基本運用とします。

---

## 9. ファイルを見つけた後の判断基準

同じテーマのファイルが複数見つかった場合、次の順で判断してください。

1. このガイドで Authority と明記されているもの
2. 現在の runtime が import している data / core
3. `state.data` の実際の owner
4. tests が直接参照しているもの
5. 古い Phase / compatibility layer

名前が似ているだけで古い実装を正本扱いしないでください。

---

## 10. このガイドの更新ルール

今後の各 PR で以下のどれかが変わったら `PROJECT_GUIDE.md` も更新してください。

- Authority が変わった
- 新しい permanent save namespace を追加した
- 新しい大規模 subsystem を追加した
- Deprecated / 禁止事項が増えた
- World 4.0 phase が完了した
- 「どこを読めばよいか」の入口が変わった

**実装を増やすたびに説明文書を増やすのではなく、この1枚を入口として維持する**のが目的です。