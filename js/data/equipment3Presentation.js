/* Equipment 3.0 E7 — shared presentation model */
import { itemPowerBand } from './equipment3.js';
import { describeAffix, AFFIX_RARITY_LABEL } from './affixes.js';
import { getLegendaryEffect, getCursedAffix } from './equipment3Legendary.js';
import { loot2Presentation } from './loot2.js';

export function equipment3Presentation(item, inst = null) {
  if (!item) return null;
  if (!inst) return {
    name: item.name,
    archetype: item.weaponArchetypeName || null,
    identity: item.weaponArchetypeIdentity || null,
    itemPower: null,
    tier: null,
    band: null,
    greaterCount: 0,
    affixes: [],
    legendary: null,
    curse: null,
    quality: 'standard',
    loot2:null,
  };

  const itemPower = Math.max(1, Math.floor(Number(inst.itemPower) || 1));
  const tier = Math.max(1, Math.min(10, Math.floor(Number(inst.affixTier) || Math.ceil(itemPower / 1000))));
  const band = itemPowerBand(itemPower);
  const greaterCount = Math.max(0, Math.floor(Number(inst.greaterAffixCount) || 0));
  const legendary = getLegendaryEffect(inst.legendaryEffectId);
  const curse = getCursedAffix(inst.curseId);
  const affixes = (inst.affixes || []).map((a) => {
    const d = describeAffix(a);
    return {
      id: a.id,
      name: d.name,
      desc: d.desc,
      rarity: a.rarity,
      rarityLabel: AFFIX_RARITY_LABEL[a.rarity] || a.rarity,
      greater: !!a.greater,
      roll: a.roll,
    };
  });

  const loot2=loot2Presentation({...inst,greaterAffixCount:greaterCount});
  let quality = 'standard';
  if (loot2.tier.id==='primordial') quality='primordial';
  else if(loot2.tier.id==='ancient') quality='ancient';
  else if (legendary || greaterCount >= 2) quality = 'jackpot';
  else if (curse || greaterCount === 1 || itemPower >= 3000) quality = 'special';

  return {
    name: inst.displayName || item.name,
    archetype: item.weaponArchetypeName || null,
    identity: item.weaponArchetypeIdentity || null,
    itemPower,
    tier,
    band,
    greaterCount,
    affixes,
    legendary,
    curse,
    quality,
    loot2,
  };
}

export function equipment3MetaText(p) {
  if (!p || p.itemPower == null) return '';
  const bits = [`IP ${p.itemPower}`, `T${p.tier}`, p.band?.label].filter(Boolean);
  if(p.loot2?.tier?.rank>0)bits.unshift(`✦ ${p.loot2.tier.name} / SCORE ${p.loot2.score}`);
  if (p.archetype) bits.push(`${p.archetype}${p.identity ? `：${p.identity}` : ''}`);
  if (p.greaterCount) bits.push(`★Greater ×${p.greaterCount}`);
  return bits.join(' / ');
}

export function equipment3SpecialLines(p) {
  if (!p) return [];
  const lines = [];
  if(p.loot2?.tier?.id==='primordial')lines.push('✦《PRIMORDIAL》終焉域でも滅多に成立しない完成個体');
  else if(p.loot2?.tier?.id==='ancient')lines.push('◆《ANCIENT》極めて高品質な古代級個体');
  if (p.legendary) lines.push(`《${p.legendary.name}》 ${p.legendary.desc}`);
  if (p.curse) lines.push(`【呪：${p.curse.name}】 ${p.curse.desc}`);
  return lines;
}

export function equipment3DropHeadline(p) {
  if (!p) return null;
  if(p.quality==='primordial')return '――世界の理から外れた装備が顕現した――';
  if(p.quality==='ancient')return '――古き力を宿した装備を発見――';
  if (p.quality === 'jackpot') return '――黄金の光が戦場を満たす――';
  if (p.quality === 'special') return '――異質な力を宿す装備を発見――';
  return null;
}
