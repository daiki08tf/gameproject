/* ============================================================
   Post-CP3 Vertical Extension V4/V6 — Convergence Apex bridge
   ------------------------------------------------------------
   Reuses BattleEngine and TextBattleScreen hooks. No persisted meter/resource,
   parallel engine or extra battle screen. Final cycles Ash -> Ninth -> Root.
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';

const MARK=Symbol.for('bladeVale.postCp3ConvergenceApexCombat');

function livePhase(engine){
  if(!engine?.stage?.convergenceApex)return null;
  const boss=engine.aliveEnemies?.find?.(enemy=>enemy.boss&&enemy.convergenceApexPhase);
  return boss?.convergenceApexPhase||null;
}
function finalCycle(engine){
  const index=Math.floor(Math.max(0,(Number(engine.round)||1)-1)/2)%3;
  return ['ash','ninth','root'][index];
}
function pressurePhase(engine){
  const phase=livePhase(engine);
  return phase==='convergence'?finalCycle(engine):phase;
}

if(!BattleEngine.prototype[MARK]){
  BattleEngine.prototype[MARK]=true;

  const originalBeginNextEncounter=BattleEngine.prototype.beginNextEncounter;
  BattleEngine.prototype.beginNextEncounter=function(){
    const event=originalBeginNextEncounter.call(this);
    if(this.stage?.convergenceApex&&event&&this.defeated>0)this._freshGroupPending=false;
    return event;
  };

  const originalEnemyDamage=BattleEngine.prototype._enemyAttackDamage;
  BattleEngine.prototype._enemyAttackDamage=function(atk,opts={}){
    let damage=originalEnemyDamage.call(this,atk,opts);
    if(!this.stage?.convergenceApex)return damage;
    const phase=pressurePhase(this);
    if(phase==='ash')damage*=1.12;
    else if(phase==='ninth')damage*=1.04;
    return Math.max(1,Math.round(damage));
  };

  const originalHeal=BattleEngine.prototype._resolveTechniqueHeal;
  BattleEngine.prototype._resolveTechniqueHeal=function(tech,result){
    if(!this.stage?.convergenceApex)return originalHeal.call(this,tech,result);
    const prior=this.stage.healMult;
    const phase=pressurePhase(this);
    this.stage.healMult=phase==='ash'?0.55:phase==='root'?0.82:0.92;
    try{return originalHeal.call(this,tech,result);}finally{this.stage.healMult=prior;}
  };

  const originalMpCost=BattleEngine.prototype._effectiveMpCost;
  BattleEngine.prototype._effectiveMpCost=function(tech){
    const base=originalMpCost.call(this,tech);
    if(!this.stage?.convergenceApex)return base;
    const phase=pressurePhase(this);
    return phase==='root'?Math.max(0,Math.round(base*1.22)):base;
  };

  const originalPlayerAction=BattleEngine.prototype.performPlayerAction;
  BattleEngine.prototype.performPlayerAction=function(action){
    if(this.stage?.convergenceApex){
      const phase=pressurePhase(this);
      const type=String(action?.type||'');
      if(phase==='root'){
        if(['attack','skill','spell'].includes(type)){
          if(this._apexLastActionType===type)this._apexRepeatCount=(Number(this._apexRepeatCount)||0)+1;
          else this._apexRepeatCount=0;
          this._apexLastActionType=type;
          this._apexRepeatPenalty=Math.min(.16,(Number(this._apexRepeatCount)||0)*.08);
        }else if(type==='guard'){
          this._apexLastActionType=null;
          this._apexRepeatCount=0;
          this._apexRepeatPenalty=0;
        }
      }else{
        this._apexLastActionType=null;
        this._apexRepeatCount=0;
        this._apexRepeatPenalty=0;
      }
    }
    return originalPlayerAction.call(this,action);
  };

  const originalCalculateDamage=BattleEngine.prototype.calculateDamage;
  BattleEngine.prototype.calculateDamage=function(...args){
    const result=originalCalculateDamage.apply(this,args);
    if(!this.stage?.convergenceApex||!result||!Number.isFinite(result.damage))return result;
    const penalty=Math.max(0,Math.min(.16,Number(this._apexRepeatPenalty)||0));
    if(!penalty)return result;
    return {...result,damage:Math.max(1,Math.round(result.damage*(1-penalty)))};
  };

  const originalAdvanceTurn=BattleEngine.prototype.advanceTurn;
  BattleEngine.prototype.advanceTurn=function(command){
    if(!this.stage?.convergenceApex||pressurePhase(this)!=='ninth')return originalAdvanceTurn.call(this,command);
    const snapshots=(this.enemies||[]).map(enemy=>[enemy,enemy.spd]);
    for(const [enemy,spd] of snapshots)if(!enemy.dead)enemy.spd=Math.max(1,Math.round(spd*1.16));
    try{return originalAdvanceTurn.call(this,command);}finally{
      for(const [enemy,spd] of snapshots)enemy.spd=spd;
    }
  };
}

const SCREEN_MARK=Symbol.for('bladeVale.postCp3ConvergenceApexReadability');
if(!TextBattleScreen.prototype[SCREEN_MARK]){
  TextBattleScreen.prototype[SCREEN_MARK]=true;
  const originalRender=TextBattleScreen.prototype._render;
  TextBattleScreen.prototype._render=function(){
    const result=originalRender.call(this);
    if(!this.engine?.stage?.convergenceApex)return result;
    const live=livePhase(this.engine);
    const pressure=pressurePhase(this.engine);
    const labels={ash:'I · ASH',ninth:'II · NINTH',root:'III · ROOT'};
    const label=live==='convergence'?`FINAL · ${String(pressure||'').toUpperCase()}`:(labels[live]||'APEX');
    if(this.el?.stageName){
      this.el.stageName.textContent=`収束観測 — ${label}`;
      this.el.stageName.title=live==='convergence'
        ? 'FinalはASH→NINTH→ROOTを2ラウンドずつ循環'
        : live==='ash'?'回復圧と重い一撃'
          :live==='ninth'?'高速再照準・先手圧'
            :live==='root'?'MP消費・同一行動反復圧':'CONVERGENCE APEX';
    }
    return result;
  };
}
