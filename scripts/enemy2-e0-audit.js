import fs from 'node:fs';
import { CHAPTERS, findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { buildDeepSurveyStage } from '../js/data/postCp3DeepSurvey.js';

export const REPRESENTATIVE_STAGE_IDS = Object.freeze(['1-1', '10-3', '20-6', '30-8']);

function enemyShape(type) {
  const enemy = ENEMY_TYPES[type];
  if (!enemy) return { type, missing: true };
  return {
    type,
    name: enemy.name,
    hp: enemy.hp,
    atk: enemy.atk,
    def: enemy.def,
    speed: enemy.speed,
    xp: enemy.xp,
    gold: enemy.gold,
    boss: !!enemy.boss,
  };
}

export function stageSnapshot(stage) {
  return {
    id: stage.id,
    name: stage.name,
    recLevel: stage.recLevel,
    boss: !!stage.boss,
    isAbyss: !!stage.isAbyss,
    secretRealm: !!stage.secretRealm,
    waves: (stage.waves || []).map(wave => ({
      type: wave.type,
      count: wave.count,
      enemy: enemyShape(wave.type),
    })),
  };
}

export function representativeEnemy2Audit() {
  const story = REPRESENTATIVE_STAGE_IDS.map(id => {
    const found = findStage(id);
    if (!found?.stage) throw new Error(`E0 audit could not resolve representative stage ${id}`);
    return stageSnapshot(found.stage);
  });

  // suppressModifiers gives us a stable Abyss construction path while preserving
  // the actual runtime builder and its dynamic ENEMY_TYPES registration.
  const abyss = stageSnapshot(buildAbyssStage(1200, [], { suppressModifiers: true }));
  const deepSurvey = stageSnapshot(buildDeepSurveyStage('secret-cp3-deep-ash'));

  return {
    chapterCount: CHAPTERS.length,
    enemyTypeCount: Object.keys(ENEMY_TYPES).length,
    story,
    abyss,
    deepSurvey,
  };
}

export function sourceAudit() {
  const battle = fs.readFileSync(new URL('../js/battleEngine.js', import.meta.url), 'utf8');
  const stages = fs.readFileSync(new URL('../js/data/stages.js', import.meta.url), 'utf8');
  const abyss = fs.readFileSync(new URL('../js/data/abyss.js', import.meta.url), 'utf8');
  const realms = fs.readFileSync(new URL('../js/data/secretRealms.js', import.meta.url), 'utf8');
  return {
    battle,
    stages,
    abyss,
    realms,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  console.log(JSON.stringify(representativeEnemy2Audit(), null, 2));
}
