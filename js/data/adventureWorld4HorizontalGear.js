/* Adventure / World 4.0 — W30 Endgame Horizontal Gear.
   Read-only Adventure-facing view over the existing Unique 2.0 / endgame loot
   authorities. It never rolls, grants, upgrades, or rescales equipment. */
import { BOUNTY_UNIQUES } from './uniqueEquipment.js';
import { endgameLootRole } from './endgameLootRoles.js';

const NAME_SOURCE=Object.freeze({
  '終王斧グリムヘッド':'abyss',
  '連星拳アルカ':'abyss',
  '残光弓アステリオン':'rift',
  '葬毒刃ミアズマ':'rift',
});

function sourceFor(item){
  if(NAME_SOURCE[item?.name])return NAME_SOURCE[item.name];
  if(item?.bountyId)return 'nemesis';
  if(String(item?.sourceStageId||'').startsWith('machine-world-'))return 'machine';
  if(String(item?.sourceStageId||'').startsWith('secret-'))return 'secret_realm';
  return null;
}

function conditionalIdentity(item){
  const effects=Array.isArray(item?.effects)?item.effects:[];
  return !!item?.unique2IdentityId||effects.some(effect=>['bossDmg','normalEnemyDmgPenalty','executioner','actionDiversityBuff','critExtraAttack','guardNextAtkBuff','highHpDoubleAttack','spellArmsStarStrike'].includes(effect?.kind));
}

function activityLabel(source){
  if(source==='machine')return 'Machine World';
  return endgameLootRole(source)?.label||source;
}

export function adventure4HorizontalGearCatalog(items=BOUNTY_UNIQUES){
  return Object.freeze((Array.isArray(items)?items:[]).map(item=>{
    const source=sourceFor(item);
    if(!source||!item?.unique||!conditionalIdentity(item))return null;
    return Object.freeze({
      id:item.id,
      name:item.name,
      slot:item.slot,
      weaponType:item.weaponType||null,
      source,
      sourceLabel:activityLabel(source),
      identityId:item.unique2IdentityId||null,
      conditional:true,
      effectKinds:Object.freeze((item.effects||[]).map(effect=>effect?.kind).filter(Boolean)),
    });
  }).filter(Boolean));
}

export function adventure4HorizontalGearByActivity(source,items=BOUNTY_UNIQUES){
  return adventure4HorizontalGearCatalog(items).filter(item=>item.source===source);
}

export function adventure4HorizontalGearSummary(items=BOUNTY_UNIQUES){
  const catalog=adventure4HorizontalGearCatalog(items),byActivity={};
  for(const item of catalog)byActivity[item.source]=(byActivity[item.source]||0)+1;
  return Object.freeze({count:catalog.length,byActivity:Object.freeze(byActivity)});
}
