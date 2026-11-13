/*
 * Battle Assist — 戦闘の入力負担を下げる UI 層だけの補助（DBG-11 / DBG-12）。
 *
 * 1) オート：直前に選んだコマンド（こうげき／ぼうぎょ／とくぎ／じゅもん）を
 *    一定間隔でくり返す。3〜5章で1戦 50〜150 ラウンドに達し、1ラウンド1タップ
 *    しか手段がなかった問題への対処。コマンドは必ず既存の
 *    TextBattleScreen._onCommand → BattleEngine.advanceTurn を通すので、
 *    戦闘結果・報酬・他パッチのフックは手動操作と完全に同じ経路になる。
 *    危険な局面は自動で手放す：HP が AUTO_STOP_HP 以下、または Boss 出現時に停止。
 *    どうぐ・にげるはくり返さない（消耗品の浪費と意図しない離脱を防ぐ）。
 *
 * 2) 手引き：第1章で HP が減り、回復どうぐを持っているのに使っていないとき、
 *    その戦闘で1回だけログに案内を出す。1-1 は「こうげき」連打だと勝率が
 *    数%しかなく、初期所持のやくそうを使えば 85% 以上で勝てる設計なのに、
 *    それを伝える導線がなかった。難度（敵数値）は変えない。
 *
 * セーブデータは一切追加しない。オートは戦闘開始のたびに OFF に戻る。
 */
import { TextBattleScreen } from '../screens/textBattle.js';
import { getConsumable } from '../data/consumables.js';

const AUTO_INTERVAL_MS = 300;
const AUTO_STOP_HP = 0.35;
const HINT_HP = 0.45;
const REPEATABLE = new Set(['attack', 'guard', 'skill', 'spell']);

function assist(screen) {
  if (!screen._assist) screen._assist = { auto: false, timer: null, last: null, hinted: false, usedItem: false, bossAck: false };
  return screen._assist;
}

const STOP_NOTE_MS = 2600;

function stopAuto(screen, reason, shortReason) {
  const a = assist(screen);
  if (a.timer) { clearTimeout(a.timer); a.timer = null; }
  if (!a.auto) return;
  a.auto = false;
  if (reason && screen.engine && !screen.engine.over) {
    screen._pushLines([`<span class="tb-assist-note">オート停止：${reason}</span>`]);
    // ログは流れるので、止まった理由をボタン自身にも少しのあいだ出す
    a.stopNote = shortReason || reason;
    a.stopNoteUntil = Date.now() + STOP_NOTE_MS;
    setTimeout(() => { if (screen._assist === a && screen.engine && !screen.engine.over) screen._render(); }, STOP_NOTE_MS + 50);
  }
}

// 周回の継続：「もう一度」で同じステージを続けて回すとき、前の戦闘をオートで勝ち切っていたなら
// 次の戦闘もオートで始める。セーブには持たない（このページを開いている間だけの記憶）。
// Boss・低 HP では従来どおり自動で止まるので、危険な場面で勝手に進むことはない。
let carry = null; // { stageId }

function hpRatio(engine) {
  const p = engine.player;
  return p.maxHp > 0 ? p.hp / p.maxHp : 0;
}

function hasHealItem(engine) {
  return engine.availableConsumables().some((c) => {
    const def = getConsumable(c.id || c.itemId || c);
    return def?.effect?.kind === 'heal';
  });
}

function commandLabel(screen) {
  const last = assist(screen).last;
  if (!last || last.type === 'attack') return 'こうげき';
  if (last.type === 'guard') return 'ぼうぎょ';
  const list = last.type === 'spell' ? screen.engine.availableSpells() : screen.engine.availableSkills();
  return list.find((t) => t.id === last.techId)?.name || 'こうげき';
}

// オートが次に出すコマンド。とくぎ／じゅもんが MP 不足・クールダウン中なら
// こうげきに落とす（advanceTurn は不成立コマンドでラウンドを消費しないため、
// そのまま投げると同じ不成立を無限にくり返してしまう）。
function nextAutoCommand(screen) {
  const { engine } = screen;
  const last = assist(screen).last;
  if (last && (last.type === 'skill' || last.type === 'spell')) {
    if (engine._probeTechnique(last.type, last.techId).ok) return { type: last.type, techId: last.techId, targetId: screen.selectedTargetId };
    return { type: 'attack', targetId: screen.selectedTargetId };
  }
  if (last && last.type === 'guard') return { type: 'guard' };
  return { type: 'attack', targetId: screen.selectedTargetId };
}

function scheduleTick(screen) {
  const a = assist(screen);
  if (a.timer) clearTimeout(a.timer);
  a.timer = setTimeout(() => { a.timer = null; tick(screen); }, AUTO_INTERVAL_MS);
}

function tick(screen) {
  const a = assist(screen);
  const { engine } = screen;
  if (!a.auto) return;
  if (!engine || engine.over) { stopAuto(screen); return; }
  if (!document.getElementById('textBattleScreen')?.classList.contains('active')) { stopAuto(screen); return; }
  // サブメニュー操作中・コマンド解決中は割り込まない
  if (screen.locked || screen.techMenuKind) { scheduleTick(screen); return; }
  if (hpRatio(engine) <= AUTO_STOP_HP) { stopAuto(screen, 'HPが低下した。', 'HP低下で停止'); screen._render(); return; }
  if (!a.bossAck && engine.aliveEnemies.some((e) => e.boss)) {
    a.bossAck = true;
    stopAuto(screen, '強敵が現れた。続けるならもう一度オートを。', '強敵出現で停止');
    screen._render();
    return;
  }
  a.fromAuto = true;
  try { screen._onCommand(nextAutoCommand(screen)); } finally { a.fromAuto = false; }
  if (a.auto && engine && !engine.over) scheduleTick(screen);
  else {
    // オートのまま勝ち切った戦闘だけ、同じステージの次戦へ引き継ぐ
    carry = a.auto && engine.over && engine.finalResult?.cleared ? { stageId: engine.stage?.id || null, last: a.last } : null;
    stopAuto(screen);
  }
}

function ensureAutoButton(screen) {
  let btn = document.getElementById('tbAutoBtn');
  if (btn) return btn;
  const grid = screen.el?.commandGrid;
  if (!grid) return null;
  btn = document.createElement('button');
  btn.id = 'tbAutoBtn';
  btn.type = 'button';
  btn.className = 'tb-cmd-btn tb-cmd-auto';
  btn.addEventListener('click', () => {
    if (!screen.engine || screen.engine.over) return;
    const a = assist(screen);
    if (a.auto) stopAuto(screen);
    else if (hpRatio(screen.engine) <= AUTO_STOP_HP) {
      // 危険域では開始しない（開始→即停止をくり返してログを埋めないよう、案内は直前と同じなら出さない）
      const note = '<span class="tb-assist-note">HPが低い間はオートを使えない。回復してから。</span>';
      if (screen.logLines[screen.logLines.length - 1] !== note) screen._pushLines([note]);
    } else {
      a.auto = true;
      // 手動で入れ直した＝この Boss 相手でも続ける意思表示として扱う
      if (screen.engine.aliveEnemies.some((e) => e.boss)) a.bossAck = true;
      scheduleTick(screen);
    }
    screen._render();
  });
  grid.appendChild(btn);
  return btn;
}

const previousStart = TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start = function battleAssistStart(...args) {
  stopAuto(this);
  this._assist = null;
  const resume = carry && carry.stageId === args[0] ? carry : null;
  carry = null;
  const out = previousStart.apply(this, args);
  if (resume && this.engine && !this.engine.over && this.engine.stage?.id === resume.stageId) {
    const a = assist(this);
    a.auto = true;
    a.last = resume.last || null;
    a.resumed = true;
    scheduleTick(this);
    this._render();
  }
  return out;
};

const previousOnCommand = TextBattleScreen.prototype._onCommand;
TextBattleScreen.prototype._onCommand = function battleAssistOnCommand(command) {
  const accepted = !!this.engine && !this.engine.over && !this.locked;
  const a = assist(this);
  if (accepted && command) {
    if (command.type === 'item') a.usedItem = true;
    // 手動で選んだコマンドだけを「くり返す対象」として覚える
    if (!a.fromAuto && REPEATABLE.has(command.type)) a.last = { type: command.type, techId: command.techId };
  }
  const result = previousOnCommand.call(this, command);
  const { engine } = this;
  if (accepted && engine && !engine.over && !a.hinted && !a.usedItem
    && engine.chapter?.id === 'ch1' && hpRatio(engine) <= HINT_HP && hasHealItem(engine)) {
    a.hinted = true;
    this._pushLines(['<span class="tb-assist-note">【手引き】HPが減っている。「どうぐ」のやくそうで回復できる。「ぼうぎょ」は被害を抑える。</span>']);
    this._render();
  }
  return result;
};

const previousForceRetreat = TextBattleScreen.prototype._onForceRetreat;
TextBattleScreen.prototype._onForceRetreat = function battleAssistForceRetreat() {
  carry = null;
  stopAuto(this);
  return previousForceRetreat.call(this);
};

const previousRender = TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render = function battleAssistRender() {
  previousRender.call(this);
  if (!this.engine) return;
  const btn = ensureAutoButton(this);
  if (!btn) return;
  const a = assist(this);
  const noted = !a.auto && a.stopNote && Date.now() < (a.stopNoteUntil || 0);
  const label = a.auto ? `オート中：${commandLabel(this)}（タップで停止）`
    : noted ? `${a.stopNote} ― タップで再開`
    : `オート：${commandLabel(this)}をくり返す`;
  if (btn.textContent !== label) btn.textContent = label;
  if (btn.classList.contains('active') !== a.auto) btn.classList.toggle('active', a.auto);
  const disabled = this.engine.over;
  if (btn.disabled !== disabled) btn.disabled = disabled;
};
