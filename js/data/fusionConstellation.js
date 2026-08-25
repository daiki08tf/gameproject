/* Phase 8 — Fusion Constellation layer.
   Every 15C2 fusion gets Trait → Keystone → Ultimate.
   Five model jobs are now hand-authored to establish the quality bar for later 105-job expansion. */
import { FUSION_JOBS } from './jobFusionRegistry.js';

const ARCH=Object.freeze({
 warrior:{stat:'atk',mult:1.05,label:'武威',effect:{kind:'bossDmg',power:.05}}, fighter:{stat:'spd',mult:1.05,label:'闘気',effect:{kind:'dmgBonusAdd',power:.04}},
 mage:{stat:'mag',mult:1.06,label:'魔導',effect:{kind:'spellDmgAdd',power:.05}}, priest:{stat:'hp',mult:1.05,label:'聖祈',effect:{kind:'regen',power:.008}},
 thief:{stat:'spd',mult:1.05,label:'影技',effect:{kind:'dmgBonusAdd',power:.04}}, merchant:{stat:'hp',mult:1.04,label:'商魂',effect:{kind:'dmgBonusAdd',power:.03}},
 hunter:{stat:'atk',mult:1.05,label:'狩猟',effect:{kind:'bossDmg',power:.05}}, ninja:{stat:'spd',mult:1.06,label:'忍道',effect:{kind:'dmgBonusAdd',power:.05}},
 bard:{stat:'mag',mult:1.05,label:'旋律',effect:{kind:'regen',power:.007}}, dancer:{stat:'spd',mult:1.05,label:'舞踏',effect:{kind:'dmgBonusAdd',power:.04}},
 alchemist:{stat:'mag',mult:1.05,label:'錬成',effect:{kind:'dmgBonusAdd',power:.05}}, scholar:{stat:'mag',mult:1.05,label:'叡智',effect:{kind:'spellDmgAdd',power:.04}},
 farmer:{stat:'hp',mult:1.06,label:'大地',effect:{kind:'regen',power:.008}}, craftsman:{stat:'def',mult:1.06,label:'匠技',effect:{kind:'dmgBonusAdd',power:.03}},
 fortune:{stat:'mag',mult:1.04,label:'運命',effect:{kind:'dmgBonusAdd',power:.05}},
});
const P=(kind,power)=>({trigger:'passive',kind,power});
function effect(e,scale=1){return P(e.kind,e.power*scale);}
function generic(job){const[a,b]=job.parents,A=ARCH[a],B=ARCH[b];return Object.freeze([
 Object.freeze({id:`${job.id}_trait`,kind:'fusionTrait',cost:1,name:`${A.label}と${B.label}`,desc:`${A.stat.toUpperCase()}+${Math.round((A.mult-1)*100)}% / ${B.stat.toUpperCase()}+${Math.round((B.mult-1)*100)}%`,requires:[],statMult:{[A.stat]:A.mult,[B.stat]:(A.stat===B.stat?A.mult*B.mult:B.mult)}}),
 Object.freeze({id:`${job.id}_keystone`,kind:'fusionKeystone',cost:2,name:`${job.name}の極意`,desc:'両親職の戦闘特性が同時に発現する。',requires:[`${job.id}_trait`],effects:[effect(A.effect),effect(B.effect)]}),
 Object.freeze({id:`${job.id}_ultimate`,kind:'fusionUltimate',cost:3,name:`奥義・${job.name}`,desc:'Fusion Jobを極めた者だけが得る究極特性。',requires:[`${job.id}_keystone`],effects:[effect(A.effect,1.5),effect(B.effect,1.5)]}),
]);}
function authored(job,defs){return Object.freeze(defs.map((d,i)=>Object.freeze({id:`${job.id}_${['trait','keystone','ultimate'][i]}`,cost:[1,2,3][i],requires:i?[`${job.id}_${i===1?'trait':'keystone'}`]:[],...d})));}
const SIGNATURE=Object.freeze({
 spellblade:(job)=>authored(job,[
  {kind:'fusionTrait',name:'魔装剣',desc:'ATK+6% / MAG+8%。物理と魔力を同じ主軸として扱う。',statMult:{atk:1.06,mag:1.08}},
  {kind:'fusionKeystone',name:'属性共鳴',desc:'特技とじゅもん双方を強化し、属性を切り替えて攻める型。',effects:[P('skillDmgAdd',.10),P('spellDmgAdd',.10)]},
  {kind:'fusionUltimate',name:'奥義・エレメントブレイク',desc:'Bossへの与ダメージと特技・じゅもん火力を同時に引き上げる。',effects:[P('bossDmg',.16),P('skillDmgAdd',.12),P('spellDmgAdd',.12)]},
 ]),
 paladin:(job)=>authored(job,[
  {kind:'fusionTrait',name:'聖盾',desc:'HP+8% / DEF+8%。前線維持を最優先する。',statMult:{hp:1.08,def:1.08}},
  {kind:'fusionKeystone',name:'守護の誓い',desc:'防御行動と継続回復を強化する。',effects:[P('guardMitigation',.15),P('regen',.012)]},
  {kind:'fusionUltimate',name:'奥義・最後の聖域',desc:'Boss特殊攻撃への耐性と自己再生を大幅に強化する。',effects:[P('bossSpecialMitigation',.20),P('regen',.018),P('guardMitigation',.10)]},
 ]),
 battlemaster:(job)=>authored(job,[
  {kind:'fusionTrait',name:'羅刹身',desc:'ATK+8% / SPD+6%。攻撃の手を止めない。',statMult:{atk:1.08,spd:1.06}},
  {kind:'fusionKeystone',name:'連撃修羅',desc:'通常攻撃速度と通常攻撃火力を同時に高める。',effects:[P('atkSpeedAdd',.12),P('normalDmgAdd',.12)]},
  {kind:'fusionUltimate',name:'奥義・阿修羅連環',desc:'会心火力と総ダメージを引き上げる攻撃特化奥義。',effects:[P('critDamageBoost',.22),P('dmgBonusAdd',.12)]},
 ]),
 sage:(job)=>authored(job,[
  {kind:'fusionTrait',name:'叡聖回路',desc:'MAG+9% / MP+10%。長期詠唱戦に特化する。',statMult:{mag:1.09,mp:1.10}},
  {kind:'fusionKeystone',name:'無窮詠唱',desc:'じゅもん火力を高めながらMP消費を抑える。',effects:[P('spellDmgAdd',.12),P('mpCostReduce',.10)]},
  {kind:'fusionUltimate',name:'奥義・賢者の星界',desc:'じゅもん火力・再使用速度・MP効率を同時強化する。',effects:[P('spellDmgAdd',.16),P('cdrAdd',.08),P('mpCostReduce',.08)]},
 ]),
 assassinfist:(job)=>authored(job,[
  {kind:'fusionTrait',name:'殺拳',desc:'ATK+7% / SPD+8% / Crit+5pt。急所へ最短で届く。',statMult:{atk:1.07,spd:1.08},statAdd:{critPct:5}},
  {kind:'fusionKeystone',name:'絶命連打',desc:'瀕死の敵への決定力と攻撃速度を強化する。',effects:[P('executioner',.14),P('atkSpeedAdd',.10)]},
  {kind:'fusionUltimate',name:'奥義・無影絶殺',desc:'会心火力と処刑性能を極限まで伸ばす。',effects:[P('critDamageBoost',.25),P('executioner',.18)]},
 ]),
});
function build(job){return SIGNATURE[job.id]?SIGNATURE[job.id](job):generic(job);}
export const FUSION_CONSTELLATIONS=Object.freeze(Object.fromEntries(FUSION_JOBS.map(j=>[j.id,build(j)])));
export function fusionConstellationFor(id){return FUSION_CONSTELLATIONS[id]||[];}
