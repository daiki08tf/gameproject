/* ============================================================
   Companion species definitions
   ============================================================ */
import { RANCH_REGION_SPECIES, RANCH_SPECIES_TRAIT_EFFECTS } from './monsterRanchSpecies.js';

export const COMPANION_RARITY = ['normal', 'rare', 'epic', 'legendary', 'mythic'];
export const COMPANION_RARITY_LABEL = { normal:'ノーマル', rare:'レア', epic:'エピック', legendary:'レジェンダリー', mythic:'ミシック' };
export const COMPANION_NATURES = {
  balanced:{name:'素直',statMult:{}}, brave:{name:'勇敢',statMult:{atk:1.08,def:.97},ai:'aggressive'},
  cautious:{name:'慎重',statMult:{def:1.08,spd:.97},ai:'defensive'}, clever:{name:'賢い',statMult:{mag:1.08,hp:.97},ai:'support'},
  quick:{name:'せっかち',statMult:{spd:1.08,def:.97},ai:'aggressive'},
};

export const COMPANION_TRAIT_EFFECTS = Object.freeze({
  'ぷにぷにボディ': { kind:'physicalMitigation', power:.10, desc:'通常攻撃の被ダメージ -10%' },
  '悪知恵': { kind:'lowHpDamage', power:.15, threshold:.50, desc:'HP50%以下の敵へのダメージ +15%' },
  '夜目': { kind:'initiativeSpd', power:.15, desc:'行動順判定時のSPD +15%' },
  '灰の執念': { kind:'lowHpDamage', power:.20, threshold:.40, desc:'HP40%以下の敵へのダメージ +20%' },
  '雷駆': { kind:'initiativeSpd', power:.22, desc:'行動順判定時のSPD +22%' },
  '晶殻': { kind:'physicalMitigation', power:.14, desc:'通常攻撃の被ダメージ -14%' },
  '腐食嗅覚': { kind:'lowHpDamage', power:.18, threshold:.50, desc:'HP50%以下の敵へのダメージ +18%' },
  '機械装甲': { kind:'physicalMitigation', power:.18, desc:'通常攻撃の被ダメージ -18%' },
  ...RANCH_SPECIES_TRAIT_EFFECTS,
});
export function companionTraitEffect(name){return COMPANION_TRAIT_EFFECTS[name]||null;}
export function companionTraitLabel(name){const effect=companionTraitEffect(name);return effect?`${name}（${effect.desc}）`:name;}

export const COMPANION_SPECIES = Object.freeze({
  slime:{id:'slime',name:'スライム',type:'monster',family:'slime',regionId:'ch1',regionName:'はじまりの平原',icon:'🔵',baseStats:{hp:42,mp:10,atk:8,def:7,mag:4,spd:7},growth:{hp:5.2,mp:1.1,atk:1.7,def:1.5,mag:.9,spd:.7},recruit:{baseChance:.12},traits:['ぷにぷにボディ'],skills:[{level:1,id:'body_attack'},{level:8,id:'slime_heal'}]},
  goblin:{id:'goblin',name:'ゴブリン',type:'monster',family:'beast',regionId:'ch1',regionName:'はじまりの平原',enemyType:'grunt',icon:'👺',baseStats:{hp:48,mp:6,atk:11,def:6,mag:2,spd:8},growth:{hp:5.6,mp:.7,atk:2,def:1.3,mag:.5,spd:.8},recruit:{baseChance:.08},traits:['悪知恵'],skills:[{level:1,id:'club_hit'},{level:10,id:'dirty_trick'}]},
  bat:{id:'bat',name:'コウモリ',type:'monster',family:'beast',regionId:'ch1',regionName:'はじまりの平原',enemyType:'fast',icon:'🦇',baseStats:{hp:30,mp:9,atk:7,def:4,mag:5,spd:13},growth:{hp:4,mp:1,atk:1.3,def:.8,mag:1,spd:1.2},recruit:{baseChance:.10},traits:['夜目'],skills:[{level:1,id:'bite'},{level:9,id:'sonic'}]},
  ash_soldier:{id:'ash_soldier',name:'灰骸兵',type:'monster',family:'undead',regionId:'ch11',regionName:'灰冠の旧都',enemyType:'ch11_normal',icon:'🔥',baseStats:{hp:88,mp:14,atk:20,def:17,mag:8,spd:10},growth:{hp:8.2,mp:1.2,atk:2.8,def:2.4,mag:1.1,spd:.9},recruit:{baseChance:.045},traits:['灰の執念'],skills:[{level:1,id:'ash_slash'},{level:24,id:'dirty_trick'}]},
  thunder_beast:{id:'thunder_beast',name:'雷羽獣',type:'monster',family:'beast',regionId:'ch12',regionName:'天雷の浮島',enemyType:'ch12_normal',icon:'⚡',baseStats:{hp:72,mp:18,atk:18,def:12,mag:14,spd:22},growth:{hp:7,mp:1.5,atk:2.5,def:1.7,mag:2,spd:1.7},recruit:{baseChance:.04},traits:['雷駆'],skills:[{level:1,id:'thunder_claw'},{level:26,id:'sonic'}]},
  crystal_bug:{id:'crystal_bug',name:'蒼晶蟲',type:'monster',family:'beast',regionId:'ch13',regionName:'蒼晶深層',enemyType:'ch13_normal',icon:'💎',baseStats:{hp:104,mp:24,atk:13,def:24,mag:21,spd:8},growth:{hp:9.4,mp:1.9,atk:1.8,def:3,mag:2.7,spd:.6},recruit:{baseChance:.038},traits:['晶殻'],skills:[{level:1,id:'crystal_ray'},{level:28,id:'slime_heal'}]},
  rot_beast:{id:'rot_beast',name:'腐苔獣',type:'monster',family:'beast',regionId:'ch14',regionName:'腐緑の樹海',enemyType:'ch14_normal',icon:'🌿',baseStats:{hp:112,mp:16,atk:23,def:18,mag:10,spd:11},growth:{hp:10,mp:1.2,atk:3,def:2.4,mag:1.4,spd:.8},recruit:{baseChance:.035},traits:['腐食嗅覚'],skills:[{level:1,id:'rot_bite'},{level:30,id:'dirty_trick'}]},
  iron_hound:{id:'iron_hound',name:'鉄歯機兵',type:'monster',family:'construct',regionId:'ch15',regionName:'黒鉄機城',enemyType:'ch15_normal',icon:'⚙️',baseStats:{hp:128,mp:12,atk:26,def:28,mag:7,spd:13},growth:{hp:11,mp:.9,atk:3.3,def:3.4,mag:.8,spd:1},recruit:{baseChance:.03},traits:['機械装甲'],skills:[{level:1,id:'iron_fang'},{level:32,id:'club_hit'}]},
  ...RANCH_REGION_SPECIES,
});

export function getCompanionSpecies(id){return COMPANION_SPECIES[id]||null;}
export function companionExpToNext(level){return Math.round(18+level*14+Math.pow(level,1.5)*1.8);}
export function companionStats(species,instance){
  const lv=Math.max(1,instance.level||1),nature=COMPANION_NATURES[instance.nature]||COMPANION_NATURES.balanced,talent=instance.talent||{},board=instance.ranchBoardMult||{},out={};
  for(const stat of ['hp','mp','atk','def','mag','spd']){const raw=species.baseStats[stat]+species.growth[stat]*(lv-1),talentMult=talent[stat]||1,natureMult=(nature.statMult&&nature.statMult[stat])||1,boardMult=board[stat]||1;out[stat]=Math.max(1,Math.round(raw*talentMult*natureMult*boardMult));}
  return out;
}
