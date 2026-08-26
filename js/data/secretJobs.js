export const SECRET_JOBS = [
  {
    id:'secret_spellblade', name:'魔剣士', carrierJobId:'spellblade', weapon:'sword', secret:true,
    desc:'剣と魔力を同時に極め、禁断の魔剣を操る隠し職。', masteryLv:40,
    hint:'剣と魔力、その両方を極め、血に飢えた魔剣を目覚めさせよ。',
    conditions:[
      {id:'warrior',label:'戦士をMASTER',check:s=>s.isMastered('warrior')},
      {id:'mage',label:'魔法使いをMASTER',check:s=>s.isMastered('mage')},
      {id:'gram',label:'血牙グラムを覚醒',check:s=>!!s.getUniqueTrialProgress?.('uq_bloodfang_gram')?.awakened},
      {id:'bounty',label:'B級以上の賞金首を討伐',check:s=>s.isBountyDefeated?.('bounty-fallen-oracle')||s.isBountyDefeated?.('bounty-crownless')||s.isBountyDefeated?.('bounty-omega-zero')},
    ]
  },
  {
    id:'secret_darkknight', name:'暗黒騎士', carrierJobId:'paladin', weapon:'sword', secret:true,
    desc:'守りを捨てず、痛みそのものを力へ変える禁忌の騎士。', masteryLv:40,
    hint:'聖なる守りを知る者が、灰の盾の奥にある闇へ触れた時……。',
    conditions:[
      {id:'paladin',label:'パラディンをMASTER',check:s=>s.isMastered('paladin')},
      {id:'shield',label:'灰騎士の大盾を覚醒',check:s=>!!s.getUniqueTrialProgress?.('uq_ash_knight_shield')?.awakened},
      {id:'ash',label:'灰喰らいの騎士を討伐',check:s=>!!s.isBountyDefeated?.('bounty-ash-knight')},
    ]
  },
  {
    id:'secret_necromancer', name:'死霊術師', carrierJobId:'sage', weapon:'staff', secret:true,
    desc:'生と死の境界を研究し、亡き力を術式へ変える隠し職。', masteryLv:40,
    hint:'癒しと破壊を学び、堕ちた予言者の最期を見届けよ。',
    conditions:[
      {id:'mage',label:'魔法使いをMASTER',check:s=>s.isMastered('mage')},
      {id:'priest',label:'僧侶をMASTER',check:s=>s.isMastered('priest')},
      {id:'oracle',label:'堕星の予言者を討伐',check:s=>!!s.isBountyDefeated?.('bounty-fallen-oracle')},
      {id:'staff',label:'星詠みの杖を所持',check:s=>!!s.ownsItem?.('uq_star_oracle_staff')},
    ]
  },
  {
    id:'secret_beastlord', name:'魔物使い', carrierJobId:'beasttamer', weapon:'bow', secret:true,
    desc:'魔物との絆を戦力へ変える、仲間特化の隠し職。', masteryLv:40,
    hint:'魔物を狩るだけでは足りない。共に戦う者を集め、赤牙を越えよ。',
    conditions:[
      {id:'hunter',label:'狩人をMASTER',check:s=>s.isMastered('hunter')},
      {id:'companions',label:'仲間を5体以上集める',check:s=>(s.companionList?.().length||Object.keys(s.data.companionInstances||{}).length)>=5},
      {id:'varg',label:'赤牙のヴァルグを討伐',check:s=>!!s.isBountyDefeated?.('bounty-redfang-varg')},
    ]
  },
  {
    id:'secret_executioner', name:'処刑人', carrierJobId:'battlemaster', weapon:'sword', secret:true,
    desc:'強敵の弱った瞬間だけを狙う、対Boss特化の隠し職。', masteryLv:40,
    hint:'王を殺す刃を目覚めさせ、王冠なき者を討て。',
    conditions:[
      {id:'battle',label:'バトルマスターをMASTER',check:s=>s.isMastered('battlemaster')},
      {id:'regicide',label:'王殺しを覚醒',check:s=>!!s.getUniqueTrialProgress?.('uq_regicide')?.awakened},
      {id:'crownless',label:'王冠なき処刑人を討伐',check:s=>!!s.isBountyDefeated?.('bounty-crownless')},
    ]
  },
  {
    id:'secret_mechanosage', name:'機巧賢者', carrierJobId:'artificer', weapon:'staff', secret:true,
    desc:'魔導技術と機界演算を接続し、戦闘そのものを再設計する超高位隠し職。', masteryLv:50,
    hint:'人の技術だけでは届かない。魔導技師の星を極め、設計者の中枢核を持ち帰れ。',
    conditions:[
      {id:'artificer',label:'魔導技師をMASTER',check:s=>s.isMastered('artificer')},
      {id:'architect',label:'設計主機・ARCHITECT-1を撃破',check:s=>!!s.isStageCleared?.('machine-world-10')},
      {id:'core',label:'設計主機の中枢核を所持',check:s=>!!s.ownsItem?.('uq_architect_core')},
    ]
  },
];

export function getSecretJob(id){ return SECRET_JOBS.find(j=>j.id===id)||null; }
