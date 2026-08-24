import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_LAYER } from '../js/data/balance.js';
import { COMPANION_SPECIES, companionStats } from '../js/data/companions.js';
import { characterExpToNext } from '../js/data/progression.js';
import { abyssRecommendedLevel, abyssTargetItemPower, abyssStageExpBudget } from '../js/data/abyssEndgame.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { generateRiftKey } from '../js/data/riftKeys.js';
import { EQUIPMENT3_SETS, setPieces } from '../js/data/equipment3Sets.js';

function baseCharacter(lv){return Object.fromEntries(Object.keys(CHARACTER_LAYER.STAT_BASE).map(k=>[k,CHARACTER_LAYER.STAT_BASE[k]+CHARACTER_LAYER.STAT_GROWTH[k]*(lv-1)]));}

// ① Companion/Boss: bosses currently bypass normal companion targeting, so quantify
// the maximum raw party contribution while leaving the actual boss-AI redesign separate.
test('three max-level companions do not outscale max-level Character raw attack axis',()=>{
  const lv=99999, player=baseCharacter(lv), ids=['iron_hound','thunder_beast','rot_beast'];
  const total=ids.reduce((s,id)=>s+companionStats(COMPANION_SPECIES[id],{level:lv,nature:'balanced',talent:{}}).atk,0);
  assert.ok(total/player.atk < 10,'party raw ATK should stay bounded; boss targeting is a separate design issue');
});

// ② Set: flat stats fade at Lv50k+, so late sets must retain percentage/proc identity.
test('late Abyss sets remain scaling build choices rather than flat-stat trophies',()=>{
  for(const id of ['star_weaver','abyss_walker','executioner']){
    const set=EQUIPMENT3_SETS[id];
    const scalable=[set.bonuses[2],set.bonuses[3]].some(b=>b.statMult||b.statAdd||b.effects?.some(e=>e.power||e.chance));
    assert.ok(scalable,`${id} needs a scalable identity`);assert.equal(setPieces(id).length,3);
  }
});

// ③ Raw EXP need jumps at era boundaries by design, so compare progression pace as
// "levels funded by one clear". Stage budget targets ~55% of the roadmap delta and
// enemy XP supplies the remainder; this must stay stable rather than collapse late-game.
test('long-term Lv/IP and EXP pace stay coherent through Lv99,999',()=>{
  const depths=[1,100,500,1000,2000,2999];
  let prevLv=0,prevIp=0;
  for(const d of depths){const lv=abyssRecommendedLevel(d),next=abyssRecommendedLevel(d+1),ip=abyssTargetItemPower(d),budget=abyssStageExpBudget(d),need=Math.max(1,characterExpToNext(lv))*Math.max(1,next-lv),pace=budget/need;assert.ok(lv>=prevLv);assert.ok(ip>=prevIp);assert.ok(pace>=.54&&pace<=.56,`depth ${d} EXP pace ${pace}`);prevLv=lv;prevIp=ip;}
  assert.equal(abyssRecommendedLevel(3000),99999);assert.equal(abyssTargetItemPower(3000),10000);
});

// ④ Side content must not ask for more danger while paying lower target IP.
test('endgame side content preserves positive risk/reward direction',()=>{
  const realms=[['secret-blood-castle',800],['secret-ancient-dragon-nest',1100],['secret-sealed-library',1550],['secret-gods-graveyard',2250],['secret-void-corridor',2950]];
  for(const [id,d] of realms){const s=buildSecretRealmStage(id);assert.ok(s.recLevel>=abyssRecommendedLevel(d)*.9,`${id} recommendation must reflect source danger`);assert.ok(s.itemPowerTarget>=abyssTargetItemPower(d),`${id} loot IP must not trail source`);}
  for(const d of [100,500,1000,2000,3000])for(let seed=0;seed<20;seed++){const k=generateRiftKey(d,`audit2-${seed}`);assert.ok(k.recLevel>=abyssRecommendedLevel(d));assert.ok(k.itemPowerTarget>=abyssTargetItemPower(d));}
});
