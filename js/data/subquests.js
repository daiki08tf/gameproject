/* ============================================================
   周回ダンジョン（常時挑戦可能なサブステージ）
   経験値／ゴールド／魔石・ルーン、それぞれ初級〜上級の3段階。
   本編の章進行とは無関係にいつでも挑戦できる。
   ============================================================ */
import { allRunes } from './runes.js';

const TIERS = [
  { id: 't1', label: '初級', recLevel: 3, normal: 'grunt', fast: 'fast', tank: 'tank' },
  { id: 't2', label: '中級', recLevel: 22, normal: 'ch4_normal', fast: 'ch4_fast', tank: 'ch4_tank' },
  { id: 't3', label: '上級', recLevel: 50, normal: 'ch7_normal', fast: 'ch7_fast', tank: 'ch7_tank' },
];

const FOCUSES = [
  { id: 'exp', name: '経験値の小径', icon: '📘', goldMult: 0.4, expMult: 2.6, mana: false },
  { id: 'gold', name: '黄金の坑道', icon: '💰', goldMult: 2.6, expMult: 0.4, mana: false },
  { id: 'mana', name: '魔石の遺跡', icon: '💎', goldMult: 0.6, expMult: 0.6, mana: true },
];

const EFFECT_RUNE_IDS = allRunes().filter((r) => r.kind === 'effect').map((r) => r.id);

export const SUB_QUESTS = [];
for (const focus of FOCUSES) {
  for (const tier of TIERS) {
    const scale = 1 + (tier.recLevel - 1) * 0.15;
    SUB_QUESTS.push({
      id: `sub_${focus.id}_${tier.id}`,
      name: `${focus.name}［${tier.label}］`,
      icon: focus.icon,
      focus: focus.id,
      recLevel: tier.recLevel,
      sub: true,
      waves: [
        { type: tier.normal, count: 6, interval: 1.1 },
        { type: tier.fast, count: 4, interval: 0.9 },
        { type: tier.tank, count: 2, interval: 1.8 },
      ],
      rewards: {
        gold: Math.round(40 * focus.goldMult * scale),
        exp: Math.round(30 * focus.expMult * scale),
      },
      manastoneReward: focus.mana ? Math.round(15 * scale) : 0,
      dropTable: focus.mana ? EFFECT_RUNE_IDS.map((id) => ({ itemId: id, weight: 1 })) : [],
    });
  }
}

export function findSubQuest(id) { return SUB_QUESTS.find((q) => q.id === id); }
export function subQuestsByFocus(focusId) { return SUB_QUESTS.filter((q) => q.focus === focusId); }
