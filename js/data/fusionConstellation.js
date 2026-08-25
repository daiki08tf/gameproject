/* Phase 8 — Fusion Skill Constellations.
   Every Fusion Job now has a real branch:
   Trait → parent-A specialization → Keystone A ┐
                                                ├→ Ultimate
   Trait → parent-B specialization → Keystone B ┘

   Existing `_trait`, `_keystone`, `_ultimate` IDs are preserved so old saves
   keep their purchases. The original `_keystone` becomes branch A's Keystone.
*/
import { FUSION_JOBS } from './jobFusionRegistry.js';

const P=(kind,power)=>({trigger:'passive',kind,power});
const ARCH=Object.freeze({
 warrior:{label:'武威',statMult:{atk:1.05,def:1.04},path:[P('guardMitigation',.08),P('normalDmgAdd',.06)],key:[P('bossDmg',.10),P('guardMitigation',.06)]},
 fighter:{label:'闘気',statMult:{atk:1.05,spd:1.04},path:[P('atkSpeedAdd',.08),P('normalDmgAdd',.07)],key:[P('critDamageBoost',.16),P('atkSpeedAdd',.07)]},
 mage:{label:'魔導',statMult:{mag:1.06,mp:1.05},path:[P('spellDmgAdd',.09),P('mpCostReduce',.05)],key:[P('spellDmgAdd',.13),P('cdrAdd',.05)]},
 priest:{label:'聖祈',statMult:{hp:1.05,mag:1.04},path:[P('regen',.008),P('guardMitigation',.06)],key:[P('bossSpecialMitigation',.12),P('regen',.010)]},
 thief:{label:'影技',statMult:{spd:1.05},statAdd:{critPct:3},path:[P('executioner',.08),P('atkSpeedAdd',.06)],key:[P('critDamageBoost',.15),P('executioner',.10)]},
 merchant:{label:'商魂',statMult:{hp:1.04},path:[P('goldMultAdd',.10),P('dmgBonusAdd',.04)],key:[P('dropRateMultAdd',.10),P('goldMultAdd',.10)]},
 hunter:{label:'狩猟',statMult:{atk:1.05},statAdd:{critPct:2},path:[P('bossDmg',.08),P('normalDmgAdd',.06)],key:[P('bossDmg',.15),P('critDamageBoost',.10)]},
 ninja:{label:'忍道',statMult:{spd:1.06},statAdd:{evasion:.02},path:[P('atkSpeedAdd',.08),P('executioner',.07)],key:[P('critDamageBoost',.16),P('dmgBonusAdd',.07)]},
 bard:{label:'旋律',statMult:{mag:1.05,mp:1.03},path:[P('skillDmgAdd',.07),P('regen',.006)],key:[P('cdrAdd',.06),P('dmgBonusAdd',.08)]},
 dancer:{label:'舞踏',statMult:{spd:1.05},statAdd:{evasion:.015},path:[P('atkSpeedAdd',.07),P('dmgBonusAdd',.05)],key:[P('critDamageBoost',.12),P('executioner',.08)]},
 alchemist:{label:'錬成',statMult:{mag:1.05},path:[P('skillDmgAdd',.08),P('spellDmgAdd',.06)],key:[P('dmgBonusAdd',.10),P('spellDmgAdd',.09)]},
 scholar:{label:'叡智',statMult:{mag:1.05,mp:1.04},path:[P('spellDmgAdd',.07),P('cdrAdd',.04)],key:[P('bossDmg',.10),P('cdrAdd',.07)]},
 farmer:{label:'大地',statMult:{hp:1.06,def:1.03},path:[P('regen',.009),P('guardMitigation',.05)],key:[P('dmgBonusAdd',.08),P('regen',.012)]},
 craftsman:{label:'匠技',statMult:{def:1.06,hp:1.03},path:[P('guardMitigation',.09),P('normalDmgAdd',.04)],key:[P('bossSpecialMitigation',.13),P('guardMitigation',.08)]},
 fortune:{label:'運命',statMult:{mag:1.04},statAdd:{critPct:3},path:[P('critDamageBoost',.10),P('dmgBonusAdd',.05)],key:[P('critDamageBoost',.18),P('dropRateMultAdd',.06)]},
});

const GROUPS=Object.freeze({
 martial:new Set(['warrior','fighter','hunter','ninja']),arcane:new Set(['mage','alchemist','scholar','fortune']),support:new Set(['priest','bard','dancer','farmer']),utility:new Set(['thief','merchant','craftsman']),
});
function roleOf(job){const p=job.parents,n=g=>p.filter(x=>GROUPS[g].has(x)).length;if(n('martial')===2)return'martial';if(n('arcane')===2)return'arcane';if(n('support')===2)return'support';if(n('utility')===2)return'utility';if(n('martial')&&n('arcane'))return'spellblade';if(n('martial')&&n('support'))return'guardian';if(n('martial')&&n('utility'))return'skirmisher';if(n('arcane')&&n('support'))return'mystic';if(n('arcane')&&n('utility'))return'artificer';if(n('support')&&n('utility'))return'provisioner';return'hybrid';}
const ROLE=Object.freeze({
 martial:{title:'武極',ult:[P('critDamageBoost',.20),P('bossDmg',.12),P('dmgBonusAdd',.08)]},
 arcane:{title:'秘奥',ult:[P('spellDmgAdd',.18),P('cdrAdd',.08),P('mpCostReduce',.07)]},
 support:{title:'加護',ult:[P('regen',.016),P('bossSpecialMitigation',.15),P('guardMitigation',.08)]},
 utility:{title:'技巧',ult:[P('executioner',.12),P('dropRateMultAdd',.12),P('dmgBonusAdd',.08)]},
 spellblade:{title:'魔戦',ult:[P('skillDmgAdd',.13),P('spellDmgAdd',.13),P('bossDmg',.11)]},
 guardian:{title:'守戦',ult:[P('guardMitigation',.12),P('bossSpecialMitigation',.14),P('bossDmg',.08)]},
 skirmisher:{title:'遊撃',ult:[P('atkSpeedAdd',.11),P('critDamageBoost',.16),P('executioner',.10)]},
 mystic:{title:'神秘',ult:[P('spellDmgAdd',.12),P('regen',.010),P('cdrAdd',.06)]},
 artificer:{title:'錬機',ult:[P('skillDmgAdd',.11),P('spellDmgAdd',.09),P('dmgBonusAdd',.09)]},
 provisioner:{title:'支度',ult:[P('regen',.009),P('goldMultAdd',.10),P('dropRateMultAdd',.10)]},
 hybrid:{title:'融星',ult:[P('dmgBonusAdd',.11),P('bossDmg',.10)]},
});

function mergedStat(a,b){return{...(a.statMult||{}),...(b.statMult||{}),...Object.fromEntries(Object.keys(a.statMult||{}).filter(k=>b.statMult?.[k]).map(k=>[k,(a.statMult[k]+b.statMult[k])/2]))};}
function trait(job,A,B){const statMult=mergedStat(A,B),statAdd={};for(const[k,v]of Object.entries(A.statAdd||{}))statAdd[k]=(statAdd[k]||0)+v;for(const[k,v]of Object.entries(B.statAdd||{}))statAdd[k]=(statAdd[k]||0)+v;return{id:`${job.id}_trait`,cost:1,requires:[],kind:'fusionTrait',name:`${job.name}・双星`,desc:`${A.label}と${B.label}の資質を融合する。`,statMult,statAdd};}
function path(job,parent,arch,suffix){return{id:`${job.id}_path_${suffix}`,cost:1,requires:[`${job.id}_trait`],exclusiveGroup:`${job.id}_path`,kind:'fusionSpecialization',name:`${arch.label}の星路`,desc:`${parent}側の資質を主軸にするSpecialization。`,effects:arch.path};}
function key(job,arch,suffix,isLegacyA=false){return{id:isLegacyA?`${job.id}_keystone`:`${job.id}_keystone_${suffix}`,cost:2,requires:[`${job.id}_path_${suffix}`],kind:'fusionKeystone',name:`${arch.label}極意`,desc:`${arch.label}側の星路を完成させるKeystone。`,effects:arch.key};}
function build(job){const[a,b]=job.parents,A=ARCH[a],B=ARCH[b],role=ROLE[roleOf(job)];return Object.freeze([
 trait(job,A,B),
 path(job,a,A,'a'),key(job,A,'a',true),
 path(job,b,B,'b'),key(job,B,'b'),
 {id:`${job.id}_ultimate`,cost:3,requires:[],requiresAny:[`${job.id}_keystone`,`${job.id}_keystone_b`],kind:'fusionUltimate',name:`奥義・${job.name}極星`,desc:`${role.title}の極致。二系譜のどちらを選んでも到達できる最終星。`,effects:role.ult},
 ]);
}

// Signature wording stays special while still using the same branching graph.
const SIGNATURE_NAMES=Object.freeze({
 battlemaster:{trait:'羅刹身',a:'武威・修羅道',b:'闘気・連環道',ult:'奥義・阿修羅連環'},
 spellblade:{trait:'魔装剣',a:'武装魔法',b:'魔導剣理',ult:'奥義・エレメントブレイク'},
 paladin:{trait:'聖盾',a:'守護騎士道',b:'聖祈騎士道',ult:'奥義・最後の聖域'},
 sage:{trait:'叡聖回路',a:'秘奥魔導',b:'聖賢祈祷',ult:'奥義・賢者の星界'},
 assassinfist:{trait:'殺拳',a:'絶命拳路',b:'影殺拳路',ult:'奥義・無影絶殺'},
});
function applySignature(job,nodes){const s=SIGNATURE_NAMES[job.id];if(!s)return nodes;return Object.freeze(nodes.map(n=>{if(n.id===`${job.id}_trait`)return Object.freeze({...n,name:s.trait});if(n.id===`${job.id}_path_a`)return Object.freeze({...n,name:s.a});if(n.id===`${job.id}_path_b`)return Object.freeze({...n,name:s.b});if(n.id===`${job.id}_ultimate`)return Object.freeze({...n,name:s.ult});return Object.freeze(n);}));}

export const FUSION_CONSTELLATIONS=Object.freeze(Object.fromEntries(FUSION_JOBS.map(j=>[j.id,applySignature(j,build(j))])));
export function fusionConstellationFor(id){return FUSION_CONSTELLATIONS[id]||[];}
export function fusionRoleFor(id){const job=FUSION_JOBS.find(j=>j.id===id);return job?roleOf(job):null;}
