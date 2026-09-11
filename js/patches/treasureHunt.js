/* ============================================================
   Living World & Discovery C5 — Treasure Hunt 2.0 runtime
   ------------------------------------------------------------
   Save data lives under the existing __settlement3 meta key (the
   same nesting pattern Fishing/Archaeology already use) -- no new
   save root. The chain's "Rumor" step is written into the existing
   state.data.world2.discoveries map with the same {rumor:true,
   rumorState, hint, ...} shape js/patches/ch1RumorThreads.js and
   js/patches/systemDeepeningPackC.js already use, so it shows up in
   the existing Rumor Notebook (Monster Codex screen, 噂帳 tab) for
   free -- no new list UI needed for that half of the chain. Only
   the final "claim the find" action gets its own small UI, in the
   Settlement screen next to Archaeology (see treasureHuntUi.js).
   ============================================================ */
import { state } from '../state.js';
import './archaeology.js'; // guarantees state.archaeologySites() exists -- the interpretation step reads its real progress
import {
  TREASURE_HUNT_CHAINS, getTreasureHuntChain, isTreasureHuntReachable, treasureHuntStage, TREASURE_HUNT_STAGE_LABEL,
} from '../data/treasureHunt.js';
import { companionDiscoveryReaction } from '../data/companionDiscoveryReactions.js';

const META_KEY = '__settlement3';
function meta() {
  const root = state.data.settlementBuildings ??= { hall: 0, inn: 0, market: 0, watch: 0, ranch: 0 };
  const m = root[META_KEY] ??= {};
  if (!m.treasureHunt || typeof m.treasureHunt !== 'object' || Array.isArray(m.treasureHunt)) m.treasureHunt = { resolved: {} };
  if (!m.treasureHunt.resolved || typeof m.treasureHunt.resolved !== 'object' || Array.isArray(m.treasureHunt.resolved)) m.treasureHunt.resolved = {};
  return m.treasureHunt;
}

function hasClearedChapter(chapterNum) {
  const prefix = `${chapterNum}-`;
  return Object.entries(state.data.stageProgress || {}).some(([id, v]) => id.startsWith(prefix) && (v === true || v?.cleared));
}
function ctx() { return { hasClearedChapter }; }

function archaeologyProgressForSite(siteId) {
  const site = state.archaeologySites?.().find((s) => s.id === siteId);
  return { fragmentsFound: site?.foundCount || 0, recordUnlocked: !!site?.recordUnlocked };
}

// Pure-ish computation (reads state, doesn't write) shared by
// state.treasureHunts() and syncRumorNotebook() below -- kept separate so
// syncing the Notebook never has to call back into state.treasureHunts()
// itself (which would re-run this same computation recursively for no
// reason).
function computeTreasureHunts() {
  const c = ctx();
  const m = meta();
  return TREASURE_HUNT_CHAINS.map((chain) => {
    const reachable = isTreasureHuntReachable(chain, c);
    const { fragmentsFound, recordUnlocked } = archaeologyProgressForSite(chain.siteId);
    const resolved = !!m.resolved[chain.id];
    const stage = treasureHuntStage({ reachable, fragmentsFound, recordUnlocked, resolved });
    return { ...chain, stage, stageLabel: TREASURE_HUNT_STAGE_LABEL[stage], reachable, fragmentsFound, recordUnlocked, resolved };
  });
}

const STAGE_TEXT = { unresolved: 'rumorText', tracking: 'clueText', ready: 'decodedText', resolved: 'resolutionText' };

// Writes/refreshes each reachable chain's Rumor entry into the shared
// world2.discoveries map -- same convention as ch1RumorThreads.js /
// systemDeepeningPackC.js, so the existing Rumor Notebook UI renders it
// with zero changes to that file. Takes the already-computed hunts list
// (see state.treasureHunts() below) rather than recomputing it.
function syncRumorNotebook(hunts) {
  const world = (state.data.world2 ??= {});
  world.discoveries ??= {};
  for (const hunt of hunts) {
    const id = `rumor:treasure_${hunt.id}`;
    if (hunt.stage === 'locked') { delete world.discoveries[id]; continue; }
    const textKey = STAGE_TEXT[hunt.stage] || 'rumorText';
    const prev = world.discoveries[id];
    world.discoveries[id] = {
      ...prev,
      rumor: true,
      rumorId: `treasure_${hunt.id}`,
      name: `噂：${hunt.name}`,
      hint: hunt[textKey],
      rumorState: hunt.stage === 'resolved' ? 'resolved' : (hunt.stage === 'unresolved' ? 'unresolved' : 'tracking'),
      rumorStateLabel: hunt.stage === 'resolved' ? '解決済み' : (hunt.stage === 'unresolved' ? '未解決' : '追跡中'),
      at: prev?.at || Date.now(),
      resolvedAt: hunt.stage === 'resolved' ? (prev?.resolvedAt || Date.now()) : prev?.resolvedAt,
    };
  }
}

// Every call recomputes fresh (matching state.fishCodex()/state.archaeologyCodex()'s
// own always-recompute convention) and keeps the Rumor Notebook in sync as a
// side effect, so any caller -- the Settlement UI, the Codex's Rumor Notebook
// panel, or a test -- always sees the current chain state without needing a
// separate "refresh" call.
state.treasureHunts = function treasureHunts() {
  const hunts = computeTreasureHunts();
  syncRumorNotebook(hunts);
  return hunts;
};

state.claimTreasureHunt = function claimTreasureHunt(chainId) {
  const hunt = state.treasureHunts().find((h) => h.id === chainId);
  if (!hunt) return { ok: false, reason: 'unknown' };
  if (hunt.stage !== 'ready') return { ok: false, reason: 'not-ready' };
  const chain = getTreasureHuntChain(chainId);
  const m = meta();
  m.resolved[chainId] = true;
  const reward = { ...(chain.reward || {}) };
  const gold = reward.gold || 0;
  delete reward.gold;
  const gained = Object.keys(reward).length ? (state.addSettlementMaterials?.(reward) || {}) : {};
  if (gold > 0) {
    state.data.gold = Math.max(0, (Number(state.data.gold) || 0) + gold);
    gained.gold = gold;
  }
  state.treasureHunts(); // re-sync the Rumor Notebook entry to the now-resolved state
  state.save();
  // C6-8: flavor-only reaction -- never touches gained/reward, just an
  // extra line when a matching (family:'spirit') companion happens to be
  // active. See data/companionDiscoveryReactions.js for the full rationale.
  const companionReaction = companionDiscoveryReaction('treasureHunt', state.activeCompanions?.() || []);
  return { ok: true, chain, gained, companionReaction };
};
