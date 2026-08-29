# Settlement 3.0 — Living Frontier Roadmap

## Vision

開拓拠点を「素材を払って数値を上げる画面」から、ゲーム全体を束ねる第二の本編へ育てる。

基本ループは常に以下とする。

> 冒険する → 素材・人・情報・発見を持ち帰る → 拠点が変化する → 新しい遊びが開く → その遊びが次の冒険先を生む

施設Lvだけで全てを解禁せず、Boss討伐、救出、探索、Codex、World Event、Abyss、Rift、Machine Realmなどの実績も発展条件へ使う。

## Non-negotiable contracts

- 既存Settlement 1.0 saveをそのまま読み込めること。
- 既存4素材 `wood / ore / hide / veilstone` を基礎経済として維持し、安易に通貨を増やさない。
- 既存5施設 `hall / inn / market / watch / ranch` を削除・リセットしない。
- Lv1–5の既存コストと既存効果を後方互換として維持する。
- 数値ボーナスだけをLv20まで線形加算しない。Lv6以降は逓減させ、主な価値を機能・イベント・住民・探索解禁へ移す。
- 集会所が他施設の上限を決める既存契約を維持する。
- Story進行をランダムイベント必須にしない。
- 永久ロスト、取り返しのつかない都市特化、毎日の義務タスクを基本設計にしない。
- Homeにボタンを無制限追加しない。Settlement内をハブ化してUI増殖を防ぐ。
- Enemy / Companion / Reward / World Tierなど既存システムの倍率を二重適用しない。

---

## Long-term facility progression

### Facility cap

全コア施設の最大Lvを **20** とする。

| 集会所Lv | 拠点段階 | 意味 |
|---:|---|---|
| 0–4 | 開拓地 | 生存と基礎建築 |
| 5–9 | 開拓村 | 住民・酒場・初期探索 |
| 10–14 | 交易町 | 生産・交易・研究 |
| 15–19 | 城塞都市 | 防衛・派閥・異界連携 |
| 20 | 辺境首都 | エンドゲーム統合拠点 |

Lv5 / 10 / 15 / 20を大きな発展節目とし、見た目・呼称・利用可能コンテンツを段階的に変える。

### Numeric effect taper

Lv1–5はSettlement 1.0と完全互換。

- Lv1–5: 1.0x contribution / Lv
- Lv6–10: 0.5x contribution / Lv
- Lv11–15: 0.25x contribution / Lv
- Lv16–20: 0.125x contribution / Lv

Lv20は旧式の「20Lv分の線形バフ」ではなく、旧レート換算9.375Lv相当。後半の価値は新機能・イベント・NPC・探索に置く。

### Cost curve

Lv1–5の旧コストは完全維持。
Lv6以降は旧1.8倍指数をそのまま延長せず、成長率を段階的に緩和する。

- Lv6–10: 前Lv ×1.35
- Lv11–15: 前Lv ×1.28
- Lv16–20: 前Lv ×1.22

将来の節目解放では素材以外に「実績条件」を加えてよいが、S1では既存経済を壊さずLv20基盤だけを作る。

---

# Implementation phases

## [x] S0 — Current Settlement Audit

- Settlement 1.0の5施設、4素材、集会所gate、戦闘報酬、Ranch加入率連携を確認。
- 全施設 `maxLevel:5`、旧コスト約1.8倍成長、効果線形加算を確認。
- Saveは `settlementMaterials` / `settlementBuildings` を既に使用しており、Lv上限拡張に新save rootは不要と確認。

## [x] S1 — Facility Level 2.0 Foundation

- 全コア施設Lv上限 5 → 20。
- Lv1–5のコストを完全維持。
- Lv6–20に段階コスト曲線を追加。
- Lv6以降の数値効果を逓減。
- `開拓地 → 開拓村 → 交易町 → 城塞都市 → 辺境首都` の段階定義を追加。
- Settlement UIに現在段階と次の発展Lvを表示。
- 既存save互換。

## [x] S2 — Settlement Rank & Visual Evolution

- 集会所節目に応じてSettlement全体の見た目・説明・雰囲気を変更。
- Lv5 / 10 / 15 / 20到達時に一度だけ発展演出を表示。
- `settlementBuildings.__settlement3` に発展履歴を保持し、新しいsave rootを増やさない。
- 旧saveの既到達段階はmigration時に既読化し、過去演出を連打しない。
- 施設一覧を `中央区 / 生活区 / 交易区 / 外縁区` のエリア方式へ整理し、将来のUI増殖に備える。

## [x] S3 — Residents & Roles

- 住民名簿を追加し、9名の固有NPCを役割付きで管理。
- 鍛冶師、商人、薬師、学者、冒険者、魔物使い、旅人、記録官、歴戦者を実装。
- 各NPCは名前・役割・加入経緯・個別加入イベント・配属施設を持つ。
- 発展だけでなく冒険クリア、仲間化、Codex観測、累計討伐実績から加入する住民を追加。
- 加入履歴 / 既読イベント / pendingイベントを `settlementBuildings.__settlement3` 配下に保存し、新しいsave rootを増やさない。
- 旧saveでは現在条件を満たす住民を加入済み・既読としてmigrationし、過去加入演出を連打しない。
- 住民の永久死亡・永久離脱処理は導入しない。

## [x] S4 — Tavern, Rumors & Local Requests

- 酒場を開拓村（集会所Lv5）で解禁。
- 賞金首/Nemesis、Abyss、Rare Codex観測、Secret Realm兆候、既存World Event情報を噂として集約。
- 通常依頼と長期依頼を、既存の冒険/Codex/Abyss実績で進行する決定的な依頼として追加。
- 報酬はGoldと既存Settlement素材のみとし、新通貨を追加しない。
- Story必須情報はランダム抽選に置かず、酒場を既存システムの情報ハブとして扱う。

## [x] S5 — Production District

- 交易町（集会所Lv10）から生産区を解禁。
- 農園、採掘場、伐採場、加工工房を既存コア施設Lvと連動する補助施設として追加。
- 保存食、調合薬、魔獣餌、建築部材の4加工品を追加し、既存4素材を手動加工して作成する。
- 加工品と加工履歴は `settlementBuildings.__settlement3.production` 配下に保存し、新しいsave root/通貨を増やさない。
- 時間経過による放置収入、毎日回収、冒険素材を置き換える自動生産は導入しない。
- 城塞都市では境界石を使う上位加工レシピを追加し、後続のRanch/探索/隠し施設/防衛へ接続できる土台を作る。

## [x] S6 — Market 2.0 & Trade Routes

- 交易町（集会所Lv10）からMarket 2.0を解禁し、既存の市場Gold倍率はそのまま維持。
- `翠葉街道 / 鉄嶺路 / 獣環道 / 境界回廊` の4交易路を追加し、冒険クリア・討伐・仲間化・Abyss到達など既存実績で発見。
- 発見した交易路は既存Settlement素材を使って明示的に安全化し、地域商人・キャラバン取引を解禁。
- 行商人の有限在庫を追加し、Gold・既存4素材・S5加工品だけで取引。新通貨や日替わり更新は追加しない。
- 交易状態は `settlementBuildings.__settlement3.market2` 配下に保存し、新しいsave rootを増やさない。
- `影市` はRare観測＋Abyss深度を要求するSecret条件に置き、通常進行必須にはしない。

## [x] S7 — Research Hall & Codex Lab

- 交易町（集会所Lv10）から研究所 / Codex Labを解禁。
- Codexの `seen` 済みエントリだけを対象に、生態分類・Affinity・Elite Affix・Rare Behavior・Boss Phaseの5研究分野へ再整理。
- 研究段階は新通貨や研究EXPではなく、実際に蓄積された観測証拠数から `未着手 → 基礎整理 → 比較研究 → 蓄積解析` と決定する。
- 敵マスターデータを研究所から直接参照せず、未遭遇エントリに内部情報が存在しても表示・集計しない。
- World Eventは既存の発生兆候/進行中イベントだけを観測し、内容や結果を先読みしない。
- Deep Surveyは `world2.discoveries` の既存解禁条件を満たした領域だけを研究ヒントへ載せ、未発見領域の名称やBoss情報を開示しない。
- 研究記録の既読段階だけを `settlementBuildings.__settlement3.research` 配下に保存し、新しいsave root・通貨・時間依存ループを増やさない。

## [x] S8 — Ranch 3.0 Integration

- 既存牧舎をMonster Ranch / Companionの統合ハブへ昇格し、Ranch 3.0用の並行育成システムは作らない。
- 個体管理では既存Companion個体から名前、種族、Lv、世代、Trait、Talent、育成方針、突然変異を読み取り、Settlement内でコンパクトに確認可能にする。
- 育成方針は既存 `trainingFocus`、配合/孵化は既存Ranch卵系統、指向配合（特殊配合）は既存Directed Inheritance、突然変異は既存Mutation APIを正本として再利用する。
- Companion 3.0の戦闘AIは別設定を新設せず、個体Natureの `COMPANION_NATURES[nature].ai`（攻勢 / 防衛 / 支援 / 均衡）をそのまま表示する。
- 牧舎Lvは既存の個体枠とRanchサブ施設の上限として維持し、訓練場・孵化場・魔物研究所・変異研究室と既存研究解禁を機能gateに利用する。
- 加入率への新しい無限加算、新通貨、新save root、日課・タイマー、Homeボタンを追加しない。

## [x] S9 — Settlement Exploration Layer

- 古井戸、共同墓地、廃屋、村外れの森、旧採掘坑、地下水路の6地点を実装。
- 既存Settlement施設Lvで段階的に発見し、Settlement内部の探索地点として扱う。
- 初回探索では小イベントと既存Settlement素材の一度きり報酬を与え、再訪だけで素材を無限獲得できないようにする。
- `repeatable` で一度きり探索と再訪可能探索を分離し、訪問回数を記録する。
- 状態は `settlementBuildings.__settlement3.exploration` 配下の `discovered / completed / visits` のみに保存し、新しいsave rootを増やさない。
- Homeボタンは増やさず、Settlement内のコンパクトな探索パネルへ統合する。

## [x] S10 — Hidden Facilities & Secret Questlines

- `鍛冶屋地下 / 封印庫 / 古代研究室 / 異界門` の4隠し施設を実装。
- S9探索完了に加えて、ガリック / イリス / オルウィン / ヴァレンなど既存住民、集会所Lv、Codex観測、Boss討伐記録を発見条件に利用する。
- `埋もれた炉火 / 石下の名簿 / 境界式の残響 / 門の向こうから` の4本の複数段階Secret Questを追加。
- 通常Secret Questの報酬は既存Settlement素材のみとし、新通貨や日課を増やさない。
- 異界門の最終段階は `secretBoss` 遭遇フック `settlementBoundaryGuardian` を生成し、戦闘処理そのものは既存BattleEngine側へ委譲できる形にする。
- 状態は `settlementBuildings.__settlement3.secrets` 配下の `facilities / questStage / completedQuests / pendingEncounters` のみに保存する。
- UIはSettlement内の折りたたみパネルへ統合し、Homeボタンを追加しない。

## [x] S11 — Defense & Invasions

- `魔物襲撃 / 盗賊襲撃 / Nemesis襲来 / 異界侵食` の4防衛イベントを実装。
- `外縁防壁 / 前哨見張り / 迎撃罠` の3防衛設備を既存素材で強化可能にする。
- 防衛設備は迎撃準備として扱い、勝敗を自動数値判定だけで完結させず既存BattleEngineへ遭遇を渡す。
- 初回撃退報酬だけを既存Settlement素材で付与し、再戦で無限farmできないようにする。
- 敗北しても既存施設Lv・住民・街の恒久状態を失わない。
- 状態は `settlementBuildings.__settlement3.defense` 配下に保存する。

## [x] S12 — Seasons, Weather & Festivals

- `春 / 夏 / 秋 / 冬`、4天候、4時間帯をゲーム内Settlement Cycleとして実装。
- 季節祭り、夜間、雨天、霧などを後続イベント条件として参照可能にする。
- 墓地夜間・雨天探索・霧探索・祭り用のhookを公開する。
- 現実時刻・日付・ログイン日数には依存せず、ゲーム内Cycleで再訪可能にする。
- 状態は `settlementBuildings.__settlement3.seasons` 配下に保存し、日課・タイマーを追加しない。

## [x] S13 — Policies, Factions & City Identity

- `交易重視 / 研究重視 / 防衛重視 / 魔物共生` の4行政方針を追加し、いつでも切替可能にする。
- `辺境商会 / 探索者連盟 / 境界学会 / 共生会` の4派閥を非排他的に管理する。
- 市場購入・研究レビュー・防衛活動など既存行動から派閥実績を積み上げる。
- 方針は報酬倍率を増やすのではなく、市場・研究・防衛など既存候補の優先表示/傾向へ反映する。
- 状態は `settlementBuildings.__settlement3.identity` 配下に保存し、取り返し不能な都市特化を作らない。

## [x] S14 — Expeditions & Away Teams

- 加入済み住民と既存Ranch/Companion個体から遠征隊を編成する。
- `近郊踏査 / 旧道測量` の短期遠征と `境界深部偵察 / 旅人捜索` の長期遠征を実装。
- 現実時間ではなくS12 Settlement Cycleで進行する。
- 帰還時は既存Settlement素材に加え、噂・地図・NPC情報・イベント兆候を恒久的な発見として持ち帰る。
- お気に入りCompanionを候補から外し、主力派遣を強制しない。
- 状態は `settlementBuildings.__settlement3.expeditions` 配下に保存する。

## [x] S15 — Endgame Network Integration

- `World Tier / World Event / Abyss / Rift / Secret Realm / Machine Realm / Deep Survey` の7系統をSettlement内の終端ネットワークへ統合表示する。
- World Tierは既存 `activeWorldTier`、World Event/Realmは既存 `world2`、Riftは既存Rift Key、Machine Realmは既存Machine World進行を正本として読む。
- Abyssは `abyssBestDepth` の深層帰還節目を境界研究室へ記録するが、帰還報告そのものから追加報酬を付与しない。
- RiftはRift Key数と境界共鳴、Secret Realmは既存Realm visibilityを門路台帳へ接続する。
- Machine Realmは既存15ステージ進行を機械解析台へ表示し、別の機界進行や倍率を作らない。
- Deep Surveyは `world2.discoveries` に基づく既存解禁判定を再利用し、S14の地図/イベント発見と地図室・遠征・研究を接続する。
- Settlement側では各モード固有のDrop / Gold / Item Power / challenge倍率を再計算・重複適用しない。
- 保存する追加状態は `settlementBuildings.__settlement3.endgameNetwork.seenAbyssReturns` の既読記録だけとする。
- UIはSettlement内のコンパクトなグリッドへ統合し、Homeボタンを追加しない。

## [x] S16 — Arena & Training Grounds

- `模擬戦 / Boss再現 / 高難度再現 / 連戦訓練` をSettlement内の訓練場から開始可能にする。
- 到達済みBossステージのwaveを再利用し、既存 `TextBattleScreen / BattleEngine / Companion Battle` をそのまま正本として使用する。
- `標準 / 退路封鎖 / 単独確認` の訓練ルールを用意し、Companion AIは既存Nature AIを変更せず実戦同等に確認する。
- 訓練中は敵撃破EXP / Gold / Drop / Manastone / Rune / Companion EXPを付与せず、Gold消費技も終了時に開始前残高へ復元する。
- 連戦は到達済みBoss群から複数Bossを選んで連続wave化し、別の戦闘計算式は作らない。
- 自己ベストはモード＋ルールごとのクリアターンのみ `settlementBuildings.__settlement3.arena` 配下に保存する。
- Arena内部Chapterは通常Story/Abyss進行番号から隔離し、既存解禁判定へ混入させない。
- UIはSettlement内の折りたたみパネルへ統合し、Homeボタンを追加しない。

## [ ] S17 — Monuments, Museum & Chronicle

- Boss討伐、Abyss記録、World Tier到達、Unique収集などを展示。
- トロフィールーム、図書館、博物館。
- 「第N世代で○○達成」などプレイ履歴を年代記化。
- Codex denominatorや既存達成率を変更せず、表示/記録レイヤーとして統合。

## [ ] S18 — Frontier Capital Endgame

- 集会所Lv20「辺境首都」。
- 古代装置、最終研究、超高難度Settlement事件。
- Lv20以降はLv21,22…の単純延長をしない。
- 追加成長はPrestige/地区発展/建築分岐など別軸を検討し、数値インフレを抑える。

## [ ] S19 — UI 4.0 + Full Integration Regression

- Homeボタン増殖を整理。
- Settlement内を「街 / 住民 / 探索 / 生産 / 研究 / 記録」等のカテゴリへ圧縮。
- スマホで入口→各施設→操作→戻るまで実機相当の導線監査。
- 旧save、Lv0、旧Lv5 MAX save、Lv20、新機能欠損saveを回帰。
- Syntax / targeted / full suite / CI greenを必須とする。

---

## Future ideas pool

ロードマップPhaseに入れる前に必要性を再評価する候補。

- 釣り場 / 怪魚Boss
- 教会 / 祠 / 呪い解除
- 宿屋の夢イベント
- 住民同士の関係・弟子入り・店継承
- 治安 / 事件 / 密輸
- 占い師による曖昧な予言
- 失踪事件の連続クエスト
- Riftによる一時的な街区異界化
- NemesisのSettlement襲撃
- Secret Realmの門を街に建てる
- 世代をまたぐ街の歴史

これらは「面白そうだから全部追加」ではなく、既存ゲームループへ戻ってくる導線が成立するものから採用する。
