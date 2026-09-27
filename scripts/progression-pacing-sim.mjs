/* ============================================================
   Blade Vale — pacing & economy measurement instrument
   ------------------------------------------------------------
   A realistic-ish playthrough driver built on the REAL BattleEngine
   and the full patch chain. It models a "normal" player:

     - attempts the next unlocked stage
     - on a loss, farms the best cleared stage (the stage with the
       highest recLevel already beaten — same-stage farming) a bounded
       number of runs, maintaining gear/consumables between runs
     - retries until clear or the farming budget is exhausted

   It reports per stage: first-attempt result, farm runs needed,
   levels gained, drops, settlement materials, and per-run income —
   so a pacing change can be measured before/after, not guessed.

   Usage:
     node scripts/progression-pacing-sim.mjs                # ch1..ch5
     node scripts/progression-pacing-sim.mjs --to 10        # further
     node scripts/progression-pacing-sim.mjs --farm 8       # farm budget per loss
     node scripts/progression-pacing-sim.mjs --seed 7       # RNG seed
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

/* deterministic RNG — reproducible before/after comparisons */
const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args.set(a.slice(2), process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true);
}
let rngState = (Number(args.get('seed') || 42) >>> 0) || 42;
Math.random = () => { rngState = (rngState * 1664525 + 1013904223) >>> 0; return rngState / 4294967296; };

const ROOT = new URL('..', import.meta.url).pathname;
const PATCHES = ['progressionCore','statusCalculationCore','progression3Core','progression3Combat','progression3Ui','levelRoadmap99999','progression3StoryExpansion','worldTierRuntime','battleRewardAccountingFix','jobCodexUi','inheritanceCore','inheritanceBalanceUi','rune2Core','rune2Special','equipment3Archetypes','weaponInstanceFoundation','equipment3Foundation','equipment3Greater','equipment3Legendary','equipment3Blacksmith','equipment3GearFoundation','options4Fusion','equipment3UniqueGearSafety','equipment3SetBonuses','equipment3SmartLoot','loot3InventoryDecisions','equipment3AbyssEndgame','equipment3DebugSafety','weaponAffixResultVisibility','equipment3GearResultVisibility','combat2ElementAffixes','combat2ElementCore','combat2ElementBuilds','combat2WeaponTechniques','combat2SkillModifiers','combat2SkillModifierUi','combat2DebugSafety','combat3BattleGroups','combat3EnemyAI','combat3Formation','job3SpecializationCore','job3LegacyPassives','jobConstellationRuntime','companionLevelCap','companionResetSafety','companionSynergy','companionBattle','companionRecruitment','codexFoundation','battleIntegration3','battleIntegration3Final','endgameDropContextFix','loot3RealmTargetFarm','legacyRuneRetirement','bountyFoundation','bountyUniqueFoundation','bountyUniqueCombat','uniqueTrialFoundation','loot3RealmChaseRewards','uniqueTrialCombat','uniqueTrialUi','uniqueBranchEffects','secretJobsPhase1','secretJobsPhase2','awakening3Imprints','systemCleanupAwakeningV2','abyss2Pacts','abyss3Challenges','abyssRunBuild','riftKeyCore','monsterRanchCore','monsterRanch2Facilities','settlementCore','session8GrowthCurve','speciesMastery','companionFoundation','pacingWalls','pacingMaterials'];
for (const m of PATCHES) { try { await import(`${ROOT}/js/patches/${m}.js`); } catch (e) { console.error('PATCH FAIL', m, e.message.slice(0, 90)); } }

const { state } = await import(`${ROOT}/js/state.js`);
const { BattleEngine } = await import(`${ROOT}/js/battleEngine.js`);
const { CHAPTERS } = await import(`${ROOT}/js/data/stages.js`);
const { getItem } = await import(`${ROOT}/js/data/equipment.js`);
const { characterExpToNext } = await import(`${ROOT}/js/data/progression.js`);

const FROM = Number(args.get('from') || 1);
const TO = Number(args.get('to') || 5);
const FARM = Number(args.get('farm') || 8);   // farm runs allowed per loss
const MAX_TRY = Number(args.get('tries') || 6); // attempts per stage
const QUIET = !!args.get('quiet');

/* ---- player model (shared shape with progression-combat-sim) ---- */
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
  try { eng = new BattleEngine(stageId); } catch (e) { return { cleared: false, rounds: 0, error: e.message, result: null }; }
  let out;
  do { out = eng.advanceTurn(pickCommand(eng)); } while (!out.over && eng.round < 800);
  return { cleared: !!eng.finalResult?.cleared, rounds: eng.round, result: eng.finalResult };
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

/* ---- counters ---- */
const totals = { battles: 0, farmRuns: 0, losses: 0, drops: 0, rareDrops: 0, levels: 0 };
const mats = () => state.data.settlementMaterials || {};
const clearedStages = new Set();
function findStage(id) { for (const c of CHAPTERS) { const s = (c.stages || []).find((x) => x.id === id); if (s) return s; } return null; }
function cleared() { return [...clearedStages].map(findStage).filter(Boolean); }
let consecutiveFirstClears = 0, maxConsecutive = 0;
const walls = [];
const rows = [];

function accrue(result) {
  totals.battles += 1;
  const r = result || {};
  const drops = (r.items || []).length + (r.rune2Drops || []).length;
  totals.drops += drops;
  totals.rareDrops += (r.items || []).filter((id) => { const it = getItem(id); return it && (it.unique || ['rare', 'epic', 'legendary', 'mythic', 'primordial'].includes(it.rarity)); }).length;
}

console.log(`pacing playthrough — seed ${Number(args.get('seed') || 42)} farm<=${FARM}/loss tries<=${MAX_TRY}`);
console.log('stage\trecLv\tlv@\tfirstTry\tattempts\tfarm\tresult\trounds\tmats(w/o/h/v)');

outer:
for (const ch of CHAPTERS) {
  if (ch.num < FROM || ch.num > TO) continue;
  if (!ch.stages || !ch.stages.length) continue;
  for (const stage of ch.stages) {
    if (stage.branch || stage.bounty || stage.sideLocation) continue;
    const lvBefore = state.characterLevel;
    let attempts = 0, farmed = 0, r = null, firstTry = true;
    while (attempts < MAX_TRY) {
      attempts += 1;
      maintain();
      r = playStage(stage.id);
      accrue(r.result);
      if (r.cleared) break;
      totals.losses += 1;
      firstTry = false;
      // farm the highest-recLevel cleared stage — the "same stage farming" route
      const farmTarget = cleared().sort((a, b) => b.recLevel - a.recLevel)[0];
      for (let g = 0; g < FARM && farmTarget; g++) {
        maintain();
        const gr = playStage(farmTarget.id);
        accrue(gr.result);
        totals.farmRuns += 1;
        farmed += 1;
        if (!gr.cleared) totals.losses += 1;
      }
    }
    const lvAfter = state.characterLevel;
    totals.levels += lvAfter - lvBefore;
    if (firstTry) { consecutiveFirstClears += 1; maxConsecutive = Math.max(maxConsecutive, consecutiveFirstClears); }
    else { if (attempts > 1) walls.push({ id: stage.id, rec: stage.recLevel, lv: lvBefore, tries: attempts, farmed }); consecutiveFirstClears = 0; }
    const m = mats();
    if (!QUIET) rows.push(`${stage.id}\trec${stage.recLevel}\tlv${lvBefore}→${lvAfter}\t${firstTry ? 'yes' : 'no'}\t${attempts}\t${farmed}\t${r.cleared ? 'win' : 'LOSS'}\t${r.rounds}r\t${m.wood || 0}/${m.ore || 0}/${m.hide || 0}/${m.veilstone || 0}`);
    if (!r.cleared) { console.log(`STUCK AT ${stage.id} (lv${lvAfter} vs rec${stage.recLevel})`); break outer; }
    clearedStages.add(stage.id);
  }
}
for (const r of rows) console.log(r);
const m = mats();
console.log('--- summary ---');
console.log(`battles=${totals.battles} losses=${totals.losses} farmRuns=${totals.farmRuns} drops=${totals.drops} rare+=${totals.rareDrops}`);
console.log(`finalLv=${state.characterLevel} maxConsecutiveFirstClears=${maxConsecutive}`);
console.log(`walls: ${walls.length ? walls.map((w) => `${w.id}(rec${w.rec},lv${w.lv},tries${w.tries},farm${w.farmed})`).join(' ') : 'none'}`);
console.log(`materials: wood=${m.wood || 0} ore=${m.ore || 0} hide=${m.hide || 0} veilstone=${m.veilstone || 0}`);
console.log(`companions=${Object.keys(state.data.companionInstances || {}).length} expToNext@${state.characterLevel}=${characterExpToNext(state.characterLevel)}`);
