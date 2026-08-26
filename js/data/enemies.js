/* ============================================================
   敵データ定義
   第1章は既存のまま。第2章以降は chapter metadata から
   normal/fast/tank/boss を自動生成。16〜25章はmidbossも生成する。
   ============================================================ */
import { CHAPTER_SPECS, chapterMult } from './chapters.js';
import { CHAPTER_EXPANSION_16_20 } from './chapters16to20.js';
import { CHAPTER_EXPANSION_21_25 } from './chapters21to25.js';
import { ENEMY_SCALING, chapterScaleMult } from './balance.js';

export function hpMult(num) { return chapterScaleMult(ENEMY_SCALING.HP_BASE_MULT, ENEMY_SCALING.HP_EARLY_RATE, ENEMY_SCALING.HP_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function atkMult(num) { return chapterScaleMult(ENEMY_SCALING.ATK_BASE_MULT, ENEMY_SCALING.ATK_EARLY_RATE, ENEMY_SCALING.ATK_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function defMult(num) { return chapterScaleMult(ENEMY_SCALING.DEF_BASE_MULT, ENEMY_SCALING.DEF_EARLY_RATE, ENEMY_SCALING.DEF_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
export function bossHpMult(num) { return chapterScaleMult(ENEMY_SCALING.BOSS_HP_BASE_MULT, ENEMY_SCALING.BOSS_HP_EARLY_RATE, ENEMY_SCALING.BOSS_HP_LATE_RATE, ENEMY_SCALING.PIVOT_CHAPTER, num); }
const NORMAL_BASE={hp:26,atk:6,def:2,speed:95,radius:15,color:'#c9505f',xp:6,gold:4};
const FAST_BASE={hp:14,atk:4,def:0,speed:180,radius:11,color:'#e0c94a',xp:5,gold:3};
const TANK_BASE={hp:70,atk:11,def:5,speed:62,radius:22,color:'#8a5cd6',xp:14,gold:8};
const BOSS_BASE={hp:420,atk:16,def:8,speed:68,radius:34,color:'#e0553a',xp:120,gold:150,boss:true};
const MIDBOSS_BASE={hp:255,atk:14,def:7,speed:76,radius:28,color:'#d47748',xp:70,gold:65,boss:true};
const BRANCH_BASE={hp:150,atk:20,def:9,speed:70,radius:26,color:'#d68b3a',xp:40,gold:25,boss:true};
function scale(base,name,num){const isBoss=!!base.boss;return{...base,name,hp:Math.round(base.hp*(isBoss?bossHpMult(num):hpMult(num))),atk:Math.round(base.atk*atkMult(num)),def:Math.round(base.def*defMult(num)),xp:Math.round(base.xp*chapterMult(num)),gold:Math.round(base.gold*chapterMult(num))};}
export const ENEMY_TYPES={grunt:scale(NORMAL_BASE,'ゴブリン',1),fast:scale(FAST_BASE,'コウモリ',1),tank:scale(TANK_BASE,'オーガ',1),boss_orcking:scale(BOSS_BASE,'オークキング',1),branch_goblin_chief:scale(BRANCH_BASE,'ゴブリンの頭目',1)};
export const ALL_CHAPTER_SPECS=[...CHAPTER_SPECS,...CHAPTER_EXPANSION_16_20,...CHAPTER_EXPANSION_21_25];
for(const ch of ALL_CHAPTER_SPECS){
 ENEMY_TYPES[`${ch.id}_normal`]=scale(NORMAL_BASE,ch.enemies.normal,ch.num);
 ENEMY_TYPES[`${ch.id}_fast`]=scale(FAST_BASE,ch.enemies.fast,ch.num);
 ENEMY_TYPES[`${ch.id}_tank`]=scale(TANK_BASE,ch.enemies.tank,ch.num);
 ENEMY_TYPES[`${ch.id}_boss`]=scale(BOSS_BASE,ch.enemies.boss,ch.num);
 if(ch.midboss)ENEMY_TYPES[`${ch.id}_midboss`]=scale(MIDBOSS_BASE,ch.midboss.enemyName,ch.num);
 if(ch.branch)ENEMY_TYPES[`${ch.id}_branchboss`]=scale(BRANCH_BASE,ch.branch.enemyName,ch.num);
}

// Official Phase 10-E — first Raid reuses the Ch25 combat vocabulary but is
// deliberately only a moderate numeric step. Its real difficulty comes from
// guards, phase changes and Break timing in bossEncounters.js, not an HP sponge.
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
