import { state } from '../state.js';
import { encodeSpell, decodeSpell } from '../spell.js';
import { Audio_ } from '../audio.js';

const SPELL_TARGET_SAVE_KEY = 'bladevale_save_v1';

export function initSpellScreen() {
  document.getElementById('genSpellBtn').addEventListener('click', async () => {
    Audio_.tap();
    const output = document.getElementById('spellOutput');
    output.value = 'じゅもんを かんがえちゅう…';
    output.value = await encodeSpell(state.data);
  });

  document.getElementById('copySpellBtn').addEventListener('click', async () => {
    const output = document.getElementById('spellOutput');
    if (!output.value) return;
    try {
      await navigator.clipboard.writeText(output.value);
      Audio_.pickup();
    } catch (e) {
      output.select();
    }
  });

  let pendingRestore = null;
  const applyBtn = document.getElementById('applySpellBtn');

  applyBtn.addEventListener('click', async () => {
    const input = document.getElementById('spellInput');
    const msg = document.getElementById('spellMessage');
    msg.style.color = '';

    if (pendingRestore) {
      // 2段階目のタップ：実際に上書きして復活する
      try {
        localStorage.setItem(SPELL_TARGET_SAVE_KEY, JSON.stringify(pendingRestore));
      } catch (e) {
        msg.textContent = '保存に失敗しました（ブラウザのストレージが使えない可能性があります）';
        msg.style.color = 'var(--dc-danger-300)';
        pendingRestore = null;
        applyBtn.textContent = 'このじゅもんで復活する';
        return;
      }
      Audio_.jobMastered();
      msg.textContent = 'ふっかつした！';
      msg.style.color = '';
      applyBtn.disabled = true;
      setTimeout(() => location.reload(), 600);
      return;
    }

    msg.textContent = '';
    const result = await decodeSpell(input.value);
    if (result.error) {
      msg.textContent = result.error;
      msg.style.color = 'var(--dc-danger-300)';
      return;
    }
    pendingRestore = result.data;
    applyBtn.textContent = 'もう一度タップで上書きして復活';
    msg.textContent = '現在のセーブデータは上書きされます。よろしければもう一度タップしてください。';
  });

  document.getElementById('spellInput').addEventListener('input', () => {
    pendingRestore = null;
    applyBtn.textContent = 'このじゅもんで復活する';
  });
}

export function renderSpellScreen() {
  document.getElementById('spellOutput').value = '';
  document.getElementById('spellInput').value = '';
  document.getElementById('spellMessage').textContent = '';
}
