/* Phase 8 — direct BattleEngine integration for Fusion combat identities. */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';

const originalAdvance = BattleEngine.prototype.advanceTurn;
const originalCtorMarker = Symbol('fusionBattleStarted');

function gaugeGainFor(command, events=[]) {
  let gain = 5; // every committed turn advances the hybrid loop a little
  if (command?.type === 'attack') gain += 10;
  if (command?.type === 'guard') gain += 12;
  if (command?.type === 'skill') gain += 14;
  if (command?.type === 'spell') gain += 16;
  const text = JSON.stringify(events);
  if (/crit|critical|会心/i.test(text)) gain += 12;
  if (/weak|弱点|element|属性/i.test(text)) gain += 10;
  if (/heal|回復|regen/i.test(text)) gain += 10;
  if (/status|poison|burn|freeze|shock|weaken|毒|炎上|凍結|感電/i.test(text)) gain += 10;
  if (/evade|回避/i.test(text)) gain += 8;
  if (/break|stagger/i.test(text)) gain += 10;
  return Math.min(35, gain);
}

function resolveFusionCommand(engine) {
  const used = state.useFusionCommand?.();
  if (!used?.ok) return { events:[{type:'fusionCommandFailed', reason:'not_ready'}], over:engine.over, result:null };
  const cmd = used.command;
  const target = engine.aliveEnemies?.[0];
  const events = [{type:'fusionCommand', name:cmd.name, effects:cmd.effects, gauge:used.gauge}];
  if (target && typeof engine.calculateDamage === 'function') {
    const raw = Math.max(1, Math.round(engine.calculateDamage(target) * (cmd.power || 1.35)));
    if (typeof engine._applyRawDamageAndReward === 'function') engine._applyRawDamageAndReward(target, raw, events, { source:'fusionCommand' });
    else { target.hp = Math.max(0, target.hp - raw); if (target.hp <= 0) target.dead = true; events.push({type:'damage', targetId:target.id, damage:raw, source:'fusionCommand'}); }
  }
  if (cmd.effects.includes('heal')) { const amount=Math.max(1,Math.round(engine.player.maxHp*.18)); engine.player.hp=Math.min(engine.player.maxHp,engine.player.hp+amount); events.push({type:'heal', amount, source:'fusionCommand'}); }
  if (cmd.effects.includes('buff')) { engine.player.buffs.atk={mult:1.2,turnsLeft:3}; events.push({type:'buff', stat:'atk', source:'fusionCommand'}); }
  if (cmd.effects.includes('fortify')) { engine.player.buffs.def={mult:1.25,turnsLeft:3}; events.push({type:'buff', stat:'def', source:'fusionCommand'}); }
  return {events, over:engine.over, result:null};
}

BattleEngine.prototype.fusionCombatSummary = function(){ return state.fusionCombatSummary?.() || null; };
BattleEngine.prototype.canUseFusionCommand = function(){ return !!state.canUseFusionCommand?.(); };

BattleEngine.prototype.advanceTurn = function phase8FusionAdvance(command) {
  if (!this[originalCtorMarker]) { state.resetFusionBattleResource?.(); this[originalCtorMarker]=true; }
  if (command?.type === 'fusion') return resolveFusionCommand(this);
  const out = originalAdvance.call(this, command);
  if (!out?.over && state.fusionCombatIdentity?.()) {
    const before=state.fusionGauge();
    const after=state.gainFusionGauge(gaugeGainFor(command,out.events));
    if (after!==before) out.events.push({type:'fusionGauge', before, after, ready:state.canUseFusionCommand()});
    if (before<50 && after>=50) out.events.push({type:'fusionTraitReady', trait:state.fusionCombatIdentity().trait.name});
    if (before<100 && after>=100) out.events.push({type:'fusionCommandReady', command:state.fusionCombatIdentity().command.name});
  }
  return out;
};
