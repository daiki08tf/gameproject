/* ============================================================
   Companion System Phase 1
   ------------------------------------------------------------
   Adds save-compatible companion instances, party slot, EXP growth and
   a lightweight management screen. Combat/recruit hooks intentionally
   come in later phases so this PR stays isolated from BattleEngine.
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
  if (changed) state.save();
}
ensureSaveShape();

function randomNature() {
  const ids = Object.keys(COMPANION_NATURES);
  return ids[Math.floor(Math.random() * ids.length)];
}
function randomRarity() {
  const r = Math.random();
  if (r < 0.005) return 'mythic';
  if (r < 0.025) return 'legendary';
  if (r < 0.10) return 'epic';
  if (r < 0.30) return 'rare';
  return 'normal';
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
  const rarity = opts.rarity || randomRarity();
  this.data.companionInstances[id] = {
    speciesId,
    nickname: opts.nickname || null,
    level: Math.max(1, opts.level || 1),
    exp: 0,
    rarity,
    nature: opts.nature || randomNature(),
    talent: opts.talent || talentForRarity(rarity),
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

// Temporary dev-friendly starter so the screen is useful before recruitment
// arrives in Phase 3. Existing saves receive exactly one slime if empty.
if (state.companionList().length === 0) {
  const starter = state.createCompanion('slime', { rarity: 'normal', nature: 'balanced' });
  state.setActiveCompanion(starter);
}

function showScreen(id) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.remove('active'));
  const target = document.getElementById(id);
  if (target) target.classList.add('active');
}

function rarityStars(rarity) {
  return '★'.repeat(Math.max(1, COMPANION_RARITY.indexOf(rarity) + 1));
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
    return `<div class="forge-card companion-card ${active ? 'companion-active' : ''}" data-companion-id="${id}">
      <div class="forge-card-name">${species.icon || '🐾'} ${instance.nickname || species.name} ${active ? '【同行中】' : ''}</div>
      <div class="forge-card-sub">Lv.${instance.level} / ${COMPANION_RARITY_LABEL[instance.rarity]} ${rarityStars(instance.rarity)} / 性格: ${nature.name}</div>
      <div class="forge-card-sub">HP ${stats.hp}　MP ${stats.mp}　ATK ${stats.atk}　DEF ${stats.def}　MAG ${stats.mag}　SPD ${stats.spd}</div>
      <div class="forge-card-sub">EXP ${instance.exp} / ${xpNeed}　特性: ${(species.traits || []).join('・') || 'なし'}</div>
      <div class="confirm-actions" style="margin-top:8px;">
        <button class="btn-sub companion-set-btn" data-id="${id}" ${active ? 'disabled' : ''}>${active ? '同行中' : '同行させる'}</button>
      </div>
    </div>`;
  }).join('');

  content.querySelectorAll('.companion-set-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.setActiveCompanion(btn.dataset.id);
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

// Expose data helpers for later BattleEngine/recruit phases without touching
// the base StateManager yet.
state.companionSpecies = COMPANION_SPECIES;
export { renderCompanionScreen };
