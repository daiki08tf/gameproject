/* ============================================================
   Job 3.0 — Specialization Trees
   ------------------------------------------------------------
   Existing Job tiers / MASTER / upper-job unlocks remain authoritative.
   Every normal Job receives two specialization routes from its preferred
   weapon family. Nodes activate at Job Lv5, Lv10 and MASTER.
   ============================================================ */

const route = (id, name, desc, nodes) => Object.freeze({ id, name, desc, nodes: Object.freeze(nodes) });
const node = (level, name, desc, payload = {}) => Object.freeze({ level, name, desc, ...payload });

export const JOB3_WEAPON_TREES = Object.freeze({
  sword: Object.freeze([
    route('sword_blademaster', '剣聖', '会心と技威力で攻め切る剣の道。', [
      node(5, '剣気', 'ATK+6%', { statMult: { atk: 1.06 } }),
      node(10, '鋭刃', 'とくぎDamage+10%', { effects: [{ trigger:'passive', kind:'skillDmgAdd', power:0.10 }] }),
      node('master', '無双剣', 'Damage+10% / Crit+5pt', { statAdd:{ critPct:5 }, effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.10 }] }),
    ]),
    route('sword_guardian', '護剣', '剣と盾で崩れない前衛を作る道。', [
      node(5, '受け太刀', 'DEF+7%', { statMult:{ def:1.07 } }),
      node(10, '守勢反転', 'ぼうぎょ軽減を強化', { effects:[{ trigger:'passive', kind:'guardMitigation', power:0.08 }] }),
      node('master', '不落', 'HP+10% / 撃破時HP2%回復', { statMult:{ hp:1.10 }, effects:[{ trigger:'onKill', kind:'healOnKill', power:0.02 }] }),
    ]),
  ]),
  axe: Object.freeze([
    route('axe_berserker', '修羅', '重い一撃とBoss火力に特化。', [
      node(5, '豪腕', 'ATK+8%', { statMult:{ atk:1.08 } }),
      node(10, '巨獣狩り', 'Boss Damage+12%', { effects:[{ trigger:'passive', kind:'bossDmg', power:0.12 }] }),
      node('master', '破滅の一撃', 'Damage+12%', { effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.12 }] }),
    ]),
    route('axe_siegebreaker', '破城', '防御を崩しながら耐える戦斧の道。', [
      node(5, '重装', 'HP+7% / DEF+5%', { statMult:{ hp:1.07, def:1.05 } }),
      node(10, '甲割り', 'Armor Pen+6%', { statAdd:{ armorPen:0.06 } }),
      node('master', '鉄血', '被弾後の継戦を支えるRegen+1.5%', { effects:[{ trigger:'passive', kind:'regen', power:0.015 }] }),
    ]),
  ]),
  staff: Object.freeze([
    route('staff_elementalist', '元素術師', '属性魔法と純粋な魔力を伸ばす。', [
      node(5, '魔力増幅', 'MAG+8%', { statMult:{ mag:1.08 } }),
      node(10, '高等詠唱', 'じゅもんDamage+12%', { effects:[{ trigger:'passive', kind:'spellDmgAdd', power:0.12 }] }),
      node('master', '元素共鳴', 'Damage+8% / MP+10%', { statMult:{ mp:1.10 }, effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.08 }] }),
    ]),
    route('staff_arcanist', '秘術師', 'MP効率と弱体術で長期戦を制する。', [
      node(5, '魔力循環', 'MP+12%', { statMult:{ mp:1.12 } }),
      node(10, '省略詠唱', 'MP消費-8%', { effects:[{ trigger:'passive', kind:'mpCostReduce', power:0.08 }] }),
      node('master', '禁呪研究', '弱体/DoT効果+12%', { effects:[{ trigger:'passive', kind:'debuffPowerAdd', power:0.12 }] }),
    ]),
  ]),
  bow: Object.freeze([
    route('bow_sniper', '狙撃手', '会心と貫通で単体を仕留める。', [
      node(5, '鷹眼', 'Crit+5pt', { statAdd:{ critPct:5 } }),
      node(10, '徹甲矢', 'Armor Pen+7%', { statAdd:{ armorPen:0.07 } }),
      node('master', '一点突破', 'Boss Damage+15%', { effects:[{ trigger:'passive', kind:'bossDmg', power:0.15 }] }),
    ]),
    route('bow_skirmisher', '遊撃手', '速度と回避を活かし手数で戦う。', [
      node(5, '軽歩', 'SPD+7%', { statMult:{ spd:1.07 } }),
      node(10, '見切り', 'Evasion+5%', { statAdd:{ evasion:0.05 } }),
      node('master', '連射態勢', 'とくぎDamage+9% / MP消費-5%', { effects:[{ trigger:'passive', kind:'skillDmgAdd', power:0.09 },{ trigger:'passive', kind:'mpCostReduce', power:0.05 }] }),
    ]),
  ]),
  dagger: Object.freeze([
    route('dagger_assassin', '暗殺者', '会心と瀕死狩りに寄せる。', [
      node(5, '急所狙い', 'Crit+6pt', { statAdd:{ critPct:6 } }),
      node(10, '死角', 'Evasion+4% / Damage+5%', { statAdd:{ evasion:0.04 }, effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.05 }] }),
      node('master', '処刑', 'HP25%以下の敵へDamage+18%', { effects:[{ trigger:'passive', kind:'executioner', power:0.18, hpThreshold:0.25 }] }),
    ]),
    route('dagger_venom', '毒影', 'DoTと弱体化で削り切る。', [
      node(5, '毒研ぎ', 'DoT Damage+12%', { effects:[{ trigger:'passive', kind:'dotDmg', power:0.12 }] }),
      node(10, '侵蝕', '弱体/DoT効果+10%', { effects:[{ trigger:'passive', kind:'debuffPowerAdd', power:0.10 }] }),
      node('master', '蝕殺', '弱体中の敵へDamage+15%', { effects:[{ trigger:'passive', kind:'debuffedDmg', power:0.15 }] }),
    ]),
  ]),
  knuckle: Object.freeze([
    route('knuckle_rush', '猛攻', '多段攻撃と会心を伸ばす。', [
      node(5, '拳圧', 'ATK+7%', { statMult:{ atk:1.07 } }),
      node(10, '連環', 'とくぎDamage+10%', { effects:[{ trigger:'passive', kind:'skillDmgAdd', power:0.10 }] }),
      node('master', '闘神', 'Crit+5pt / Damage+8%', { statAdd:{ critPct:5 }, effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.08 }] }),
    ]),
    route('knuckle_flow', '流水', '回避と回復で攻防を循環させる。', [
      node(5, '流水歩', 'SPD+6% / Evasion+3%', { statMult:{ spd:1.06 }, statAdd:{ evasion:0.03 } }),
      node(10, '呼吸法', 'Regen+1.2%', { effects:[{ trigger:'passive', kind:'regen', power:0.012 }] }),
      node('master', '無拍子', 'MP消費-7% / Crit+4pt', { statAdd:{ critPct:4 }, effects:[{ trigger:'passive', kind:'mpCostReduce', power:0.07 }] }),
    ]),
  ]),
  instrument: Object.freeze([
    route('instrument_warchant', '戦歌', '攻撃支援と魔力を両立する。', [
      node(5, '勇壮', 'ATK+5% / MAG+5%', { statMult:{ atk:1.05, mag:1.05 } }),
      node(10, '高揚', 'Damage+7%', { effects:[{ trigger:'passive', kind:'dmgBonusAdd', power:0.07 }] }),
      node('master', '英雄譚', 'とくぎ/じゅもんDamage+8%', { effects:[{ trigger:'passive', kind:'skillDmgAdd', power:0.08 },{ trigger:'passive', kind:'spellDmgAdd', power:0.08 }] }),
    ]),
    route('instrument_mirage', '幻奏', '回避・MP・弱体を操る。', [
      node(5, '軽やかな律', 'SPD+6%', { statMult:{ spd:1.06 } }),
      node(10, '幻惑音', 'Evasion+5%', { statAdd:{ evasion:0.05 } }),
      node('master', '無限旋律', 'MP+10% / MP消費-7%', { statMult:{ mp:1.10 }, effects:[{ trigger:'passive', kind:'mpCostReduce', power:0.07 }] }),
    ]),
  ]),
  rod: Object.freeze([
    route('rod_holy', '聖光', '魔力・回復・光攻撃を伸ばす。', [
      node(5, '祈祷', 'MAG+7%', { statMult:{ mag:1.07 } }),
      node(10, '生命賛歌', 'Regen+1.5%', { effects:[{ trigger:'passive', kind:'regen', power:0.015 }] }),
      node('master', '聖域', 'HP+8% / じゅもんDamage+8%', { statMult:{ hp:1.08 }, effects:[{ trigger:'passive', kind:'spellDmgAdd', power:0.08 }] }),
    ]),
    route('rod_warder', '守護', '防御とMP効率を優先する。', [
      node(5, '加護', 'DEF+8%', { statMult:{ def:1.08 } }),
      node(10, '節制', 'MP消費-9%', { effects:[{ trigger:'passive', kind:'mpCostReduce', power:0.09 }] }),
      node('master', '大結界', 'HP+10% / ぼうぎょ軽減強化', { statMult:{ hp:1.10 }, effects:[{ trigger:'passive', kind:'guardMitigation', power:0.08 }] }),
    ]),
  ]),
});

export function specializationRoutesForJob(job) {
  return JOB3_WEAPON_TREES[job?.weapon] || [];
}

export function activeSpecializationNodes(job, jobLevel, mastered, routeId) {
  const routeDef = specializationRoutesForJob(job).find((r) => r.id === routeId);
  if (!routeDef) return [];
  return routeDef.nodes.filter((n) => n.level === 'master' ? mastered : jobLevel >= n.level);
}
