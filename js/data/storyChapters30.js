/* Story Expansion I — Ch30 finale narrative */
export const STORY_EXPANSION_I_FINALE = Object.freeze({
  30:Object.freeze({
    chapter:30,
    act:'第四部・逆観測域 終端',
    objective:'第八鍵の接続元に最も近い外部観測核へ進み、返された応答の意味を確かめる。',
    opening:'逆観測門の向こうで、これまで一方通行だった信号がこちらの動きに合わせて変化し始める。',
    discovery:'規則的な都市光、移動する金属振動、薄い発光端末、生活圏を示す未知文字。断片は別々ではなく、一つの文明圏から届いていた。',
    mid:'監査記録はMOTHERもARCHITECTも接続元を管理していなかったと示す。第八鍵は外側から境界網へ差し込まれた例外接続だった。',
    bossIntro:'外界照合者オブザーバは侵入者を排除するのではなく、こちらが「応答可能な観測対象」かを確かめるために立ちはだかる。',
    clear:'戦闘停止と同時に外部信号が一度だけ明確に同期する。向こう側は存在し、こちらを認識している。だが場所の名も、接続理由も、誰が最初に境界を結んだのかもまだ分からない。',
  }),
});

export function storyExpansionIFinaleBeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_I_FINALE[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(stage.midBoss||index===Math.floor((total-1)/2)){beat.discovery=story.discovery;beat.mid=story.mid;}
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}
