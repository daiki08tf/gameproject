// gearStatMult（chapters.js）— Session 2 pacing fix の核となる
// 「装備パワー曲線」の回帰テスト。敵側が章立てで複利成長するのに対し
// 装備の伸びが線形しかなかったため、後半章のTTKが爆発していた問題の
// 対策。ここでは「序盤の較正値を壊さない」「PIVOT以降に複利で伸びる」
// 「耐久系と攻撃系でレートが分かれる」という3つの設計上の約束を検証する。
import test from 'node:test';
import assert from 'node:assert/strict';
import { chapterMult, gearStatMult } from '../js/data/chapters.js';
import { getItem } from '../js/data/equipment.js';
import { EQUIPMENT_LAYER } from '../js/data/balance.js';

const PIVOT = EQUIPMENT_LAYER.GEAR_PIVOT_CHAPTER;

test('gearStatMultはPIVOTまで経済曲線chapterMultと同一（序盤較正を壊さない）', () => {
  for (const n of [1, 2, 3, 5]) {
    assert.equal(gearStatMult('atk', n), chapterMult(n), `n=${n}`);
    assert.equal(gearStatMult('def', n), chapterMult(n), `n=${n}`);
    assert.equal(gearStatMult('hp', n), chapterMult(n), `n=${n}`);
  }
});

test('攻撃系ステータスはPIVOT以降に複利で伸びる', () => {
  const at5 = gearStatMult('atk', PIVOT);
  const at10 = gearStatMult('atk', PIVOT + 5);
  const expected = at5 * Math.pow(EQUIPMENT_LAYER.GEAR_OFF_LATE_RATE, 5);
  assert.ok(Math.abs(at10 - expected) < 1e-9);
  // 線形のままではありえない伸び（chapterMult(10)/chapterMult(5)≒1.98倍）を上回る
  assert.ok(at10 / at5 > chapterMult(PIVOT + 5) / chapterMult(PIVOT));
});

test('耐久系ステータスは攻撃系より緩い複利（生存圧の暴走を抑える）', () => {
  const offRatio = gearStatMult('atk', PIVOT + 10) / gearStatMult('atk', PIVOT);
  const defRatio = gearStatMult('def', PIVOT + 10) / gearStatMult('def', PIVOT);
  assert.ok(defRatio < offRatio);
  assert.equal(defRatio, Math.pow(EQUIPMENT_LAYER.GEAR_DEF_LATE_RATE, 10));
});

test('生成装備の実ステータスが曲線に追随する（後半章の武器が意味のある強さになる）', () => {
  const w5 = getItem('ch5_weapon_epic');
  const w15 = getItem('ch15_weapon_epic');
  assert.ok(w5 && w15);
  // 線形なら chapterMult(15)/chapterMult(5)≒2.46倍止まり。複利なら大幅に上回る
  assert.ok(w15.stats.atk / w5.stats.atk > 4, `ch15/ch5 atk ratio=${w15.stats.atk / w5.stats.atk}`);
});

test('crit/spdは攻撃系複利の対象外（%予算ステータスのインフレ防止）', () => {
  const w15 = getItem('ch15_weapon_epic');
  // crit が atk 並みに複利化されていると 4 桁%に化ける。数百%台に留まることを検証
  assert.ok(w15.stats.crit < w15.stats.atk, 'crit should stay below atk on chapter weapons');
  assert.ok(w15.stats.crit < 500, `crit=${w15.stats.crit} unexpectedly inflated`);
});
