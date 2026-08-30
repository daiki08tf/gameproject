/* Adventure / World 4.0 — W31 Event Content Pack II.
   Eight Region-authored scenes. Data-only content: no reward/scaling authority. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';
import { normalizeAdventure4EventCatalog } from './adventureWorld4Events.js';

const RAW_SCENES=[
  {id:'frontier-night-cart',name:'灯りのない荷車',tags:['npc','mystery','frontier'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'灯りのない荷車',text:'日暮れ前の街道に荷車が止まっている。御者はいるが、荷台の灯りだけを頑なにつけようとしない。',choices:[{id:'ask',label:'理由を聞く',nextStepId:'ask'},{id:'tracks',label:'車輪跡を調べる',nextStepId:'tracks'},{id:'pass',label:'関わらず進む'}]},
    {id:'ask',phase:'investigation',title:'灯りを嫌う道',text:'御者は「ここでは灯りの方がこちらを見つける」とだけ答えた。',choices:[{id:'finish',label:'言葉を記憶する'}]},
    {id:'tracks',phase:'resolution',title:'もう一台ぶん',text:'荷車の跡に重なるように、同じ幅の古い車輪跡が逆向きへ続いていた。',choices:[{id:'finish',label:'痕跡を記録する'}]},
  ]},
  {id:'elemental-wind-reader',name:'風を読む巡礼者',tags:['npc','investigation','elemental'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'風を読む巡礼者',text:'尾根で巡礼者が細い紙片を何枚も放ち、落ちる方角を記している。',choices:[{id:'speak',label:'観測について聞く',nextStepId:'speak'},{id:'watch',label:'少し離れて観察する',nextStepId:'watch'}]},
    {id:'speak',phase:'resolution',title:'四つではない風',text:'「今日は五方向から吹いている」と巡礼者は笑う。紙片の一枚だけが空へ落ちていった。',choices:[{id:'finish',label:'先へ進む'}]},
    {id:'watch',phase:'resolution',title:'逆さの落下',text:'最後の紙片だけが重力に逆らうように上へ消えた。巡礼者は驚いていない。',choices:[{id:'finish',label:'記録する'}]},
  ]},
  {id:'fracture-double-shadow',name:'二つ目の影',tags:['ambient','mystery','fracture'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'二つ目の影',text:'曇天なのに、自分の影が二方向へ伸びている。片方だけが半歩遅れて動く。',choices:[{id:'test',label:'影のずれを確かめる',nextStepId:'test'},{id:'leave',label:'見ないまま離れる'}]},
    {id:'test',phase:'resolution',title:'遅れる輪郭',text:'遅い影は三歩目で止まり、そのまま岩陰へ残った。振り返ると何もない。',choices:[{id:'finish',label:'記録して進む'}]},
  ]},
  {id:'last-mortal-closed-well',name:'封じられた井戸',tags:['investigation','secret','last-mortal'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'封じられた井戸',text:'使われていない井戸を黒鉄の鎖が幾重にも塞いでいる。水音ではなく、遠い鐘の音が下から響く。',choices:[{id:'listen',label:'鎖に触れず音を聞く',nextStepId:'listen'},{id:'mark',label:'場所だけ記録する',nextStepId:'mark'}]},
    {id:'listen',phase:'resolution',title:'七回目の鐘',text:'鐘は七回で止まった。八回目を待つ前に風向きが変わる。',choices:[{id:'finish',label:'離れる'}]},
    {id:'mark',phase:'resolution',title:'閉じた入口',text:'無理に開けず、地形と鎖の形だけを書き留めた。',choices:[{id:'finish',label:'記録をしまう'}]},
  ]},
  {id:'veil-name-trader',name:'名前を売る旅商人',tags:['npc','mystery','veil'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'名前を売る旅商人',text:'露店には品物がなく、木札に知らない人名だけが並んでいる。商人は「名前なら軽い」と言う。',choices:[{id:'ask',label:'値段を聞く',nextStepId:'ask'},{id:'names',label:'木札だけ読む',nextStepId:'names'},{id:'leave',label:'買わずに去る'}]},
    {id:'ask',phase:'resolution',title:'代価',text:'「あなたのものではなく、忘れたものを一つ」。意味を聞く前に商人は別の客へ向いた。',choices:[{id:'finish',label:'立ち去る'}]},
    {id:'names',phase:'resolution',title:'空白の札',text:'一枚だけ文字のない札があり、目を離すたび位置が変わっている。',choices:[{id:'finish',label:'覚えておく'}]},
  ]},
  {id:'outer-world-signal-garden',name:'信号の庭',tags:['ambient','investigation','outer-world'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'信号の庭',text:'金属片が植物のように地面から伸び、風もないのに順番に傾いている。',choices:[{id:'pattern',label:'動きの順序を読む',nextStepId:'pattern'},{id:'distance',label:'遠巻きに通過する'}]},
    {id:'pattern',phase:'resolution',title:'繰り返す九拍',text:'動きは九拍で繰り返す。ただし最後の一拍だけ毎回違う方向を指す。',choices:[{id:'finish',label:'周期を記録する'}]},
  ]},
  {id:'reverse-observation-unwritten-map',name:'描かれていない地図',tags:['secret','mystery','reverse-observation'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'描かれていない地図',text:'壁に白紙の地図が貼られている。現在地だけが墨で記され、歩くたびその点も移動する。',choices:[{id:'wait',label:'動かず地図を見る',nextStepId:'wait'},{id:'circle',label:'周囲を一周する',nextStepId:'circle'}]},
    {id:'wait',phase:'resolution',title:'観測される現在地',text:'止まっている間だけ、点の周囲に存在しない道が薄く現れた。',choices:[{id:'finish',label:'形を記憶する'}]},
    {id:'circle',phase:'resolution',title:'閉じない線',text:'一周したはずの軌跡は閉じず、地図の外へ一本だけ伸びていた。',choices:[{id:'finish',label:'地図から離れる'}]},
  ]},
  {id:'shared-observation-second-answer',name:'二つ目の返答',tags:['mystery','investigation','shared-observation'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'二つ目の返答',text:'観測記録に同じ応答が二つ並んでいる。片方には送信元の座標があるが、もう片方には何も記されていない。',choices:[{id:'compare',label:'二つの記録を見比べる',nextStepId:'compare'},{id:'ignore',label:'片方だけを記録して進む'}]},
    {id:'compare',phase:'resolution',title:'空欄の座標',text:'内容は一致しているのに、座標欄だけが最初から空白のまま保存されている。誰かが消したのではなく、最初から書かれていない。',choices:[{id:'finish',label:'違和感だけを持ち帰る'}]},
  ]},
];

export const ADVENTURE4_CONTENT_PACK_II_SCENES=Object.freeze(RAW_SCENES.map(normalizeAdventure4Scene).filter(Boolean));
export const ADVENTURE4_CONTENT_PACK_II_EVENTS=normalizeAdventure4EventCatalog(RAW_SCENES.map(scene=>({id:scene.id,sceneId:scene.id,name:scene.name,weight:2,cooldownAdventures:2,tags:scene.tags})));

export function adventure4ContentPackIIForRegion(regionId){
  const events=ADVENTURE4_CONTENT_PACK_II_EVENTS.filter(event=>event.tags.includes(regionId));
  const ids=new Set(events.map(event=>event.sceneId));
  return Object.freeze({events:Object.freeze(events),scenes:Object.freeze(ADVENTURE4_CONTENT_PACK_II_SCENES.filter(scene=>ids.has(scene.id)))});
}
export function adventure4ContentPackIISceneById(id){return ADVENTURE4_CONTENT_PACK_II_SCENES.find(scene=>scene.id===id)||null;}
