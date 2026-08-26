/* ============================================================
   System Deepening Pack A — shared build / intent vocabulary
   ============================================================ */

export const SD_BUILD_TAGS=Object.freeze({
  BREAK:'break',
  GUARD:'guard',
  ANALYSIS:'analysis',
});

export const SD_UNIQUE_IDENTITIES=Object.freeze({
  uq_dragonbone_edge:Object.freeze({
    tag:SD_BUILD_TAGS.BREAK,
    name:'竜骸破断',
    summary:'BREAK中の敵へ大きく伸びる代わりに、通常時の火力を少し落とす。',
    activeMult:1.25,
    neutralMult:0.95,
  }),
  uq_nameless_crown:Object.freeze({
    tag:SD_BUILD_TAGS.GUARD,
    name:'王墓の反勢',
    summary:'ぼうぎょ後の次の通常攻撃を強化する。',
    counterMult:1.22,
  }),
  uq_inverted_codex:Object.freeze({
    tag:SD_BUILD_TAGS.ANALYSIS,
    name:'既知反転',
    summary:'解析済みの敵へ強く、未解析の敵にはわずかな火力低下を受ける。',
    activeMult:1.18,
    unknownMult:0.95,
  }),
});

export const SD_MASTER_SYNERGIES=Object.freeze({
  sword_blademaster:Object.freeze({
    tag:SD_BUILD_TAGS.BREAK,
    name:'剣聖・破断追撃',
    summary:'MASTER済み剣聖ルートで、BREAK中Damage+10%。',
    activeMult:1.10,
  }),
  sword_guardian:Object.freeze({
    tag:SD_BUILD_TAGS.GUARD,
    name:'護剣・守勢反転',
    summary:'MASTER済み護剣ルートで、ぼうぎょ後の通常攻撃Damage+10%。',
    counterMult:1.10,
  }),
  staff_arcanist:Object.freeze({
    tag:SD_BUILD_TAGS.ANALYSIS,
    name:'秘術師・既知利用',
    summary:'MASTER済み秘術師ルートで、解析済み敵へのDamage+10%。',
    activeMult:1.10,
  }),
});

export function equippedSdUniqueIdentities(equipped={},resolveItem=(id)=>id){
  const out=[];
  for(const rawId of Object.values(equipped||{})){
    if(!rawId)continue;
    const base=resolveItem(rawId);
    const identity=SD_UNIQUE_IDENTITIES[base];
    if(identity)out.push({itemId:base,...identity});
  }
  return out;
}

export function activeSdMasterSynergies({mastered=false,routeId=null}={}){
  if(!mastered||!routeId)return [];
  const synergy=SD_MASTER_SYNERGIES[routeId];
  return synergy?[{routeId,...synergy}]:[];
}

export function isBreakWindow(enemy){
  return !!(enemy&&Number(enemy.breakMax)>0&&Number(enemy.breakGauge)<=0);
}

export function classifyEnemyIntent(enemy){
  if(!enemy||enemy.dead)return null;
  if(enemy.pendingSpecial)return {kind:'DANGER',text:'大技の予兆。防御や対策を考えたい。',danger:true};
  if(enemy.boss){
    const enc=enemy.combat3Encounter;
    const next=enc?.profile?.phases?.[enc.nextPhase]||null;
    if(next&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<=next.ratio)
      return {kind:'DANGER',text:`形態変化「${next.name}」が迫っている。`,danger:true};
    return {kind:'ATTACK',text:'こちらの動きを見ながら攻勢を組み立てている。',danger:false};
  }
  if(enemy.combat3WillUseSkill&&enemy.combat3Skill){
    const skill=enemy.combat3Skill;
    const kind=skill.kind;
    if(kind==='guardAll')return {kind:'GUARD',text:'味方を守る構えを取っている。',danger:false};
    if(kind==='hasteAll')return {kind:'SUPPORT',text:'仲間の動きを加速させようとしている。',danger:false};
    if(kind==='healAlly')return {kind:'SUPPORT',text:'傷ついた仲間へ意識を向けている。',danger:false};
    if(kind==='mpDrain'||kind==='slow'||kind==='weakenAtk')return {kind:'DISRUPT',text:`「${skill.name}」の気配。こちらを崩そうとしている。`,danger:false};
    if(kind==='poison'||kind==='burn')return {kind:'CAST',text:`「${skill.name}」を準備している。`,danger:true};
    if(kind==='power'||kind==='multi')return {kind:'ATTACK',text:`「${skill.name}」で攻める構え。`,danger:kind==='multi'};
    return {kind:'CAST',text:`「${skill.name}」を使おうとしている。`,danger:false};
  }
  return {kind:'ATTACK',text:'通常攻撃の間合いを測っている。',danger:false};
}
