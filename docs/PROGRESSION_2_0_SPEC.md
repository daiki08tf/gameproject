# Blade Vale — Progression 2.0 正式仕様案 v0.1

> Status: DESIGN / 数値調整前
>
> 目的: Blade Vale を「Lv99,999 × 継承 × ステージ固有ルーン掘り × 図鑑永続成長 × 装備ハクスラ × 仲間育成」の超長期育成RPGへ移行する。

## 0. 設計原則

1. **レベルを上げること自体に最後まで意味を持たせる。**
2. **継承は育てたキャラクターの強さを次周の素体へ変換する。**
3. **ルーンは武器の付属品ではなく、ステージ周回で掘る恒久コレクション兼ビルド資源にする。**
4. **図鑑は収集だけでなく、小さな永続成長を与える。**
5. **装備・職業・MASTER・Artifact・図鑑・ルーンは役割を分け、同じ成長を二重計上しない。**
6. **ファンタジーマスターRPGからは長期育成の考え方を参考にし、地名・敵・演出・データ構成はBlade Vale独自にする。**
7. すべての主要数値は `balance.js` / Progression設定へ集約し、ハードコードしない。

---

# 1. レベルシステム 2.0

## 1.1 上限

- キャラクターLv上限: **99,999**
- `historicalMaxLevel`: 歴代最高Lv。継承後も減少しない。
- ルーン有効容量は `historicalMaxLevel` と同値（最大99,999）。

## 1.2 重要な構造変更: キャラクターLvと職業Lvを分離

現行は `currentLevel = currentJob の level` だが、Progression 2.0では分離する。

```text
characterLevel / characterExp   = 継承対象となる本体Lv
jobLevel / jobExp               = 職業習熟・MASTER用
```

理由:
- 転職でLv99,999進行がリセット/分岐する問題を防ぐ。
- 職業MASTERと超長期レベリングを独立させる。
- 継承率・ルーン容量・敵スケーリングの基準を一意にする。

## 1.3 レベル帯

| Lv | 呼称（UI用） | 役割 |
|---:|---|---|
| 1–99 | 冒険者帯 | 基本システム習得 |
| 100–999 | 英雄帯 | ビルド形成 |
| 1,000–9,999 | 超越帯 | 継承・Rune本格化 |
| 10,000–49,999 | 神域 | 高Challenge・特殊ダンジョン |
| 50,000–99,999 | 終焉域 | 災厄・最終エンドゲーム |

## 1.4 ステータスLv成長

99,999まで現行の線形成長をそのまま延長しない。1Lvあたりの成長寄与を帯域ごとに逓減する。

初期案（調整可能）:

```text
Lv 1–100        : growth × 1.00
Lv 101–1,000    : growth × 0.50
Lv 1,001–10,000 : growth × 0.20
Lv 10,001–99,999: growth × 0.08
```

これは「Lvそのものだけで全てが決まる」ことを防ぎ、後半ほど継承・Rune・装備・図鑑の比率を上げるためのもの。

## 1.5 EXP曲線

指数爆発を避け、区間型Polynomialを採用する。v0.1では次を仮置きする。

```js
expToNext(L) = round(
  30
  + 14 * L
  + 3.0 * L ** 1.32
)
```

ただしLv帯ごとの敵EXP倍率を別途設定し、**同格コンテンツでの目標レベルアップ時間**を基準に最終調整する。

目標:
- Lv1–100: テンポ良く上がる
- Lv100–2,000: 手動攻略でも進む
- Lv2,000+: AUTO/Challenge/継承によって加速
- Lv50,000+: エンドゲーム周回前提

---

# 2. 継承システム 2.0

## 2.1 基本

継承すると:

- `characterLevel` → 1
- `characterExp` → 0
- 継承回数 +1
- 継承ステータスを計算して次周の基礎へ加算
- 継承BPを獲得
- 歴代最高Lv、Rune、図鑑、装備、職業MASTER、Artifact、仲間は保持

## 2.2 継承BP

### Lv1–1999

```text
BP = 継承回数
```

### Lv2000以上

```text
BP = (Lv - 2000) + 継承回数
```

※式計算時の「継承回数」は、継承実行前の回数を使用する（0回目の初継承を明確化）。

## 2.3 ステータス継承率

### Lv1–1999

```text
継承率(%) = Lv / 200 + 継承回数
```

### Lv2000以上

```text
継承率(%) = Lv / 100 + 継承回数
```

Lv1999→2000で大きなブレイクポイントが発生する。これは意図したゲームデザインとする。

例（継承0回）:

| Lv | 継承率 | BP |
|---:|---:|---:|
| 100 | 0.50% | 0 |
| 1,000 | 5.00% | 0 |
| 1,999 | 9.995% | 0 |
| 2,000 | 20.00% | 0 |
| 5,000 | 50.00% | 3,000 |
| 10,000 | 100.00% | 8,000 |
| 50,000 | 500.00% | 48,000 |
| 99,999 | 999.99% | 97,999 |

## 2.4 継承対象

**対象:**
- キャラクターLv由来の基礎ステータス
- 過去の継承ステータス
- 継承BPで直接割り振った基礎ステータス

**対象外:**
- 装備
- 武器Affix
- 職業補正
- MASTER効果
- 覚醒
- Artifact
- Codex
- Rune
- 仲間
- 一時Buff/Debuff

これにより「装備を着けて継承→装備分を基礎へコピー→同じ装備を再装備」という二重取りを防ぐ。

## 2.5 BP自由振り

BPはHP / MP / ATK / DEF / MAG / SPDへ割り振る。

初期案:

```text
1 BP = HP +2
1 BP = MP +1
1 BP = ATK +1
1 BP = DEF +1
1 BP = MAG +1
1 BP = SPD +0.2
```

UIには `+1 / +10 / +100 / +1000 / MAX / リセット` を用意する。

---

# 3. ステータス計算レイヤー

Progression 2.0では計算順を明示する。

```text
A. Character Base
   Lv成長 + 過去継承 + BP

B. Equipment Flat
   武器/防具/強化など

C. Permanent Multipliers
   職業MASTER / 覚醒 / Artifact / Codex

D. Affix Layer

E. Rune Final Multiplier

F. Combat Temporary
   Buff / Debuff / ステージModifier
```

Runeは原則として**装備や職業MASTER等を含めた値に最後から乗算**する。

---

# 4. Rune 2.0

## 4.1 現行Runeからの変更

現行:
- 武器スロットへ装着
- ステータスRuneはクラフト
- Boss効果Runeを装備

新Rune:
- **武器から完全分離**
- **特定ステージのクリア報酬として低確率ドロップ**
- 獲得するとRuneごとの「所持刻数」が永久+1以上
- 継承しても保持
- Runeインベントリではなく `runeMarks[runeId] = count`

旧RuneはMigration対象とし、既存セーブを破壊しない。変換率は実装PR前に確定する。

## 4.2 所持刻数と有効刻数

```text
ownedMarks  = 掘って獲得した総数（原則上限なし）
activeMarks = 現在有効化している数
capacity    = historicalMaxLevel（最大99,999）
```

```text
sum(activeMarks) <= capacity
activeMarks[rune] <= ownedMarks[rune]
```

例:

```text
歴代最高Lv 5,000
Rune容量 5,000

所持:
剛撃 2,800
鉄壁 1,900
百烈 900
強欲 450

有効:
剛撃 2,000
鉄壁 1,500
百烈 1,000 (所持不足なので実際は900まで)
強欲 600 (所持不足なので実際は450まで)
```

## 4.3 Rune倍率

同一Rune内では刻数を**加算%**としてまとめ、その後1つの倍率として適用する。

例: 剛撃1刻 = 物理ATK +5%

```text
剛撃1刻   => ×1.05
剛撃10刻  => ×1.50
剛撃100刻 => ×6.00
```

`1.05^刻数` ではない。

Lv99,999世界のインフレを許容する一方、Damage Reduction / Crit / Evasion等は既存CAPを尊重する。

## 4.4 Rune候補 v0.1

| Rune | English | 1刻効果 / 段階効果 | ★ライン | 入手テーマ |
|---|---|---|---:|---|
| 剛撃 | Force | 物理ATK +5% | なし | 序盤/武人系 |
| 鉄壁 | Ironclad | DEF +5% | なし | 重装/城塞系 |
| 賢者 | Wisdom | MAG +5% | なし | 魔晶/術師系 |
| 不倒 | Undying | 最大HP +5% | なし | 巨獣/生命系 |
| 精神 | Spirit | 最大MP +5% | なし | 魔術/精神系 |
| 鷹目 | Hawkeye | 命中性能 +1%（元値乗算） | なし | 狩猟/遠距離系 |
| 幻影 | Mirage | 回避性能 +1%（元値乗算） | なし | 亡霊/影系 |
| 祝福 | Blessing | 回復量/回復速度系 +5% | なし | 聖域/生命系 |
| 百烈 | Hundredfold | 行動速度強化 | 500★ | 雷/修練系 |
| 絶壁 | Bulwark | Damage Reduction +0.2pt | なし | 機城/守護系 |
| 強欲 | Greed | 50刻ごとに最低Drop品質段階UP | 特殊 | 腐緑/財宝系 |
| 黄金 | Gilded | Gold獲得強化 | 2000★ | 金脈/商都系 |
| 挑戦 | Challenge | 100刻ごとChallenge Lv+1 | 2000★ | 試練系 |
| 観察 | Insight | 敵情報を段階解禁 | 500★ | 知識/研究系 |
| 縁 | Bond | 仲間加入率/仲間EXPを段階強化 | 1000★ | 魔獣系 |
| 匠 | Artisan | Affix/装備品質を段階強化 | 1000★ | 武庫/鍛冶系 |
| 運命 | Fate | Legendary/Unique/希少遭遇を微強化 | 1000★ | 蝕刻/超高難度 |

※名称・数値はBlade Vale内での実装時に最終レビューする。

## 4.5 ★の意味

★は「Runeの最大値」ではない。

- ★ライン到達で特殊効果/上限突破/完全AUTO等を解禁
- それ以降も所持刻数・有効刻数を増やせる

## 4.6 ステージ固有ドロップ

各Runeには `dropSources` を持たせる。

```js
{
  runeId: 'rune_mirage',
  stageIds: ['11-3', '11-5'],
  baseChance: 0.03,
  baseMarks: [1, 1]
}
```

基本:
- 通常Rune: 3–5%
- 中級Rune: 1–3%
- Rare Rune: 0.25–1%
- Bossは追加抽選枠を持てる
- Elite撃破でRune抽選補正
- Challengeで確率/獲得刻数を増やす
- 蝕刻中はさらに補正

## 4.7 周回量問題への対策

99,999刻を+1・1%だけで掘る設計にはしない。

高難度ではドロップ時の獲得刻数を増やす。

初期案:

```text
Challenge Lv 0–4   : +1刻
Challenge Lv 5–9   : +1〜2刻
Challenge Lv 10–19 : +1〜3刻
Challenge Lv 20–49 : +2〜5刻
Challenge Lv 50+   : +3〜10刻 + 高難度補正
```

さらに特殊ダンジョン・蝕刻・Bossで別倍率を持たせる。

---

# 5. Challenge

挑戦Rune100刻ごとにChallenge Lv+1。

v0.1案:

```text
enemyLevelMult = 1 + 0.10 * ChallengeLv
enemyHpMult    = 1 + 0.10 * ChallengeLv
enemyAtkMult   = 1 + 0.05 * ChallengeLv
expMult        = 1 + 0.10 * ChallengeLv
goldMult       = 1 + 0.05 * ChallengeLv
runeDropBonus  = +2% relative per ChallengeLv
rareBonus      = +1% relative per ChallengeLv
```

※「relative」は基本確率への乗算補正。絶対+2ポイントではない。

高継承キャラが旧ステージを周回する際にも意味を持たせる。

---

# 6. Codex 2.0

## 6.1 個体ごとの達成

各モンスター:

- 遭遇
- 初撃破
- 10体撃破
- 100体撃破
- 仲間化
- Rare以上仲間化
- Legendary仲間化

達成ごとに小さな永続ボーナスを与える。

例:

```text
初撃破       HP +1
10体撃破     ATK +1
100体撃破    DEF +1
仲間化       MAG +1
Rare         SPD +0.2
Legendary    種族固有Codex Passive解禁
```

数値は全モンスター数が確定してから総量を逆算する。

## 6.2 全体完成度

初期案:

| 完成度 | 報酬 |
|---:|---|
| 10% | HP +1% |
| 25% | ATK/MAG +1% |
| 50% | 全ステ +1% |
| 75% | EXP +10% |
| 90% | Rare Encounter微増 |
| 100% | 称号 + 固有Passive + 継承BP +10%候補 |

CodexはRuneほど強い乗算源にしない。「小さいが永久」が役割。

---

# 7. 第2部ステージ方針（オリジナル）

Progression 2.0実装後に追加する。

| 章 | エリア | 戦闘テーマ | 主Rune候補 |
|---:|---|---|---|
| 11 | 灰冠の旧都 | 不死・高DEF・復活 | 幻影 |
| 12 | 天雷の浮島 | SPD・先制・連撃 | 百烈 |
| 13 | 蒼晶深層 | MAG・MP吸収・魔法反射 | 精神 / 賢者 |
| 14 | 腐緑の樹海 | 毒・DoT・回復阻害 | 祝福 / 強欲(Rare) |
| 15 | 黒鉄機城 | 超DEF・Armor Pen・状態耐性 | 絶壁 / 匠(Rare) |

固有名詞・敵・BossはBlade Valeオリジナルで作成する。

---

# 8. AUTO / QoL

Lv99,999 + Rune周回ではAUTOは必須。

方針:
- 基本AUTO戦闘はQoLとして標準解禁候補
- RuneによるAUTO強化は「高度な自動化」に使う

例:

```text
AUTO標準     : 1戦の自動戦闘
Rune段階1    : スキルAI
Rune段階2    : 同一ステージ再挑戦
Rune段階3    : 回復/休憩自動
Rune段階4    : Loot Filter/自動売却
Rune段階5    : Scout方針自動化
```

QoLを取るためだけに大量Runeを要求しない。

---

# 9. セーブMigration

新規保存候補:

```js
characterLevel: 1,
characterExp: 0,
historicalMaxLevel: 1,
inheritanceCount: 0,
inheritedStats: { hp:0, mp:0, atk:0, def:0, mag:0, spd:0 },
inheritanceBonusPoints: 0,
inheritedBonusStats: { hp:0, mp:0, atk:0, def:0, mag:0, spd:0 },
runeMarksOwned: {},
runeMarksActive: {},
codex2: {},
```

既存セーブMigration原則:
- 現在職Lv → 初回 `characterLevel`
- 現行 `reincarnations` → `inheritanceCount` へ変換候補（ただし旧+3%転生との価値差があるため補償設計必須）
- 現行武器Runeは消さない。Rune 2.0への交換/変換を行う
- Migration前後で装備・仲間・図鑑・進行を失わない

---

# 10. 実装ロードマップ

## PR-A: Progression Core
- global characterLevel / characterExp
- Lv99,999 cap
- historicalMaxLevel
- number formatter (K/M/B/T...)
- jobLvとの分離
- Migration

## PR-B: Growth & Inheritance 2.0
- Piecewise stat growth
- 継承率/BP
- inheritedStats
- BP振りUI
- 継承Preview

## PR-C: Rune 2.0 Data/Migration
- weapon Runeから分離
- owned/active/capacity
- Rune画面
- 旧Rune変換

## PR-D: Rune Stage Drops
- stage dropSources
- クリア時Rune抽選
- NEW RUNE演出
- ★進捗
- Rune Codex

## PR-E: Codex 2.0
- kill/recruit/rarity milestones
- permanent bonus
- completion rewards

## PR-F: Balance Simulation & Regression
- Lv checkpoints
- 継承0/5/20回
- Rune 0/100/1000/10000
- Challenge
- 1000+ battle simulations
- save migration regression

## PR-G以降
- 第11〜15章
- Companion 2.0
- 特殊ダンジョン
- Equipment 2.0
- Skill Tree
- 蝕刻
- 災厄(World Boss)

---

# 11. 実装前に確定が必要な項目

1. EXP曲線の最終値
2. Lv帯別stat growth倍率
3. Rune各効果の1刻倍率
4. Rune drop率とChallenge時の刻数
5. 継承率に上限を設けるか（現案: 設けない）
6. Lv99,999継承時の約1000%継承を意図したインフレとして許容するか（現案: 許容）
7. 旧転生回数/旧RuneのMigration補償
8. Codex全種類数を前提とした永続ボーナス総量

この文書と `scripts/progression2-sim.mjs` を数値調整の一次資料とする。
