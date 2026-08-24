import { buildAbyssStage } from './abyss.js';
import { KEY_DUNGEON_TYPES } from './world2.js';

const DEPTH_BY_KEY=Object.freeze({verdant:35,celestial:180,infernal:360,anomaly:620});
const PRESENTATION=Object.freeze({
 verdant:{name:'鍵界・翠の獣道',tags:['wind','earth'],mod:{id:'world2_verdant',name:'繁茂する境界',desc:'魔物の気配が濃い。仲間・卵探索向け'}},
 celestial:{name:'鍵界・天門回廊',tags:['light','wind'],mod:{id:'world2_celestial',name:'天光圧',desc:'高位の光が満ちる。Relic探索向け'}},
 infernal:{name:'鍵界・奈落回廊',tags:['dark','fire'],mod:{id:'world2_infernal',name:'奈落圧',desc:'回復しづらい危険領域。Unique探索向け'}},
 anomaly:{name:'鍵界・境界異常点',tags:['light','dark'],mod:{id:'world2_anomaly',name:'未知の雑音',desc:'遠くで機械のような音が聞こえる……'}},
});
export function world2KeyStageId(typeId){return `secret-worldkey-${typeId}`;}
export function world2KeyStageDescriptor(typeId){const def=KEY_DUNGEON_TYPES[typeId],p=PRESENTATION[typeId];if(!def||!p)return null;const depth=DEPTH_BY_KEY[typeId];const base=buildAbyssStage(depth,[],{suppressModifiers:true});return{id:world2KeyStageId(typeId),name:p.name,recLevel:base.recLevel,rewards:{gold:Math.round(base.rewards.gold*1.15),exp:Math.round(base.rewards.exp*1.12)},world2KeyType:typeId,world2Realm:def.realm,branch:true,keyDungeon:true,dropRegionTags:p.tags,modifiers:[p.mod]};}
export function buildWorld2KeyStage(typeId){const d=world2KeyStageDescriptor(typeId);if(!d)return null;const base=buildAbyssStage(DEPTH_BY_KEY[typeId],[],{suppressModifiers:true});return{...base,...d,isAbyss:false,abyssDepth:null,secretRealm:false,keyDungeon:true,dropMult:(base.dropMult||1)*1.18,rewards:d.rewards,modifiers:d.modifiers,dropRegionTags:d.dropRegionTags};}
export function world2KeyStageDescriptors(){return Object.keys(KEY_DUNGEON_TYPES).map(world2KeyStageDescriptor).filter(Boolean);}
