/* ============================================================
   覚醒アーティファクト（秘宝）定義
   ・既存の特殊効果（chapters.jsのEFFECTS）を、ボスドロップのルーンとは
     別の恒久解放ルートとして再利用したもの（EFFECT_ARTIFACTS）
   ・転生Relicは単純な+X%ではなく、ビルドのルールを変える効果。
   ・Progression 3.0ではRelicを深淵Eraの節目へ配置し、長期攻略の横目標にする。
   ============================================================ */
import { EFFECTS } from './chapters.js';
import { worldMysteryClue } from './storyWorldMystery.js';

export const EFFECT_ARTIFACTS = Object.keys(EFFECTS).map((effectId) => ({
  id: `artifact_${effectId}`,
  effectId,
  name: `${EFFECTS[effectId].name}の秘宝`,
  desc: EFFECTS[effectId].desc,
}));

const RELIC_STORY_CLUE=worldMysteryClue('relic');

// 5つのRelicは深淵の主要マイルストーンに1つずつ配置する。
// 到達だけで自動取得はせず、既存のGold/魔石解放コストも残す。
// 「深淵到達 → 新しいビルドルール解放 → 次Eraへ挑戦」という循環を作る。
export const RELICS = [
  {
    id: 'relic_bloodchalice', name: '血神の杯',
    desc: '通常攻撃・スキル命中時、ダメージの8%分ATKが3秒間上昇する（重複せず更新のみ）',
    trigger: 'onHit', kind: 'bloodChalice', chance: 1.0, power: 0.08, duration: 3,
    abyssDepthRequired: 1, progressionEra: '深淵序層', storyClue:RELIC_STORY_CLUE,
  },
  {
    id: 'relic_thundereye', name: '雷神の瞳',
    desc: '会心発生時、30%の確率でATKの40%の追加落雷ダメージが発生する',
    trigger: 'onCrit', kind: 'lightning', chance: 0.3, power: 0.4,
    abyssDepthRequired: 100, progressionEra: '深淵中層', storyClue:RELIC_STORY_CLUE,
  },
  {
    id: 'relic_berserkerheart', name: '狂戦士の心臓',
    desc: 'HPが低いほど攻撃速度が上昇し、HPが25%以下の間は通常攻撃が2回攻撃になる',
    trigger: 'passive', kind: 'berserker', threshold: 0.25, power: 0.5,
    abyssDepthRequired: 500, progressionEra: '超越帯', storyClue:RELIC_STORY_CLUE,
  },
  {
    id: 'relic_hourglass', name: '時喰らいの砂時計',
    desc: 'スキル使用時、25%の確率でクールダウンが発生しない',
    trigger: 'onSkill', kind: 'cdRefund', chance: 0.25,
    abyssDepthRequired: 1000, progressionEra: '神域', storyClue:RELIC_STORY_CLUE,
  },
  {
    id: 'relic_deathking', name: '死王の指骨',
    desc: '最大HPが30%減少する代わりに、極Affixの効果量が上昇する',
    trigger: 'passive', kind: 'deathking', power: -0.3, affixBonus: 0.05,
    abyssDepthRequired: 2000, progressionEra: '終焉域', storyClue:RELIC_STORY_CLUE,
  },
];

export const ARTIFACTS = [...EFFECT_ARTIFACTS, ...RELICS];

export function getArtifact(id) { return ARTIFACTS.find((a) => a.id === id); }
export function allArtifacts() { return ARTIFACTS; }
