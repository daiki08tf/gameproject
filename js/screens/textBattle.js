/* ============================================================
   TextBattleScreen（テキスト戦闘：画面表示・コマンド入力）
   BattleEngine（戦闘ルール・計算）とBattleLog（文章化）を橋渡しする、
   DOM操作専任のレイヤー。旧BattleScreen（js/battle.js、リアルタイム
   Canvas戦闘）はそのまま未使用で残し、こちらは完全に独立した新しい
   画面として追加する（元指示19番）。
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';
import { describeRound, describeBattleEnd } from '../battleLog.js';
import { Audio_ } from '../audio.js';

const MAX_LOG_LINES = 200; // ログが際限なく伸びないよう上限を設ける

export class TextBattleScreen {
  constructor() {
    this.engine = null;
    this.onEnd = null;
    this.selectedTargetId = null;
    this.logLines = [];
    this.locked = false; // コマンド解決中の多重入力防止

    this.el = {
      stageName: document.getElementById('tbStageName'),
      remain: document.getElementById('tbEnemyRemainText'),
      hpFill: document.getElementById('tbHpFill'),
      hpText: document.getElementById('tbHpText'),
      mpFill: document.getElementById('tbMpFill'),
      mpText: document.getElementById('tbMpText'),
      enemyList: document.getElementById('tbEnemyList'),
      log: document.getElementById('tbLog'),
      retreatBtn: document.getElementById('tbRetreatBtn'),
      attackBtn: document.getElementById('tbAttackBtn'),
      spellBtn: document.getElementById('tbSpellBtn'),
      skillBtn: document.getElementById('tbSkillBtn'),
      guardBtn: document.getElementById('tbGuardBtn'),
      itemBtn: document.getElementById('tbItemBtn'),
      fleeBtn: document.getElementById('tbFleeBtn'),
    };

    this.el.attackBtn.addEventListener('click', () => this._onCommand({ type: 'attack', targetId: this.selectedTargetId }));
    this.el.guardBtn.addEventListener('click', () => this._onCommand({ type: 'guard' }));
    this.el.skillBtn.addEventListener('click', () => this._onCommand({ type: 'skill' }));
    this.el.fleeBtn.addEventListener('click', () => this._onCommand({ type: 'flee' }));
    // じゅもん・どうぐは今回のスコープでは拡張ポイントのスタブ（元指示1・14・15番）。
    // ボタン自体はhtml側でdisabledにしてあるため、クリックしても何も起きない。

    // 画面上部の✕は「にげる」コマンド（成功率あり・Boss戦不可）とは別物で、
    // 旧battle.jsのretreatBtnと同じ無条件・即時の離脱（元指示19番：既存の
    // 挙動を壊さない）
    this.el.retreatBtn.addEventListener('click', () => this._onForceRetreat());
  }

  start(stageId, onEnd, blessingId) {
    this.engine = new BattleEngine(stageId, blessingId);
    this.onEnd = onEnd;
    this.selectedTargetId = null;
    this.logLines = [];
    this.locked = false;

    this.el.stageName.textContent = this.engine.stage.name;
    this._pushLines(['戦闘開始！']);
    // 表示専用に最初の遭遇グループだけ先に見せる（ラウンドはまだ消費しない。
    // このグループの「出現直後の猶予」はBattleEngine側の_freshGroupPending
    // フラグとして保持され、続く最初のコマンド解決時にも正しく効く）
    this._revealNextGroupIfNeeded();
    this._render();
  }

  // 現在の遭遇グループを全滅させた直後は、engine.aliveEnemies.length===0の
  // まま次のコマンド入力待ちになってしまう（「こうげき」ボタンはenemies不在
  // だと無効化されるため、advanceTurn内蔵の自動出現に辿り着く手段が無くなる）。
  // ここでグループ全滅の直後に次のグループを表示専用で呼び出しておくことで、
  // コマンドボタンが再び有効になり、プレイヤーが次に何をすべきか迷わない
  // （元指示10番：wave構成は維持しつつ、テンポよく次の集団へ進む）。
  _revealNextGroupIfNeeded() {
    if (!this.engine || this.engine.over) return;
    if (this.engine.aliveEnemies.length > 0) return;
    const startEvent = this.engine.beginNextEncounter();
    if (startEvent) this._pushLines(describeRound([startEvent]));
  }

  _onCommand(command) {
    if (!this.engine || this.engine.over || this.locked) return;
    if (command.type === 'attack' && this.engine.aliveEnemies.length === 0) return;
    Audio_.tap();
    this.locked = true;
    const { events, over, result } = this.engine.advanceTurn(command);
    this._pushLines(describeRound(events));
    if (over) {
      this._pushLines(describeBattleEnd(result));
      this._render();
      // ログの結果を一瞬見せてからリザルト画面へ渡す（元指示21番：テンポは
      // 保ちつつ、最後の1行が読めないまま画面転換しないようにする）
      setTimeout(() => { if (this.onEnd) this.onEnd(result); }, 550);
      return;
    }
    this._revealNextGroupIfNeeded();
    this.locked = false;
    this._render();
  }

  _onForceRetreat() {
    if (!this.engine || this.engine.over) return;
    Audio_.tap();
    const result = this.engine.forceRetreat();
    this._pushLines(describeBattleEnd(result));
    this._render();
    if (this.onEnd) this.onEnd(result);
  }

  _pushLines(lines) {
    for (const line of lines) this.logLines.push(line);
    if (this.logLines.length > MAX_LOG_LINES) this.logLines.splice(0, this.logLines.length - MAX_LOG_LINES);
  }

  _render() {
    const { engine } = this;
    const p = engine.player;
    this.el.hpFill.style.width = `${Math.max(0, p.hp / p.maxHp * 100)}%`;
    this.el.hpText.textContent = `HP ${Math.max(0, Math.round(p.hp))}/${p.maxHp}`;
    this.el.mpFill.style.width = `${p.maxMp > 0 ? Math.max(0, p.mp / p.maxMp * 100) : 0}%`;
    this.el.mpText.textContent = `${Math.max(0, Math.round(p.mp))}/${p.maxMp}`;

    const remaining = Math.max(0, engine.totalToDefeat - engine.defeated);
    this.el.remain.textContent = `残り ${remaining}`;

    this._renderEnemies();
    this._renderLog();
    this._renderCommands();
  }

  _renderEnemies() {
    const { engine } = this;
    const list = this.el.enemyList;
    list.innerHTML = '';
    const alive = engine.aliveEnemies;
    // 選択中のターゲットが死亡/不在なら、生存先頭を初期選択にしておく
    if (!alive.some((e) => e.id === this.selectedTargetId)) {
      this.selectedTargetId = alive[0] ? alive[0].id : null;
    }
    for (const e of engine.enemies) {
      const card = document.createElement('div');
      card.className = 'tb-enemy-card'
        + (e.dead ? ' dead' : '')
        + (e.boss ? ' boss' : '')
        + (!e.dead && e.id === this.selectedTargetId ? ' selected' : '')
        + (e.pendingSpecial ? ' telegraph' : '');
      const tag = e.dead ? '（撃破）' : e.pendingSpecial ? '（技の予兆…！）' : e.elite ? '（エリート）' : e.boss ? '（BOSS）' : '';
      card.innerHTML = `
        <div class="tb-enemy-name-row"><span>${e.name}</span><span class="tag">${tag}</span></div>
        <div class="bar hp-bar small"><div class="fill" style="width:${e.dead ? 0 : Math.max(0, e.hp / e.maxHp * 100)}%"></div></div>
      `;
      if (!e.dead) card.addEventListener('click', () => { this.selectedTargetId = e.id; this._renderEnemies(); });
      list.appendChild(card);
    }
  }

  _renderLog() {
    const log = this.el.log;
    log.innerHTML = this.logLines.map((line) => `<p>${line}</p>`).join('');
    log.scrollTop = log.scrollHeight;
  }

  _renderCommands() {
    const { engine } = this;
    const skill = engine.job && engine.job.skill;
    const skillReady = skill && engine.player.mp >= skill.mpCost && engine._skillCdTurns <= 0;
    this.el.skillBtn.textContent = skill ? skill.name : 'とくぎ';
    this.el.skillBtn.disabled = !skill || engine.over;
    this.el.skillBtn.classList.toggle('hidden', false);
    this.el.skillBtn.title = skill ? `MP${skill.mpCost}` : '';
    this.el.skillBtn.style.opacity = skillReady ? '' : '0.6';

    this.el.fleeBtn.disabled = engine.over || !engine.canFlee();
    this.el.attackBtn.disabled = engine.over || engine.aliveEnemies.length === 0;
    this.el.guardBtn.disabled = engine.over;
  }
}
