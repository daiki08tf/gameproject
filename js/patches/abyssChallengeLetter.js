/*
 * 挑戦状の実行時パッチと UI（EXPANSION D1）。符号化は js/data/abyssChallengeLetter.js。
 *
 * 戦闘の開始は、main.js が拠点防衛用に持っている口（'settlement-defense-start' →
 * prepareSettlementDefenseBattle）を借りる。追跡インシデントと同じやり方で、main.js は無変更。
 * 挑戦状の戦闘は「その階の普通の深淵戦」そのもの（敵・報酬・記録は既存どおり）で、違いは 2 点だけ:
 *   1. 盟約・誓約を、保存されている自分の選択ではなく挑戦状のものにする（その 1 戦だけ、保存はしない）
 *   2. 戦闘中の乱数を、挑戦状の種から作った再現可能な列にする
 * 受けられるのは自分が到達済みの階まで（未到達の階を挑戦状で飛び越えられないようにする）。
 */
import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { buildAbyssStage } from '../data/abyss.js';
import { encodeChallengeLetter, decodeChallengeLetter, randomChallengeSeed, seededRandom, describeChallengeLetter } from '../data/abyssChallengeLetter.js';
import './settlementDefense.js';
import './abyss2Pacts.js';
import './abyss3Challenges.js';

const LETTER_ID = 'challenge-letter';
let pending = null;        // { letter, code, stageId }
let originalRandom = null; // 挑戦状の戦闘中だけ差し替えている Math.random の元

function restoreRandom() { if (originalRandom) { Math.random = originalRandom; originalRandom = null; } }

state.makeChallengeLetter = function makeChallengeLetter(depth) {
  const best = Math.floor(Number(this.data.abyssBestDepth) || 0);
  if (best < 1) return { ok: false, reason: 'locked' };
  const d = Math.max(1, Math.min(best, Math.floor(Number(depth) || best)));
  const letter = { depth: d, pactIds: this.activeAbyssPacts?.(d) || [], challengeIds: this.activeAbyssChallenges?.() || [], seed: randomChallengeSeed() };
  return { ok: true, code: encodeChallengeLetter(letter), letter, description: describeChallengeLetter(letter) };
};

state.acceptChallengeLetter = function acceptChallengeLetter(text) {
  const letter = decodeChallengeLetter(text);
  if (!letter.ok) return letter;
  const best = Math.floor(Number(this.data.abyssBestDepth) || 0);
  if (letter.depth > best) return { ok: false, reason: 'depth', depth: letter.depth, best };
  pending = { letter, code: encodeChallengeLetter(letter), stageId: null };
  return { ok: true, letter, description: describeChallengeLetter(letter) };
};

const previousPrepare = state.prepareSettlementDefenseBattle;
state.prepareSettlementDefenseBattle = function prepareChallengeLetterOrDefense(id) {
  if (id !== LETTER_ID) return previousPrepare?.call(this, id) || null;
  if (!pending) return null;
  const stage = buildAbyssStage(pending.letter.depth, pending.letter.pactIds, { challengeIds: pending.letter.challengeIds });
  pending.stageId = stage.id;
  return { ...stage, settlementDefenseIncidentId: LETTER_ID };
};
const previousResolve = state.resolveSettlementDefense;
state.resolveSettlementDefense = function resolveChallengeLetterOrDefense(id, cleared) {
  if (id !== LETTER_ID) return previousResolve?.call(this, id, cleared);
  return { ok: true };
};

const previousStart = TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start = function challengeLetterStart(stageId, onEnd, blessingId, launchOpts) {
  restoreRandom();
  if (!pending || pending.stageId !== stageId) {
    if (pending?.stageId) pending = null; // 別の戦闘を始めたら、受けていた挑戦状は終わり
    return previousStart.call(this, stageId, onEnd, blessingId, launchOpts);
  }
  const active = pending;
  const screen = this;
  const wrapped = (result) => {
    restoreRandom();
    if (result) {
      const p = screen.engine?.player;
      result.challengeLetter = { code: active.code, description: describeChallengeLetter(active.letter), rounds: Number(screen.engine?.round) || 0, hpPct: p?.maxHp > 0 ? Math.round(Math.max(0, p.hp) / p.maxHp * 100) : 0, cleared: !!result.cleared };
    }
    onEnd?.(result);
  };
  // BattleEngine は生成時に state.data の盟約・誓約を読む。その 1 回だけ挑戦状のものに見せ、すぐ戻す。
  const savedPacts = state.data.abyssPacts, savedChallenges = state.data.abyssChallenges;
  originalRandom = Math.random;
  Math.random = seededRandom(active.letter.seed);
  try {
    state.data.abyssPacts = [...active.letter.pactIds];
    state.data.abyssChallenges = [...active.letter.challengeIds];
    return previousStart.call(this, stageId, wrapped, blessingId, launchOpts);
  } finally {
    state.data.abyssPacts = savedPacts;
    state.data.abyssChallenges = savedChallenges;
    if (!this.engine || this.engine.stage?.id !== stageId) restoreRandom();
  }
};

/* ---------------- UI：ふっかつのじゅもん画面に 1 枚足す ---------------- */
function escapeHtml(v) { return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;'); }

function install() {
  const host = document.querySelector('#spellScreen .blacksmith-content');
  if (!host || host.querySelector('[data-challenge-letter]')) return;
  const card = document.createElement('div');
  card.className = 'forge-card';
  card.dataset.challengeLetter = '1';
  card.innerHTML = `<div class="forge-card-name">挑戦状</div>
<div class="forge-card-sub">深淵の階・盟約・誓約・乱数の種を、短い符号にして人に渡せる。受け取った側は同じ敵・同じ出目の流れで戦い、ラウンド数や残HPを見比べる。受けられるのは、自分が到達済みの階まで。</div>
<div class="challenge-letter-row"><input type="number" id="challengeLetterDepth" min="1" inputmode="numeric" placeholder="階" aria-label="挑戦状にする階"><button class="forge-card-btn" id="challengeLetterMakeBtn" type="button">いまの盟約・誓約で書く</button></div>
<textarea id="challengeLetterOut" class="spell-box" readonly rows="2" placeholder="ここに挑戦状の符号が出ます"></textarea>
<div class="challenge-letter-row"><input type="text" id="challengeLetterIn" autocomplete="off" autocapitalize="characters" placeholder="受け取った符号（BV-…）" aria-label="受け取った挑戦状の符号"><button class="forge-card-btn" id="challengeLetterAcceptBtn" type="button">受ける</button></div>
<p id="challengeLetterMsg" class="forge-card-sub"></p>
<button class="forge-card-btn hidden" id="challengeLetterGoBtn" type="button">この挑戦状に挑む</button>`;
  host.appendChild(card);
  const $ = (id) => card.querySelector('#' + id);
  const msg = $('challengeLetterMsg');
  $('challengeLetterMakeBtn').addEventListener('click', () => {
    const made = state.makeChallengeLetter($('challengeLetterDepth').value);
    if (!made.ok) { msg.textContent = '挑戦状は、深淵に到達してから書ける。'; return; }
    $('challengeLetterOut').value = made.code;
    $('challengeLetterDepth').value = made.letter.depth;
    msg.textContent = `${made.description} ― 符号をそのまま相手に伝える。`;
    // 写せる環境なら写しておく。拒否されても符号は画面に出ているので、失敗は握りつぶしてよい（Promise の拒否も含めて）。
    try { navigator.clipboard?.writeText(made.code)?.catch(() => {}); } catch (e) { /* 手で写せる */ }
  });
  $('challengeLetterAcceptBtn').addEventListener('click', () => {
    const got = state.acceptChallengeLetter($('challengeLetterIn').value);
    const go = $('challengeLetterGoBtn');
    if (!got.ok) {
      go.classList.add('hidden');
      msg.textContent = got.reason === 'depth' ? `この挑戦状は ${got.depth}階。まだそこまで到達していない（最深 ${got.best}階）。`
        : got.reason === 'check' ? '符号が合わない。写し間違いがないか確かめる。' : '挑戦状の符号として読めない。';
      return;
    }
    msg.innerHTML = escapeHtml(got.description);
    go.classList.remove('hidden');
  });
  $('challengeLetterGoBtn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('settlement-defense-start', { detail: { incidentId: LETTER_ID } }));
  });
}
if (typeof document !== 'undefined') install();
