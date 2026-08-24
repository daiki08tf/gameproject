import test from 'node:test';
import assert from 'node:assert/strict';
import { simulateLootCheckpoint } from '../scripts/loot-simulation.js';
import { EQUIPMENT3_SETS } from '../js/data/equipment3Sets.js';
import { LEGENDARY_EFFECTS, CURSED_AFFIXES } from '../js/data/equipment3Legendary.js';

function effects(set){return [...(set.bonuses[2].effects||[]),...(set.bonuses[3].effects||[])];}
function passiveDamage(set,kind='dmgBonusAdd'){return effects(set).filter(e=>e.trigger==='passive'&&e.kind===kind).reduce((n,e)=>n+(e.power||0),0);}
function statMult(set,stat){return (set.bonuses[2].statMult?.[stat]||1)*(set.bonuses[3].statMult?.[stat]||1);}

// Random IP10000 gear is the flexible high-ceiling path: strong packages exist, but
// completed God/Jackpot pieces remain rare enough that fixed Sets still provide a
// reliable progression target rather than being instantly obsolete.
test('IP10000 random gear has a high ceiling without making God rolls routine',()=>{
  const normal=simulateLootCheckpoint({itemPower:10000,samples:30000,itemRarity:'legendary',affixCount:4,source:'normal',seed:'build-audit'});
  const nemesis=simulateLootCheckpoint({itemPower:10000,samples:30000,itemRarity:'legendary',affixCount:4,source:'nemesis',seed:'build-audit'});
  const o=normal.observed,n=nemesis.observed;
  assert.ok(o.legendaryEffect>.20&&o.legendaryEffect<.40);
  assert.ok(o.godRoll>.01&&o.godRoll<.15,'God rolls should be exciting, not baseline');
  assert.ok(o.jackpotRoll<.02,'Jackpot pieces must remain exceptional');
  assert.ok(n.godRoll>o.godRoll&&n.jackpotRoll>o.jackpotRoll,'premium content should improve random-gear ceiling');
  console.log('IP10000_RANDOM_BUILD',JSON.stringify({legendary:+o.legendaryEffect.toFixed(3),curse:+o.curse.toFixed(3),god:+o.godRoll.toFixed(3),jackpot:+o.jackpotRoll.toFixed(4),nemesisGod:+n.godRoll.toFixed(3)}));
});

// Sets are the deterministic identity path. Their unconditional damage bonuses are
// intentionally lower than extreme Cursed/Legendary packages, while percentages,
// utility and procs prevent flat-stat decay at Lv99,999.
test('three-piece Sets trade random ceiling for guaranteed build identity',()=>{
  const blood=EQUIPMENT3_SETS.blood_king,dragon=EQUIPMENT3_SETS.ancient_dragon,star=EQUIPMENT3_SETS.star_weaver,abyss=EQUIPMENT3_SETS.abyss_walker,exec=EQUIPMENT3_SETS.executioner;
  assert.equal(statMult(blood,'atk'),1.12);assert.equal(passiveDamage(blood),.20);
  assert.equal(statMult(dragon,'hp'),1.12);assert.equal(statMult(dragon,'def'),1.12);assert.equal(passiveDamage(dragon),.12);
  assert.equal(statMult(star,'mag'),1.15);assert.equal(passiveDamage(star,'spellDmgAdd'),.25);
  assert.equal(passiveDamage(abyss),.18);assert.equal(passiveDamage(exec),.08);
  for(const [id,set] of Object.entries(EQUIPMENT3_SETS)){
    const scalable=effects(set).some(e=>(e.power||0)>0||(e.chance||0)>0)||Object.keys(set.bonuses[2].statMult||{}).length||Object.keys(set.bonuses[2].statAdd||{}).length;
    assert.ok(scalable,`${id} must scale beyond fixed item stats`);
    assert.ok(passiveDamage(set)<=.25,`${id} unconditional generic damage should not dominate random gear ceiling`);
  }
});

test('random Legendary/Cursed packages retain a higher specialist ceiling than analogous Set procs',()=>{
  const thunder=LEGENDARY_EFFECTS.thunderheart.effects[0],abyssCrit=effects(EQUIPMENT3_SETS.abyss_walker).find(e=>e.kind==='critExtraAttack');
  const echo=LEGENDARY_EFFECTS.arcane_echo.effects[0],starEcho=effects(EQUIPMENT3_SETS.star_weaver).find(e=>e.kind==='spellEcho');
  assert.ok(thunder.chance>abyssCrit.chance&&thunder.power>abyssCrit.power);
  assert.ok(echo.chance>starEcho.chance);
  const bloodCurse=CURSED_AFFIXES.blood_contract,glass=CURSED_AFFIXES.glass_blade;
  assert.ok(bloodCurse.effects[0].power>.25&&bloodCurse.statMult.hp<1);
  assert.ok(glass.effects[0].power>.25&&glass.statMult.def<1);
});

test('build ecosystem exposes offense, defense, spell, mobility and execute Set niches',()=>{
  const report={
    blood:{atk:statMult(EQUIPMENT3_SETS.blood_king,'atk'),damage:passiveDamage(EQUIPMENT3_SETS.blood_king)},
    dragon:{hp:statMult(EQUIPMENT3_SETS.ancient_dragon,'hp'),def:statMult(EQUIPMENT3_SETS.ancient_dragon,'def'),damage:passiveDamage(EQUIPMENT3_SETS.ancient_dragon)},
    star:{mag:statMult(EQUIPMENT3_SETS.star_weaver,'mag'),spell:passiveDamage(EQUIPMENT3_SETS.star_weaver,'spellDmgAdd')},
    abyss:{damage:passiveDamage(EQUIPMENT3_SETS.abyss_walker),armorPen:EQUIPMENT3_SETS.abyss_walker.bonuses[2].statAdd.armorPen,evasion:EQUIPMENT3_SETS.abyss_walker.bonuses[2].statAdd.evasion},
    executioner:{damage:passiveDamage(EQUIPMENT3_SETS.executioner),execute:effects(EQUIPMENT3_SETS.executioner).find(e=>e.kind==='executioner').power},
  };
  assert.equal(new Set([report.blood.atk,report.dragon.hp,report.star.mag,report.abyss.armorPen,report.executioner.execute].map(String)).size,5);
  console.log('ENDGAME_SET_BUILD_REPORT',JSON.stringify(report));
});
