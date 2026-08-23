import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';

function record(event, amount=1){ if(state.recordUniqueTrialEvent) state.recordUniqueTrialEvent(event, amount); }

// 会心はダメージ計算の共通経路で記録する。
const originalCalculateDamage = BattleEngine.prototype.calculateDamage;
BattleEngine.prototype.calculateDamage = function trialCalculateDamage(atk,target,opts={}){
  const out=originalCalculateDamage.call(this,atk,target,opts);
  if(out.critical) record('critical');
  return out;
};

// ガード試練。次の通常攻撃まで「ガード後」を保持して大盾の反撃試練へつなぐ。
const originalGuard = BattleEngine.prototype._playerGuard;
BattleEngine.prototype._playerGuard = function trialGuard(){
  const out=originalGuard.call(this);
  record('guard');
  this._trialGuardArmed=true;
  return out;
};

const originalAttack = BattleEngine.prototype._playerAttack;
BattleEngine.prototype._playerAttack = function trialAttack(targetId){
  const out=originalAttack.call(this,targetId);
  if(this._trialGuardArmed && !out.noTarget){
    record('guardCounter');
    if(this.stage?.bounty) record('guardCounterBoss');
    this._trialGuardArmed=false;
  }
  if(out.uniqueStarStrike){
    record('starStrike');
    if(this.stage?.boss || this.stage?.bounty) record('starStrikeBoss');
  }
  return out;
};

// 呪文フィニッシュと明示的回復の使用を拾う。
const originalTechnique = BattleEngine.prototype._playerTechnique;
BattleEngine.prototype._playerTechnique = function trialTechnique(kind,techId,targetId){
  const out=originalTechnique.call(this,kind,techId,targetId);
  if(out?.healAmount>0) this._trialUsedHeal=true;
  if(kind==='spell' && !out?.blocked && this.stage?.bounty && (out?.targets||[]).some(t=>t.defeated)) record('bountySpellKill');
  return out;
};

// ボス予兆をガードして生存できた場合。
const originalAdvanceTurn = BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn = function trialAdvanceTurn(command){
  const heavyIncoming=command?.type==='guard' && this.aliveEnemies.some(e=>e.boss && e.pendingSpecial);
  const prevAction=this._trialLastActionType || null;
  const out=originalAdvanceTurn.call(this,command);
  if(heavyIncoming && this.player.hp>0) record('guardBossHeavy');

  if(['attack','skill','spell'].includes(command?.type)){
    if(prevAction && prevAction!==command.type){
      this._trialDiverseRun=(this._trialDiverseRun||1)+1;
      if(this._trialDiverseRun>=3){ record('diverseSequence'); this._trialDiverseRun=1; }
    } else if(prevAction===command.type){ this._trialDiverseRun=1; }
    this._trialLastActionType=command.type;
  }
  if((out.events||[]).some(e=>e.type==='bountyUnique'&&e.result?.kind==='omegaAnalysisComplete')) this._trialHadDiverseSet=true;
  return out;
};

// 戦闘クリア時の条件型Trial。単純な雑魚キル数は一切使わない。
const originalFinish = BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle = function trialFinishBattle(cleared,retreated){
  const stage=this.stage;
  const hpRatio=this.player.maxHp>0?this.player.hp/this.player.maxHp:0;
  const mpRatio=this.player.maxMp>0?this.player.mp/this.player.maxMp:0;
  const round=this.round||0;
  originalFinish.call(this,cleared,retreated);
  if(!cleared) return;

  if(stage?.boss || stage?.bounty){
    if(hpRatio>=0.5) record('bossKillHighHp');
    if(mpRatio>=0.2) record('bossKillMpReserve');
    if(round<=6) record('fastBossKill');
  }
  if(stage?.bounty){
    record('bountyKill');
    if(['B','A','S','EX'].includes(stage.bountyRank)) record('highRankBountyKill');
    if(hpRatio<=0.30) record('bountyKillLowHp');
    if(hpRatio>=0.50) record('bountyKillHighHp');
    if(!this._trialUsedHeal) record('bountyKillNoHeal');
    // 現状は仲間死亡状態を永続保持しないため、全滅していなければ「仲間を失わず」とみなす。
    record('bountyKillNoCompanionDown');
    if(stage.id==='bounty-omega-zero') record('omegaKill');
    if(hpRatio<=0.25){ record('executeBoss'); record('executeBounty'); }
  }
  if(this._trialHadDiverseSet) record('diverseBattle');
};
