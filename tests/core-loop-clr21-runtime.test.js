import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { buildObservedBranchStage } from '../js/data/observedBranchStages.js';
import { pickEncounterPoolType } from '../js/data/encounterPools2.js';
import {
  planRareOverrideTypes,
  markGenericElite,
  finalizeGenericEliteLevel,
} from '../js/data/enemyRankVariants2.js';

const fieldStage=buildObservedBranchStage('observedbranch-tree-sovereign-2');
const bossStage=buildObservedBranchStage('observedbranch-tree-sovereign-boss');

const pilotSource=fs.readFileSync(new URL('../js/patches/enemy2EncounterPilot.js',import.meta.url),'utf8');
const rankSource=fs.readFileSync(new URL('../js/patches/enemy2RankVariants.js',import.meta.url),'utf8');
const worldTierSource=fs.readFileSync(new URL('../js/patches/worldTierRuntime.js',import.meta.url),'utf8');
const battle2Source=fs.readFileSync(new URL('../js/patches/battle2RoadmapComplete.js',import.meta.url),'utf8');
const mainSource=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');

test('CLR-21 Branch encounter pool is consumed by the existing generic BattleEngine patch chain',()=>{
  assert.ok(fieldStage?.encounterPool,'Observed Branch field stage must opt into Encounter 2.0');
  assert.match(pilotSource,/pickEncounterPoolType\(this\.stage,originalType,ENEMY_TYPES,Math\.random\)/);
  assert.match(rankSource,/planRareOverrideTypes\(this\.stage,spec,ENEMY_TYPES,tier,Math\.random\)/);
  assert.match(rankSource,/chooseEnvironmentalVariant\(this\.stage\?\.encounterPool,enemy,Math\.random\)/);
  assert.match(battle2Source,/import '\.\/enemy2RankVariants\.js';/);

  // Prove the canonical helper accepts the Observed Branch stage itself. This
  // is stronger and less brittle than scanning the patch source for Ch1 text:
  // the patch contains Ch1 pilot setup, while runtime resolution is generic
  // because it passes `this.stage` into this helper.
  const pooled=pickEncounterPoolType(fieldStage,'ch2_normal',ENEMY_TYPES,()=>0);
  assert.ok(fieldStage.encounterPool.types.some(entry=>entry.type===pooled));
  // Canonical enemy data marks Boss/Rare/Abyss-Elite positively; ordinary
  // enemies may omit these flags rather than storing explicit false values.
  assert.notEqual(ENEMY_TYPES[pooled]?.boss,true);
  assert.notEqual(ENEMY_TYPES[pooled]?.rareIdentity,true);
  assert.notEqual(ENEMY_TYPES[pooled]?.elite,true);
});

test('CLR-21 Branch Rare can be planned through the canonical runtime helper while Boss encounter stays protected',()=>{
  const fieldSpec={type:'ch2_normal',count:3};
  const fieldRolls=[0,0,0];
  const overrides=planRareOverrideTypes(fieldStage,fieldSpec,ENEMY_TYPES,{rank:0},()=>fieldRolls.shift()??0);
  assert.ok(overrides,'Branch field encounter should be Rare-capable');
  assert.equal(overrides.filter(Boolean).length,1);
  assert.equal(overrides.find(Boolean),'ch2_rare');

  const bossSpec={type:'ch2_boss',count:1};
  assert.equal(planRareOverrideTypes(bossStage,bossSpec,ENEMY_TYPES,{rank:5},()=>0),null);
});

test('CLR-21 generic Elite reuses World Tier eliteChance and remains outside historical Abyss elite authority',()=>{
  assert.match(worldTierSource,/Math\.random\(\)<tier\.eliteChance/);
  assert.match(worldTierSource,/markGenericElite\(enemy\)/);
  assert.match(worldTierSource,/!enemy\.boss/);
  assert.match(worldTierSource,/!rareIdentity/);

  const template=ENEMY_TYPES.ch2_normal;
  const enemy={
    name:template.name,
    boss:false,
    elite:false,
    rareIdentity:false,
    hp:template.hp,
    maxHp:template.hp,
    atk:template.atk,
    def:template.def,
    spd:template.speed,
    xp:template.xp,
    gold:template.gold,
    baseLevel:fieldStage.recLevel,
    level:fieldStage.recLevel,
  };
  markGenericElite(enemy);
  finalizeGenericEliteLevel(enemy,fieldStage,()=>0);
  assert.equal(enemy.rank,'elite');
  assert.equal(enemy.genericElite,true);
  assert.equal(enemy.elite,false);
  assert.ok(enemy.level>=Math.round(fieldStage.recLevel*1.2));
});

test('application import order preserves World Tier promotion before Enemy 2.0 rank finalization',()=>{
  const worldTierPos=mainSource.indexOf("import './patches/worldTierRuntime.js'");
  const battle2Pos=mainSource.indexOf("import './patches/battle2RoadmapComplete.js'");
  assert.ok(worldTierPos>=0&&battle2Pos>worldTierPos,'worldTierRuntime must wrap spawn before Enemy 2.0 rank/variant wrappers');
  assert.match(rankSource,/enemy\.genericElite\)finalizeGenericEliteLevel\(enemy,this\.stage,Math\.random\)/);
});
