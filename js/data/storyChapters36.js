/* Story Expansion II — Ch36 / Arc VI 分岐記録 開幕 */
export const STORY_EXPANSION_II_CH36 = Object.freeze({
  36:Object.freeze({
    chapter:36,
    act:'第六部・分岐記録 開幕節',
    objective:'Ch35で処理しきれなかった深緑の森の二重輪郭を誤差として破棄せず、生体側と境界側、二つの系統として並行に追跡する。',
    opening:'Ch35で処理しきれなかった深緑の森の二重輪郭は、誤差として破棄されず観測ログへ残った。パーティは片方だけを選ばず、二つの輪郭を並行して追跡することにする。',
    discovery:'生体残響側と境界照合側、それぞれの記録を独立した系統として並べ直すと、どちらも矛盾なく完結している。壊れているのは一つの記録ではない。同じ座標に、整合した記録が二つ同時に存在している。',
    mid:'単一化官モノリスは、二つの系統が並び立つこと自体を認めない。どちらか一方を正史として選び直し、もう一方を観測誤差として消去しようとする。',
    stabilization:'二系統を無理に一つへ潰さず並行保持を続けると、Ch33で機械記録から欠落していた一拍の痕跡が、生体残響側の記録にだけ残っていたことが確認できる。境界照合側にはその区間が最初から存在しない。',
    contradiction:'欠落は削除の痕跡ではなかった。生体側の痕跡が途切れる瞬間と、境界側の記録が始まる瞬間は、寸分違わず同じ一点で重なる。「欠けた一拍」とは、一つの座標が二つの歴史へ分かれた、その分岐点そのものだった。',
    bossIntro:'淘汰選別機構アービトレータは、複数の整合した歴史を同時に保持するという事態そのものを解体しにかかる。どちらの記録が正しいかを裁くためではない。二つの歴史が同時に存在してはならない、という前提を、力で押し通すために動いている。',
    clear:'アービトレータを退けても、二つの輪郭はどちらも消えずに残った。深緑の森の一点は、たしかに二つの整合した歴史へ分かれている。生体のような媒体だけが、その分岐が起きた瞬間の輪郭を保持できるらしい。欠落は隠蔽ではなく、単一の記録形式では捉えきれない分岐点だった。誰が・なぜBlade Valeを観測しているのかは、依然として何一つ分かっていない。',
  }),
});

export function storyExpansionIICh36BeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_II_CH36[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(index===2)beat.discovery=story.discovery;
  if(stage.midBoss||index===3)beat.discovery=story.mid;
  if(index===5)beat.discovery=story.stabilization;
  if(index===6)beat.discovery=story.contradiction;
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}
