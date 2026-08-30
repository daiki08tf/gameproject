/* Story Expansion II — Ch34 / Arc V 共観測 */
export const STORY_EXPANSION_II_CH34 = Object.freeze({
  34:Object.freeze({
    chapter:34,
    act:'第五部・共観測 第四節',
    objective:'外側から返された非言語の点・線・順序をBlade Valeの境界地図へ重ね、双方が同じ異常を指しているか確かめる。',
    opening:'Ch33で機械記録の盲点が確定した後、第八鍵の対向端点から新しい返答が届く。文字でも音声でもない。点の出現順、線の長さ、間隔の変化だけが一定の規則で繰り返されている。',
    discovery:'研究班が返答を境界地図へ重ねると、点列の一部が既知の裂け目や観測設備の位置関係と一致する。外側はこちらの地名も距離単位も知らないはずなのに、関係性だけは同じ形に置き換えられている。',
    mid:'座標監査官オーバーレイは二つの地図を別々に保とうとし、重なる線を誤差として切り捨てる。だが切り捨てられるたび、外側の配列は別の順序で同じ一点を指し直してくる。',
    commonFrame:'点・線・時間間隔の三つだけを共通尺度として扱うと、Blade Vale側と外側の返答は一つの参照枠に重なる。完全な地図ではない。それでも双方が同じ不安定点を「ここ」と示していることは否定できない。',
    bossIntro:'共通参照拒絶機構アラインメントは、異なる観測領域の座標が一つに重なることを異常として排除する。二つの地図が同じ一点を示すたび、その一致そのものを戦闘圧力へ変換する。',
    clear:'拒絶機構を止めると、外側の非言語配列とBlade Valeの境界地図が短時間だけ同じ参照枠を維持する。向こう側は返事をしているだけではない。こちらと同じ不安定点を示し、共通の基準を作ろうとしている。だが向こうがどこなのか、なぜその異常を知るのかはまだ分からない。',
  }),
});

export function storyExpansionIICh34BeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_II_CH34[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(index===2)beat.discovery=story.discovery;
  if(stage.midBoss||index===3)beat.discovery=story.mid;
  if(index===5)beat.discovery=story.commonFrame;
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}
