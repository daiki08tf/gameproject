/* ============================================================
   Equipment 3.0 E5 — Weapon Archetype runtime metadata
   ------------------------------------------------------------
   Mutates the existing codex/boss weapon objects in place. equipment.js keeps
   the same object references in its item registry, so no second registry or
   save migration is needed.
   ============================================================ */
import { allCodexWeapons, allBossWeapons } from '../data/weapons.js';
import { chooseArchetypeForItem } from '../data/equipment3Archetypes.js';

function round2(v) { return Math.round(v * 100) / 100; }

function applyArchetype(item, ordinal = 0) {
  if (!item || item.slot !== 'weapon' || item.equipment3ArchetypeVersion === 1) return false;
  const archetype = chooseArchetypeForItem(item, ordinal);
  if (!archetype) return false;

  item.weaponArchetype = archetype.id;
  item.weaponArchetypeName = archetype.name;
  item.weaponArchetypeIdentity = archetype.identity;

  for (const [stat, mult] of Object.entries(archetype.statMult || {})) {
    if (Number.isFinite(item.stats?.[stat])) item.stats[stat] = round2(item.stats[stat] * mult);
  }
  for (const [stat, value] of Object.entries(archetype.statAdd || {})) {
    item.stats[stat] = round2((Number(item.stats?.[stat]) || 0) + value);
  }

  if (archetype.effect) {
    item.effects = Array.isArray(item.effects) ? item.effects : [];
    item.effects.push({
      name: `${archetype.name}の型`,
      desc: `${archetype.identity}を表す武器種固有効果`,
      ...archetype.effect,
      __equipment3Archetype: archetype.id,
    });
  }

  const oldImplicit = item.implicit?.desc;
  item.implicit = {
    ...(item.implicit || {}),
    desc: oldImplicit ? `${oldImplicit} / ${archetype.name}: ${archetype.identity}` : `${archetype.name}: ${archetype.identity}`,
  };
  item.equipment3ArchetypeVersion = 1;
  return true;
}

const codex = allCodexWeapons();
for (let i = 0; i < codex.length; i++) applyArchetype(codex[i], i);
const bosses = allBossWeapons();
for (let i = 0; i < bosses.length; i++) applyArchetype(bosses[i], i + 10000);

export { applyArchetype };
