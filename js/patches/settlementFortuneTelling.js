/* Settlement Future Ideas #6 — Fortune-telling.
   Wraps the existing endgame-guidance computation as a Settlement NPC action.
   No new currency, no new save root: see SETTLEMENT_FUTURE_IDEAS_DESIGN.md. */
import { state } from '../state.js';
import { buildEndgameGuidance } from '../data/endgameGuidance.js';
import { FORTUNE_COST_GOLD, fortuneFlavorFor } from '../data/settlementFortuneTelling.js';

function activeNemesisLevel(){return Number(state.activeBountyNemesis?.()?.level)||0;}

function currentGuidance(){
  return buildEndgameGuidance({
    level: state.characterLevel,
    abyssBestDepth: state.data.abyssBestDepth || 0,
    worldTierId: state.data.worldTierId || 'normal',
    nemesisLevel: activeNemesisLevel(),
    abyssUnlocked: state.isAbyssUnlocked(),
  });
}

state.settlementFortuneUnlocked = function(){
  return (this.settlementLevel?.('inn') || 0) >= 1;
};

state.settlementFortuneCost = function(){
  return FORTUNE_COST_GOLD;
};

state.canDrawSettlementFortune = function(){
  return this.settlementFortuneUnlocked() && (this.data.gold || 0) >= this.settlementFortuneCost();
};

state.drawSettlementFortune = function(){
  if (!this.canDrawSettlementFortune()) {
    return { ok: false, reason: (this.data.gold || 0) < this.settlementFortuneCost() ? 'gold' : 'locked' };
  }
  const cost = this.settlementFortuneCost();
  this.data.gold -= cost;
  const guidance = currentGuidance();
  const reading = {
    flavor: fortuneFlavorFor(guidance.laneId),
    title: guidance.title,
    reason: guidance.reason,
    targetButtonId: guidance.targetButtonId,
  };
  this.save();
  return { ok: true, cost, reading };
};
