/* CLR-18 — Story Density representative slices.
   Presentation-only post-combat beats. Canonical Stage progression remains stageProgress. */

const CH1_STORY_AFTERMATH=Object.freeze({
  '1-1':Object.freeze({title:'平原に残る足跡',text:'倒した魔物の足跡はばらばらではない。いくつもの跡が平原の奥、同じ方角へ続いている。'}),
  '1-2':Object.freeze({title:'丘の向こうから',text:'風吹く丘を越えると、魔物の往来はさらに濃くなる。騒ぎの中心は平原の外ではなく、この先にあるようだ。'}),
  '1-3':Object.freeze({title:'洞窟は通り道',text:'洞窟の入口には新しい爪痕と踏み跡が重なっている。ここはただの棲み処ではなく、さらに奥へ続く通り道らしい。'}),
  '1-4':Object.freeze({title:'巣窟の統率',text:'巣窟の魔物は無秩序に集まっていたわけではない。奥へ進むほど配置が揃い、何者かに従っている気配が強くなる。'}),
  '1-5':Object.freeze({title:'平原を押さえていた者',text:'オークキングを倒すと、城の周囲に満ちていた魔物の気配が崩れ始める。はじまりの平原を覆っていた圧力の中心は、ここだった。'}),
});

const CH18_STORY_AFTERMATH=Object.freeze({
  '18-1':Object.freeze({title:'空から来た傷',text:'荒野に散る星骸は自然に落ちた隕石とは違う。同じ方向へえぐれた痕跡が、何かが空から侵入した軌道を示している。'}),
  '18-2':Object.freeze({title:'黒硝子の下',text:'砂丘の黒硝子には高熱だけでは説明できない歪みが残る。地面そのものが一瞬、外側へ引かれたような痕跡だ。'}),
  '18-3':Object.freeze({title:'星骸は殻だった',text:'谷に積もる星骸の内側には空洞がある。岩ではなく、何かを守って落ちてきた殻だった可能性が強まる。'}),
  '18-4':Object.freeze({title:'研究所の記録',text:'星喰いワームの奥で破損した観測記録が見つかる。研究者たちは落下物より、その背後に開いた「穴」を恐れていた。'}),
  '18-5':Object.freeze({title:'培養された異物',text:'培養槽の痕跡は、異星生命がここで増やされていたことを示す。侵入者だけでなく、人の側も世界の外へ手を伸ばしていた。'}),
  '18-6':Object.freeze({title:'重力の裂け目',text:'断層では距離と重さの感覚が噛み合わない。星骸の落下は地形を壊しただけでなく、世界の境界そのものを薄くしたようだ。'}),
  '18-7':Object.freeze({title:'クレーターの中心へ',text:'星核クレーターへ続く痕跡は、すべて一点へ収束している。ここに落ちたものは偶然ではなく、境界を狙って突入したように見える。'}),
  '18-8':Object.freeze({title:'世界の外側',text:'アステリオンの核には、この世界の物質ではない層が残っていた。古文書の「世界の外側」が比喩ではなかったことが確かになる。'}),
});

const STORY_AFTERMATH=Object.freeze({...CH1_STORY_AFTERMATH,...CH18_STORY_AFTERMATH});

export function clr18StoryAftermath(stageId){
  const beat=STORY_AFTERMATH[String(stageId||'')];
  return beat?{stageId:String(stageId),...beat}:null;
}

export function clr18ShouldShowAftermath({stageId,cleared,wasCleared=false,retreated=false}={}){
  return !!(cleared&&!retreated&&!wasCleared&&clr18StoryAftermath(stageId));
}

export { CH1_STORY_AFTERMATH,CH18_STORY_AFTERMATH,STORY_AFTERMATH };
