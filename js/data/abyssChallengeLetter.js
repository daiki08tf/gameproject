/* ============================================================
   挑戦状 — 同じ条件の深淵を、文字列ひとつで人と共有する（EXPANSION D1）
   ------------------------------------------------------------
   挑戦状は「深淵の階・盟約・誓約・乱数の種」を短い符号にしたもの。
   受け取った側は同じ敵配置・同じ出目の流れで戦い、ラウンド数や残 HP を見比べる。
   サーバーも通信も使わない（ふっかつのじゅもんと同じく、文字列を人が運ぶ）。

   ここは符号化と乱数生成だけの純粋関数。戦闘・報酬・セーブには関与しない。
   ============================================================ */
import { ABYSS_PACTS } from './abyssPacts.js';
import { ABYSS_CHALLENGES } from './abyssChallenges.js';

const PREFIX = 'BV';
const toBits = (ids, table) => table.reduce((bits, def, i) => bits | ((ids || []).includes(def.id) ? 1 << i : 0), 0);
const fromBits = (bits, table) => table.filter((_, i) => bits & (1 << i)).map((def) => def.id);
const b36 = (n) => Math.max(0, Math.floor(Number(n) || 0)).toString(36).toUpperCase();
const checkChar = (parts) => (parts.join('-').split('').reduce((sum, ch) => (sum * 31 + ch.charCodeAt(0)) % 1296, 7)).toString(36).toUpperCase().padStart(2, '0');

// { depth, pactIds, challengeIds, seed } → 'BV-3C-5-2-K9F2A-7Q'
export function encodeChallengeLetter({ depth, pactIds = [], challengeIds = [], seed }) {
  const parts = [PREFIX, b36(depth), b36(toBits(pactIds, ABYSS_PACTS)), b36(toBits(challengeIds, ABYSS_CHALLENGES)), b36(seed >>> 0)];
  return [...parts, checkChar(parts)].join('-');
}

// 文字列 → { ok, depth, pactIds, challengeIds, seed } / { ok:false, reason }
export function decodeChallengeLetter(text) {
  const raw = String(text || '').trim().toUpperCase().replace(/[\s　]+/g, '').replace(/[‐－―ー]/g, '-');
  const parts = raw.split('-');
  if (parts.length !== 6 || parts[0] !== PREFIX) return { ok: false, reason: 'format' };
  if (checkChar(parts.slice(0, 5)) !== parts[5]) return { ok: false, reason: 'check' };
  const [depth, pactBits, challengeBits, seed] = parts.slice(1, 5).map((p) => parseInt(p, 36));
  if (![depth, pactBits, challengeBits, seed].every(Number.isFinite) || depth < 1) return { ok: false, reason: 'format' };
  return { ok: true, depth, pactIds: fromBits(pactBits, ABYSS_PACTS), challengeIds: fromBits(challengeBits, ABYSS_CHALLENGES), seed: seed >>> 0 };
}

export function randomChallengeSeed(random = Math.random) { return Math.floor(random() * 0xFFFFFF) >>> 0; }

// 再現可能な乱数（mulberry32）。挑戦状の戦闘中だけ Math.random の代わりに使う。
export function seededRandom(seed) {
  let a = (seed >>> 0) || 1;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function describeChallengeLetter(letter) {
  const pacts = (letter.pactIds || []).map((id) => ABYSS_PACTS.find((p) => p.id === id)?.name).filter(Boolean);
  const challenges = (letter.challengeIds || []).map((id) => ABYSS_CHALLENGES.find((c) => c.id === id)?.name).filter(Boolean);
  return `深淵 ${letter.depth}階 ／ 盟約：${pacts.join('・') || 'なし'} ／ 誓約：${challenges.join('・') || 'なし'}`;
}
