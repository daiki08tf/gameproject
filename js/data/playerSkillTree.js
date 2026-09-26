/* ============================================================
   旅人星盤 (Wayfarer Skill Tree) — 職業に依存しない旅人の修練
   ------------------------------------------------------------
   職業星盤 (JOB_CONSTELLATION_TREES) が「その職を使い込んだ証」を
   表すのに対し、旅人星盤は「旅人そのものの生存・狩猟・調教の
   心得」を表す恒久的な専門化。職業を替えても残り、SPは
   「章ボス撃破数 + 到達した最高職業Lv/10」から導出されるので
   既存セーブにもそのまま付与される。

   payloadは職業星盤と同じ語彙 (statMult / statAdd / effects) を
   使い、仲間・巡回に関わるノードは companion / hunt フィールドで
   専用の集計経路へ流す（effects語彙を増やさない）。
   ============================================================ */
const node = (id, branch, name, desc, cost, requires = [], payload = {}, kind = 'minor') =>
  Object.freeze({ id, branch, name, desc, cost, requires: Object.freeze(requires), kind, ...payload });

export const PLAYER_TREE_BRANCHES = Object.freeze({
  root: '旅', blade: '刃', aegis: '障', beast: '獣', hunt: '狩',
});

export const PLAYER_SKILL_TREE = Object.freeze([
  // ---- 根 ----
  node('wt_root', 'root', '旅人の心得', '長旅の基礎。SPD +3%。', 1, [], { statMult: { spd: 1.03 } }, 'core'),

  // ---- 刃：攻勢 ----
  node('wt_blade_edge', 'blade', '刃の目', '刃の扱いを極める。ATK +4%。', 1, ['wt_root'], { statMult: { atk: 1.04 } }),
  node('wt_blade_crit', 'blade', '急所の見極め', '急所を見抜く目。Crit +4pt。', 1, ['wt_blade_edge'], { statAdd: { critPct: 4 } }),
  node('wt_blade_opener', 'blade', '先制の構え', '先手の一撃を重くする。初撃ダメージ +15%。', 2, ['wt_blade_crit'], { effects: [{ trigger: 'passive', kind: 'firstStrikeBonus', power: .15 }] }, 'major'),
  node('wt_blade_keystone', 'blade', '背水の刃', '守りを削り、全てを刃に捧げる。ATK +18% / DEF -10%。', 3, ['wt_blade_opener'], { statMult: { atk: 1.18, def: .90 } }, 'keystone'),

  // ---- 障：生存 ----
  node('wt_aegis_stance', 'aegis', '守りの足場', '崩れない構え。DEF +5%。', 1, ['wt_root'], { statMult: { def: 1.05 } }),
  node('wt_aegis_breath', 'aegis', '鉄の呼吸', '傷を受け止める体。HP +6%。', 1, ['wt_aegis_stance'], { statMult: { hp: 1.06 } }),
  node('wt_aegis_ward', 'aegis', '庇いの心得', '小さな傷は癒える。毎行動、最大HPの1.2%を回復。', 2, ['wt_aegis_breath'], { effects: [{ trigger: 'passive', kind: 'regen', power: .012 }] }, 'major'),
  node('wt_aegis_keystone', 'aegis', '肉壁の誓い', '俊敏さを捨て、壁となる。HP +20% / SPD -8%。', 3, ['wt_aegis_ward'], { statMult: { hp: 1.20, spd: .92 } }, 'keystone'),

  // ---- 獣：調教 ----
  node('wt_beast_bond', 'beast', '調教の心得', '獣の気性を読む。仲間ATK +6%。', 1, ['wt_root'], { companion: { atkMult: 1.06 } }),
  node('wt_beast_pack', 'beast', '群れの絆', '群れを率いる絆。仲間HP +8%。', 1, ['wt_beast_bond'], { companion: { hpMult: 1.08 } }),
  node('wt_beast_scent', 'beast', '獣の嗅覚', '懐きやすい個体を見分ける。勧誘成功率 +4%。', 1, ['wt_beast_pack'], { hunt: { recruitChanceBonus: .04 } }),
  node('wt_beast_raise', 'beast', '共育の印', '共に戦い共に育つ。仲間EXP +20%。', 2, ['wt_beast_pack'], { companion: { expMult: 1.20 } }, 'major'),
  node('wt_beast_keystone', 'beast', '獣王の采配', '獣を前に立てる者の采配。仲間ATK +8% / 仲間の被ダメージ -20%。', 3, ['wt_beast_raise'], { companion: { atkMult: 1.08, takenMult: .80 } }, 'keystone'),

  // ---- 狩：巡回 ----
  node('wt_hunt_tracker', 'hunt', '巡回の心得', '獣道を読む。巡回中のドロップ率 +10%。', 1, ['wt_root'], { hunt: { dropMultBonus: .10 } }),
  node('wt_hunt_scent', 'hunt', '獣の気配', '群れに紛れる異彩を嗅ぎ分ける。Rare出現率 +3%。', 2, ['wt_hunt_tracker'], { hunt: { rareChanceBonus: .03 } }),
  node('wt_hunt_quarry', 'hunt', '強敵の勘', '名もなき強敵の気配を追う。Roamer出現率 +4%。', 2, ['wt_hunt_scent'], { hunt: { roamerChanceBonus: .04 } }),
  node('wt_hunt_eye', 'hunt', '目利きの目', '獲物が落とす宝を見極める。固有装備の抽選率 +4%。', 2, ['wt_hunt_tracker'], { hunt: { uniqueChanceBonus: .04 } }, 'major'),
  node('wt_hunt_keystone', 'hunt', '呪いの味方', '呪いと引き換えに生きる覚悟。呪い巡回の被ダメージ上昇を大幅に抑える。', 3, ['wt_hunt_eye'], { hunt: { cursedResist: .40 } }, 'keystone'),
]);

export function playerTreeNode(id) {
  return PLAYER_SKILL_TREE.find(n => n.id === id) || null;
}
