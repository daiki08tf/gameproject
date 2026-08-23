/* ============================================================
   職業データ定義
   基本職(15) → 上級職(30) → 特級職(10) → 勇者(1)
   ・レベル上限なし（青天井）
   ・転職可能レベル / マスター基準レベル は tier ごとに定義
   ・上位職の能力プロファイルは、必要職(requires)のプロファイルを
     自動平均して算出する（手動で全部書かない）
   ============================================================ */

import { CHARACTER_LAYER, JOB_TIER, CAPS_LAYER } from './balance.js';
import { getSkill } from './skills.js';
import { getSpell } from './spells.js';

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
// skills/spellsは { id: 技ID（js/data/skills.js・spells.jsを参照）, learnLevel }
// の配列で持つ（元指示：職業IDと技IDは分離する）。learnLevel: 'master' は
// その職業をMASTER（TIER_INFO.basic.masteryLv=15）した場合のみ習得済み扱いに
// なる特別な値。実際の技オブジェクトへの解決はレジストリ構築時に行う
// （resolveJobSkills/resolveJobSpells、下記）。
const BASIC_RAW = [
  { id: 'warrior', name: '戦士', desc: 'HP・防御が高い前衛。剣と盾を扱う。', weapon: 'sword',
    profile: { hp: 1.6, mp: 0.4, atk: 1.3, def: 1.6, mag: 0.3, spd: 0.8, crit: 0.8 },
    skills: [
      { id: 'warrior_power_strike', learnLevel: 1 },
      { id: 'warrior_armor_break', learnLevel: 5 },
      { id: 'warrior_provoke', learnLevel: 10 },
      { id: 'warrior_unbreakable_stance', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'hp', pct: 0.02 } },
  { id: 'fighter', name: '武闘家', desc: '攻撃と素早さに優れる拳闘士。', weapon: 'knuckle',
    profile: { hp: 1.2, mp: 0.4, atk: 1.6, def: 0.9, mag: 0.3, spd: 1.3, crit: 1.4 },
    skills: [
      { id: 'fighter_flurry', learnLevel: 1 },
      { id: 'fighter_focus', learnLevel: 5 },
      { id: 'fighter_straight_punch', learnLevel: 10 },
      { id: 'fighter_tiger_flurry', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'spd', pct: 0.02 } },
  { id: 'mage', name: '魔法使い', desc: '攻撃魔法特化。打たれ弱い。', weapon: 'staff',
    profile: { hp: 0.6, mp: 2.0, atk: 0.4, def: 0.5, mag: 2.0, spd: 0.8, crit: 0.7 },
    // 特技1（魔力集中）／呪文3（火球・氷槍・雷撃）＋MASTER呪文（爆炎）
    skills: [{ id: 'mage_focus', learnLevel: 1 }],
    spells: [
      { id: 'mage_fireball', learnLevel: 1 },
      { id: 'mage_ice_lance', learnLevel: 5 },
      { id: 'mage_thunder', learnLevel: 10 },
      { id: 'mage_inferno', learnLevel: 'master' },
    ],
    masterBonus: { kind: 'skillPower', pct: 0.02 } },
  { id: 'priest', name: '僧侶', desc: '回復・補助魔法を扱う支援職。', weapon: 'rod',
    profile: { hp: 0.9, mp: 1.8, atk: 0.5, def: 0.9, mag: 1.6, spd: 0.7, crit: 0.6 },
    // 特技1（祈り）／呪文3（ヒール・守護・浄化）＋MASTER呪文（大回復）
    skills: [{ id: 'priest_prayer', learnLevel: 1 }],
    spells: [
      { id: 'priest_heal', learnLevel: 1 },
      { id: 'priest_guard_blessing', learnLevel: 5 },
      { id: 'priest_purify', learnLevel: 10 },
      { id: 'priest_full_heal', learnLevel: 'master' },
    ],
    masterBonus: { kind: 'healPower', pct: 0.03 } },
  { id: 'thief', name: '盗賊', desc: '素早さと回避に優れる。', passive: { drop: 1.15 }, weapon: 'dagger',
    profile: { hp: 0.8, mp: 0.6, atk: 1.1, def: 0.6, mag: 0.4, spd: 1.7, crit: 1.6 },
    skills: [
      { id: 'thief_dark_slash', learnLevel: 1 },
      { id: 'thief_poison_blade', learnLevel: 5 },
      { id: 'thief_steal', learnLevel: 10 },
      { id: 'thief_shadow_step', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'passive', channel: 'drop', pct: 0.02 } },
  { id: 'merchant', name: '商人', desc: '所持金・ドロップ率にボーナス。', passive: { gold: 1.3 }, weapon: 'sword',
    profile: { hp: 0.8, mp: 0.8, atk: 0.6, def: 0.7, mag: 0.6, spd: 0.8, crit: 0.9 },
    skills: [
      { id: 'merchant_golden_strike', learnLevel: 1 },
      { id: 'merchant_coin_toss', learnLevel: 5 },
      { id: 'merchant_business_sense', learnLevel: 10 },
      { id: 'merchant_grand_giveaway', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'passive', channel: 'gold', pct: 0.02 } },
  { id: 'hunter', name: '狩人', desc: '弓を使い対モンスターに強い。', weapon: 'bow',
    profile: { hp: 0.9, mp: 0.6, atk: 1.4, def: 0.7, mag: 0.5, spd: 1.3, crit: 1.3 },
    skills: [
      { id: 'hunter_piercing_arrow', learnLevel: 1 },
      { id: 'hunter_aim', learnLevel: 5 },
      { id: 'hunter_pin_down', learnLevel: 10 },
      { id: 'hunter_beast_slayer', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'atk', pct: 0.02 } },
  { id: 'ninja', name: '忍者', desc: '素早く状態異常を得意とする。', weapon: 'dagger',
    profile: { hp: 0.8, mp: 0.7, atk: 1.2, def: 0.6, mag: 0.6, spd: 1.8, crit: 1.5 },
    skills: [
      { id: 'ninja_shadow_slash', learnLevel: 1 },
      { id: 'ninja_poison_star', learnLevel: 5 },
      { id: 'ninja_pin', learnLevel: 10 },
      { id: 'ninja_katon', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'crit', pct: 0.02 } },
  { id: 'bard', name: '吟遊詩人', desc: '鼓舞の歌で自身を強化する。', weapon: 'instrument',
    profile: { hp: 0.8, mp: 1.3, atk: 0.6, def: 0.6, mag: 1.1, spd: 1.0, crit: 0.8 },
    skills: [
      { id: 'bard_encourage', learnLevel: 1 },
      { id: 'bard_protect_song', learnLevel: 5 },
      { id: 'bard_healing_melody', learnLevel: 10 },
      { id: 'bard_hero_song', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'mag', pct: 0.02 } },
  { id: 'dancer', name: '踊り子', desc: '幻惑の舞で敵を翻弄する。', weapon: 'instrument',
    profile: { hp: 0.7, mp: 1.1, atk: 0.7, def: 0.5, mag: 1.0, spd: 1.4, crit: 1.2 },
    skills: [
      { id: 'dancer_illusion_dance', learnLevel: 1 },
      { id: 'dancer_blade_dance', learnLevel: 5 },
      { id: 'dancer_haste_dance', learnLevel: 10 },
      { id: 'dancer_dream_dance', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'spd', pct: 0.02 } },
  { id: 'alchemist', name: '錬金術師', desc: '爆薬や状態異常攻撃を操る。', weapon: 'staff',
    profile: { hp: 0.7, mp: 1.5, atk: 0.8, def: 0.6, mag: 1.5, spd: 0.8, crit: 0.9 },
    skills: [
      { id: 'alchemist_explosive_potion', learnLevel: 1 },
      { id: 'alchemist_poison_potion', learnLevel: 5 },
      { id: 'alchemist_boost_potion', learnLevel: 10 },
      { id: 'alchemist_detonate', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'skillPower', pct: 0.02 } },
  { id: 'scholar', name: '学者', desc: '弱点看破で経験値効率が良い。', passive: { exp: 1.2 }, weapon: 'staff',
    profile: { hp: 0.7, mp: 1.4, atk: 0.5, def: 0.6, mag: 1.4, spd: 0.7, crit: 0.7 },
    // 特技3（弱点看破・解析・完全解析）／呪文1（元素術）
    skills: [
      { id: 'scholar_weakpoint', learnLevel: 1 },
      { id: 'scholar_analyze', learnLevel: 5 },
      { id: 'scholar_full_analysis', learnLevel: 'master' },
    ],
    spells: [{ id: 'scholar_elemental', learnLevel: 10 }],
    masterBonus: { kind: 'passive', channel: 'exp', pct: 0.02 } },
  { id: 'farmer', name: '農民', desc: '打たれ強く鎌を振り回す。', passive: { drop: 1.1 }, weapon: 'axe',
    profile: { hp: 1.7, mp: 0.4, atk: 0.9, def: 1.3, mag: 0.3, spd: 0.7, crit: 0.6 },
    skills: [
      { id: 'farmer_scythe_sweep', learnLevel: 1 },
      { id: 'farmer_grit', learnLevel: 5 },
      { id: 'farmer_harvest', learnLevel: 10 },
      { id: 'farmer_peasant_soul', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'def', pct: 0.02 } },
  { id: 'craftsman', name: '大工', desc: '鉄壁の構えで守りを固める。', weapon: 'axe',
    profile: { hp: 1.3, mp: 0.4, atk: 0.9, def: 1.5, mag: 0.4, spd: 0.6, crit: 0.6 },
    skills: [
      { id: 'craftsman_iron_stance', learnLevel: 1 },
      { id: 'craftsman_parry', learnLevel: 5 },
      { id: 'craftsman_counter', learnLevel: 10 },
      { id: 'craftsman_fortify', learnLevel: 'master' },
    ],
    spells: [],
    masterBonus: { kind: 'stat', stat: 'def', pct: 0.02 } },
  { id: 'fortune', name: '占い師', desc: '運を操りクリティカルを引き寄せる。', weapon: 'rod',
    profile: { hp: 0.7, mp: 1.2, atk: 0.6, def: 0.5, mag: 1.2, spd: 1.0, crit: 1.8 },
    // 特技3（運命の逆転・吉兆・凶兆）／呪文1（星の導き、MASTER）
    skills: [
      { id: 'fortune_fate_reversal', learnLevel: 1 },
      { id: 'fortune_good_omen', learnLevel: 5 },
      { id: 'fortune_bad_omen', learnLevel: 10 },
    ],
    spells: [{ id: 'fortune_star_guidance', learnLevel: 'master' }],
    masterBonus: { kind: 'stat', stat: 'crit', pct: 0.02 } },
];

// { id, learnLevel }の参照配列を、実際の技オブジェクト（+learnLevel）へ解決する
function resolveTechRefs(refs, lookup, kind) {
  return (refs || []).map((ref) => {
    const def = lookup(ref.id);
    if (!def) throw new Error(`unknown ${kind} id in jobs.js: ${ref.id}`);
    return { ...def, learnLevel: ref.learnLevel };
  });
}

// ---------------------------------------------------------
// 上級職 30種（必要基本職2つ。プロファイル/スキルは自動生成）
// ---------------------------------------------------------
// 上級職のskills/spells：基本職と同じ{id, learnLevel}参照配列。
// learnLevelは元指示どおりLv1/10/20/'master'（TIER_INFO.advanced.masteryLv=30）
// を基本形とする。各職に持たせるskills/spellsの内訳（技名とその狙い）は
// js/data/skills.js・spells.jsの該当セクションのコメントを参照。
const ADVANCED_RAW = [
  { id: 'paladin', name: 'パラディン', requires: ['warrior', 'priest'],
    skills: [
      { id: 'paladin_holy_shield', learnLevel: 1 },
      { id: 'paladin_holy_slash', learnLevel: 10 },
      { id: 'paladin_healing_counter', learnLevel: 20 },
      { id: 'paladin_unfallen_oath', learnLevel: 'master' },
    ], spells: [] },
  { id: 'battlemaster', name: 'バトルマスター', requires: ['warrior', 'fighter'],
    skills: [
      { id: 'battlemaster_armor_breaker', learnLevel: 1 },
      { id: 'battlemaster_rapid_break', learnLevel: 10 },
      { id: 'battlemaster_fighting_spirit', learnLevel: 20 },
      { id: 'battlemaster_peerless', learnLevel: 'master' },
    ], spells: [] },
  { id: 'spellblade', name: '魔法剣士', requires: ['warrior', 'mage'],
    skills: [
      { id: 'spellblade_flame_slash', learnLevel: 1 },
      { id: 'spellblade_frost_slash', learnLevel: 10 },
      { id: 'spellblade_thunder_slash', learnLevel: 20 },
      { id: 'spellblade_mana_blade', learnLevel: 'master' },
    ], spells: [] },
  { id: 'swordsaint2', name: '剣豪', requires: ['warrior', 'thief'],
    skills: [
      { id: 'swordsaint2_iai', learnLevel: 1 },
      { id: 'swordsaint2_mikiri', learnLevel: 10 },
      { id: 'swordsaint2_samidare', learnLevel: 20 },
      { id: 'swordsaint2_mushin', learnLevel: 'master' },
    ], spells: [] },
  { id: 'armsknight', name: 'アームズナイト', requires: ['warrior', 'craftsman'],
    skills: [
      { id: 'armsknight_weapon_guard', learnLevel: 1 },
      { id: 'armsknight_shield_break', learnLevel: 10 },
      { id: 'armsknight_bulwark', learnLevel: 20 },
      { id: 'armsknight_full_armament', learnLevel: 'master' },
    ], spells: [] },
  { id: 'sage', name: '賢者', requires: ['mage', 'priest'],
    skills: [{ id: 'sage_magic_barrier', learnLevel: 20 }],
    spells: [
      { id: 'sage_mid_flame', learnLevel: 1 },
      { id: 'sage_mid_heal', learnLevel: 10 },
      { id: 'sage_twin_cast', learnLevel: 'master' },
    ] },
  { id: 'archmage', name: '大魔導士', requires: ['mage', 'scholar'],
    skills: [],
    spells: [
      { id: 'archmage_explosion', learnLevel: 1 },
      { id: 'archmage_absolute_zero', learnLevel: 10 },
      { id: 'archmage_swift_thunder', learnLevel: 20 },
      { id: 'archmage_manic_surge', learnLevel: 'master' },
    ] },
  { id: 'astromancer', name: '星詠みの魔女', requires: ['mage', 'fortune'],
    skills: [],
    spells: [
      { id: 'astromancer_star_bullet', learnLevel: 1 },
      { id: 'astromancer_star_eclipse', learnLevel: 10 },
      { id: 'astromancer_meteor', learnLevel: 20 },
      { id: 'astromancer_star_blessing', learnLevel: 'master' },
    ] },
  { id: 'miko', name: '巫女', requires: ['priest', 'fortune'],
    skills: [],
    spells: [
      { id: 'miko_prayer_chant', learnLevel: 1 },
      { id: 'miko_barrier', learnLevel: 10 },
      { id: 'miko_purification', learnLevel: 20 },
      { id: 'miko_oracle', learnLevel: 'master' },
    ] },
  { id: 'choirmaster', name: '聖歌隊長', requires: ['priest', 'bard'],
    skills: [],
    spells: [
      { id: 'choirmaster_healing_chorus', learnLevel: 1 },
      { id: 'choirmaster_guardian_hymn', learnLevel: 10 },
      { id: 'choirmaster_battle_hymn', learnLevel: 20 },
      { id: 'choirmaster_miracle_chorus', learnLevel: 'master' },
    ] },
  { id: 'phantomthief', name: '怪盗', requires: ['thief', 'ninja'],
    skills: [
      { id: 'phantomthief_phantom_slash', learnLevel: 1 },
      { id: 'phantomthief_grand_theft', learnLevel: 10 },
      { id: 'phantomthief_smoke_step', learnLevel: 20 },
      { id: 'phantomthief_backstab', learnLevel: 'master' },
    ], spells: [] },
  { id: 'treasurehunter', name: 'トレジャーハンター', requires: ['thief', 'merchant'],
    skills: [
      { id: 'treasurehunter_dig', learnLevel: 1 },
      { id: 'treasurehunter_gem_toss', learnLevel: 10 },
      { id: 'treasurehunter_appraisal', learnLevel: 20 },
      { id: 'treasurehunter_big_find', learnLevel: 'master' },
    ], spells: [] },
  { id: 'scoutmaster', name: '密偵', requires: ['thief', 'hunter'],
    skills: [
      { id: 'scoutmaster_ambush', learnLevel: 1 },
      { id: 'scoutmaster_recon', learnLevel: 10 },
      { id: 'scoutmaster_weakshot', learnLevel: 20 },
      { id: 'scoutmaster_shadowhunt', learnLevel: 'master' },
    ], spells: [] },
  { id: 'enchantdancer', name: '幻惑の舞姫', requires: ['thief', 'dancer'],
    skills: [
      { id: 'enchantdancer_illusion', learnLevel: 1 },
      { id: 'enchantdancer_poison_dance', learnLevel: 10 },
      { id: 'enchantdancer_blade_dance', learnLevel: 20 },
      { id: 'enchantdancer_dream_flurry', learnLevel: 'master' },
    ], spells: [] },
  { id: 'fistsaint', name: '拳聖', requires: ['fighter', 'ninja'],
    skills: [
      { id: 'fistsaint_explosive_fist', learnLevel: 1 },
      { id: 'fistsaint_afterimage', learnLevel: 10 },
      { id: 'fistsaint_chain_fist', learnLevel: 20 },
      { id: 'fistsaint_hundred_strikes', learnLevel: 'master' },
    ], spells: [] },
  { id: 'assassinfist', name: '暗殺拳', requires: ['fighter', 'thief'],
    skills: [
      { id: 'assassinfist_vital_strike', learnLevel: 1 },
      { id: 'assassinfist_death_palm', learnLevel: 10 },
      { id: 'assassinfist_desperation', learnLevel: 20 },
      { id: 'assassinfist_assassinate', learnLevel: 'master' },
    ], spells: [] },
  { id: 'beasttamer', name: '猛獣使い', requires: ['fighter', 'hunter'],
    skills: [
      { id: 'beasttamer_beast_strike', learnLevel: 1 },
      { id: 'beasttamer_roar', learnLevel: 10 },
      { id: 'beasttamer_feral', learnLevel: 20 },
      { id: 'beasttamer_king_fang', learnLevel: 'master' },
    ], spells: [] },
  { id: 'sumo', name: '剛力士', requires: ['fighter', 'farmer'],
    skills: [
      { id: 'sumo_slap', learnLevel: 1 },
      { id: 'sumo_immovable', learnLevel: 10 },
      { id: 'sumo_body_slam', learnLevel: 20 },
      { id: 'sumo_stand_firm', learnLevel: 'master' },
    ], spells: [] },
  { id: 'huntking', name: '狩猟王', requires: ['hunter', 'ninja'],
    skills: [
      { id: 'huntking_weakshot', learnLevel: 1 },
      { id: 'huntking_followup', learnLevel: 10 },
      { id: 'huntking_mark', learnLevel: 20 },
      { id: 'huntking_slayer', learnLevel: 'master' },
    ], spells: [] },
  { id: 'forestbard', name: '森の吟遊詩人', requires: ['hunter', 'bard'],
    skills: [
      { id: 'forestbard_spirit_arrow', learnLevel: 1 },
      { id: 'forestbard_forest_song', learnLevel: 10 },
      { id: 'forestbard_hunters_cheer', learnLevel: 20 },
      { id: 'forestbard_spirit_blessing', learnLevel: 'master' },
    ], spells: [] },
  { id: 'primadiva', name: 'プリマ・ディーヴァ', requires: ['bard', 'dancer'],
    skills: [
      { id: 'primadiva_sword_aria', learnLevel: 1 },
      { id: 'primadiva_evasion_aria', learnLevel: 10 },
      { id: 'primadiva_healing_aria', learnLevel: 20 },
      { id: 'primadiva_queens_stage', learnLevel: 'master' },
    ], spells: [] },
  { id: 'loremaster', name: '語り部', requires: ['bard', 'scholar'],
    skills: [
      { id: 'loremaster_heroic_tale', learnLevel: 1 },
      { id: 'loremaster_monster_lore', learnLevel: 10 },
      { id: 'loremaster_victory_tale', learnLevel: 20 },
      { id: 'loremaster_legend_verse', learnLevel: 'master' },
    ], spells: [] },
  { id: 'fatedancer', name: '運命の踊り子', requires: ['dancer', 'fortune'],
    skills: [
      { id: 'fatedancer_lucky_dance', learnLevel: 1 },
      { id: 'fatedancer_evasion_dance', learnLevel: 10 },
      { id: 'fatedancer_fate_reverse', learnLevel: 20 },
      { id: 'fatedancer_grand_wheel', learnLevel: 'master' },
    ], spells: [] },
  { id: 'illusionist', name: '幻術師', requires: ['dancer', 'alchemist'],
    skills: [
      { id: 'illusionist_poison_mist', learnLevel: 1 },
      { id: 'illusionist_hallucination', learnLevel: 10 },
      { id: 'illusionist_corrosion', learnLevel: 20 },
      { id: 'illusionist_toxic_burst', learnLevel: 'master' },
    ], spells: [] },
  { id: 'arcanist', name: 'アルカニスト', requires: ['alchemist', 'scholar'],
    skills: [
      { id: 'arcanist_element_shift', learnLevel: 10 },
      { id: 'arcanist_circle', learnLevel: 20 },
      { id: 'arcanist_catalyst', learnLevel: 'master' },
    ],
    spells: [{ id: 'arcanist_mana_bomb', learnLevel: 1 }] },
  { id: 'artificer', name: '魔導技師', requires: ['alchemist', 'craftsman'],
    skills: [
      { id: 'artificer_mana_cannon', learnLevel: 1 },
      { id: 'artificer_armor_boost', learnLevel: 10 },
      { id: 'artificer_auto_turret', learnLevel: 20 },
      { id: 'artificer_overdrive', learnLevel: 'master' },
    ], spells: [] },
  { id: 'merchantlord', name: '大商人', requires: ['merchant', 'scholar'],
    skills: [
      { id: 'merchantlord_haggle', learnLevel: 1 },
      { id: 'merchantlord_investment', learnLevel: 10 },
      { id: 'merchantlord_appraising_eye', learnLevel: 20 },
      { id: 'merchantlord_market_control', learnLevel: 'master' },
    ], spells: [] },
  { id: 'guildmaster', name: 'ギルドマスター', requires: ['merchant', 'craftsman'],
    skills: [
      { id: 'guildmaster_command', learnLevel: 1 },
      { id: 'guildmaster_supply', learnLevel: 10 },
      { id: 'guildmaster_defense_order', learnLevel: 20 },
      { id: 'guildmaster_mobilize', learnLevel: 'master' },
    ], spells: [] },
  { id: 'healerfolk', name: '村の癒し手', requires: ['priest', 'farmer'],
    skills: [{ id: 'healerfolk_vitality', learnLevel: 10 }],
    spells: [
      { id: 'healerfolk_herbal_cure', learnLevel: 1 },
      { id: 'healerfolk_earthguard', learnLevel: 20 },
      { id: 'healerfolk_miracle', learnLevel: 'master' },
    ] },
  { id: 'ironyeoman', name: '鉄農兵', requires: ['farmer', 'craftsman'],
    skills: [
      { id: 'ironyeoman_scythe_storm', learnLevel: 1 },
      { id: 'ironyeoman_iron_skin', learnLevel: 10 },
      { id: 'ironyeoman_counter_formation', learnLevel: 20 },
      { id: 'ironyeoman_unbroken', learnLevel: 'master' },
    ], spells: [] },
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

// autoSkillFor()が返す単一skill（旧shape：cooldownは秒、target/idを持たない）を、
// BattleEngine側が一律で読むjob.skills[]／job.spells[]の形へ包む。
// 上級職(30)・特級職(10)・勇者は今回スコープ外のため、autoSkillFor()自体は
// 削除・変更せず、その出力をこの薄いラッパーだけで包む（元指示：将来
// 手動でskills/spells配列を書き足す際、このラッパーを実データ配列に
// 差し替えるだけで済むようにしておく）。
function wrapAutoSkillAsTechniques(job) {
  const s = job.skill;
  const target = s.type === 'heal' || s.type === 'buff' ? 'self' : 'enemy';
  job.skills = [{
    id: `auto_${job.id}`, name: s.name, type: s.type, target,
    power: s.power ? s.power / 14 : undefined, // 旧shapeのpowerは絶対値。既存の技倍率スケールに合わせて概算換算する
    healPct: s.type === 'heal' ? 0.25 : undefined,
    buff: s.type === 'buff' ? { atkPct: 0.25, defPct: 0.25, turns: 2 } : undefined,
    mpCost: s.mpCost, cooldownTurns: Math.max(1, Math.round(s.cooldown / 3)), learnLevel: 1,
  }];
  job.spells = [];
}

for (const raw of BASIC_RAW) {
  const job = { ...raw, tier: 'basic', requires: [] };
  job.skills = resolveTechRefs(raw.skills, getSkill, 'skill');
  job.spells = resolveTechRefs(raw.spells, getSpell, 'spell');
  JOBS.set(raw.id, job);
}
for (const raw of ADVANCED_RAW) {
  const reqJobs = raw.requires.map((id) => JOBS.get(id));
  const profile = mergeProfiles(reqJobs.map((j) => j.profile));
  const job = { ...raw, tier: 'advanced', profile, weapon: reqJobs[0].weapon };
  // autoSkillFor()/autoMasterAbilityFor()自体は変更しない（元指示：将来の
  // 特級職・勇者との互換のため）。job.skill/masterAbilityは引き続き自動生成
  // させたうえで、今回手動定義した上級職30種はraw.skills/spellsで上書きする。
  // 将来、上級職に手動定義を書き足していない状態（raw.skills未定義）でも
  // 壊れないよう、その場合だけ従来どおりwrapAutoSkillAsTechniques()へ
  // フォールバックする（元指示：将来安全に追加できる拡張構造を保つ）。
  job.skill = autoSkillFor(job);
  job.masterAbility = autoMasterAbilityFor(job);
  if (raw.skills || raw.spells) {
    job.skills = resolveTechRefs(raw.skills, getSkill, 'skill');
    job.spells = resolveTechRefs(raw.spells, getSpell, 'spell');
  } else {
    wrapAutoSkillAsTechniques(job);
  }
  JOBS.set(raw.id, job);
}
for (const raw of SPECIAL_RAW) {
  const reqJobs = raw.requires.map((id) => JOBS.get(id));
  const profile = mergeProfiles(reqJobs.map((j) => j.profile));
  const job = { ...raw, tier: 'special', profile, weapon: reqJobs[0].weapon };
  job.skill = autoSkillFor(job);
  job.masterAbility = autoMasterAbilityFor(job);
  wrapAutoSkillAsTechniques(job);
  JOBS.set(raw.id, job);
}
{
  const allSpecial = SPECIAL_RAW.map((r) => JOBS.get(r.id));
  const profile = mergeProfiles(allSpecial.map((j) => j.profile));
  const job = { ...HERO_RAW, tier: 'hero', requires: [], profile, weapon: 'sword' };
  job.skill = autoSkillFor(job);
  job.skill.name = '勇者の光';
  wrapAutoSkillAsTechniques(job);
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
