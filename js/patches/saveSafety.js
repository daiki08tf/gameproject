/*
 * Save Safety — セーブの失敗を黙らせない（DBG-16）。表示専用。
 *
 * state.js が持つ実行時フラグ state.saveHealth を読むだけで、セーブデータの
 * 形にもセーブ経路にも触れない。
 *   - 起動時にセーブが壊れていた → 初期化したこと・退避したことを 1 回知らせる
 *   - 保存に失敗した → 失敗が始まった時に 1 回知らせる（成功すれば解除され、再発時にまた 1 回）
 */
import { state } from '../state.js';
import { showToast } from './toastFeedback.js';

let loadNoticeShown = false;
function noticeLoadFailure() {
  if (loadNoticeShown || !state.saveHealth?.loadFailed) return;
  loadNoticeShown = true;
  showToast(state.saveHealth.corruptBackup
    ? 'セーブデータを読めなかったため初期状態で開始しました。元のデータは端末内に退避してあります。'
    : 'セーブデータを読めなかったため初期状態で開始しました。', 6000);
}

if (typeof window !== 'undefined') {
  window.addEventListener('bladevale-save-failed', () => {
    showToast('保存に失敗しました。ブラウザの保存領域を確認してください（進行は保存されていません）。', 6000);
  });
  // タイトルから拠点へ入った最初の操作で知らせる（タイトル画面ではトーストが読まれにくい）
  document.getElementById('titleStartBtn')?.addEventListener('click', () => setTimeout(noticeLoadFailure, 400));
}
