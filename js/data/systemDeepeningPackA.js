/* ============================================================
   C0 compatibility layer — concrete Unique effects + enemy intent

   BREAK / GUARD / ANALYSIS are no longer universal build axes.
   Old exports remain load-safe for one migration generation, but the
   runtime no longer exposes or consumes the three-way taxonomy.
   ============================================================ */

// Deprecated compatibility export. Do not add new consumers.
export const SD_BUILD_TAGS=Object.freeze({});

// Keep owned Unique IDs valuable without reviving the retired build labels.
export const SD_UNIQUE_IDENTITIES=Object.freeze({
  uq_dragonbone_edge:Object.freeze({
    kind:'execute',
    name:'竜骸破断',
    summary:'瀕死の敵へのダメージが上がる。',
    hpRatio:.35,
    activeMult:1.15,
  }),
  uq_nameless_crown:Object.freeze({
    kind:'guardCounter',
    name:'王墓の反勢',
    summary:'ぼうぎょ後の次の通常攻撃を強化する。',
    counterMult:1.22,
  }),
  uq_inverted_codex:Object.freeze({
    kind:'codexKnown',
    name:'既知反転',
    summary:'図鑑に登録済みの敵へのダメージが上がる。',
    activeMult:1.12,
  }),
});

// Deprecated compatibility export. C0 removes Pack A MASTER cross-tag bonuses.
export const SD_MASTER_SYNERGIES=Object.freeze({});

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

// Compatibility only: route mastery no longer creates BREAK/GUARD/ANALYSIS bonuses.
export function activeSdMasterSynergies(){return [];}

// Compatibility only: BREAK window authority is retired by C0.
export function isBreakWindow(){return false;}

export function classifyEnemyIntent(enemy){
  if(!enemy||enemy.dead)return null;
  if(enemy.pendingSpecial)return {kind:'DANGER',label:'危険',text:'大技の予兆。防御や対策を考えたい。',danger:true};
  if(enemy.boss){
    const enc=enemy.combat3Encounter;
    const next=enc?.profile?.phases?.[enc.nextPhase]||null;
    if(next&&enemy.maxHp>0&&enemy.hp/enemy.maxHp<=next.ratio)
      return {kind:'DANGER',label:'危険',text:`形態変化「${next.name}」が迫っている。`,danger:true};
    return {kind:'ATTACK',label:'攻撃',text:'こちらの動きを見ながら攻勢を組み立てている。',danger:false};
  }
  if(enemy.combat3WillUseSkill&&enemy.combat3Skill){
    const skill=enemy.combat3Skill;
    const kind=skill.kind;
    if(kind==='guardAll')return {kind:'GUARD',label:'防御',text:'味方を守る構えを取っている。',danger:false};
    if(kind==='hasteAll')return {kind:'SUPPORT',label:'支援',text:'仲間の動きを加速させようとしている。',danger:false};
    if(kind==='healAlly')return {kind:'SUPPORT',label:'支援',text:'傷ついた仲間へ意識を向けている。',danger:false};
    if(kind==='mpDrain'||kind==='slow'||kind==='weakenAtk')return {kind:'DISRUPT',label:'妨害',text:`「${skill.name}」の気配。こちらを崩そうとしている。`,danger:false};
    if(kind==='poison'||kind==='burn')return {kind:'CAST',label:'特殊',text:`「${skill.name}」を準備している。`,danger:true};
    if(kind==='power'||kind==='multi')return {kind:'ATTACK',label:'攻撃',text:`「${skill.name}」で攻める構え。`,danger:kind==='multi'};
    return {kind:'CAST',label:'特殊',text:`「${skill.name}」を使おうとしている。`,danger:false};
  }
  return {kind:'ATTACK',label:'攻撃',text:'通常攻撃の間合いを測っている。',danger:false};
}
