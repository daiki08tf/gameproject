import { ALL_FUSION_JOBS } from './jobFusion.js';

const PARENT = Object.freeze({
 warrior:{verb:'守勢',gain:'被弾・防御',command:'ブレイク斬り',effect:'break'}, fighter:{verb:'連撃',gain:'連続攻撃',command:'連環撃',effect:'combo'},
 mage:{verb:'魔力',gain:'属性攻撃',command:'魔力解放',effect:'element'}, priest:{verb:'信仰',gain:'回復・防御',command:'聖域',effect:'heal'},
 thief:{verb:'好機',gain:'会心・弱点',command:'急所狙い',effect:'crit'}, merchant:{verb:'補給',gain:'Gold獲得・消費',command:'戦場補給',effect:'supply'},
 hunter:{verb:'標的',gain:'同一敵への攻撃',command:'マーキング',effect:'mark'}, ninja:{verb:'影',gain:'回避・状態異常',command:'影縫い',effect:'status'},
 bard:{verb:'旋律',gain:'味方行動',command:'戦歌',effect:'buff'}, dancer:{verb:'舞踏',gain:'回避・速度',command:'幻舞',effect:'evade'},
 alchemist:{verb:'試薬',gain:'状態変化',command:'錬成反応',effect:'reaction'}, scholar:{verb:'解析',gain:'弱点発見',command:'戦術解析',effect:'analysis'},
 farmer:{verb:'生命',gain:'ターン経過',command:'豊穣',effect:'regen'}, craftsman:{verb:'構築',gain:'防御・装備行動',command:'即席要塞',effect:'fortify'},
 fortune:{verb:'運命',gain:'会心・被会心',command:'運命改変',effect:'fate'},
});

function build(job){
 const [a,b]=job.parents, A=PARENT[a], B=PARENT[b];
 return Object.freeze({
  jobId:job.id,
  gauge:Object.freeze({id:`fusion_gauge_${a}_${b}`,name:`${A.verb}×${B.verb}`,max:100,start:0,gain:[A.gain,B.gain]}),
  trait:Object.freeze({id:job.fusionTrait.id,name:`${job.name}の真髄`,description:`${A.verb}と${B.verb}を循環させる。ゲージ50以上で両親職系統の効果+15%、100でFusion Commandを解禁。`}),
  command:Object.freeze({id:`fusion_command_${a}_${b}`,name:`${A.command}・${B.command}`,cost:100,effects:[A.effect,B.effect],power:1.35,breakMult:1.25}),
  mastery:Object.freeze({id:`fusion_master_${a}_${b}`,name:`${job.name} MASTER`,level:50,passive:`${A.verb}/${B.verb}ゲージ獲得+20%、Fusion Command使用後に25ゲージ残る。`}),
 });
}
export const FUSION_COMBAT_IDENTITIES=Object.freeze(ALL_FUSION_JOBS.map(build));
export const FUSION_COMBAT_BY_ID=new Map(FUSION_COMBAT_IDENTITIES.map(x=>[x.jobId,x]));
export function fusionCombatIdentity(jobId){return FUSION_COMBAT_BY_ID.get(jobId)||null;}
export function auditFusionCombatIdentities(){const ids=new Set(FUSION_COMBAT_IDENTITIES.map(x=>x.jobId));return{ok:FUSION_COMBAT_IDENTITIES.length===105&&ids.size===105,count:FUSION_COMBAT_IDENTITIES.length};}
