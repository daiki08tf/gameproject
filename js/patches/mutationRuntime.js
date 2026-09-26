/* ============================================================
   Session 8 — Mutation runtime
   ------------------------------------------------------------
   Wraps BattleEngine._spawnEnemy: non-boss, non-Roamer spawns roll an
   ultra-rare wild Mutation (js/data/mutations.js) conditioned on the
   living-world climate (weather/daypart), location tags, Species
   Mastery and rumor/event intel.

   Naming discipline: the Ranch already owns companion lineage
   "mutations" (monsterMutations.js / inst.mutationId). Field
   mutations here are a separate concept — on the enemy they are
   `enemy.mutationId` (transient, never saved); on a recruited
   companion they persist as `instance.wildMutation`; on the Codex
   entry they accumulate under `entry.wildMutations`.
   ============================================================ */
import './worldClimate.js';
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { MUTATIONS } from '../data/mutations.js';
import { RANCH_RECRUIT_BY_ENEMY_TYPE } from '../data/monsterRanchSpecies.js';
import { getCompanionSpecies } from '../data/companions.js';
import { ensureCodexEntry } from '../data/codex.js';

function climateFor(engine) {
  return state.climateForStage?.(engine.stage || {}) || null;
}

const previousSpawn = BattleEngine.prototype._spawnEnemy;
BattleEngine.prototype._spawnEnemy = function mutationAwareSpawn(type, ...rest) {
  const enemy = previousSpawn.call(this, type, ...rest);
  if (!enemy || enemy.boss || enemy.roamerId || enemy.type?.startsWith?.('roamer:')) return enemy;
  // Elites (hunt/abyss) already carry a distinct identity; mutation is
  // the "ordinary individual gone strange" axis — keep them disjoint.
  if (enemy.elite) return enemy;
  const cl = climateFor(this);
  if (!cl) return enemy;
  const speciesId = RANCH_RECRUIT_BY_ENEMY_TYPE[enemy.type];
  const species = speciesId ? getCompanionSpecies(speciesId) : null;
  const masteryLv = speciesId ? Math.max(0, Number(state.speciesMasteryLevel?.(speciesId)) || 0) : 0;
  const ctx = {
    weatherId: cl.weatherId, daypartId: cl.daypartId,
    chapterNum: this.chapter?.num || 0,
    locTags: cl.locTags || [],
    family: species?.family || null,
    masteryLv,
    rumorBoost: !!state.rumorIntelBoostFor?.(enemy.type, this.chapter?.id),
    eventBoost: !!(state.data.world2?.lastEvent?.mutagenic
      || state.data.world2?.flags?.discolorSeen
      || state.data.world2?.flags?.discolorTrail),
    hunt: !!this.stage?.hunt,
    lair: !!this.stage?.roamerLair,
    locationBoost: this.stage?.mutationBoost || 0,
    climateMult: cl.huntMods?.mutationChanceMult || 1,
  };
  const mut = state.rollEnemyMutation?.(enemy.type, ctx);
  if (!mut) return enemy;
  enemy.mutationId = mut.id;
  enemy.mutated = true;
  // Companion reaction — flavor only (C6-8 convention: a party member
  // of the same family notices the anomaly). Never touches odds or
  // rewards; it rides the enemy object into the encounterStart event.
  try {
    const party = state.activeCompanions?.() || [];
    const kin = party.find((c) => c?.species?.family && c.species.family === ctx.family);
    if (kin) {
      const name = kin.instance?.nickname || kin.species?.name || '仲間';
      enemy.mutationReaction = `${name}が、違和感に気づいたようだ――同じ系統なのに、何かが違う。`;
    }
  } catch {}
  enemy.name = `${mut.namePrefix}の${enemy.name}`;
  const mult = mut.statMult || {};
  enemy.hp = Math.round(enemy.hp * (mult.hp ?? 1));
  enemy.maxHp = enemy.hp;
  enemy.atk = Math.round(enemy.atk * (mult.atk ?? 1));
  enemy.def = Math.round(enemy.def * (mult.def ?? 1));
  enemy.spd = Math.round(enemy.spd * (mult.spd ?? 1));
  enemy.xp = Math.round(enemy.xp * (mut.xpMult || 1));
  enemy.gold = Math.round(enemy.gold * (mut.goldMult || 1));
  return enemy;
};

// Codex: record mutation observations (seen) on the species entry.
if (state.markCodexSeen && !state.markCodexSeen.__mutation) {
  const prev = state.markCodexSeen.bind(state);
  const wrapped = function mutationCodexSeen(enemy, stage) {
    prev(enemy, stage);
    if (!enemy?.mutationId) return;
    const entry = ensureCodexEntry((this.data.monsterCodex ??= {}), enemy.type);
    entry.wildMutations ??= {};
    entry.wildMutations[enemy.mutationId] = { seen: true, killed: false, recruited: false };
  };
  wrapped.__mutation = true;
  state.markCodexSeen = wrapped;
}
if (state.markCodexKill && !state.markCodexKill.__mutation) {
  const prev = state.markCodexKill.bind(state);
  const wrapped = function mutationCodexKill(enemy, stage) {
    prev(enemy, stage);
    if (!enemy?.mutationId) return;
    const entry = ensureCodexEntry((this.data.monsterCodex ??= {}), enemy.type);
    entry.wildMutations ??= {};
    const m = (entry.wildMutations[enemy.mutationId] ??= {});
    m.seen = true; m.killed = true;
  };
  wrapped.__mutation = true;
  state.markCodexKill = wrapped;
}

export { MUTATIONS };
