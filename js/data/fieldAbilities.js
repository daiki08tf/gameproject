/* ============================================================
   Monster Field Abilities（探索能力）— Session 7
   ------------------------------------------------------------
   「COLLECTION → EXPLORATION」を作る層。仲間にした魔物の
   生態的な能力が、街道の外にある道を開く。

   規則:
   - 能力は「特定種1体」ではなく家族(family)の述語で判定する
     （→ どの種族を集めても意味がある＝収集が表現力になる）。
   - 例外的に飛翔だけは species.field = ['soar'] を持つ個体のみ
     （飛べるかどうかは家族では決まらないため、個別能力タグ）。
   - 必要条件は「仲間にしたことがある個体を所持している」こと。
     編成中でなくてもよい（「あの場所、あの仲間がいれば…」）。
   ============================================================ */
import { getCompanionSpecies } from './companions.js';

export const FIELD_ABILITIES = Object.freeze({
  trail: {
    id: 'trail', label: '獣路の嗅覚',
    desc: '獣の仲間が、人の目には見えない獣道の匂いを追う。',
    match: (sp) => sp?.family === 'beast',
  },
  dive: {
    id: 'dive', label: '遊泳',
    desc: '水棲の仲間が、水面の下に沈んだ道を潜って確かめる。',
    match: (sp) => sp?.family === 'aquatic',
  },
  mechanism: {
    id: 'mechanism', label: '機構起動',
    desc: '機械の仲間が、眠ったままの古代機構へ干渉する。',
    match: (sp) => sp?.family === 'construct',
  },
  seer: {
    id: 'seer', label: '霊視',
    desc: '精霊の仲間が、目に見えない道標と残響の道を読む。',
    match: (sp) => sp?.family === 'spirit',
  },
  grave: {
    id: 'grave', label: '死読',
    desc: '不死の仲間が、墓所に残った記憶と隠れた扉を読む。',
    match: (sp) => sp?.family === 'undead',
  },
  fissure: {
    id: 'fissure', label: '隙間通過',
    desc: '粘性の仲間が、岩の隙間や膠着した地割れを潜り抜ける。',
    match: (sp) => sp?.family === 'slime',
  },
  soar: {
    id: 'soar', label: '飛翔',
    desc: '翼ある仲間が、断崖や谷底の先にある足場へ運ぶ。',
    // 飛翔だけは家族では決まらないので個別能力タグ。
    // species.field = ['soar'] を持つ種（コウモリ・雷羽獣・索敵機等）。
    match: (sp) => (sp?.field || []).includes('soar'),
  },
});

export function fieldAbilityOf(abilityId) {
  return FIELD_ABILITIES[abilityId] || null;
}
// 種が持つ探索能力の一覧。
export function fieldAbilitiesForSpecies(species) {
  if (!species) return [];
  return Object.values(FIELD_ABILITIES).filter((a) => a.match(species)).map((a) => a.id);
}
// chapter.requiresField（id または {any:[ids]}）→ 必要能力id配列。
export function requiredFieldAbilityIds(requirement) {
  if (!requirement) return [];
  if (typeof requirement === 'string') return [requirement];
  if (Array.isArray(requirement)) return requirement;
  if (Array.isArray(requirement.any)) return requirement.any;
  return [];
}
// 種族idから使えるかどうか（テスト・UI両用）。
export function speciesProvidesFieldAbility(speciesId, abilityId) {
  const ability = FIELD_ABILITIES[abilityId];
  return !!(ability && ability.match(getCompanionSpecies(speciesId)));
}
