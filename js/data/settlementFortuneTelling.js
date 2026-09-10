/* Settlement Future Ideas #6 — Fortune-telling.
   Pure reskin of the existing endgame-guidance computation as an in-fiction
   reading. No new progression math: see SETTLEMENT_FUTURE_IDEAS_DESIGN.md. */

export const FORTUNE_COST_GOLD = 25;

const LANE_FLAVOR = Object.freeze({
  story: '旅路の記録はまだ薄い。踏み固められていない道の先に、答えの断片が眠っている。',
  story_gate: '扉は既に見えている。だが鍵は、まだ全て揃ってはいない。',
  awakening: '深淵の入口が疼いている。今の装いのままでは、その先へ長くは立てぬだろう。',
  transcendent: '深淵の刻がお前を試している。宿敵の名は、まだ書き終えられていない。',
  divine: '機界の記録層に、まだ触れていない棚がある。中層はそれを待っている。',
  cataclysm: '深層の圧力は、育ちすぎた宿敵の影を連れてくる。備えを厚くせよ。',
  boundary_zero: '境界零。名前すら軽々しく呼べぬ深さが、お前を待っている。',
  limit: 'これより先に、易しい道はない。ただ、積み上げた分だけ進める。',
});

export function fortuneFlavorFor(laneId){
  return LANE_FLAVOR[laneId] || LANE_FLAVOR.limit;
}
