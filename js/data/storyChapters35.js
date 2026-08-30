/* Story Expansion II — Ch35 / Arc V 共観測 finale */
export const STORY_EXPANSION_II_CH35 = Object.freeze({
  35:Object.freeze({
    chapter:35,
    act:'第五部・共観測 最終節',
    objective:'Blade Valeと外側が独立に示した同じ境界異常へ第八鍵の参照を合わせ、二つの観測領域で同時に確かめる。',
    opening:'Ch34で作った共通参照枠を使うと、Blade Vale側の境界変動と外側の点列は別々の計測から同じ一点へ収束する。どちらかが相手の地図を写したのではない。双方が自分の側から同じ異常を見つけている。',
    discovery:'第八鍵へ両側の参照列を同時入力すると、これまで必ず再試行へ戻っていた照合が初めて保持される。扉が開くのではなく、互いに異なる二つの観測領域が一つの焦点だけを共有し始める。',
    mid:'参照断絶官スプリットは片側の観測を誤差として切り離し、共通焦点を単独記録へ戻そうとする。だが外側からは同じ異常点への再指定が繰り返され、Blade Vale側の生体残響も同じ位置を維持する。',
    stabilization:'二つの観測列が揃った瞬間、第八鍵は短時間だけ安定する。Blade Valeから見た裂け目と外側から見た異常は同一ではない。それでも双方は「同じ何か」を別の側面から同時に観測している。',
    contradiction:'安定終了直前、共通参照枠に説明不能な二重輪郭が一枚だけ残る。深緑の森と一致する同じ座標に、巨大な樹冠で覆われた地形と、森林反応そのものが存在しない地形が同時に記録されている。どちらも誤差としては整いすぎている。',
    bossIntro:'同期破綻機構ディソナンスは、二つの観測領域が一つの現象を同時に保持する状態そのものを不整合として解体する。敵対文明の攻撃ではない。共観測を成立させないために働く境界処理だ。',
    clear:'同期破綻を止めると、第八鍵は数十拍だけ共通参照点として安定する。Blade Valeと外側は同じ境界現象を同時に観測し、互いの反応を確かめた。接続は監視だけではなく協調観測にも使える。だが最後に残った深緑の森の二重輪郭は説明できないまま消え、接続者・外側の正体・欠落した一拍の意味も未解決のまま残った。',
  }),
});

export function storyExpansionIICh35BeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_II_CH35[Number(chapterNumber)];
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
