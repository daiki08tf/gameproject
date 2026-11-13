/*
 * Battle Compact UI — 戦闘画面の情報密度を整える表示専用パッチ。
 *
 * 390×844 の実機確認で、仲間 HUD（号令 6 個＋作戦 4 個のボタン）が画面の
 * 約 1/3 を占め、戦闘ログが 5 行しか見えなかった。号令は 1 戦闘に各 1 回、
 * 作戦は一度決めれば触らない操作なので、既定では 1 行に畳み、必要なときだけ
 * 開く。開閉状態は戦闘中だけ保持する（セーブなし）。
 *
 * 号令・作戦ボタンそのものは companionBattle.js / battle2RoadmapComplete.js が
 * 毎回の _render で作り直す。ここではその後ろで表示・非表示を切り替えるだけで、
 * ボタンの生成・クリック処理・戦闘ロジックには触れない。
 * 撃破済みの敵カードを隠すのは css/style.css 側（.tb-enemy-card.dead）。
 */
import { TextBattleScreen } from '../screens/textBattle.js';

const previousStart = TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start = function battleCompactStart(...args) {
  this._companionPanelOpen = false;
  return previousStart.apply(this, args);
};

const previousRender = TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render = function battleCompactRender() {
  previousRender.call(this);
  const hud = document.getElementById('tbCompanionHud');
  if (!hud || !this.engine) return;
  const open = !!this._companionPanelOpen;
  const row = hud.querySelector('.tb-order-row');
  const tactics = document.getElementById('tbBattle2Tactics');
  for (const node of [row, tactics]) if (node) node.style.display = open ? 'flex' : 'none';
  if (!row && !tactics) return;

  // 畳んでいる間も「使える号令が残っているか」「今の作戦」は分かるようにする
  const orders = row ? [...row.querySelectorAll('button')] : [];
  const usable = orders.filter((b) => !b.disabled).length;
  const tacticName = tactics?.querySelector('button[disabled]')?.textContent || '';
  let toggle = hud.querySelector('.tb-companion-toggle');
  if (!toggle) {
    toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'btn-sub tb-companion-toggle';
    toggle.addEventListener('click', () => { this._companionPanelOpen = !this._companionPanelOpen; this._render(); });
    hud.insertBefore(toggle, row || tactics);
  }
  toggle.setAttribute('aria-expanded', String(open));
  toggle.textContent = `${open ? '▾' : '▸'} 号令 ${usable}${tacticName ? ` ／ 作戦：${tacticName}` : ''}`;
};
