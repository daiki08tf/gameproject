# Phase 8 — Job Fusion / Skill Constellation 3.0

Status: DESIGN DRAFT — implementation source of truth

## Core rule

Blade Valeの15基本職は、異なる基本職2種をMASTERすると、その組み合わせ固有の上級職を解放する。

- 基本職: 15
- 2職の順序は区別しない
- 組み合わせ総数: 15C2 = 105
- 上級職は105組すべて用意する
- 既存上級職は可能な限り105枠へ統合し、セーブ互換を優先する
- 特級職は上級職同士の全組み合わせにはしない。意味のある進化のみ厳選する
- Secret Jobは通常のFusion則の外側に置く

## Skill Constellation方針

- 基本職は育成中から小型星盤を持つ
- MASTERで外周のMASTER Starが点灯する
- 2つのMASTER Starが接続するとFusion Jobを発見する
- Fusion Jobの星盤は親2職のIdentityを継承しつつ固有Fusion Traitを持つ
- Specializationは別画面にせず星盤の大分岐そのものにする
- Keystone / Ultimateは外周の大ノードとして配置する
- 数値だけのノードを乱造せず、行動・Resource・Break・Combo・属性・状態異常などBattle 3.0のルールを変える効果を優先する

## Naming rule

職名は「親職名を機械的に足した名前」を避け、RPG職として単独で成立する名称を優先する。

今回確定する改名:

- 戦士 × 武闘家: 闘将 → **羅刹**
- 戦士 × 商人: 重商騎士 → **傭兵団長**
- 武闘家 × 商人: 賞金闘士 → **剣闘士**
- 僧侶 × 商人: 施療商 → **聖務官**
- 盗賊 × 学者: 探究盗賊 → **トレジャーハンター**
- 商人 × 忍者: 密売人 → **影商人**

## 105 Fusion Jobs — rough matrix

| # | Parent A | Parent B | Fusion Job | Core Identity |
|---:|---|---|---|---|
| 1 | 戦士 | 武闘家 | 羅刹 | Rage / Counter / melee Combo |
| 2 | 戦士 | 魔法使い | 魔法剣士 | Element imbue / elemental Break |
| 3 | 戦士 | 僧侶 | パラディン | Guard / Faith / holy counter |
| 4 | 戦士 | 盗賊 | 傭兵 | Break / Crit / follow-up |
| 5 | 戦士 | 商人 | 傭兵団長 | Gold / supply / frontline command |
| 6 | 戦士 | 狩人 | 魔獣騎士 | Mark / anti-large / frontline |
| 7 | 戦士 | 忍者 | 影武者 | Guard / evade / counter |
| 8 | 戦士 | 吟遊詩人 | 戦歌騎士 | frontline / Song / party buff |
| 9 | 戦士 | 踊り子 | 剣舞士 | Guard / Dance / Combo |
| 10 | 戦士 | 錬金術師 | 錬装騎士 | weapon augment / explosive / armor Break |
| 11 | 戦士 | 学者 | 戦術士 | analysis / intent / optimal defense |
| 12 | 戦士 | 農民 | 守土兵 | endurance / grit / sustain |
| 13 | 戦士 | 大工 | 城塞騎士 | Barrier / Cover / fortress defense |
| 14 | 戦士 | 占い師 | 運命騎士 | prediction / counter / Crit reversal |
| 15 | 武闘家 | 魔法使い | 魔闘士 | elemental fist / Arcane Combo |
| 16 | 武闘家 | 僧侶 | 羅漢 | self-heal / ki / Combo |
| 17 | 武闘家 | 盗賊 | 拳盗士 | Combo / Crit / speed |
| 18 | 武闘家 | 商人 | 剣闘士 | wager / victory reward / crowd momentum |
| 19 | 武闘家 | 狩人 | 獣闘士 | monster hunt / part Break |
| 20 | 武闘家 | 忍者 | 修羅 | extreme Combo / evade |
| 21 | 武闘家 | 吟遊詩人 | 鼓舞闘士 | Combo / tempo / buff |
| 22 | 武闘家 | 踊り子 | 舞闘家 | evade / Combo / rhythm |
| 23 | 武闘家 | 錬金術師 | 錬体士 | consumable self-buff / Overdrive |
| 24 | 武闘家 | 学者 | 拳理士 | analysis / precision strike |
| 25 | 武闘家 | 農民 | 豪傑 | grit / low-HP burst |
| 26 | 武闘家 | 大工 | 鉄拳工 | Guard counter / smash |
| 27 | 武闘家 | 占い師 | 星拳士 | Crit chain / fate Combo |
| 28 | 魔法使い | 僧侶 | 賢者 | Arcane / Faith / hybrid casting |
| 29 | 魔法使い | 盗賊 | 魔導暗殺者 | spell Crit / fast cast |
| 30 | 魔法使い | 商人 | 魔晶商 | MP / Gold conversion |
| 31 | 魔法使い | 狩人 | 魔弓士 | elemental shot / weakness snipe |
| 32 | 魔法使い | 忍者 | 忍術師 | element / status / concealment |
| 33 | 魔法使い | 吟遊詩人 | 詠唱楽師 | Spell / Song interaction |
| 34 | 魔法使い | 踊り子 | 幻術舞師 | illusion / element / evade |
| 35 | 魔法使い | 錬金術師 | 錬成魔導師 | elemental reaction chain |
| 36 | 魔法使い | 学者 | 大魔導研究家 | analysis / Arcane specialization |
| 37 | 魔法使い | 農民 | 自然術師 | earth / plant / regeneration |
| 38 | 魔法使い | 大工 | 魔導工匠 | magical Barrier / constructs |
| 39 | 魔法使い | 占い師 | 星術師 | stars / fate / element |
| 40 | 僧侶 | 盗賊 | 異端審問官 | Debuff / holy execution |
| 41 | 僧侶 | 商人 | 聖務官 | offering Gold/Faith / heal / blessing |
| 42 | 僧侶 | 狩人 | 聖猟師 | monster bane / purification |
| 43 | 僧侶 | 忍者 | 退魔忍 | seal / anti-dark / fast support |
| 44 | 僧侶 | 吟遊詩人 | 聖歌師 | Song / party heal |
| 45 | 僧侶 | 踊り子 | 巫女 | Dance / cleanse / blessing |
| 46 | 僧侶 | 錬金術師 | 薬師 | potion / cleanse / recovery |
| 47 | 僧侶 | 学者 | 神学者 | analysis / blessing optimization |
| 48 | 僧侶 | 農民 | 豊穣司祭 | Regen / vitality / sustain |
| 49 | 僧侶 | 大工 | 神殿守 | Barrier / ward / defense |
| 50 | 僧侶 | 占い師 | 神託師 | prediction / Faith manipulation |
| 51 | 盗賊 | 商人 | 闇商人 | Steal / Gold / special Drop |
| 52 | 盗賊 | 狩人 | 追跡者 | Mark / weakness / ambush |
| 53 | 盗賊 | 忍者 | 暗殺者 | poison / Crit / execution |
| 54 | 盗賊 | 吟遊詩人 | トリックスター | Debuff / provoke / disruption |
| 55 | 盗賊 | 踊り子 | 幻影盗賊 | evade / Combo / illusion |
| 56 | 盗賊 | 錬金術師 | 毒術師 | poison / necrosis / trap |
| 57 | 盗賊 | 学者 | トレジャーハンター | Codex / trap / rare discovery |
| 58 | 盗賊 | 農民 | 野伏 | survival / trap / Drop |
| 59 | 盗賊 | 大工 | 罠師 | deployable trap / counter |
| 60 | 盗賊 | 占い師 | 詐術師 | Crit manipulation / fate reversal |
| 61 | 商人 | 狩人 | 交易猟師 | trophy / target farming / Gold |
| 62 | 商人 | 忍者 | 影商人 | Gold / poison / covert trade |
| 63 | 商人 | 吟遊詩人 | 興行師 | Gold / buff / audience momentum |
| 64 | 商人 | 踊り子 | 旅芸商 | Gold Combo / evade support |
| 65 | 商人 | 錬金術師 | 錬金商 | craft / consumable economy |
| 66 | 商人 | 学者 | 鑑定士 | equipment appraisal / Loot quality |
| 67 | 商人 | 農民 | 豪農 | material / Gold / endurance |
| 68 | 商人 | 大工 | 工房主 | craft / repair / combat tools |
| 69 | 商人 | 占い師 | 相場師 | luck / Gold / Drop variance |
| 70 | 狩人 | 忍者 | 影狩人 | Mark / poison / rapid attack |
| 71 | 狩人 | 吟遊詩人 | 狩猟楽師 | Mark / Song / party focus |
| 72 | 狩人 | 踊り子 | 風弓舞 | mobility / rapid shot / evade |
| 73 | 狩人 | 錬金術師 | 魔弾師 | elemental / poison / explosive ammo |
| 74 | 狩人 | 学者 | 魔物学者 | Species analysis / monster bane |
| 75 | 狩人 | 農民 | 開拓猟師 | survival / material / beast hunt |
| 76 | 狩人 | 大工 | 機巧弓師 | crossbow / trap / deployable weapon |
| 77 | 狩人 | 占い師 | 星狩人 | accuracy / Crit prediction / Mark |
| 78 | 忍者 | 吟遊詩人 | 影奏者 | tempo / clone / support |
| 79 | 忍者 | 踊り子 | 幻舞忍 | evade / status / Combo |
| 80 | 忍者 | 錬金術師 | 煙術師 | poison smoke / explosive / stealth |
| 81 | 忍者 | 学者 | 忍軍師 | intent analysis / ambush |
| 82 | 忍者 | 農民 | 草忍 | camouflage / poison / survival |
| 83 | 忍者 | 大工 | 絡繰忍 | trap / clone / mechanism |
| 84 | 忍者 | 占い師 | 星影 | prediction / evade / lethal Crit |
| 85 | 吟遊詩人 | 踊り子 | 芸聖 | Song + Dance synthesis |
| 86 | 吟遊詩人 | 錬金術師 | 音響錬成師 | buff reaction / amplification |
| 87 | 吟遊詩人 | 学者 | 伝承学者 | Codex / Song / knowledge buff |
| 88 | 吟遊詩人 | 農民 | 牧歌詩人 | Regen / companion support |
| 89 | 吟遊詩人 | 大工 | 楽器工匠 | deployable Song / crafted instruments |
| 90 | 吟遊詩人 | 占い師 | 星詠み | Song / prophecy / probability |
| 91 | 踊り子 | 錬金術師 | 香術舞師 | potion mist / Status / Dance |
| 92 | 踊り子 | 学者 | 戦舞研究家 | Combo analysis / weakness Dance |
| 93 | 踊り子 | 農民 | 豊穣舞姫 | Regen / evade / vitality buff |
| 94 | 踊り子 | 大工 | 機巧舞師 | puppet / mechanism / Combo |
| 95 | 踊り子 | 占い師 | 運命舞姫 | evade / Crit / fate manipulation |
| 96 | 錬金術師 | 学者 | 真理探究者 | reaction / analysis / synthesis |
| 97 | 錬金術師 | 農民 | 薬草錬金師 | material / potion / poison |
| 98 | 錬金術師 | 大工 | 機工錬金師 | bomb / machine / craft |
| 99 | 錬金術師 | 占い師 | 星辰錬金師 | random synthesis / fate control |
| 100 | 学者 | 農民 | 博物学者 | Monster / material / Codex |
| 101 | 学者 | 大工 | 技術士 | analysis / device response |
| 102 | 学者 | 占い師 | 天文学者 | analysis / prediction |
| 103 | 農民 | 大工 | 開拓者 | survival / settlement / endurance |
| 104 | 農民 | 占い師 | 風水師 | terrain / luck / nature buff |
| 105 | 大工 | 占い師 | 宮大工 | ward / deployable / fortune |

## Implementation guardrails

1. 105職を105個の独立戦闘エンジンとして実装しない。
2. 各Fusion Jobは `Parent A identity + Parent B identity + 1 unique Fusion Trait` を基本構造とする。
3. 親JobのResourceをそのまま2本持たせるだけにせず、相互作用または変換ルールを作る。
4. Skill Constellationは共通ノードエンジンとレイアウトプリセットを使う。
5. 既存30上級職のID/セーブ互換を監査してから置換・aliasを決める。
6. 105職の名称は実装前にNaming Auditをもう一度行う。
7. 新しいFusion Jobが既存Battle / Loot / Codex / MASTERを迂回する別システムにならないようにする。

## Next design pass

次の設計工程では、105職それぞれについて以下を確定する。

- canonical job id / display name
- existing advanced-job mapping / compatibility alias
- parent identities
- Job Resource interaction
- unique Fusion Trait
- two Constellation branches
- Keystone候補
- Ultimate候補
- weapon tendency
- Loot 3.0 desired affix tags

その後、代表4職程度でConstellation Engineを実証してから105職へ展開する。
