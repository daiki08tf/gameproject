import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { ARTIFACTS, getArtifact } from '../data/artifacts.js';

let activeTab = 'reincarnate';
let inheritArmed = false;
let selectedArtifactSlot = null;
const STATS = ['hp','mp','atk','def','mag','spd'];
const LABEL = { hp:'HP', mp:'MP', atk:'ATK', def:'DEF', mag:'MAG', spd:'SPD' };

export function initRebirthTabs() {
  const reincarnate = document.querySelector('#rebirthScreen [data-rtab="reincarnate"]');
  const awaken = document.querySelector('#rebirthScreen [data-rtab="awaken"]');
  const artifact = document.querySelector('#rebirthScreen [data-rtab="artifact"]');
  if (reincarnate) reincarnate.textContent = '継承';
  if (awaken) awaken.textContent = '覚醒';
  if (artifact) artifact.textContent = '秘宝';
  const heading = document.querySelector('#rebirthScreen h2');
  if (heading) heading.textContent = '魂の祭壇';
  document.querySelectorAll('#rebirthScreen .tab-btn').forEach((btn) => btn.addEventListener('click', () => {
    Audio_.tap();
    activeTab = btn.dataset.rtab;
    inheritArmed = false;
    selectedArtifactSlot = null;
    renderRebirth();
  }));
}

export function renderRebirth() {
  document.querySelectorAll('#rebirthScreen .tab-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.rtab === activeTab));
  const content = document.getElementById('rebirthContent');
  content.innerHTML = '';
  if (activeTab === 'awaken') renderAwakening(content);
  else if (activeTab === 'artifact') renderArtifacts(content);
  else renderInheritance(content);
}

function renderInheritance(content) {
  const preview = state.inheritancePreview();
  const unspent = state.inheritanceUnspentPoints();
  const rows = STATS.map((key) => `<div class="status-row"><span>${LABEL[key]}</span><span>${Number(preview.sourceStats[key]||0).toLocaleString()} → <strong>${Number(preview.nextInheritedStats[key]||0).toLocaleString()}</strong></span></div>`).join('');
  const panel = document.createElement('div');
  panel.className = 'rebirth-panel';
  panel.innerHTML = `
    <div class="section-heading">継承 — Character成長の周回</div>
    <p class="sub">Character LvをLv.1へ戻し、育てた基礎能力の一部を次の周回へ継承します。Job Lv・MASTER・装備・仲間・Rune・図鑑・進行・覚醒Rankは維持されます。</p>
    <p class="sub">今回の継承率：<strong>${Math.round(preview.ratePct*1000)/1000}%</strong> ／ 獲得BP：<strong>${preview.bonusPoints.toLocaleString()} pt</strong></p>
    <div class="status-grid">${rows}</div>
    <button class="btn-main" id="doInheritanceBtn">${inheritArmed ? '本当に継承する' : '継承する'}</button>
    ${inheritArmed ? '<button class="btn-sub" id="cancelInheritanceBtn" style="width:100%;margin-top:8px;">やめる</button>' : ''}
  `;
  content.appendChild(panel);
  panel.querySelector('#doInheritanceBtn').addEventListener('click', () => {
    if (!inheritArmed) { inheritArmed = true; renderRebirth(); return; }
    state.performInheritance(); Audio_.jobMastered(); inheritArmed = false; renderRebirth();
  });
  panel.querySelector('#cancelInheritanceBtn')?.addEventListener('click', () => { inheritArmed = false; renderRebirth(); });

  const allocation = document.createElement('div');
  allocation.innerHTML = `<div class="section-heading">継承BP — 基礎能力への投資</div>
    <div class="forge-card"><div class="forge-card-top"><div class="forge-card-name">未使用BP</div><strong>${unspent.toLocaleString()} pt</strong></div><button class="btn-sub" id="resetInheritanceBtn" style="width:100%;margin-top:8px;">振り直す</button></div>
    ${STATS.map((key) => `<div class="forge-card" data-inherit-stat="${key}"><div class="forge-card-top"><div class="forge-card-name">${LABEL[key]}</div><strong>+${Number(state.data.inheritanceAllocated?.[key]||0).toLocaleString()}</strong></div><div class="inheritance-buttons"><button class="btn-sub" data-add="1">+1</button><button class="btn-sub" data-add="10">+10</button><button class="btn-sub" data-add="100">+100</button><button class="btn-sub" data-add="max">MAX</button></div></div>`).join('')}`;
  content.appendChild(allocation);
  allocation.querySelector('#resetInheritanceBtn').addEventListener('click', () => { state.resetInheritanceAllocation(); Audio_.tap(); renderRebirth(); });
  allocation.querySelectorAll('[data-inherit-stat]').forEach((row) => row.querySelectorAll('[data-add]').forEach((btn) => btn.addEventListener('click', () => {
    const available = state.inheritanceUnspentPoints();
    const amount = btn.dataset.add === 'max' ? available : Math.min(available, Number(btn.dataset.add));
    if (amount > 0 && state.allocateInheritancePoints(row.dataset.inheritStat, amount)) Audio_.pickup();
    renderRebirth();
  })));
}

function renderAwakening(content) {
  const rank = state.awakeningV2Rank();
  const next = state.awakeningV2Progress(rank + 1);
  const panel = document.createElement('div');
  panel.className = 'rebirth-panel';
  panel.innerHTML = `
    <div class="rebirth-count">覚醒Rank ${rank}</div>
    <div class="rebirth-bonus">Awakening 2.0</div>
    <p class="sub">覚醒はもうレベルリセットではありません。ゲーム内で積み上げた到達実績によって、上位の遊び方を解放するシステムです。</p>
    <p class="sub">Character / Job / 継承 / Rune / Codex / 仲間などの成長は一切失いません。</p>`;
  content.appendChild(panel);

  for (const def of state.awakeningV2Ranks) {
    const progress = state.awakeningV2Progress(def.rank);
    const unlocked = rank >= def.rank;
    const current = def.rank === rank + 1;
    const card = document.createElement('div');
    card.className = 'forge-card';
    card.innerHTML = `
      <div class="forge-card-top"><div class="forge-card-name">${def.name}</div><strong>${unlocked ? '★解放済み' : current ? 'NEXT' : 'LOCK'}</strong></div>
      <div class="forge-card-sub">${def.description}</div>
      <div class="forge-card-sub">${progress.checks.map((c) => `${c.met ? '✅' : '⬜'} ${c.label}`).join('<br>')}</div>
      <div class="forge-card-sub"><strong>解放：</strong>${def.unlocks.join(' / ')}</div>
      ${current ? `<button class="forge-card-btn" id="claimAwakeningBtn" ${progress.met ? '' : 'disabled'}>覚醒Rank ${def.rank} を解放する</button>` : ''}`;
    content.appendChild(card);
    card.querySelector('#claimAwakeningBtn')?.addEventListener('click', () => {
      if (state.claimAwakeningV2()) { Audio_.jobMastered(); renderRebirth(); }
    });
  }

  if (!next.def) {
    const done = document.createElement('p'); done.className = 'hint'; done.textContent = '現在実装されている覚醒Rankはすべて解放済みです。'; content.appendChild(done);
  }
}

function renderArtifacts(content) {
  const rank = state.awakeningV2Rank();
  const slotCount = state.artifactSlotCount();
  const head = document.createElement('div');
  head.className = 'forge-card';
  head.innerHTML = `<div class="forge-card-top"><div class="forge-card-name">秘宝 / Relic</div><strong>覚醒Rank ${rank}</strong></div>
    <div class="forge-card-sub">秘宝はビルドルールを変えるパーツ。Rank1/2/3でスロットが1つずつ解放され、RelicはRank3から解放可能になります。</div>
    <div class="rune-slots" id="artifactSlotsRow"></div>`;
  content.appendChild(head);
  const row = head.querySelector('#artifactSlotsRow');
  for (let i=0;i<3;i++) {
    const unlocked = i < slotCount;
    const id = state.data.equippedArtifacts?.[i];
    const a = id ? getArtifact(id) : null;
    const slot = document.createElement('div');
    slot.className = 'rune-slot' + (a ? ' filled' : '') + (!unlocked ? ' locked' : '');
    slot.textContent = !unlocked ? '🔒' : a ? '✨' : '+';
    slot.title = !unlocked ? `覚醒Rank ${i+1}で解放` : (a?.name || '空きスロット');
    if (unlocked) slot.addEventListener('click', () => { selectedArtifactSlot = selectedArtifactSlot === i ? null : i; Audio_.tap(); renderRebirth(); });
    row.appendChild(slot);
  }

  if (selectedArtifactSlot !== null && selectedArtifactSlot < slotCount) renderArtifactPicker(content, selectedArtifactSlot);

  const heading = document.createElement('div'); heading.className='section-heading'; heading.textContent='秘宝の解放'; content.appendChild(heading);
  for (const a of ARTIFACTS) {
    const unlocked = state.isArtifactUnlocked(a.id);
    const isRelic = !!a.kind;
    const gateOk = !isRelic ? rank >= 1 : rank >= 3;
    const cost = state.artifactUnlockCostV2();
    const card = document.createElement('div'); card.className='forge-card';
    card.innerHTML = `<div class="forge-card-top"><div class="forge-card-name">${a.name}</div><strong>${unlocked ? '★解放済み' : isRelic ? 'Relic' : 'Artifact'}</strong></div>
      <div class="forge-card-sub">${a.desc}</div>
      ${unlocked ? '' : !gateOk ? `<div class="forge-card-sub">🔒 覚醒Rank ${isRelic ? 3 : 1}で解放可能</div>` : `<button class="forge-card-btn" ${state.canUnlockArtifact(a.id) ? '' : 'disabled'}>解放する（💰${cost.gold.toLocaleString()} + 💎${cost.manastone}）</button>`}`;
    card.querySelector('button')?.addEventListener('click', () => { if (state.unlockArtifact(a.id)) { Audio_.pickup(); renderRebirth(); } });
    content.appendChild(card);
  }
}

function renderArtifactPicker(content, slotIndex) {
  const picker = document.createElement('div'); picker.className='forge-card';
  const currentId = state.data.equippedArtifacts?.[slotIndex];
  let html = `<div class="forge-card-top"><div class="forge-card-name">スロット${slotIndex+1}</div></div>`;
  if (currentId) html += `<div class="pick-row"><div>${getArtifact(currentId)?.name || currentId}</div><button data-unset>外す</button></div>`;
  for (const id of state.data.unlockedArtifacts || []) {
    if (id === currentId) continue;
    const a = getArtifact(id); if (!a) continue;
    html += `<div class="pick-row" data-set="${id}"><div><div class="item-name">${a.name}</div><div class="item-stats">${a.desc}</div></div><button>セット</button></div>`;
  }
  picker.innerHTML = html;
  picker.querySelector('[data-unset]')?.addEventListener('click', () => { state.equipArtifact(slotIndex, null); Audio_.tap(); renderRebirth(); });
  picker.querySelectorAll('[data-set]').forEach((el) => el.querySelector('button').addEventListener('click', () => { state.equipArtifact(slotIndex, el.dataset.set); selectedArtifactSlot=null; Audio_.pickup(); renderRebirth(); }));
  content.appendChild(picker);
}
