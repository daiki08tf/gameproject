import { COMPANION_RARITY } from './companions.js';

export const RANCH_RESEARCH_MILESTONES = Object.freeze([
  {count:1,id:'discovered',label:'図鑑登録'},
  {count:3,id:'talent',label:'Talent詳細表示'},
  {count:5,id:'analysis',label:'弱点・耐性解析'},
  {count:10,id:'recruit',label:'加入率 +1pt'},
  {count:20,id:'rare_trait',label:'Rare Trait判別'},
  {count:30,id:'training',label:'育成EXP +10%'},
  {count:50,id:'species_trait',label:'種族Trait強化'},
  {count:75,id:'mutation_hint',label:'変異種ヒント'},
  {count:100,id:'mastered',label:'MASTERED'},
]);
export const RANCH_CAPACITY_BY_LEVEL = Object.freeze([12,20,35,50,75,100]);
export function ranchCapacity(ranchLevel=0){return RANCH_CAPACITY_BY_LEVEL[Math.max(0,Math.min(5,Math.floor(ranchLevel||0)))]||12;}
export function researchLevel(count=0){let lv=0;for(const m of RANCH_RESEARCH_MILESTONES)if(count>=m.count)lv++;return lv;}
export function researchUnlocked(count=0,id){const m=RANCH_RESEARCH_MILESTONES.find(x=>x.id===id);return !!m&&count>=m.count;}

// Living World & Discovery C6-4 — deterministic species grade. A pure
// function of how many times a species has been recruited (the same
// ranchResearch[speciesId].recruited counter above, not a new field), so
// no migration is needed: existing saves get the correct grade the first
// time it's computed. Reuses the exact count thresholds the research
// panel already surfaces (3/20/50/100 -- RANCH_RESEARCH_MILESTONES'
// 'talent'/'rare_trait'/'species_trait'/'mastered' steps) rather than
// inventing new numbers, so "your species graded up" always lines up with
// a research milestone the player already recognizes.
// This is a SEPARATE axis from an individual companion's own instance
// rarity (COMPANION_RARITY, rolled once at recruitment) -- grade
// describes the species as a whole and only ever goes up; it does not
// replace or reroll any existing instance's rarity.
export const SPECIES_GRADE_THRESHOLDS = Object.freeze([
  { grade: 'normal', count: 0 },
  { grade: 'rare', count: 3 },
  { grade: 'epic', count: 20 },
  { grade: 'legendary', count: 50 },
  { grade: 'mythic', count: 100 },
]);
export function speciesGrade(recruited=0){let g=SPECIES_GRADE_THRESHOLDS[0].grade;for(const t of SPECIES_GRADE_THRESHOLDS)if(recruited>=t.count)g=t.grade;return g;}
export function speciesGradeProgress(recruited=0){
  const count=Math.max(0,Math.floor(Number(recruited)||0));
  const idx=SPECIES_GRADE_THRESHOLDS.findIndex(t=>t.grade===speciesGrade(count));
  const next=SPECIES_GRADE_THRESHOLDS[idx+1]||null;
  return{grade:SPECIES_GRADE_THRESHOLDS[idx].grade,next:next?.grade||null,nextCount:next?.count??null,recruited:count};
}
export function talentGrade(value){const n=Number(value)||1;if(n>=1.20)return'SS';if(n>=1.10)return'S';if(n>=1.04)return'A';if(n>=.98)return'B';if(n>=.92)return'C';return'D';}
export function talentScore(talent={}){const vals=['hp','mp','atk','def','mag','spd'].map(k=>Number(talent[k])||1);return vals.reduce((a,b)=>a+b,0)/vals.length;}
export function godRollProfile(instance={}){const t=instance.talent||{},g=Object.fromEntries(Object.entries(t).map(([k,v])=>[k,talentGrade(v)]));const physical=(Number(t.atk)||0)>=1.15&&(Number(t.spd)||0)>=1.12;const tank=(Number(t.hp)||0)>=1.14&&(Number(t.def)||0)>=1.14;const magic=(Number(t.mag)||0)>=1.15&&(Number(t.mp)||0)>=1.10;const all=talentScore(t)>=1.145;return{isGodRoll:all||physical||tank||magic,profile:all?'万能':physical?'物理高速':tank?'耐久':magic?'魔導':null,grades:g,score:talentScore(t)};}
export function memoryValue(instance={}){const rarity=Math.max(0,COMPANION_RARITY.indexOf(instance.rarity));const score=Math.max(0,Math.round((talentScore(instance.talent)-.9)*50));return Math.max(1,1+rarity*2+score);}
