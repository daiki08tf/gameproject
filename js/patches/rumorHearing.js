/* ============================================================
   Rumor Hearing — 「噂は聞くもの」体験レイヤ
   ------------------------------------------------------------
   実機プレイテスト: Rumor Network は裏で同期されているのに、
   プレイヤーが噂を「誰かから聞く」体験が一切なかった。

   権威は変えない — world2.discoveries の rumor records は従来どおり
   条件解放される。ここで追加するのは「聞いたか」の薄い膜だけ:
     world2.rumorHeard = { "<recordId>::<entryId>": timestamp }
   （world2 既存rootの additive フィールド。新しいsave rootではない）

   - 未聞の entry はノート・焚き火・酒場では「まだ聞いていない話」
     として伏せられ、焚き火/酒場/住民との会話で実際に耳にする。
   - 聞いた噂だけが狩りの勘（rumorIntelBoostFor）を鋭くする。
   - 世界地図のノードに未聞バッジが乗る（worldMapUi.js）。
   ============================================================ */
import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { bindOverlayDialog } from './overlayA11y.js';

function heardMap() {
  state.data.world2 ??= {};
  return state.data.world2.rumorHeard ||= {};
}

function heardKey(recordId, entryId) {
  return `${recordId}::${entryId}`;
}

state.isRumorEntryHeard = function isRumorEntryHeard(recordId, entryId) {
  return !!heardMap()[heardKey(recordId, entryId)];
};

// 「聞ける」噂行の全量: entries を持つ噂（ch1 Threads / S8 Threads 等、
// 誰かの口から伝わる形のもの）だけが対象。単行の発見記録（entries無し）は
// 自分で見た記録なので「聞く」対象外 — 噂＝人から聞く、発見＝自分で見る。
state.unheardRumorLines = function unheardRumorLines() {
  const heard = heardMap();
  const out = [];
  for (const rec of this.rumorNotebook?.() || []) {
    if (!Array.isArray(rec.entries) || !rec.entries.length) continue;
    for (const e of rec.entries) {
      if (heard[heardKey(rec.id, e.id)]) continue;
      out.push({
        recordId: rec.id,
        entryId: e.id,
        source: e.source || '誰かの話',
        text: e.text || '',
        rumorName: String(rec.name || '噂').replace(/^噂：|^秘密連鎖：/, ''),
        rumorState: rec.rumorState || 'unresolved',
        order: e.order || 0,
      });
    }
  }
  out.sort((a, b) => a.order - b.order);
  return out;
};

state.unheardRumorCount = function unheardRumorCount() {
  return this.unheardRumorLines().length;
};

state.hearRumorEntry = function hearRumorEntry(recordId, entryId) {
  const map = heardMap();
  const key = heardKey(recordId, entryId);
  if (map[key]) return false;
  map[key] = Date.now();
  this.save();
  return true;
};

/* ---- 会話ダイアログ ---- */
const SMALLTALK = [
  '「今日はいい天気だ。狩り日和とは言わんがね」',
  '「街道の向こうは物騒だ。準備は怠るなよ」',
  '「この街にも少しずつ人が集まってきたね」',
  '「噂が聞きたいなら、焚き火か酒場が一番だ」',
  '「あんたの噂は聞いてるよ。期待してる」',
];

function esc(v) {
  return String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/* focusRecordId を渡すとその噂の未聞行だけを再生する。
   speakerName を渡すと住民会話として「その人が伝えた話」に見せる。 */
export function openHearingDialog({ focusRecordId = null, speakerName = null } = {}) {
  document.getElementById('rumorHearingOverlay')?.remove();
  let queue = state.unheardRumorLines();
  if (focusRecordId) queue = queue.filter((l) => l.recordId === focusRecordId);
  let heardCount = 0;

  const overlay = document.createElement('div');
  overlay.id = 'rumorHearingOverlay';
  Object.assign(overlay.style, {
    position: 'fixed', inset: '0', zIndex: '9996',
    background: 'rgba(0,0,0,.78)', display: 'flex',
    alignItems: 'center', justifyContent: 'center', padding: '20px',
  });

  const card = document.createElement('div');
  card.className = 'forge-card rumor-hearing-card';
  Object.assign(card.style, { maxWidth: '520px', width: '100%', textAlign: 'left' });
  overlay.appendChild(card);
  document.body.appendChild(overlay);

  let i = 0;
  const renderLine = () => {
    const line = queue[i];
    if (!line) {
      const small = SMALLTALK[(Math.random() * SMALLTALK.length) | 0];
      card.innerHTML = `
        <div class="forge-card-sub" style="letter-spacing:.15em;opacity:.7;">${esc(speakerName || '街の噂')}</div>
        <div class="forge-card-name" style="margin:8px 0;">${esc(speakerName ? `${speakerName}との会話` : '新しい噂はない')}</div>
        <div class="forge-card-sub" style="line-height:1.8;margin:10px 0;">${esc(small)}</div>
        <button class="forge-card-btn rumor-hearing-close" style="margin-top:14px;width:100%;">別れる</button>`;
      card.querySelector('.rumor-hearing-close')?.addEventListener('click', close);
      return;
    }
    const speaker = speakerName || line.source;
    card.innerHTML = `
      <div class="forge-card-sub" style="letter-spacing:.15em;opacity:.7;">噂話 ${i + 1}/${queue.length}</div>
      <div class="forge-card-name" style="margin:8px 0;">${esc(speaker)}<span class="forge-card-sub" style="margin-left:8px;">${esc(line.rumorName)}</span></div>
      <div class="forge-card-sub rumor-hearing-line" style="line-height:1.9;margin:12px 0;font-size:15px;">${esc(line.text)}</div>
      <button class="forge-card-btn rumor-hearing-next" style="margin-top:10px;width:100%;">${i + 1 < queue.length ? '次の話を聞く' : '聞き終わる'}</button>
      <button class="btn-sub rumor-hearing-close" style="margin-top:8px;width:100%;">今はいい</button>`;
    if (state.hearRumorEntry(line.recordId, line.entryId)) heardCount += 1;
    card.querySelector('.rumor-hearing-next')?.addEventListener('click', () => { Audio_.tap(); i += 1; renderLine(); });
    card.querySelector('.rumor-hearing-close')?.addEventListener('click', () => { Audio_.tap(); close(); });
  };

  const close = () => {
    restoreFocus();
    overlay.remove();
    import('./toastFeedback.js').then((m) => {
      if (heardCount > 0) m.showToast(`噂を ${heardCount} 件、噂ノートに記した`, 2200);
    }).catch(() => {});
  };
  const restoreFocus = bindOverlayDialog(overlay, card, close);
  renderLine();
}

state.openHearingDialog = openHearingDialog;

/* 住民との会話 — 未聞の噂があればその人が「伝聞」として届ける。
   なければ雑談。住民カードの「話す」ボタンから呼ばれる。 */
export function openResidentDialog(resident) {
  openHearingDialog({ speakerName: resident?.name || null });
}
state.openResidentDialog = openResidentDialog;
