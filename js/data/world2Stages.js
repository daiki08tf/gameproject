import { buildAbyssStage } from './abyss.js';
import { KEY_DUNGEON_TYPES } from './world2.js';

const DEPTH_BY_KEY=Object.freeze({verdant:35,celestial:180,infernal:360,anomaly:620});
const PRESENTATION=Object.freeze({
 verdant:{name:'鍵界・翠の獣道',tags:['wind','earth'],identity:'育成探索',goal:'仲間・卵・自然系素材を狙う探索路',mod:{id:'world2_verdant',name:'繁茂する境界',desc:'魔物の気配が濃い。仲間・卵探索向け'}},
 celestial:{name:'鍵界・天門回廊',tags:['light','wind'],identity:'聖域探索',goal:'Relic・光属性装備・高位素材を狙う天界側ルート',mod:{id:'world2_celestial',name:'天光圧',desc:'高位の光が満ちる。Break中のBurstを活かし、Relic探索を狙う'}},
 infernal:{name:'鍵界・奈落回廊',tags:['dark','fire'],identity:'高危険探索',goal:'Unique・闇/炎系装備を狙う冥界側ルート',mod:{id:'world2_infernal',name:'奈落圧',desc:'回復しづらい危険領域。短期決戦とUnique探索向け'}},
 anomaly:{name:'鍵界・境界異常点',tags:['light','dark'],identity:'境界観測',goal:'報酬よりも未知世界の情報更新が主目的',mod:{id:'world2_anomaly',name:'未知の雑音',desc:'遠くで機械のような音が聞こえる。繰り返し踏破で信号の正体に近づく'}},
});
export function world2KeyStageId(typeId){return `secret-worldkey-${typeId}`;}
export function world2KeyStageDescriptor(typeId){const def=KEY_DUNGEON_TYPES[typeId],p=PRESENTATION[typeId];if(!def||!p)return null;const depth=DEPTH_BY_KEY[typeId];const base=buildAbyssStage(depth,[],{suppressModifiers:true});return{id:world2KeyStageId(typeId),name:p.name,recLevel:base.recLevel,rewards:{gold:Math.round(base.rewards.gold*1.15),exp:Math.round(base.rewards.exp*1.12)},world2KeyType:typeId,world2Realm:def.realm,world3Identity:p.identity,world3Goal:p.goal,branch:true,keyDungeon:true,dropRegionTags:p.tags,modifiers:[p.mod]};}
export function buildWorld2KeyStage(typeId){const d=world2KeyStageDescriptor(typeId);if(!d)return null;const base=buildAbyssStage(DEPTH_BY_KEY[typeId],[],{suppressModifiers:true});return{...base,...d,isAbyss:false,abyssDepth:null,secretRealm:false,keyDungeon:true,dropMult:(base.dropMult||1)*(typeId==='celestial'?1.22:typeId==='infernal'?1.28:1.18),healMult:typeId==='infernal'?Math.min(base.healMult||1,.65):(base.healMult||1),rewards:d.rewards,modifiers:d.modifiers,dropRegionTags:d.dropRegionTags};}
export function world2KeyStageDescriptors(){return Object.keys(KEY_DUNGEON_TYPES).map(world2KeyStageDescriptor).filter(Boolean);}
