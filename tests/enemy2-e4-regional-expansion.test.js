import test from 'node:test';
import assert from 'node:assert/strict';
import { ENEMY_TYPES, ALL_CHAPTER_SPECS } from '../js/data/enemies.js';
import { CHAPTERS } from '../js/data/stages.js';
import { REGIONAL_ENEMY_EXPANSION, REGIONAL_ENEMY_ROLES } from '../js/data/regionalEnemies2.js';

const chapterIds=['ch1',...ALL_CHAPTER_SPECS.map(ch=>ch.id)];

test('E4 authors five new regional identities for all 31 story chapters',()=>{
  assert.equal(chapterIds.length,31);
  assert.equal(Object.keys(REGIONAL_ENEMY_EXPANSION).length,31);
  assert.deepEqual(REGIONAL_ENEMY_ROLES,['attacker','caster','trickster','support','rare']);
  for(const chapterId of chapterIds){
    const set=REGIONAL_ENEMY_EXPANSION[chapterId];
    assert.ok(set,`missing catalog: ${chapterId}`);
    for(const role of REGIONAL_ENEMY_ROLES){
      assert.ok(set[role]?.name,`${chapterId} ${role} needs a name`);
      assert.equal(set[role].role,role);
    }
  }
});

test('E4 registers 155 reusable regional enemy types with stable ecology metadata',()=>{
  let count=0;
  for(const chapterId of chapterIds){
    for(const role of REGIONAL_ENEMY_ROLES){
      const id=`${chapterId}_${role}`;
      const enemy=ENEMY_TYPES[id];
      assert.ok(enemy,`missing ENEMY_TYPES.${id}`);
      assert.equal(enemy.chapterId,chapterId);
      assert.equal(enemy.role,role);
      assert.equal(enemy.speciesId,`regional:${chapterId}:${role}`);
      assert.equal(enemy.regional,true);
      assert.ok(Array.isArray(enemy.behaviorTags)&&enemy.behaviorTags.length>=2);
      assert.ok(enemy.hp>0&&enemy.atk>0&&enemy.xp>0&&enemy.gold>0);
      count++;
    }
  }
  assert.equal(count,155);
});

test('E4 role stat silhouettes are materially different rather than name-only clones',()=>{
  const attacker=ENEMY_TYPES.ch1_attacker;
  const caster=ENEMY_TYPES.ch1_caster;
  const trickster=ENEMY_TYPES.ch1_trickster;
  const support=ENEMY_TYPES.ch1_support;
  const rare=ENEMY_TYPES.ch1_rare;
  assert.ok(attacker.atk>support.atk);
  assert.ok(trickster.speed>attacker.speed);
  assert.ok(support.def>caster.def);
  assert.ok(rare.hp>attacker.hp);
  assert.ok(rare.xp>attacker.xp);
});

test('E4 Rare identities are not Bosses and do not reuse the Abyss elite flag',()=>{
  for(const chapterId of chapterIds){
    const rare=ENEMY_TYPES[`${chapterId}_rare`];
    assert.equal(rare.rareIdentity,true);
    assert.notEqual(rare.boss,true);
    assert.notEqual(rare.elite,true);
  }
});

test('E4 does not migrate existing fixed story waves yet',()=>{
  const newSuffix=/(?:_attacker|_caster|_trickster|_support|_rare)$/;
  for(const chapter of CHAPTERS){
    for(const stage of chapter.stages){
      for(const wave of stage.waves||[]){
        assert.equal(newSuffix.test(String(wave.type)),false,`${stage.id} unexpectedly migrated to ${wave.type}`);
      }
    }
  }
});
