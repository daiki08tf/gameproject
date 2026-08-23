import {
  characterExpToNext,
  characterLevelBand,
  cumulativeCharacterExpToLevel,
} from '../js/data/progression.js';

const checkpoints = [1, 100, 1000, 1999, 2000, 5000, 10000, 50000, 99999];

console.log('Blade Vale Progression 2.0 — Character EXP checkpoints');
console.log('Lv\tBand\tNext EXP\tCumulative EXP');
for (const lv of checkpoints) {
  console.log([
    lv,
    characterLevelBand(lv).label,
    characterExpToNext(lv).toLocaleString('en-US'),
    cumulativeCharacterExpToLevel(lv).toLocaleString('en-US'),
  ].join('\t'));
}
