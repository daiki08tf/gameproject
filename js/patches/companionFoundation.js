/* ============================================================
   Companion System Phase 1
   ------------------------------------------------------------
   Adds save-compatible companion instances, party slot, EXP growth and
   a lightweight management screen.
   ============================================================ */
import { state } from '../state.js';
import {
  COMPANION_RARITY,
  COMPANION_RARITY_LABEL,
  COMPANION_NATURES,
  COMPANION_SPECIES,
  getCompanionSpecies,
  companionExpToNext,
  companionStats,
  companionTraitLabel,
} from '../data/companions.js';

const SAVE_FIELDS = {
  companionInstances: {},
  companionParty: [null],
  nextCompanionSeq: 1,
  companionCodex: {},
};

function ensureSaveShape() {
  let changed = false;
  for (const [key, fallback] of Object.entries(SAVE_FIELDS)) {
    if (state.data[key] == null) {
      state.data[key] = Array.isArray(fallback) ? [...fallback] : { ...fallback };
      changed = true;
    }
  }
  if (state.data.starterCompanionGranted == null) {
    state.data.starterCompanionGranted = Object.keys(state.data.companionInstances || {}).length > 0;
    changed = true;
  }
  if (changed) state.save();
}
ensureSaveShape();

function randomNature() {
  const ids = Object.keys(COMPANION_NATURES);
  return ids[Math.floor(Math.random() * ids.length)];
}
function randomRarity(minRarity = null) {
  const r = Math.random();
  let rarity = 'normal';
  if (r < 0.005) rarity = 'mythic';
  else if (r < 0.025) rarity = 'legendary';
  else if (r < 0.10) rarity = 'epic';
  else if (r < 0.30) rarity = 'rare';
  if (minRarity) {
    const rolled = COMPANION_RARITY.indexOf(rarity);
    const floor = COMPANION_RARITY.indexOf(minRarity);
    if (floor >= 0 && rolled < floor) rarity = minRarity;
  }
  return rarity;
}
function talentForRarity(rarity) {
  const idx = Math.max(0, COMPANION_RARITY.indexOf(rarity));
  const min = 0.94 + idx * 0.018;
  const max = 1.06 + idx * 0.028;
  const roll = () => Math.round((min + Math.random() * (max - min)) * 1000) / 1000;
  return { hp: roll(), mp: roll(), atk: roll(), def: roll(), mag: roll(), spd: roll() };
}

state.createCompanion = function createCompanion(speciesId, opts = {}) {
  const species = getCompanionSpecies(speciesId);
  if (!species) return null;
  const id = `${speciesId}#${this.data.nextCompanionSeq++}`;
  const rarity = opts.rarity || randomRarity(opts.minRarity || null);
  this.data.companionInstances[id] = {
    speciesId,
    nickname: opts.nickname || null,
    level: Math.max(1, opts.level || 1),
    exp: 0,
    rarity,
    nature: opts.nature || randomNature(),
    talent: opts.talent || talentForRarity(rarity),
    origin: opts.origin || null,
    createdAt: Date.now(),
  };
  this.data.companionCodex[speciesId] = true;
  this.save();
  return id;
};

state.getCompanion = function getCompanion(instanceId) {
  const inst = this.data.companionInstances[instanceId];
  if (!inst) return null;
  const species = getCompanionSpecies(inst.speciesId);
  if (!species) return null;
  return { id: instanceId, species, instance: inst, stats: companionStats(species, inst) };
};

state.companionList = function companionList() {
  return Object.keys(this.data.companionInstances)
    .map((id) => this.getCompanion(id))
    .filter(Boolean)
    .sort((a, b) => b.instance.level - a.instance.level || a.species.name.localeCompare(b.species.name, 'ja'));
};

state.activeCompanionId = function activeCompanionId() {
  return this.data.companionParty[0] || null;
};
state.activeCompanion = function activeCompanion() {
  return this.getCompanion(this.activeCompanionId());
};
state.setActiveCompanion = function setActiveCompanion(instanceId) {
  if (instanceId != null && !this.data.companionInstances[instanceId]) return false;
  this.data.companionParty[0] = instanceId || null;
  this.save();
  return true;
};

state.gainCompanionExp = function gainCompanionExp(amount, instanceId = this.activeCompanionId()) {
  const inst = instanceId && this.data.companionInstances[instanceId];
  if (!inst || amount <= 0) return { gained: 0, leveledUp: false };
  const gained = Math.max(1, Math.round(amount));
  inst.exp += gained;
  let leveledUp = false;
  while (inst.exp >= companionExpToNext(inst.level)) {
    inst.exp -= companionExpToNext(inst.level);
    inst.level += 1;
    leveledUp = true;
  }
  this.save();
  return { gained, leveledUp, level: inst.level };
};

state.releaseCompanion = function releaseCompanion(instanceId) {
  if (!this.data.companionInstances[instanceId]) return false;
  if (this.activeCompanionId() === instanceId) this.data.companionParty[0] = null;
  delete this.data.companionInstances[instanceId];
  this.save();
  return true;
};

if (!state.data.starterCompanionGranted) {
  if (state.companionList().length === 0) {
    const starter = state.createCompanion('slime', { rarity: 'normal', nature: 'balanced', origin: 'starter' });
    state.setActiveCompanion(starter);
  }
  state.data.starterCompanionGranted = true;
  state.save();
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function rarityStars(rarity) {
  return '★'.repeat(Math.max(1, COMPANION_RARITY.indexOf(rarity) + 1));
}
function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderCompanionScreen() {
  const content = document.getElementById('companionContent');
  if (!content) return;
  const activeId = state.activeCompanionId();
  const list = state.companionList();
  if (!list.length) {
    content.innerHTML = '<p class="hint">まだ仲間はいません。</p>';
    return;
  }
  content.innerHTML = list.map(({ id, species, instance, stats }) => {
    const active = id === activeId;
    const nature = COMPANION_NATURES[instance.nature] || COMPANION_NATURES.balanced;
    const xpNeed = companionExpToNext(instance.level);
    const displayName = escapeHtml(instance.nickname || species.name);
    const traits = (species.traits || []).map(companionTraitLabel).join('・') || 'なし';
    return `<div class="forge-card companion-card ${active ? 'companion-active' : ''}" data-companion-id="${escapeHtml(id)}">
      <div class="forge-card-name">${species.icon || '🐾'} ${displayName} ${active ? '【同行中】' : ''}</div>
      <div class="forge-card-sub">Lv.${instance.level} / ${COMPANION_RARITY_LABEL[instance.rarity]} ${rarityStars(instance.rarity)} / 性格: ${escapeHtml(nature.name)}</div>
      <div class="forge-card-sub">HP ${stats.hp}　MP ${stats.mp}　ATK ${stats.atk}　DEF ${stats.def}　MAG ${stats.mag}　SPD ${stats.spd}</div>
      <div class="forge-card-sub">EXP ${instance.exp} / ${xpNeed}</div>
      <div class="forge-card-sub">特性: ${escapeHtml(traits)}</div>
      <div class="confirm-actions" style="margin-top:8px;">
        <button class="btn-sub companion-set-btn" data-id="${escapeHtml(id)}" ${active ? 'disabled' : ''}>${active ? '同行中' : '同行させる'}</button>
        <button class="btn-sub companion-release-btn" data-id="${escapeHtml(id)}">${active ? '同行解除して帰す' : '帰す'}</button>
      </div>
    </div>`;
  }).join('');

  content.querySelectorAll('.companion-set-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.setActiveCompanion(btn.dataset.id);
      renderCompanionScreen();
    });
  });
  content.querySelectorAll('.companion-release-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const c = state.getCompanion(btn.dataset.id);
      if (!c) return;
      const name = c.instance.nickname || c.species.name;
      const active = state.activeCompanionId() === btn.dataset.id;
      const message = active ? `${name}の同行を解除して帰しますか？` : `${name}を帰しますか？`;
      if (!window.confirm(message)) return;
      state.releaseCompanion(btn.dataset.id);
      renderCompanionScreen();
    });
  });
}

function installCompanionUI() {
  const menu = document.querySelector('.home-menu');
  if (menu && !document.getElementById('goCompanionBtn')) {
    const btn = document.createElement('button');
    btn.id = 'goCompanionBtn';
    btn.className = 'menu-card';
    btn.innerHTML = '<span class="menu-icon">🐾</span><span>仲間</span>';
    menu.appendChild(btn);
    btn.addEventListener('click', () => {
      renderCompanionScreen();
      showScreen('companionScreen');
    });
  }

  if (!document.getElementById('companionScreen')) {
    const section = document.createElement('section');
    section.id = 'companionScreen';
    section.className = 'screen';
    section.innerHTML = `<header class="subbar">
      <button class="btn-back" id="companionBackBtn">←</button>
      <h2>仲間</h2>
    </header>
    <div id="companionContent" class="blacksmith-content"></div>`;
    document.body.insertBefore(section, document.querySelector('.toast'));
    document.getElementById('companionBackBtn').addEventListener('click', () => showScreen('homeScreen'));
  }
}

installCompanionUI();
state.companionSpecies = COMPANION_SPECIES;
export { renderCompanionScreen };
