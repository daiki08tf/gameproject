# Settlement 3.0 — Living Frontier Roadmap

## Vision
開拓拠点を「素材を払って数値を上げる画面」から、ゲーム全体を束ねる第二の本編へ育てる。

> 冒険する → 素材・人・情報・発見を持ち帰る → 拠点が変化する → 新しい遊びが開く → その遊びが次の冒険先を生む

## Non-negotiable contracts
- 既存Settlement 1.0 save互換。
- 基礎経済は `wood / ore / hide / veilstone`。
- 既存5施設 `hall / inn / market / watch / ranch` を維持。
- Lv1–5互換、Lv6以降の数値効果は逓減、全コア施設上限Lv20。
- Storyをランダムイベント必須にしない。
- 永久ロスト・取り返し不能特化・日課を基本設計にしない。
- Homeボタンを無制限追加しない。
- Enemy / Companion / Reward / World Tier倍率を二重適用しない。

## Long-term facility progression
| 集会所Lv | 拠点段階 |
|---:|---|
| 0–4 | 開拓地 |
| 5–9 | 開拓村 |
| 10–14 | 交易町 |
| 15–19 | 城塞都市 |
| 20 | 辺境首都 |

Numeric taper: Lv1–5 1.0x / Lv6–10 0.5x / Lv11–15 0.25x / Lv16–20 0.125x contribution per Lv. Lv20以降は施設Lvを延長しない。

# Implementation phases

## [x] S0 — Current Settlement Audit
既存5施設・4素材・save・集会所gateを監査。
## [x] S1 — Facility Level 2.0 Foundation
施設上限Lv20、旧Lv1–5互換、後半逓減。
## [x] S2 — Settlement Rank & Visual Evolution
Lv5/10/15/20の発展段階とエリア表示。
## [x] S3 — Residents & Roles
9名の固有住民と役割・加入履歴。
## [x] S4 — Tavern, Rumors & Local Requests
既存実績を使う酒場・噂・依頼。
## [x] S5 — Production District
既存素材による生産区・加工品。
## [x] S6 — Market 2.0 & Trade Routes
4交易路・有限在庫・影市。
## [x] S7 — Research Hall & Codex Lab
seen済みCodex証拠だけを使う研究所。
## [x] S8 — Ranch 3.0 Integration
既存Monster Ranch / CompanionをSettlementへ統合。
## [x] S9 — Settlement Exploration Layer
6地点の街内探索と一度きり報酬。
## [x] S10 — Hidden Facilities & Secret Questlines
4隠し施設・4Secret Quest・遭遇hook。
## [x] S11 — Defense & Invasions
3防衛設備・4侵攻イベント・既存戦闘hook。
## [x] S12 — Seasons, Weather & Festivals
ゲーム内Cycleによる季節・天候・時間帯・祭り。
## [x] S13 — Policies, Factions & City Identity
4行政方針・4派閥、非排他的で切替可能。
## [x] S14 — Expeditions & Away Teams
住民/Companion遠征、S12 Cycle進行。
## [x] S15 — Endgame Network Integration
World Tier / Event / Abyss / Rift / Secret Realm / Machine Realm / Deep Survey統合表示。
## [x] S16 — Arena & Training Grounds
既存BattleEngineを再利用した無報酬訓練・Boss再現・連戦。
## [x] S17 — Monuments, Museum & Chronicle
- Boss討伐、Abyss最高到達、World Tier、所有Uniqueを展示。
- Arena訓練Bossを実績から除外し、既存正本だけを読む。
- `inheritanceHistory` に実在する継承履歴だけを年代記化し、過去実績の世代を捏造しない。
- Codex denominatorや既存達成率を変更せず、新save rootも追加しない。
- Settlement内のトロフィールーム / 博物館 / 年代記としてコンパクト表示。

## [x] S18 — Frontier Capital Endgame
- 集会所Lv20で「辺境首都」終端レイヤーを解禁。
- `古代境界中継機 / 最終研究書庫 / 首都防衛環` の3首都計画を実装。
- 計画条件はS15 Endgame Network、S7 Research、S11 Defenseなど既存実績を参照し、別の成長通貨を作らない。
- 3計画完了＋Abyss 100F＋World Tier到達を条件に超高難度Settlement事件 `境界収束災害` を解禁。
- 事件はpending encounter hookだけを生成し、勝敗・戦闘計算を独自実装しない。
- 状態は `settlementBuildings.__settlement3.capital` 配下の計画完了・事件状態だけを保存。
- Lv21,22…へ施設Lvを延長せず、首都計画という横方向のPrestige/地区発展軸にする。
- 新通貨・報酬倍率・タイマー・日課・Homeボタンを追加しない。

## [ ] S19 — UI 4.0 + Full Integration Regression
- Homeボタン増殖を整理。
- Settlement内を「街 / 住民 / 探索 / 生産 / 研究 / 記録」等のカテゴリへ圧縮。
- スマホで入口→各施設→操作→戻るまで実機相当の導線監査。
- 旧save、Lv0、旧Lv5 MAX save、Lv20、新機能欠損saveを回帰。
- Syntax / targeted / full suite / CI greenを必須とする。

---
## Future ideas pool
釣り場 / 教会・祠 / 宿屋の夢 / 住民関係 / 治安事件 / 占い / 失踪事件 / Rift街区異界化 / Nemesis襲撃 / Secret Realm門などは、既存ゲームループへ戻る導線が成立するものだけ将来採用する。
