import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CHAPTERS, findStage, finalStageOf } from '../js/data/stages.js';
import { ENEMY_TYPES } from '../js/data/enemies.js';
import { getItem, allItems, RARITY, SLOTS } from '../js/data/equipment.js';
import { getRune } from '../js/data/runes.js';
import { RANCH_REGION_SPECIES, RANCH_RECRUIT_BY_ENEMY_TYPE } from '../js/data/monsterRanchSpecies.js';
import { getCompanionSkill } from '../js/data/companionSkills.js';
import { abyssRecommendedLevel, abyssTargetItemPower } from '../js/data/abyssEndgame.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { buildRaidStage } from '../js/data/raidBosses.js';

const finiteNonNegative=v=>Number.isFinite(Number(v))&&Number(v)>=0;
const resolveRewardItem=id=>!id||Boolean(getItem(id)||getRune(id));

test('RC: all story stage ids are unique and every story stage resolves',()=>{
  const stages=CHAPTERS.flatMap(ch=>ch.stages);
  const ids=stages.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  for(const stage of stages){
    const found=findStage(stage.id);
    assert.ok(found?.stage,`unresolved stage ${stage.id}`);
    assert.equal(found.stage.id,stage.id);
  }
});

test('RC: story recommendations, rewards, waves and reward references stay valid',()=>{
  for(const chapter of CHAPTERS){
    for(const stage of chapter.stages){
      assert.ok(Number.isFinite(stage.recLevel)&&stage.recLevel>=1&&stage.recLevel<=99999,`bad recLevel ${stage.id}`);
      assert.ok(finiteNonNegative(stage.rewards?.gold),`bad gold ${stage.id}`);
      assert.ok(finiteNonNegative(stage.rewards?.exp),`bad exp ${stage.id}`);
      assert.ok(Array.isArray(stage.waves)&&stage.waves.length>0,`no waves ${stage.id}`);
      for(const wave of stage.waves){
        assert.ok(ENEMY_TYPES[wave.type],`missing enemy ${wave.type} from ${stage.id}`);
        assert.ok(Number.isInteger(wave.count)&&wave.count>=1,`bad wave count ${stage.id}`);
      }
      assert.ok(resolveRewardItem(stage.firstClear?.itemId),`missing first-clear item ${stage.id}`);
      for(const drop of stage.dropTable||[])assert.ok(resolveRewardItem(drop.itemId),`missing drop ${drop.itemId} from ${stage.id}`);
    }
  }
});

test('RC: main story boss ladder rises through Ch25 without exceeding the level cap',()=>{
  const bosses=CHAPTERS.map(finalStageOf);
  for(let i=1;i<bosses.length;i++)assert.ok(bosses[i].recLevel>=bosses[i-1].recLevel,`boss ladder regressed at Ch${i+1}`);
  assert.ok(bosses.at(-1).recLevel<=99999);
});

test('RC: core endgame resolvers cover Abyss, Secret Realm and Raid samples',()=>{
  for(const depth of [1,100,500,1000,2000,3000]){
    const found=findStage(`abyss-${depth}`);
    assert.ok(found?.stage);
    assert.equal(found.stage.recLevel,abyssRecommendedLevel(depth));
    assert.equal(found.stage.itemPowerTarget,abyssTargetItemPower(depth));
  }
  const secret=buildSecretRealmStage('secret-convergence-observatory');
  assert.ok(secret&&findStage(secret.id)?.stage);
  const raid=buildRaidStage('raid-archeion-revenant');
  if(raid)assert.ok(findStage(raid.id)?.stage);
});

test('RC: equipment catalog has valid identities, slots, rarities and finite stats',()=>{
  const items=allItems();
  const ids=items.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  const validSlots=new Set([...SLOTS,'accessory']);
  for(const item of items){
    assert.ok(item.id&&item.name,`bad item identity`);
    assert.ok(validSlots.has(item.slot),`bad slot ${item.id}:${item.slot}`);
    assert.ok(RARITY[item.rarity],`bad rarity ${item.id}:${item.rarity}`);
    for(const [stat,value] of Object.entries(item.stats||{}))assert.ok(finiteNonNegative(value),`bad stat ${item.id}:${stat}`);
  }
});

test('RC: recruitable species have unique enemy links, sane progression and resolvable skills',()=>{
  const species=Object.values(RANCH_REGION_SPECIES);
  const ids=species.map(x=>x.id);
  assert.equal(new Set(ids).size,ids.length);
  assert.equal(Object.keys(RANCH_RECRUIT_BY_ENEMY_TYPE).length,new Set(species.map(x=>x.enemyType)).size);
  for(const s of species){
    assert.equal(RANCH_RECRUIT_BY_ENEMY_TYPE[s.enemyType],s.id,`bad recruit map ${s.id}`);
    assert.ok(Number.isFinite(s.recruit?.baseChance)&&s.recruit.baseChance>0&&s.recruit.baseChance<=1,`bad recruit chance ${s.id}`);
    for(const [stat,value] of Object.entries(s.baseStats||{}))assert.ok(finiteNonNegative(value),`bad base ${s.id}:${stat}`);
    for(const [stat,value] of Object.entries(s.growth||{}))assert.ok(finiteNonNegative(value),`bad growth ${s.id}:${stat}`);
    for(const entry of s.skills||[])assert.ok(getCompanionSkill(entry.id),`missing companion skill ${entry.id} for ${s.id}`);
  }
});

test('RC: feature freeze and mobile command safety remain release gates',()=>{
  const roadmap=fs.readFileSync(new URL('../ROADMAP.md',import.meta.url),'utf8');
  const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');
  const css=fs.readFileSync(new URL('../css/finalIntegration.css',import.meta.url),'utf8');
  const battleTest=fs.readFileSync(new URL('./phase14-mobile-command-regression.test.js',import.meta.url),'utf8');
  assert.match(roadmap,/feature freeze/i);
  assert.doesNotMatch(html,/goPhase1[5-9]Btn|phase1[5-9]Screen/);
  assert.match(css,/\.tb-enemy-list\{[^}]*overflow-y:auto/s);
  assert.match(css,/\.tb-command-grid\{[^}]*position:sticky/s);
  assert.match(css,/\.tb-cmd-btn\{[^}]*min-height:44px/s);
  assert.match(battleTest,/attack button stays outside enemy and log scrollers/i);
});
