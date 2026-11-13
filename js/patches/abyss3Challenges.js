import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ABYSS_CHALLENGES, abyssChallenge, abyssChallengeDanger, abyssChallengeFlags } from '../data/abyssChallenges.js';

function ensure(){
  if(!Array.isArray(state.data.abyssChallenges)) state.data.abyssChallenges=[];
  state.data.abyssChallenges=[...new Set(state.data.abyssChallenges)].filter(id=>abyssChallenge(id));
}
ensure();
state.abyssChallenges=ABYSS_CHALLENGES;
state.activeAbyssChallenges=function(){ ensure(); return [...this.data.abyssChallenges]; };
state.abyssChallengeDanger=function(){ return abyssChallengeDanger(this.activeAbyssChallenges()); };
state.abyssChallengeFlags=function(){ return abyssChallengeFlags(this.activeAbyssChallenges()); };
state.toggleAbyssChallenge=function(id){
  ensure(); if(!abyssChallenge(id)) return false;
  const current=[...this.data.abyssChallenges],i=current.indexOf(id);
  if(i>=0) current.splice(i,1); else current.push(id);
  this.data.abyssChallenges=current; this.save(); return true;
};
state.clearAbyssChallenges=function(){ this.data.abyssChallenges=[]; this.save(); };

/* ---- DBG-21: チャレンジが名乗っている効果のうち、stage.abyssChallengeRewards に
   載るだけで誰にも読まれていなかったものを、既存の仕組みへ配線する。
     精鋭招来「Elite脅威+2」   → 既存の Elite 出現率（state.abyssEliteChance）へ加算
     覇者の秘技「Boss固有技+1」 → Boss の固有技の周期を短縮（深層観測の
                                   bossTechniqueIntervalMult と同じ方式）
     覇者の秘技「特殊報酬判定」 → Boss 撃破時に既存の Boss 武器抽選をもう 1 回
   「Set出現率+30%」は endgameDropContextFix.js の Set 重み調整に載せている。
   Greater / Legendary は同ファイルの stageDropContext 経由（DBG-14）。 */
export const ABYSS_CHALLENGE_EFFECTS = Object.freeze({
  ELITE_CHANCE_PER_THREAT: 0.10, // 脅威 1 点あたりの Elite 出現率加算
  ELITE_CHANCE_CAP: 0.90,
  BOSS_TECHNIQUE_INTERVAL_PER_BONUS: 0.75, // 固有技 +1 ごとに周期 ×0.75
});

const baseAbyssEliteChance = state.abyssEliteChance;
state.abyssEliteChance = function challengeEliteChance(depth = 0) {
  const base = baseAbyssEliteChance.call(this, depth);
  const threat = Number(this.abyssChallengeFlags().eliteBonus) || 0;
  if (threat <= 0) return base;
  return Math.min(ABYSS_CHALLENGE_EFFECTS.ELITE_CHANCE_CAP, base + threat * ABYSS_CHALLENGE_EFFECTS.ELITE_CHANCE_PER_THREAT);
};

const baseSpawnEnemy = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function challengeSpawnEnemy(type) {
  const enemy = baseSpawnEnemy.call(this, type);
  const bonus = this.stage?.isAbyss ? Number(this.stage.abyssChallengeRewards?.bossTechniqueBonus) || 0 : 0;
  if (enemy?.boss && bonus > 0) {
    const mult = Math.pow(ABYSS_CHALLENGE_EFFECTS.BOSS_TECHNIQUE_INTERVAL_PER_BONUS, bonus);
    for (const key of ['slamTurns', 'chargeTurns', 'projectileTurns', 'summonTurns']) {
      if (enemy[key] != null) enemy[key] = Math.max(1, Math.round(enemy[key] * mult));
    }
  }
  return enemy;
};

const baseGrantKillRewards = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function challengeGrantKillRewards(enemy) {
  const wasBoss = !!enemy?.boss;
  const result = baseGrantKillRewards.call(this, enemy);
  if (result && wasBoss && this.stage?.isAbyss && this.stage.abyssChallengeRewards?.specialReward) {
    const extra = this._rollBossWeaponDrop({ depth: this.stage.abyssDepth || 0, elite: !!enemy.elite, boss: true });
    if (extra) { extra.challengeSpecialReward = true; (result.drops ||= []).push(extra); }
  }
  return result;
};
