/* ============================================================
   Companion 2.0 - Evolution foundation
   ============================================================ */
import { state } from '../state.js';
import { COMPANION_RARITY } from '../data/companions.js';
import { pushCompanionMemory } from '../data/companionMemory.js';

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

  /* Session 6 — Roamer Awakening（名もなき強敵の開眼）。
     Roamerは「属さない強敵」なので通常進化ではなく、絆Lv5＋長い共闘で
     「名を持つ」形の覚醒を起こす。個体の記憶として残る成長で、
     無差別な強化ではなく各Roamerの性格に寄せた小さな伸び。 */
  roamer_gilt_maw: {
    target: 'roamer_gilt_maw_full', level: 26, minRarity: 'rare', bondLevel: 5, name: '満喰の大口・GILT MAW FED', icon: '◆',
    statMult: { hp: 1.30, mp: 1.0, atk: 1.12, def: 1.22, mag: 1.0, spd: 1.05 },
    trait: '満ちた財腹',
  },
  roamer_glass_step: {
    target: 'roamer_glass_step_full', level: 26, minRarity: 'rare', bondLevel: 5, name: '鏡渡り・GLASS STEP VEIL', icon: '◆',
    statMult: { hp: 1.12, mp: 1.15, atk: 1.16, def: 1.10, mag: 1.10, spd: 1.30 },
    trait: '鏡の先読み',
  },
  roamer_pale_jailer: {
    target: 'roamer_pale_jailer_full', level: 26, minRarity: 'rare', bondLevel: 5, name: '白獄の番卒・PALE JAILER VIGIL', icon: '◆',
    statMult: { hp: 1.20, mp: 1.05, atk: 1.10, def: 1.30, mag: 1.05, spd: 1.05 },
    trait: '戒めの守り',
  },
  roamer_rust_errant: {
    target: 'roamer_rust_errant_full', level: 26, minRarity: 'rare', bondLevel: 5, name: '遍歴の剣聖・RUST ERRANT MASTERED', icon: '◆',
    statMult: { hp: 1.15, mp: 1.05, atk: 1.32, def: 1.15, mag: 1.0, spd: 1.10 },
    trait: '忘れられし剣筋',
  },
  roamer_null_chant: {
    target: 'roamer_null_chant_full', level: 26, minRarity: 'rare', bondLevel: 5, name: '名を編む詠唱者・NULL CHANT WOVEN', icon: '◆',
    statMult: { hp: 1.10, mp: 1.25, atk: 1.0, def: 1.08, mag: 1.35, spd: 1.08 },
    trait: '紡がれた名',
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
  // Roamer覚醒のような絆ゲート（任意）。指定がなければ常に充足。
  const bondLevel = this.companionBond?.(instanceId)?.level || 1;
  const bondOk = !evo.bondLevel || bondLevel >= evo.bondLevel;
  return { ...evo, bondLevel: evo.bondLevel || null, bondOk, levelOk, rarityOk, canEvolve: levelOk && rarityOk && bondOk };
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
  pushCompanionMemory(inst, info.bondLevel ? '絆を糧に名を持ち、覚醒した' : '進化の時を迎えた');
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
