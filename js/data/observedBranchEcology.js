/* Observed Branches M10 — divergent Enemy 2.0 regional ecology per Branch.
   Mirrors regionalEnemies2.js's exact shape (four ordinary roles + one Rare
   identity), keyed by Branch id instead of Chapter id, so each Branch's
   encounters stop silently inheriting the Prime Chapter's own regional
   identity and instead reflect the Branch's own authored divergence.
   Existing normal/fast/tank/boss enemy types remain authoritative; this adds
   no new role, rarity, or encounter authority beyond what regionalEnemies2.js
   already established for ordinary Chapters. */

export const OBSERVED_BRANCH_ECOLOGY_ROLES = Object.freeze(['attacker','caster','trickster','support','rare']);

const entry=(attacker,caster,trickster,support,rare)=>Object.freeze({
  attacker:Object.freeze({name:attacker,role:'attacker',behaviorTags:['pressure','burst']}),
  caster:Object.freeze({name:caster,role:'caster',behaviorTags:['ranged','magic']}),
  trickster:Object.freeze({name:trickster,role:'trickster',behaviorTags:['disrupt','tempo']}),
  support:Object.freeze({name:support,role:'support',behaviorTags:['support','formation']}),
  rare:Object.freeze({name:rare,role:'rare',behaviorTags:['rare','threat'],rare:true}),
});

export const OBSERVED_BRANCH_ECOLOGY = Object.freeze({
  'tree-sovereign-deep-green':entry('樹冠の猛襲者','根脈詠唱師','蔦絡みの惑わし','共生樹の祈祷師','王樹脈幼体'),
  'deep-green-absence':entry('空白牙の残響体','測界演算師','輪郭撹乱体','観測杭の補助端末','未記録の残響獣'),
  'flame-king-volcano':entry('熔鉱兵','火術演算師','飛び火の撹乱体','製鉄補助端末','王家鋳造獣'),
});

export function observedBranchEcologySet(branchId){return OBSERVED_BRANCH_ECOLOGY[branchId]||null;}
