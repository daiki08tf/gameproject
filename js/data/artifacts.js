/* ============================================================
   覚醒アーティファクト（秘宝）定義（Blade Vale 2.0 Phase 3）
   既存の特殊効果（chapters.jsのEFFECTS）を、ボスドロップのルーンとは
   別の恒久解放ルートとして再利用する。解放は消費されず、スロットへの
   付け替えは自由（js/data/balance.jsのARTIFACT_LAYERでスロット数・
   解放コストを管理）。
   ============================================================ */
import { EFFECTS } from './chapters.js';

export const ARTIFACTS = Object.keys(EFFECTS).map((effectId) => ({
  id: `artifact_${effectId}`,
  effectId,
  name: `${EFFECTS[effectId].name}の秘宝`,
  desc: EFFECTS[effectId].desc,
}));

export function getArtifact(id) { return ARTIFACTS.find((a) => a.id === id); }
export function allArtifacts() { return ARTIFACTS; }
