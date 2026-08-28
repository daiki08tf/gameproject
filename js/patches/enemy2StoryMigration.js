/* Enemy 2.0 E8 — progressive Ch1–30 story Encounter Pool migration. */
import './enemy2RankVariants.js';
import { CHAPTERS } from '../data/stages.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { migrateStoryEncounterPools } from '../data/encounterMigration2.js';

export const E8_MIGRATED_STAGE_IDS=Object.freeze(migrateStoryEncounterPools(CHAPTERS,ENEMY_TYPES));
