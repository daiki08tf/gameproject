export const UNIQUE_BRANCH_EFFECTS = {
  uq_bloodfang_gram: {
    fenrir: { name:'血獣剣フェンリル', stats:{atkPct:0.18,crit:8}, effects:[{kind:'lowHpDamage',threshold:0.35,power:0.45},{kind:'lowHpExtraHit',threshold:0.35,chance:0.35}] },
    true_gram: { name:'真祖剣グラム', stats:{hpPct:0.12,atkPct:0.10}, effects:[{kind:'lifesteal',power:0.10},{kind:'highHpDamage',threshold:0.70,power:0.20}] },
  },
  uq_ash_knight_shield: {
    fortress: { name:'不落の灰城', stats:{defPct:0.25,hpPct:0.18}, effects:[{kind:'guardFortress',power:0.22},{kind:'guardCounter',power:0.60}] },
    avenger: { name:'灰燼の報復盾', stats:{defPct:0.15,atkPct:0.12}, effects:[{kind:'guardCounter',power:1.10},{kind:'hurtCharge',power:0.18,max:0.54}] },
  },
  uq_star_oracle_staff: {
    astra: { name:'堕星杖アストラ', stats:{magPct:0.22,crit:6}, effects:[{kind:'starStrikeBoost',power:0.65},{kind:'starfallEvery',count:3,power:1.15}] },
    seer: { name:'天命杖オラクル', stats:{mpPct:0.25,magPct:0.12}, effects:[{kind:'mpReserveDamage',threshold:0.50,power:0.22},{kind:'spellMpRefund',chance:0.20,power:0.50}] },
  },
  uq_regicide: {
    regicide_true: { name:'断頭剣レギサイド', stats:{atkPct:0.25,crit:7}, effects:[{kind:'bossDamage',power:0.25},{kind:'executeDamage',threshold:0.25,power:0.60}] },
    tyrant: { name:'簒奪剣タイラント', stats:{atkPct:0.16,spdPct:0.12}, effects:[{kind:'strongKillMomentum',power:0.12,maxStacks:5}] },
  },
  uq_omega_core: {
    omega_complete: { name:'完全演算核Ω', stats:{atkPct:0.12,magPct:0.12,spdPct:0.12}, effects:[{kind:'sequenceMode',power:0.30,turns:3}] },
    chaos_core: { name:'非定型演算核Χ', stats:{crit:10,spdPct:0.18}, effects:[{kind:'noRepeatDamage',power:0.18,maxStacks:4}] },
  },
};

export function uniqueBranchEffect(itemId, branchId){ return UNIQUE_BRANCH_EFFECTS[itemId]?.[branchId] || null; }
