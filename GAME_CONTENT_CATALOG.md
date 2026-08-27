# Blade Vale — Game Content Catalog

> Human-readable index of current story enemies, bosses, exploration events and major optional content. Exact combat values remain authoritative in code.

## 1. Canonical data sources

| Content | Source |
|---|---|
| Chapters / stage construction | `js/data/stages.js` |
| Ch2–15 metadata | `js/data/chapters.js` |
| Ch16–20 | `js/data/chapters16to20.js` |
| Ch21–25 | `js/data/chapters21to25.js` |
| Ch26–29 | `js/data/chapters26to29.js` |
| Ch30 | `js/data/chapters30.js` |
| Generated story enemies | `js/data/enemies.js` |
| Ch21–30 region rules/events | `js/data/regionsPhase9.js` |
| Phase12 optional dungeons | `js/data/secretRealmExpansion.js` / related Phase12 data |
| CP2 rumors / encounters / routes | `js/data/contentPackIIAB.js` |
| CP2 chains / bosses / companions | `js/data/contentPackIICD.js` |
| CP3 observation reflux | `js/data/contentPackIIIA.js` |
| CP3 convergence / bosses / companions / rewards | `js/data/contentPackIIIB.js` |
| Post-CP3 Deep Survey | `js/data/postCp3DeepSurvey.js` |
| Story meaning / canon | `STORY_CANON.md`, `WORLD_LORE_BIBLE.md` |

## 2. Story chapter enemy index

Story enemy IDs are mostly generated as `chXX_normal`, `chXX_fast`, `chXX_tank`, `chXX_boss`; expanded Ch16–30 also have `chXX_midboss` and branch bosses.

| Ch | Region | Normal | Fast | Tank | Main Boss |
|---:|---|---|---|---|---|
| 1 | はじまりの平原 | ゴブリン | コウモリ | オーガ | オークキング |
| 2 | 深緑の森 | 森狼 | 毒胞子の精 | 苔むした大猪 | 森の大樹霊 |
| 3 | 忘れられた遺跡 | 亡者の兵 | 朽ちた影 | 石像兵 | 古代守護者ゴーレム |
| 4 | 凍てつく霊峰 | 氷狼 | 氷精 | イエティ | フロストドラゴン |
| 5 | 灼熱の火山 | 火山トカゲ | 飛び火の精 | 溶岩ゴーレム | 炎帝ドレイク |
| 6 | 底なし沼地 | 沼の魔物 | 毒霧の妖 | 巨大蛙 | 沼の女王 |
| 7 | 天空の遺跡都市 | 風の遊精 | 飛竜の子 | グリフォン | 天空の門番 |
| 8 | 深淵の魔界 | 悪魔兵 | 影の使い魔 | 堕天使 | 堕天の大公爵 |
| 9 | 虚無の狭間 | 虚無の亡霊 | 鏡合わせの影 | 時空の怪物 | 虚無の番人 |
| 10 | 勇者の試練 | 歴戦の魔物 | 闇の刺客 | 闇の騎士 | 真・魔王 |
| 11 | 灰冠の旧都 | 灰骸兵 | 残火の亡影 | 灰冠重騎士 | 灰冠王ヴァルグ |
| 12 | 天雷の浮島 | 雷羽獣 | 閃光妖精 | 天雷甲獣 | 雷翼獣ゼファル |
| 13 | 蒼晶深層 | 蒼晶蟲 | 晶霊 | 晶殻巨兵 | 晶界竜アズレオン |
| 14 | 腐緑の樹海 | 腐苔獣 | 毒花妖 | 根鎧獣 | 腐界樹ベルム |
| 15 | 黒鉄機城 | 鉄歯機兵 | 電磁ドローン | 黒鉄守機 | 機皇アーク・ゼロ |
| 16 | 沈みゆく聖海 | 深海亡者 | 泡影の海妖 | 珊瑚の守護兵 | 溺神ネレイオス |
| 17 | 白夜の聖都 | 白耀騎士 | 聖鐘の幻霊 | 断罪の聖盾兵 | 偽神アウレリア |
| 18 | 星骸の砂海 | 星蝕蟲 | 無貌の飛翔体 | 星核寄生巨獣 | 星喰獣アステリオン |
| 19 | 月蝕の境界 | 境界の亡影 | 時喰いの影獣 | 鏡界守護体 | 虚界王ノクティス |
| 20 | 始原の深淵 | 始原の眷属 | 深淵を這う影 | 封印守護者 | 原初の獣アビス |
| 21 | 灰燼の外縁 | 灰喰らい | 燐火の猟犬 | 焼鉄の重装兵 | 灰燼侯ヴァルカン |
| 22 | 玻璃凍原 | 氷玻璃兵 | 鏡雪の妖精 | 凍晶巨像 | 零王クリスタリア |
| 23 | 天雷墓標群 | 雷葬兵 | 閃雷翼 | 避雷巨兵 | 天葬王インドラグ |
| 24 | 虚花の庭園 | 虚花の従者 | 夢喰い蝶 | 根鎧の園丁 | 虚花妃エルシア |
| 25 | 境界王座 | 境界執行体 | 位相猟犬 | 七鍵守護機 | 境界王アルケオン |
| 26 | 零外接続域 | 零外巡回体 | 逸脱位相獣 | 規格外封鎖機 | 例外管理者エクシオン |
| 27 | 遠信残響帯 | 信号喰らい | 走査光蝶 | 受信殻巨兵 | 遠信王レゾナード |
| 28 | 機界監査層 | 監査端末兵 | 照合ドローン | 権限壁機兵 | 上位監査体オーディタ |
| 29 | 逆観測門 | 逆観測従体 | 焦点跳躍獣 | 二重視差巨像 | 接続監守パラドクス |
| 30 | 外部観測核 | 外部照合従体 | 応答走査獣 | 観測隔壁巨兵 | 外界照合者オブザーバ |

## 3. Expanded-story midboss / branch boss index

| Ch | Midboss | Hidden / branch boss |
|---:|---|---|
| 16 | 深海騎士ヴォルガ | 忘潮の司祭 |
| 17 | 断罪騎士レムナント | 盲目の大司教 |
| 18 | 星喰いワーム | 異星観測体ノヴァ |
| 19 | 境界獣クロノス | 逆行する旅人 |
| 20 | 門番アルカナ | 名を失った第八守護者 |
| 21 | 灰鎧将グレイヴ | 墓守アッシュロード |
| 22 | 氷鏡騎士セレス | 凍結した観測者 |
| 23 | 雷墓将ヴォルト | 名なき雷神兵 |
| 24 | 園守ベラドンナ | 枯れぬ園丁 |
| 25 | 第零観測者 | 記録から消えた王 |
| 26 | 鍵外執行官ノルム | 座標を持たぬ巡礼者 |
| 27 | 残響狩りエコーゼロ | 無音の受信者 |
| 28 | 非権限守護機ヴェリファ | 削除された設計補助体 |
| 29 | 第八鍵照合官オクタ | 外側を向く門番 |
| 30 | 双方向監査官リプライ | 名を返さない観測者 |

## 4. Ch21–30 exploration event index

These events live on the existing regional exploration surface; they are not separate screens.

### Ch21 灰燼の外縁
- 灰に埋もれた王墓 — Lore
- 消えない鍛炉 — Loot
- 境界の生存者 — Choice

### Ch22 玻璃凍原
- 凍結記録体 — Lore
- 反射氷庫 — Loot
- 停止した観測者 — Choice

### Ch23 天雷墓標群
- 落雷墓標 — Lore
- 雷神兵工廠跡 — Loot
- 断線天路 — Choice

### Ch24 虚花の庭園
- 記憶を咲かせる花 — Lore
- 毒蜜の巣 — Loot
- 根脈記憶庫 — Choice

### Ch25 境界王座
- 七鍵封鎖端末 — Lore
- 失われた世界層 — Loot
- 存在しない第八鍵 — Choice

### Ch26 零外接続域
- 消失した接続元 — Lore
- 未登録鍵路 — Loot
- 逆向き中継器 — Choice

### Ch27 遠信残響帯
- 整列する遠方光 — Lore
- 薄い発光片 — Loot
- 周期金属振動 — Choice

### Ch28 機界監査層
- 母機監査記録 — Lore
- 設計者外部署名 — Loot
- 観測先照合器 — Choice

### Ch29 逆観測門
- 第八接続室 — Lore
- 非対称鍵孔 — Loot
- 返された焦点 — Choice

### Ch30 外部観測核
- 返された座標 — Lore
- 生活圏信号記録 — Loot
- 双方向照合端末 — Choice

## 5. Phase12 / Content Pack II optional boss index

### Phase12 optional dungeons
- 古王墓 — 無名古王・レグナス
- 幻獣の森 — 幻獣王・アルシオン
- 竜骸峡谷 — 竜骸帝・ヴァルドレイク
- 反転図書館 — 反転司書・パラドクサ
- 黒月神殿 — 黒月神・ノクティル
- 収束観測界 / Apex — 五界観測体・PENTARCH

### Content Pack II hidden bosses
- 無鳴母獣・NEST-MOTHER
- 灰角残響獣・CINDER-HART
- 第八脈守・OCTAVE
- 重記司書・PALIMPSEST
- 双方向観測体・PARALLAX

## 6. Content Pack II secret companions

- 無鳴銀仔 — beast / speed
- 燼角仔 — beast / attacker
- 第八骨竜仔 — dragon / breaker
- 余白精 — spirit / support
- 視差灯 — spirit / specialist
- 零線幼体 — construct / specialist

Special hybrids:
- 灰月鹿
- 零脈竜
- 余白残響灯
- 双観測獣

## 7. Content Pack III A — observation reflux

Unlocked only after **Ch30 / 30-8** is cleared.

### 灰燼の外縁 cluster
Rumors: 動き続ける焼影 / 灰に刻まれた返信印
- Hidden Encounter: 残照追跡体・AFTERIMAGE
- Hidden Route: 返信炉床

### 天雷墓標群 cluster
Rumors: 戻ってくる落雷 / 第九照準線
- Hidden Encounter: 帰還雷標・BACKTRACE
- Hidden Route: 第九照準廊

### 虚花の庭園 cluster
Rumors: 知らない生活を咲かせる花 / 根脈からの返答
- Hidden Encounter: 外記憶花・OFFWORLD BLOOM
- Hidden Route: 異記憶根室

## 8. Content Pack III B — multi-region convergence

### Secret Chains
- **返信印の正体** — 返信炉床 → 第九照準廊
- **返送周期の一致** — 第九照準廊 → 異記憶根室 → ACK-WARDEN
- **生きた記憶だけが残したもの** — 異記憶根室 → RETURN-CLOCK → CINDER-REPLY

### Hidden Bosses
- 応答照準守・ACK-WARDEN
- 返灰獣・CINDER-REPLY
- 帰雷時計・RETURN-CLOCK
- 受信根母・ROOT-RECEIVER
- 生体記録核・LIVING-ARCHIVE

### Secret companions
- 返信猟犬 — breaker
- 返灰小獣 — attacker
- 帰雷灯 — speed
- 異記憶芽 — support
- 記録蛾 — specialist
- 境界反響種 — specialist

Special breeding:
- 返信猟犬 × 帰雷灯 → 照準雷犬
- 異記憶芽 × 記録蛾 → 生体記録花
- 返灰小獣 × 境界反響種 → 逆流灰種獣

### Unique / Relic rewards
- 返信守の盾
- 受理照準鏡
- 返灰外殻
- 逆流刻印
- 帰雷コイル
- 第九歩法輪
- 異記憶樹皮
- 外音の種子
- 生体記録冠
- 空白記録板
- 返答王冠
- 境界反響核

### Lore fragments
- 返信は文字ではない
- 同じ返送周期
- 記録できない記録

## 9. Post-CP3 Endgame I — Deep Survey

Reusable Lv99,999 / IP10,000 high-difficulty exploration targets. They appear through the existing Exploration / Secret Realm surface and use CP3 boss-clear discoveries as their only unlock keys.

- **返信炉床・深層観測** — ACK-WARDEN + CINDER-REPLY clear / durability, guard-counter and sustain target.
- **第九照準廊・深層観測** — RETURN-CLOCK clear / speed, first-strike and burst target.
- **異記憶根室・深層観測** — ROOT-RECEIVER + LIVING-ARCHIVE clear / sustain, magic and action-rotation target.

The detailed continuation plan is in `POST_CP3_ENDGAME_ROADMAP.md`.

## 10. Difficulty / challenge unlock index

- Normal — start
- 鋼鉄の誓約 — Ch5 clear + target stage first clear
- 硝子の進軍 — Ch10 clear + target stage first clear
- 破砕試練 — Ch19 clear + target stage first clear
- REMATCH+ — Ch25 clear + target stage first clear + boss-like content

Narrative interpretation is documented in `WORLD_LORE_BIBLE.md`.

## 11. Maintenance rule

Whenever a PR adds or renames a significant:
- story chapter
- named enemy / boss
- authored exploration event
- Secret Realm / Hidden Route
- recruitable secret companion
- canonical lore reveal

update this catalog in the same PR. Numeric stats do **not** need to be duplicated here; code remains the authority for numbers.