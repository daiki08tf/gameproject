/* Story Expansion II — Ch33 / Arc V 共観測 */
export const STORY_EXPANSION_II_CH33 = Object.freeze({
  33:Object.freeze({
    chapter:33,
    act:'第五部・共観測 第三節',
    objective:'複数の機械記録から同じ一拍が欠落する理由を、生体・根脈・残留記憶の痕跡と照合して確かめる。',
    opening:'第八鍵が外側の対向端点を待つ構造だと判明した後、研究班は古い観測記録を再照合した。すると機界端末、境界設備、旧式記録器のどれもが、同じ周期の一拍だけを記録していないことに気付く。',
    discovery:'欠落は故障箇所ごとにばらつかない。異なる年代・異なる機構の記録から、同じ位置の一拍だけが抜け落ちている。偶然の破損では説明しにくい。',
    mid:'無記録監査官ヌルは欠落区間へ値を補間し、「何も起きていない」連続記録へ修正し続ける。だが根脈の電位、生体の反射、残留記憶には補間前の揺らぎが残っている。',
    livingMemory:'根脈残響と生体反応を重ねると、機械が空白とした一拍にだけ共通の変化が現れる。何かは確かに起きた。残っていないのは出来事ではなく、機械側の記録だ。',
    hypothesis:'現時点では二つの説明が残る。誰かが同じ一拍を系統的に消したのか。それとも、その一拍の情報だけが現在の機械表現では保存できず、自動的に空白へ落ちるのか。',
    bossIntro:'欠落補正機構ブラインドスポットは、観測不能な一拍を異常として閉じるのではなく、前後の値で埋めて連続した記録へ戻そうとする。戦闘そのものが「空白など存在しない」という補正処理だ。',
    clear:'補正機構を停止すると、複数系統の機械記録に同じ空白が露出し、その位置へ生体・根脈・残留記憶の反応が一致して重なる。記録されない一拍は局所故障ではない。世界をまたいだ系統的な盲点だ。ただし、消されたのか、記録できないのかはまだ決められない。',
  }),
});

export function storyExpansionIICh33BeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_II_CH33[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(index===2)beat.discovery=story.discovery;
  if(stage.midBoss||index===3)beat.discovery=story.mid;
  if(index===4)beat.discovery=story.livingMemory;
  if(index===5)beat.discovery=story.hypothesis;
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}
