import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_LAYER, DAMAGE_BUCKET, CAPS_LAYER } from '../js/data/balance.js';
import { COMPANION_SPECIES, companionStats } from '../js/data/companions.js';
import { abyssRecommendedLevel, abyssTargetItemPower, abyssStageExpBudget } from '../js/data/abyssEndgame.js';
import { buildAbyssStage } from '../js/data/abyss.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { generateRiftKey } from '../js/data/riftKeys.js';
import { EQUIPMENT3_SETS, setPieces } from '../js/data/equipment3Sets.js';

function mitigation(def){return Math.min(CAPS_LAYER.DEF_MITIGATION_MAX,def/(def+DAMAGE_BUCKET.MITIGATION_K));}
function baseCharacter(lv){return Object.fromEntries(Object.keys(CHARACTER_LAYER.STAT_BASE).map(k=>[k,CHARACTER_LAYER.STAT_BASE[k]+CHARACTER_LAYER.STAT_GROWTH[k]*(lv-1)]));}
function stageEnemy(stage,kind='boss'){const wave=(stage.waves||[]).find(w=>String(w.type).endsWith(`_${kind}`))||(stage.waves||[]).at(-1);return wave?.type;}

// ① Companion/Boss: quantify the structural free-DPS risk. This is deliberately a
// diagnostic contract rather than a forced AI rewrite: bosses currently never enter
// the normal companion-target branch, so three living companions can contribute every
// round until player death. Keep their raw late-game contribution bounded relative to
// Character linear growth while a later combat-design pass decides boss AoE/targeting.
test('three max-level companions do not outscale max-level Character raw attack axis',()=>{
  const lv=99999, player=baseCharacter(lv), ids=['iron_hound','thunder_beast','rot_beast'];
  const total=ids.reduce((s,id)=>s+companionStats(COMPANION_SPECIES[id],{level:lv,nature:'balanced',talent:{}}).atk,0);
  assert.ok(total/player.atk < 10,'party raw ATK should stay bounded; boss targeting is a separate design issue');
});

// ② Set: fixed stats become tiny at Lv50k+, therefore set identity must come from
// percentage/behaviour bonuses. Require every late set to expose at least one scalable
// percentage or proc effect instead of relying on flat stats alone.
test('late Abyss sets remain scaling build choices rather than flat-stat trophies',()=>{
  for(const id of ['star_weaver','abyss_walker','executioner']){
    const set=EQUIPMENT3_SETS[id];
    const scalable=[set.bonuses[2],set.bonuses[3]].some(b=>b.statMult||b.statAdd||b.effects?.some(e=>e.power||e.chance));
    assert.ok(scalable,`${id} needs a scalable identity`);
    assert.equal(setPieces(id).length,3);
  }
});

// ③ Lv700 -> 99,999 roadmap: no reverse progression in recommended level, IP or EXP
// budget at the requested audit checkpoints.
test('long-term Lv/IP/EXP checkpoints are monotonic through Lv99,999',()=>{
  const depths=[1,100,500,1000,2000,3000];
  let prev={lv:0,ip:0,xp:0};
  for(const d of depths){const cur={lv:abyssRecommendedLevel(d),ip:abyssTargetItemPower(d),xp:abyssStageExpBudget(d)};assert.ok(cur.lv>=prev.lv);assert.ok(cur.ip>=prev.ip);assert.ok(cur.xp>=prev.xp);prev=cur;}
  assert.equal(prev.lv,99999);assert.equal(prev.ip,10000);
});

// ④ Risk/reward: fixed Realms and Rift keys must not pay below their source Abyss on
// the axes they advertise. Secret Realm IP is intentionally targeted; Rift Lv/IP are
// guaranteed above source by generator design.
test('endgame side content preserves positive risk/reward direction',()=>{
  const realms=[['secret-blood-castle',800],['secret-ancient-dragon-nest',1100],['secret-sealed-library',1550],['secret-gods-graveyard',2250],['secret-void-corridor',2950]];
  for(const [id,d] of realms){const s=buildSecretRealmStage(id);assert.ok(s.recLevel>=abyssRecommendedLevel(d)*.9,`${id} recommendation must reflect source danger`);assert.ok(s.itemPowerTarget>=abyssTargetItemPower(d),`${id} loot IP must not trail source`);}
  for(const d of [100,500,1000,2000,3000]){for(let seed=0;seed<20;seed++){const k=generateRiftKey(d,`audit2-${seed}`);assert.ok(k.recLevel>=abyssRecommendedLevel(d));assert.ok(k.itemPowerTarget>=abyssTargetItemPower(d));}}
});
