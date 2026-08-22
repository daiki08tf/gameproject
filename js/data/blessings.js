/* ============================================================
   加護（Blessing、深淵拡張）
   深淵に挑む直前（stageConfirmScreen）に3択から1つだけ選べる、
   その1階限りの一時バフ。セーブされず、恒久的な進行（ステータス・
   ツリー投資・所持品など）には一切影響しない、純粋な単発の選択要素。
   ============================================================ */
export const BLESSINGS = [
  { id: 'bls_power',  name: '猛攻の加護', kind: 'atkMult',  power: 0.20, desc: 'このフロアの間、ATK+20%' },
  { id: 'bls_guard',  name: '鉄壁の加護', kind: 'defMult',  power: 0.25, desc: 'このフロアの間、DEF+25%' },
  { id: 'bls_swift',  name: '疾風の加護', kind: 'spdMult',  power: 0.20, desc: 'このフロアの間、SPD+20%' },
  { id: 'bls_focus',  name: '会心の加護', kind: 'critAdd',  power: 15,   desc: 'このフロアの間、CRIT+15' },
  { id: 'bls_greed',  name: '強欲の加護', kind: 'goldMult', power: 0.50, desc: 'このフロアの間、獲得ゴールド+50%' },
  { id: 'bls_wisdom', name: '英知の加護', kind: 'expMult',  power: 0.50, desc: 'このフロアの間、獲得経験値+50%' },
  { id: 'bls_vital',  name: '活力の加護', kind: 'hpMult',   power: 0.15, desc: 'このフロアの間、最大HP+15%' },
];

export function getBlessing(id) { return BLESSINGS.find((b) => b.id === id) || null; }

// 重複なしでN個をランダムに選ぶ（出撃のたびに引き直す＝深淵ツリーや覚醒とは
// 異なり、完全にその場限りの選択）
export function rollBlessingChoices(n = 3) {
  const pool = [...BLESSINGS];
  const picks = [];
  while (picks.length < n && pool.length > 0) {
    const idx = Math.floor(Math.random() * pool.length);
    picks.push(pool.splice(idx, 1)[0]);
  }
  return picks;
}
