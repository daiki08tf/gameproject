/* Story Expansion II — Ch31 / Arc V 共観測 */
export const STORY_EXPANSION_II_CH31 = Object.freeze({
  31:Object.freeze({
    chapter:31,
    act:'第五部・共観測 第一節',
    objective:'Ch30で成立した双方向応答を追跡し、返された信号が偶然の反響なのか、意図を持つ手順なのかを確かめる。',
    opening:'外部観測核の応答は途切れていない。言葉は一つも読めないのに、三つの間隔だけが何度観測しても同じ順番で返ってくる。',
    discovery:'第一間隔の後は通信が継続し、第二間隔では同じ列が再送され、第三間隔を越えると双方の観測記録が確定する。研究班は仮に「受理・再試行・確認」と呼ぶが、それは翻訳ではなく状態の呼び名にすぎない。',
    mid:'再試行監査官リトライは侵入を拒むのではなく、成立しない照合を初期状態へ戻し続けている。こちらの行動順を変えると、外側の応答順も対応して変化した。',
    contradiction:'欠落間隔庫には同一時刻・同一内容の応答が二件残る。片方はCh30の接続元と一致するが、もう片方には送信元座標そのものが存在しない。記録障害として隔離され、原因は確定しない。',
    bossIntro:'未完了同期機構グラマは会話を求めていない。受理、再試行、確認の三状態を戦闘そのものへ写し、成立しない接続を何度でも最初からやり直そうとする。',
    clear:'三状態の順序を崩さず照合を完了すると、外部応答は初めてこちらの入力に合わせて手順を変える。返答には文法がある。だが誰が返しているのか、そして送信元のない第二応答が何だったのかは残されたままだ。',
  }),
});

export function storyExpansionIICh31BeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_II_CH31[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(index===2)beat.discovery=story.discovery;
  if(stage.midBoss||index===3)beat.mid=story.mid;
  if(index===5)beat.discovery=story.contradiction;
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}