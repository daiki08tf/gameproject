/* ============================================================
   Abyss 3.0 — Run Build
   深淵の連続潜行中だけ有効な一時ビルド。
   拠点帰還・敗北で消失する。
   ============================================================ */

export const ABYSS_RUN_BOONS = Object.freeze({
  thunder_edge: {
    id:'thunder_edge', school:'thunder', icon:'⚡', name:'雷刃の残響', maxRank:5,
    desc:'与ダメージ+6% / 会心率+2pt（Rankごと）',
    effectsPerRank:{ damageAdd:0.06, critAdd:2 },
  },
  blood_oath: {
    id:'blood_oath', school:'blood', icon:'🩸', name:'血誓の残響', maxRank:5,
    desc:'ATK+7% / 撃破時HP2%回復（Rankごと）',
    effectsPerRank:{ atkMultAdd:0.07, healOnKill:0.02 },
  },
  iron_wall: {
    id:'iron_wall', school:'iron', icon:'🛡️', name:'鋼壁の残響', maxRank:5,
    desc:'HP+6% / DEF+8%（Rankごと）',
    effectsPerRank:{ hpMultAdd:0.06, defMultAdd:0.08 },
  },
  arcane_well: {
    id:'arcane_well', school:'arcane', icon:'🔮', name:'魔導の残響', maxRank:5,
    desc:'MAG+8% / MP+6% / じゅもんDamage+4%（Rankごと）',
    effectsPerRank:{ magMultAdd:0.08, mpMultAdd:0.06, spellDamageAdd:0.04 },
  },
  gale_step: {
    id:'gale_step', school:'gale', icon:'🌪️', name:'疾風の残響', maxRank:5,
    desc:'SPD+8% / 回避+2pt（Rankごと）',
    effectsPerRank:{ spdMultAdd:0.08, evasionAdd:0.02 },
  },
});

export const ABYSS_RUN_SYNERGIES = Object.freeze([
  {
    id:'storm_blood', name:'《雷血奔流》', icon:'⚡🩸',
    requires:{ thunder_edge:2, blood_oath:2 },
    desc:'会心時の追撃Chance +12% / 撃破回復+3%',
    effects:{ critExtraChance:0.12, healOnKill:0.03 },
  },
  {
    id:'arcane_storm', name:'《雷鳴詠唱》', icon:'⚡🔮',
    requires:{ thunder_edge:2, arcane_well:2 },
    desc:'じゅもんDamage+18% / 会心率+4pt',
    effects:{ spellDamageAdd:0.18, critAdd:4 },
  },
  {
    id:'blood_fortress', name:'《不死城塞》', icon:'🩸🛡️',
    requires:{ blood_oath:2, iron_wall:2 },
    desc:'HP+15% / 撃破時HP5%回復',
    effects:{ hpMultAdd:0.15, healOnKill:0.05 },
  },
  {
    id:'wind_thunder', name:'《迅雷》', icon:'🌪️⚡',
    requires:{ gale_step:2, thunder_edge:2 },
    desc:'SPD+15% / Damage+10%',
    effects:{ spdMultAdd:0.15, damageAdd:0.10 },
  },
  {
    id:'arcane_bastion', name:'《魔導城壁》', icon:'🔮🛡️',
    requires:{ arcane_well:2, iron_wall:2 },
    desc:'MAG+12% / DEF+12% / MP+10%',
    effects:{ magMultAdd:0.12, defMultAdd:0.12, mpMultAdd:0.10 },
  },
]);

export function abyssRunBoon(id){ return ABYSS_RUN_BOONS[id] || null; }
export function abyssRunSynergies(ranks={}){
  return ABYSS_RUN_SYNERGIES.filter(s=>Object.entries(s.requires).every(([id,rank])=>(ranks[id]||0)>=rank));
}

function seededUnit(seed){
  let x=(Number(seed)||1)>>>0;
  x^=x<<13; x^=x>>>17; x^=x<<5;
  return (x>>>0)/4294967295;
}

export function abyssRunBoonChoices(depth, pickIndex=0, ranks={}){
  const eligible=Object.values(ABYSS_RUN_BOONS).filter(b=>(ranks[b.id]||0)<b.maxRank);
  const out=[];
  let seed=(Math.max(1,depth)*2654435761 + (pickIndex+1)*2246822519)>>>0;
  while(eligible.length && out.length<3){
    seed=(seed+0x9e3779b9)>>>0;
    const idx=Math.min(eligible.length-1,Math.floor(seededUnit(seed)*eligible.length));
    out.push(eligible.splice(idx,1)[0]);
  }
  return out;
}

export function aggregateAbyssRunEffects(ranks={}){
  const e={damageAdd:0,critAdd:0,atkMultAdd:0,defMultAdd:0,hpMultAdd:0,mpMultAdd:0,magMultAdd:0,spdMultAdd:0,evasionAdd:0,spellDamageAdd:0,healOnKill:0,critExtraChance:0};
  for(const [id,rankRaw] of Object.entries(ranks||{})){
    const boon=abyssRunBoon(id),rank=Math.max(0,Math.floor(Number(rankRaw)||0));
    if(!boon||!rank)continue;
    for(const [k,v] of Object.entries(boon.effectsPerRank||{})) e[k]=(e[k]||0)+v*rank;
  }
  for(const syn of abyssRunSynergies(ranks)) for(const [k,v] of Object.entries(syn.effects||{})) e[k]=(e[k]||0)+v;
  return e;
}
