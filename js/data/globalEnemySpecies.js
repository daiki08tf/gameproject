const ROLE_ANCHOR = Object.freeze({
  normal: 'normal',
  fast: 'fast',
  tank: 'tank',
  attacker: 'normal',
  caster: 'normal',
  trickster: 'fast',
  support: 'normal',
});

const ROLE_PROFILE = Object.freeze({
  normal: Object.freeze({ hp: 1, atk: 1, def: 1, speed: 1, xp: 1, gold: 1 }),
  fast: Object.freeze({ hp: 1, atk: 1, def: 1, speed: 1, xp: 1, gold: 1 }),
  tank: Object.freeze({ hp: 1, atk: 1, def: 1, speed: 1, xp: 1, gold: 1 }),
  attacker: Object.freeze({ hp: 0.85, atk: 1.30, def: 0.80, speed: 1.05, xp: 1.05, gold: 1 }),
  caster: Object.freeze({ hp: 0.75, atk: 1.15, def: 0.65, speed: 0.95, xp: 1.08, gold: 1.02 }),
  trickster: Object.freeze({ hp: 1.05, atk: 0.95, def: 0.80, speed: 1.05, xp: 1.08, gold: 1.04 }),
  support: Object.freeze({ hp: 0.90, atk: 0.75, def: 0.95, speed: 0.90, xp: 1.10, gold: 1.04 }),
});

export const GLOBAL_ENEMY_SPECIES = Object.freeze([
  Object.freeze({ speciesId: 'slime', name: 'スライム', role: 'normal', trueGlobal: true, habitats: ['any'], spawnWeight: 1.40, family: 'slime' }),
  Object.freeze({ speciesId: 'bat', name: 'コウモリ', role: 'fast', trueGlobal: false, habitats: ['cave','ruins','night'], spawnWeight: 1.00, family: 'bat' }),
  Object.freeze({ speciesId: 'goblin', name: 'ゴブリン', role: 'attacker', trueGlobal: false, habitats: ['plain','forest','ruins'], spawnWeight: 0.90, family: 'goblin' }),
  Object.freeze({ speciesId: 'wolf', name: 'ウルフ', role: 'fast', trueGlobal: false, habitats: ['plain','forest','snow'], spawnWeight: 0.90, family: 'wolf' }),
  Object.freeze({ speciesId: 'skeleton', name: 'スケルトン', role: 'attacker', trueGlobal: false, habitats: ['ruins','grave','dark'], spawnWeight: 0.65, family: 'skeleton' }),
  Object.freeze({ speciesId: 'golem', name: 'ゴーレム', role: 'tank', trueGlobal: false, habitats: ['mountain','ruins','cave'], spawnWeight: 0.50, family: 'golem' }),
  Object.freeze({ speciesId: 'wisp', name: 'ウィスプ', role: 'caster', trueGlobal: false, habitats: ['forest','ruins','spirit'], spawnWeight: 0.55, family: 'wisp' }),
  Object.freeze({ speciesId: 'toxic_mushroom', name: '毒キノコ', role: 'trickster', trueGlobal: false, habitats: ['forest','swamp','cave'], spawnWeight: 0.55, family: 'mushroom' }),
  Object.freeze({ speciesId: 'lesser_spirit', name: '小精霊', role: 'support', trueGlobal: false, habitats: ['forest','spirit','elemental'], spawnWeight: 0.50, family: 'spirit' }),
  Object.freeze({ speciesId: 'lizard', name: 'リザード', role: 'normal', trueGlobal: false, habitats: ['desert','swamp','volcanic'], spawnWeight: 0.65, family: 'lizard' }),
  Object.freeze({ speciesId: 'mimic', name: 'ミミック', role: 'trickster', trueGlobal: false, habitats: ['dungeon','ruins','treasure'], spawnWeight: 0.12, family: 'mimic' }),
  Object.freeze({ speciesId: 'wandering_armor', name: '彷徨う鎧', role: 'tank', trueGlobal: false, habitats: ['castle','ruins','dark'], spawnWeight: 0.22, family: 'armor' }),
]);

const BY_ID = new Map(GLOBAL_ENEMY_SPECIES.map(species => [species.speciesId, species]));

export function globalEnemySpecies(speciesId) {
  return BY_ID.get(speciesId) || null;
}

export function globalSpeciesForHabitat(habitat) {
  const tag = String(habitat || '');
  return GLOBAL_ENEMY_SPECIES.filter(species => species.trueGlobal || species.habitats.includes(tag));
}

export function globalSpeciesAnchorRole(speciesOrId) {
  const species = typeof speciesOrId === 'string' ? globalEnemySpecies(speciesOrId) : speciesOrId;
  return species ? ROLE_ANCHOR[species.role] || 'normal' : null;
}

function scaled(value, mult, min = 0) {
  return Math.max(min, Math.round((Number(value) || 0) * mult));
}

export function materializeGlobalSpecies(speciesId, anchorEnemy) {
  const species = globalEnemySpecies(speciesId);
  if (!species || !anchorEnemy) return null;
  const profile = ROLE_PROFILE[species.role] || ROLE_PROFILE.normal;
  return {
    ...anchorEnemy,
    name: species.name,
    speciesId: species.speciesId,
    speciesFamily: species.family,
    role: species.role,
    globalSpecies: true,
    trueGlobal: !!species.trueGlobal,
    habitats: [...species.habitats],
    spawnWeight: species.spawnWeight,
    boss: false,
    elite: false,
    hp: scaled(anchorEnemy.hp, profile.hp, 1),
    atk: scaled(anchorEnemy.atk, profile.atk, 1),
    def: scaled(anchorEnemy.def, profile.def, 0),
    speed: scaled(anchorEnemy.speed, profile.speed, 1),
    xp: scaled(anchorEnemy.xp, profile.xp, 1),
    gold: scaled(anchorEnemy.gold, profile.gold, 1),
  };
}
