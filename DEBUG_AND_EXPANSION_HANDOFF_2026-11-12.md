# Blade Vale — デバッグ・改善・拡張 指示書 (2026-11-12)

> Baseline: `claude/trusting-curie-nl357m` @ `4b371e4`（Pacing pass 直後）
>
> この文書は「次に作業する人/AI」への指示書。監査で**実際に確認できたこと**と、
> そこから導いた改善・追加要素の提案を、優先度と受け入れ条件つきでまとめる。
> `CODEBASE_DEBUG_AUDIT_2026-09-05.md`（DBG-01〜10）の続きとして ID は DBG-11 から振る。
> 作業ルールは `CLAUDE.md`（Hard architecture constraints / Testing policy / Work protocol）が常に優先。

---

## 実施状況（2026-11-12 追記）

| ID | 状態 | 内容 |
|---|---|---|
| DBG-11 | 原因特定・導線のみ対処 | Pacing pass の退行ではない。`9479339`（9/11）時点から同じで、こうげきのみ 40戦0勝。現行は こうげきのみ 2/60、**やくそう併用 51/60**、とくぎ＋やくそう 54/60。つまり 1-1 は初期所持のやくそう2個を使う前提の調整で、問題は「それが伝わらない」こと。難度は変えず、`js/patches/battleAssist.js` が第1章で HP 45% 以下・回復どうぐ所持・未使用のとき1戦1回だけ手引きをログに出す。**敵数値を下げるかどうかは未決（ユーザー判断）** |
| DBG-12 | オート実装済み | `battleAssist.js` の「オート」。直前に手動で選んだ こうげき／ぼうぎょ／とくぎ／じゅもん を 300ms 間隔でくり返す。HP 35% 以下と Boss 出現で自動停止、どうぐ・にげるはくり返さない、戦闘開始ごとに OFF。`_onCommand` 経由なので報酬・他パッチの経路は手動と同一。セーブ追加なし。5-4 が 158 ラウンドかかる原因の切り分けは**未実施** |
| DBG-13 | 修正済み | `続ける X-Y` はプレイヤー自身のタップのときだけ Stage 確認画面へ直行。下部ナビ「冒険」など `#goStageBtn` を代理クリックする経路は従来どおり章一覧で止まる（`event.isTrusted` で区別）。390×844 / 375×667 / 1280×800、初期・1-1 クリア後・全クリアの各セーブで確認 |
| DBG-14 | 修正済み | 下記「DBG-14 の実装メモ」参照。回帰テスト `tests/rift-reward-wiring.test.js` |
| DBG-15 | 撤去済み | 融合戦闘は意図的な引退だった：`tests/c1-job-identity-migration.test.js` が「`main.js` は `fusionCombatRuntime`/`fusionBattleIntegration`/`fusionBattleUi` を読み込まない」ことを既に固定しており、C0/C1 監査も 105 融合職を deprecated と明記している。復活させると `state.data.fusionCombat` という新セーブルートも生える。よって `fusionCombatIdentity.js`、`fusionBattleIntegration.js`、`fusionBattleUi.js`、`fusionCombatRuntime.js`、`screens/fusionGalaxy.js`、`screens/jobConstellation.js` と、対応する `.tb-fusion-*` CSS を削除。`weaponBuildSynergy.js` は実行時ロジックではなくテストが使う設計カタログなので残置 |
| DBG-05 | 解消 | `numericSafety.js` に実際の利用者を作った：戦闘 HUD の HP/MP バー幅（`percentWidth`）と数値表示（`formatGameNumber`、桁区切り・NaN 非表示） |
| DBG-11 | **確定：現状維持** | ユーザー判断「負けのペナルティがないゲームなので 1-1 の難度はそのまま」。手引きのみで完了 |
| DBG-21 | **新規・未着手** | 深淵チャレンジの `setBonus`（精鋭招来「Set出現率+30%」）、`eliteBonus`（同「Elite脅威+2」）、`bossTechniqueBonus` と `specialReward`（覇者の秘技）は、`stage.abyssChallengeRewards` に載るだけでどこからも読まれていない。DBG-14 と同じ種類の「名乗っているのに効かない」 |

### DBG-14 の実装メモ

- 経路: `riftKeys.js` / `abyssChallenges.js` のフィールド → `endgameDropContextFix.js::stageDropContext` が
  `greaterChanceMult` / `legendaryChanceMult` / `ancientWeightMult` としてドロップ文脈に載せる →
  既存の `greaterAffixChance` / `legendaryEffectChance` / `affixRarityWeightsForItemPower` が読む。新しい Loot authority は作っていない。
- 「出現率+N%」は**基礎確率に対する相対増**として実装した（各関数の既存上限 clamp はそのまま）。
  絶対加算と読むと `greaterBonus:.35` は上限 0.30 に常時張り付くため。
- 実測（IP 8500・英雄の剣 3000 個、実際の `state.addItem` 経由）: Greater 13.4% → 17.5%、Legendary 27% → 36%、Ancient 3.1% → 3.4%。
- 深淵チャレンジの「猛攻」（Greater +15%）と「癒しなき深淵」（Legendary +15%）も同じ経路で効くようになった。
- `古代の` は `ancientBonus` を .08 → 1.0（Ancient Option の抽選重み ×2）に調整した。旧値では 3.1% → 3.4% で体感できなかったため。調整後の実測は 3.1% → 6.0%（同条件）で、他の接頭辞と同程度の実効差（+3〜9pt）に揃う。
- 鍵の確認画面の「報酬特性」に効果の説明を併記するようにした（例: `古代の（Ancient Option 出現率 ×2）`）。`riftKeys.js` の各 REWARD に `desc` を追加。
- 前回「要確認」とした `高位の` は鍵生成時（`riftKeys.js` の `rewardIpMult`）、`黄金の` は `stage.dropMult` 経由で、どちらも元から効いていた。

### この実装で触ったファイル

`js/patches/battleAssist.js`（新規）、`js/main.js`（import 1行）、`css/style.css`（オートボタンと手引きの色）、
`js/patches/finalIntegrationUi.js`、`js/patches/stageFirstNavigationUi.js`、`js/patches/endgameDropContextFix.js`、
`js/data/equipment3Greater.js`、`js/data/equipment3Legendary.js`、`js/data/equipment3AffixQuality.js`、
`tests/rift-reward-wiring.test.js`（新規）。

### DBG-15 の撤去で変更したテスト（死んだコードだけを検証していたもの）

- 削除: `tests/phase8-fusion-combat.test.js`（3件）、`tests/phase8-fusion-battle-integration.test.js`（2件）— 対象データごと撤去。
- `tests/battle-mobile-scroll.test.js` — 読み込まれていない `fusionBattleUi.js` 内の CSS 文字列を照合していた。実際に読み込まれる `css/finalIntegration.css` を照合するよう書き換え、ローダーの存在確認を1件追加（3件 → 4件）。
- `tests/job-constellation-ui.test.js` — 旧 `screens/jobConstellation.js` のソース照合2件を削除。データ・ランタイム側の8件は維持。
- `tests/uix6-batch1-status-job-rebirth.test.js` — 旧星盤画面の「未着手のまま」確認1件を削除、他のリストから当該ファイルを除外。
- `tests/uix4-battle-result-suite.test.js` — リストから `fusionBattleUi.js` と `.tb-fusion-panel` の照合行を除外。
- `tests/rift-entry.test.js` — 旧 Fusion start デコレータに対する1件を削除。
- `tests/phase10-6-numeric-safety.test.js` — HUD が `numericSafety` を実際に使うことを確認する内容へ更新。
- 合計 1936 → 1928 件。生きているコードへの検証は減らしていない。

### 既知の残り

- 375×667 の戦闘画面はオートボタン1行ぶんログ欄が狭くなる（実測 96px）。仲間 HUD が縦に大きいのが主因で、これは以前からの状態。
- オートの間隔・停止閾値は `battleAssist.js` 冒頭の定数。設定画面（IMP-4）ができたらそこへ出す。

---

## 0. 監査でやったこと（再現可能な形で）

| 種別 | 内容 | 結果 |
|---|---|---|
| 機械チェック | `./dev status` / `./dev doctor` | 0 fail / 0 warn |
| 構文 | `npm run test:syntax` | 通過 |
| 回帰 | `npm test` を計18回 | 17回は 1934/1934 通過、**初回の1回だけ 1933/1934**（DBG-19） |
| 実機ブラウザ | Playwright + Chromium、`python3 -m http.server` 配信。390×844 / 375×667 / 1280×800 | 下記 |
| 自動巡回 | 進行セーブ（全495ステージをクリア済みにしたもの）で、ホーム3ハブ配下の全10画面 × 全タブ（約60状態）を巡回 | **コンソールエラー0、未捕捉例外0、アイドル時のDOM変異0（オブザーバーループなし）、横はみ出し0、絵文字0、`undefined`/`NaN` 表示0** |
| 実プレイ | 初期セーブで 1-1 を実際に戦闘（10回＋リトライ1系列） | DBG-11 |
| シミュレーション | `node scripts/progression-pacing-sim.mjs`（seed 42） | DBG-11 / DBG-12 の裏付け |
| 静的解析 | `js/main.js` からの import グラフ到達性、`confirm(` 呼び出し、セーブ読み書き、Rift 報酬フィールドの消費先 | DBG-14〜17 |

**巡回がカバーしていない範囲（＝未検証。問題なしとは言えない）**

- 各画面内の「実行系」ボタン（購入・強化・配合・転生など）の押下後の挙動
- 冒険配下のサブフロー（Hunt、Rift 鍵、秘境、観測分岐、Machine World、拠点防衛/闘技場の戦闘）
- 1-1 以外の実戦闘、戦闘中の「じゅもん／とくぎ／どうぐ／にげる」
- 実機 iPhone Safari（ホーム画面追加の standalone 含む）
- DBG-01 の受け入れウォーク（前回監査から未実施のまま）

---

## 1. 確認済みの不具合・問題

重大度: HIGH = 初回体験や継続プレイを直接壊す / MED = 機能が嘘をついている・データ喪失リスク / LOW = 体裁・保守性。

### DBG-11 [HIGH] 初期セーブの 1-1 が初回ほぼ必ず敗北する

- **証拠（実機）**: 初期セーブ・390×844 で 1-1 を「こうげき」連打のみ → **10戦0勝**（16〜21ターンで `DEFEATED...`）。
  敗北後リトライ1系列では、2回目で Lv2 になりクリア。
- **証拠（シム）**: `progression-pacing-sim.mjs` seed 42 でも `1-1 rec1 lv1 firstTry=no attempts=2`、
  サマリの walls に `1-1(rec1,lv1,tries2,farm0)` が載る。壁として設計されたのは章ボス/チェックポイント
  （x-4 / x-7）のはずで、1-1 は対象外。
- **状況**: プレイヤー HP 48、敵は推奨Lv1のゴブリン計5体（2体ずつ出現）、ゴブリン1発6ダメージ前後。
  原因（Pacing pass の影響か、それ以前からか）は**未特定**。
- **指示**:
  1. `git stash`/`git worktree` で `4b371e4^` と比較し、Pacing pass 前後で 1-1 の勝率が変わったか確認する。
  2. 原因を特定してから直す。`ENEMY_SCALING` と `chapterMult` の係数は触らない（CLAUDE.md の未決事項）。
     触ってよい候補: 1-1 の敵数/波構成（`js/data/stages.js` の CHAPTER_1）、`PACING_WALL_LAYER` の適用範囲、
     初期所持品、1-1 限定の戦闘内ヒント（HP 半分で「ぼうぎょ／どうぐ」を促すログ1行）。
  3. **ユーザー判断が必要**: 「最初のステージで1回負けるのは意図か」。意図でないなら下の受け入れ条件で進める。
- **受け入れ条件（意図でない場合）**: 初期セーブ・こうげき連打のみで 1-1 を 10戦中8勝以上。
  1-5（章ボス）の壁は現状維持。`progression-pacing-sim.mjs` の walls から 1-1 が消える。

### DBG-12 [HIGH] 戦闘が長すぎる。しかも1ラウンド1タップで、自動化手段がない

- **証拠（シム seed 42、ラウンド数）**: 3-5 = 46、4-4 = 51、5-3 = 66、**5-4 = 158**、5-5 = 58。
  序盤（1章）は 11〜24。
- **証拠（コード）**: オート戦闘・くりかえし・倍速のいずれも存在しない
  （`js/` 全体で該当語は `battleEngine.js` のコメント2件のみ）。「おまかせ」は仲間の作戦であってプレイヤー行動ではない。
- **影響**: ハクスラの核である周回が、5章時点で1戦あたり50〜150タップになる。
  Pacing pass が「壁の前に8回ファーム」を要求するようになったため、負担が掛け算で効く。
- **指示**:
  1. まず 5-4 の 158 ラウンドが「シムの行動方針のせい」か「実際に敵が硬すぎる」かを切り分ける
     （シムの行動選択を読み、実機で 5 章相当のセーブを作って1戦する）。
  2. 対策は §3 の EXP-1（くりかえし／オート）。数値側（敵 HP）をいじる前に入力負担を先に下げる。
- **受け入れ条件**: 5章の通常ステージ1戦が、プレイヤーの操作10タップ以内で完走できる手段がある。

### DBG-13 [MED] ホームの「続ける 1-1」が 1-1 に行かない

- **証拠（実機）**: 初期セーブのホーム主ボタンは `続ける　1-1`。押すと世界地図（`chapterSelectScreen`）に着地する。
  戦闘開始までにさらに「地名 → ステージ → 物語を進める」の3タップが必要。
  全クリア済みセーブではラベルが `冒険を選ぶ` に変わり、こちらは挙動と一致している。
- **関係ファイル**: `js/patches/stageFirstNavigationUi.js`（`#goStageBtn` の主導権を持つ）、
  `js/patches/finalIntegrationUi.js`、`js/patches/homeNavigation.js`、`js/patches/adventureWorld4Ui.js`。
  クリックリスナーが4層ある。触る前に `docs/MUTATION_OBSERVER_SAFETY.md` と wrapper 順を確認すること。
- **指示**: ラベルが `続ける X-Y` のときは、そのステージの確認画面（`stageConfirmScreen`）まで直行させる。
  ラベル側を「冒険へ」に変えて辻褄を合わせる方法もあるが、Stage-first の趣旨からは直行が望ましい。
- **受け入れ条件**: 初期セーブと途中セーブの両方で、`続ける X-Y` → 確認画面にそのステージ名が出る。
  「戻る」でステージ一覧に戻れる。3ビューポートで確認。

### DBG-14 [MED] Rift 鍵の報酬接頭辞 5種のうち 3種が何もしない

- **証拠（コード）**: `js/data/riftKeys.js` の `REWARDS`
  - `大いなる`（`greaterBonus:.35`）、`伝説の`（`legendaryBonus:.20`）、`古代の`（`ancientBonus:.08`）
  - この3フィールドを読む箇所が `js/` に存在しない（同名の `abyssChallenges.js` 側は深淵専用の別系統）。
  - `riftKeyCore.js::riftKeyModifiers` は `reward` オブジェクトを返すだけ。
  - `高位の`（`itemPowerBonus`）と `黄金の`（`dropMult`）は別途消費先を要確認。
- **影響**: 鍵の名前が約束する報酬が出ない。前回監査の「follow-up reward audit」が未着手のまま残っていたもの。
- **指示**: 深淵チャレンジが `greaterBonus`/`legendaryBonus` を既存ドロップ処理へ渡している経路を調べ、
  Rift でも**同じ経路**に載せる（新しい Loot authority は作らない）。`ancientBonus` も既存の Ancient 抽選に乗せる。
- **受け入れ条件**: 3種それぞれについて、該当鍵あり/なしで 2,000 回ドロップを回し、
  対象レアリティの出現率に定義どおりの差が出ることを `scripts/loot-simulation.js` 流儀で示す。
  これは「データ authority をまたぐ配線」なので、回帰テストを1本追加してよい案件。

### DBG-15 [MED] 実行時に到達しないモジュールが 8 本ある（うち複数はテストだけが通っている）

`js/main.js` からの静的/動的 import を辿って到達しないファイル（全546本中）:

```text
js/data/fusionCombatIdentity.js      js/patches/fusionBattleIntegration.js
js/data/weaponBuildSynergy.js        js/patches/fusionBattleUi.js
js/data/numericSafety.js  (DBG-05)   js/patches/fusionCombatRuntime.js
js/screens/fusionGalaxy.js           js/screens/jobConstellation.js
```

- `fusionBattle*` 3本は「融合職の戦闘ゲージ」を `BattleEngine.prototype.advanceTurn` にパッチする実装で、
  読み込まれていないので**ゲーム内では一切動いていない**。にもかかわらず関連テストは通る
  （`fusionBattleUi` は4テスト、`weaponBuildSynergy` は3テストから参照）。
- **ユーザー判断が必要**: 「融合戦闘アイデンティティ」は (a) 入れ忘れなのか (b) 意図的に引退させたのか。
- **指示**:
  - (a) なら import を足す前に、現行の Job 3 / Combat 3 と二重適用にならないか確認する。
  - (b) なら 8本と、それだけを検証しているテストを削除する。**これは「既存テストを緩める」ではなく
    死んだコードの撤去**だが、削除対象テストの一覧を PR 本文に明記すること。
  - 判定は正規表現ベースの静的解析なので、削除前に `grep -rn "<basename>" js index.html` で再確認する。

### DBG-16 [MED] セーブが壊れると無言で初期化され、次の保存で上書きされる

- **証拠（コード）**: `js/state.js`
  - `_load()`: `JSON.parse` 失敗 → 握りつぶして `defaultSave()`。その後の最初の `save()` で元データは消える。
  - `save()`: `localStorage.setItem` 失敗（容量超過・プライベートモード）も握りつぶし。プレイヤーは保存されていないことに気づけない。
  - スキーマ版数なし（`./dev status` 自身が `no schema version` と表示）。マージは浅い `{...default, ...saved}`。
- **補足**: 進行セーブの実サイズは約 24 KB（全ステージクリア・装備は少なめ）。容量自体は当面問題ない。
- **指示**:
  1. パース失敗時は、生文字列を別キー（例 `bladevale_save_v1__corrupt`）へ退避してから初期化する。
     これは `state.data` のルート追加ではないので「new save root」制約には当たらないが、PR で明記する。
  2. `save()` 失敗時は `showToast()` で1回だけ通知する（連打で毎回出さない）。
  3. 「ふっかつのじゅもん」適用の直前に、現セーブを1世代だけ別キーへ自動退避する。
  4. 版数フィールドの追加は**ユーザー判断**（DBG-04 の `ui14` 整理と同じセーブスキーマ見直しバッチで扱う）。
- **受け入れ条件**: DevTools でセーブを壊して再読込 → 退避キーに元文字列が残る。
  `localStorage.setItem` を例外にすり替えて戦闘終了 → トーストが出る。既存セーブは無変更で読める。

### DBG-17 [LOW] ネイティブ `confirm()` が 3 箇所残っている

- `js/patches/monsterRanchUi.js:7`、`js/patches/companionFoundation.js:130`（進化）、`:131`（放流）。
- PR #408 で Option Fusion から `confirm()` を外したのと同じ理由（iOS 埋め込みブラウザで失敗）が当てはまる。
  放流は取り返しがつかない操作なので、黙って通る/黙って何も起きない のどちらも困る。
- **指示**: #408 と同じインライン2段階確認に置き換える。

### DBG-18 [LOW] 世界地図ノードに `kind-undefined` クラスが付く

- `js/patches/worldMapUi.js:209` — ``kind-${node.kind}`` に既定値がない。実機 DOM で `wm-node terrain-plain kind-undefined` を確認。
- 見た目の実害は未確認。`node.kind || 'stage'` 等の既定値を入れ、CSS 側に該当セレクタがあるか確認する。

### DBG-19 [LOW] 回帰スイートに低頻度の不安定テストがある

- 18回中1回、1933/1934。**どのテストかは捕捉できていない**（出力を保存していない回だった）。
- 直前のコミットが `rareHuntContent.test.js` の約10% RNG フレークを直しているので、同種（`Math.random` 未固定）の可能性が高い。
- **指示**: 下のループで再現させて特定し、そのファイル既存の `withRandom` 方式で乱数を固定する。

```bash
for i in $(seq 1 40); do npm test > /tmp/t$i.txt 2>&1; grep -q '^# fail 0' /tmp/t$i.txt || { echo "run $i"; grep -n -B3 -A25 'not ok' /tmp/t$i.txt; break; }; done
```

### DBG-20 [LOW] `progression-pacing-sim.mjs` 実行時に `PATCH FAIL companionFoundation` が出る

- `Cannot read properties of null (reading 'addEventListener')` — DOM のない環境で import 時にリスナーを張ろうとして失敗。
  シムは続行するが、仲間まわりのパッチが半端に適用された状態で数値を出している可能性がある。
- **指示**: 該当箇所に null ガードを入れる（ブラウザ挙動は変えない）。その後シムを再実行して数値が動くか記録する。

### 要確認（不具合と断定していないもの）

- **敗北リザルトに `SPECIAL DROP` が出る**: 1-1 敗北時に「異端の氷の杖」（戦士に杖）が KEEP 候補として表示された。
  「敗北でも撃破分は持ち帰れる」仕様の範囲か、クリア報酬が敗北時にも抽選されているのかを `result.js` と報酬パイプラインで確認する。
- **戦闘中の再読込/タブ破棄**: `visibilitychange`/`pagehide`/`beforeunload` のハンドラが `js/` に無い。
  長期戦（DBG-12）＋ iPhone Safari のタブ破棄で、戦闘の途中経過がどう扱われるかを実機で確認する。

---

## 2. 改善点（不具合ではないが効く）

### IMP-1 起動時に 557 リクエスト

- 実測: localhost で 557 リクエスト / 約1.9秒。バンドルなしの ES モジュール 546 本をそのまま読んでいる。
- `index.html` のインライン「起動中…」スクリプトは、この遅さへの対症療法。Tailscale 越しの iPhone ではさらに効く。
- **推奨**: Service Worker によるキャッシュ（2回目以降ほぼ即起動＋オフライン動作）。依存追加なし・ビルド工程なしで入る。
  注意点は「古いキャッシュが残る」ことなので、キャッシュ名にコミット SHA か日付を入れ、更新時に旧キャッシュを捨てる。
  `./dev play` のローカル開発では無効化できるようにする。
- 代替: `<link rel="modulepreload">` の一覧を生成する方式。効果は小さいがリスクも小さい。

### IMP-2 タップ領域と極小文字（UIX-7 の残件に直結）

390×844・進行セーブでの実測:

| 画面 | 32px 未満のボタン | 11px 未満の文字（葉ノード数） |
|---|---|---|
| 職業一覧 | 65（`phase8-filter` 42×29 ほか） | 57 |
| 旅人星盤 | 0 | 72 |
| 装備 | `最強装備` 60×30 | 30 |
| 装備 > 詳細フィルタ | 19（入力欄が高さ 18〜26px） | 50 |
| 牧場 | `卵` タブ 30×44 | 7〜14 |

UIX-7 の未決事項（px→rem 全面改修をやるか）に対して、**全面改修ではなく上の4画面だけ直す**という第三の選択肢を提案する。

### IMP-3 ブラウザ煙テスト（DBG-02 の実体化）

今回の巡回方法がそのまま DBG-02 の答えになる。骨子:

1. 進行セーブを `page.evaluate` で作る（`/js/state.js` と `/js/data/stages.js` を動的 import し、`recordStageResult` で全ステージをクリア扱いにする）。
2. `[data-home-hub-toggle]` → `#go*Btn` → 画面内の `.tab-btn` を順に押す。
3. 各状態で (a) console error / pageerror、(b) 700ms 間の DOM 変異数（アイドルなのに >0 ならオブザーバーループ）、
   (c) 横はみ出し、(d) 表示文字列中の `undefined|NaN|[object Object]`、(e) 絵文字、を検査する。

CI に入れるなら Playwright が dev 依存になる（`./dev doctor` の「zero runtime dependencies」は実行時依存の話なので抵触しないが、ユーザー確認のうえで）。
入れない場合でも `scripts/` に置いて PR 前に手で回す価値がある。

### IMP-4 設定画面がない

音量/ミュート、戦闘ログ速度、モーション軽減の手動トグルを置く場所がない。EXP-1 のオート設定の置き場にもなる。
保存先は DBG-04（`ui14` の扱い）と同じ判断になるので、セーブスキーマ見直しと同じバッチで決める。

---

## 3. 追加要素の提案（拡張）

前提: どれも CLAUDE.md の Hard architecture constraints を守る
（新通貨なし・スタミナなし・新セーブルートなし・新 Battle/Loot authority なし）。
各案に「再利用する authority」と「最初の1スライス」を付けた。着手前にユーザーへスコープ確認すること。

### 優先度 A — 今ある遊びを遊べるようにする

**EXP-1 くりかえし／オート戦闘**（DBG-12 の本命対策）
- 内容: ①「くりかえし」= 直前のコマンドを再実行、②「オート」= 簡易方針（こうげき主体／HP 閾値で回復）で自動進行、③ログ送り速度。
- 再利用: `BattleEngine` のコマンド入力をそのまま呼ぶ UI 層だけの機能。戦闘結果・報酬の経路は変えない。
- 制約チェック: 進行を生まない純 UI。ボス/チェックポイントではオートを切る選択肢を持たせると「壁」の設計と両立する。
- 最初のスライス: 「くりかえし」ボタン1個だけ。これだけで周回のタップ数が激減する。

**EXP-2 最初の30分の導線（旅の手引き）**（DBG-11 / DBG-13 とセット）
- 内容: 「1-1 クリア → 装備を付け替える → 鍛冶屋で1回強化 → 仲間を編成」程度の短い目標列をホームの NEXT 枠に出す。
- 再利用: 既存の `endgameGuidance.js`（ホームの NEXT カード）を序盤にも使う。達成判定は既存 state の読み取りのみ。
- 制約チェック: 報酬を付けるなら既存の Gold/魔石だけ。新フラグを増やさず、既存状態から導出する。

**EXP-3 オフライン対応と自動バックアップ**（IMP-1 / DBG-16 とセット）
- 内容: Service Worker で PWA 化、セーブの世代バックアップ、じゅもんのファイル書き出し。
- iPhone のホーム画面追加で遊んでいる現状に最も直接効く。

### 優先度 B — ハクスラとしての深み

**EXP-4 戦闘レポート（ダメージ内訳）**
- 内容: リザルトに「誰の/どの技の/どの属性のダメージが何割だったか」「被ダメージ源」を出す。
- 狙い: ビルドを変えた効果が見える。C12 相当の Build Identity 2.0 の土台になる。
- 再利用: `BattleEngine` が既に出している戦闘イベントの集計のみ。保存しない（その戦闘限り）。

**EXP-5 地域ユニーク装備（C8 の未着手アングル）**
- 内容: 4つの定命地域それぞれに「その地域でしか落ちないユニーク」を1〜2本置き、Region Codex の束に項目を足す。
- 再利用: Unique 2 / Loot 3 の既存ターゲットファーム経路、Region Codex の READ 集約。
- 最初のスライス: frontier 1地域・ユニーク1本・Codex 表示まで。

**EXP-6 ボス再戦記録**
- 内容: 章ボスごとに「最短ラウンド」「使用職業」を記録し、Region Codex のボス欄に出す。C11（Boss/Nemesis identity）への入口。
- 注意: 保存フィールドが要る。新ルートは作らず、既存の Codex 系ルートに載せられるかを先に監査する。載らないならユーザー判断。

### 優先度 C — Living World の続き（既存ロードマップの延長）

**EXP-7 釣り／考古学／宝探しの第2スライス（Ch16〜20 の1地域）**
- 狙い: Region Codex を後半5地域へ広げる前提条件を1地域ぶんだけ解く。C8 の「次の一歩」がここで詰まっている。

**EXP-8 拠点インシデント第3の型**
- 既存: 発掘型（謎の遺物漂着）、調査型（住民失踪）。
- 提案: 「護送型」— 既存の戦闘（`prepareSettlementDefenseBattle` と同じ経路）に、連れ帰る対象の生存条件を1つ足すだけ。
  または「調停型」— 既存の拠点素材を賭け金にした選択。どちらも新ミニゲームを作らない。

**EXP-9 C6-8 の残り3リアクション**
- 水棲→釣り、縄張り→地域生態、社会性→拠点/噂。現状は付けるタグが無い。
  先に仲間データへ最小のタグを足す作業が必要で、内容は小さいが前提作業がある点に注意。

### 見送りを勧めるもの

- デイリー/ログインボーナス、時間回復型の行動力: 「スタミナなし」「実時間の期限なし」に反する。
- 新しい強化通貨: 制約違反。素材不足は Pacing pass の素材ドロップで既に手当て済み。

---

## 4. 推奨する実行順

| 順 | バッチ | 中身 | 規模感 |
|---|---|---|---|
| 1 | 初回体験 | DBG-11（原因特定→修正）、DBG-13 | 小。PR 1本 |
| 2 | 周回負担 | DBG-12 の切り分け、EXP-1 の「くりかえし」スライス | 中。PR 1本 |
| 3 | 嘘をついている機能 | DBG-14（Rift 報酬）、DBG-15（死蔵8本の判断と処置） | 中。PR 2本 |
| 4 | セーブ安全 | DBG-16、DBG-17、DBG-04 の決着、IMP-4 の保存先 | 中。PR 1〜2本 |
| 5 | 小物 | DBG-18、DBG-19、DBG-20 | 小。まとめて PR 1本 |
| 6 | 基盤 | IMP-1 / EXP-3（SW・PWA）、IMP-3（煙テスト） | 中 |
| 7 | 拡張 | EXP-2 → EXP-4 → EXP-5 … | 各スライスごとに PR |

1〜2 を先にする理由: どちらも「人が遊んで最初に当たる壁」で、他の拡張をどれだけ積んでもここで離脱されると届かないため。

未消化の旧タスク（消えていない）: DBG-01 の受け入れウォーク、前回監査の「Next audit batches」2〜5、UIX-7 の残件判断。

---

## 5. ユーザーに決めてもらう必要があること

1. 1-1 の初回敗北は意図か（DBG-11）。
2. 融合戦闘アイデンティティ（死蔵8本）は復活させるか、撤去するか（DBG-15）。
3. セーブに版数フィールドを足してよいか／`ui14` をどう扱うか／設定の保存先（DBG-16・DBG-04・IMP-4）。
4. Playwright を dev 依存として入れ、CI に煙テストを足してよいか（IMP-3）。
5. Service Worker を入れてよいか（IMP-1。古いキャッシュが残るリスクと引き換え）。
6. UIX-7 残件は「4画面だけ直す」で閉じてよいか（IMP-2）。
7. 報酬曲線（`chapterMult`）の再調整 — 既存の未決事項。今回のシムで参考値が増えた:
   壁の手前で8回ファームすると Lv が 11→24、54→78、96→137 と跳ね、直後の5〜13ステージは全て初見クリアになる
   （seed 42 の1系列のみ。傾向の確認には複数 seed が必要）。
8. 拡張（§3）をどれから、どのスライス幅で始めるか。

---

## 6. 作業時の注意（この監査で実際に踏んだ点）

- `CHAPTERS` は `js/data/chapters.js` ではなく `js/data/stages.js` が export している（75要素。本編48＋外伝/サイド＋`machine_world`）。
- `#goStageBtn` は4つのパッチがリスナーを持つ。主導権は `stageFirstNavigationUi.js`。
- ジョブ Lv と `characterLevel` は別物。進行セーブを手で作るときは両方上げないとホームの `NEXT / Lv` が 1 のままになる。
- ブラウザ検証時、ページ内から `await import('/js/state.js')` すれば実行中と同じ `state` インスタンスに触れる。
- Node のシムは DOM が無いので、import 時に DOM を触るパッチは `PATCH FAIL` を出す（DBG-20）。シムの数値を信じる前にこの行が出ていないか見る。
