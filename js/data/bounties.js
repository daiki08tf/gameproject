/* ============================================================
   Bounty Hunts — 発見型の賞金首コンテンツ
   章ボス撃破後に、その章へ特殊ステージとして出現する。
   ============================================================ */

export const BOUNTY_RANKS = Object.freeze({ D:1, C:2, B:3, A:4, S:5, EX:6 });

export const BOUNTIES = [
  {
    id:'bounty-redfang-varg', chapterId:'ch2', rank:'D',
    name:'赤牙のヴァルグ', requires:'2-5', recLevel:16, enemyType:'ch2_branchboss',
    rumor:'森の奥で、群れを率いず単独で獲物を狩る巨大な古狼が目撃された。',
    gimmick:'HP30%以下で「血狂い」。ATK・SPDが急上昇する代わりにDEFが落ちる。終盤を一気に押し切れ。',
    rewardHint:'血に濡れた古い魔剣を守っているという。',
    rewards:{gold:450,exp:320},
  },
  {
    id:'bounty-ash-knight', chapterId:'ch5', rank:'C',
    name:'灰喰らいの騎士', requires:'5-5', recLevel:38, enemyType:'ch5_branchboss',
    rumor:'火山道で、炎の中を歩く黒い甲冑が旅人を襲っている。',
    gimmick:'2ターンは鉄壁、3ターン目だけ大きくDEF低下。「構え」を見極め、隙に火力を集中させろ。',
    rewardHint:'甲冑と一体化した巨大な盾には、受けた衝撃が残り続けている。',
    rewards:{gold:1100,exp:850},
  },
  {
    id:'bounty-fallen-oracle', chapterId:'ch8', rank:'B',
    name:'堕星の予言者', requires:'8-5', recLevel:62, enemyType:'ch8_branchboss',
    rumor:'魔界の裂け目から、未来を知ると名乗る異形の術師が現れた。',
    gimmick:'3ターンごとに「予見された一撃」が大幅強化。防御・回復のタイミングをずらすと崩される。',
    rewardHint:'星の残光を封じ込めた杖を携えているらしい。',
    rewards:{gold:2600,exp:2100},
  },
  {
    id:'bounty-crownless', chapterId:'ch11', rank:'A',
    name:'王冠なき処刑人', requires:'11-5', recLevel:125, enemyType:'ch11_branchboss',
    rumor:'灰冠の旧都で、王を名乗る者だけを狩る剣士の噂が広がっている。',
    gimmick:'6ターン目から「処刑圧」が毎ターン増加。長期戦ほど攻撃力が跳ね上がる短期決戦型。',
    rewardHint:'王だけを斬るために鍛えられた処刑剣を持つ。',
    rewards:{gold:7000,exp:6200},
  },
  {
    id:'bounty-omega-zero', chapterId:'ch15', rank:'S',
    name:'零号禁機オメガ', requires:'15-5', recLevel:300, enemyType:'ch15_branchboss',
    rumor:'黒鉄機城の最深部で、設計記録に存在しない機体が再起動した。',
    gimmick:'HP66%・33%で変形。段階ごとに火力と速度が上がり、最終形態ではDEFを捨てて攻撃へ全振りする。',
    rewardHint:'機体中枢には、戦術を学習する禁制演算核が搭載されている。',
    rewards:{gold:20000,exp:18000},
  },
];

export function bountyById(id){ return BOUNTIES.find(b=>b.id===id)||null; }
export function bountiesForChapter(chapterId){ return BOUNTIES.filter(b=>b.chapterId===chapterId); }

export function buildBountyStage(bounty){
  if(!bounty)return null;
  return {
    id:bounty.id,
    name:`【${bounty.rank}級手配】${bounty.name}`,
    recLevel:bounty.recLevel,
    bounty:true,
    bountyRank:bounty.rank,
    branch:true,
    requires:bounty.requires,
    rumor:bounty.rumor,
    bountyGimmick:bounty.gimmick,
    bountyRewardHint:bounty.rewardHint,
    rewards:{...bounty.rewards},
    waves:[{type:bounty.enemyType,count:1,interval:0}],
    dropTable:[],
  };
}
