/* ============================================================
   敵データ定義
   第1章は既存のまま。第2章以降は chapter metadata から
   normal/fast/tank/boss を自動生成。16〜32章はmidbossも生成する。
   Enemy 2.0 E4 adds attacker/caster/trickster/support/rare identities.
   Enemy 2.0 E5 registers only the Ch1 Global Species pilot types.
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { CHAPTER_EXPANSION_16_20 } from './chapters16to20.js';
import { CHAPTER_EXPANSION_21_25 } from './chapters21to25.js';
import { CHAPTER_EXPANSION_26_29 } from './chapters26to29.js';
import { CHAPTER_EXPANSION_30 } from './chapters30.js';
import { CHAPTER_EXPANSION_31 } from './chapters31.js';
import { CHAPTER_EXPANSION_32 } from './chapters32.js';
import { REGIONAL_ENEMY_EXPANSION, REGIONAL_ENEMY_ROLES } from './regionalEnemies2.js';
import { materializeGlobalSpecies } from './globalEnemySpecies.js';
import { ENEMY_SCALING, chapterScaleMult } from './balance.js';

export function hpMult(num) { return chapterScaleMult(ENEMY_SCALING.HP_BASE_MULT, ENEMY_SCALING.HP_EARLY_RATE, ENEMY_SCALING.HP_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function atkMult(num) { return chapterScaleMult(ENEMY_SCALING.ATK_BASE_MULT, ENEMY_SCALING.ATK_EARLY_RATE, ENEMY_SCALING.ATK_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function defMult(num) { return chapterScaleMult(ENEMY_SCALING.DEF_BASE_MULT, ENEMY_SCALING.DEF_EARLY_RATE, ENEMY_SCALING.DEF_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function bossHpMult(num) { return chapterScaleMult(ENEMY_SCALING.BOSS_HP_BASE_MULT, ENEMY_SCALING.BOSS_HP_EARLY_RATE, ENEMY_SCALING.BOSS_HP_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
const NORMAL_BASE={hp:26,atk:6,def:2,speed:95,radius:15,color:'#c9505f',xp:6,gold:4};
const FAST_BASE={hp:14,atk:4,def:0,speed:180,radius:11,color:'#e0c94a',xp:5,gold:3};
const TANK_BASE={hp:70,atk:11,def:5,speed:62,radius:22,color:'#8a5cd6',xp:14,gold:8};
const ATTACKER_BASE={hp:22,atk:10,def:1,speed:108,radius:15,color:'#d85c44',xp:8,gold:5};
const CASTER_BASE={hp:18,atk:8,def:1,speed:102,radius:14,color:'#6f78d8',xp:9,gold:6};
const TRICKSTER_BASE={hp:20,atk:6,def:1,speed:145,radius:13,color:'#9a63c7',xp:8,gold:6};
const SUPPORT_BASE={hp:34,atk:4,def:4,speed:82,radius:16,color:'#65a878',xp:9,gold:7};
const RARE_BASE={hp:92,atk:15,def:7,speed:104,radius:23,color:'#d5a83d',xp:30,gold:24,rareIdentity:true};
const BOSS_BASE={hp:420,atk:16,def:8,speed:68,radius:34,color:'#e0553a',xp:120,gold:150,boss:true};
const MIDBOSS_BASE={hp:255,atk:14,def:7,speed:76,radius:28,color:'#d47748',xp:70,gold:65,boss:true};
const BRANCH_BASE={hp:150,atk:20,def:9,speed:70,radius:26,color:'#d68b3a',xp:40,gold:25,boss:true};
const E4_ROLE_BASES=Object.freeze({attacker:ATTACKER_BASE,caster:CASTER_BASE,trickster:TRICKSTER_BASE,support:SUPPORT_BASE,rare:RARE_BASE});
function scale(base,name,num,meta={}){const isBoss=!!base.boss;return{...base,...meta,name,hp:Math.round(base.hp*(isBoss?bossHpMult(num):hpMult(num))),atk:Math.round(base.atk*atkMult(num)),def:Math.round(base.def*defMult(num)),xp:Math.round(base.xp*chapterMult(num)),gold:Math.round(base.gold*chapterMult(num))};}
export const ENEMY_TYPES={grunt:scale(NORMAL_BASE,'ゴブリン',1),fast:scale(FAST_BASE,'コウモリ',1),tank:scale(TANK_BASE,'オーガ',1),boss_orcking:scale(BOSS_BASE,'オークキング',1),branch_goblin_chief:scale(BRANCH_BASE,'ゴブリンの頭目',1)};
export const ALL_CHAPTER_SPECS=[...CHAPTER_SPECS,...CHAPTER_EXPANSION_16_20,...CHAPTER_EXPANSION_21_25,...CHAPTER_EXPANSION_26_29,...CHAPTER_EXPANSION_30,...CHAPTER_EXPANSION_31,...CHAPTER_EXPANSION_32];
for(const ch of ALL_CHAPTER_SPECS){
 ENEMY_TYPES[`${ch.id}_normal`]=scale(NORMAL_BASE,ch.enemies.normal,ch.num,{role:'normal',chapterId:ch.id});
 ENEMY_TYPES[`${ch.id}_fast`]=scale(FAST_BASE,ch.enemies.fast,ch.num,{role:'fast',chapterId:ch.id});
 ENEMY_TYPES[`${ch.id}_tank`]=scale(TANK_BASE,ch.enemies.tank,ch.num,{role:'tank',chapterId:ch.id});
 ENEMY_TYPES[`${ch.id}_boss`]=scale(BOSS_BASE,ch.enemies.boss,ch.num,{role:'boss',chapterId:ch.id});
 if(ch.midboss)ENEMY_TYPES[`${ch.id}_midboss`]=scale(MIDBOSS_BASE,ch.midboss.enemyName,ch.num,{role:'boss',chapterId:ch.id});
 if(ch.branch)ENEMY_TYPES[`${ch.id}_branchboss`]=scale(BRANCH_BASE,ch.branch.enemyName,ch.num,{role:'boss',chapterId:ch.id});
}

const STORY_REGION_NUMBERS=Object.freeze({ch1:1,...Object.fromEntries(ALL_CHAPTER_SPECS.map(ch=>[ch.id,ch.num]))});
for(const [chapterId,set] of Object.entries(REGIONAL_ENEMY_EXPANSION)){
 const num=STORY_REGION_NUMBERS[chapterId];
 if(!num)continue;
 for(const role of REGIONAL_ENEMY_ROLES){
  const def=set[role],base=E4_ROLE_BASES[role];
  if(!def||!base)continue;
  ENEMY_TYPES[`${chapterId}_${role}`]=scale(base,def.name,num,{
   role,chapterId,speciesId:`regional:${chapterId}:${role}`,regional:true,
   behaviorTags:[...(def.behaviorTags||[])],rareIdentity:role==='rare',
  });
 }
}

Object.assign(ENEMY_TYPES.grunt,{role:'normal',chapterId:'ch1',speciesId:'regional:ch1:normal'});
Object.assign(ENEMY_TYPES.fast,{role:'fast',chapterId:'ch1',speciesId:'global:bat'});
Object.assign(ENEMY_TYPES.tank,{role:'tank',chapterId:'ch1',speciesId:'regional:ch1:tank'});

// E5 pilot: materialize only globally plausible Ch1 species. This does not place
// them into waves by itself; Ch1 encounterPool metadata decides whether they can appear.
const CH1_GLOBAL_PILOT=Object.freeze([
 ['ch1_global_slime','slime','grunt'],
 ['ch1_global_goblin','goblin','ch1_attacker'],
 ['ch1_global_wolf','wolf','fast'],
]);
for(const [id,speciesId,anchorId] of CH1_GLOBAL_PILOT){
 const globalEnemy=materializeGlobalSpecies(speciesId,ENEMY_TYPES[anchorId]);
 if(globalEnemy)ENEMY_TYPES[id]={...globalEnemy,chapterId:'ch1',encounterPilot:true};
}

const ARCHEON=ENEMY_TYPES.ch25_boss;
ENEMY_TYPES.raid_archeon={
 ...ARCHEON,
 name:'境界王アルケオン・零界再臨',
 hp:Math.round(ARCHEON.hp*1.8),
 atk:Math.round(ARCHEON.atk*1.25),
 def:Math.round(ARCHEON.def*1.15),
 xp:Math.round(ARCHEON.xp*1.6),
 gold:Math.round(ARCHEON.gold*1.6),
 boss:true,
 raid:true,
};
