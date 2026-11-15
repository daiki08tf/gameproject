/* ============================================================
   Living World & Discovery C7-1 — Settlement Incidents runtime
   ------------------------------------------------------------
   Save data lives under the existing __settlement3 meta key (the
   same nesting pattern Archaeology/Treasure Hunt/Defense already
   use) -- no new save root. The active investigation itself is
   transient UI state (module-level, not persisted): only the
   OUTCOME (resolved) is saved, exactly like Archaeology's dig
   session.

   The Rumor Notebook write is the concrete realization of C7's own
   "Incident = something happening" / "Rumor = what people know
   about it" distinction: an eligible-but-unresolved incident writes
   an "unresolved" Rumor hint (the incident's own `desc`); resolving
   it rewrites the SAME Rumor entry to the `record.text` outcome,
   using the exact {rumor:true, rumorId, name, hint, rumorState,
   rumorStateLabel, at, resolvedAt} shape js/patches/ch1RumorThreads.js
   and js/patches/treasureHunt.js already established, so it renders
   in the existing Rumor Notebook UI with zero changes there.
   ============================================================ */
import { state } from '../state.js';
import { resolveExcavationRound, rollExcavationCue, excavationDifficultyProfile, computeArchaeologyReward } from '../data/archaeology.js';
import { SETTLEMENT_INCIDENTS, settlementIncidentEligible, settlementIncidentResolved, settlementIncidentResolveToken, getSettlementIncident, pursuitRoundLimit } from '../data/settlementIncidents.js';
import { CHAPTERS } from '../data/stages.js';
import { companionDiscoveryReaction } from '../data/companionDiscoveryReactions.js';
import { BattleEngine } from '../battleEngine.js';
import { showToast } from './toastFeedback.js';
import './settlementDefense.js'; // 追跡は拠点防衛と同じ戦闘開始・解決の口（prepare/resolveSettlementDefense）を借りる

const META_KEY = '__settlement3';
function meta() {
  const root = state.data.settlementBuildings ??= { hall: 0, inn: 0, market: 0, watch: 0, ranch: 0 };
  const m = root[META_KEY] ??= {};
  if (!m.incidents || typeof m.incidents !== 'object' || Array.isArray(m.incidents)) m.incidents = { resolved: {} };
  if (!m.incidents.resolved || typeof m.incidents.resolved !== 'object' || Array.isArray(m.incidents.resolved)) m.incidents.resolved = {};
  return m.incidents;
}

function ctx() {
  // 宿敵：既存の賞金首 Nemesis（負けて Lv が上がった相手）。名前は拠点防衛の予告と同じ取り方をする。
  const active = state.activeBountyNemesis?.() || null;
  const preview = active ? state.settlementDefenseNemesisPreview?.() : null;
  return { hall: state.settlementLevel?.('hall') || 0, nemesis: active ? { id: active.id, losses: active.losses || 0, level: active.level || 0, name: preview?.name || '宿敵' } : null };
}

function ensureWorld() {
  state.data.world2 ??= {};
  state.data.world2.discoveries ??= {};
  return state.data.world2;
}

// Pure-ish computation (reads state, doesn't write) shared by
// state.settlementIncidents() and syncRumorNotebook() below -- same split
// treasureHunt.js's computeTreasureHunts()/syncRumorNotebook() already
// established, so syncing never recomputes by calling back into itself.
// 追跡の舞台：最後にクリアした本編の通常ステージ（Boss・中Boss・関門・分岐を除く）。
// 進行に合わせて自然に移るので、専用の敵・難度表を持たずに「いまの実力相応」になる。
function pursuitTarget(incident) {
  let found = null;
  for (const chapter of CHAPTERS) {
    if (!/^ch\d+$/.test(chapter.id || '')) continue;
    for (const stage of chapter.stages || []) {
      if (stage.boss || stage.midBoss || stage.checkpoint || stage.branch || stage.bounty) continue;
      if (state.isStageCleared(stage.id)) found = stage;
    }
  }
  return found ? { stageId: found.id, stageName: found.name, limit: pursuitRoundLimit(incident, found) } : null;
}

function computeIncidents() {
  const c = ctx();
  const m = meta();
  return SETTLEMENT_INCIDENTS.map((incident) => {
    const eligible = settlementIncidentEligible(incident, c);
    const resolved = settlementIncidentResolved(incident, m.resolved[incident.id], c);
    const entry = { ...incident, eligible, resolved, active: eligible && !resolved };
    if (incident.requiresNemesis && c.nemesis) { entry.name = `${incident.name}：${c.nemesis.name}`; entry.desc = incident.desc.replaceAll('{nemesis}', c.nemesis.name); }
    if (incident.kind === 'pursuit' && entry.active) entry.pursuit = pursuitTarget(incident);
    return entry;
  });
}

function syncRumorNotebook(incidents) {
  const world = ensureWorld();
  for (const incident of incidents) {
    const id = `rumor:incident_${incident.id}`;
    if (!incident.eligible) { delete world.discoveries[id]; continue; }
    const prev = world.discoveries[id];
    world.discoveries[id] = {
      ...prev,
      rumor: true,
      rumorId: `incident_${incident.id}`,
      name: `噂：${incident.name}`,
      hint: incident.resolved ? incident.record.text : incident.desc,
      rumorState: incident.resolved ? 'resolved' : 'unresolved',
      rumorStateLabel: incident.resolved ? '解決済み' : '未解決',
      at: prev?.at || Date.now(),
      resolvedAt: incident.resolved ? (prev?.resolvedAt || Date.now()) : prev?.resolvedAt,
    };
  }
}

// Every call recomputes fresh (matching state.archaeologySites()/
// state.treasureHunts()'s own always-recompute convention) and keeps the
// Rumor Notebook in sync as a side effect.
state.settlementIncidents = function settlementIncidents() {
  const incidents = computeIncidents();
  syncRumorNotebook(incidents);
  return incidents;
};

// Shared by both incident archetypes below: mark resolved, grant the
// incident's own `reward` (or, for the excavation archetype, the
// fragment's reward via computeArchaeologyReward) plus the record's
// reward, using the exact addSettlementMaterials()+gold split every other
// incident/site this session already uses, then re-sync the Rumor
// Notebook. Kept as one function so the two archetypes can never drift
// into two different reward-granting rules.
function grantAndResolve(incidentId, reward) {
  const incident = getSettlementIncident(incidentId);
  const m = meta();
  m.resolved[incidentId] = settlementIncidentResolveToken(incident, ctx());
  // 宿敵の足跡：既存の Nemesis 情報フラグを立てる（次の対決での弱体は既存の仕組みが処理する）
  if (incident.nemesisFlag) state.applyNemesisEventFlag?.(incident.nemesisFlag);
  const gained = Object.keys(reward || {}).filter((k) => k !== 'gold').length
    ? (state.addSettlementMaterials?.(reward) || {}) : {};
  if (reward?.gold > 0) { state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + reward.gold); gained.gold = reward.gold; }
  const recordReward = incident.record?.reward || {};
  const recordGained = Object.keys(recordReward).filter((k) => k !== 'gold').length
    ? (state.addSettlementMaterials?.(recordReward) || {}) : {};
  if (recordReward.gold > 0) { state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + recordReward.gold); recordGained.gold = recordReward.gold; }
  state.settlementIncidents(); // re-sync the Rumor Notebook entry to the now-resolved state
  state.save();
  const companionReaction = companionDiscoveryReaction('settlement', state.activeCompanions?.() || []); // 文章だけ。報酬には触れない
  return { ok: true, outcome: 'resolved', incident, gained, recordGained, record: incident.record, companionReaction };
}

// ---- kind: 'archaeology' (謎の遺物漂着) -----------------------------------
// One investigation at a time, same busy-guard rule Archaeology/Fishing
// already established.
let activeSession = null;

state.startSettlementIncidentInvestigation = function startSettlementIncidentInvestigation(id) {
  if (activeSession) return { ok: false, reason: 'busy' };
  const incident = state.settlementIncidents().find((x) => x.id === id);
  if (!incident) return { ok: false, reason: 'unknown' };
  if (!incident.active) return { ok: false, reason: incident.resolved ? 'resolved' : 'locked' };
  if (incident.kind !== 'archaeology') return { ok: false, reason: 'wrong-kind' };
  const cue = rollExcavationCue();
  const profile = excavationDifficultyProfile(incident.fragment.difficulty);
  activeSession = { incidentId: id, fragment: incident.fragment, progress: 0, misses: 0, ...cue };
  return { ok: true, incident, profile, progress: 0, misses: 0, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
};

state.settlementIncidentAction = function settlementIncidentAction(action) {
  if (!activeSession) return { ok: false, reason: 'no-session' };
  const { fragment, correctAction, incidentId } = activeSession;
  const result = resolveExcavationRound({ fragment, progress: activeSession.progress, misses: activeSession.misses, correctAction, chosenAction: action });
  activeSession.progress = result.progress;
  activeSession.misses = result.misses;
  const profile = excavationDifficultyProfile(fragment.difficulty);
  if (result.outcome === 'ongoing') {
    const cue = rollExcavationCue();
    activeSession.correctAction = cue.correctAction;
    activeSession.cueText = cue.cueText;
    return { ok: true, outcome: 'ongoing', hit: result.hit, progress: result.progress, misses: result.misses, maxMisses: profile.maxMisses, roundsNeeded: profile.roundsNeeded, cueText: cue.cueText };
  }
  activeSession = null;
  if (result.outcome === 'crumbled') return { ok: true, outcome: 'crumbled', hit: result.hit, incidentId, fragment };
  // recovered -- this incident is a one-shot, so recovering the fragment
  // resolves it outright (no repeat-visit collection loop like a full
  // Archaeology site).
  const reward = computeArchaeologyReward(fragment, true);
  const gold = reward.gold || 0;
  return grantAndResolve(incidentId, { ...reward.materials, ...(gold ? { gold } : {}) });
};

// ---- kind: 'investigation' (住民失踪, C7-3) --------------------------------
// No multi-round session/busy-guard needed -- picking a lead is a single,
// free, always-repeatable action (see data/settlementIncidents.js's own
// comment on why this archetype is deliberately simpler than excavation).
state.investigateSettlementIncidentLead = function investigateSettlementIncidentLead(incidentId, leadId) {
  const incident = state.settlementIncidents().find((x) => x.id === incidentId);
  if (!incident) return { ok: false, reason: 'unknown' };
  if (!incident.active) return { ok: false, reason: incident.resolved ? 'resolved' : 'locked' };
  if (incident.kind !== 'investigation') return { ok: false, reason: 'wrong-kind' };
  const lead = (incident.leads || []).find((l) => l.id === leadId);
  if (!lead) return { ok: false, reason: 'unknown-lead' };
  if (!lead.correct) return { ok: true, outcome: 'miss', lead };
  return grantAndResolve(incidentId, incident.reward || {});
};


/* ---- kind:'pursuit' — 既存の戦闘を制限ラウンド以内に終える ----
   戦闘の開始と結果の受け取りは、main.js が拠点防衛用に既に持っている
   'settlement-defense-start' → prepareSettlementDefenseBattle() →
   resolveSettlementDefense() の口をそのまま使う（main.js は無変更）。
   追跡インシデントの id のときだけここで受け、それ以外は従来の防衛処理へ流す。 */
let pendingPursuit = null;   // { incidentId, stageId, limit } — 成功するまで保持（「もう一度」でも数える）
let lastFinishedBattle = null; // { stageId, rounds } — 実行時のみ。セーブしない

// 戦闘終了の瞬間は他のトースト（図鑑・仲間加入など）も続けて出るが、showToast がキューで順に出す。
function announce(text) { showToast(text, 4200); }

const previousFinishBattle = BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle = function incidentFinishBattle(cleared, retreated) {
  lastFinishedBattle = { stageId: this.stage?.id || null, rounds: Number(this.round) || 0 };
  return previousFinishBattle.call(this, cleared, retreated);
};

const previousPrepareDefense = state.prepareSettlementDefenseBattle;
state.prepareSettlementDefenseBattle = function prepareIncidentOrDefense(id) {
  const base = getSettlementIncident(id);
  if (base?.kind !== 'pursuit') return previousPrepareDefense?.call(this, id) || null;
  const incident = this.settlementIncidents().find((x) => x.id === id);
  if (!incident?.active || !incident.pursuit) return null;
  let stage = null;
  for (const chapter of CHAPTERS) { stage = (chapter.stages || []).find((x) => x.id === incident.pursuit.stageId) || stage; }
  if (!stage) return null;
  pendingPursuit = { incidentId: id, stageId: stage.id, limit: incident.pursuit.limit };
  // main.js は渡した stage オブジェクトの settlementDefenseIncidentId を見て結果を返してくる。
  // 共有の Stage データは汚さず、コピーに印を付けて渡す（戦闘自体は stage.id で既存 Stage を走る）。
  return { ...stage, settlementDefenseIncidentId: id };
};

const previousResolveDefense = state.resolveSettlementDefense;
state.resolveSettlementDefense = function resolveIncidentOrDefense(id, cleared) {
  if (getSettlementIncident(id)?.kind !== 'pursuit') return previousResolveDefense?.call(this, id, cleared);
  const pending = pendingPursuit;
  if (!pending || pending.incidentId !== id) return { ok: false, reason: 'noPending' };
  const rounds = lastFinishedBattle?.stageId === pending.stageId ? lastFinishedBattle.rounds : Infinity;
  if (!cleared || rounds > pending.limit) {
    announce(cleared
      ? `取り逃がした…（${rounds}ラウンド／${pending.limit}ラウンド以内）。もう一度追える。`
      : '追跡は失敗した。態勢を整えれば、また追える。');
    return { ok: true, outcome: 'miss', rounds, limit: pending.limit };
  }
  pendingPursuit = null;
  const incident = getSettlementIncident(id);
  const result = grantAndResolve(id, incident.reward || {});
  announce(`${incident.name}：${rounds}ラウンドで追いついた！ 報酬を受け取った。`);
  return { ...result, rounds, limit: pending.limit };
};
