/* Enemy 2.0 E6 — role-first Encounter Templates. */
import { weightedEncounterPick } from './encounterPools2.js';

export const ENCOUNTER_TEMPLATES_2=Object.freeze({
  mixed:Object.freeze({id:'mixed',name:'混成',weight:1.30,roles:Object.freeze(['normal','fast','attacker'])}),
  pack:Object.freeze({id:'pack',name:'群れ',weight:.90,roles:Object.freeze(['fast','attacker','fast'])}),
  frontline:Object.freeze({id:'frontline',name:'前衛陣',weight:1.00,roles:Object.freeze(['tank','attacker','normal'])}),
  escort:Object.freeze({id:'escort',name:'護衛陣',weight:.60,roles:Object.freeze(['tank','support','caster'])}),
  ambush:Object.freeze({id:'ambush',name:'奇襲陣',weight:.80,roles:Object.freeze(['trickster','fast','attacker'])}),
  bulwark:Object.freeze({id:'bulwark',name:'防壁陣',weight:.60,roles:Object.freeze(['tank','support','tank'])}),
});

export const CH1_TEMPLATE_IDS=Object.freeze(['mixed','pack','frontline','escort','ambush','bulwark']);

function safePoolEntries(stage,enemyTypes){
  return (stage?.encounterPool?.types||[]).filter(entry=>{
    const enemy=enemyTypes?.[entry?.type];
    return enemy&&!enemy.boss&&!enemy.rareIdentity&&!enemy.elite;
  });
}

export function resolveEncounterRoleType(stage,role,enemyTypes,rng=Math.random,fallbackType=null){
  const safe=safePoolEntries(stage,enemyTypes);
  const exact=safe.filter(entry=>enemyTypes[entry.type]?.role===role);
  return weightedEncounterPick(exact.length?exact:safe,rng)||fallbackType;
}

export function weightedEncounterTemplate(stage,rng=Math.random){
  const ids=stage?.encounterPool?.templates||[];
  const entries=ids.map(id=>ENCOUNTER_TEMPLATES_2[id]).filter(Boolean)
    .map(t=>({type:t.id,weight:t.weight}));
  const id=weightedEncounterPick(entries,rng);
  return id?ENCOUNTER_TEMPLATES_2[id]:null;
}

export function planRoleFirstEncounter(stage,spec,enemyTypes,rng=Math.random){
  const originalType=spec?.type;
  const count=Math.max(0,Math.floor(Number(spec?.count)||0));
  const original=enemyTypes?.[originalType];
  if(!count||!original||original.boss||!stage?.encounterPool?.templates?.length)return null;
  const template=weightedEncounterTemplate(stage,rng);
  if(!template)return null;
  const roles=[];
  const types=[];
  for(let i=0;i<count;i++){
    const role=template.roles[i%template.roles.length];
    roles.push(role);
    types.push(resolveEncounterRoleType(stage,role,enemyTypes,rng,originalType)||originalType);
  }
  return Object.freeze({templateId:template.id,templateName:template.name,roles:Object.freeze(roles),types:Object.freeze(types)});
}
