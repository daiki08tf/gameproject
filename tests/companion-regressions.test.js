import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COMPANION_SPECIES, companionExpToNext, companionStats, companionTraitEffect, companionTraitLabel } from '../js/data/companions.js';
async function source(path){return readFile(new URL(`../${path}`,import.meta.url),'utf8');}
function compact(text){return text.replace(/\s+/g,'');}

test('companion species data stays usable and growth is monotonic',()=>{for(const id of ['slime','goblin','bat']){const species=COMPANION_SPECIES[id];assert.ok(species);const lv1=companionStats(species,{level:1,nature:'balanced',talent:{}}),lv10=companionStats(species,{level:10,nature:'balanced',talent:{}});for(const stat of ['hp','mp','atk','def','mag','spd']){assert.ok(lv1[stat]>=1);assert.ok(lv10[stat]>=lv1[stat]);}}});

test('companion traits have real effects and honest labels',()=>{assert.deepEqual(companionTraitEffect('ぷにぷにボディ'),{kind:'physicalMitigation',power:.10,desc:'通常攻撃の被ダメージ -10%'});assert.equal(companionTraitEffect('悪知恵').kind,'lowHpDamage');assert.equal(companionTraitEffect('夜目').kind,'initiativeSpd');assert.match(companionTraitLabel('夜目'),/SPD \+15%/);});

test('companion EXP curve increases with level',()=>{let prev=0;for(let level=1;level<=100;level++){const next=companionExpToNext(level);assert.ok(next>prev);prev=next;}});

test('battle patch keeps final-hit, frozen, zero-XP, shared DEF, and SPD guards',async()=>{
  const text=await source('js/patches/companionBattle.js'),c=compact(text);
  const frozenGuard=c.indexOf('enemy&&enemy.frozenTurns>0'),targetBranch=c.indexOf('companionCanBeTargeted(this)');
  assert.ok(frozenGuard>=0&&targetBranch>=0&&frozenGuard<targetBranch,'frozen check must happen before companion targeting');
  assert.match(c,/\(enemy\.xp\|\|0\)>0/,'zero-XP enemies must not grant companion EXP');
  assert.match(c,/this\.aliveEnemies\.length===0[\s\S]*this\.checkBattleEnd\(\)/,'companion final hit must trigger battle-end recheck');
  assert.match(c,/defMitigationPct\(target\.def\|\|0\)/,'companion damage must use the shared DEF mitigation rule');
  assert.match(c,/defMitigationPct\(companion\.def\|\|0\)/,'damage to companions must use the shared DEF mitigation rule');
  assert.doesNotMatch(text,/\+ 55\)/);assert.match(c,/effectiveCompanionSpd\(companion\)>=fastestEnemy|effectiveCompanionSpd\(c\)>=fastestEnemy/);assert.match(text,/originalRunEnemyPhase/);
});

test('foundation keeps one-time starter and allows a truly empty roster',async()=>{const text=await source('js/patches/companionFoundation.js');assert.match(text,/starterCompanionGranted/);assert.match(text,/this\.data\.companionParty\[0\] = null;[\s\S]*delete this\.data\.companionInstances\[instanceId\]/);const outer=text.indexOf('if (!state.data.starterCompanionGranted)'),empty=text.indexOf('if (state.companionList().length === 0)',outer),starter=text.indexOf("state.createCompanion('slime'",empty),flag=text.indexOf('state.data.starterCompanionGranted = true',starter);assert.ok(outer>=0&&empty>outer&&starter>empty&&flag>starter);assert.match(text,/map\(companionTraitLabel\)/);});

test('recruitment is type-based and elite recruits have a rarity floor',async()=>{const text=await source('js/patches/companionRecruitment.js'),c=compact(text);assert.match(text,/grunt:\s*'goblin'/);assert.match(text,/fast:\s*'bat'/);assert.match(c,/RECRUIT_SPECIES_BY_ENEMY_TYPE\[enemy\.type\]/);assert.match(c,/minRarity:'rare'/);assert.match(c,/letresolved=false;[\s\S]*if\(resolved\)return;/,'recruit prompt should guard double taps');});

test('weapon patch keeps same-base material and cleanup behavior',async()=>{const text=await source('js/patches/weaponInstanceFoundation.js');assert.match(text,/baseItemId\(id\) !== targetBase/);assert.match(text,/this\.isItemLocked\(id\) \|\| this\.isItemFavorite\(id\)/);assert.match(text,/clearInstanceData\(itemId\)/);assert.match(text,/weaponItemPower/);});

test('main imports all integration patches in stable order',async()=>{const text=await source('js/main.js');const order=["./patches/weaponInstanceFoundation.js","./patches/companionFoundation.js","./patches/companionBattle.js","./patches/companionRecruitment.js"].map(s=>text.indexOf(s));assert.ok(order.every(n=>n>=0));assert.ok(order.every((n,i)=>i===0||n>order[i-1]));});

test('character dashboard keeps basic, equipment, and detail views',async()=>{const text=await source('js/screens/status.js');assert.match(text,/\['basic','基本'\]/);assert.match(text,/\['equipment','装備'\]/);assert.match(text,/\['detail','詳細'\]/);assert.match(text,/state\.getStatBreakdown\(key\)/);assert.match(text,/state\.weaponItemPower/);assert.match(text,/characterDashboardCss/);});

test('revival spell serializes the whole state payload',async()=>{const text=await source('js/screens/spellScreen.js');assert.match(text,/encodeSpell\(state\.data\)/);});
