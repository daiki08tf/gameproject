/* ============================================================
   Companion 2.0 - Evolution foundation
   ============================================================ */
import { state } from '../state.js';
import { COMPANION_RARITY } from '../data/companions.js';

export const COMPANION_EVOLUTIONS = Object.freeze({
  slime: {
    target: 'slimeKnight', level: 30, minRarity: 'rare', name: 'スライムナイト', icon: '🛡️',
    statMult: { hp: 1.28, mp: 1.10, atk: 1.35, def: 1.32, mag: 1.08, spd: 1.08 },
    trait: '騎士の誓い',
  },
  goblin: {
    target: 'goblinChief', level: 35, minRarity: 'rare', name: 'ゴブリンチーフ', icon: '👑',
    statMult: { hp: 1.22, mp: 1.05, atk: 1.38, def: 1.20, mag: 1.05, spd: 1.12 },
    trait: '群れの号令',
  },
  bat: {
    target: 'nightwing', level: 32, minRarity: 'rare', name: 'ナイトウィング', icon: '🌙',
    statMult: { hp: 1.18, mp: 1.20, atk: 1.20, def: 1.12, mag: 1.32, spd: 1.30 },
    trait: '月影飛翔',
  },
});

function rarityAtLeast(actual, required) {
  return COMPANION_RARITY.indexOf(actual) >= COMPANION_RARITY.indexOf(required);
}

state.companionEvolutionInfo = function companionEvolutionInfo(instanceId) {
  const c = this.getCompanion?.(instanceId);
  if (!c) return null;
  const evo = COMPANION_EVOLUTIONS[c.instance.baseSpeciesId || c.instance.speciesId];
  if (!evo || c.instance.evolution) return null;
  const levelOk = c.instance.level >= evo.level;
  const rarityOk = rarityAtLeast(c.instance.rarity, evo.minRarity);
  return { ...evo, levelOk, rarityOk, canEvolve: levelOk && rarityOk };
};

state.evolveCompanion = function evolveCompanion(instanceId) {
  const c = this.getCompanion?.(instanceId);
  const info = this.companionEvolutionInfo(instanceId);
  if (!c || !info?.canEvolve) return false;
  const inst = c.instance;
  inst.baseSpeciesId ||= inst.speciesId;
  inst.evolution = info.target;
  inst.evolutionName = info.name;
  inst.evolutionIcon = info.icon;
  inst.evolutionTrait = info.trait;
  inst.evolutionStatMult = { ...info.statMult };
  inst.evolvedAt = Date.now();
  this.data.companionCodex[info.target] = true;
  this.save();
  return true;
};

const originalGetCompanion = state.getCompanion.bind(state);
state.getCompanion = function evolvedGetCompanion(instanceId) {
  const c = originalGetCompanion(instanceId);
  if (!c || !c.instance.evolution) return c;
  const mult = c.instance.evolutionStatMult || {};
  const stats = { ...c.stats };
  for (const key of ['hp','mp','atk','def','mag','spd']) stats[key] = Math.max(1, Math.round(stats[key] * (mult[key] || 1)));
  return {
    ...c,
    species: {
      ...c.species,
      name: c.instance.evolutionName || c.species.name,
      icon: c.instance.evolutionIcon || c.species.icon,
      traits: [...(c.species.traits || []), c.instance.evolutionTrait].filter(Boolean),
    },
    stats,
  };
};
