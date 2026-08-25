/* Phase 8 — canonical 15C2 Fusion Job registry. */
export const BASIC_FUSION_JOB_IDS = Object.freeze(["warrior", "fighter", "mage", "priest", "thief", "merchant", "hunter", "ninja", "bard", "dancer", "alchemist", "scholar", "farmer", "craftsman", "fortune"]);

const FUSION_NAMES = Object.freeze(["羅刹", "魔法剣士", "パラディン", "剣豪", "傭兵団長", "魔獣騎士", "影武者", "戦歌騎士", "剣舞士", "錬装騎士", "戦術士", "守土兵", "城塞騎士", "運命騎士", "魔闘士", "羅漢", "暗殺拳", "剣闘士", "獣闘士", "修羅", "鼓舞闘士", "舞闘家", "錬体士", "拳理士", "豪傑", "鉄拳工", "星拳士", "賢者", "魔導暗殺者", "魔晶商", "魔弓士", "忍術師", "詠唱楽師", "幻術舞師", "錬成魔導師", "大魔導士", "自然術師", "魔導工匠", "星詠みの魔女", "異端審問官", "聖務官", "聖猟師", "退魔忍", "聖歌師", "神楽巫女", "薬師", "神学者", "豊穣司祭", "神殿守", "巫女", "トレジャーハンター", "追跡者", "怪盗", "トリックスター", "幻影盗賊", "毒術師", "遺物探究家", "野伏", "罠師", "詐術師", "賞金稼ぎ", "影商人", "興行師", "旅芸商", "錬金商", "大商人", "豪農", "ギルドマスター", "相場師", "影狩人", "森の吟遊詩人", "風弓舞", "魔弾師", "魔物学者", "開拓猟師", "機巧弓師", "星狩人", "影奏者", "幻舞忍", "煙術師", "忍軍師", "草忍", "絡繰忍", "星影", "プリマ・ディーヴァ", "音響錬成師", "伝承学者", "牧歌詩人", "楽器工匠", "星詠み", "幻術師", "舞踏軍師", "豊穣舞姫", "機巧舞師", "運命舞姫", "アルカニスト", "薬草錬金師", "機工錬金師", "星辰錬金師", "博物学者", "技術士", "天文学者", "開拓者", "風水師", "宮大工"]);

const LEGACY_IDS = Object.freeze({
  "warrior+priest": "paladin",
  "warrior+fighter": "battlemaster",
  "warrior+mage": "spellblade",
  "warrior+thief": "swordsaint2",
  "warrior+craftsman": "armsknight",
  "mage+priest": "sage",
  "mage+scholar": "archmage",
  "mage+fortune": "astromancer",
  "priest+fortune": "miko",
  "priest+bard": "choirmaster",
  "thief+ninja": "phantomthief",
  "thief+merchant": "treasurehunter",
  "thief+hunter": "scoutmaster",
  "thief+dancer": "enchantdancer",
  "fighter+ninja": "fistsaint",
  "fighter+thief": "assassinfist",
  "fighter+hunter": "beasttamer",
  "fighter+farmer": "sumo",
  "hunter+ninja": "huntking",
  "hunter+bard": "forestbard",
  "bard+dancer": "primadiva",
  "bard+scholar": "loremaster",
  "dancer+fortune": "fatedancer",
  "dancer+alchemist": "illusionist",
  "alchemist+scholar": "arcanist",
  "alchemist+craftsman": "artificer",
  "merchant+scholar": "merchantlord",
  "merchant+craftsman": "guildmaster",
  "priest+farmer": "healerfolk",
  "farmer+craftsman": "ironyeoman"
});

function canonicalPair(a, b) {
  const ai = BASIC_FUSION_JOB_IDS.indexOf(a);
  const bi = BASIC_FUSION_JOB_IDS.indexOf(b);
  if (ai < 0 || bi < 0 || ai === bi) return null;
  return ai < bi ? [a, b] : [b, a];
}

export function fusionPairKey(a, b) {
  const pair = canonicalPair(a, b);
  return pair ? `${pair[0]}+${pair[1]}` : null;
}

const built = [];
let nameIndex = 0;
for (let i = 0; i < BASIC_FUSION_JOB_IDS.length; i++) {
  for (let j = i + 1; j < BASIC_FUSION_JOB_IDS.length; j++) {
    const parents = [BASIC_FUSION_JOB_IDS[i], BASIC_FUSION_JOB_IDS[j]];
    const key = `${parents[0]}+${parents[1]}`;
    const legacyId = LEGACY_IDS[key] || null;
    built.push(Object.freeze({
      id: legacyId || `fusion_${parents[0]}_${parents[1]}`,
      name: FUSION_NAMES[nameIndex++],
      parents: Object.freeze(parents),
      legacy: !!legacyId,
    }));
  }
}

export const FUSION_JOBS = Object.freeze(built);
const BY_PAIR = new Map(FUSION_JOBS.map((job) => [fusionPairKey(...job.parents), job]));
const BY_ID = new Map(FUSION_JOBS.map((job) => [job.id, job]));

export function getFusionJobByParents(a, b) {
  return BY_PAIR.get(fusionPairKey(a, b)) || null;
}

export function getFusionJobById(id) {
  return BY_ID.get(id) || null;
}

export function unlockedFusionJobs(masteredSet) {
  const mastered = masteredSet instanceof Set ? masteredSet : new Set(masteredSet || []);
  return FUSION_JOBS.filter((job) => job.parents.every((id) => mastered.has(id)));
}
