import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../data/stages.js';
import { journeyName, latestVeilFragment } from '../data/worldVeil.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

export function renderChapterSelect(onPick) {
  const list = document.getElementById('chapterList');
  list.innerHTML = '';

  const latestLore = latestVeilFragment((id) => state.isStageCleared(id));
  if (latestLore) {
    const record = document.createElement('div');
    record.className = 'stage-card boss';
    record.innerHTML = `
      <div>
        <div class="name">📖 ${latestLore.title}</div>
        <div class="rec">${latestLore.text}</div>
      </div>
    `;
    list.appendChild(record);
  }

  CHAPTERS.forEach((ch, idx) => {
    const unlocked = isChapterUnlocked(idx, (id) => state.isStageCleared(id));
    const bossStage = finalStageOf(ch);
    const allCleared = ch.stages.every((s) => state.isStageCleared(s.id));
    const card = document.createElement('div');
    card.className = 'stage-card' + (!unlocked ? ' locked' : '') + (allCleared ? ' boss' : '');
    card.innerHTML = `
      <div>
        <div class="name">${unlocked ? journeyName(ch) : '🔒 ???'}</div>
        <div class="rec">${unlocked ? `推奨Lv ${ch.stages[0].recLevel}〜${bossStage.recLevel}` : 'ひとつ前の土地の主を倒すと道が開く'}</div>
      </div>
      <div class="cleared">${allCleared ? '★' : ''}</div>
    `;
    if (unlocked) card.addEventListener('click', () => { Audio_.tap(); onPick(idx); });
    list.appendChild(card);
  });

  if ((state.world2Progress?.()||0) >= 5) {
    const fragments=state.world2KeyFragments?.()||0,keys=Object.values(state.data.world2?.keys||{}).reduce((a,b)=>a+(Number(b)||0),0);
    const card=document.createElement('div');
    card.className='stage-card branch';
    card.innerHTML=`<div><div class="name">🔑 境界鍵路</div><div class="rec">鍵片 ${fragments} / 完成した鍵 ${keys}　—　通常の旅路から外れた場所</div></div><div class="cleared">?</div>`;
    card.addEventListener('click',()=>{Audio_.tap();onPick('world2');});
    list.appendChild(card);
  }
}
