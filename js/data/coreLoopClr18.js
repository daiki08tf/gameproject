/* CLR-18 — Chapter 1 Story Density representative slice.
   Presentation-only post-combat beats. Canonical Stage progression remains stageProgress. */

const CH1_STORY_AFTERMATH=Object.freeze({
  '1-1':Object.freeze({title:'平原に残る足跡',text:'倒した魔物の足跡はばらばらではない。いくつもの跡が平原の奥、同じ方角へ続いている。'}),
  '1-2':Object.freeze({title:'丘の向こうから',text:'風吹く丘を越えると、魔物の往来はさらに濃くなる。騒ぎの中心は平原の外ではなく、この先にあるようだ。'}),
  '1-3':Object.freeze({title:'洞窟は通り道',text:'洞窟の入口には新しい爪痕と踏み跡が重なっている。ここはただの棲み処ではなく、さらに奥へ続く通り道らしい。'}),
  '1-4':Object.freeze({title:'巣窟の統率',text:'巣窟の魔物は無秩序に集まっていたわけではない。奥へ進むほど配置が揃い、何者かに従っている気配が強くなる。'}),
  '1-5':Object.freeze({title:'平原を押さえていた者',text:'オークキングを倒すと、城の周囲に満ちていた魔物の気配が崩れ始める。はじまりの平原を覆っていた圧力の中心は、ここだった。'}),
});

export function clr18StoryAftermath(stageId){
  const beat=CH1_STORY_AFTERMATH[String(stageId||'')];
  return beat?{stageId:String(stageId),...beat}:null;
}

export function clr18ShouldShowAftermath({stageId,cleared,wasCleared=false,retreated=false}={}){
  return !!(cleared&&!retreated&&!wasCleared&&clr18StoryAftermath(stageId));
}

export { CH1_STORY_AFTERMATH };
