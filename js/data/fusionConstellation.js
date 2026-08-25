/* Phase 8 — Fusion Constellation layer.
   Every 15C2 fusion gets Trait → Keystone → Ultimate.
   Five signature jobs are hand-authored; every other Fusion now receives a
   role-aware bespoke kit instead of the old parent-effect copy fallback. */
import { FUSION_JOBS } from './jobFusionRegistry.js';

const ARCH=Object.freeze({
 warrior:{stat:'atk',mult:1.05,label:'武威'}, fighter:{stat:'spd',mult:1.05,label:'闘気'}, mage:{stat:'mag',mult:1.06,label:'魔導'}, priest:{stat:'hp',mult:1.05,label:'聖祈'},
 thief:{stat:'spd',mult:1.05,label:'影技'}, merchant:{stat:'hp',mult:1.04,label:'商魂'}, hunter:{stat:'atk',mult:1.05,label:'狩猟'}, ninja:{stat:'spd',mult:1.06,label:'忍道'},
 bard:{stat:'mag',mult:1.05,label:'旋律'}, dancer:{stat:'spd',mult:1.05,label:'舞踏'}, alchemist:{stat:'mag',mult:1.05,label:'錬成'}, scholar:{stat:'mag',mult:1.05,label:'叡智'},
 farmer:{stat:'hp',mult:1.06,label:'大地'}, craftsman:{stat:'def',mult:1.06,label:'匠技'}, fortune:{stat:'mag',mult:1.04,label:'運命'},
});
const P=(kind,power)=>({trigger:'passive',kind,power});
function authored(job,defs){return Object.freeze(defs.map((d,i)=>Object.freeze({id:`${job.id}_${['trait','keystone','ultimate'][i]}`,cost:[1,2,3][i],requires:i?[`${job.id}_${i===1?'trait':'keystone'}`]:[],...d})));}
const SIGNATURE=Object.freeze({
 spellblade:(job)=>authored(job,[{kind:'fusionTrait',name:'魔装剣',desc:'ATK+6% / MAG+8%。物理と魔力を同じ主軸として扱う。',statMult:{atk:1.06,mag:1.08}},{kind:'fusionKeystone',name:'属性共鳴',desc:'特技とじゅもん双方を強化し、属性を切り替えて攻める型。',effects:[P('skillDmgAdd',.10),P('spellDmgAdd',.10)]},{kind:'fusionUltimate',name:'奥義・エレメントブレイク',desc:'Bossへの与ダメージと特技・じゅもん火力を同時に引き上げる。',effects:[P('bossDmg',.16),P('skillDmgAdd',.12),P('spellDmgAdd',.12)]}]),
 paladin:(job)=>authored(job,[{kind:'fusionTrait',name:'聖盾',desc:'HP+8% / DEF+8%。前線維持を最優先する。',statMult:{hp:1.08,def:1.08}},{kind:'fusionKeystone',name:'守護の誓い',desc:'防御行動と継続回復を強化する。',effects:[P('guardMitigation',.15),P('regen',.012)]},{kind:'fusionUltimate',name:'奥義・最後の聖域',desc:'Boss特殊攻撃への耐性と自己再生を大幅に強化する。',effects:[P('bossSpecialMitigation',.20),P('regen',.018),P('guardMitigation',.10)]}]),
 battlemaster:(job)=>authored(job,[{kind:'fusionTrait',name:'羅刹身',desc:'ATK+8% / SPD+6%。攻撃の手を止めない。',statMult:{atk:1.08,spd:1.06}},{kind:'fusionKeystone',name:'連撃修羅',desc:'通常攻撃速度と通常攻撃火力を同時に高める。',effects:[P('atkSpeedAdd',.12),P('normalDmgAdd',.12)]},{kind:'fusionUltimate',name:'奥義・阿修羅連環',desc:'会心火力と総ダメージを引き上げる攻撃特化奥義。',effects:[P('critDamageBoost',.22),P('dmgBonusAdd',.12)]}]),
 sage:(job)=>authored(job,[{kind:'fusionTrait',name:'叡聖回路',desc:'MAG+9% / MP+10%。長期詠唱戦に特化する。',statMult:{mag:1.09,mp:1.10}},{kind:'fusionKeystone',name:'無窮詠唱',desc:'じゅもん火力を高めながらMP消費を抑える。',effects:[P('spellDmgAdd',.12),P('mpCostReduce',.10)]},{kind:'fusionUltimate',name:'奥義・賢者の星界',desc:'じゅもん火力・再使用速度・MP効率を同時強化する。',effects:[P('spellDmgAdd',.16),P('cdrAdd',.08),P('mpCostReduce',.08)]}]),
 assassinfist:(job)=>authored(job,[{kind:'fusionTrait',name:'殺拳',desc:'ATK+7% / SPD+8% / Crit+5pt。急所へ最短で届く。',statMult:{atk:1.07,spd:1.08},statAdd:{critPct:5}},{kind:'fusionKeystone',name:'絶命連打',desc:'瀕死の敵への決定力と攻撃速度を強化する。',effects:[P('executioner',.14),P('atkSpeedAdd',.10)]},{kind:'fusionUltimate',name:'奥義・無影絶殺',desc:'会心火力と処刑性能を極限まで伸ばす。',effects:[P('critDamageBoost',.25),P('executioner',.18)]}]),
});

const GROUPS=Object.freeze({
 martial:new Set(['warrior','fighter','hunter','ninja']), arcane:new Set(['mage','alchemist','scholar','fortune']),
 support:new Set(['priest','bard','dancer','farmer']), utility:new Set(['thief','merchant','craftsman']),
});
function roleOf(job){const p=job.parents;const n=g=>p.filter(x=>GROUPS[g].has(x)).length;if(n('martial')===2)return'martial';if(n('arcane')===2)return'arcane';if(n('support')===2)return'support';if(n('utility')===2)return'utility';if(n('martial')&&n('arcane'))return'spellblade';if(n('martial')&&n('support'))return'guardian';if(n('martial')&&n('utility'))return'skirmisher';if(n('arcane')&&n('support'))return'mystic';if(n('arcane')&&n('utility'))return'artificer';if(n('support')&&n('utility'))return'provisioner';return'hybrid';}
const ROLE=Object.freeze({
 martial:{title:'武極',effects:[P('normalDmgAdd',.10),P('atkSpeedAdd',.08)],ult:[P('critDamageBoost',.18),P('bossDmg',.10)]},
 arcane:{title:'秘奥',effects:[P('spellDmgAdd',.12),P('mpCostReduce',.07)],ult:[P('spellDmgAdd',.14),P('cdrAdd',.07)]},
 support:{title:'加護',effects:[P('regen',.010),P('guardMitigation',.08)],ult:[P('regen',.014),P('bossSpecialMitigation',.12)]},
 utility:{title:'技巧',effects:[P('dmgBonusAdd',.08),P('goldMultAdd',.08)],ult:[P('executioner',.10),P('dropRateMultAdd',.10)]},
 spellblade:{title:'魔戦',effects:[P('skillDmgAdd',.09),P('spellDmgAdd',.09)],ult:[P('bossDmg',.12),P('dmgBonusAdd',.10)]},
 guardian:{title:'守戦',effects:[P('guardMitigation',.11),P('normalDmgAdd',.08)],ult:[P('bossSpecialMitigation',.14),P('bossDmg',.08)]},
 skirmisher:{title:'遊撃',effects:[P('atkSpeedAdd',.10),P('executioner',.09)],ult:[P('critDamageBoost',.16),P('dmgBonusAdd',.10)]},
 mystic:{title:'神秘',effects:[P('spellDmgAdd',.09),P('regen',.009)],ult:[P('cdrAdd',.06),P('bossSpecialMitigation',.10)]},
 artificer:{title:'錬機',effects:[P('skillDmgAdd',.09),P('dmgBonusAdd',.08)],ult:[P('spellDmgAdd',.10),P('dropRateMultAdd',.08)]},
 provisioner:{title:'支度',effects:[P('regen',.008),P('goldMultAdd',.08)],ult:[P('guardMitigation',.08),P('dropRateMultAdd',.10)]},
 hybrid:{title:'融星',effects:[P('dmgBonusAdd',.08)],ult:[P('bossDmg',.10)]},
});
function roleBuild(job){const[a,b]=job.parents,A=ARCH[a],B=ARCH[b],r=ROLE[roleOf(job)];const statMult={[A.stat]:A.mult};statMult[B.stat]=A.stat===B.stat?A.mult*B.mult:B.mult;return authored(job,[
 {kind:'fusionTrait',name:`${job.name}・双星`,desc:`${A.label}と${B.label}の資質を融合する。`,statMult},
 {kind:'fusionKeystone',name:`${r.title}・${job.name}`,desc:`${job.name}固有の役割を完成させる中核特性。`,effects:r.effects},
 {kind:'fusionUltimate',name:`奥義・${job.name}極星`,desc:`${job.name}の二つの系譜を極限まで引き出す。`,effects:r.ult},
 ]);}
function build(job){return SIGNATURE[job.id]?SIGNATURE[job.id](job):roleBuild(job);}
export const FUSION_CONSTELLATIONS=Object.freeze(Object.fromEntries(FUSION_JOBS.map(j=>[j.id,build(j)])));
export function fusionConstellationFor(id){return FUSION_CONSTELLATIONS[id]||[];}
export function fusionRoleFor(id){const job=FUSION_JOBS.find(j=>j.id===id);return job?roleOf(job):null;}
