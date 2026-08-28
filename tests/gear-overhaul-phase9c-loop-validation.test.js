import assert from 'node:assert/strict';
import { buildAbyssStage } from '../js/data/abyss.js';
import { buildRiftStage } from '../js/data/riftStages.js';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { rollUnique2ClearReward } from '../js/data/gearOverhaulPhase9TargetFarm.js';
import { ENDGAME_LOOT_ROLES } from '../js/data/endgameLootRoles.js';

function namedShare(stage,itemId){
  const table=stage.dropTable||[];
  const total=table.reduce((sum,x)=>sum+Math.max(0,Number(x.weight)||0),0);
  const named=table.filter(x=>x.itemId===itemId).reduce((sum,x)=>sum+Math.max(0,Number(x.weight)||0),0);
  return total>0?named/total:0;
}

const abyss=buildAbyssStage(1800,[],{routeId:'armory'});
assert.ok(namedShare(abyss,'uq_u2_grimhead')<0.08);
assert.ok(namedShare(abyss,'uq_u2_alka')<0.08);

const library=buildSecretRealmStage('secret-inverted-library');
assert.ok(namedShare(library,'uq_u2_cadenza')<0.10);
const eighth=buildSecretRealmStage('secret-eighth-key-3');
assert.ok(namedShare(eighth,'uq_u2_seraphim')<0.10);

const key={id:'sim-wind',name:'sim',recLevel:5000,itemPowerTarget:8000,dangers:[],reward:'treasure',dangerScore:0,element:'wind'};
const rift=buildRiftStage(key);
assert.equal(rift.dropTable.length,0,'Rift target Named must not monopolize per-enemy table drops');
assert.equal(rift.unique2TargetFarm?.[0]?.clearChance,0.06);

let seed=0x12345678;
const rng=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
let hits=0;
const trials=20000;
for(let i=0;i<trials;i++) if(rollUnique2ClearReward(rift,rng)) hits++;
const rate=hits/trials;
assert.ok(rate>0.05&&rate<0.07,`Rift clear chase drifted: ${rate}`);

assert.deepEqual(ENDGAME_LOOT_ROLES.map(x=>x.id),['abyss','rift','nemesis','secret_realm']);
for(const role of ENDGAME_LOOT_ROLES){
  assert.ok(role.primary&&role.secondary&&role.avoid);
}

console.log(`Gear Overhaul Phase 9C loop validation passed (Rift simulated rate ${(rate*100).toFixed(2)}%)`);
