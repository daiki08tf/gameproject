/* ============================================================
   旅の手引き — 最初の章だけに出る短い目標列（EXP-2）。
   ------------------------------------------------------------
   新しい進行・報酬・フラグは作らない。達成判定はすべて既存の状態
   （stageProgress・装備・強化Lv・所持どうぐ）からその場で導出する純粋関数で、
   セーブには何も書かない。第1章のボスを倒した時点で手引きは役目を終える。
   ============================================================ */

export const BEGINNER_GUIDE_STEPS = Object.freeze([
  { id: 'first_clear', label: '1-1「平原の入口」をクリアする', hint: 'HPが減ったら「どうぐ」のやくそう。負けても経験値は残る。', target: 'goStageBtn', done: (c) => c.cleared('1-1') },
  { id: 'equip', label: '手に入れた防具を装備する', hint: '装備画面の「最強装備」で一括で付け替えられる。', target: 'goEquipBtn', done: (c) => c.equippedArmor > 0 },
  { id: 'enhance', label: '鍛冶屋で武器を1回強化する', hint: '同じ武器の予備か、分解で得る「武器の欠片」が素材になる。', target: 'goBlacksmithBtn', done: (c) => c.maxEnhance > 0 },
  { id: 'stock', label: '回復どうぐを3個以上そろえる', hint: '鍛冶屋の「道具」タブで買える。ボス戦の保険になる。', target: 'goBlacksmithBtn', done: (c) => c.healItems >= 3 },
  { id: 'boss', label: '第1章のボス「オークキングの城」を攻略する', hint: 'オートはボス出現で止まる。技の予兆が出たら「ぼうぎょ」。', target: 'goStageBtn', done: (c) => c.cleared('1-5') },
]);

// ctx: { cleared(stageId), equippedArmor, maxEnhance, healItems }
export function beginnerGuideProgress(ctx) {
  // 第1章を越えた（＝既存プレイヤーを含む）なら、途中の項目が未達でも手引きは出さない
  if (!ctx || ctx.cleared('1-5')) return { active: false, steps: [], doneCount: BEGINNER_GUIDE_STEPS.length, total: BEGINNER_GUIDE_STEPS.length, next: null };
  const steps = BEGINNER_GUIDE_STEPS.map((step) => ({ id: step.id, label: step.label, hint: step.hint, target: step.target, done: !!step.done(ctx) }));
  const next = steps.find((s) => !s.done) || null;
  return { active: true, steps, doneCount: steps.filter((s) => s.done).length, total: steps.length, next };
}
