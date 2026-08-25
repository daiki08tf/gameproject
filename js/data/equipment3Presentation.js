/* Equipment 3.0 / Loot 3.0 — shared presentation + quality model */
import { itemPowerBand } from './equipment3.js';
import { describeAffix, AFFIX_RARITY_LABEL, affixRarityIndex } from './affixes.js';
import { getLegendaryEffect, getCursedAffix } from './equipment3Legendary.js';

function lootQuality(item, inst, affixes, { legendary, curse, greaterCount, itemPower }) {
  const reasons = [];
  const highest = affixes.reduce((best, a) => !best || affixRarityIndex(a.rarity) > affixRarityIndex(best) ? a.rarity : best, null);
  const buildCount = affixes.filter(a => a.category === 'BUILD').length;
  if (item.unique) reasons.push('UNIQUE');
  if (item.setId || item.setName) reasons.push('SET');
  if (legendary) reasons.push('LEGENDARY POWER');
  if (curse) reasons.push('CURSED');
  if (greaterCount >= 2) reasons.push(`GREATER ×${greaterCount}`);
  else if (greaterCount === 1) reasons.push('GREATER');
  if (highest === 'ancient') reasons.push('ANCIENT AFFIX');
  else if (highest === 'mythic') reasons.push('MYTHIC AFFIX');
  else if (highest === 'legendary') reasons.push('LEGENDARY AFFIX');
  if (buildCount) reasons.push(buildCount > 1 ? `BUILD ×${buildCount}` : 'BUILD');
  if (item.isCodexWeapon) reasons.push('CODEX');
  let quality = 'standard';
  if (item.unique || legendary || greaterCount >= 2 || highest === 'ancient' || (buildCount && highest && affixRarityIndex(highest) >= affixRarityIndex('mythic'))) quality = 'jackpot';
  else if (item.setId || item.setName || curse || greaterCount === 1 || (highest && affixRarityIndex(highest) >= affixRarityIndex('legendary')) || buildCount || itemPower >= 3000) quality = 'special';
  return { quality, reasons, highestAffixRarity: highest, buildCount };
}

export function equipment3Presentation(item, inst = null) {
  if (!item) return null;
  if (!inst) {
    const q=lootQuality(item,null,[],{legendary:null,curse:null,greaterCount:0,itemPower:0});
    return {name:item.name,archetype:item.weaponArchetypeName||null,identity:item.weaponArchetypeIdentity||null,itemPower:null,tier:null,band:null,greaterCount:0,affixes:[],legendary:null,curse:null,...q};
  }
  const itemPower = Math.max(1, Math.floor(Number(inst.itemPower) || 1));
  const tier = Math.max(1, Math.min(10, Math.floor(Number(inst.affixTier) || Math.ceil(itemPower / 1000))));
  const band = itemPowerBand(itemPower);
  const greaterCount = Math.max(0, Math.floor(Number(inst.greaterAffixCount) || 0));
  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  const affixes = (inst.affixes || []).map((a) => {const d=describeAffix(a);return{id:a.id,name:d.name,desc:d.desc,category:d.category,rarity:a.rarity,rarityLabel:AFFIX_RARITY_LABEL[a.rarity]||a.rarity,greater:!!a.greater,roll:a.roll};});
  const q=lootQuality(item,inst,affixes,{legendary,curse,greaterCount,itemPower});
  return {name:inst.displayName||item.name,archetype:item.weaponArchetypeName||null,identity:item.weaponArchetypeIdentity||null,itemPower,tier,band,greaterCount,affixes,legendary,curse,...q};
}

export function equipment3MetaText(p) {
  if (!p) return '';
  const bits=[];
  if(p.itemPower!=null)bits.push(`IP ${p.itemPower}`,`T${p.tier}`,p.band?.label);
  if (p.archetype) bits.push(`${p.archetype}${p.identity ? `：${p.identity}` : ''}`);
  if (p.greaterCount) bits.push(`★Greater ×${p.greaterCount}`);
  return bits.filter(Boolean).join(' / ');
}

export function equipment3SpecialLines(p) {
  if (!p) return [];
  const lines=[];
  if(p.reasons?.length)lines.push(`【LOOT】${p.reasons.join(' / ')}`);
  if (p.legendary) lines.push(`《${p.legendary.name}》 ${p.legendary.desc}`);
  if (p.curse) lines.push(`【呪：${p.curse.name}】 ${p.curse.desc}`);
  return lines;
}

export function equipment3DropHeadline(p) {
  if (!p) return null;
  if (p.quality === 'jackpot') return `――JACKPOT${p.reasons?.length ? `：${p.reasons.slice(0,2).join(' / ')}` : ''}――`;
  if (p.quality === 'special') return `――SPECIAL DROP${p.reasons?.length ? `：${p.reasons.slice(0,2).join(' / ')}` : ''}――`;
  return null;
}
