/*
 * ボスの隠し条件の実行時パッチ。条件と判定は js/data/battleBossConditions.js。
 * ここは (1) その戦闘でのどうぐ使用回数を数え、(2) 勝利時に条件を判定し、
 * (3) 初達成なら既存の経路で報酬を渡して結果オブジェクトに記す、だけを行う。
 * 戦闘ルール・敵・既存のドロップ抽選には触れない。
 */
import { BattleEngine } from '../battleEngine.js';
import { state } from '../state.js';
import { bossConditionFor, evaluateBossCondition, bossConditionClaimId } from '../data/battleBossConditions.js';

state.bossConditionStatus = function bossConditionStatus(stage) {
  const cond = bossConditionFor(stage);
  if (!cond) return null;
  return { ...cond, claimed: !!(this.data.claimedMilestones || {})[bossConditionClaimId(cond.stageId)] };
};

function settle(engine, result) {
  if (!result?.cleared || result.bossCondition) return;
  const cond = bossConditionFor(engine.stage);
  if (!cond) return;
  const claims = state.data.claimedMilestones ||= {};
  const claimId = bossConditionClaimId(cond.stageId);
  const already = !!claims[claimId];
  const p = engine.player || {};
  const verdict = evaluateBossCondition(cond, {
    rounds: Number(engine.round) || 0,
    itemsUsed: Number(engine._bossCondItems) || 0,
    hpRatio: p.maxHp > 0 ? Math.max(0, p.hp) / p.maxHp : 0,
    companionsDown: (engine.companions || []).filter((c) => c.down || c.hp <= 0).length,
  });
  if (!verdict) return;
  let granted = null;
  if (verdict.met && !already) {
    claims[claimId] = true;
    if (cond.reward.itemId) {
      state.addItem(cond.reward.itemId, 1, { depth: 0, boss: true });
      (result.items ||= []).push(state.consumeLastWeaponInstanceId?.() || cond.reward.itemId);
      granted = cond.reward.itemName;
    } else {
      if (cond.reward.manastone) state.addManastone(cond.reward.manastone);
      if (cond.reward.gold) state.gainGold(cond.reward.gold);
      granted = cond.rewardText;
    }
    state.save();
  }
  result.bossCondition = { label: cond.label, met: verdict.met, detail: verdict.detail, already, granted, rewardText: cond.rewardText };
}

const previousAdvanceTurn = BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn = function bossConditionAdvanceTurn(command) {
  const out = previousAdvanceTurn.call(this, command);
  if (command?.type === 'item' && !out?.events?.some((ev) => ev.type === 'playerAction' && ev.result?.action === 'item' && ev.result.blocked)) {
    this._bossCondItems = (this._bossCondItems || 0) + 1;
  }
  if (out?.over) settle(this, out.result || this.finalResult);
  return out;
};
