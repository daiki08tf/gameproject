/* Session 8 — scaling-gap measurement probe.
   Reuses progression-combat-sim's patch chain and playthrough loop, with
   knobs so we can measure which systemic lever actually moves the stall
   point instead of guessing:

     node scripts/session8-scaling-measure.mjs                 # baseline
     node scripts/session8-scaling-measure.mjs --xpmult 2      # XP income ×2
     node scripts/session8-scaling-measure.mjs --growth 0.02   # per-level growth ×(1+0.02·level)
     node scripts/session8-scaling-measure.mjs --to 12         # stop after ch12

   The knobs are MEASUREMENT-ONLY (monkey-patches applied inside this
   script); the shipped fix lands in the real curve once we know which
   lever closes the gap. */
globalThis.localStorage = { _m: new Map(), getItem(k) { return this._m.get(k) || null; }, setItem(k, v) { this._m.set(k, String(v)); }, removeItem(k) { this._m.delete(k); } };
const ROOT = new URL('..', import.meta.url).pathname;
const args = new Map();
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args.set(a.slice(2), process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[++i] : true);
}
const FROM = Number(args.get('from') || 1);
const TO = Number(args.get('to') || 15);
const XP_MULT = Number(args.get('xpmult') || 1);
const GROWTH_LATE = Number(args.get('growth') || 0);      // growth ×(1+k·level)
const ATK_LATE = Number(args.get('atklate') || 0);        // enemy atk ×(1+k)^(num-pivot) — counterfactual enemy curve
const HP_LATE = Number(args.get('hplate') || 0);          // same for enemy hp

const PATCHES = ['progressionCore','statusCalculationCore','progression3Core','progression3Combat','progression3Ui','levelRoadmap99999','progression3StoryExpansion','worldTierRuntime','battleRewardAccountingFix','jobCodexUi','inheritanceCore','inheritanceBalanceUi','rune2Core','rune2Special','equipment3Archetypes','weaponInstanceFoundation','equipment3Foundation','equipment3Greater','equipment3Legendary','equipment3Blacksmith','equipment3GearFoundation','options4Fusion','equipment3UniqueGearSafety','equipment3SetBonuses','equipment3SmartLoot','loot3InventoryDecisions','equipment3AbyssEndgame','equipment3DebugSafety','weaponAffixResultVisibility','equipment3GearResultVisibility','combat2ElementAffixes','combat2ElementCore','combat2ElementBuilds','combat2WeaponTechniques','combat2SkillModifiers','combat2SkillModifierUi','combat2DebugSafety','combat3BattleGroups','combat3EnemyAI','combat3Formation','job3SpecializationCore','job3LegacyPassives','jobConstellationRuntime','companionLevelCap','companionResetSafety','companionSynergy','companionBattle','companionRecruitment','codexFoundation','battleIntegration3','battleIntegration3Final','endgameDropContextFix','loot3RealmTargetFarm','legacyRuneRetirement','bountyFoundation','bountyUniqueFoundation','bountyUniqueCombat','uniqueTrialFoundation','loot3RealmChaseRewards','uniqueTrialCombat','uniqueTrialUi','uniqueBranchEffects','secretJobsPhase1','secretJobsPhase2','awakening3Imprints','systemCleanupAwakeningV2','abyss2Pacts','abyss3Challenges','abyssRunBuild','riftKeyCore','session8GrowthCurve'];
for (const m of PATCHES) { try { await import(`${ROOT}/js/patches/${m}.js`); } catch (e) { console.error('PATCH FAIL', m, e.message.slice(0, 80)); } }
const { state } = await import(`${ROOT}/js/state.js`);
const { BattleEngine } = await import(`${ROOT}/js/battleEngine.js`);
const { CHAPTERS } = await import(`${ROOT}/js/data/stages.js`);
const { getItem } = await import(`${ROOT}/js/data/equipment.js`);

// ---- knobs ----
if (XP_MULT !== 1) {
  const orig = state.gainExp.bind(state);
  state.gainExp = (x) => orig(Math.round(x * XP_MULT));
}
if (GROWTH_LATE > 0 || ATK_LATE > 0 || HP_LATE > 0) {
  // Recompute enemy stats for late knobs by scaling recLevel-side mults
  // post-hoc at spawn: BattleEngine reads ENEMY_TYPES already built, so
  // scale the built table for chapters > pivot.
  const { ENEMY_TYPES } = await import(`${ROOT}/js/data/enemies.js`);
  const { ENEMY_SCALING } = await import(`${ROOT}/js/data/balance.js`);
  const pivot = ENEMY_SCALING.PIVOT_CHAPTER;
  const chNum = (id) => Number(/^ch(\d+)_/.exec(id || '')?.[1]) || 0;
  for (const [id, t] of Object.entries(ENEMY_TYPES)) {
    const n = chNum(id); if (n <= pivot) continue;
    const k = Math.max(0, n - pivot);
    if (ATK_LATE) t.atk = Math.round(t.atk * Math.pow(1 + ATK_LATE, -k));
    if (HP_LATE) { t.hp = Math.round(t.hp * Math.pow(1 + HP_LATE, -k)); }
  }
}
if (GROWTH_LATE > 0) {
  // Amplify recorded growth when levelling past the pivot era.
  // mode A (--growthcap): min(CAP, 1+rate*max(0,L-45)) — bounded pivot curve.
  // mode B (default):    1+rate*(L-1) — unbounded linear (original probe).
  const CAP = Number(args.get('growthcap') || 0);
  const prev = state.getStats?.bind(state);
  if (prev) state.getStats = function () {
    const s = prev();
    const lvl = Math.max(0, this.currentLevel - 1);
    const mult = CAP ? Math.min(CAP, 1 + GROWTH_LATE * Math.max(0, lvl - 44)) : 1 + GROWTH_LATE * lvl;
    return { ...s, hp: Math.round(s.hp * mult), atk: Math.round(s.atk * mult), def: Math.round(s.def * mult), mag: Math.round(s.mag * mult) };
  };
}

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
  if (dmg.length && target) { const t = dmg[dmg.length - 1]; return { type: skills.includes(t) ? 'skill' : 'spell', techId: t.id, targetId: target.id }; }
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

console.log(`scaling probe — xpmult=${XP_MULT} growth=${GROWTH_LATE} atklate=${ATK_LATE} hplate=${HP_LATE}`);
const clearedStages = [];
let deaths = 0;
outer:
for (const ch of CHAPTERS) {
  if (ch.gaiden || ch.sideLocation) continue;
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
    console.log(`${stage.id}\trec${stage.recLevel}\tlv${state.currentLevel}\t${r.cleared ? 'win' : 'LOSS'}\ttries${attempts}\t${r.rounds}r`);
    if (!r.cleared) { console.log(`STUCK AT ${stage.id}`); break outer; }
    clearedStages.push(stage.id);
  }
}
console.log(`deaths=${deaths} finalLv=${state.currentLevel}`);
