/* Adventure / World 4.0 — W9 Ambient & Investigation Content Pack I.
   Authored scenes for the first three Regions. No rewards/scaling are owned here. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';
import { normalizeAdventure4EventCatalog } from './adventureWorld4Events.js';

const scenes=[
  {id:'frontier-windbreak',name:'風除けの石垣',tags:['ambient','quiet','frontier'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'風除けの石垣',text:'道の脇に低い石垣が残っている。風だけが乾いた草を揺らし、争った跡はない。',choices:[
      {id:'rest',label:'少し腰を下ろす',detail:'何かを得るためではなく景色を見る',nextStepId:'rested'},
      {id:'pass',label:'そのまま進む',nextStepId:'passed'},
    ]},
    {id:'rested',phase:'resolution',title:'静かな時間',text:'遠くの街道まで見渡せた。今日はただ静かな場所だった。',choices:[{id:'finish',label:'歩き出す'}]},
    {id:'passed',phase:'resolution',title:'街道へ',text:'石垣を背に、乾いた風の中を進む。',choices:[{id:'finish',label:'先へ進む'}]},
  ]},
  {id:'frontier-erased-sign',name:'削られた道標',tags:['investigation','human','frontier'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'削られた道標',text:'古い道標の一面だけが不自然に削られている。風化というより、人の手で消したように見える。',choices:[
      {id:'inspect',label:'削り跡を調べる',detail:'足元と刃物の跡を確認する',nextStepId:'inspect'},
      {id:'leave',label:'触れずに離れる',nextStepId:'leave'},
    ]},
    {id:'inspect',phase:'investigation',title:'消された行き先',text:'削り粉はまだ土に混じり切っていない。誰かが最近、行き先を読めなくしたらしい。',choices:[
      {id:'record',label:'痕跡として記録する',nextStepId:'recorded'},
      {id:'leave-after',label:'深追いしない',nextStepId:'leave'},
    ]},
    {id:'recorded',phase:'resolution',title:'二つの痕跡',text:'足跡の記録と合わせれば、偶然ではないかもしれない。拠点で情報を整理する価値がある。',choices:[{id:'finish',label:'記録をしまう',consequences:[{scope:'adventure',type:'trace',key:'frontier-pilot-broken-marker'}]}]},
    {id:'leave',phase:'resolution',title:'判断を保留する',text:'証拠を荒らさず、その場を離れた。調べないという判断もまた一つの選択だ。',choices:[{id:'finish',label:'先へ進む'}]},
  ]},
  {id:'frontier-deer-trail',name:'獣道の交差',tags:['ambient','creature','frontier'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'獣道の交差',text:'細い獣道が街道を横切っている。小さな足跡と大きな足跡が別方向へ続く。',choices:[
      {id:'small',label:'小さな足跡を見る',nextStepId:'small'},
      {id:'large',label:'大きな足跡を見る',nextStepId:'large'},
      {id:'ignore',label:'街道を優先する',nextStepId:'ignore'},
    ]},
    {id:'small',phase:'resolution',title:'草むらの気配',text:'小動物の群れがこちらに気付き、草の奥へ消えた。危険はなさそうだ。',choices:[{id:'finish',label:'見送る'}]},
    {id:'large',phase:'resolution',title:'古い足跡',text:'大きな跡は昨日以前のものらしい。追うには情報が足りない。',choices:[{id:'finish',label:'覚えておく'}]},
    {id:'ignore',phase:'resolution',title:'街道を進む',text:'獣道には入らず、見通しの良い街道を選んだ。',choices:[{id:'finish',label:'進む'}]},
  ]},
  {id:'elemental-steam',name:'湯気の裂け目',tags:['ambient','investigation','elemental'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'湯気の裂け目',text:'岩の割れ目から白い湯気が一定の間隔で噴き出している。周囲の苔だけ色が濃い。',choices:[
      {id:'moss',label:'苔を観察する',nextStepId:'moss'},
      {id:'rhythm',label:'噴出の間隔を測る',nextStepId:'rhythm'},
      {id:'pass',label:'熱源から離れる',nextStepId:'pass'},
    ]},
    {id:'moss',phase:'resolution',title:'熱に生きるもの',text:'苔は熱を避けるどころか、温かな岩肌に沿って広がっている。',choices:[{id:'finish',label:'記録する'}]},
    {id:'rhythm',phase:'resolution',title:'山の呼吸',text:'噴出は完全な規則ではない。地下の水と熱が複雑に動いているようだ。',choices:[{id:'finish',label:'離れる'}]},
    {id:'pass',phase:'resolution',title:'安全な尾根へ',text:'無理に近づかず、風上の尾根へ戻った。',choices:[{id:'finish',label:'進む'}]},
  ]},
  {id:'elemental-cairn',name:'積み石の避難標',tags:['investigation','human','elemental'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'積み石の避難標',text:'崖際に人為的な積み石がある。山道の目印にも、危険を知らせる印にも見える。',choices:[
      {id:'read',label:'周囲の配置を読む',nextStepId:'read'},
      {id:'add',label:'石を一つ足す',nextStepId:'add'},
      {id:'leave',label:'形を変えずに去る',nextStepId:'leave'},
    ]},
    {id:'read',phase:'resolution',title:'避難方向',text:'同じ形の積み石が風下へ続いている。悪天候時の退避路だった可能性が高い。',choices:[{id:'finish',label:'方角を覚える'}]},
    {id:'add',phase:'resolution',title:'受け継がれる印',text:'正しい意味は分からない。それでも崩れた一角を補い、元の形に近づけた。',choices:[{id:'finish',label:'手を離す'}]},
    {id:'leave',phase:'resolution',title:'そのまま残す',text:'意味を知らない印を勝手に変えないことにした。',choices:[{id:'finish',label:'先へ進む'}]},
  ]},
  {id:'elemental-cloudsea',name:'雲海の切れ間',tags:['ambient','quiet','elemental'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'雲海の切れ間',text:'風が一瞬だけ雲を割り、遠い峰と谷底が見える。魔物も異変もない。',choices:[
      {id:'watch',label:'雲が閉じるまで見る',nextStepId:'watch'},
      {id:'move',label:'足を止めない',nextStepId:'move'},
    ]},
    {id:'watch',phase:'resolution',title:'白い海',text:'やがて景色は白く閉じた。何も起きなかったが、山の広さだけはよく分かった。',choices:[{id:'finish',label:'歩き出す'}]},
    {id:'move',phase:'resolution',title:'尾根道',text:'短い晴れ間を背にして尾根を進んだ。',choices:[{id:'finish',label:'進む'}]},
  ]},
  {id:'fracture-echo',name:'遅れて返る足音',tags:['ambient','anomaly','fracture'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'遅れて返る足音',text:'立ち止まった後も、自分の足音だけが二歩ぶん遅れて聞こえる。',choices:[
      {id:'test',label:'もう一度だけ歩く',nextStepId:'test'},
      {id:'still',label:'完全に静止する',nextStepId:'still'},
      {id:'leave',label:'気にせず離れる',nextStepId:'leave'},
    ]},
    {id:'test',phase:'resolution',title:'ずれた反響',text:'今度は一歩だけ遅れた。規則を掴むには観測が足りない。',choices:[{id:'finish',label:'記録して進む'}]},
    {id:'still',phase:'resolution',title:'無音',text:'しばらくすると反響は消えた。静寂だけが残る。',choices:[{id:'finish',label:'動き出す'}]},
    {id:'leave',phase:'resolution',title:'背後の音',text:'振り返らず進むと、いつの間にか余分な足音は聞こえなくなった。',choices:[{id:'finish',label:'進む'}]},
  ]},
  {id:'fracture-camp',name:'無人の野営跡',tags:['investigation','human','fracture'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'無人の野営跡',text:'焚き火跡と畳まれた布が残る。荒らされた様子はなく、持ち主だけがいない。',choices:[
      {id:'ash',label:'灰の状態を見る',nextStepId:'ash'},
      {id:'cloth',label:'布には触れず周囲を見る',nextStepId:'cloth'},
      {id:'leave',label:'立ち去る',nextStepId:'leave'},
    ]},
    {id:'ash',phase:'resolution',title:'冷えた灰',text:'火はかなり前に消えている。急な襲撃より、意図的に出発したように見える。',choices:[{id:'finish',label:'記録する'}]},
    {id:'cloth',phase:'resolution',title:'置いていったもの',text:'布は目印のように石で押さえられている。誰かが戻るつもりなのかもしれない。',choices:[{id:'finish',label:'そのままにする'}]},
    {id:'leave',phase:'resolution',title:'無人のまま',text:'野営跡には手を加えず、その場を離れた。',choices:[{id:'finish',label:'進む'}]},
  ]},
  {id:'fracture-silent-rain',name:'音のない雨',tags:['ambient','quiet','fracture'],entryStepId:'observe',steps:[
    {id:'observe',phase:'observation',title:'音のない雨',text:'細い雨が降り始めた。しかし岩にも装備にも、雨音だけがしない。',choices:[
      {id:'listen',label:'耳を澄ます',nextStepId:'listen'},
      {id:'shelter',label:'岩陰でやり過ごす',nextStepId:'shelter'},
    ]},
    {id:'listen',phase:'resolution',title:'静かな雨',text:'異変はそれ以上広がらない。雨は数分で止み、普通の風音が戻った。',choices:[{id:'finish',label:'進む'}]},
    {id:'shelter',phase:'resolution',title:'通り雨',text:'何も起きないまま雨雲は去った。濡れた岩だけが残る。',choices:[{id:'finish',label:'岩陰を出る'}]},
  ]},
].map(normalizeAdventure4Scene).filter(Boolean);

export const ADVENTURE4_CONTENT_PACK_I_SCENES=Object.freeze(scenes);
export const ADVENTURE4_CONTENT_PACK_I_EVENTS=normalizeAdventure4EventCatalog([
  {id:'frontier-windbreak',sceneId:'frontier-windbreak',name:'風除けの石垣',weight:3,cooldownAdventures:1,tags:['ambient','quiet','frontier']},
  {id:'frontier-erased-sign',sceneId:'frontier-erased-sign',name:'削られた道標',weight:2,oneShot:true,tags:['investigation','frontier']},
  {id:'frontier-deer-trail',sceneId:'frontier-deer-trail',name:'獣道の交差',weight:3,cooldownAdventures:1,tags:['ambient','frontier']},
  {id:'elemental-steam',sceneId:'elemental-steam',name:'湯気の裂け目',weight:3,cooldownAdventures:1,tags:['ambient','investigation','elemental']},
  {id:'elemental-cairn',sceneId:'elemental-cairn',name:'積み石の避難標',weight:2,cooldownAdventures:2,tags:['investigation','elemental']},
  {id:'elemental-cloudsea',sceneId:'elemental-cloudsea',name:'雲海の切れ間',weight:3,cooldownAdventures:1,tags:['ambient','quiet','elemental']},
  {id:'fracture-echo',sceneId:'fracture-echo',name:'遅れて返る足音',weight:3,cooldownAdventures:1,tags:['ambient','anomaly','fracture']},
  {id:'fracture-camp',sceneId:'fracture-camp',name:'無人の野営跡',weight:2,cooldownAdventures:2,tags:['investigation','fracture']},
  {id:'fracture-silent-rain',sceneId:'fracture-silent-rain',name:'音のない雨',weight:3,cooldownAdventures:1,tags:['ambient','quiet','fracture']},
]);

export function adventure4ContentPackIForRegion(regionId){
  const events=ADVENTURE4_CONTENT_PACK_I_EVENTS.filter(event=>event.tags.includes(regionId));
  const sceneIds=new Set(events.map(event=>event.sceneId));
  return Object.freeze({events:Object.freeze(events),scenes:Object.freeze(ADVENTURE4_CONTENT_PACK_I_SCENES.filter(scene=>sceneIds.has(scene.id)))});
}
export function adventure4ContentPackISceneById(id){return ADVENTURE4_CONTENT_PACK_I_SCENES.find(scene=>scene.id===id)||null;}
