/* ============================================================
   Phase 11 / Story Expansion — Story Canon
   ============================================================ */

export const STORY_CANON_VERSION = '3.0-story-expansion-ii-ch32';

export const CENTRAL_MYSTERY = Object.freeze({
  question: 'なぜBlade Valeの世界と現代世界はつながっているのか？',
  playerObjective: '各地で起きる境界異常の原因を追い、崩れつつある世界層を守りながら「観測者」が世界を選別する理由へ辿り着く。',
  truthPolicy: '答えを一度に説明しない。Ch1–15は違和感、Ch16–20はThe Veil、Ch21–25は境界網、Ch26–30は第八鍵と双方向観測、Ch31以降は返答構造と共観測を段階的に扱い、Modern Worldの固有名はさらに後まで断片的に見せる。',
});

export const WORLD_LAYERS = Object.freeze({
  human:{id:'human',name:'人界',kind:'inhabited-world',role:'プレイヤーの故郷と通常世界。複数の地域・文明・魔物生態系を持つ一つの世界層。',relation:'The Veilの内側に隔離された観測対象の一層。本人たちは通常その事実を知らない。'},
  heaven:{id:'heaven',name:'天界',kind:'adjacent-world',role:'高位存在と光/Relic文化が残る隣接世界層。神話上の「天」だが絶対的な創造主の領域ではない。',relation:'人界と同じ境界網に属し、過去には人界へ干渉・裁定を試みた記録がある。'},
  underworld:{id:'underworld',name:'冥界',kind:'adjacent-world',role:'死・残響・高危険な生命圏が濃い隣接世界層。単純な死後世界ではなく、失われた記憶や存在の残滓が集積する。',relation:'人界・天界と同じ境界網の別層。Veilの損傷で相互流入が起こりやすくなる。'},
  boundary:{id:'boundary',name:'境界層',kind:'infrastructure',role:'世界と世界の間にある通路・隔壁・観測・封印のための中間領域。',relation:'The Veilはこの境界層を束ねる巨大な隔離・接続網の総称。Key Dungeon、裂界、境界王座は同系統の構造物。'},
  machine:{id:'machine',name:'機界',kind:'artificial-world',role:'境界網の運用・記録・選別に関与する人工世界層。MOTHER/ARCHITECT系は管理端末であり、世界そのものの創造主ではない。',relation:'人界を「観測対象」「実験層」と呼ぶ。最深部では、機界自身も上位の観測者に観測される側だと判明する。'},
  modern:{id:'modern',name:'現代世界',kind:'external-world',role:'Blade Vale側から見れば未知の文明世界。都市光、鉄道音、通信信号、文字、日付、携帯端末など断片だけが先に届く。',relation:'境界網の外部、または通常の管理対象とは異なる接続先。Ch30時点で双方向の認識は確認されるが、場所・接続理由・接続者は未確定。'},
});

export const VEIL_CANON = Object.freeze({
  name:'The Veil',
  definition:'複数の世界層を隔離し、必要に応じて接続・封印・観測する巨大な境界網。単なる一枚の壁ではない。',
  failure:'黒鉄機城停止後に各地の維持機構が不安定化し、既存の亀裂・古い鍵路・封印地点が連鎖的に再活性化した。',
  guardians:'原初の獣アビスを含む一部の「怪物」は侵略者ではなく、局所的な裂け目を内側から押さえていた門番。',
  keys:'七鍵は既知の境界制御系。第八鍵はその八本目ではなく、既存体系を迂回して外側の対向端点と揃うことを前提にした例外接続経路。',
});

export const ENDGAME_STORY_MEANINGS = Object.freeze({
  abyss:'The Veilの破損部へ堆積した世界残滓・侵食・未整理の境界空間。深く潜るほど複数世界の法則が混ざる。',
  worldTier:'物語上は「境界圧」の上昇として扱う。同じ地域でもVeil越しの干渉が強まり、敵・環境・報酬の位相が変化する。',
  nemesis:'敗北時にプレイヤーの戦闘情報を境界残響として取り込んだ強敵。個人的な因縁と世界の観測性を両立させる。',
  secretRealm:'通常の地図から外れた小規模世界片・隔離区画・失敗した接続先。探索や鍵によって一時的に座標が固定される。',
  keyDungeon:'The Veilの管理・保守用ルートを冒険者側から利用したもの。天界・冥界・異常座標への橋になる。',
  uniqueTrial:'Unique装備に残った前所有者/製作者/世界法則の「条件記録」を再現する試練。単なるゲーム的課題ではない。',
  raid:'通常の局所戦では処理できない境界級脅威への再観測戦。既知Bossの再臨は「同じ存在のHP増量」ではなく、境界網が異なる状態を再現したもの。',
  machineWorld:'境界網を管理していた人工層。ただし最深部で、管理者だと思われた存在もさらに上位の観測対象だったと分かる。',
});

export const STORY_ARCS = Object.freeze([
  {id:'arc1',chapters:[1,15],name:'地上の旅',purpose:'地域を巡る王道冒険の中に、共通紋様・不自然な遺跡・黒鉄機城など「世界が一枚ではない」違和感を少量ずつ混ぜる。',reveal:'世界の綻び'},
  {id:'arc2',chapters:[16,20],name:'The Veil',purpose:'歴史から消えた場所、外側から来た痕跡、時間空間の破綻を追い、The Veilという概念と門番の真実へ到達する。',reveal:'境界は壊れつつある'},
  {id:'arc3',chapters:[21,25],name:'外縁世界',purpose:'The Veilの外側ではなく、境界網に接続された外縁層を巡り、境界王座と観測中枢を発見する。',reveal:'Blade Valeは巨大な境界網の一ノード'},
  {id:'arc4',chapters:[26,30],name:'第八鍵と逆観測',purpose:'既知の七鍵体系から外れた接続を追い、機界の管理者も観測される側だと知り、外部文明との双方向認識へ到達する。',reveal:'第八鍵は外部から差し込まれた例外接続で、外側はこちらを認識している'},
  {id:'arc5',chapters:[31,35],name:'共観測',purpose:'双方向応答の手順、欠落する記録、双方が共有できる参照枠を追い、第八鍵が異なる観測領域を同期できる可能性へ進む。',reveal:'Ch32時点で第八鍵は七鍵の八本目ではなく、外側の対向端点と揃うことを前提にした例外接続だと分かる。端点の正体と設計者は未解決'},
]);

export const CLUE_LADDER = Object.freeze([
  {tier:1,label:'違和感',examples:['同じ古代紋様','地域を跨いだ共通構造','用途不明の機械部品']},
  {tier:2,label:'境界の兆候',examples:['空間の揺らぎ','歴史から消えた都市','天/冥界からの干渉']},
  {tier:3,label:'The Veil',examples:['七つの窪み','世界の外側','境界観測記録','門番の真実']},
  {tier:4,label:'境界網',examples:['外縁世界','境界王座','第八鍵','実験層という語']},
  {tier:5,label:'観測者',examples:['機界の記録','第八実験体','外部観測窓','選別という概念']},
  {tier:6,label:'現代世界',examples:['規則的な都市光','列車のような振動音','年月日表記','通信端末','日本語に似た文字列']},
  {tier:7,label:'双方向観測',examples:['返された焦点','応答座標','受理・再試行・確認に似た状態遷移','送信元を持たない重複応答','第八鍵の対向端点','存在しない第二署名']},
]);

export const STORY_WRITING_RULES = Object.freeze([
  'Story text must support exploration and gameplay; do not create a separate visual-novel layer.',
  'Mandatory story text should stay compact enough for mobile reading.',
  'Reveal one useful clue at a time; never explain the entire cosmology in a single scene.',
  'Existing mechanics should receive in-world meaning before new lore-only systems are invented.',
  'Unknown content stays unknown until the corresponding discovery condition is met.',
  'Modern-world clues begin as sensory/visual fragments before explicit names such as Tokyo are used.',
  'Do not silently change progression, rewards or unlock gates from narrative code.',
]);

export function storyArcForChapter(chapterNumber){
  const n=Number(chapterNumber);
  return STORY_ARCS.find(arc=>Array.isArray(arc.chapters)&&n>=arc.chapters[0]&&n<=arc.chapters[1])||null;
}

export function storyCanonSummary(){
  return {version:STORY_CANON_VERSION,centralMystery:CENTRAL_MYSTERY.question,objective:CENTRAL_MYSTERY.playerObjective,veil:VEIL_CANON.definition,worlds:Object.values(WORLD_LAYERS).map(w=>w.name),arcCount:STORY_ARCS.length};
}
