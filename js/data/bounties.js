/* ============================================================
   Bounty Hunts — 発見型の賞金首コンテンツ
   章ボス撃破後に、その章へ特殊ステージとして出現する。
   ============================================================ */

export const BOUNTY_RANKS = Object.freeze({ D:1, C:2, B:3, A:4, S:5, EX:6 });

export const BOUNTIES = [
  {
    id: 'bounty-redfang-varg', chapterId: 'ch2', rank: 'D',
    name: '赤牙のヴァルグ', requires: '2-5', recLevel: 16,
    enemyType: 'ch2_branchboss',
    rumor: '森の奥で、群れを率いず単独で獲物を狩る巨大な古狼が目撃された。',
    gimmick: '素早い強敵。短期決戦向け。',
    rewards: { gold: 450, exp: 320 },
  },
  {
    id: 'bounty-ash-knight', chapterId: 'ch5', rank: 'C',
    name: '灰喰らいの騎士', requires: '5-5', recLevel: 38,
    enemyType: 'ch5_branchboss',
    rumor: '火山道で、炎の中を歩く黒い甲冑が旅人を襲っている。',
    gimmick: '高耐久。長期戦を想定。',
    rewards: { gold: 1100, exp: 850 },
  },
  {
    id: 'bounty-fallen-oracle', chapterId: 'ch8', rank: 'B',
    name: '堕星の予言者', requires: '8-5', recLevel: 62,
    enemyType: 'ch8_branchboss',
    rumor: '魔界の裂け目から、未来を知ると名乗る異形の術師が現れた。',
    gimmick: '高火力。防御と回復の使い分けが重要。',
    rewards: { gold: 2600, exp: 2100 },
  },
  {
    id: 'bounty-crownless', chapterId: 'ch11', rank: 'A',
    name: '王冠なき処刑人', requires: '11-5', recLevel: 125,
    enemyType: 'ch11_branchboss',
    rumor: '灰冠の旧都で、王を名乗る者だけを狩る剣士の噂が広がっている。',
    gimmick: '終盤向けの高難度賞金首。',
    rewards: { gold: 7000, exp: 6200 },
  },
  {
    id: 'bounty-omega-zero', chapterId: 'ch15', rank: 'S',
    name: '零号禁機オメガ', requires: '15-5', recLevel: 300,
    enemyType: 'ch15_branchboss',
    rumor: '黒鉄機城の最深部で、設計記録に存在しない機体が再起動した。',
    gimmick: '本編クリア後の強敵。深淵前後のビルド完成度を要求する。',
    rewards: { gold: 20000, exp: 18000 },
  },
];

export function bountyById(id) { return BOUNTIES.find((b) => b.id === id) || null; }
export function bountiesForChapter(chapterId) { return BOUNTIES.filter((b) => b.chapterId === chapterId); }

export function buildBountyStage(bounty) {
  if (!bounty) return null;
  return {
    id: bounty.id,
    name: `【${bounty.rank}級手配】${bounty.name}`,
    recLevel: bounty.recLevel,
    bounty: true,
    bountyRank: bounty.rank,
    branch: true,
    requires: bounty.requires,
    rumor: bounty.rumor,
    bountyGimmick: bounty.gimmick,
    rewards: { ...bounty.rewards },
    waves: [{ type: bounty.enemyType, count: 1, interval: 0 }],
    dropTable: [],
  };
}
