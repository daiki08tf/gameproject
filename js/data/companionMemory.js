/* ============================================================
   Monster Memory（仲間の記憶）— Session 6
   ------------------------------------------------------------
   「この個体と何をしたか」を個体instanceへ残す小さな読み物層。
   ステータスには干渉しない —— provenance（出自）が「どこから来たか」
   を記録するのに対し、memories は「一緒に何をしたか」を記録する。

   保持: instance.memories = string[]（最大6件、古いものから圧縮）。
   additive field — 既存saveには存在しないので初書き込み時に初期化。
   ============================================================ */

export const COMPANION_MEMORY_MAX = 6;

// 記憶を1件残す。重複は弾き、上限超過は古いものから間引く。
export function pushCompanionMemory(inst, text) {
  if (!inst || !text) return false;
  inst.memories ||= [];
  if (inst.memories.includes(text)) return false;
  inst.memories.push(text);
  while (inst.memories.length > COMPANION_MEMORY_MAX) inst.memories.shift();
  return true;
}
