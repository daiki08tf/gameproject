/* Phase 8 — Fusion Constellation layer.
   Every 15C2 fusion gets a deterministic Trait → Keystone → Ultimate path.
   Effects inherit the identities of both parent basic jobs. */
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
function effect(e,scale=1){return {trigger:'passive',kind:e.kind,power:e.power*scale};}
function build(job){const [a,b]=job.parents,A=ARCH[a],B=ARCH[b];return Object.freeze([
 Object.freeze({id:`${job.id}_trait`,kind:'fusionTrait',cost:1,name:`${A.label}と${B.label}`,desc:`${A.stat.toUpperCase()}+${Math.round((A.mult-1)*100)}% / ${B.stat.toUpperCase()}+${Math.round((B.mult-1)*100)}%`,requires:[],statMult:{[A.stat]:A.mult,[B.stat]:(A.stat===B.stat?A.mult*B.mult:B.mult)}}),
 Object.freeze({id:`${job.id}_keystone`,kind:'fusionKeystone',cost:2,name:`${job.name}の極意`,desc:'両親職の戦闘特性が同時に発現する。',requires:[`${job.id}_trait`],effects:[effect(A.effect),effect(B.effect)]}),
 Object.freeze({id:`${job.id}_ultimate`,kind:'fusionUltimate',cost:3,name:`奥義・${job.name}`,desc:'Fusion Jobを極めた者だけが得る究極特性。',requires:[`${job.id}_keystone`],effects:[effect(A.effect,1.5),effect(B.effect,1.5)]}),
]);}
export const FUSION_CONSTELLATIONS=Object.freeze(Object.fromEntries(FUSION_JOBS.map(j=>[j.id,build(j)])));
export function fusionConstellationFor(id){return FUSION_CONSTELLATIONS[id]||[];}
