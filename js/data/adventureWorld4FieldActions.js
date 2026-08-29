/* Adventure / World 4.0 — W14-W17 build expression definitions.
   Existing Job / Companion / Equipment 3.0 / Rune 2.0 remain authoritative.
   This layer only translates existing build state into exploration approaches. */
import { normalizeAdventure4Scene } from './adventureWorld4Scenes.js';

export const ADVENTURE4_FIELD_ACTIONS=Object.freeze({
  scout:Object.freeze({id:'scout',name:'偵察',desc:'危険や安全な経路を先に読む'}),
  track:Object.freeze({id:'track',name:'追跡',desc:'痕跡から対象や道筋を追う'}),
  analyze:Object.freeze({id:'analyze',name:'解析',desc:'構造・魔力・異常を読み解く'}),
  force:Object.freeze({id:'force',name:'突破',desc:'障害物を力や技術で排除する'}),
  negotiate:Object.freeze({id:'negotiate',name:'交渉',desc:'NPCや知性ある存在から情報を引き出す'}),
  anomaly:Object.freeze({id:'anomaly',name:'異常感知',desc:'Riftや隠れた違和感を察知する'}),
});

export const ADVENTURE4_JOB_FIELD_ACTIONS=Object.freeze({
  warrior:['force'],fighter:['force'],craftsman:['force','analyze'],
  thief:['scout','track'],hunter:['scout','track'],ninja:['scout','track'],
  mage:['analyze','anomaly'],scholar:['analyze','anomaly'],alchemist:['analyze'],
  priest:['anomaly','negotiate'],merchant:['negotiate'],bard:['negotiate'],dancer:['negotiate','scout'],
  farmer:['track'],
});

export const ADVENTURE4_COMPANION_TRAIT_ACTIONS=Object.freeze({
  '夜目':['scout'],'腐食嗅覚':['track'],'機械装甲':['analyze','force'],'晶殻':['analyze'],
  '雷駆':['scout'],'白銀の脚':['track'],'神狼の血':['track','anomaly'],'月喰':['anomaly'],'冥牙':['anomaly'],
});

export const ADVENTURE4_COMPANION_NATURE_ACTIONS=Object.freeze({
  cautious:['scout'],clever:['analyze'],quick:['track'],brave:['force'],balanced:[],
});

export const ADVENTURE4_RUNE_FIELD_ACTIONS=Object.freeze({
  observe:['analyze'],hawkeye:['scout','track'],illusion:['anomaly'],bond:['negotiate'],craft:['force','analyze'],fate:['anomaly'],wise:['analyze'],force:['force'],
});

export const ADVENTURE4_REGIONAL_GEAR=Object.freeze({
  frontier:Object.freeze({id:'frontier-trail',name:'辺境踏破装備',fieldActions:['scout','track']}),
  elemental:Object.freeze({id:'elemental-resonance',name:'四境共鳴装備',fieldActions:['analyze','anomaly']}),
  fracture:Object.freeze({id:'fracture-surveyor',name:'裂域測量装備',fieldActions:['scout','anomaly']}),
  'last-mortal':Object.freeze({id:'last-mortal-vanguard',name:'人界最奥装備',fieldActions:['force','track']}),
  veil:Object.freeze({id:'veil-reader',name:'帳解析装備',fieldActions:['analyze','negotiate']}),
  'outer-world':Object.freeze({id:'outer-world-expedition',name:'外縁遠征装備',fieldActions:['force','anomaly']}),
  'reverse-observation':Object.freeze({id:'reverse-observer',name:'逆観測装備',fieldActions:['analyze','anomaly']}),
});

export function adventure4RegionalGearProfile(regionId){return ADVENTURE4_REGIONAL_GEAR[regionId]||null;}

export function buildAdventure4BuildExpressionScene(regionId='frontier'){
  const profile=adventure4RegionalGearProfile(regionId)||ADVENTURE4_REGIONAL_GEAR.frontier;
  return normalizeAdventure4Scene({
    id:`build-expression-${regionId}`,
    name:'塞がれた旧道',
    entryStepId:'observe',
    tags:['w14','w15','w16','w17','field-action'],
    steps:[
      {id:'observe',phase:'observation',title:'塞がれた旧道',text:'崩れた道標の先で旧道が途切れている。正面から調べることも、今のビルドを活かして別の読み方をすることもできる。',choices:[
        {id:'normal',label:'周囲を普通に調べる',detail:'誰でも使える安全な方法',nextStepId:'resolve-normal'},
        {id:'scout',label:'先を偵察する',detail:'Job・仲間・地域装備・Runeのいずれか',condition:{flag:'field:scout'},nextStepId:'resolve-scout'},
        {id:'analyze',label:'痕跡を解析する',detail:'Job・仲間・地域装備・Runeのいずれか',condition:{flag:'field:analyze'},nextStepId:'resolve-analyze'},
        {id:'force',label:'障害を突破する',detail:'Job・仲間・地域装備・Runeのいずれか',condition:{flag:'field:force'},nextStepId:'resolve-force'},
        {id:'anomaly',label:'違和感を辿る',detail:'Job・仲間・地域装備・Runeのいずれか',condition:{flag:'field:anomaly'},nextStepId:'resolve-anomaly'},
      ]},
      {id:'resolve-normal',phase:'resolution',title:'地道な調査',text:'時間はかかったが迂回路を確認できた。特定ビルドがなくても探索は進められる。',choices:[{id:'finish',label:'記録して進む',consequences:[{scope:'adventure',type:'flag',key:'field:lastApproach',value:'normal'}]}]},
      {id:'resolve-scout',phase:'resolution',title:'偵察成功',text:'危険な崩落箇所を避け、短い抜け道を見つけた。',choices:[{id:'finish',label:'抜け道を記録する',consequences:[{scope:'adventure',type:'flag',key:'field:lastApproach',value:'scout'}]}]},
      {id:'resolve-analyze',phase:'resolution',title:'解析成功',text:'古い道標の規則性から安全な足場を特定した。',choices:[{id:'finish',label:'解析結果を記録する',consequences:[{scope:'adventure',type:'flag',key:'field:lastApproach',value:'analyze'}]}]},
      {id:'resolve-force',phase:'resolution',title:'突破成功',text:'崩落物を処理して通行可能な幅を確保した。',choices:[{id:'finish',label:'通路を記録する',consequences:[{scope:'adventure',type:'flag',key:'field:lastApproach',value:'force'}]}]},
      {id:'resolve-anomaly',phase:'resolution',title:'異常感知',text:'通常の道とは違う反応を辿り、隠れた地形の継ぎ目を見つけた。',choices:[{id:'finish',label:'違和感を記録する',consequences:[{scope:'adventure',type:'flag',key:'field:lastApproach',value:'anomaly'}]}]},
    ],
  });
}
