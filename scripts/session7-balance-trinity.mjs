/* ============================================================
   Session 7 — Balance Trinity measurement
   ------------------------------------------------------------
   Four player archetypes against representative targets:
     A NORMAL      — stats at the stage's recLevel, average gear, plain policy
     B BUILDCRAFT  — ~70% stats + authored effect synergies (lifesteal/counter/awaken)
     C TACTICAL    — ~70% stats + guard/item/order/formation policy + 3 companions
     D RAW POWER   — ~135% stats, attack-only
   A/B/C/D all reuse the real BattleEngine; numbers are win-rate / median rounds.
   This is a measurement instrument, not a balance authority.

   node scripts/session7-balance-trinity.mjs [--runs 20]
   ============================================================ */
globalThis.localStorage = { _m: new Map(), getItem(k){return this._m.has(k)?this._m.get(k):null;}, setItem(k,v){this._m.set(k,String(v));}, removeItem(k){this._m.delete(k);} };
const fakeEl = () => ({ appendChild(){}, insertBefore(){}, addEventListener(){}, removeEventListener(){}, classList:{add(){},remove(){},toggle(){},contains:()=>false}, style:{}, dataset:{}, setAttribute(){}, removeAttribute(){}, innerHTML:'', textContent:'', querySelector:()=>null, querySelectorAll:()=>[], remove(){}, closest:()=>null, append(){}, prepend(){} });
globalThis.document = { getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], createElement:fakeEl, createTextNode:()=>({}), addEventListener(){}, body:fakeEl(), head:fakeEl(), documentElement:fakeEl() };
globalThis.window = { addEventListener(){}, dispatchEvent(){}, location:{href:''} };
globalThis.MutationObserver = class { observe(){} disconnect(){} takeRecords(){return[]} };
globalThis.requestAnimationFrame = () => 0;

const ROOT = new URL('..', import.meta.url).pathname;
const PATCHES = ['progressionCore','statusCalculationCore','progression3Core','progression3Combat','progression3Ui','levelRoadmap99999','progression3StoryExpansion','worldTierRuntime','battleRewardAccountingFix','jobCodexUi','inheritanceCore','inheritanceBalanceUi','rune2Core','rune2Special','equipment3Archetypes','weaponInstanceFoundation','equipment3Foundation','equipment3Greater','equipment3Legendary','equipment3Blacksmith','equipment3GearFoundation','options4Fusion','equipment3UniqueGearSafety','equipment3SetBonuses','equipment3SmartLoot','loot3InventoryDecisions','equipment3AbyssEndgame','equipment3DebugSafety','weaponAffixResultVisibility','equipment3GearResultVisibility','combat2ElementAffixes','combat2ElementCore','combat2ElementBuilds','combat2WeaponTechniques','combat2SkillModifiers','combat2SkillModifierUi','combat2DebugSafety','combat3BattleGroups','combat3EnemyAI','combat3Formation','job3SpecializationCore','job3LegacyPassives','jobConstellationRuntime','companionLevelCap','companionResetSafety','companionSynergy','companionBattle','companionRecruitment','codexFoundation','battleIntegration3','battleIntegration3Final','endgameDropContextFix','loot3RealmTargetFarm','legacyRuneRetirement','bountyFoundation','bountyUniqueFoundation','bountyUniqueCombat','uniqueTrialFoundation','loot3RealmChaseRewards','uniqueTrialCombat','uniqueTrialUi','uniqueBranchEffects','secretJobsPhase1','secretJobsPhase2','awakening3Imprints','systemCleanupAwakeningV2','abyss2Pacts','abyss3Challenges','abyssRunBuild','riftKeyCore','denlordLords','fieldAbilities'];
for (const m of PATCHES) { try { await import(`${ROOT}/js/patches/${m}.js`); } catch (e) { console.error('PATCH FAIL', m, e.message.slice(0, 80)); } }

const { state } = await import(`${ROOT}/js/state.js`);
const { BattleEngine } = await import(`${ROOT}/js/battleEngine.js`);
const { findStage } = await import(`${ROOT}/js/data/stages.js`);
const { getItem } = await import(`${ROOT}/js/data/equipment.js`);
const { getCompanionSpecies } = await import(`${ROOT}/js/data/companions.js`);
const { PROGRESSION3_BASE, growthForJob } = await import(`${ROOT}/js/data/progression3.js`);

const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args.set(a.slice(2), process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true);
}
const RUNS = Number(args.get('runs') || 20);
const JOB = 'warrior';

const CH1_GEAR = { weapon: 'wp_sword_e', shield: 'sh_iron_r', head: 'hd_helm_r', body: 'bd_plate_e', accessory: 'ac_charm_e' };
function chapterGearIds(ch) {
  if (ch.num === 1) return Object.values(CH1_GEAR);
  return [`${ch.id}_weapon_epic`, `${ch.id}_shield`, `${ch.id}_head`, `${ch.id}_body`, `${ch.id}_accessory`];
}
function setupPlayer(ch, level) {
  state.data.characterLevel = level;
  state.data.highestCharacterLevel = level;
  state.data.currentJobId = JOB;
  if (!state.data.jobs[JOB]) state.data.jobs[JOB] = { level: 1, exp: 0 };
  state.data.jobs[JOB].level = Math.min(level, 999);
  state.data.mastered = [];
  state.data.reincarnations = 0;
  const g = growthForJob(JOB);
  const totals = { ...PROGRESSION3_BASE };
  for (const k of Object.keys(g)) totals[k] = (totals[k] || 0) + g[k] * (level - 1);
  state.data.characterGrowth = { totals, levelHistory: { [JOB]: level - 1 }, migratedAtLevel: level };
  state.data.inventory = {};
  state.data.weaponEnhance = {};
  state.data.weaponMastery = {};
  for (const id of chapterGearIds(ch)) { const it = getItem(id); if (it?.weaponType) state.data.weaponMastery[it.weaponType] = 9999; }
  state.data.equipped = { weapon: null, shield: null, head: null, body: null, accessory1: null, accessory2: null };
  for (const id of chapterGearIds(ch)) state.addItem(id, id.endsWith('_accessory') ? 2 : 1);
  state.autoEquipBest();
  const w = state.data.equipped.weapon;
  if (w) state.data.weaponEnhance[w] = 5;
  state.data.gold = 999999;
  state.data.manastone = 999;
  state.save();
}

// ---- archetype policies ----
function policyPlain(eng) {
  const target = eng.aliveEnemies[0];
  return { type: 'attack', targetId: target && target.id };
}
function policyNormal(eng) {
  const hpRatio = eng.player.hp / eng.player.maxHp;
  const skills = eng.availableSkills().filter(t => eng._probeTechnique('skill', t.id).ok);
  const dmg = skills.filter(t => t.type === 'damage' || t.type === 'burst');
  const target = eng.aliveEnemies.find(e => e.boss) || eng.aliveEnemies[0];
  if (dmg.length && target && eng.round % 3 === 0) return { type: 'skill', techId: dmg[dmg.length - 1].id, targetId: target.id };
  if (hpRatio < 0.15) return { type: 'guard' };
  return { type: 'attack', targetId: target && target.id };
}
function policyTactical(eng) {
  const hpRatio = eng.player.hp / eng.player.maxHp;
  const items = eng.availableConsumables();
  const hasItem = id => items.find(o => o.id === id);
  // 号令: charge at battle start, brace before telegraphed attacks, protect when hurt
  if (!eng._ordersUsed?.charge && eng.round <= 1) eng.issueCompanionOrder?.('charge');
  if (eng.aliveEnemies.some(e => e.pendingSpecial)) {
    if (!eng._ordersUsed?.brace) eng.issueCompanionOrder?.('brace');
    return { type: 'guard' };
  }
  if (hpRatio < 0.45 && hasItem('item_hiherb')) return { type: 'item', itemId: 'item_hiherb' };
  if (hpRatio < 0.30 && hasItem('item_herb')) return { type: 'item', itemId: 'item_herb' };
  const skills = eng.availableSkills().filter(t => eng._probeTechnique('skill', t.id).ok);
  const dmg = skills.filter(t => t.type === 'damage' || t.type === 'burst');
  const target = eng.aliveEnemies.find(e => e.boss) || eng.aliveEnemies[0];
  if (dmg.length && target) return { type: 'skill', techId: dmg[dmg.length - 1].id, targetId: target.id };
  if (hpRatio < 0.18) return { type: 'guard' };
  return { type: 'attack', targetId: target && target.id };
}

// ---- archetype setup ----
const BUILDCRAFT_EFFECTS = [
  { name: '吸血の加護', trigger: 'onHit', chance: 1.0, kind: 'lifesteal', power: 0.10 },
  { name: '反撃の魂', trigger: 'onHurt', chance: 0.35, kind: 'counter', power: 0.55 },
  { name: '覚醒の力', trigger: 'passive', threshold: 0.3, kind: 'damageBoost', power: 0.22 },
  { name: '灼熱の一撃', trigger: 'onHit', chance: 0.25, kind: 'burnDamage', power: 0.35 },
];

function armArchetype(arch, eng, stats) {
  if (arch === 'B') eng.player._simStatMult = 0.70;
  if (arch === 'C') eng.player._simStatMult = 0.70;
  if (arch === 'D') eng.player._simStatMult = 1.60; // 「20レベル上げて戻ってきた」相当
  const m = eng.player._simStatMult || 1;
  for (const k of ['hp', 'maxHp', 'atk', 'def', 'mag', 'spd', 'mp', 'maxMp']) {
    eng.player[k] = Math.max(1, Math.round(eng.player[k] * m));
  }
  if (arch === 'B') eng.effects = [...eng.effects, ...BUILDCRAFT_EFFECTS];
  if (arch === 'C') {
    // 3-companion party at bond 10, front tank / center / rear caster
    eng.companions = null; // force ensureCompanionBattle to rebuild
    eng._companionBattleReady = false;
  }
  return eng;
}

function installTacticalCompanions(stageRec) {
  // tactical 層は「生きた仲間と隊列」を前提にする。species stub: 前衛タンク・後衛術士
  const roster = ['rock_turtle', 'wolf', 'lesser_spirit'];
  state.data.companionInstances = {};
  state.data.companionParty = [];
  roster.forEach((sp, i) => {
    const id = `sim_${sp}`;
    state.data.companionInstances[id] = { id, speciesId: sp, level: 60, rarity: 'epic', nature: i === 0 ? 'defensive' : 'aggressive' };
    state.data.companionParty.push(id);
  });
  state.companionBond = () => ({ level: 10 });
  const base = Math.max(20, Math.round(stageRec * 0.6));
  state.getCompanion = function (id) {
    const inst = this.data.companionInstances[id];
    if (!inst) return null;
    const species = getCompanionSpecies(inst.speciesId);
    if (!species) return null;
    return { id, species, instance: inst, stats: { hp: base * 9, mp: 60, atk: base, def: Math.round(base * 1.1), mag: Math.round(base * 0.8), spd: Math.round(base * 0.5) } };
  };
  state.activeCompanions = function () { return (this.data.companionParty || []).map(id => this.getCompanion(id)).filter(Boolean); };
  state.activeCompanionIds = function () { return (this.data.companionParty || []).filter(Boolean); };
}
function clearCompanions() {
  state.data.companionInstances = {};
  state.data.companionParty = [];
  delete state.companionBond;
  delete state.activeCompanions;
  delete state.activeCompanionIds;
  delete state.getCompanion;
}

// ---- targets ----
const TARGETS = [
  { label: 'MID boss 22-8', stageId: '22-8', chapterId: 'ch22' },
  { label: 'LATE boss 41-8', stageId: '41-8', chapterId: 'ch41' },
  { label: 'SECRET fh-3', stageId: 'fh-3', chapterId: 'side_forgeheart' },
  { label: 'HIDDEN am-3', stageId: 'am-3', chapterId: 'side_apexmesa' },
  { label: 'END ur-3', stageId: 'ur-3', chapterId: 'side_unrecorded' },
  { label: 'SUPER bt-7', stageId: 'bt-7', chapterId: 'gaiden_beasttrail', superPrestige: true },
];
const ARCHS = [
  { id: 'A', name: 'NORMAL', policy: policyNormal },
  { id: 'B', name: 'BUILDCRAFT', policy: policyNormal },
  { id: 'C', name: 'TACTICAL', policy: policyTactical },
  { id: 'D', name: 'RAW POWER', policy: policyPlain },
];

console.log(`Session 7 balance trinity — ${RUNS} runs/cell`);
console.log('target\tarch\twin%\tmedianR\tnote');
for (const t of TARGETS) {
  const stage = findStage(t.stageId)?.stage;
  if (!stage) { console.log(`${t.label}\t(unresolved)`); continue; }
  const ch = findStage(t.stageId)?.chapter;
  const rec = stage.recLevel;
  for (const a of ARCHS) {
    let wins = 0; const rounds = [];
    for (let i = 0; i < RUNS; i++) {
      // fresh-ish player state per run
      state.data.stageProgress = {};
      state.data.denlordPrestigeClears = {};
      if (t.superPrestige) {
        state.data.stageProgress['bt-7'] = { cleared: true };
        state.data.denlordPrestigeClears = { bt_denlord: 1 };
      }
      setupPlayer(ch, rec);
      if (a.id === 'C') installTacticalCompanions(rec); else clearCompanions();
      let eng;
      try { eng = new BattleEngine(t.stageId); } catch (e) { console.log(`${t.label}\t${a.name}\tERR ${e.message.slice(0, 60)}`); break; }
      armArchetype(a.id, eng);
      let out, guard = 3000;
      do { out = eng.advanceTurn(a.policy(eng)); } while (!out.over && eng.round < 800 && guard-- > 0);
      if (eng.finalResult?.cleared) wins++;
      rounds.push(eng.round);
    }
    rounds.sort((x, y) => x - y);
    const med = rounds[Math.floor(rounds.length / 2)] || 0;
    console.log(`${t.label}\t${a.id}:${a.name}\t${Math.round(wins / RUNS * 100)}%\t${med}r`);
  }
}
