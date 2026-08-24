/* ============================================================
   Progression 2.0 Phase 3 — Status Calculation Core
   ------------------------------------------------------------
   Character Lv is now the long-term stat growth axis.
   Job Lv remains dedicated to skills / mastery / job changing.

   The mature equipment / affix / awakening logic in state.js is kept
   intact. We execute that calculation with currentLevel temporarily
   mapped to characterLevel, avoiding a second copy of combat formulas.

   Future systems (Inheritance / Codex / Rune 2.0) get named slots in
   the breakdown API now. They intentionally contribute 0 in Phase 3.
   ============================================================ */

import { state } from '../state.js';
import { chainMethod } from './patchUtils.js';

export const STATUS_LAYER_ORDER = [
  'characterJobBase',
  'inheritance',
  'equipment',
  'permanent',
  'affix',
  'codex',
  'rune',
  'special',
];

function withCharacterLevelAsLegacyLevel(fn) {
  const hadOwn = Object.prototype.hasOwnProperty.call(state, 'currentLevel');
  const previous = hadOwn ? Object.getOwnPropertyDescriptor(state, 'currentLevel') : null;

  Object.defineProperty(state, 'currentLevel', {
    configurable: true,
    get() { return this.characterLevel; },
  });

  try {
    return fn();
  } finally {
    if (hadOwn && previous) Object.defineProperty(state, 'currentLevel', previous);
    else delete state.currentLevel;
  }
}

const legacyGetStatBreakdown = state.getStatBreakdown.bind(state);

chainMethod(state, 'getStats', (legacyGetStats) => function getStatsProgression2() {
  return withCharacterLevelAsLegacyLevel(() => legacyGetStats());
});

state.getStatBreakdown = function getStatBreakdownProgression2(stat) {
  const legacy = withCharacterLevelAsLegacyLevel(() => legacyGetStatBreakdown(stat));
  const actual = this.getStats();
  const total = Number(actual?.[stat] ?? legacy.total ?? 0);

  const characterJobBase = Number(legacy.base || 0);
  const inheritance = 0; // Phase 4
  const equipment = Number(legacy.equipment || 0);
  const permanent = Number(legacy.permanent || 0);
  const affix = Number(legacy.affix || 0);
  const codex = 0;       // Codex 2.0
  const rune = 0;        // Rune 2.0

  // Existing systems not represented by the old four-way breakdown
  // (weapon affinity, legacy socket runes, special HP multipliers, etc.)
  // are reconciled here so the displayed layer total always equals getStats().
  const accounted = characterJobBase + inheritance + equipment + permanent + affix + codex + rune;
  const special = Math.round((total - accounted) * 10) / 10;

  return {
    ...legacy,
    base: characterJobBase, // backward-compatible key for existing UI
    characterJobBase,
    inheritance,
    equipment,
    permanent,
    affix,
    codex,
    rune,
    special,
    total,
  };
};

state.getStatusCalculationLayers = function getStatusCalculationLayers(stat) {
  const b = this.getStatBreakdown(stat);
  return {
    order: [...STATUS_LAYER_ORDER],
    values: Object.fromEntries(STATUS_LAYER_ORDER.map((key) => [key, Number(b[key] || 0)])),
    total: Number(b.total || 0),
  };
};

export { withCharacterLevelAsLegacyLevel };
