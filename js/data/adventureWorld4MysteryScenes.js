/* Adventure / World 4.0 — W11-W13 authored Mystery scenes. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';

function scene(value){return normalizeAdventure4Scene(value);}

export function adventure4MysterySceneForStage(stage){
  if(stage==='unknown')return scene({id:'frontier-bell-rumor-scene',name:'旅する学者',entryStepId:'observe',tags:['mystery','npc','frontier'],steps:[
    {id:'observe',phase:'observation',title:'街道脇の旅人',text:'古い測量棒を持った学者が、地面へ耳を当てている。名をセラというらしい。',choices:[{id:'listen',label:'何を調べているか聞く',nextStepId:'rumor'},{id:'pass',label:'邪魔せず通り過ぎる',nextStepId:'pass'}]},
    {id:'rumor',phase:'resolution',title:'土の下で鳴る鐘',text:'「風がないのに鐘の音がする。でも音の場所が毎回少しずれるの」セラは噂を地図に書き込み、拠点でも記録を照合すると話した。',choices:[{id:'finish',label:'噂を覚えておく',consequences:[{scope:'world',type:'mysteryRumor',key:'frontier-bell-rumor',value:{source:'sera-wanderer'}},{scope:'world',type:'npcMeeting',key:'sera-wanderer',value:{location:'frontier',moveTo:'settlement'}}]}]},
    {id:'pass',phase:'resolution',title:'すれ違う旅人',text:'セラは引き止めず、また地面の音を測り始めた。次に会えば話を聞けるだろう。',choices:[{id:'finish',label:'先へ進む',consequences:[{scope:'world',type:'npcMeeting',key:'sera-wanderer',value:{location:'frontier'}}]}]},
  ]});
  if(stage==='rumor')return scene({id:'frontier-bell-trace-scene',name:'鐘の痕跡',entryStepId:'observe',tags:['mystery','trace','frontier'],steps:[
    {id:'observe',phase:'observation',title:'土に混じる金属粉',text:'噂の地点に近い斜面で、青黒い金属粉が細い筋になって土へ混じっている。',choices:[{id:'record',label:'粉の流れを記録する',nextStepId:'recorded'},{id:'leave',label:'採取せず場所だけ覚える',nextStepId:'leave'}]},
    {id:'recorded',phase:'resolution',title:'地下へ続く痕跡',text:'金属粉は自然鉱脈ではなく、何か古い構造物から削れたように見える。',choices:[{id:'finish',label:'痕跡を持ち帰る',consequences:[{scope:'world',type:'mysteryTrace',key:'frontier-bell-metal-dust'}]}]},
    {id:'leave',phase:'resolution',title:'観察だけに留める',text:'地形を荒らさず離れた。次に来れば同じ場所を調べられる。',choices:[{id:'finish',label:'先へ進む'}]},
  ]});
  if(stage==='trace')return scene({id:'frontier-bell-discovery-scene',name:'沈みかけた石環',entryStepId:'observe',tags:['mystery','discovery','frontier'],steps:[
    {id:'observe',phase:'observation',title:'半分埋まった石の輪',text:'金属粉の筋を追うと、草地の下から円形の石組みが覗いている。中心だけ踏み音が低い。',choices:[{id:'inspect',label:'石環を観察して記録する',nextStepId:'found'},{id:'mark',label:'位置だけ記して戻る',nextStepId:'leave'}]},
    {id:'found',phase:'resolution',title:'地面の下の空洞',text:'石環の中心には空洞がある。鐘の噂と金属粉を合わせれば、地下構造の可能性が高い。',choices:[{id:'finish',label:'発見として記録する',consequences:[{scope:'world',type:'mysteryDiscovery',key:'frontier-bell-stone-ring'}]}]},
    {id:'leave',phase:'resolution',title:'場所だけ残す',text:'不用意に掘らず、地図へ位置だけ書き込んだ。',choices:[{id:'finish',label:'帰還後に考える'}]},
  ]});
  if(stage==='research')return scene({id:'frontier-bell-vault-scene',name:'沈鐘の地下室',entryStepId:'observe',tags:['mystery','secret','hidden-route','frontier'],steps:[
    {id:'observe',phase:'observation',title:'地図に無かった横道',text:'研究所で照合した角度どおり石環の外側を探すと、草に隠れた狭い降り道が見つかった。知らなければ道とは思わない。',choices:[{id:'enter',label:'隠れた降り道へ入る',nextStepId:'vault'},{id:'mark',label:'入口だけ記録して戻る',nextStepId:'defer'}]},
    {id:'vault',phase:'resolution',title:'沈鐘の地下室',text:'地下には巨大な鐘の残骸と、街道側へ抜ける古い保守路が残っていた。秘密の場所と恒久的な近道を記録できる。',choices:[{id:'finish',label:'近道を開通させる',consequences:[{scope:'world',type:'mysteryResolve',key:'frontier-buried-bell'}]}]},
    {id:'defer',phase:'resolution',title:'入口を記録する',text:'今は降りず、入口だけ地図へ記した。秘密の存在は分かったが、解決は後日に回せる。',choices:[{id:'finish',label:'また戻る'}]},
  ]});
  return null;
}

export function adventure4MysterySecretRevisitScene(){return scene({id:'frontier-bell-vault-revisit',name:'沈鐘の地下室',entryStepId:'observe',tags:['secret','shortcut','frontier'],steps:[
  {id:'observe',phase:'observation',title:'開通した保守路',text:'一度見つけた入口はもう秘密ではない。古い保守路を使えば、街道の一部を短く抜けられる。',choices:[{id:'finish',label:'近道を使う'}]},
]});}
