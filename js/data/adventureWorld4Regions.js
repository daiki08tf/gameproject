/* Adventure / World 4.0 — W1 World / Region Data Model
   Existing World 3 region grouping and chapter/stage data stay authoritative.
   This module only adapts them into a stable Adventure-facing metadata model. */
import { WORLD3_REGIONS } from './world3Regions.js';

const STATE_LABELS=Object.freeze({locked:'未到達',available:'探索可能',active:'探索中',completed:'踏破済み'});

function unique(values){return [...new Set(values.filter(Boolean))];}
function primaryStages(chapter){return (chapter?.stages||[]).filter(stage=>!stage.branch);}
function chapterByNumber(chapters,number){return chapters.find(ch=>Number(ch.num)===Number(number))||chapters[Number(number)-1]||null;}
function stageLevels(chapters){return chapters.flatMap(ch=>(ch?.stages||[]).map(stage=>Number(stage.recLevel)).filter(Number.isFinite));}
function rangeFor(chapters){const levels=stageLevels(chapters);return levels.length?{min:Math.min(...levels),max:Math.max(...levels)}:{min:1,max:1};}
function themeFor(chapters,region){
  const themes=unique(chapters.flatMap(ch=>(ch?.stages||[]).map(stage=>stage.regionTheme)));
  return {label:themes.length?themes.join(' / '):region.subtitle,themes};
}
function discoveryRefsFor(chapters){
  const seen=new Set(),refs=[];
  for(const chapter of chapters){
    for(const stage of chapter?.stages||[]){
      for(const event of stage.explorationEvents||[]){
        if(!event?.id||seen.has(event.id))continue;
        seen.add(event.id);
        refs.push(Object.freeze({id:event.id,name:event.name||'未詳の発見',kind:event.kind||'discovery'}));
      }
    }
  }
  return refs;
}
function routeEntriesFor(chapters){
  return chapters.map(chapter=>{
    const entry=primaryStages(chapter)[0]||chapter?.stages?.[0];
    if(!entry)return null;
    return Object.freeze({chapterNumber:Number(chapter.num),chapterName:chapter.name||`第${chapter.num}章`,stageId:entry.id,stageName:entry.name});
  }).filter(Boolean);
}

export function buildWorld4RegionCatalog(chapters,regions=WORLD3_REGIONS){
  return regions.map(region=>{
    const ownedChapters=region.chapters.map(n=>chapterByNumber(chapters,n)).filter(Boolean);
    const recommended=rangeFor(ownedChapters),theme=themeFor(ownedChapters,region);
    return Object.freeze({
      id:region.id,
      name:region.name,
      subtitle:region.subtitle,
      tone:region.tone,
      chapterNumbers:Object.freeze([...region.chapters]),
      theme:Object.freeze(theme),
      recommended:Object.freeze(recommended),
      routeEntries:Object.freeze(routeEntriesFor(ownedChapters)),
      discoveryRefs:Object.freeze(discoveryRefsFor(ownedChapters)),
    });
  });
}

function bossFor(chapter){return chapter?.stages?.find(stage=>stage.boss&&!stage.branch)||chapter?.stages?.find(stage=>stage.boss)||chapter?.stages?.at(-1)||null;}
function nextStoryStage(chapter,isStageCleared){
  const story=primaryStages(chapter);
  return story.find(stage=>!isStageCleared(stage.id))||null;
}

export function world4RegionState(region,chapters,{isStageCleared=()=>false,isChapterUnlocked=()=>true}={}){
  const ownedChapters=region.chapterNumbers.map(n=>chapterByNumber(chapters,n)).filter(Boolean);
  const unlockedChapters=ownedChapters.filter(ch=>isChapterUnlocked(Number(ch.num)-1));
  if(unlockedChapters.length===0)return Object.freeze({status:'locked',label:STATE_LABELS.locked,clearedChapters:0,totalChapters:ownedChapters.length,routeEntry:null});
  const clearedChapters=ownedChapters.filter(ch=>{const boss=bossFor(ch);return !!boss&&isStageCleared(boss.id);}).length;
  const completed=ownedChapters.length>0&&clearedChapters===ownedChapters.length;
  let routeEntry=null;
  for(const chapter of unlockedChapters){
    const stage=nextStoryStage(chapter,isStageCleared);
    if(stage){routeEntry=Object.freeze({chapterNumber:Number(chapter.num),chapterName:chapter.name||`第${chapter.num}章`,stageId:stage.id,stageName:stage.name});break;}
  }
  const status=completed?'completed':clearedChapters>0?'active':'available';
  return Object.freeze({status,label:STATE_LABELS[status],clearedChapters,totalChapters:ownedChapters.length,routeEntry});
}

export function world4RegionPresentation(region,state){
  const min=region.recommended.min,max=region.recommended.max;
  return Object.freeze({
    name:region.name,
    subtitle:region.subtitle,
    theme:region.theme.label,
    recommendedLabel:min===max?`推奨Lv ${min}`:`推奨Lv ${min}〜${max}`,
    stateLabel:state.label,
    progressLabel:`${state.clearedChapters}/${state.totalChapters}章 踏破`,
    routeLabel:state.routeEntry?`${state.routeEntry.chapterName}：${state.routeEntry.stageName}`:null,
    discoveries:region.discoveryRefs.map(ref=>Object.freeze({name:ref.name,kind:ref.kind})),
  });
}

export function world4RegionById(catalog,id){return catalog.find(region=>region.id===id)||null;}
