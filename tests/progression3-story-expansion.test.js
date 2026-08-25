import test from 'node:test';
import assert from 'node:assert/strict';

import '../js/patches/progressionCore.js';
import '../js/patches/levelRoadmap99999.js';
import { STORY_EXPANSION_LEVEL_ROADMAP } from '../js/patches/progression3StoryExpansion.js';
import { CHAPTERS } from '../js/data/stages.js';

test('chapter 16-20 roadmap bridges Lv700 to Lv3000 without regression', () => {
  assert.deepEqual(
    STORY_EXPANSION_LEVEL_ROADMAP.map(({ chapter, min, max }) => [chapter, min, max]),
    [
      [16, 700, 1000],
      [17, 1000, 1350],
      [18, 1350, 1750],
      [19, 1750, 2250],
      [20, 2250, 3000],
    ],
  );

  const story = CHAPTERS.filter((chapter) => chapter.num >= 15 && chapter.num <= 20);
  const ranges = story.map((chapter) => {
    const main = chapter.stages.filter((stage) => !stage.branch);
    return [chapter.num, main[0].recLevel, main.at(-1).recLevel];
  });

  assert.equal(ranges[0][2], 700, 'chapter 15 should still end at Lv700');
  assert.equal(ranges[1][1], 700, 'chapter 16 should start where chapter 15 ends');
  assert.equal(ranges.at(-1)[2], 3000, 'chapter 20 should end at Lv3000');

  for (let i = 1; i < ranges.length; i += 1) {
    assert.ok(ranges[i][1] >= ranges[i - 1][2], `chapter ${ranges[i][0]} must not regress in recommended level`);
  }
});

test('expanded story keeps positive EXP rewards after scaling', () => {
  for (const chapter of CHAPTERS.filter((ch) => ch.num >= 16 && ch.num <= 20)) {
    for (const stage of chapter.stages) {
      assert.ok(stage.rewards.exp > 0, `${stage.id} should have positive EXP`);
    }
  }
});
