# Blade Vale — 次の作業 指示書（2026-11-13 起票）

> この文書は「途中で作業者（AI・人）が交代しても続きから進められる」ことを目的にした作業指示書。
> 上から順に進め、**1 タスク終えるごとに §0 の進捗表を更新してコミット・プッシュする**こと。
> 規約は `CLAUDE.md` が常に優先（Hard architecture constraints / DOM safety / Testing policy）。
> これまでの監査・調整の記録は `DEBUG_AND_EXPANSION_HANDOFF_2026-11-12.md`。

ブランチ: `claude/trusting-curie-nl357m`（PR は未作成。ユーザーが求めるまで作らない）

---

## 0. 進捗表（作業のたびに更新する）

| ID | 内容 | 状態 | メモ |
|---|---|---|---|
| T1 | 仲間リアクション残り 3 種 | 完了 | 水棲→釣り、guardian→地域の記録、support→拠点インシデント。役割は種族の `role`。実機確認済み |
| T2 | 地域ユニーク装備（定命 4 地域） | 完了 | `uq_region_*` 4 本を `HUNT_UNIQUES` に追加（`regionId` つき）。Region Codex に「固有装備」行（未入手は ？？？＋狙える章）。実ドロップ・装備効果・表示を実機確認。所持判定はインスタンス ID 対応（`regionCodex.js` の `ownsBase`） |
| T3 | 釣り・考古学・宝探しを The Veil（16〜20 章）へ | 完了 | 釣り場 1＋魚 8 種（舞台は 16 章の聖海）、遺構 1＋欠片 4＋復元記録（17 章の聖典庫）、宝探し 1 本。難度は既存の上限内（釣り ≤6、発掘 ≤4。プロファイルがそこで頭打ち）。件数を固定していたテスト 6 件を「定命 4＋The Veil」に更新 |
| T4 | Region Codex を The Veil へ拡張 | 完了 | `COVERED_REGION_IDS` に `veil`。16 章以降の種族 `regionId` も正しく解決されることを実機確認 |
| B1 | トーストの上書き問題（キュー化） | 完了 | `showToast` をキュー化（待ちがあると 1 件 1.7 秒、同文は 1 件に、待ちは最大 4）。呼び出し側は無変更。追跡インシデントの遅延回避は撤去 |
| B2 | オート戦闘の磨き込み | 一部完了 | 済：オートで勝ち切った戦闘を「もう一度」で続けると ON のまま開始（別ステージ・手動で終えた戦闘・撤退では OFF）、停止理由をボタンに 2.6 秒表示。未：回復どうぐの自動使用（消耗品を勝手に使うためユーザー判断待ち） |
| B3 | 出撃確認画面の情報 | 一部完了 | 済：現在 Lv との差を言葉で（余裕あり／適正／やや不足／大きく不足）、本編の関門・ボスに一言。未：前回の戦闘レポートの表示 |
| B4 | リザルトの戦利品一覧 | 完了 | 見出しつきの注目品＋先頭 3 件を表示、残りは「ほか N 件の戦利品」に折りたたみ（順序は変えない）。8 ドロップで直表示 4＋折りたたみ 4 を実機確認。375×667 ではまだパネルが少しスクロールする |
| B5 | 装備ピッカーの導線 | 完了 | スロット選択後に候補一覧へスクロール（375×667 で見える高さ 49px → 267px）。候補なしの文言は既存実装にあった |
| B6 | 敵カードの HP 数値 | 完了 | 役割が判明している敵（`tacticalKnowledge().role`）だけ攻略情報行に `HP 現在/最大` を表示。未解析はバーのみ |
| T5 | 釣り・考古学・宝探しを外縁世界以降へ | 未着手 | T3 の型が固まってから |
| N1 | ビルド診断（`EXPANSION_IDEAS` A1） | 完了 | `js/data/buildDiagnosis.js`（純粋関数、9 型）。戦闘レポートに種別集計 `kinds` を追加。リザルトのレポート内とステータス画面「現在のビルド」に表示。表示のみ・保存なし |
| N2 | 地域研究（B1） | 完了 | `js/data/regionCodexResearch.js`（課題は地域図鑑の集計から自動判定、最大 9 件）＋ `js/patches/regionCodexResearch.js`。段階報酬 3 段（3 件／6 件／全件、後の地域ほど増える）。受け取り記録は既存の `state.data.claimedMilestones`。地域図鑑の各地域に折りたたみで表示 |
| N3 | ボスの隠し条件ドロップ（A2） | 完了 | phase13 は記録と称号のみで品は落ちないため重複なし。`js/data/battleBossConditions.js`：1〜15 章の章ボスに条件 1 つ（16 ラウンド以内／どうぐ不使用／残 HP50%／仲間無傷を地域ごとにずらして割当）。地域最後のボス（4・8・12・15 章）は T2 の固有装備を確定入手、ほかは魔石と Gold。出撃確認とリザルトに表示。受け取り記録は `claimedMilestones`。称号案（D2）は phase13 に既存のため不要 |
| N4 | Nemesis の足跡（C1） | 完了 | 追跡型インシデント `nemesisTrail`。育った宿敵（`activeBountyNemesis`）がいる間だけ発生し、噂帳にも目撃談として載る。成功で既存の `applyNemesisEventFlag('nemesisWeakness')`（次の対決で敵 DEF −10%）。宿敵ごと・敗北ごとに再発（解決印は `宿敵id:敗北数`）。宿敵がいない間は欄を出さない |
| N5 | 連続巡回（A3） | 未着手 | 負けても失わず倍率だけ戻す方針で実装（ユーザー未回答のため安全側） |
| N6 | 挑戦状・シード共有（D1） | 未着手 | |

状態は `未着手 / 作業中 / 完了（コミット SHA）/ 保留（理由）` のいずれか。

> 追加要素の候補は `EXPANSION_IDEAS_2026-11-15.md` にまとめてある（26 案、優先 6 つ、見送り案、着手前に確認する事実）。ユーザーが選んだものをこの表へ移して進める。

**次にやる人へ（2026-11-13 時点の残り）**

1. **T5**（外縁世界以降への釣り・考古学・宝探し）。着手前に §2 T3 直後の「所見」を読むこと。魚の恒久ボーナスに上限が無い点は先にユーザーと決める。
2. **B2 の残り**：回復どうぐの自動使用（既定 OFF の切り替えを戦闘画面内に）。ユーザー判断待ち。
3. **B3 の残り**：出撃確認画面に前回の戦闘レポートを出す（同一セッション内のみ、保存しない）。
4. **The Veil の地域固有装備**（T2 は定命 4 地域のみ）。
5. §3 末尾の「候補（未精査）」。
6. `DEBUG_AND_EXPANSION_HANDOFF_2026-11-12.md` の「まだ残っているもの」（秘境・機械界・裂界の戦闘時間の計測、裂界鍵の受け入れ確認、Service Worker・設定画面・CI 煙テストの判断待ち）。

---

## 1. 作業の進め方（毎タスク共通）

```bash
./dev status && ./dev doctor          # 開始時
npm run test:syntax                   # 毎コミット前（必須）
npm test                              # タスクの区切りで（1,935 件前後、約 20 秒）
npm run audit:uix:emoji               # UI に文字列を足したら
./dev map --write                     # ファイルを追加・削除したら（しないと dev-infra テストが落ちる）
```

- **新規ファイルは `.dev/systems.json` のどれかの `paths` に載っている必要がある**（前方一致）。
  `js/patches/ui*`、`js/patches/build*` などに一致しない名前なら、該当システムの `paths` に追記する。
- UI・挙動の変更は必ず実機で動かして確認する。既存テストはほぼソース文字列の照合で、実行時の不具合は拾えない。
  確認は Playwright + Chromium（環境に入っている。リポジトリの依存ではない）:
  ```bash
  python3 -m http.server 8765 &        # リポジトリ直下で
  # ページ内から本物の state を触れる:  const {state} = await import('/js/state.js')
  ```
  ビューポートは 390×844 / 375×667 / 1280×800。確認項目は「コンソールエラー 0、アイドル時の DOM 変異 0、横はみ出しなし、絵文字なし」。
- バランスを触るなら `scripts/browser-pacing-sim.cjs`（実ゲームをヘッドレスで回す）で前後を測る。
  `scripts/progression-pacing-sim.mjs`（Node 版）は 20 章より先が不正確。
- 絵文字は UI に出さない（恒久ルール）。データの `icon:` フィールドは DOM に出さない。
- 物語・世界観に触れる文章を足すときは `STORY_CANON.md` と `WORLD_LORE_BIBLE.md` を先に読む。
- 新しい通貨・スタミナ・セーブルート・戦闘/ドロップ authority は作らない。

---

## 2. 追加要素

### T1 仲間リアクション残り 3 種（小）

**現状**: `js/data/companionDiscoveryReactions.js` に 2 種（`undead`→考古学、`spirit`→宝探し）。
残り 3 種は「付けられるタグが無い」として保留されていたが、**現在は状況が変わっている**:

- `family: 'aquatic'` の種族が 5 体いる（`gaiden_tidepath` の `tp_*`）。→ **水棲 → 釣り** はそのまま書ける。
- 種族データに役割（`attacker / speed / guardian / sustain / breaker / debuffer / support / specialist`）がある。
  フィールド名は `js/data/companions.js` で確認すること（`family` とは別）。
  → **縄張り型（guardian）→ 地域の生態**、**社会型（support）→ 拠点・噂** に当てられる。

**やること**
1. `COMPANION_DISCOVERY_REACTIONS` に `fishing` を追加（`family:'aquatic'`）。
2. ルールが `family` 以外（役割）でも一致できるよう、`companionDiscoveryReaction()` の照合を
   `rule.family` または `rule.role` の両対応にする（純粋関数のまま）。
3. 呼び出し側を足す。既存 2 箇所が手本:
   - `js/patches/archaeology.js:111` / `js/patches/treasureHunt.js:119`（結果オブジェクトに `companionReaction` を載せる）
   - 表示側は各 `*Ui.js` が `result.companionReaction?.text` を 1 行出している。
   - 釣り: `js/patches/fishing.js` の釣果確定箇所 → `fishingUi.js`
   - 拠点・噂: `js/patches/settlementIncidents.js` の `grantAndResolve()` の戻り値 → `settlementIncidentsUi.js`
   - 地域の生態: Region Codex（`js/patches/regionCodexUi.js`）の地域カードに 1 行、が最も素直。
4. リアクションは**文章だけ**。報酬・確率には一切触れない（既存 2 種と同じ）。

**受け入れ条件**: 該当の仲間を編成した時だけ 1 行出る／外すと出ない。報酬の数値が編成の有無で変わらない。

### T2 地域ユニーク装備（中）

**狙い**: 「その地域で狩る理由」を装備側に作る。C8（Region Identity）で未着手だった角度。

**再利用するもの**
- `js/data/huntUniques.js` の `HUNT_UNIQUES`。巡回（Hunt）・Rare・Roamer の撃破抽選で落ちる追撃装備で、
  各アイテムが `huntChapters: [min, max]`（狙える章レンジ）と `anchor`（ステータス較正章）を持つ。
  `u({...})` ヘルパーが `authoredStatRescale` を掛ける。**ドロップ経路は既にある**（`huntUniquesForChapter()`）。
- 効果は `effects: [{ trigger, kind, name, power, ... }]`。**既存の `kind` だけを使う**（新しい効果種を作ると
  BattleEngine 側の実装が要る）。使える `kind` は同ファイルと `js/data/uniqueEquipment.js` を grep して拾う。
- Region Codex: `js/data/regionCodex.js` の `regionCodexBundle()` と `js/patches/regionCodexUi.js`。

**やること**
1. 定命 4 地域（`frontier` 1〜4 章 / `elemental` 5〜8 / `fracture` 9〜12 / `last-mortal` 13〜15）に各 1 本、
   `regionId` を持つユニークを `HUNT_UNIQUES` に追加。`huntChapters` はその地域の章レンジ。
   名前・lore はその地域の既存の語彙（章名・敵名・釣り場/遺構の記述）から取る。
   「%を積む」ではなく行動を変える効果を優先する、というファイル冒頭の方針に従う。
2. `regionCodexBundle()` に `uniques`（その地域の `regionId` を持つユニーク、`owned` フラグつき）を追加。
   所持判定は既存の `state.ownsItem()` か `state.isWeaponCodexSeen()` を使う（新フラグを作らない）。
3. Region Codex カードに「固有装備」行。**未入手の間は名前を `？？？` にし、狙える章レンジだけ出す**
   （ボス名を隠している既存の流儀に合わせる）。
4. `tests/` にユニーク一覧の件数や章レンジを固定しているテストがあるので、追加で落ちたら内容を確認して更新。

**受け入れ条件**: 該当章の巡回・Rare 撃破で実際に落ちる（乱数を固定して `_rollChaseDrops` を回せば確認できる。
`tests/rareHuntContent.test.js` に手本）。Region Codex に表示され、入手前後で表示が変わる。

### T3 釣り・考古学・宝探しを The Veil（16〜20 章）へ（中〜大、内容の執筆が主）

**現状**: 3 システムとも定命 4 地域ぶんしか無い。**すべてデータ駆動**なので、データを足せば動く。

| システム | データ | 1 地域ぶんに必要なもの |
|---|---|---|
| 釣り | `js/data/fishing.js` | `FISHING_SPOTS` に 1 件、`FISH_SPECIES` に 7〜8 種（common 3〜4 / uncommon 1〜3 / rare 1〜2 / master 1。各 `statTarget`・`difficulty`・`reward`・`flavor`） |
| 考古学 | `js/data/archaeology.js` | `ARCHAEOLOGY_SITES` に 1 件、`ARTIFACT_FRAGMENTS` に 4 件、`RECONSTRUCTED_RECORDS` に 1 件 |
| 宝探し | `js/data/treasureHunt.js` | `TREASURE_HUNT_CHAINS` に 1 件（`siteId` で考古学の遺構に紐づく。`rumorText / clueText / decodedText / resolutionText / reward`） |

- 解放条件は既存のまま「その地域のどれかの章のステージを 1 つクリア」。`regionId: 'veil'` を使う
  （`js/data/world3Regions.js`）。
- **数値の目安**: 既存 4 地域の並びを延長する。`last-mortal` の魚は difficulty 2〜6・報酬 veilstone 1〜5 / gold 〜300。
  The Veil は difficulty を +1 程度、報酬は 1.3〜1.5 倍まで。**魚の `statTarget` ボーナスは上限つきの既存式**
  （`fishStatBonus`）に乗るので、種数を増やすと恒久ステータスが少し伸びる点に注意（増やしすぎない）。
- **執筆の前に** `STORY_CANON.md` と `WORLD_LORE_BIBLE.md` の The Veil の節、`js/data/chapters16to20.js` の章名・敵名・lore を読む。
  The Veil は「世界の外側へ続く第二部」。定命地域の「開拓・観測・古戦場・機城」と語彙がかぶらないようにする。
- テスト: 魚種数・遺構数・地域数を固定している既存テストが落ちるはず（`tests/` を `FISH_SPECIES|ARCHAEOLOGY_SITES|TREASURE_HUNT_CHAINS` で grep）。
  「4 地域である」ことを固定している箇所は「定命 4 地域＋The Veil」へ意図を保って更新する。

**受け入れ条件**: 16 章のステージを 1 つクリアした状態で、釣り場・遺構が解放され、ミニゲームが最後まで回り、
図鑑（釣果タブ・考古学）に載る。宝探しは「噂 → 欠片 → 記録 → 解決」の 4 段階が進む。

### T4 Region Codex を The Veil へ（小、T3 の後）

`js/data/regionCodex.js` の `COVERED_REGION_IDS` に `'veil'` を足す。
CLAUDE.md に記録のある落とし穴 2 つに注意:
- 仲間種族の `regionId` は章単位（`'ch16'`）で、`WORLD3_REGIONS` の id（`'veil'`）とは別の名前空間。`world3RegionForChapter()` で解決済みのはずだが 16 章以降で確認する。
- タブの表示は JS 側の一覧だけでなく `css/monsterCodexCompact.css` にも個別の表示ルールがある。

> **T3 を終えての所見（T5 をやる人へ）**
> - 1 地域ぶんの執筆量は、魚 8 行＋欠片 4 行＋記録 1 行＋宝探し 1 件。作業そのものは 30 分程度で、時間を使うのは語彙選び。
> - 難度プロファイルは釣りが 6、発掘が 4 で頭打ち（`fishingDifficultyProfile` / `excavationDifficultyProfile`）。
>   後半地域で手応えを上げたいなら、データではなくこのプロファイル表に段を足す必要がある。
> - 魚の恒久ステータスボーナスは 1 匹ごとに加算で上限が無い（`FISH_STAT_BONUS_BY_RARITY`）。地域を足すたびに伸びしろが増える。
>   全地域へ広げる前に、上限か逓減を入れるかをユーザーと決めること。
> - The Veil の Region Codex には固有装備の行が無い（T2 は定命 4 地域のみ）。足すなら `uq_region_veil_*` を同じ形で。

### T5 外縁世界以降へ（大、後回し）

T3 と同じ作業を `outer-world`（21〜25）、`reverse-observation`（26〜30）…と繰り返す。
1 地域ずつ PR 単位で区切る。The Veil で型と分量が固まってから着手する。

---

## 3. 既存機能の磨き込み

優先度順。どれも独立しているので、1 つずつコミットしてよい。

### B1 トーストが上書きされる（小・実害あり）

`js/patches/toastFeedback.js` の `showToast()` は 1 要素を使い回すため、戦闘終了時のように
複数（図鑑の知識 Lv、仲間加入、インシデント結果…）が続けて出ると、最後の 1 つしか読めない。
追跡インシデントでは `setTimeout` で逃がしている（`settlementIncidents.js` の `announce()`）が対症療法。

**やること**: `showToast()` をキュー化する。表示中に次が来たら待たせ、1 件あたりの表示時間を短め（1.6〜2.2 秒）にして順に出す。
同じ文言が連続したら 1 件にまとめる。キューが 4 件を超えたら古いものを捨てる。
`showToast` の呼び出し側（`grep -rn "showToast(" js`）は無変更で済むようにする。
**確認**: 3 件を連続で呼んで 3 件とも順に表示されること。`announce()` の遅延は外してよい。

### B2 オート戦闘の磨き込み（小〜中）

`js/patches/battleAssist.js`。現状は「直前の手動コマンドをくり返す／HP35% で停止／Boss 出現で停止／戦闘ごとに OFF」。

- **周回時の再有効化**: リザルトの「もう一度」で始めた戦闘は、前の戦闘でオートを使っていたなら ON で始める
  （セーブはしない。モジュール内の変数で保持）。ボス・関門では従来どおり止まる。
- **停止理由をボタンに出す**: いまはログ 1 行だけ。ボタンのラベルに「HP 低下で停止中」などを 2 秒ほど出す。
- **回復の自動使用（任意・要ユーザー判断）**: HP 閾値で回復どうぐを 1 つ使ってから続行する設定。
  消耗品を勝手に使うので、既定は OFF にし、切り替えは戦闘画面内に置く。

### B3 出撃確認画面（小）

`js/screens/stageSelect.js` の `renderStageConfirm()`。現状は「推奨 Lv／クリア報酬／出現予測／所持どうぐ」。

- 自分の Lv と推奨 Lv の差を 1 行で（例:「推奨 Lv 45 ／ 現在 Lv 43（やや不足）」）。色だけに頼らず文言でも示す。
- 関門・ボスなら「番人が出る」「オートは止まる」を 1 行。`stage.checkpoint / boss / midBoss` を読むだけ。
- 前回の戦闘レポートがあれば「前回: 12 ラウンド／被ダメ 最大 HP の 0.8 倍」— ただし保存していないので、
  同一セッション内だけ（モジュール変数）。保存する案は取らない。

### B4 リザルトの戦利品一覧（中）

`js/screens/result.js`。ドロップが 5 個を超えると縦に長く、主操作のボタンが画面外に出る。

- 「KEEP 候補」「新規入手」を先頭に、残りは「ほか N 件」の折りたたみにまとめる。
- 判定は既存の `smartLoot` / `loot3InventoryDecisions` の結果を読む（独自判定を作らない）。
- 戦闘レポート（`renderBattleReport`）の位置は戦利品の後のままでよい。

### B5 装備ピッカーの導線（小）

`js/screens/equipmentFusion.js`。スロットをタップすると候補一覧が下に出るが、画面外のことがある。

- スロット選択後、候補一覧の先頭へ `scrollIntoView({ block: 'nearest' })`。
- 候補が 0 件のときの文言（「このスロットに装備できる品を持っていない」）。

### B6 敵カードに HP 数値（小・要確認）

`js/screens/textBattle.js` の `_renderEnemies()`。現在はバーのみ。
「解析済みの敵だけ数値を出す」方針の可能性がある（カードに `攻略情報：未解析` の行がある）ので、
**先に `codexEnemyKnowledge.js` を読み、解析段階に応じて出す**。未解析の敵には出さない。

### 候補（未精査）

- 鍛冶屋の他タブ（ルーン・武器熟練・整理）の密度。
- 拠点画面のヘッダーにある 3 ボタン（生産／交易／研究）とタブ行の二重構造。
- 魔物図鑑の一覧が長い（全クリア済みセーブで本文 16,000 文字超）。初期表示の件数制限か検索。
- UIX-7 の残件（px→rem）。`css/usability.css` で下限は入れたので、全面改修が要るかはユーザー判断。

---

## 4. 触るときに踏みやすい点

- `CHAPTERS` は `js/data/stages.js` が export（`chapters.js` ではない）。
- `#goStageBtn` は 4 つのパッチがリスナーを持つ。主導権は `stageFirstNavigationUi.js`。
- `TextBattleScreen._render` は 5 つ以上のパッチが順にラップしている。戦闘画面に要素を足すなら
  `battleCompactUi.js` / `battleAssist.js` のやり方（描画のたびに冪等に付け直す）に合わせる。
- 仲間 HUD は `companionBattle.js` が毎描画で `innerHTML` を作り直す。そこに足した要素は次の描画で消える。
- リザルト画面は `resultScreen` の class 変化を監視して後付けするパッチがある（`stageFirstNavigationUi.js`）。
  `renderResult()` 本体に足すのが一番安全。
- `state.save()` は 250 箇所以上から呼ばれる。計測・検証スクリプトでは `state.save = () => {}` にしてから回す。
- ジョブ Lv と `characterLevel` は別物。
- 深淵の盟約・誓約は `BattleEngine` が `findStage(stageId, riftKeys, abyssContext)` に渡して初めて効く。
  深淵ステージを別経路で組む処理を足すなら同じ渡し方をする。
