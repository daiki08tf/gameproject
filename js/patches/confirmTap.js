/*
 * confirmTap — 取り返しのつかない操作のための「2回押しで確定」。
 *
 * window.confirm() は iOS の埋め込みブラウザ／ホーム画面追加の起動で
 * 表示されない・即 false を返す環境があり（PR #408 で Option Fusion から
 * 外したのと同じ理由）、放流のような不可逆操作が「黙って何も起きない」か
 * 「黙って通る」かのどちらかになり得た。
 *
 * 1回目のタップ：ボタン自身を「もう一度押すと確定」に変え、内容をトーストで示す。
 * 2回目のタップ（ARM_MS 以内）：true を返す。時間切れなら元の表示に戻る。
 * 状態はボタン要素にだけ持つので、画面が再描画されれば自然に解除される。
 */
import { showToast } from './toastFeedback.js';

const ARM_MS = 4000;

export function confirmTap(button, message) {
  if (!button) return false;
  if (button.dataset.confirmArmed === 'true') {
    disarm(button);
    return true;
  }
  button.dataset.confirmArmed = 'true';
  button.dataset.confirmLabel = button.textContent;
  button.textContent = 'もう一度押すと確定';
  button.classList.add('confirm-armed');
  if (message) showToast(message, 2600);
  setTimeout(() => { if (button.isConnected && button.dataset.confirmArmed === 'true') disarm(button); }, ARM_MS);
  return false;
}

function disarm(button) {
  if (button.dataset.confirmLabel != null) button.textContent = button.dataset.confirmLabel;
  delete button.dataset.confirmArmed;
  delete button.dataset.confirmLabel;
  button.classList.remove('confirm-armed');
}
