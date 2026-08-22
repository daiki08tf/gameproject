/* ============================================================
   職業データ定義
   基本職(15) → 上級職(30) → 特級職(10) → 勇者(1)
   ・レベル上限なし（青天井）
   ・転職可能レベル / マスター基準レベル は tier ごとに定義
   ・上位職の能力プロファイルは、必要職(requires)のプロファイルを
     自動平均して算出する（手動で全部書かない）
   ============================================================ */

import { CHARACTER_LAYER, JOB_TIER, CAPS_LAYER } from './balance.js';

export const STAT_KEYS = ['hp', 'mp', 'atk', 'def', 'mag', 'spd', 'crit'];

// tier ごとの基準値（js/data/balance.js に集約。数値調整はそちらで行う）
export const TIER_INFO = JOB_TIER;

// レベル1時点の素の基礎値／1レベルあたりの素の伸び（tier補正前）
const STAT_BASE = CHARACTER_LAYER.STAT_BASE;
const STAT_GROWTH = CHARACTER_LAYER.STAT_GROWTH;

function profileOf(k, v) { return { hp: 1, mp: 1, atk: 1, def: 1, mag: 1, spd: 1, crit: 1, [k]: v }; }
function mergeProfiles(profiles) {
  const out = {};
  for (const k of STAT_KEYS) {
    out[k] = profiles.reduce((s, p) => s + p[k], 0) / profiles.length;
  }
  return out;
}

// ---------------------------------------------------------
// 基本職 15種（プロファイル・スキルは手動定義）
// ---------------------------------------------------------
// masterBonus：MASTERすると現在職に関係なく永続で得る小さなボーナス
// （転生2.0で構想している「職業MASTER」の本来仕様：職業ごとに個性を持たせる）
const BASIC_RAW = [
  { id: 'warrior', name: '戦士', desc: 'HP・防御が高い前衛。剣と盾を扱う。', weapon: 'sword',
    profile: { hp: 1.6, mp: 0.4, atk: 1.3, def: 1.6, mag: 0.3, spd: 0.8, crit: 0.8 },
    skill: { name: '渾身の一撃', type: 'damage', power: 22, mpCost: 6, cooldown: 3.2 },
    masterBonus: { kind: 'stat', stat: 'hp', pct: 0.02 } },
  { id: 'fighter', name: '武闘家', desc: '攻撃と素早さに優れる拳闘士。', weapon: 'knuckle',
    profile: { hp: 1.2, mp: 0.4, atk: 1.6, def: 0.9, mag: 0.3, spd: 1.3, crit: 1.4 },
    skill: { name: '連撃拳', type: 'damage', power: 18, mpCost: 6, cooldown: 2.6 },
    masterBonus: { kind: 'stat', stat: 'spd', pct: 0.02 } },
  { id: 'mage', name: '魔法使い', desc: '攻撃魔法特化。打たれ弱い。', weapon: 'staff',
    profile: { hp: 0.6, mp: 2.0, atk: 0.4, def: 0.5, mag: 2.0, spd: 0.8, crit: 0.7 },
    skill: { name: 'ファイアボルト', type: 'damage', power: 30, mpCost: 12, cooldown: 3.6 },
    masterBonus: { kind: 'skillPower', pct: 0.02 } },
  { id: 'priest', name: '僧侶', desc: '回復・補助魔法を扱う支援職。', weapon: 'rod',
    profile: { hp: 0.9, mp: 1.8, atk: 0.5, def: 0.9, mag: 1.6, spd: 0.7, crit: 0.6 },
    skill: { name: 'ヒール', type: 'heal', power: 34, mpCost: 10, cooldown: 4.0 },
    masterBonus: { kind: 'healPower', pct: 0.03 } },
  { id: 'thief', name: '盗賊', desc: '素早さと回避に優れる。', passive: { drop: 1.15 }, weapon: 'dagger',
    profile: { hp: 0.8, mp: 0.6, atk: 1.1, def: 0.6, mag: 0.4, spd: 1.7, crit: 1.6 },
    skill: { name: 'くらやみ斬り', type: 'damage', power: 20, mpCost: 7, cooldown: 2.8 },
    masterBonus: { kind: 'passive', channel: 'drop', pct: 0.02 } },
  { id: 'merchant', name: '商人', desc: '所持金・ドロップ率にボーナス。', passive: { gold: 1.3 }, weapon: 'sword',
    profile: { hp: 0.8, mp: 0.8, atk: 0.6, def: 0.7, mag: 0.6, spd: 0.8, crit: 0.9 },
    skill: { name: '黄金の一撃', type: 'damage', power: 16, mpCost: 5, cooldown: 2.4 },
    masterBonus: { kind: 'passive', channel: 'gold', pct: 0.02 } },
  { id: 'hunter', name: '狩人', desc: '弓を使い対モンスターに強い。', weapon: 'bow',
    profile: { hp: 0.9, mp: 0.6, atk: 1.4, def: 0.7, mag: 0.5, spd: 1.3, crit: 1.3 },
    skill: { name: '貫通の矢', type: 'damage', power: 24, mpCost: 8, cooldown: 3.0 },
    masterBonus: { kind: 'stat', stat: 'atk', pct: 0.02 } },
  { id: 'ninja', name: '忍者', desc: '素早く状態異常を得意とする。', weapon: 'dagger',
    profile: { hp: 0.8, mp: 0.7, atk: 1.2, def: 0.6, mag: 0.6, spd: 1.8, crit: 1.5 },
    skill: { name: '分身斬り', type: 'damage', power: 26, mpCost: 9, cooldown: 3.0 },
    masterBonus: { kind: 'stat', stat: 'crit', pct: 0.02 } },
  { id: 'bard', name: '吟遊詩人', desc: '鼓舞の歌で自身を強化する。', weapon: 'instrument',
    profile: { hp: 0.8, mp: 1.3, atk: 0.6, def: 0.6, mag: 1.1, spd: 1.0, crit: 0.8 },
    skill: { name: '鼓舞の歌', type: 'buff', power: 26, mpCost: 10, cooldown: 6.0 },
    masterBonus: { kind: 'stat', stat: 'mag', pct: 0.02 } },
  { id: 'dancer', name: '踊り子', desc: '幻惑の舞で敵を翻弄する。', weapon: 'instrument',
    profile: { hp: 0.7, mp: 1.1, atk: 0.7, def: 0.5, mag: 1.0, spd: 1.4, crit: 1.2 },
    skill: { name: '幻惑の舞', type: 'buff', power: 22, mpCost: 9, cooldown: 5.4 },
    masterBonus: { kind: 'stat', stat: 'spd', pct: 0.02 } },
  { id: 'alchemist', name: '錬金術師', desc: '爆薬や状態異常攻撃を操る。', weapon: 'staff',
    profile: { hp: 0.7, mp: 1.5, atk: 0.8, def: 0.6, mag: 1.5, spd: 0.8, crit: 0.9 },
    skill: { name: '爆裂薬', type: 'damage', power: 28, mpCost: 11, cooldown: 3.4 },
    masterBonus: { kind: 'skillPower', pct: 0.02 } },
  { id: 'scholar', name: '学者', desc: '弱点看破で経験値効率が良い。', passive: { exp: 1.2 }, weapon: 'staff',
    profile: { hp: 0.7, mp: 1.4, atk: 0.5, def: 0.6, mag: 1.4, spd: 0.7, crit: 0.7 },
    skill: { name: '弱点看破', type: 'buff', power: 24, mpCost: 9, cooldown: 5.6 },
    masterBonus: { kind: 'passive', channel: 'exp', pct: 0.02 } },
  { id: 'farmer', name: '農民', desc: '打たれ強く鎌を振り回す。', passive: { drop: 1.1 }, weapon: 'axe',
    profile: { hp: 1.7, mp: 0.4, atk: 0.9, def: 1.3, mag: 0.3, spd: 0.7, crit: 0.6 },
    skill: { name: '鎌払い', type: 'damage', power: 20, mpCost: 6, cooldown: 2.8 },
    masterBonus: { kind: 'stat', stat: 'def', pct: 0.02 } },
  { id: 'craftsman', name: '大工', desc: '鉄壁の構えで守りを固める。', weapon: 'axe',
    profile: { hp: 1.3, mp: 0.4, atk: 0.9, def: 1.5, mag: 0.4, spd: 0.6, crit: 0.6 },
    skill: { name: '鉄壁の構え', type: 'buff', power: 20, mpCost: 8, cooldown: 5.2 },
    masterBonus: { kind: 'stat', stat: 'def', pct: 0.02 } },
  { id: 'fortune', name: '占い師', desc: '運を操りクリティカルを引き寄せる。', weapon: 'rod',
    profile: { hp: 0.7, mp: 1.2, atk: 0.6, def: 0.5, mag: 1.2, spd: 1.0, crit: 1.8 },
    skill: { name: '運命の逆転', type: 'buff', power: 20, mpCost: 8, cooldown: 5.0 },
    masterBonus: { kind: 'stat', stat: 'crit', pct: 0.02 } },
];

// ---------------------------------------------------------
// 上級職 30種（必要基本職2つ。プロファイル/スキルは自動生成）
// ---------------------------------------------------------
const ADVANCED_RAW = [
  { id: 'paladin', name: 'パラディン', requires: ['warrior', 'priest'] },
  { id: 'battlemaster', name: 'バトルマスター', requires: ['warrior', 'fighter'] },
  { id: 'spellblade', name: '魔法剣士', requires: ['warrior', 'mage'] },
  { id: 'swordsaint2', name: '剣豪', requires: ['warrior', 'thief'] },
  { id: 'armsknight', name: 'アームズナイト', requires: ['warrior', 'craftsman'] },
  { id: 'sage', name: '賢者', requires: ['mage', 'priest'] },
  { id: 'archmage', name: '大魔導士', requires: ['mage', 'scholar'] },
  { id: 'astromancer', name: '星詠みの魔女', requires: ['mage', 'fortune'] },
  { id: 'miko', name: '巫女', requires: ['priest', 'fortune'] },
  { id: 'choirmaster', name: '聖歌隊長', requires: ['priest', 'bard'] },
  { id: 'phantomthief', name: '怪盗', requires: ['thief', 'ninja'] },
  { id: 'treasurehunter', name: 'トレジャーハンター', requires: ['thief', 'merchant'] },
  { id: 'scoutmaster', name: '密偵', requires: ['thief', 'hunter'] },
  { id: 'enchantdancer', name: '幻惑の舞姫', requires: ['thief', 'dancer'] },
  { id: 'fistsaint', name: '拳聖', requires: ['fighter', 'ninja'] },
  { id: 'assassinfist', name: '暗殺拳', requires: ['fighter', 'thief'] },
  { id: 'beasttamer', name: '猛獣使い', requires: ['fighter', 'hunter'] },
  { id: 'sumo', name: '剛力士', requires: ['fighter', 'farmer'] },
  { id: 'huntking', name: '狩猟王', requires: ['hunter', 'ninja'] },
  { id: 'forestbard', name: '森の吟遊詩人', requires: ['hunter', 'bard'] },
  { id: 'primadiva', name: 'プリマ・ディーヴァ', requires: ['bard', 'dancer'] },
  { id: 'loremaster', name: '語り部', requires: ['bard', 'scholar'] },
  { id: 'fatedancer', name: '運命の踊り子', requires: ['dancer', 'fortune'] },
  { id: 'illusionist', name: '幻術師', requires: ['dancer', 'alchemist'] },
  { id: 'arcanist', name: 'アルカニスト', requires: ['alchemist', 'scholar'] },
  { id: 'artificer', name: '魔導技師', requires: ['alchemist', 'craftsman'] },
  { id: 'merchantlord', name: '大商人', requires: ['merchant', 'scholar'] },
  { id: 'guildmaster', name: 'ギルドマスター', requires: ['merchant', 'craftsman'] },
  { id: 'healerfolk', name: '村の癒し手', requires: ['priest', 'farmer'] },
  { id: 'ironyeoman', name: '鉄農兵', requires: ['farmer', 'craftsman'] },
];

// ---------------------------------------------------------
// 特級職 10種（必要上級職2つ。プロファイル/スキルは自動生成）
// ---------------------------------------------------------
const SPECIAL_RAW = [
  { id: 'greatsage', name: '大賢者', requires: ['sage', 'archmage'] },
  { id: 'swordsaint', name: '剣聖', requires: ['battlemaster', 'swordsaint2'] },
  { id: 'fistemperor', name: '拳帝', requires: ['fistsaint', 'assassinfist'] },
  { id: 'pope', name: '教皇', requires: ['paladin', 'miko'] },
  { id: 'thiefking', name: '盗賊王', requires: ['phantomthief', 'treasurehunter'] },
  { id: 'divaqueen', name: '歌姫女王', requires: ['primadiva', 'enchantdancer'] },
  { id: 'grandalchemist', name: '大錬金術師', requires: ['arcanist', 'artificer'] },
  { id: 'merchantking', name: '商業王', requires: ['merchantlord', 'guildmaster'] },
  { id: 'spiritking', name: '精霊王', requires: ['huntking', 'forestbard'] },
  { id: 'oracle', name: '星降る予言者', requires: ['astromancer', 'miko'] },
];

// 勇者：特級職を3つ以上マスターで解放（固定ペアではなく本数条件）
const HERO_RAW = { id: 'hero', name: '勇者', requiresCount: { tier: 'special', count: 3 } };

// ---------------------------------------------------------
// レジストリ構築（依存順に計算）
// ---------------------------------------------------------
const JOBS = new Map();

function autoSkillFor(job) {
  const p = job.profile;
  const offensive = p.atk + p.mag;
  const supportive = p.mp * 1.1;
  const tierMult = TIER_INFO[job.tier].growthMult;
  const baseline = 14 * tierMult;
  if (supportive > offensive) {
    return { name: `${job.name}の秘薬`, type: 'heal', power: Math.round(baseline * 1.1), mpCost: Math.round(9 * (1 + tierMult * 0.15)), cooldown: 4.2 };
  }
  return { name: `${job.name}の奥義`, type: 'damage', power: Math.round(baseline * 1.3), mpCost: Math.round(8 * (1 + tierMult * 0.15)), cooldown: 3.4 };
}

// 上級職・特級職のMASTER能力：単純なステータス加算ではなく「条件付き能力」にする
// （元の設計指示どおり）。手動で40職分書く代わりに、mergeProfiles後のプロファイルの
// 最も高いステータスから自動で3種類に振り分ける。
//   atk/critが最大 → 得意武器装備時、会心率+3%（例：剣聖＝得意武器=剣の職の会心特化型）
//   hp/defが最大   → HPが50%以下の間、与ダメージ+5%（打たれ強い職ほど発動しやすい）
//   それ以外(mag/spd/mp) → 常時、スキルクールダウン-3%
function autoMasterAbilityFor(job) {
  const p = job.profile;
  const dominant = STAT_KEYS.reduce((best, k) => (p[k] > p[best] ? k : best), STAT_KEYS[0]);
  if (dominant === 'atk' || dominant === 'crit') {
    return { condition: 'weaponMatch', effect: { stat: 'crit', pct: 0.03 } };
  }
  if (dominant === 'hp' || dominant === 'def') {
    return { condition: 'lowHp', threshold: 0.5, effect: { stat: 'dmg', pct: 0.05 } };
  }
  return { condition: 'always', effect: { stat: 'cooldown', pct: -0.03 } };
}

for (const raw of BASIC_RAW) {
  JOBS.set(raw.id, { ...raw, tier: 'basic', requires: [] });
}
for (const raw of ADVANCED_RAW) {
  const reqJobs = raw.requires.map((id) => JOBS.get(id));
  const profile = mergeProfiles(reqJobs.map((j) => j.profile));
  const job = { ...raw, tier: 'advanced', profile, weapon: reqJobs[0].weapon };
  job.skill = autoSkillFor(job);
  job.masterAbility = autoMasterAbilityFor(job);
  JOBS.set(raw.id, job);
}
for (const raw of SPECIAL_RAW) {
  const reqJobs = raw.requires.map((id) => JOBS.get(id));
  const profile = mergeProfiles(reqJobs.map((j) => j.profile));
  const job = { ...raw, tier: 'special', profile, weapon: reqJobs[0].weapon };
  job.skill = autoSkillFor(job);
  job.masterAbility = autoMasterAbilityFor(job);
  JOBS.set(raw.id, job);
}
{
  const allSpecial = SPECIAL_RAW.map((r) => JOBS.get(r.id));
  const profile = mergeProfiles(allSpecial.map((j) => j.profile));
  const job = { ...HERO_RAW, tier: 'hero', requires: [], profile, weapon: 'sword' };
  job.skill = autoSkillFor(job);
  job.skill.name = '勇者の光';
  JOBS.set(HERO_RAW.id, job);
}

// ---------------------------------------------------------
// 公開API
// ---------------------------------------------------------
export function getJob(id) { return JOBS.get(id); }
export function allJobs() { return Array.from(JOBS.values()); }
export function jobsByTier(tier) { return allJobs().filter((j) => j.tier === tier); }

export function computeStats(jobId, level) {
  const job = JOBS.get(jobId);
  const tier = TIER_INFO[job.tier];
  const L = Math.max(1, level);
  const stats = {};
  for (const k of STAT_KEYS) {
    const base = STAT_BASE[k] * job.profile[k] * tier.baseMult;
    const growth = STAT_GROWTH[k] * job.profile[k] * tier.growthMult;
    stats[k] = base + growth * (L - 1);
  }
  stats.hp = Math.round(stats.hp);
  stats.mp = Math.round(stats.mp);
  stats.atk = Math.round(stats.atk);
  stats.def = Math.round(stats.def);
  stats.mag = Math.round(stats.mag);
  stats.spd = Math.round(stats.spd * 10) / 10;
  stats.critPct = Math.min(CAPS_LAYER.CRIT_PCT_MAX, Math.round((5 + stats.crit * 0.8) * 10) / 10);
  return stats;
}

// 解放条件を満たしているか（masteredSet: マスター済みjobIdのSet）
export function isUnlocked(jobId, masteredSet) {
  const job = JOBS.get(jobId);
  if (job.tier === 'basic') return true;
  if (job.requiresCount) {
    const pool = jobsByTier(job.requiresCount.tier).map((j) => j.id);
    const count = pool.filter((id) => masteredSet.has(id)).length;
    return count >= job.requiresCount.count;
  }
  return job.requires.every((id) => masteredSet.has(id));
}

export function unlockRequirementText(jobId) {
  const job = JOBS.get(jobId);
  if (job.tier === 'basic') return '最初から選択可能';
  if (job.requiresCount) return `特級職を${job.requiresCount.count}つ以上マスター`;
  return job.requires.map((id) => JOBS.get(id).name).join('＋') + ' を両方マスター';
}

// TIER_INFOの別名（state.js/screens側の既存コードとの互換用）。
// `export { X as Y }` はY自体のローカル束縛を作らないため、単一スクリプトへ
// バンドルするとY参照がReferenceErrorになる（実際にPhase 1のリグレッション
// テストで発覚）。実体のconstとして再エクスポートすることで両方の文脈で動く。
export const TIERS = TIER_INFO;
