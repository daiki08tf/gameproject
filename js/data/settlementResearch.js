export const RESEARCH_UNLOCK_HALL_LEVEL=10;

export const RESEARCH_DOMAINS=Object.freeze([
 {id:'taxonomy',name:'生態分類',icon:'📚',desc:'遭遇・解析済み個体の役割や行動記録を整理する。'},
 {id:'affinity',name:'属性相性',icon:'🧭',desc:'戦闘中に実際に観測されたAffinityだけを集計する。'},
 {id:'elite',name:'Elite Affix',icon:'💠',desc:'遭遇済みEliteが使用したAffix記録を整理する。'},
 {id:'rare',name:'Rare Behavior',icon:'👁️',desc:'Rare個体で実際に発生した特殊行動を整理する。'},
 {id:'boss',name:'Boss Phase',icon:'👑',desc:'観測・解析済みBoss Phaseだけを研究記録へ載せる。'},
]);

const uniq=values=>[...new Set(values.filter(Boolean))];
export function researchTier(evidence=0){const n=Math.max(0,Number(evidence)||0);if(n>=15)return 3;if(n>=5)return 2;if(n>=1)return 1;return 0;}
export function researchTierName(tier){return ['未着手','基礎整理','比較研究','蓄積解析'][Math.max(0,Math.min(3,Number(tier)||0))];}

export function buildResearchCodexReport(entries=[]){
 const seen=entries.filter(entry=>entry&&entry.seen);
 const analyzed=seen.filter(entry=>entry.analyzed);
 const affinities={};const elite=[];const rare=[];const skills=[];let bossPhaseObserved=0,roleKnown=0,behaviorKnown=0;
 for(const entry of seen){
  if(entry.roleKnown||entry.analyzed)roleKnown++;
  if(entry.behaviorKnown||entry.analyzed)behaviorKnown++;
  for(const [element,tier] of Object.entries(entry.observedAffinities||{})){if(!tier||tier==='neutral')continue;(affinities[element]??={})[tier]=((affinities[element]||{})[tier]||0)+1;}
  elite.push(...(Array.isArray(entry.observedEliteAffixes)?entry.observedEliteAffixes:[]));
  rare.push(...(Array.isArray(entry.observedRareBehaviors)?entry.observedRareBehaviors:[]));
  skills.push(...(Array.isArray(entry.observedSkills)?entry.observedSkills:[]));
  if(entry.bossPhase2Observed||entry.bossPhaseKnown)bossPhaseObserved++;
 }
 const affinityEvidence=Object.values(affinities).reduce((n,tiers)=>n+Object.values(tiers).reduce((m,v)=>m+(Number(v)||0),0),0);
 const domains={
  taxonomy:{evidence:roleKnown+behaviorKnown,details:{roleKnown,behaviorKnown,skills:uniq(skills)}},
  affinity:{evidence:affinityEvidence,details:{affinities}},
  elite:{evidence:uniq(elite).length,details:{observed:uniq(elite)}},
  rare:{evidence:uniq(rare).length,details:{observed:uniq(rare)}},
  boss:{evidence:bossPhaseObserved,details:{observed:bossPhaseObserved}},
 };
 for(const domain of Object.values(domains)){domain.tier=researchTier(domain.evidence);domain.tierName=researchTierName(domain.tier);}
 return{seenCount:seen.length,analyzedCount:analyzed.length,domains};
}

export function buildResearchOutlook({worldEvent=null,deepSurveys=[]}={}){
 const outlook=[];
 if(worldEvent?.name||worldEvent?.text)outlook.push({id:'world_event',icon:'🌐',title:'World Event観測',text:worldEvent.text||worldEvent.name,source:'World Event'});
 for(const survey of deepSurveys.filter(Boolean))outlook.push({id:`survey:${survey.id}`,icon:'🔭',title:survey.name||'Deep Survey',text:survey.hint||survey.role||'観測可能な深層領域がある。',source:'Deep Survey'});
 return outlook;
}
