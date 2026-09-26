import { getCompanionSkill } from './companionSkills.js';
import { companionTraitEffect } from './companions.js';
import { state } from '../state.js';

// パーティ枠（0=前衛/1=中衛/2=後衛）。Formation 連携が参照する。
const partySlotOf = c => (state.data.companionParty || []).indexOf(c.id);
const hasTrait = (c, pred) => (c.species?.traits || []).concat(c.instance?.inheritedTraits || []).some(pred);

export const COMPANION_SYNERGIES = Object.freeze([
  {
    id: 'full_party', name: '三位一体',
    test: party => party.length >= 3,
    bonuses: { hpMult: 1.05, defMult: 1.05 },
    desc: '3体編成：仲間HP/DEF +5%',
  },
  {
    id: 'diverse_species', name: '異種連携',
    test: party => party.length >= 3 && new Set(party.map(c => c.instance.baseSpeciesId || c.instance.speciesId)).size >= 3,
    bonuses: { atkMult: 1.05, magMult: 1.05, spdMult: 1.05 },
    desc: '3種族編成：仲間ATK/MAG/SPD +5%',
  },
  {
    id: 'evolved_pair', name: '覚醒共鳴',
    test: party => party.filter(c => !!c.instance.evolution).length >= 2,
    bonuses: { atkMult: 1.08, magMult: 1.08 },
    desc: '進化済み2体以上：仲間ATK/MAG +8%',
  },
  {
    id: 'ai_trinity', name: '役割分担',
    test: party => party.length >= 3 && new Set(party.map(c => c.nature?.ai || c.instance.nature)).size >= 3,
    bonuses: { hpMult: 1.03, atkMult: 1.03, defMult: 1.03, magMult: 1.03, spdMult: 1.03 },
    desc: '異なるAI役割3種：仲間全能力 +3%',
  },
  // Session 5 — 振る舞い連携。stat面だけでなく「何をする編成か」を評価する。
  {
    id: 'predator_chain', name: '狩猟連鎖',
    test: party => party.filter(c => (c.instance?.inheritedTraits||[]).includes('狩人') || (c.species?.skills||[]).some(s => getCompanionSkill(s.id)?.preferLowHp)).length >= 2,
    bonuses: { atkMult: 1.06, spdMult: 1.04 },
    desc: '追撃役2体以上：仲間ATK +6% / SPD +4%',
  },
  {
    id: 'warden_ring', name: '庇護の環',
    test: party => party.some(c => (c.species?.traits||[]).concat(c.instance?.inheritedTraits||[]).some(t => companionTraitEffect(t)?.kind === 'physicalMitigation')) && party.some(c => (c.species?.skills||[]).some(s => getCompanionSkill(s.id)?.type === 'heal')),
    bonuses: { hpMult: 1.06, defMult: 1.04 },
    desc: '壁＋治癒の編成：仲間HP +6% / DEF +4%',
  },
  {
    id: 'nameless_pack', name: '名もなき群れ',
    test: party => party.filter(c => String(c.instance?.speciesId||c.speciesId||'').startsWith('roamer_')).length >= 2,
    bonuses: { atkMult: 1.05, magMult: 1.05, defMult: 1.05 },
    desc: '名もなき強敵2体以上：仲間ATK/MAG/DEF +5%',
  },
  /* Session 7 — Denlord 2.0: 巣の主の「領域」がパーティの色になる。
     万能BISではなく、生態に沿った編成方向を与えるAura。 */
  {
    id: 'aura_beastlord', name: '獣径の威圧',
    test: party => party.some(c => (c.instance?.baseSpeciesId || c.instance?.speciesId) === 'bt_denlord'),
    bonuses: { atkMult: 1.07, spdMult: 1.03 },
    desc: '獣径の主を率いる：仲間ATK +7% / SPD +3%',
  },
  {
    id: 'aura_tidelord', name: '潮径の加護',
    test: party => party.some(c => (c.instance?.baseSpeciesId || c.instance?.speciesId) === 'tp_denlord'),
    bonuses: { hpMult: 1.08, defMult: 1.05 },
    desc: '潮径の主を率いる：仲間HP +8% / DEF +5%',
  },
  {
    id: 'aura_ashlord', name: '灰径の残火',
    test: party => party.some(c => (c.instance?.baseSpeciesId || c.instance?.speciesId) === 'af_denlord'),
    bonuses: { magMult: 1.08, atkMult: 1.04 },
    desc: '灰径の主を率いる：仲間MAG +8% / ATK +4%',
  },
  {
    id: 'aura_transcended', name: '超再臨の威光',
    test: party => party.some(c => (c.instance?.inheritedTraits || []).includes('超再臨')),
    bonuses: { hpMult: 1.05, atkMult: 1.05, magMult: 1.05 },
    desc: '超再臨を越えた個体がいる：仲間HP/ATK/MAG +5%',
  },
  /* Session 7 — Formation 連携。隊列の置き方が編成ボーナスになる。
     前衛に壁・後衛に術者という自然な置き方を静かに報いる。 */
  {
    id: 'vanguard_wall', name: '鉄壁前衛',
    test: party => {
      const front = party.find(c => partySlotOf(c) === 0);
      return !!front && (hasTrait(front, t => companionTraitEffect(t)?.kind === 'physicalMitigation') || (front.nature?.ai || front.instance?.nature) === 'defensive');
    },
    bonuses: { hpMult: 1.05, defMult: 1.05 },
    desc: '前衛に壁役を配置：仲間HP/DEF +5%',
  },
  {
    id: 'arcane_rearguard', name: '後衛の魔導',
    test: party => {
      const rear = party.find(c => partySlotOf(c) === 2);
      return !!rear && (rear.stats?.mag || 0) > (rear.stats?.atk || 0);
    },
    bonuses: { magMult: 1.07, spdMult: 1.03 },
    desc: '後衛に術者を配置：仲間MAG +7% / SPD +3%',
  },
  // Session 7 — 生態ペア。family がそろうほど「その群れらしさ」が出る。
  {
    id: 'grave_choir', name: '墓所の合唱',
    test: party => party.filter(c => c.species?.family === 'undead').length >= 2,
    bonuses: { magMult: 1.05, defMult: 1.04 },
    desc: '不死2体以上：仲間MAG +5% / DEF +4%',
  },
  {
    id: 'mechanism_pair', name: '機構連動',
    test: party => party.filter(c => c.species?.family === 'construct').length >= 2,
    bonuses: { defMult: 1.07, atkMult: 1.03 },
    desc: '機械2体以上：仲間DEF +7% / ATK +3%',
  },
  {
    id: 'sky_hunt', name: '空の狩り',
    test: party => party.some(c => (c.species?.field || []).includes('soar')) && party.some(c => c.species?.family === 'beast'),
    bonuses: { spdMult: 1.07, atkMult: 1.03 },
    desc: '翼ある仲間＋獣：仲間SPD +7% / ATK +3%',
  },
]);

export function evaluateCompanionSynergies(party = []) {
  const active = COMPANION_SYNERGIES.filter(s => s.test(party));
  const total = { hpMult:1, atkMult:1, defMult:1, magMult:1, spdMult:1 };
  for (const s of active) for (const [k,v] of Object.entries(s.bonuses)) total[k] *= v;
  return { active, total };
}

export function bondRuneEffects(marks = 0) {
  const n = Math.min(1000, Math.max(0, Math.floor(Number(marks) || 0)));
  return {
    effectiveMarks: n,
    recruitChanceBonus: Math.min(0.15, n * 0.00015),
    companionExpMult: 1 + Math.min(0.50, n * 0.00050),
    rareRecruitChance: Math.min(0.20, n * 0.00020),
  };
}

/* Session 5 — 連携コンボ（curated）。
   「Aが動いた直後のBの一撃が強くなる」という順序ベースの反応。
   81×81の組み合わせ表ではなく、意味のある少数の関係だけを定義する。
   実行は js/patches/companionBattle.js の armCombo / _comboPending。 */
const isDenlord = c => (c?.traits||[]).some(t => String(t).endsWith('の主'));
const isRoamer = c => String(c?.speciesId||'').startsWith('roamer_');
export const COMPANION_COMBOS = Object.freeze([
  { id:'denlord_command', name:'主の采配', desc:'主が動いた直後、群れの一撃が強くなる',
    leader:isDenlord, follower:c => !isDenlord(c), dmgMult:1.18 },
  { id:'nameless_hunt', name:'名もなき狩り', desc:'徘徊者が動いた直後、狩りの一撃が強くなる',
    leader:isRoamer, follower:c => (c?.traits||[]).includes('狩人') || isRoamer(c), dmgMult:1.22 },
  { id:'shackled_blade', name:'咎人の鎖', desc:'獄卒が動いた直後、遍歴の剣が届く',
    leader:c => c?.speciesId === 'roamer_pale_jailer', follower:c => c?.speciesId === 'roamer_rust_errant', dmgMult:1.30 },
  // Session 7 — Formation / 超再臨 の連携。
  { id:'transcendent_overture', name:'超再臨の前奏', desc:'超再臨を越えた個体が動いた直後、続く一撃が強くなる',
    leader:c => (c?.traits||[]).includes('超再臨'), follower:c => !(c?.traits||[]).includes('超再臨'), dmgMult:1.25 },
  { id:'vanguard_break', name:'前衛突破口', desc:'前衛が動いた直後、後衛の一撃が強くなる',
    leader:c => c?.slot === 0, follower:c => c?.slot === 2, dmgMult:1.15 },
]);
