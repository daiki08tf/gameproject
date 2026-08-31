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

const CH35_STORY_AFTERMATH=Object.freeze({
  '35-1':Object.freeze({title:'二つの観測が重なる',text:'同時観測路の記録は、Blade Vale側と外側が別々に同じ境界異常を指している。偶然の一致では片づけにくい。'}),
  '35-2':Object.freeze({title:'第八鍵の安定',text:'第八鍵は短時間だけ、双方から参照できる一点として安定する。鍵そのものより、共有できた座標の存在が重要らしい。'}),
  '35-3':Object.freeze({title:'一致する異常',text:'共有異常照合室では、二つの観測記録が同じ揺らぎを示す。見えている世界は違っても、異常の位置だけは一致している。'}),
  '35-4':Object.freeze({title:'参照の断絶',text:'スプリットを越えた先では、同期が崩れる瞬間だけ二つの記録が食い違う。違いは誤差ではなく、輪郭そのものにある。'}),
  '35-5':Object.freeze({title:'共観測橋の先',text:'共観測橋を進むほど、同じ座標に二つの状態が重なる痕跡が増える。どちらか一方が偽物とは断定できない。'}),
  '35-6':Object.freeze({title:'二重輪郭',text:'二重輪郭帯では、巨大な樹冠に覆われた反応と、森林反応が存在しない反応が同じ座標に並んで現れる。'}),
  '35-7':Object.freeze({title:'共同焦点核前',text:'焦点核の直前で二つの観測はほぼ完全に重なる。差異は消えず、むしろ同じ場所に二つの輪郭があることだけが鮮明になる。'}),
  '35-8':Object.freeze({title:'説明できない一致',text:'同期破綻機構を退けても、深緑の森の二重輪郭は消えない。原因も意味もまだ説明できず、観測事実だけが残る。'}),
});

const STORY_AFTERMATH=Object.freeze({...CH1_STORY_AFTERMATH,...CH18_STORY_AFTERMATH,...CH35_STORY_AFTERMATH});

export function clr18StoryAftermath(stageId){
  const beat=STORY_AFTERMATH[String(stageId||'')];
  return beat?{stageId:String(stageId),...beat}:null;
}

export function clr18ShouldShowAftermath({stageId,cleared,wasCleared=false,retreated=false}={}){
  return !!(cleared&&!retreated&&!wasCleared&&clr18StoryAftermath(stageId));
}

export { CH1_STORY_AFTERMATH,CH18_STORY_AFTERMATH,CH35_STORY_AFTERMATH,STORY_AFTERMATH };
