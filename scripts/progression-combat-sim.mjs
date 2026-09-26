/* ============================================================
   Blade Vale — progression & combat pacing measurement tool
   ------------------------------------------------------------
   A measuring instrument, not a playtest judge. It answers:
   "at each chapter, how many rounds does a representative build
   need to kill each enemy type?" — analytically, deterministically,
   by reusing the real BattleEngine internals (mitigation, hits/round,
   damage buckets) instead of reimplementing them.

   Usage:
     node scripts/progression-combat-sim.mjs              # analytic table
     node scripts/progression-combat-sim.mjs --play       # full headless playthrough
     node scripts/progression-combat-sim.mjs --from 9 --to 15
     node scripts/progression-combat-sim.mjs --job warrior --gear rare
   ============================================================ */

globalThis.localStorage = {
  _m: new Map(),
  getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
  setItem(k, v) { this._m.set(k, String(v)); },
  removeItem(k) { this._m.delete(k); },
};
const fakeEl = () => ({ appendChild(){}, insertBefore(){}, addEventListener(){}, removeEventListener(){}, classList:{add(){},remove(){},toggle(){},contains:()=>false}, style:{}, dataset:{}, setAttribute(){}, removeAttribute(){}, innerHTML:'', textContent:'', querySelector:()=>null, querySelectorAll:()=>[], remove(){}, closest:()=>null, append(){}, prepend(){} });
globalThis.document = { getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], createElement:fakeEl, createTextNode:()=>({}), addEventListener(){}, body:fakeEl(), head:fakeEl(), documentElement:fakeEl() };
globalThis.window = { addEventListener(){}, dispatchEvent(){}, location:{href:''} };
globalThis.MutationObserver = class { observe(){} disconnect(){} takeRecords(){return[]} };
globalThis.requestAnimationFrame = () => 0;

const ROOT = new URL('..', import.meta.url).pathname;
const PATCHES = ['progressionCore','statusCalculationCore','progression3Core','progression3Combat','progression3Ui','levelRoadmap99999','progression3StoryExpansion','worldTierRuntime','battleRewardAccountingFix','jobCodexUi','inheritanceCore','inheritanceBalanceUi','rune2Core','rune2Special','equipment3Archetypes','weaponInstanceFoundation','equipment3Foundation','equipment3Greater','equipment3Legendary','equipment3Blacksmith','equipment3GearFoundation','options4Fusion','equipment3UniqueGearSafety','equipment3SetBonuses','equipment3SmartLoot','loot3InventoryDecisions','equipment3AbyssEndgame','equipment3DebugSafety','weaponAffixResultVisibility','equipment3GearResultVisibility','combat2ElementAffixes','combat2ElementCore','combat2ElementBuilds','combat2WeaponTechniques','combat2SkillModifiers','combat2SkillModifierUi','combat2DebugSafety','combat3BattleGroups','combat3EnemyAI','combat3Formation','job3SpecializationCore','job3LegacyPassives','jobConstellationRuntime','companionLevelCap','companionResetSafety','companionSynergy','companionBattle','companionRecruitment','codexFoundation','battleIntegration3','battleIntegration3Final','endgameDropContextFix','loot3RealmTargetFarm','legacyRuneRetirement','bountyFoundation','bountyUniqueFoundation','bountyUniqueCombat','uniqueTrialFoundation','loot3RealmChaseRewards','uniqueTrialCombat','uniqueTrialUi','uniqueBranchEffects','secretJobsPhase1','secretJobsPhase2','awakening3Imprints','systemCleanupAwakeningV2','abyss2Pacts','abyss3Challenges','abyssRunBuild','riftKeyCore'];
for (const m of PATCHES) { try { await import(`${ROOT}/js/patches/${m}.js`); } catch (e) { console.error('PATCH FAIL', m, e.message.slice(0, 80)); } }

const { state } = await import(`${ROOT}/js/state.js`);
const { BattleEngine } = await import(`${ROOT}/js/battleEngine.js`);
const { CHAPTERS } = await import(`${ROOT}/js/data/stages.js`);
const { getItem, WEAPON_TYPES } = await import(`${ROOT}/js/data/equipment.js`);
const { DAMAGE_BUCKET, CAPS_LAYER } = await import(`${ROOT}/js/data/balance.js`);
const { PROGRESSION3_BASE, growthForJob } = await import(`${ROOT}/js/data/progression3.js`);

// ---- args ----
const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args.set(a.slice(2), process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true);
}
const FROM = Number(args.get('from') || 1);
const TO = Number(args.get('to') || 36);
const PLAY = !!args.get('play');
const JOB = args.get('job') || 'warrior';
const ENHANCE = Number(args.get('enhance') || 5);

// Representative gear for chapter n: that chapter's epic weapon + rare set.
// Ch1 predates the chN_ naming scheme, so map its authored items directly.
const CH1_GEAR = { weapon: 'wp_sword_e', shield: 'sh_iron_r', head: 'hd_helm_r', body: 'bd_plate_e', accessory: 'ac_charm_e' };
function chapterGearIds(ch) {
  if (ch.num === 1) return [CH1_GEAR.weapon, CH1_GEAR.shield, CH1_GEAR.head, CH1_GEAR.body, CH1_GEAR.accessory];
  return [`${ch.id}_weapon_epic`, `${ch.id}_shield`, `${ch.id}_head`, `${ch.id}_body`, `${ch.id}_accessory`];
}

function setupPlayer(ch, level) {
  // reset persistent fields that matter for combat math
  state.data.characterLevel = level;
  state.data.highestCharacterLevel = level;
  state.data.currentJobId = JOB;
  if (!state.data.jobs[JOB]) state.data.jobs[JOB] = { level: 1, exp: 0 };
  state.data.jobs[JOB].level = Math.min(level, 999);
  state.data.mastered = [];
  state.data.reincarnations = 0;
  // Progression 3.0: stats come from recorded characterGrowth, not raw level.
  // Simulate a player who gained all levels on this job.
  const g = growthForJob(JOB);
  const totals = { ...PROGRESSION3_BASE };
  for (const k of Object.keys(g)) totals[k] = (totals[k] || 0) + g[k] * (level - 1);
  state.data.characterGrowth = { totals, levelHistory: { [JOB]: level - 1 }, migratedAtLevel: level };
  state.data.inventory = {};
  state.data.weaponEnhance = {};
  // weapon mastery so the chapter's weapon type is equippable by this job
  state.data.weaponMastery = {};
  for (const id of chapterGearIds(ch)) {
    const it = getItem(id);
    if (it?.weaponType) state.data.weaponMastery[it.weaponType] = 9999;
  }
  state.data.equipped = { weapon: null, shield: null, head: null, body: null, accessory1: null, accessory2: null };
  for (const id of chapterGearIds(ch)) state.addItem(id, id.endsWith('_accessory') ? 2 : 1);
  state.autoEquipBest();
  const w = state.data.equipped.weapon;
  if (w) state.data.weaponEnhance[w] = ENHANCE;
  state.save();
}

// Deterministic TTK estimate for one enemy, reusing engine internals.
// E[dmg/hit] = base(non-crit) × (1 + critPct/100 × (CRIT_MULT×boost − 1)).
function measureEnemy(eng, type, chapterNum) {
  const enemy = eng._spawnEnemy(type);
  if (!enemy) return null;
  // --ehpr/--edefr/--ebossr: simulate replacing ENEMY_SCALING late rates
  // (post-pivot exponents) with new values, without editing data files.
  const n = chapterNum || 1;
  if (n > 5) {
    const hpR = Number(args.get('ehpr') || 1.28), defR = Number(args.get('edefr') || 1.22);
    const bossR = Number(args.get('ebossr') || 1.22);
    const ratio = enemy.boss ? bossR / 1.22 : hpR / 1.28;
    enemy.hp = Math.max(1, Math.round(enemy.hp * Math.pow(ratio, n - 5)));
    enemy.maxHp = enemy.hp;
    enemy.def = Math.max(0, Math.round(enemy.def * Math.pow(defR / 1.22, n - 5)));
  }
  const atkValue = eng._effectiveAtk() * eng._mainDmgMult('normal');
  const { damage: nonCrit } = eng.calculateDamage(atkValue, enemy, { critPct: 0 });
  const critPct = eng._effectiveCritPct ? eng._effectiveCritPct() : eng.player.critPct;
  const critUplift = 1 + (critPct / 100) * (DAMAGE_BUCKET.CRIT_MULTIPLIER * (eng._critDamageBoostMult?.() || 1) - 1);
  const hits = eng._playerHitsPerRound();
  const effDef = eng._effectiveEnemyStat(enemy, 'def') * (1 - (eng._effectiveArmorPen?.() || 0));
  const mitigation = Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, effDef / (effDef + DAMAGE_BUCKET.MITIGATION_K));
  const dpr = nonCrit * critUplift * hits;
  const effHp = enemy.hp; // mitigation already inside nonCrit via calculateDamage
  const rounds = effHp / Math.max(1, dpr);
  // incoming: enemy attack → player
  const toPlayer = eng._enemyAttackDamage(enemy.atk, {});
  const playerHits = eng.player.hp / Math.max(1, toPlayer);
  return {
    name: enemy.name, type, hp: enemy.hp, def: enemy.def, mit: mitigation,
    boss: !!enemy.boss, dmgHit: Math.round(nonCrit), hits, dpr: Math.round(dpr),
    ttk: Math.round(rounds * 10) / 10, enemyAtk: enemy.atk, toPlayer, playerHits: Math.round(playerHits * 10) / 10,
  };
}

function stageRounds(eng, stage, chapterNum) {
  // Sequential-target estimate: Σ (count × per-enemy TTK) — ignores AoE and
  // skill cooldowns, so it is a conservative upper bound for trash waves.
  let total = 0;
  const parts = [];
  for (const w of stage.waves) {
    const m = measureEnemy(eng, w.type, chapterNum);
    if (!m) continue;
    total += m.ttk * w.count;
    parts.push(`${m.name}×${w.count}:${Math.round(m.ttk * w.count)}r`);
  }
  return { total: Math.round(total), parts };
}

if (!PLAY) {
  console.log(`analytic pacing — job=${JOB} enhance=+${ENHANCE} (weapon=epic, armor=rare of that chapter)`);
  console.log('ch\trecLv\tpAtk\tpHP\tpDef\tnormal r/1\ttank r/1\tboss r/1\tbossHP\tstage est.\tnotes');
  for (const ch of CHAPTERS) {
    if (ch.num < FROM || ch.num > TO) continue;
    const bossStage = ch.stages.find((s) => s.boss) || ch.stages.at(-1);
    const level = bossStage.recLevel;
    setupPlayer(ch, level);
    const stats = state.getStats();
    const eng = new BattleEngine(bossStage.id);
    // --atkboost <rate>: multiply player atk by rate^(n-5) to test a
    // hypothetical compounding player-power layer without editing data.
    const atkBoost = Number(args.get('atkboost') || 0);
    if (atkBoost && ch.num > 5) eng.player.atk = Math.round(eng.player.atk * Math.pow(atkBoost, ch.num - 5));
    // --gearr/--gdefr: simulate gear stats compounding post-pivot instead of
    // linear chapterMult. equipment-layer stats × (2.4*R^(n-5))/chapterMult(n).
    const gearR = Number(args.get('gearr') || 0), gdefR = Number(args.get('gdefr') || 0);
    if (ch.num > 5 && (gearR || gdefR)) {
      const cm = 1 + (ch.num - 1) * 0.35;
      const bd = (s) => state.getStatBreakdown ? state.getStatBreakdown(s) : null;
      const rescale = (stat, rate) => {
        const b = bd(stat);
        if (!b || !rate) return;
        const ratio = (2.4 * Math.pow(rate, ch.num - 5)) / cm;
        const cur = eng.player[stat];
        // eng.player already includes gear; approximate: gear share × ratio
        const gearShare = Math.max(0, Math.min(1, (b.equipment || 0) / Math.max(1, b.base || 1)));
        eng.player[stat] = Math.round(cur * ((1 - gearShare) + gearShare * ratio) * (gearShare > 0 ? 1 : 1));
      };
      rescale('atk', gearR); rescale('mag', gearR); rescale('spd', gearR);
      rescale('def', gdefR); rescale('hp', gdefR);
      if (gdefR) eng.player.maxHp = eng.player.hp;
    }
    const rows = { normal: null, tank: null, boss: null };
    const seen = new Set();
    for (const st of ch.stages) {
      if (st.branch || st.bounty) continue;
      for (const w of st.waves) {
        if (seen.has(w.type)) continue;
        seen.add(w.type);
        const m = measureEnemy(eng, w.type, ch.num);
        if (!m) continue;
        if (m.boss) { if (!rows.boss) rows.boss = m; }
        else if (w.type.includes('tank')) rows.tank = rows.tank || m;
        else rows.normal = rows.normal || m;
      }
    }
    const est = stageRounds(eng, bossStage, ch.num);
    const fmt = (m) => (m ? m.ttk : '-');
    // atk the player would need for boss TTK=40r (basic attacks only)
    let needAtk = '-';
    if (rows.boss) {
      const effAtk = eng._effectiveAtk() * eng._mainDmgMult('normal');
      needAtk = Math.round(effAtk * rows.boss.ttk / 40);
    }
    console.log([
      ch.num, level, stats.atk, stats.hp, stats.def,
      fmt(rows.normal), fmt(rows.tank), fmt(rows.boss),
      rows.boss ? rows.boss.hp : '-', `${est.total}r`, needAtk,
      est.parts.join(' '),
    ].join('\t'));
  }
  process.exit(0);
}

// ---- full playthrough mode (adapts the /tmp/bv-sim3 harness) ----
function pickCommand(eng) {
  const hpRatio = eng.player.hp / eng.player.maxHp;
  const skills = eng.availableSkills().filter((t) => eng._probeTechnique('skill', t.id).ok);
  const spells = eng.availableSpells().filter((t) => eng._probeTechnique('spell', t.id).ok);
  const heal = spells.find((t) => t.type === 'heal');
  const boss = eng.aliveEnemies.some((e) => e.boss);
  const items = eng.availableConsumables();
  const hasItem = (id) => items.find((o) => o.id === id);
  if (boss && !eng._warcryUsed && hasItem('item_warcry')) { eng._warcryUsed = true; return { type: 'item', itemId: 'item_warcry' }; }
  if (heal && hpRatio < 0.5) return { type: 'spell', techId: heal.id };
  if (hpRatio < 0.35 && hasItem('item_hiherb')) return { type: 'item', itemId: 'item_hiherb' };
  if (hpRatio < 0.30 && hasItem('item_herb')) return { type: 'item', itemId: 'item_herb' };
  const dmg = [...skills, ...spells].filter((t) => t.type === 'damage' || t.type === 'burst');
  if (eng.aliveEnemies.some((e) => e.pendingSpecial)) return { type: 'guard' };
  const target = eng.aliveEnemies.find((e) => e.boss) || eng.aliveEnemies[0];
  if (dmg.length && target) {
    const t = dmg[dmg.length - 1];
    return { type: skills.includes(t) ? 'skill' : 'spell', techId: t.id, targetId: target.id };
  }
  if (hpRatio < 0.15) return { type: 'guard' };
  return { type: 'attack', targetId: target && target.id };
}

function playStage(stageId) {
  let eng;
  try { eng = new BattleEngine(stageId); } catch (e) { return { cleared: false, rounds: 0, error: e.message }; }
  let out;
  do { out = eng.advanceTurn(pickCommand(eng)); } while (!out.over && eng.round < 800);
  return { cleared: eng.finalResult?.cleared, rounds: eng.round };
}

function maintain() {
  state.autoEquipBest();
  for (const [id, qty] of Object.entries({ ...state.data.inventory })) {
    const item = getItem(id);
    if (!item || state.isItemLocked?.(id)) continue;
    state.dismantleItem(id, qty);
  }
  const w = state.data.equipped.weapon;
  if (w) {
    for (let i = 0; i < 10 && state.canEnhanceWeapon(w, false); i++) state.enhanceWeapon(w, false);
    for (let i = 0; i < 10 && state.canEnhanceWeapon(w, true); i++) state.enhanceWeapon(w, true);
  }
  while (state.consumableCount('item_herb') < 4 && state.canBuyConsumable('item_herb')) state.buyConsumable('item_herb');
  if (state.data.gold > 400 && state.consumableCount('item_hiherb') < 3) state.buyConsumable('item_hiherb');
  if (state.data.gold > 600 && state.consumableCount('item_warcry') < 2) state.buyConsumable('item_warcry');
  if (state.data.gold > 800 && state.consumableCount('item_bell') < 2) state.buyConsumable('item_bell');
}

console.log('playthrough — full patch chain');
const clearedStages = [];
let deaths = 0;
const rows = [];
outer:
for (const ch of CHAPTERS) {
  if (ch.num < FROM || ch.num > TO) continue;
  for (const stage of ch.stages) {
    if (stage.branch || stage.bounty) continue;
    let r, attempts = 0;
    do {
      attempts++;
      maintain();
      r = playStage(stage.id);
      if (!r.cleared) {
        deaths++;
        const last = clearedStages[clearedStages.length - 1];
        for (let g = 0; g < 2 && last; g++) { const gr = playStage(last); if (!gr.cleared) deaths++; }
      }
    } while (!r.cleared && attempts <= 6);
    rows.push(`${stage.id}\trec${stage.recLevel}\tlv${state.currentLevel}\t${r.cleared ? 'win' : 'LOSS'}\ttries${attempts}\t${r.rounds}r`);
    if (!r.cleared) { console.log(`STUCK AT ${stage.id}`); break outer; }
    clearedStages.push(stage.id);
  }
}
for (const r of rows) console.log(r);
console.log(`deaths=${deaths} finalLv=${state.currentLevel}`);
