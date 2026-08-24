import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { breakCapacity,breakDamage,comboForHit,COMPANION_TACTICS } from '../js/data/battle2Tactics.js';

test('Break capacity scales and bosses receive a larger gauge',()=>{const normal=breakCapacity({def:100,maxHp:1000,boss:false});const boss=breakCapacity({def:100,maxHp:1000,boss:true});assert.ok(normal>=12);assert.ok(boss>normal);});
test('weakness builds more Break while resistance builds less',()=>{const base={damage:100,maxHp:1000,capacity:30,boss:false};const weak=breakDamage({...base,elementMultiplier:1.25});const neutral=breakDamage({...base,elementMultiplier:1});const resist=breakDamage({...base,elementMultiplier:.8});assert.ok(weak>neutral);assert.ok(neutral>resist);});
test('physical damage can shatter a frosted target',()=>{const plain=breakDamage({damage:100,maxHp:1000,capacity:40,physical:true,frosted:false});const shatter=breakDamage({damage:100,maxHp:1000,capacity:40,physical:true,frosted:true});assert.ok(shatter>plain);assert.equal(comboForHit(null,{frost:1}),'shatter');});
test('Battle 2.0 status combinations expose wildfire shock and necrosis',()=>{assert.equal(comboForHit('wind',{burn:1}),'wildfire');assert.equal(comboForHit('lightning',{frost:1}),'shock');assert.equal(comboForHit('poison',{bleed:1}),'necrosis');});
test('companion tactics provide four bounded player directives',()=>{assert.deepEqual(Object.keys(COMPANION_TACTICS),['balanced','assault','defense','support']);});
test('Battle 2.0 completion loads after companion battle integration',()=>{const main=fs.readFileSync(new URL('../js/main.js',import.meta.url),'utf8');assert.ok(main.indexOf("./patches/companionBattle.js")<main.indexOf("./patches/battle2RoadmapComplete.js"));});
