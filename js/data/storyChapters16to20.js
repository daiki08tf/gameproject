/* Phase 11.3 — The Veil Ch16–20 story pass
 * Compact second-act story beats. Reuses existing expanded chapter stages.
 * The name "The Veil" is first stated in Ch19, matching established canon.
 */

export const VEIL_STORY_CHAPTERS = Object.freeze([
  {chapter:16,act:'第二部：境界の綻び',objective:'黒鉄機城停止後に浮上した沈都を調査し、世界各地の境界異常との関係を探る。',opening:'機城停止から数日。海底から、歴史に存在しない聖都が浮上した。七つの窪みを持つ石版が最深部から反応している。',discovery:'沈都の石版は黒鉄機城と同じ信号周期を持つ。七つの窪みは封鎖点の配置図らしい。',bossIntro:'溺神ネレイオスが祭壇を覆う。「門を失った海は、外へ流れ出す」',clear:'ネレイオスが消えると石版の一窪みが淡く光った。これは鍵ではなく、世界を閉じるための機構だった可能性がある。'},
  {chapter:17,act:'第二部：境界の綻び',objective:'白夜の聖都で「天より来る者」の記録を追い、七封鎖の起源を調べる。',opening:'沈都の石版が示した座標に、夜の来ない聖都がある。住民はいないが、聖典と防衛機構だけが残っている。',discovery:'禁書には「天より来る者は神ではない。境界外から人界を観測する者」と記されている。',bossIntro:'偽神アウレリアが玉座から立つ。「観測される世界に、自由などない」',clear:'聖典の末尾には、天界すら一つの世界層に過ぎないとある。人界だけが特別なのではない。'},
  {chapter:18,act:'第二部：境界の綻び',objective:'星骸の砂海に落ちた外部物質を調べ、世界の外側から侵入するものの正体を追う。',opening:'空から落ちたとされる星骸は、天体ではなかった。黒硝子の砂漠に残る軌跡は、空ではなく境界の裂け目から始まっている。',discovery:'研究記録には「外部層から境界膜へ穿孔」とある。誰かが世界の外から穴を開けた。',bossIntro:'星喰獣アステリオンが重力を歪める。体内にはこの世界の物質ではない核が脈動している。',clear:'星核は世界の外側を指し続けている。各地の封鎖は侵入を防ぐために築かれたものだった。'},
  {chapter:19,act:'第二部：The Veil',objective:'月蝕の境界へ入り、世界同士を隔てる境界網の正体を突き止める。',opening:'道、時間、記憶が重なる異常域へ踏み込む。古い観測塔の記録は、この世界間境界を初めて明確に「The Veil」と呼んでいる。',discovery:'The Veilは一枚の壁ではない。人界・天界・冥界など複数の世界層を分離し、必要な接続だけを管理する巨大な境界網だ。',bossIntro:'虚界王ノクティスが門を背負って立つ。「壁が破れれば、世界は自由になるのではない。混ざって消える」',clear:'月蝕の門は完全には閉じなかった。The Veilそのものが弱っている。原因はさらに深い、世界の底にある。'},
  {chapter:20,act:'第二部終章：最後の門番',objective:'始原の深淵へ降り、The Veil崩壊の中心と「原初の獣」の役割を確かめる。',opening:'始原の深淵は魔物の巣ではない。七つの封鎖線が集中する、世界境界の最深管理域だった。',discovery:'最奥の記録が示す真実は逆だった。原初の獣アビスは裂け目を作った存在ではない。内側から塞ぎ続けていた最後の門番だ。',bossIntro:'原初の獣アビスが傷だらけの身体を起こす。「退け。これ以上、境界を開かせるな」',clear:'アビスは倒れた。直後、七封鎖の外側から多数の世界座標が流れ込む。敵を倒したのではない――最後の門番を失った。境界の外縁へ進み、何がThe Veilを壊しているのか突き止めるしかない。'},
]);

export function veilStoryChapter(chapterNumber){
  return VEIL_STORY_CHAPTERS.find(entry=>entry.chapter===Number(chapterNumber))||null;
}

export function veilStoryBeatForStage(chapterNumber,stage,stageIndex,stageCount){
  const chapter=veilStoryChapter(chapterNumber);
  if(!chapter||!stage||stage.branch||stage.bounty)return null;
  const mainCount=Math.max(1,Number(stageCount)||8);
  const middleIndex=Math.max(1,Math.floor((mainCount-1)/2));
  return {
    act:chapter.act,
    objective:chapter.objective,
    opening:stageIndex===0?chapter.opening:null,
    discovery:stageIndex===middleIndex?chapter.discovery:null,
    bossIntro:stage.boss?chapter.bossIntro:null,
    clear:stage.boss?chapter.clear:null,
  };
}
