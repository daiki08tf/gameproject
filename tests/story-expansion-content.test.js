import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS } from '../js/data/stages.js';
import { getItem } from '../js/data/equipment.js';
import { enemyCombatProfile } from '../js/data/enemyCombat3.js';

test('chapters 16-20 have authored enemy roles and signature skills',()=>{
  const expected={
    16:['深潮斬り','溺れの泡歌','珊瑚城壁'],
    17:['白耀断罪剣','聖鐘の祈り','断罪聖域'],
    18:['星蝕寄生','無貌跳躍','重力圧壊'],
    19:['境界侵蝕','時喰い連刃','鏡界障壁'],
    20:['始原崩し','深淵喰らい','七柱封陣'],
  };
  for(const [n,names] of Object.entries(expected)){
    const prefix=`ch${n}`;
    assert.deepEqual([
      enemyCombatProfile(`${prefix}_normal`).skill.name,
      enemyCombatProfile(`${prefix}_fast`).skill.name,
      enemyCombatProfile(`${prefix}_tank`).skill.name,
    ],names);
  }
});

test('chapters 16-20 generate a complete themed equipment family',()=>{
  for(let n=16;n<=20;n++){
    for(const suffix of ['weapon','shield','head','body','accessory','weapon_epic'])assert.ok(getItem(`ch${n}_${suffix}`),`ch${n}_${suffix}`);
    const ch=CHAPTERS.find(x=>x.num===n);
    assert.ok(getItem(`ch${n}_named_${ch.num===20?'accessory':'accessory'}`)||getItem(`ch${n}_named_weapon`)||getItem(`ch${n}_named_body`));
    assert.ok(getItem(`ch${n}_branch`));
  }
});

test('every chapter 16-20 stage drop and first-clear item resolves',()=>{
  for(let n=16;n<=20;n++){
    const ch=CHAPTERS.find(x=>x.num===n);
    for(const stage of ch.stages){
      for(const drop of stage.dropTable||[])assert.ok(getItem(drop.itemId),`${stage.id}:${drop.itemId}`);
      if(stage.firstClear?.itemId)assert.ok(getItem(stage.firstClear.itemId),`${stage.id}:first:${stage.firstClear.itemId}`);
    }
  }
});

test('midboss rewards an epic weapon while final boss targets Named loot',()=>{
  for(let n=16;n<=20;n++){
    const ch=CHAPTERS.find(x=>x.num===n),mid=ch.stages.find(s=>s.midBoss),boss=ch.stages.find(s=>s.boss);
    assert.equal(mid.firstClear.itemId,`ch${n}_weapon_epic`);
    assert.ok(boss.dropTable.length>=1);
    assert.ok(boss.dropTable.every(x=>x.itemId.startsWith(`ch${n}_named`)));
  }
});
