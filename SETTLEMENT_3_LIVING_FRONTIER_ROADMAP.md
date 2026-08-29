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

## [ ] S2 — Settlement Rank & Visual Evolution

- 集会所節目に応じてSettlement全体の見た目・説明・雰囲気を変更。
- Lv5 / 10 / 15 / 20到達演出。
- 発展履歴を保持し、既達成演出の再発火を防ぐ。
- UIは縦長カード増殖ではなくエリア/カテゴリ方式を前提とする。

## [ ] S3 — Residents & Roles

- 住民名簿。
- 鍛冶師、商人、薬師、学者、冒険者、魔物使い、旅人など。
- NPCは「人口数値」だけでなく役割・個別イベント・施設配置を持つ。
- 特殊NPCは冒険・救出・Boss・Codex等から加入。
- 住民の永久死亡は導入しない。

## [ ] S4 — Tavern, Rumors & Local Requests

- 酒場を開拓村段階で解禁。
- 噂、賞金首、Rare目撃、Secret Realmヒント、World Event情報。
- 通常依頼と長期依頼。
- Story必須情報はランダム酒場抽選に置かない。

## [ ] S5 — Production District

- 農園、採掘場、伐採場、加工工房。
- 冒険素材を置き換える放置収入ではなく、補助供給・加工・特殊レシピ中心。
- 料理、薬、餌、建築部材などへ接続。
- 毎日回収必須の設計を避ける。

## [ ] S6 — Market 2.0 & Trade Routes

- 市場を単純Gold倍率から交易ハブへ拡張。
- 行商人、限定在庫、地域交易、キャラバン。
- 冒険で交易路を発見・安全化。
- 闇市はSecret条件で解禁し、通常進行必須にはしない。

## [ ] S7 — Research Hall & Codex Lab

- 敵種族、Affinity、Elite Affix、Rare Behavior、Boss Phase知識を研究へ接続。
- Codex観測済み情報だけを利用する。
- 未観測情報を研究施設だけで自動開示しない。
- World Event / Deep Surveyの予測・ヒント機能。

## [ ] S8 — Ranch 3.0 Integration

- 牧舎をMonster Ranch本体へ昇格。
- 個体管理、Trait、Talent、育成方針、配合、特殊配合、突然変異。
- Companion 3.0 AI方針と接続。
- 牧舎Lvは枠・育成施設・解析機能などを解禁し、加入率だけを無限に上げない。

## [ ] S9 — Settlement Exploration Layer

- 井戸、墓地、廃屋、村外れの森、採掘坑、地下水路。
- Settlement内部にも探索地点を持つ。
- 調べる → 発見 → 小イベント → 戦闘/報酬/住民加入へ繋ぐ。
- 一度きり探索と再訪可能探索を分離。

## [ ] S10 — Hidden Facilities & Secret Questlines

- 鍛冶屋地下、封印庫、古代研究室、異界門など。
- 建築Lvだけではなく特定の発見・NPC・Unique・Boss討伐で解禁。
- 複数段階のSettlement専用Secret Quest。
- Secret Bossを配置可能にする。

## [ ] S11 — Defense & Invasions

- 魔物襲撃、盗賊、Nemesis、異界侵食などの防衛イベント。
- 壁、見張り、罠など防衛施設。
- プレイヤー戦闘を中心にし、自動数値判定だけにしない。
- 敗北で建物Lv永久喪失はさせない。

## [ ] S12 — Seasons, Weather & Festivals

- 季節/天候/時間帯をSettlementイベントの条件として利用。
- 祭り、旅商人、夜の墓地、雨天限定探索など。
- 実時間依存を必須にせず、ゲーム内サイクルで再訪可能にする。

## [ ] S13 — Policies, Factions & City Identity

- 行政方針：交易 / 研究 / 防衛 / 魔物共生など。
- 派閥：商会、冒険者、学会、魔物使い等。
- 特化は切替可能にし、取り返し不能にしない。
- 数値倍率より、依頼・在庫・研究・イベント出現傾向を変える。

## [ ] S14 — Expeditions & Away Teams

- 未編成Companion / Monster / NPCを遠征へ派遣。
- 短期・長期探索。
- 結果は素材だけでなく噂、地図、NPC、イベント種を持ち帰る。
- 主力を派遣しないと損する強制設計を避ける。

## [ ] S15 — Endgame Network Integration

- World Tier：高TierでSettlement事件・依頼・研究を拡張。
- World Event：酒場/掲示板/防衛へ反映。
- Abyss：深層帰還イベント、境界研究、専用住民。
- Rift：拠点侵食、研究、門施設。
- Secret Realm：発見した領域との恒久接続。
- Machine Realm：機械工房・解析・機械系Companion。
- Deep Survey：地図室・遠征・研究へ接続。
- 各モード固有reward倍率をSettlement側で重複させない。

## [ ] S16 — Arena & Training Grounds

- 模擬戦、Boss再現、ビルド確認。
- Companion AIテスト。
- 制限戦・連戦・自己ベスト。
- 本番報酬を複製するfarm手段にはしない。

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
