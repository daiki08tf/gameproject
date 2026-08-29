/* Settlement 3.0 S8 — Ranch 3.0 integration model.
   This file describes existing Monster Ranch / Companion capabilities only;
   it does not create a parallel breeding, mutation, AI or progression system. */

export const RANCH3_AI_LABELS=Object.freeze({
  aggressive:'攻勢',
  defensive:'防衛',
  support:'支援',
  balanced:'均衡',
});

export const RANCH3_TRAINING_LABELS=Object.freeze({
  balanced:'バランス',
  power:'力',
  guard:'守り',
  magic:'魔力',
  speed:'速度',
});

export const RANCH3_CAPABILITIES=Object.freeze([
  {id:'roster',name:'個体管理',icon:'🐾',source:'Monster Ranch',desc:'個体・世代・お気に入り・Trait / Talentをまとめて確認する。'},
  {id:'training',name:'育成方針',icon:'🏋️',source:'訓練場',desc:'既存trainingFocusによる育成方針。'},
  {id:'traitAnalysis',name:'Trait解析',icon:'🔬',source:'魔物研究所',desc:'既存種族研究でTrait情報を解析する。'},
  {id:'breeding',name:'配合・孵化',icon:'🥚',source:'孵化場',desc:'既存の配合卵・孵化系統を利用する。'},
  {id:'directedInheritance',name:'指向配合',icon:'🧬',source:'魔物研究所',desc:'Talent / Traitの指向継承を利用する。'},
  {id:'mutation',name:'突然変異解析',icon:'✨',source:'変異研究室 / 魔物研究所',desc:'既存の変異系譜・覚醒条件を確認する。'},
  {id:'natureAi',name:'Companion AI',icon:'🧠',source:'Nature',desc:'Natureが決める既存Companion戦闘AI方針を確認する。'},
]);

export function ranch3CapabilityState({ranchLevel=0,facilityLevels={},researchUnlocks={}}={}){
  const ranch=Math.max(0,Math.floor(Number(ranchLevel)||0));
  const incubator=Math.max(0,Math.floor(Number(facilityLevels.incubator)||0));
  const training=Math.max(0,Math.floor(Number(facilityLevels.training)||0));
  const mutationLab=Math.max(0,Math.floor(Number(facilityLevels.mutationLab)||0));
  return Object.freeze({
    roster:ranch>=1,
    training:training>=1,
    traitAnalysis:!!researchUnlocks.traitAnalysis,
    breeding:incubator>=1,
    directedInheritance:!!researchUnlocks.directedInheritance,
    mutation:mutationLab>=1||!!researchUnlocks.mutationHints,
    natureAi:ranch>=1,
  });
}

export function ranch3AiLabel(ai){return RANCH3_AI_LABELS[ai]||RANCH3_AI_LABELS.balanced;}
export function ranch3TrainingLabel(focus){return RANCH3_TRAINING_LABELS[focus]||RANCH3_TRAINING_LABELS.balanced;}
