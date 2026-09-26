/* ============================================================
   旅人星盤 (Wayfarer Skill Tree) — runtime
   ------------------------------------------------------------
   職業星盤 (jobConstellation) と同じ購入・前提・SP集計の構造だが、
   役割は別物：こちらは職業を替えても残る「旅人」の恒久的な専門化。
   SPは保存値ではなく導出値（章ボス撃破数 + 最高職業Lv/10）なので
   既存セーブには所持分が自動で付き、購入記録だけを既存の
   セーブルート下 `data.playerSkillTree` に載せる（新しいセーブ
   ルートは作らない）。リセットは常時無料 — ビルドの実験を阻まない。
   ============================================================ */
import { state } from '../state.js';
import { PLAYER_SKILL_TREE, playerTreeNode } from '../data/playerSkillTree.js';
import { CHAPTERS } from '../data/stages.js';
import { CAPS_LAYER } from '../data/balance.js';
import { BattleEngine } from '../battleEngine.js';
import { chainMethod } from './patchUtils.js';

function ensure(target = state) { target.data.playerSkillTree ||= []; return target.data; }

state.playerTreePurchased = function playerTreePurchased() { return new Set(ensure(this).playerSkillTree); };
// SP導出：章ボス撃破ごとに+1、到達した最高職業Lvの10ごとに+1。
// どちらも既存の進行記録から読むので旧セーブも適量を持つ。
state.playerTreeEarned = function playerTreeEarned() {
  let bosses = 0;
  for (const ch of CHAPTERS) for (const st of ch.stages || []) if (st.boss && this.isStageCleared(st.id)) bosses++;
  let maxLevel = 1;
  for (const prog of Object.values(this.data.jobs || {})) maxLevel = Math.max(maxLevel, Number(prog?.level) || 1);
  return bosses + Math.floor(maxLevel / 10);
};
state.playerTreeSpent = function playerTreeSpent() { const b = this.playerTreePurchased(); return PLAYER_SKILL_TREE.reduce((s, n) => s + (b.has(n.id) ? n.cost : 0), 0); };
state.playerTreeAvailable = function playerTreeAvailable() { return Math.max(0, this.playerTreeEarned() - this.playerTreeSpent()); };
state.playerTreeNodeStatus = function playerTreeNodeStatus(nodeId) {
  const n = playerTreeNode(nodeId);
  if (!n) return { exists: false, bought: false, canBuy: false };
  const b = this.playerTreePurchased(), prereq = n.requires.every(id => b.has(id));
  return { exists: true, bought: b.has(n.id), prereq, canBuy: !b.has(n.id) && prereq && this.playerTreeAvailable() >= n.cost, node: n };
};
state.buyPlayerTreeNode = function buyPlayerTreeNode(nodeId) {
  const s = this.playerTreeNodeStatus(nodeId);
  if (!s.canBuy) return false;
  ensure(this).playerSkillTree.push(nodeId); this.save(); return true;
};
state.resetPlayerTree = function resetPlayerTree() { ensure(this).playerSkillTree = []; this.save(); return true; };
state.activePlayerTreeNodes = function activePlayerTreeNodes() { const b = this.playerTreePurchased(); return PLAYER_SKILL_TREE.filter(n => b.has(n.id)); };

// ---- 集計ペイロード ----------------------------------------------------------
const COMPANION_MULT_KEYS = ['hpMult', 'mpMult', 'atkMult', 'defMult', 'magMult', 'spdMult', 'expMult'];
state.playerTreeCompanionBonuses = function playerTreeCompanionBonuses() {
  const out = { takenMult: 1 };
  for (const k of COMPANION_MULT_KEYS) out[k] = 1;
  for (const n of this.activePlayerTreeNodes()) {
    const c = n.companion || {};
    for (const k of COMPANION_MULT_KEYS) if (Number(c[k])) out[k] *= Number(c[k]);
    if (Number(c.takenMult)) out.takenMult *= Number(c.takenMult);
  }
  return out;
};
const HUNT_KEYS = ['rareChanceBonus', 'roamerChanceBonus', 'uniqueChanceBonus', 'recruitChanceBonus', 'dropMultBonus'];
state.playerTreeHuntBonuses = function playerTreeHuntBonuses() {
  const out = { cursedResist: 0 };
  for (const k of HUNT_KEYS) out[k] = 0;
  for (const n of this.activePlayerTreeNodes()) {
    const h = n.hunt || {};
    for (const k of HUNT_KEYS) out[k] += Math.max(0, Number(h[k]) || 0);
    if (Number(h.cursedResist)) out.cursedResist = Math.min(.8, out.cursedResist + Number(h.cursedResist));
  }
  return out;
};
// 個別の読み口（engine側から直接読む面用）
state.playerTreeRoamerBonus = function playerTreeRoamerBonus() { return this.playerTreeHuntBonuses().roamerChanceBonus; };
state.playerTreeUniqueBonus = function playerTreeUniqueBonus() { return this.playerTreeHuntBonuses().uniqueChanceBonus; };
state.playerTreeRecruitBonus = function playerTreeRecruitBonus() { return this.playerTreeHuntBonuses().recruitChanceBonus; };
state.playerTreeCompanionTakenMult = function playerTreeCompanionTakenMult() { return this.playerTreeCompanionBonuses().takenMult; };

// ---- ステータス・効果への接線（職業星盤と同じ語彙） ----------------------------
function applyStats(stats, n) {
  for (const [key, m] of Object.entries(n.statMult || {})) {
    if (key === 'spd') stats.spd = Math.max(.1, Math.round(stats.spd * m * 10) / 10);
    else if (stats[key] != null) stats[key] = Math.max(1, Math.round(stats[key] * m));
  }
  for (const [key, a] of Object.entries(n.statAdd || {})) {
    if (key === 'critPct') stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, stats.critPct + a);
    else if (key === 'armorPen') stats.armorPen = Math.min(CAPS_LAYER.ARMOR_PEN_MAX, (stats.armorPen || 0) + a);
    else if (key === 'evasion') stats.evasion = Math.min(CAPS_LAYER.EVASION_MAX, (stats.evasion || 0) + a);
  }
}
chainMethod(state, 'getStats', previous => function playerTreeStats() {
  const stats = previous();
  for (const n of this.activePlayerTreeNodes()) applyStats(stats, n);
  return stats;
});
const previousEffects = state.getEquippedEffects.bind(state);
state.getEquippedEffects = function playerTreeEffects() {
  const effects = previousEffects();
  for (const n of this.activePlayerTreeNodes()) for (const effect of n.effects || []) effects.push({ ...effect, __playerTree: n.id });
  return effects;
};

// ---- 仲間への接線 ----------------------------------------------------------
// 仲間の能力値には既存のシナジー集計を使う（倍率の束を1枚に畳むので
// 既存UIの「シナジー」表示・計算経路がそのまま効く）。
if (state.companionSynergySummary) {
  const prevSummary = state.companionSynergySummary.bind(state);
  state.companionSynergySummary = function playerTreeCompanionSynergy() {
    const s = prevSummary() || { active: [], total: {} };
    const b = this.playerTreeCompanionBonuses();
    for (const k of COMPANION_MULT_KEYS) if (k !== 'expMult') s.total[k] = (s.total[k] || 1) * (b[k] || 1);
    return s;
  };
}
// 仲間EXPは既存のexpラッパーに掛け算を1枚足すだけ。
if (state.gainPartyCompanionExp) {
  const prevGain = state.gainPartyCompanionExp.bind(state);
  state.gainPartyCompanionExp = function playerTreeCompanionExp(amount) {
    return prevGain(amount * this.playerTreeCompanionBonuses().expMult);
  };
}

// ---- 巡回・遭遇への接線 ----------------------------------------------------
// Rare紛れ込み率：匂い袋と同じ「encounterPoolを複製して底上げ」パターン。
// 共有Stageのプールは書き換えない。
const RARE_MARK = Symbol.for('bladeVale.playerSkillTree.rareChance');
if (!BattleEngine.prototype[RARE_MARK]) {
  BattleEngine.prototype[RARE_MARK] = true;
  const originalBegin = BattleEngine.prototype.beginNextEncounter;
  BattleEngine.prototype.beginNextEncounter = function playerTreeRareBump() {
    const bonus = state.playerTreeHuntBonuses?.().rareChanceBonus || 0;
    const pool = this.stage?.encounterPool;
    if (bonus > 0 && pool && !this._playerTreeRareApplied) {
      this._playerTreeRareApplied = true;
      this.stage.encounterPool = { ...pool, rareChance: (pool.rareChance || 0) + bonus };
    }
    return originalBegin.call(this);
  };
}

ensure();
