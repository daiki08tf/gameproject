/* Adventure / World 4.0 — W5 Scene Exploration Engine
   Pure Observation -> Investigation -> Resolution contracts.
   Scene data describes choices and consequence scopes; authoritative systems
   remain responsible for permanent Story/Discovery/Region/World mutations. */
import { adventure4ConditionMet } from './adventureWorld4Routes.js';

export const ADVENTURE4_CONSEQUENCE_SCOPES=Object.freeze(['immediate','adventure','region','world']);
const SCOPE_SET=new Set(ADVENTURE4_CONSEQUENCE_SCOPES);
const CLR6_STORY_AFTERMATH_NODE_ID='clr6-story-aftermath';
const CLR6_STORY_AFTERMATH_SCENE_ID='clr6-story-aftermath-scene';

function str(value){return typeof value==='string'&&value.length?value:null;}
function object(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
function list(value){return Array.isArray(value)?value:[];}

function normalizeConsequence(value){
  const src=object(value),scope=SCOPE_SET.has(src.scope)?src.scope:'immediate',type=str(src.type);
  if(!type)return null;
  return Object.freeze({scope,type,key:str(src.key),value:src.value??true,targetId:str(src.targetId)});
}

function normalizeChoice(value){
  const src=object(value),id=str(src.id),label=str(src.label);
  if(!id||!label)return null;
  return Object.freeze({
    id,label,
    detail:str(src.detail),
    condition:src.condition&&typeof src.condition==='object'&&!Array.isArray(src.condition)?Object.freeze({...src.condition}):null,
    nextStepId:str(src.nextStepId),
    resultText:str(src.resultText),
    consequences:Object.freeze(list(src.consequences).map(normalizeConsequence).filter(Boolean)),
  });
}

function normalizeStep(value){
  const src=object(value),id=str(src.id);
  if(!id)return null;
  return Object.freeze({
    id,
    phase:['observation','investigation','resolution'].includes(src.phase)?src.phase:'investigation',
    title:str(src.title),
    text:str(src.text)||'',
    choices:Object.freeze(list(src.choices).map(normalizeChoice).filter(Boolean)),
  });
}

export function normalizeAdventure4Scene(value){
  const src=object(value),id=str(src.id);
  if(!id)return null;
  const seen=new Set(),steps=[];
  for(const raw of list(src.steps)){
    const step=normalizeStep(raw);if(!step||seen.has(step.id))continue;seen.add(step.id);steps.push(step);
  }
  const entryStepId=str(src.entryStepId)||steps[0]?.id||null;
  return Object.freeze({id,name:str(src.name)||'探索',entryStepId,steps:Object.freeze(steps),tags:Object.freeze(list(src.tags).filter(x=>typeof x==='string'))});
}

export function adventure4SceneStep(scene,stepId){return scene?.steps?.find(step=>step.id===stepId)||null;}

export function validateAdventure4Scene(scene){
  const errors=[];
  if(!scene)return{ok:false,errors:['scene_missing']};
  const ids=new Set(scene.steps.map(step=>step.id));
  if(!scene.entryStepId||!ids.has(scene.entryStepId))errors.push('entry_step_missing');
  for(const step of scene.steps){
    for(const choice of step.choices)if(choice.nextStepId&&!ids.has(choice.nextStepId))errors.push(`missing_step:${step.id}->${choice.nextStepId}`);
  }
  return{ok:errors.length===0,errors};
}

export function adventure4SceneChoices(scene,stepId,context={}){
  const step=adventure4SceneStep(scene,stepId);if(!step)return[];
  return step.choices.filter(choice=>adventure4ConditionMet(choice.condition,context));
}

export function resolveAdventure4SceneChoice(scene,stepId,choiceId,context={}){
  const validation=validateAdventure4Scene(scene);if(!validation.ok)return{ok:false,reason:'invalid_scene',errors:validation.errors};
  const step=adventure4SceneStep(scene,stepId);if(!step)return{ok:false,reason:'step_missing'};
  const choice=step.choices.find(item=>item.id===choiceId);if(!choice)return{ok:false,reason:'choice_missing'};
  if(!adventure4ConditionMet(choice.condition,context))return{ok:false,reason:'requirement_unmet'};
  return{
    ok:true,
    sceneId:scene.id,
    stepId,
    choiceId,
    resultText:choice.resultText||'',
    nextStepId:choice.nextStepId,
    consequences:choice.consequences.map(item=>({...item})),
    complete:!choice.nextStepId,
  };
}

function buildPilotForkScene(region,route){
  const story=route.nodes.find(node=>node.id==='story');
  const inspectedEffects=[
    {scope:'adventure',type:'flag',key:'inspectedPilotFork',value:true},
    ...(region.id==='frontier'?[{scope:'adventure',type:'trace',key:'frontier-pilot-fresh-tracks'}]:[]),
  ];
  const steps=[
    {id:'observe',phase:'observation',title:'分かれ道',text:`${region.name}の道は二つに分かれている。片方は主要路へ、もう片方は安全な帰還路へ続いている。`,choices:[
      {id:'inspect',label:'周囲を調べる',detail:'足跡や道標を確認する',nextStepId:'inspect'},
      ...(story?[{id:'story',label:'主要路を進む',detail:story.name,nextStepId:'resolve-story'}]:[]),
      {id:'return',label:'拠点へ戻る',detail:'成果を持って安全に帰還する',nextStepId:'resolve-return'},
    ]},
    {id:'inspect',phase:'investigation',title:'道の痕跡',text:'主要路には新しい足跡が続いている。帰還路の標識はまだ無事だ。どうする？',choices:[
      ...(story?[{id:'story-after-inspect',label:'足跡を追う',detail:'主要路へ進む',nextStepId:'resolve-story-inspected'}]:[]),
      {id:'return-after-inspect',label:'記録して帰還する',detail:'調査結果を持ち帰る',nextStepId:'resolve-return-inspected'},
    ]},
    ...(story?[
      {id:'resolve-story',phase:'resolution',title:'主要路へ',text:'覚悟を決めて主要路へ進む。前方に戦いの気配が近づいている。',choices:[{id:'continue-story',label:'先へ進む',consequences:[{scope:'immediate',type:'routeTarget',targetId:'story'}]}]},
      {id:'resolve-story-inspected',phase:'resolution',title:'痕跡を追う',text:'新しい足跡は主要路の先へ続いている。痕跡を記録し、そのまま追跡を続ける。',choices:[{id:'continue-story-inspected',label:'足跡を追う',consequences:[...inspectedEffects,{scope:'immediate',type:'routeTarget',targetId:'story'}]}]},
    ]:[]),
    {id:'resolve-return',phase:'resolution',title:'帰還',text:'無理に先へ進まず、現在の成果を持って拠点へ戻ることにした。',choices:[{id:'continue-return',label:'帰還する',consequences:[{scope:'immediate',type:'routeTarget',targetId:'return'}]}]},
    {id:'resolve-return-inspected',phase:'resolution',title:'記録して帰還',text:'道標と足跡の様子を記録した。次の冒険に備えて拠点へ持ち帰る。',choices:[{id:'continue-return-inspected',label:'記録を持ち帰る',consequences:[...inspectedEffects,{scope:'immediate',type:'routeTarget',targetId:'return'}]}]},
  ];
  return normalizeAdventure4Scene({id:'pilot-fork',name:'分かれ道',entryStepId:'observe',tags:['pilot','route-choice','legacy-entry'],steps});
}

function buildClr6StoryAftermathScene(region,route){
  const story=route.nodes.find(node=>node.id==='story');
  const aftermath=route.nodes.find(node=>node.id===CLR6_STORY_AFTERMATH_NODE_ID);
  if(!story||!aftermath)return null;
  const outcomeEffects=region.id==='frontier'
    ?[{scope:'adventure',type:'trace',key:'frontier-pilot-fresh-tracks'}]
    :[];
  return normalizeAdventure4Scene({
    id:CLR6_STORY_AFTERMATH_SCENE_ID,
    name:'戦いの跡',
    entryStepId:'observe',
    tags:['story','clr6-story-outcome','combat-aftermath','clr7-investigation-outcome'],
    steps:[
      {
        id:'observe',phase:'observation',title:'戦いの跡',
        text:`${story.name}を越えた先に、戦う前には見えなかった痕跡が残されている。${region.name}で何が起きているのか、その断片を拾えそうだ。`,
        choices:[{id:'inspect',label:'痕跡を確かめる',detail:'戦闘の結果から世界の断片を読む',nextStepId:'resolve'}],
      },
      {
        id:'resolve',phase:'resolution',title:'見えてきた断片',
        text:'敵の配置、傷跡、残された痕跡が一本につながる。物語は説明として与えられるのではなく、勝ち抜いた場所そのものから見えてきた。',
        choices:[{id:'record-and-return',label:'記録して帰還する',consequences:[...outcomeEffects,{scope:'immediate',type:'routeTarget',targetId:'return'}]}],
      },
    ],
  });
}

export function buildAdventure4PilotSceneCatalog(region,route){
  if(!region||!route)return[];
  return [buildPilotForkScene(region,route),buildClr6StoryAftermathScene(region,route)].filter(Boolean);
}

export function adventure4SceneById(catalog,id){return catalog?.find(scene=>scene?.id===id)||null;}
