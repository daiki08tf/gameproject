/* System Deepening Pack B — collection depth helpers */

export const COMPANION_RARE_TRAITS=Object.freeze({
  breaker:{id:'breaker',name:'破砕感覚',desc:'ATK +6%',statMult:{atk:1.06}},
  iron_skin:{id:'iron_skin',name:'鉄皮',desc:'DEF +6%',statMult:{def:1.06}},
  swift:{id:'swift',name:'疾風脚',desc:'SPD +6%',statMult:{spd:1.06}},
  arcane:{id:'arcane',name:'魔力感応',desc:'MAG +6%',statMult:{mag:1.06}},
  learner:{id:'learner',name:'早熟',desc:'獲得EXP +8%',expMult:1.08},
});

export const COMPANION_EPITHETS=Object.freeze([
  '境界を越えた','星影を追う','古傷を持つ','静寂を聞く','群れを離れた','薄明に立つ',
]);

export function rollCompanionRareTrait(rng=Math.random){
  if(rng()>=0.08)return null;
  const ids=Object.keys(COMPANION_RARE_TRAITS);
  return ids[Math.floor(rng()*ids.length)]||null;
}

export function rollCompanionEpithet(rng=Math.random){
  if(rng()>=0.03)return null;
  return COMPANION_EPITHETS[Math.floor(rng()*COMPANION_EPITHETS.length)]||null;
}

export function companionRareTrait(id){return id?COMPANION_RARE_TRAITS[id]||null:null;}

export const CODEX_KNOWLEDGE_LEVELS=Object.freeze([
  {id:'unseen',label:'未遭遇',rank:0},
  {id:'seen',label:'Seen',rank:1},
  {id:'observed',label:'Observed',rank:2},
  {id:'studied',label:'Studied',rank:3},
  {id:'known',label:'Known',rank:4},
  {id:'mastered',label:'Mastered',rank:5},
]);

export function codexKnowledgeLevel(entry={}){
  if(!entry.seen)return CODEX_KNOWLEDGE_LEVELS[0];
  const kills=Number(entry.kills)||0;
  let rank=1;
  if(entry.behaviorKnown||kills>=1)rank=2;
  if(entry.analyzed||kills>=5)rank=3;
  if(kills>=10||(entry.analyzed&&kills>=5))rank=4;
  if(kills>=50||(entry.analyzed&&kills>=25))rank=5;
  return CODEX_KNOWLEDGE_LEVELS[rank];
}

export function rareEncounterLines({name='希少個体',first=false,ecology='boundary'}={}){
  if(!first)return [`✦ RARE ENCOUNTER — ${name}`];
  const intro={
    tomb:'墓室の空気が重く沈む。',forest:'森のざわめきが一瞬だけ途切れた。',canyon:'峡谷の骨が低く軋んだ。',library:'頁をめくる音だけが逆向きに響く。',temple:'月のない空に影が差した。',boundary:'周囲の気配が不自然に薄れた。',
  }[ecology]||'周囲の気配が不自然に薄れた。';
  return [intro,'何かがこちらを観測している。',`✦ RARE ENCOUNTER — ${name}`];
}
