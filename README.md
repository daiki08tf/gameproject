# Blade Vale

スマホブラウザで遊べる、**テキストコマンド戦闘 × 長期育成 × ハック＆スラッシュ**RPGです。

装備を掘り、職業・仲間・覚醒・恒久成長を育てながらストーリーと複数のエンドゲームへ進みます。Character Lvは最大99,999。Vanilla JavaScript / ES Modulesで動作し、外部ゲームライブラリは不要です。

> **開発時に「どこを読めば何が分かるか」を探す場合は、最初に `PROJECT_GUIDE.md` を参照してください。**
> 開発の正式な方針・現在地は `ROADMAP.md`、World 4.0 / Living Adventure は `ADVENTURE_WORLD_4_ROADMAP.md`、Lv99,999の進行設計は `LEVEL_ROADMAP_99999.md`、Official Phase 10の最終監査は `PHASE10_FINAL_AUDIT.md` が基準・補助資料です。

## 起動方法

ES Modulesを使用しているため、`file://` ではなくローカルサーバー経由で起動してください。

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く
```

## 基本ゲームループ

1. キャラクター・装備・職業・仲間などを整える
2. Adventureから章・地域・ステージへ進む
3. テキストコマンドで敵の行動・弱点・Break・Boss Phaseに対応する
4. EXP / Job EXP / Gold / 装備 / 各種成長報酬を獲得する
5. ビルドを更新する
6. ストーリー、Key/Secret系コンテンツ、Abyss、Nemesisなどへ進む

敗北しても、それまでに得た成長や戦利品を使って再挑戦できます。

## 戦闘

戦闘はテキストベースのコマンドバトルです。

- 通常攻撃
- 職業固有の特技
- MPを使う呪文
- 防御 / 敵Intentへの対応
- バフ / デバフ / 回復 / 状態異常
- 属性 / 弱点 / 耐性
- Break / Stagger
- ボスPhase / 取り巻き / Guard役
- 武器・装備・Artifact等の特殊効果
- 仲間による戦闘支援

Combat 3系のBoss Encounterでは、主要Bossを単なる高HP敵ではなく、Phase変化・守護役・Break窓・危険行動を持つEncounterとして扱います。

## ワールド / ストーリー

現在のリポジトリには**第1章〜第25章の章データ**があります。

- **Ch1–15**：コアとなる第一部の旅
- **Ch16–20**：The Veil
- **Ch21–25**：外縁世界 / 次章アークの既存データ

Ch21–25までデータが存在することと、Adventure / Story 3.0として全編の演出・世界観統合が完了していることは別です。Official Roadmap Phase 11で、Human Realm → Heaven → Underworld → Dimensional Boundary → Modern Worldの一本の物語として統合します。

World3 Realms、Secret Realms、Key/Rift、Machine World、地域探索・Masteryなど、通常章以外の世界コンテンツも存在します。

## キャラクター成長 — Progression 3.0

- **Character Lv**：最大99,999
- **Job Lv**：Character EXPとは別のJob EXPで成長
- Lv1〜99,999を章・The Veil・Abyss・EX Bounty・Nemesis・高難度世界へ接続
- Awakening milestone：Lv90 / 300 / 700 / 3,000
- 大きな数値は `numericSafety` を含む安全策とシミュレーションで監視

現在の正規EXPカーブ・章進行・Abyss到達目標は `LEVEL_ROADMAP_99999.md` と実装コードが基準です。

## 職業

56職の基盤があります。

- 基本職：15種
- 上級職：30種
- 特級職：10種
- 勇者：1種

職業ごとにステータス傾向、得意武器、特技・呪文、MASTER時の永続要素などが異なります。Specialization、Legacy/Master系パッシブ、Secret Jobs、Job Codex、Fusion/Constellation系の拡張もあります。

## 装備 / ハクスラ

主要装備枠は武器・盾・頭・胴・アクセサリー×2。

Equipment 3系では以下を含むハクスラ基盤があります。

- Affix / Greater Affix
- Legendary / Unique / Set
- Smart Loot
- Craft / Reforge / Blacksmith
- endgame chase / target farm
- Item Powerを含む進行連携
- compact inventory UI

Official Roadmapでは今後、Loot Filter、安全なAuto Dismantle、delta中心のItem Compare、Build Loadoutを既存システムのQoLとして追加します。

## 仲間 / Monster Ranch

- 種族・個体差・レアリティ
- 性格 / Trait
- スキル / 進化
- 最大3体のParty
- Synergy / Bond
- Breeding / Mutation
- Ranch facilities
- compact Ranch UI

今後は役割の読みやすさと、ExpeditionをWorld/素材/探索へつなぐ改善を予定しています。

## Codex

モンスターや発見情報を収集するCodexがあります。戦闘・仲間・発見と連動し、未知情報は最初から全開示しない方針です。

Story 3.0ではCodex Loreを世界設定・異世界/現代世界の謎を運ぶ仕組みとして強化する予定です。

## Awakening / Inheritance / Artifact・Relic

Awakeningは長期成長の節目、Inheritanceは周回成長の継承、Artifact/Relicはビルドルールを変える恒久・付替え要素として扱います。旧来の重複システムは新しい並行システムを増やすのではなく、整理・統合する方針です。

## Abyss / Endgame

Abyssは**所定のストーリー進行条件を満たすと解放**されます。旧READMEにあった「第10章ボス撃破だけで解放」という説明は現在の実装を正確に表していません。

AbyssにはPacts、Challenges、Routes、Run Build、長期深度成長、target farm等があります。さらにNemesis、World Tier、EX Bounty、Machine Worldなどが長期進行を構成します。

Official Roadmap Phase 10の監査では、Abyss / Nemesis / World Tier / transcendent-world role / Challenge Boss roleは既存実装で満たし、**Raid Boss integrationが最後の実装ギャップ**と判定しています。

## Settlement

Settlementのfoundation / runtime / UIがあります。Blacksmith、Monster Ranchなど既存機能をBase側へまとめ、Homeのトップレベルボタン増殖を防ぐ接続ハブとして育てます。

## UI方針

Blade Vale 3.0ではMobileを主対象にします。

- Homeを機能ボタンの縦長リストにしない
- common actionはおおむね3 taps以内
- **Overview → Detail**を標準にする
- 長文・全Affix・全Traitを一覧カードへ常時展開しない
- Equipment / Ranch / Codex / Jobsは100+件でも扱えるfilter/category構造にする
- 新機能のためだけのHome buttonを原則増やさない
- generic emoji依存を最終的にpixel/icon setへ置き換える

## セーブ

進行データはブラウザの `localStorage` に自動保存されます。

現時点の開発優先はBlade Vale 3.0本体の完成であり、Cloud Save / native app化はOfficial Roadmapには入れていません。

## 技術構成

- Vanilla JavaScript
- ES Modules
- HTML / CSS
- Web Audio API
- external game libraryなし
- Node.js回帰テスト
- GitHub Actions CI

主な構成：

```text
index.html                         画面構造
css/                               UI styles
js/main.js                         画面遷移・event wiring
js/state.js                        player state / save / progression state
js/battleEngine.js                 text-command combat core
js/battleLog.js                    battle log
js/data/chapters.js                Ch1–15 core chapter data
js/data/chapters16to20.js          The Veil
js/data/chapters21to25.js          Ch21–25 expansion data
js/data/bossEncounters.js          phase/escort/Break boss profiles
js/data/world3Realms.js            World3 realm layer
js/data/phase9MachineWorld.js      Machine World
js/data/jobs.js                    56-job foundation
js/data/equipment3*.js             Equipment 3 systems
js/data/uniqueTrials.js            Unique mastery/build trials
js/data/abyss*.js                  Abyss/endgame systems
js/data/nemesis3.js                Nemesis
js/data/worldTiers.js              World Tier
js/data/endgameGuidance.js         current endgame NEXT guidance
js/data/numericSafety.js           large-number safety helpers
js/patches/                        integration/runtime layers
js/screens/                        screen UI
scripts/                           simulations/validation
tests/                             regression tests
```

## 開発方針

Blade Valeは短時間で終わる一本道RPGではなく、装備厳選・Job・仲間・覚醒・探索・Abyssなどがつながって長期間キャラクターを育てられるテキストハクスラRPGを目指します。

これからは「新しいシステムの数」より、**既存システム同士が一つのゲームとして意味を持ってつながっているか**を優先します。

大きな作業は原則として：

**実装 → automated tests → balance/simulation where relevant → CI → main → next phase**

の順で進めます。
