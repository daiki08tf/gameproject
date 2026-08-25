/* Phase 8 — playable Skill Constellation tree definitions.
   The first slice covers the three starter archetypes. More jobs can be
   added without changing the runtime or save format. */
const node = (id, name, desc, cost, requires = [], payload = {}, kind = 'minor') =>
  Object.freeze({ id, name, desc, cost, requires: Object.freeze(requires), kind, ...payload });

export const JOB_CONSTELLATION_TREES = Object.freeze({
  warrior: Object.freeze([
    node('war_core', '戦士の核', 'ATK+4%', 1, [], { statMult:{ atk:1.04 } }, 'core'),
    node('war_edge', '研ぎ澄ます刃', 'Crit+3pt', 1, ['war_core'], { statAdd:{ critPct:3 } }),
    node('war_guard', '鋼の構え', 'DEF+6%', 1, ['war_core'], { statMult:{ def:1.06 } }),
    node('war_major', '歴戦の剣気', 'Damage+8%', 2, ['war_edge'], { effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.08 }] }, 'major'),
    node('war_keystone', '背水の剣', 'ATK+15% / DEF-8%。攻撃へ大きく傾ける。', 3, ['war_major','war_guard'], { statMult:{ atk:1.15, def:0.92 } }, 'keystone'),
    node('war_master', '剣星', 'MASTER到達。Boss Damage+15%', 0, ['war_keystone'], { effects:[{ trigger:'passive', kind:'bossDmg', power:0.15 }] }, 'master'),
  ]),
  mage: Object.freeze([
    node('mag_core', '魔導の核', 'MAG+5%', 1, [], { statMult:{ mag:1.05 } }, 'core'),
    node('mag_mana', '魔力循環', 'MP+8%', 1, ['mag_core'], { statMult:{ mp:1.08 } }),
    node('mag_focus', '集中詠唱', 'じゅもんDamage+7%', 1, ['mag_core'], { effects:[{ trigger:'passive', kind:'spellDmgAdd', power:0.07 }] }),
    node('mag_major', '大魔導回路', 'MAG+10%', 2, ['mag_mana'], { statMult:{ mag:1.10 } }, 'major'),
    node('mag_keystone', '過剰魔力', 'MAG+18% / HP-10%。火力へ大きく傾ける。', 3, ['mag_major','mag_focus'], { statMult:{ mag:1.18, hp:0.90 } }, 'keystone'),
    node('mag_master', '魔星', 'MASTER到達。MP消費-10%', 0, ['mag_keystone'], { effects:[{ trigger:'passive', kind:'mpCostReduce', power:0.10 }] }, 'master'),
  ]),
  priest: Object.freeze([
    node('pri_core', '祈りの核', 'HP+5%', 1, [], { statMult:{ hp:1.05 } }, 'core'),
    node('pri_grace', '恩寵', 'MAG+5%', 1, ['pri_core'], { statMult:{ mag:1.05 } }),
    node('pri_ward', '守護祈祷', 'DEF+6%', 1, ['pri_core'], { statMult:{ def:1.06 } }),
    node('pri_major', '生命賛歌', 'Regen+1.5%', 2, ['pri_grace'], { effects:[{ trigger:'passive', kind:'regen', power:0.015 }] }, 'major'),
    node('pri_keystone', '献身', 'HP+15% / Damage-6%。生存へ大きく傾ける。', 3, ['pri_major','pri_ward'], { statMult:{ hp:1.15 }, effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:-0.06 }] }, 'keystone'),
    node('pri_master', '聖星', 'MASTER到達。MP消費-8%', 0, ['pri_keystone'], { effects:[{ trigger:'passive', kind:'mpCostReduce', power:0.08 }] }, 'master'),
  ]),
});

export function constellationTreeFor(jobId) { return JOB_CONSTELLATION_TREES[jobId] || []; }
export function constellationNode(jobId, nodeId) { return constellationTreeFor(jobId).find((n) => n.id === nodeId) || null; }
