/* ============================================================
   Awakening 3.0 — rank imprints
   ============================================================ */
export const AWAKENING_IMPRINTS = Object.freeze({
  conquest: Object.freeze({
    id:'conquest', name:'覇道の刻印', icon:'⚔️', desc:'攻撃的な覚醒。全ダメージを底上げする。',
    effectForRank:(rank)=>({trigger:'passive',kind:'dmgBonusAdd',power:0.018+Math.max(0,rank-1)*0.004}),
  }),
  guardian: Object.freeze({
    id:'guardian', name:'守護の刻印', icon:'🛡️', desc:'防御的な覚醒。Boss特殊攻撃への耐性を高める。',
    effectForRank:(rank)=>({trigger:'passive',kind:'bossSpecialMitigation',power:0.035+Math.max(0,rank-1)*0.01}),
  }),
  arcana: Object.freeze({
    id:'arcana', name:'秘儀の刻印', icon:'🔮', desc:'技巧的な覚醒。MP消費を抑えて技回転を良くする。',
    effectForRank:(rank)=>({trigger:'passive',kind:'mpCostReduce',power:0.025+Math.max(0,rank-1)*0.0075}),
  }),
});

export function getAwakeningImprint(id){return AWAKENING_IMPRINTS[id]||null;}
export function awakeningImprintList(){return Object.values(AWAKENING_IMPRINTS);}
