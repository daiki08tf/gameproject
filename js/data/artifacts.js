/* ============================================================
   覚醒アーティファクト（秘宝）定義
   ・既存の特殊効果（chapters.jsのEFFECTS）を、ボスドロップのルーンとは
     別の恒久解放ルートとして再利用したもの（EFFECT_ARTIFACTS）
   ・元指示の「転生Artifact（転生遺物）」本来仕様：単純な+X%ではなく、
     メリット＋デメリットを持ちビルドのルールを変える効果（RELICS）
   両方とも解放は消費されず、スロットへの付け替えは自由
   （js/data/balance.jsのARTIFACT_LAYERでスロット数・解放コストを管理）。
   ============================================================ */
import { EFFECTS } from './chapters.js';

export const EFFECT_ARTIFACTS = Object.keys(EFFECTS).map((effectId) => ({
  id: `artifact_${effectId}`,
  effectId,
  name: `${EFFECTS[effectId].name}の秘宝`,
  desc: EFFECTS[effectId].desc,
}));

// 転生遺物：メリット＋デメリットを持ち、ビルドのルールそのものを変える。
// EFFECT_ARTIFACTSと違い、effectIdでchapters.jsのEFFECTSを参照するのではなく、
// 自身がそのままtrigger/kind/chance/power等を持つ「効果オブジェクト」になっている
// （state.jsのgetEquippedEffects()がこれをそのままthis.effectsへ積む）。
export const RELICS = [
  {
    id: 'relic_bloodchalice', name: '血神の杯',
    desc: '通常攻撃・スキル命中時、ダメージの8%分ATKが3秒間上昇する（重複せず更新のみ）',
    trigger: 'onHit', kind: 'bloodChalice', chance: 1.0, power: 0.08, duration: 3,
  },
  {
    id: 'relic_thundereye', name: '雷神の瞳',
    desc: '会心発生時、30%の確率でATKの40%の追加落雷ダメージが発生する',
    trigger: 'onCrit', kind: 'lightning', chance: 0.3, power: 0.4,
  },
  {
    id: 'relic_berserkerheart', name: '狂戦士の心臓',
    desc: 'HPが低いほど攻撃速度が上昇し、HPが25%以下の間は通常攻撃が2回攻撃になる',
    trigger: 'passive', kind: 'berserker', threshold: 0.25, power: 0.5,
  },
  {
    id: 'relic_hourglass', name: '時喰らいの砂時計',
    desc: 'スキル使用時、25%の確率でクールダウンが発生しない',
    trigger: 'onSkill', kind: 'cdRefund', chance: 0.25,
  },
  {
    id: 'relic_deathking', name: '死王の指骨',
    desc: '最大HPが30%減少する代わりに、極Affixの効果量が上昇する',
    trigger: 'passive', kind: 'deathking', power: -0.3, affixBonus: 0.05,
  },
];

export const ARTIFACTS = [...EFFECT_ARTIFACTS, ...RELICS];

export function getArtifact(id) { return ARTIFACTS.find((a) => a.id === id); }
export function allArtifacts() { return ARTIFACTS; }
