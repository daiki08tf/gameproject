/* ============================================================
   Phase 8 — Job Fusion / Skill Constellation 3.0
   Full 15C2 = 105 pair registry. Existing 30 advanced IDs are preserved.
   ============================================================ */

export const BASIC_JOB_ORDER = Object.freeze([
  'warrior','fighter','mage','priest','thief','merchant','hunter','ninja','bard','dancer','alchemist','scholar','farmer','craftsman','fortune',
]);
const BASIC_JOB_INDEX = new Map(BASIC_JOB_ORDER.map((id, i) => [id, i]));
export const FUSION_SCHEMA_VERSION = 2;

export function canonicalParents(a,b){
  if(a===b) throw new Error('Fusion Job requires two different parent jobs.');
  const ai=BASIC_JOB_INDEX.get(a), bi=BASIC_JOB_INDEX.get(b);
  if(ai==null||bi==null) throw new Error(`Unknown basic job pair: ${a}, ${b}`);
  return ai<bi?[a,b]:[b,a];
}
export function fusionPairKey(a,b){ return canonicalParents(a,b).join('+'); }
export function generatedFusionId(a,b){ const [x,y]=canonicalParents(a,b); return `fusion_${x}_${y}`; }

const LEGACY = {
  'warrior+fighter':['battlemaster','羅刹'], 'warrior+mage':['spellblade','魔法剣士'], 'warrior+priest':['paladin','パラディン'],
  'warrior+thief':['swordsaint2','剣豪'], 'warrior+craftsman':['armsknight','アームズナイト'], 'fighter+thief':['assassinfist','暗殺拳'],
  'fighter+hunter':['beasttamer','猛獣使い'], 'fighter+ninja':['fistsaint','拳聖'], 'fighter+farmer':['sumo','剛力士'],
  'mage+priest':['sage','賢者'], 'mage+scholar':['archmage','大魔導士'], 'mage+fortune':['astromancer','星詠みの魔女'],
  'priest+bard':['choirmaster','聖歌隊長'], 'priest+farmer':['healerfolk','村の癒し手'], 'priest+fortune':['miko','巫女'],
  'thief+merchant':['treasurehunter','トレジャーハンター'], 'thief+hunter':['scoutmaster','密偵'], 'thief+ninja':['phantomthief','怪盗'],
  'thief+dancer':['enchantdancer','幻惑の舞姫'], 'merchant+scholar':['merchantlord','大商人'], 'merchant+craftsman':['guildmaster','ギルドマスター'],
  'hunter+ninja':['huntking','狩猟王'], 'hunter+bard':['forestbard','森の吟遊詩人'], 'bard+dancer':['primadiva','プリマ・ディーヴァ'],
  'bard+scholar':['loremaster','語り部'], 'dancer+alchemist':['illusionist','幻術師'], 'dancer+fortune':['fatedancer','運命の踊り子'],
  'alchemist+scholar':['arcanist','アルカニスト'], 'alchemist+craftsman':['artificer','魔導技師'], 'farmer+craftsman':['ironyeoman','鉄農兵'],
};

const NEW_NAMES = {
  'warrior+merchant':'傭兵団長','warrior+hunter':'魔獣騎士','warrior+ninja':'影武者','warrior+bard':'戦歌騎士','warrior+dancer':'剣舞士','warrior+alchemist':'錬装騎士','warrior+scholar':'軍師','warrior+farmer':'辺境守','warrior+fortune':'星護騎士',
  'fighter+mage':'魔闘家','fighter+priest':'羅漢','fighter+merchant':'剣闘士','fighter+bard':'戦鼓士','fighter+dancer':'舞闘家','fighter+alchemist':'錬体術師','fighter+scholar':'武学者','fighter+craftsman':'破城士','fighter+fortune':'天星拳士',
  'mage+thief':'魔刃使い','mage+merchant':'魔晶商人','mage+hunter':'魔弓使い','mage+ninja':'妖術忍','mage+bard':'魔奏師','mage+dancer':'幻舞術師','mage+alchemist':'錬成魔導師','mage+farmer':'ドルイド','mage+craftsman':'ルーンスミス',
  'priest+thief':'異端審問官','priest+merchant':'聖務官','priest+hunter':'退魔狩人','priest+ninja':'退魔忍','priest+dancer':'神楽巫','priest+alchemist':'薬師','priest+scholar':'神学者','priest+craftsman':'結界師',
  'thief+bard':'トリックスター','thief+alchemist':'毒使い','thief+scholar':'遺跡探究家','thief+farmer':'野伏','thief+craftsman':'仕掛師','thief+fortune':'イカサマ師',
  'merchant+hunter':'賞金稼ぎ','merchant+ninja':'影商人','merchant+bard':'興行師','merchant+dancer':'旅芸人','merchant+alchemist':'錬金商人','merchant+farmer':'豪農','merchant+fortune':'相場師',
  'hunter+dancer':'風舞弓士','hunter+alchemist':'魔弾師','hunter+scholar':'魔物学者','hunter+farmer':'レンジャー','hunter+craftsman':'機巧猟兵','hunter+fortune':'星狩人',
  'ninja+bard':'影奏者','ninja+dancer':'幻舞忍','ninja+alchemist':'煙術師','ninja+scholar':'忍軍師','ninja+farmer':'草忍','ninja+craftsman':'絡繰忍','ninja+fortune':'星影',
  'bard+alchemist':'音錬師','bard+farmer':'牧歌詩人','bard+craftsman':'楽器職人','bard+fortune':'星詠み',
  'dancer+scholar':'舞踏学士','dancer+farmer':'豊穣の舞姫','dancer+craftsman':'人形遣い',
  'alchemist+farmer':'薬草師','alchemist+fortune':'星辰錬金術師','scholar+farmer':'博物学者','scholar+craftsman':'技師','scholar+fortune':'天文学者','farmer+fortune':'風水師','craftsman+fortune':'宮大工',
};

const IDENTITY = {
 warrior:['guard','break'], fighter:['combo','momentum'], mage:['arcane','element'], priest:['faith','heal'], thief:['opportunity','crit'],
 merchant:['gold','supply'], hunter:['mark','hunt'], ninja:['shadow','status'], bard:['song','tempo'], dancer:['dance','evade'],
 alchemist:['reagent','reaction'], scholar:['analysis','insight'], farmer:['vitality','harvest'], craftsman:['construct','fortify'], fortune:['fate','omen'],
};

export function defineFusionJob({id,name,parents,source='fusion',fusionTrait=null,resourceInteraction=null,constellation=null,lootTags=[]}){
  const p=canonicalParents(parents[0],parents[1]);
  return Object.freeze({schemaVersion:FUSION_SCHEMA_VERSION,id,name,parents:Object.freeze(p),source,fusionTrait,resourceInteraction,constellation,lootTags:Object.freeze([...lootTags])});
}

function autoDefinition(a,b){
  const key=fusionPairKey(a,b), legacy=LEGACY[key], name=legacy?.[1]||NEW_NAMES[key];
  if(!name) throw new Error(`Missing Fusion Job name: ${key}`);
  const [ia,ib]=[IDENTITY[a],IDENTITY[b]];
  return defineFusionJob({
    id:legacy?.[0]||generatedFusionId(a,b), name, parents:[a,b], source:legacy?'legacy':'fusion',
    fusionTrait:{id:`fusion_trait_${a}_${b}`,summary:`${ia[0]}と${ib[0]}を融合し、両親職の行動を連鎖させる。`,tags:[...ia,...ib]},
    resourceInteraction:{id:`fusion_resource_${a}_${b}`,inputs:[ia[0],ib[0]],output:'fusion',summary:`${ia[0]}と${ib[0]}の蓄積・消費を相互作用させる。`},
    constellation:{prototype:'fusion_dual_branch',core:[a,b],branches:[ia[0],ib[0]],keystone:`keystone_${a}_${b}`,ultimate:`ultimate_${a}_${b}`},
    lootTags:[...new Set([...ia,...ib])],
  });
}

export const ALL_FUSION_JOBS = Object.freeze(BASIC_JOB_ORDER.flatMap((a,i)=>BASIC_JOB_ORDER.slice(i+1).map(b=>autoDefinition(a,b))));
export const FUSION_BY_PAIR = new Map(ALL_FUSION_JOBS.map(j=>[fusionPairKey(...j.parents),j]));
export const FUSION_BY_ID = new Map(ALL_FUSION_JOBS.map(j=>[j.id,j]));
export function getFusionJob(a,b){ return FUSION_BY_PAIR.get(fusionPairKey(a,b))??null; }
export function getFusionJobById(id){ return FUSION_BY_ID.get(id)??null; }
export function newFusionJobs(){ return ALL_FUSION_JOBS.filter(j=>j.source==='fusion'); }

export function validateFusionDefinitions(defs=ALL_FUSION_JOBS){
  const ids=new Set(),pairs=new Set(),names=new Set(),errors=[];
  for(const j of defs){const p=fusionPairKey(...j.parents); if(ids.has(j.id))errors.push(`duplicate id: ${j.id}`); if(pairs.has(p))errors.push(`duplicate pair: ${p}`); if(names.has(j.name))errors.push(`duplicate name: ${j.name}`); ids.add(j.id);pairs.add(p);names.add(j.name);}
  if(defs===ALL_FUSION_JOBS&&defs.length!==105)errors.push(`expected 105 jobs, got ${defs.length}`);
  if(defs===ALL_FUSION_JOBS&&defs.filter(j=>j.source==='legacy').length!==30)errors.push('expected 30 legacy jobs');
  if(defs===ALL_FUSION_JOBS&&defs.filter(j=>j.source==='fusion').length!==75)errors.push('expected 75 new fusion jobs');
  return Object.freeze({ok:errors.length===0,errors:Object.freeze(errors),counts:Object.freeze({ids:ids.size,pairs:pairs.size,names:names.size,legacy:defs.filter(j=>j.source==='legacy').length,fusion:defs.filter(j=>j.source==='fusion').length})});
}

export const FUSION_VALIDATION = validateFusionDefinitions();
if(!FUSION_VALIDATION.ok) throw new Error(`Invalid Phase 8 Fusion registry: ${FUSION_VALIDATION.errors.join('; ')}`);
