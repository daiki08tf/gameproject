/* Story Expansion II — Ch32 / Arc V 共観測 */
export const STORY_EXPANSION_II_CH32 = Object.freeze({
  32:Object.freeze({
    chapter:32,
    act:'第五部・共観測 第二節',
    objective:'第八鍵の痕跡を既知の七鍵体系と比較し、この接続だけが内部認証から外れている理由を確かめる。',
    opening:'Ch31で返答の手順が確認された後、研究班は第八鍵を七鍵の認証記録と並べ直した。形は似ているのに、どの鍵にもあるはずの内向きの承認先が第八鍵だけ見つからない。',
    discovery:'七鍵はすべてBlade Vale側の権限木へ戻る。第八鍵だけは途中で系統を離れ、外側へ向いたまま「待機」の状態を維持している。欠損ではなく、最初から別の相手を前提にした構造に見える。',
    mid:'裏面監査官リバースは鍵を閉じるのではなく、こちら側だけで成立させようとした照合を拒否する。片側の署名だけでは完了せず、常に存在しない第二署名を要求してくる。',
    counterpart:'対向待機機構の奥で、こちらの第八鍵痕跡と鏡写しになる応答パターンが一瞬だけ成立する。それは同じ鍵の反射ではない。こちら側の入力とは別の順序で変化し、対向する端点がある場合にだけ説明できる。',
    bossIntro:'対向同期機構デュプレクスは二つの端点が揃うことを前提に動作している。こちら側だけで接続を完成させようとすると、欠けた片側を戦闘圧力として補完し続ける。',
    clear:'同期機構を停止すると、第八鍵の待機痕跡は七鍵の内部構造から完全に分離して表示される。第八鍵は「八本目の鍵」ではない。何か外側の対向端点と揃うための例外接続だ。だが、その端点がどこにあり、誰が用意したのかはまだ分からない。',
  }),
});

export function storyExpansionIICh32BeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_II_CH32[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(index===2)beat.discovery=story.discovery;
  if(stage.midBoss||index===3)beat.discovery=story.mid;
  if(index===5)beat.discovery=story.counterpart;
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}
