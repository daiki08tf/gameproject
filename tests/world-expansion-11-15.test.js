import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTER_SPECS } from '../js/data/chapters.js';
import { CHAPTERS, findStage } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem } from '../js/data/equipment.js';
import { runesForStage } from '../js/data/runes2.js';
import { COMPANION_SPECIES } from '../js/data/companions.js';
import { getCompanionSkill } from '../js/data/companionSkills.js';

const expected = [
  [11,'灰冠の旧都','灰冠王ヴァルグ'],
  [12,'天雷の浮島','雷翼獣ゼファル'],
  [13,'蒼晶深層','晶界竜アズレオン'],
  [14,'腐緑の樹海','腐界樹ベルム'],
  [15,'黒鉄機城','機皇アーク・ゼロ'],
];

test('chapters 11-15 are original playable chapters with generated enemies and equipment', () => {
  assert.equal(CHAPTERS.length, 15);
  for (const [num,name,boss] of expected) {
    const spec = CHAPTER_SPECS.find(c => c.num === num);
    assert.ok(spec); assert.equal(spec.name, name); assert.equal(spec.enemies.boss, boss);
    const chapter = CHAPTERS.find(c => c.num === num);
    assert.ok(chapter); assert.equal(chapter.stages.length, 6);
    assert.ok(findStage(`${num}-5`)?.stage?.boss);
    assert.ok(ENEMY_TYPES[`ch${num}_normal`]);
    assert.equal(ENEMY_TYPES[`ch${num}_boss`].name, boss);
    assert.ok(getItem(`ch${num}_weapon`));
    assert.ok(getItem(`ch${num}_weapon_epic`));
  }
});

test('chapter 11-15 recommended levels continue upward from chapter 10', () => {
  const late = CHAPTER_SPECS.filter(c => c.num >= 10).sort((a,b)=>a.num-b.num);
  for (let i=1;i<late.length;i++) assert.ok(late[i].recLevel[0] >= late[i-1].recLevel[1]);
  assert.deepEqual(CHAPTER_SPECS.find(c=>c.num===15).recLevel, [210,260]);
});

test('new chapters provide long-term rune hunting destinations', () => {
  assert.ok(runesForStage('11-3').some(r=>r.id==='illusion'));
  assert.ok(runesForStage('12-3').some(r=>r.id==='fists'));
  assert.ok(runesForStage('13-3').some(r=>r.id==='spirit'));
  assert.ok(runesForStage('14-B').some(r=>r.id==='greed'));
  assert.ok(runesForStage('15-5').some(r=>r.id==='bastion'));
  assert.ok(runesForStage('15-B').some(r=>r.id==='craft'));
});

test('five new recruit species have valid combat data and skills', () => {
  for (const id of ['ash_soldier','thunder_beast','crystal_bug','rot_beast','iron_hound']) {
    const s=COMPANION_SPECIES[id]; assert.ok(s); assert.ok(s.recruit.baseChance>0);
    for(const entry of s.skills) assert.ok(getCompanionSkill(entry.id), `${id}:${entry.id}`);
  }
});
