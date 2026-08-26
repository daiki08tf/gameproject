/* Unique Mastery Trials
 * 単純なキル数ではなく、装備の個性に沿ったプレイ実績で覚醒資格を得る。
 * event は汎用Trial trackerが受け取るイベント名。
 */
import { worldMysteryClue } from './storyWorldMystery.js';

export const UNIQUE_TRIAL_STORY_CLUE=worldMysteryClue('uniqueTrial');

export const UNIQUE_TRIALS = {
  uq_bloodfang_gram: {
    name:'血牙グラムの試練', flavor:'牙はまだ、主を認めていない。', storyClue:UNIQUE_TRIAL_STORY_CLUE,
    trials:[
      {id:'bounty3', label:'賞金首を3体討伐する', event:'bountyKill', target:3},
      {id:'boss_high_hp', label:'HP50%以上を維持してボスを撃破する', event:'bossKillHighHp', target:1},
      {id:'critical50', label:'会心を50回発生させる', event:'critical', target:50},
    ],
    branches:[
      {id:'fenrir', name:'血獣剣フェンリル', hint:'瀕死の牙を極める攻撃型', requirements:[{event:'bountyKillLowHp',target:1},{event:'bountyKillNoHeal',target:1}]},
      {id:'true_gram', name:'真祖剣グラム', hint:'血を保ち続ける継戦型', requirements:[{event:'bountyKillHighHp',target:1},{event:'bountyKillNoCompanionDown',target:1}]},
    ]
  },
  uq_ash_knight_shield: {
    name:'灰騎士の大盾の試練', flavor:'守るだけでは、城にはなれない。', storyClue:UNIQUE_TRIAL_STORY_CLUE,
    trials:[
      {id:'guard30',label:'ガードを30回成功させる',event:'guard',target:30},
      {id:'guard_boss',label:'ボスの強攻撃をガードして生存する',event:'guardBossHeavy',target:1},
      {id:'counter20',label:'ガード後の強化攻撃を20回命中させる',event:'guardCounter',target:20},
    ],
    branches:[
      {id:'fortress',name:'不落の灰城',hint:'絶対防御と反撃を極める',requirements:[{event:'guardBossHeavy',target:3}]},
      {id:'avenger',name:'灰燼の報復盾',hint:'受けた痛みを火力へ変える',requirements:[{event:'guardCounterBoss',target:3}]},
    ]
  },
  uq_star_oracle_staff: {
    name:'星詠みの杖の試練', flavor:'星は詠む者ではなく、繋ぐ者を選ぶ。', storyClue:UNIQUE_TRIAL_STORY_CLUE,
    trials:[
      {id:'spell_chain30',label:'呪文→通常攻撃の星追撃を30回発動する',event:'starStrike',target:30},
      {id:'spell_bounty3',label:'呪文で賞金首にとどめを3回刺す',event:'bountySpellKill',target:3},
      {id:'mp_boss',label:'MPを20%以上残してボスを撃破する',event:'bossKillMpReserve',target:1},
    ],
    branches:[
      {id:'astra',name:'堕星杖アストラ',hint:'連携から星墜としを呼ぶ',requirements:[{event:'starStrikeBoss',target:10}]},
      {id:'seer',name:'天命杖オラクル',hint:'MP管理と予見を極める',requirements:[{event:'bossKillMpReserve',target:5}]},
    ]
  },
  uq_regicide: {
    name:'王殺しの試練', flavor:'雑兵の血では、この刃は満たされない。', storyClue:UNIQUE_TRIAL_STORY_CLUE,
    trials:[
      {id:'bounty_b3',label:'B級以上の賞金首を3体討伐する',event:'highRankBountyKill',target:3},
      {id:'fast_boss',label:'ボスを規定ターン以内に撃破する',event:'fastBossKill',target:3},
      {id:'execute',label:'HP25%以下のボスにとどめを刺す',event:'executeBoss',target:10},
    ],
    branches:[
      {id:'regicide_true',name:'断頭剣レギサイド',hint:'ボス処刑に全てを捧げる',requirements:[{event:'executeBounty',target:5}]},
      {id:'tyrant',name:'簒奪剣タイラント',hint:'強敵を倒すほど勢いを増す',requirements:[{event:'highRankBountyKill',target:8}]},
    ]
  },
  uq_omega_core: {
    name:'零式演算核の試練', flavor:'単調な行動は、演算する価値すらない。', storyClue:UNIQUE_TRIAL_STORY_CLUE,
    trials:[
      {id:'diverse20',label:'攻撃・特技・呪文を1戦で全て使う ×20戦',event:'diverseBattle',target:20},
      {id:'sequence10',label:'異なる3行動を連続で10回成立させる',event:'diverseSequence',target:10},
      {id:'omega',label:'零号禁機オメガを再討伐する',event:'omegaKill',target:1},
    ],
    branches:[
      {id:'omega_complete',name:'完全演算核Ω',hint:'行動順によって異なる演算効果を得る',requirements:[{event:'diverseSequence',target:30}]},
      {id:'chaos_core',name:'非定型演算核Χ',hint:'同じ行動を繰り返さない戦術を極める',requirements:[{event:'noRepeatBattle',target:10}]},
    ]
  }
};

export function uniqueTrialDef(itemId){ return UNIQUE_TRIALS[itemId] || null; }
