# Adventure / World 4.0 — Living Adventure Roadmap

## Vision
既存の「ステージを選ぶ → 戦闘 → 次へ」を、世界を歩き、調べ、判断し、発見を持ち帰るテキストRPG型Adventureへ発展させる。

> Settlementで情報を得る → Worldへ出る → Regionを選ぶ → Routeを進む → Sceneを調べる → 戦闘・発見・事件・秘密に遭遇する → 帰還する → Settlement / Codex / Research / Ranch / Chronicleが変化する → 次のAdventureが変わる

World 4.0は既存ゲームを置き換える別ゲームではない。Story / Stage / BattleEngine / Loot / World Tier / World Event / Nemesis / Rift / Secret Realm / Machine Realm / Companion / Settlementを正本として再利用し、その上にAdventure Layerを載せる。

## Core pillars
1. **Macro Exploration** — World / Regionを選ぶ。
2. **Route Exploration** — 分岐Route / Nodeから進路を選ぶ。
3. **Scene Exploration** — Node内部で観察・調査・判断する。
4. **Knowledge** — Rumor / Trace / Clue / Discovery / Codex / Researchにより、同じ世界でも見える情報が増える。
5. **Living World** — Nemesis、World Event、季節・天候、Rift、プレイヤー行動で地域状態が変化する。
6. **Return Loop** — Adventureの成果がSettlementへ戻り、次のAdventureを生む。
7. **Build Expression** — Job / Companion / Equipment / Runeが戦闘だけでなく探索方法にも影響する。

## Non-negotiable contracts
- 既存Story / CHAPTERS / Stage進行を破壊しない。StoryはWorld 4.0上の主要Routeとして包む。
- BattleEngineを再実装しない。Adventure encounterは既存戦闘へ接続する。
- Reward / Loot / Enemy / World Tier / Companion倍率をWorld 4.0側で二重適用しない。
- 既存 `world2.discoveries` 等の正本を監査し、同じ概念を二重保存しない。
- Adventure Lv / Exploration XP / World Token / Energy / Stamina / Daily Adventure等の不要な成長軸・日課を追加しない。
- リアル時間respawnや現実の日付をAdventure進行条件にしない。変化はゲーム内進行で決定する。
- 装備・Companion・Job等の専用条件を唯一の必須解法にしない。重要コンテンツには代替ルートを用意する。
- Story必須要素をRare/RNG Eventに置かない。
- 永久ロストを基本設計にしない。戦闘不能でも装備・Companion等を永久消失させない。
- 完全ランダムWorldにしない。**Authored Skeleton + Deterministic Variation** を基本とする。
- Secretは存在自体を最初から一覧でネタバレしない。
- スマホ優先。巨大ボタン群・長大一覧・過剰スクロールを避け、1画面1目的を原則とする。
- Homeへの入口を増殖させない。既存Navigationへ統合する。
- save migration / legacy save compatibilityを各phaseで維持する。

# World model

```text
World
 └─ Region
     └─ Route Graph
         └─ Node
             └─ Scene
                 └─ Observation → Investigation → Resolution
```

### World
既存World区分を正本として利用する。

### Region
プレイヤーが「どこへ冒険するか」を認識する主要単位。Theme / enemy family / route / weather affinity / discovery / secret / Nemesis / Boss等で個性を持つ。

### Route
Region内部の攻略経路。一本道ではなく分岐・合流・Shortcut・Hidden Routeを持てる。

### Node
Battle / Elite / Boss / Event / Discovery / Treasure / Camp / NPC / Nemesis / Rift / Secret等。

### Scene
Node内のテキスト探索単位。単にNodeを踏んで結果を受け取るのではなく、状況を観察し選択する。

# Information model

情報は新しいKnowledge Lvではなく既存状態の組合せで表現する。

```text
知らない
 → Rumorを聞いた
 → Traceを見つけた
 → Clueを調査した
 → Discoveryとして記録
 → Codex / Researchで解析
 → Route / Secret /攻略情報が判明
```

通常は次の1〜2手先だけを半可視にする。探索済み、Rumor、Research、Companion、Job、Equipment/Rune等により情報開示段階を上げられる。

# Exploration design

## Scene result families
調査は原則として何らかの情報・状況変化を返す。
- Discovery — 恒久的な発見
- Clue — Event / Mystery / Nemesis / Secretへの手掛かり
- Resource — 既存素材・既存Loot pipelineへの入口
- Encounter — 既存BattleEngine戦闘
- Route — 新Route / Shortcut / Hidden Route
- World State — Region / Settlement / NPC等の状態変化

## Three-stage event grammar
1. **Observation** — 状況提示。
2. **Investigation** — プレイヤーの選択。
3. **Resolution** — 即時結果、Adventure結果、Region結果、World結果。

Failureは単なる「失敗しました」ではなく、Ambush / 別Route / 新Clue等の別展開になり得る。

## Event consequence scopes
- Immediate — Battle / HP / Loot等、その場。
- Adventure — 現在のAdventure限定Route / Camp / temporary flag。
- Region — NPC / Secret / Region state等。
- World — Settlement / 他Region / Research / Trade Route等。

# Event families

### Ambient Events
世界の空気を作る短いScene。毎Nodeを事件だらけにせず静かな移動も含める。

### Investigation Events
痕跡・遺物・廃墟・荷車・足跡等を複数選択で調査する。

### System Events
Codex / Ranch / Companion / Settlement / Nemesis / World Event等へ接続する。

### NPC Events
Traveler / Merchant / Adventurer / Scholar / Tamer等。重要NPCは複数RegionやSettlementへ再登場可能。

### Event Chains
複数Adventureに跨る小Quest。一本道だけでなく途中分岐を許容する。

### Mystery Chains
Rumorや不可解な現象から始まり、Discovery → Research → 再探索 → Secret/Boss等へ繋がる長期探索。

### Rare Events
Season / Weather / World Tier / Discovery等の複合条件。必須Storyは置かない。

### Secret Events
存在自体を隠す。条件成立時にScene内の違和感として初めて発見可能にする。

# Event content targets
長期的な目標。初回実装で全数を要求しない。
- Ambient: 100+
- Investigation: 50+
- NPC: 30+
- Mystery chains: 20+
- Secret events: 20+
- Region-specific: 各Region 20–30+

Event追加は可能な限りdata-drivenとし、イベント1件ごとに専用patch関数を増殖させない。

# Discovery design

Discoveryカテゴリ候補:
- Landmark
- Lore
- Creature
- Civilization
- Ancient
- Anomaly
- Secret

Region completionは単純な `visitedNodes / totalNodes` にしない。

```text
Region Completion
- Major locations
- Discoveries
- Boss
- Secrets
- Nemesis
- authored special events
```

Secret denominatorを未発見時から露骨に見せない。必要に応じ「記録済み情報だけ」で達成表示する。

# Hidden route rules
Hidden Route条件候補:
- Discovery
- Codex observation
- Settlement Research
- Tavern Rumor
- Resident knowledge
- Companion species/nature/existing traits
- Job
- Equipment / Rune
- Season / Weather / Daypart
- World Tier
- Nemesis / Boss kill
- Rift Key
- Expedition discovery

重要Routeには複数の解法を用意する。

# Adventure Session
街を出て帰還するまでを1 Sessionとして扱う。

候補state:
- region
- currentNode
- visitedNodes
- discoveredThisRun
- campUsed
- temporaryFlags
- cluesThisRun

W0で既存save rootを監査し、最終保存先を確定する。中断セーブから再開可能にする。

目安:
- Short route: 3–5 nodes
- Standard: 6–10 nodes
- Deep / Dungeon: 10–15 nodes

ユーザーに「Short/Standard/Deep」というモードを強制選択させず、Region / Route構造として自然に差を出す。

# Camp / Return
Campはサバイバルゲーム化しない。食料・水・睡眠ゲージは追加しない。

Camp候補:
- 回復
- 状態確認
- Companion / Equipment確認（既存仕様と安全に接続できる範囲）
- Discovery確認
- 帰還

通常帰還では獲得成果を保持。戦闘不能時も永久ロストなし。必要ならcurrent Adventure限定bonus / unresolved clue / position等の限定的リスクだけを採用する。

# Job / Companion / Equipment / Rune exploration integration

## Job
既存JobをW0で監査し、戦闘外選択肢へ接続する。例: Warrior=突破、Ranger=追跡、Mage=魔力解析、Priest=霊的現象、Tamer=Monster interaction等。

専用選択肢は「常に最適解」にしない。

## Companion
新しい探索ステータスを大量に作らず、既存species/nature/traits等からfield reactionを派生する。
例: Beast=痕跡、Flying=偵察、Magic=Anomaly、Aquatic=水路、Curious=Discoveryへの反応。

## Equipment / Rune Expansion
World 4.0の正式な柱として装備・Runeを拡張する。

方向性:
- Region-themed equipment
- Exploration utility equipment
- Nemesis / Boss conditional equipment
- Endgame horizontal equipment
- Combat conditional runes
- Enemy-type runes
- Exploration information runes
- Build-changing runes
- 少量の2–3部位utility set

探索装備は単純な `Discovery +20%` より、**見える情報・選べる行動・Route条件が変わる**方向を優先する。

初期長期目安:
- 武器 +20–30
- 防具 +20前後
- Unique +15–20
- 通常Rune +20–30
- Exploration Rune +10–15
- Build-changing Rune +10前後

一括投入ではなくRegion実装と同時に地域固有Equipment / Unique / Runeを段階追加する。

# Nemesis Hunt 4.0
Nemesisをメニュー上の敵だけでなくRegion内の追跡対象にする。

```text
Activity report
 → Trace
 → Clue
 → Damage site / Witness
 → Location identified
 → Encounter
```

NemesisはAdventure進行に応じてRegion間移動可能。リアル時間では動かさない。遭遇しても必ず戦闘になる必要はなく、逃走や追跡継続も可能にする。

# World Event integration
World Eventは倍率表示だけでなくRegion contentを変える。
例:
- 魔力嵐 → Anomaly/Rift/Magic scene
- 魔物大移動 → Beast/Nemesis/Ranch scene
- 境界崩壊 → Secret Realm/Ancient scene

既存World Event reward/scalingを再実装しない。

# Season / Weather integration
Settlement S12の既存cycle/hooksを監査しWorld Adventureへ接続する。

Weather/Seasonは原則「Drop +X%」ではなく内容変化に使う。
- Rain → 水路、増水/減水、植物、痕跡変化
- Mist → 視界、Secret、Anomaly
- Night → Undead、墓地、Rare Event
- Winter → 凍結Route、雪原Scene

# World Tier integration
既存倍率は正本のまま。Adventure側は主にcontent availabilityを担当する。
例:
- WT2: Elite variants
- WT3: Nemesis activity
- WT4: Anomaly nodes
- WT5+: Secret routes
- high WT: Endgame region states

数値閾値はW0監査後に既存World Tier設計へ合わせる。

# Rift / Secret Realm / Machine Realm
Adventure中に入口・痕跡を発見可能にする。

```text
Anomaly detected
[侵入]
[位置を記録]
[撤退]
```

「位置を記録」後にSettlement / 既存Endgame入口から挑戦できる設計を許容する。既存各Realmの正本・報酬式・進行を変更しない。

# Dynamic World State
リアルタイムではなくゲーム進行で変化する。

Region state例:
- Stable
- Threatened
- Event-active
- Corrupted
- Recovered

UIでは内部IDではなく「平穏 / 不穏 / 危険 / 境界異常」等の自然な表現を使う。

例:
- Nemesis放置 → Threatened
- Nemesis撃破 → Recovered / NPC復帰
- World Event → temporary authored state
- Rift進行 → Corrupted
- Boss撃破 → 奥地/自由探索解禁

# Story integration
Storyを削除・再実装しない。

```text
初回:
World → Region → Story Route → existing Stage → existing Battle

攻略後:
同Region → Free Adventure / Discovery / Nemesis / Secret / Rift / World Event
```

Storyが世界を案内し、攻略後に同じ場所が自由探索空間として開く構造を目指す。

# Dungeon model
Dungeon専用engineを作らずRoute Graphの設定差で表現する。
- 分岐
- 合流
- Secret
- Treasure
- Camp
- Boss
- 永続Shortcut

一度開通したShortcutは周回時の長い再踏破を減らす。

# UI principles

## World screen
- Region cardsを主役にする。
- 危険度、記録済み探索情報、Nemesis/World Event等をコンパクト表示。
- 未知Secretの総数を不用意に見せない。

## Region screen
- 探索開始
- Discovery / Codex / Nemesis等の記録
- 現在のWeather/World State
- 主要情報を1画面に圧縮

## Adventure screen
- Scene本文
- 現在地
- HP等の最低限status
- 2–4個程度の意味ある選択肢
- 帰還

巨大Graphをそのまま表示せず、内部GraphをテキストADVとして表現する。

# Implementation roadmap

## Foundation

### [x] W0 — Existing World Architecture Audit
コード変更を急がず、以下の正本・接続点・save ownershipを徹底監査する。
- Story / CHAPTERS / Stage
- BattleEngine / TextBattleScreen
- Enemy / Elite / Boss
- Reward / Loot / Item Power
- World Tier
- `world2` / discoveries
- World Event
- Nemesis
- Abyss
- Rift
- Secret Realm
- Machine Realm
- Codex
- Job
- Companion / Ranch
- Equipment / Rune 2.0 / Unique
- Settlement / S12 hooks / Research / Tavern / Expeditions / Chronicle
- Navigation
- save / migration / legacy compatibility

Deliverables:
- authoritative-source matrix
- save ownership matrix
- BattleEngine launch/result contract
- Story wrapping contract
- World 4.0 architecture contract
- このroadmapの監査結果による改訂

### [x] W1 — World / Region Data Model
- 既存Worldを壊さずRegion metadata layerを定義。
- Region theme / recommended range / state / route entry / discovery references。
- raw internal IDをUIへ露出しない。

### [x] W2 — Adventure Session Foundation
- 出発 / 中断保存 / 再開 / 帰還。
- Adventure-only stateとpersistent discovery stateを分離。
- legacy save backfill。

### [x] W3 — Route Graph & Node Engine
- authored graph、分岐、合流、node condition、shortcut。
- Battle/Event/Discovery/Treasure/Camp/NPC/Secret等の共通node contract。
- deterministic variation用seed/進行方式はW0で既存RNGと整合させる。

### [x] W4 — Adventure UI Foundation
- World → Region → Adventureの最小導線。
- 半可視Route情報。
- 1画面1目的、スマホ優先。
- 最小vertical slice: Settlement → Region → 分岐 → existing Battle → 帰還。

## Exploration & Events

### [x] W5 — Scene Exploration Engine
- Observation → Investigation → Resolution。
- nested investigation。
- requirement付き選択肢。
- Immediate / Adventure / Region / World consequence scopes。

### [x] W6 — Data-Driven Event Framework
- event definition / conditions / choices / results / follow-up / flags。
- weighted conditional pool。
- oneShot / repeatable / chain / adventure-count cooldown / rare。
- 同一Event連打防止。

### [x] W7 — Discovery 4.0
- Landmark/Lore/Creature/Civilization/Ancient/Anomaly/Secret。
- 既存Discovery正本との統合。
- Region completion。
- 未知Secretネタバレ防止。

### [x] W8 — Trace / Clue / Investigation Board
- Monster/Human/Ancient/Rift/Secret traces。
- Clue chain。
- Settlement側の調査記録表示。
- Quest Logの単純置換ではなく「情報を繋ぐ」UI。

### [x] W9 — Ambient & Investigation Content Pack I
- 最初の複数Regionへ十分なAmbient/Investigation Sceneを投入。
- 「何も起きない静かなScene」も適量追加。
- 選択肢に一意の善悪正解を作りすぎない。

### [x] W10 — Event Chains & Persistent Memory
- 複数Adventureに跨るchain。
- Event memory / 再訪文章変化。
- failure branch。
- 「今は解けない → 記録 → 帰還 → 後で解決」。

### [x] W11 — Mystery System
- Rumor → Trace → Discovery → Research → 再探索 → Secret/Boss等の長期Mystery。
- Mysteryは必須Storyから分離。
- ヒント段階を用意し詰みを防止。

### [x] W12 — Hidden Routes & Secret Locations
- Secretの存在自体を隠す。
- 複合条件と複数解法。
- permanent shortcut。
- authored secret scenes。

### [x] W13 — NPC / Traveler Network
- 再登場NPC。
- Region ↔ Settlement移動。
- Merchant/Traveler/Scholar/Tamer等。
- NPC event chainからTrade Route / Rumor / Research等へ接続。

## Build Expression

### [x] W14 — Job Exploration Actions
- 既存Jobからfield actionsを派生。
- 専用選択肢は常時最適解にしない。
- Job変更で同じSceneの解法が変わる。

### [x] W15 — Companion Field Actions
- species/nature/existing traitsからfield reaction。
- Trace / scouting / anomaly / route hint等。
- Companion必須の取り返し不能コンテンツは禁止。

### [x] W16 — Equipment Expansion I: Regional Gear
- Region固有武器/防具/Unique。
- 既存Loot/Item Power正本へ統合。
- 地域へ行く理由を作る。

### [x] W17 — Rune 2.0 Adventure Expansion
- Exploration information runes。
- Nemesis/Boss/enemy-type conditional runes。
- build-changing runes。
- Rune 2.0正本のみを拡張し旧socket/crafting系を復活させない。

### [x] W18 — Exploration Gear & Utility Sets
- 情報開示 / Event option / Camp / Trace等を変えるutility gear。
- 2–3部位setはutility中心。
- DPS最強set固定化を避ける。

## Living World

### [x] W19 — Nemesis Hunt 4.0
- Activity → Trace → Clue → location → existing Nemesis battle。
- Adventure進行によるRegion移動。
- 逃走/再追跡。
- Nemesis撃破によるRegion変化。

### [x] W20 — World Event Adventure Integration
- World EventがRegion node/event poolを変える。
- 既存reward/scalingは再実装しない。

### [x] W21 — Seasons / Weather / Daypart Integration
- Settlement S12 hooksをWorld Adventureで実消費。
- Rain/Mist/Night/SeasonによるRoute/Scene/Secret変化。
- 単純倍率中心にしない。

### [x] W22 — World Tier Adventure Integration
- 既存WT倍率はそのまま。
- Elite/Nemesis/Anomaly/Secret/Endgame content availabilityを変える。

### [x] W23 — Rift / Secret Realm / Machine Realm Discovery
- Adventure内で痕跡/入口発見。
- 侵入 / 位置記録 / 撤退。
- 既存Realm進行・報酬を正本として利用。

### [x] W24 — Dynamic Region State
- Stable / Threatened / Event / Corrupted / Recovered等。
- プレイヤー行動と既存system状態で変化。
- description / NPC / event pool / route availabilityへ反映。

## Full RPG Loop

### [x] W25 — Settlement Feedback Loop
- Tavern Rumor → Adventure。
- Discovery → Research。
- Resident knowledge → Route/Event。
- Expedition discovery → World。
- Ranch/Companion → field interaction。
- Adventure成果 → Chronicle。

### [x] W26 — Story → Free Adventure Integration
- existing Story StageをRegion Story Routeとして包む。
- Story攻略後Free Adventure解禁。
- Story save/progression互換。

### [x] W27 — Region Boss / Secret Boss Framework
- existing Boss正本を優先。
- authored Region Boss endpoint。
- Secret/Mystery/Nemesisとの複合Boss条件。
- BattleEngineを再実装しない。

### [x] W28 — Dungeon Adventures & Shortcuts
- Route GraphによるDungeon。
- branch / treasure / camp / secret / boss。
- permanent shortcutで周回負荷軽減。

### [x] W29 — High-Level / Lv99,999 World
- Regionを無限増殖させず、WT / Endgame / Dynamic Stateで既存Regionを横展開。
- Normal → Corrupted → Nemesis Territory → Rift Overrun等。
- Lv1–99,999の既存成長軸・Reward Scalingを尊重。
- 実装: `adventure4HighLevelState()`（新規data）は既存W22 `adventure4WorldTierAvailability()`のelite/anomaly/endgame閾値(rank1/2/4)をそのまま再利用し、独自のランク軸を作らない。Regionが物語踏破済み(`world4RegionState().status==='completed'`)の場合のみ発動し、未踏破Regionの本編演出には一切影響しない。Nemesis Hunt(W19)が同Region内で進行中なら最低でも「浸食地帯」まで引き上げる。
- Endgame Reward Scaling(`endgameRewardScaling.js`)・Abyss・Machine World側の数値には一切触れず、参照すらしない（表示専用の雰囲気ラベルのみ）。
- 新規save rootなし。`state.adventure4HighLevelStateForRegion(regionId)`は既存`activeWorldTier`/`world4RegionState`/`adventure4NemesisHuntState`を読むだけのderived view。
- UIはWorld選択画面の既存Region cardへ1行のバッジ（`normal`時は非表示）を足しただけで、新しいボタン・新しい画面は追加していない。

### [x] W30 — Equipment Expansion II: Endgame Horizontal Gear
- 高Lvで単純Item Powerだけではない横方向Unique / conditional gear。
- Rift/Nemesis/Machine/Secret等の活動に由来する装備。
- 既存Endgame reward multiplierを二重適用しない。

## Content & Finish

### [x] W31 — Event Content Pack II
- Region固有Ambient/Investigation/NPC/Mystery/Secretを拡充。
- data追加中心で拡張できることを実証。
- 重複文章・同型選択肢を監査。

### [x] W32 — Exploration Chronicle & World Records
- Discovery / Region Boss / Nemesis / Mystery / Secretの記録。
- Settlement Chronicle/Codexと役割重複しない形へ統合。

### [x] W33 — Adventure UI 4.0 Final
- World/Region/Adventure/Investigation Boardの情報階層を最終整理。
- 長文折り畳み、compact status、主要CTA優先。
- Homeのボタン増殖を防ぐ。
- raw IDs / debug text / duplicate panels除去。

### [x] W34 — Save Migration & Compatibility Audit
- old save / mid-game / endgame / Settlement 3.0 save。
- current Adventure途中save。
- unknown/missing fields backfill。
- canonical roots重複監査。

### [x] W35 — Full Integration Regression & Balance
- Story / Battle / Loot / Job / Companion / Rune / World Tier / World Event / Nemesis / Rift / Secret Realm / Machine Realm / Settlementを横断。
- reward double application無し。
- BattleEngine duplication無し。
- Story random-gate無し。
- dead-end Secret無し。
- mobile navigation regression無し。
- CI green。

### [x] W36 — Adventure / World 4.0 Completion Audit
- 全phase contract確認。
- 未接続hook / dead UI / zero-consumer eventを検索。
- roadmapと実装差分を明記。
- technical debtを隠さず次phaseへhandoff。

# Phase completion contract
各phaseは原則として以下を満たすまで完了扱いにしない。
1. 既存正本を確認してから実装。
2. save互換/backfill確認。
3. relevant unit/regression tests追加。
4. syntax/test suite green。
5. `Blade Vale Tests` / `Phase 8 Validation` のrequired CI green。
6. roadmap checkbox / docs同期。
7. 重複system、raw ID、reward multiplier二重適用、不要なHome buttonを監査。
8. PRを小さく保ち、原則squash merge。

# W0 decision gates
W0完了時に以下を確定しない限りW1へ進まない。
- World / Region metadataのauthoritative ownership
- Discoveryのauthoritative ownership
- Adventure Session save location
- Route/Node/Event data location
- existing BattleEngine launch/result callback contract
- Story Stage wrapping method
- existing Rune 2.0 extension point
- Equipment/Unique extension point
- Settlement S12 seasonal hook consumption method
- World Event / Nemesis / Realm integration points
- RNG / deterministic variation policy
- navigation ownership

# Success criteria
World 4.0完了時、プレイヤー体験が次の形になっていること。

> 「次のステージを押す」のではなく、Settlementで得た噂や研究結果を頼りにRegionへ出発し、分岐Routeを選び、Sceneを調査し、Job・Companion・装備・Runeによって異なる情報や解法を得て、DiscoveryやClueを持ち帰る。NemesisやWorld Eventによって世界は変化し、過去の行動をNPCやRegionが記憶する。Story攻略後も同じRegionにSecret、Mystery、Rift、Unique、Boss、Endgameの理由が残り、Lv99,999まで既存システムと繋がって遊び続けられる。」