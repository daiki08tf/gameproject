import { state } from '../state.js';
import { Audio_ } from '../audio.js';
import { RARITY } from '../data/equipment.js';
import { WEAPON_CODEX_ITEMS, BOSS_WEAPON_ITEMS, WEAPON_SERIES } from '../data/weapons.js';

const TYPE_LABELS = {
  sword: '剣', axe: '斧', staff: '杖', bow: '弓',
  dagger: '短剣', knuckle: '拳具', instrument: '楽器', rod: '錫杖',
};
const CODEX_ELEMENT_LABEL = {
  fire: '🔥炎', ice: '❄️氷', lightning: '⚡雷', wind: '🌪️風',
  light: '✨光', dark: '🌑闇', poison: '☠️毒',
};

let weaponCodexActiveTab = 'sword';

export function initWeaponCodexTabs() {
  const row = document.getElementById('weaponCodexTabRow');
  row.innerHTML = '';
  for (const type in TYPE_LABELS) {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.dataset.wtab = type;
    btn.textContent = TYPE_LABELS[type];
    row.appendChild(btn);
  }
  const bossBtn = document.createElement('button');
  bossBtn.className = 'tab-btn';
  bossBtn.dataset.wtab = 'boss';
  bossBtn.textContent = 'Boss固有';
  row.appendChild(bossBtn);

  row.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      Audio_.tap();
      weaponCodexActiveTab = btn.dataset.wtab;
      renderWeaponCodex();
    });
  });
}

export function renderWeaponCodex() {
  document.querySelectorAll('#weaponCodexTabRow .tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.wtab === weaponCodexActiveTab);
  });

  const content = document.getElementById('weaponCodexContent');
  content.innerHTML = '';

  if (weaponCodexActiveTab === 'boss') {
    renderBossTab(content);
    return;
  }

  const items = WEAPON_CODEX_ITEMS.filter((w) => w.weaponType === weaponCodexActiveTab);
  const seenCount = items.filter((w) => state.isWeaponCodexSeen(w.id)).length;

  const header = document.createElement('p');
  header.className = 'hint';
  header.textContent = `${TYPE_LABELS[weaponCodexActiveTab]} ${seenCount} / ${items.length}`;
  content.appendChild(header);

  const order = { normal: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
  const sorted = [...items].sort((a, b) => order[a.rarity] - order[b.rarity]);
  for (const w of sorted) content.appendChild(renderWeaponCard(w));
}

function renderBossTab(content) {
  const seenCount = BOSS_WEAPON_ITEMS.filter((w) => state.isWeaponCodexSeen(w.id)).length;
  const header = document.createElement('p');
  header.className = 'hint';
  header.textContent = `Boss固有武器 ${seenCount} / ${BOSS_WEAPON_ITEMS.length}（各章のボスから低確率でドロップ）`;
  content.appendChild(header);
  for (const w of BOSS_WEAPON_ITEMS) content.appendChild(renderWeaponCard(w));
}

function acquisitionHint(w) {
  if (w.isBossWeapon) return `入手場所：該当章のボスを撃破（低確率）`;
  if (w.abyssMinDepth) return `入手場所：深淵${w.abyssMinDepth}階以降限定`;
  const elementHint = w.element && CODEX_ELEMENT_LABEL[w.element] ? `${CODEX_ELEMENT_LABEL[w.element]}属性のエリアで出やすい` : '全エリア共通';
  return `入手場所：必要Lv.${w.requiredLevel}前後のステージ（${elementHint}）`;
}

function renderWeaponCard(w) {
  const seen = state.isWeaponCodexSeen(w.id);
  const card = document.createElement('div');
  card.className = 'forge-card';
  if (!seen) {
    card.innerHTML = `
      <div class="forge-card-top">
        <div class="forge-card-name">？？？？？</div>
        <div>${RARITY[w.rarity].label}</div>
      </div>
      <div class="forge-card-sub">未入手（一度でも拾うと詳細が表示されます）</div>
    `;
    return card;
  }
  const seriesText = w.series && WEAPON_SERIES[w.series] ? `《${WEAPON_SERIES[w.series].name}》` : '';
  const effectsText = (w.effects || []).map((e) => `✨${e.name}: ${e.desc}`).join('<br>');
  const implicitText = w.implicit && w.implicit.desc ? `【特性】${w.implicit.desc}` : '';
  card.innerHTML = `
    <div class="forge-card-top">
      <div class="forge-card-name" style="color:${RARITY[w.rarity].color}">${w.name}${seriesText}</div>
      <div>${RARITY[w.rarity].label}</div>
    </div>
    <div class="forge-card-sub">
      ${implicitText}${implicitText ? '<br>' : ''}${effectsText}${effectsText ? '<br>' : ''}${acquisitionHint(w)}
    </div>
  `;
  return card;
}
