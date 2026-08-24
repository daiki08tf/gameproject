export const SPECIES_BOARD_NODES = Object.freeze([
  { id:'vitality', name:'生命適応', maxRank:3, baseCost:4, costStep:4, requiresResearch:5, desc:'この種族のHP +2%/Rank', effects:{hpMultPerRank:.02} },
  { id:'ferocity', name:'捕食本能', maxRank:3, baseCost:5, costStep:5, requiresResearch:10, desc:'この種族のATK +2%/Rank', effects:{atkMultPerRank:.02} },
  { id:'arcana', name:'魔力共鳴', maxRank:3, baseCost:5, costStep:5, requiresResearch:10, desc:'この種族のMAG +2%/Rank', effects:{magMultPerRank:.02} },
  { id:'instinct', name:'野生の勘', maxRank:3, baseCost:5, costStep:5, requiresResearch:20, desc:'この種族のSPD +2%/Rank', effects:{spdMultPerRank:.02} },
  { id:'affinity', name:'親和の記憶', maxRank:3, baseCost:7, costStep:6, requiresResearch:20, desc:'この種族の加入率 +0.5pt/Rank', effects:{recruitChancePerRank:.005} },
  { id:'pedigree', name:'血統解析', maxRank:3, baseCost:10, costStep:8, requiresResearch:30, desc:'新規個体のTalent最低値 +0.5%/Rank', effects:{talentFloorPerRank:.005} },
  { id:'master_trait', name:'種族真価', maxRank:1, baseCost:35, costStep:0, requiresResearch:50, desc:'HP/ATK/MAG/SPD +3%（研究50体で解禁）', effects:{allCombatMult:.03} },
]);

export function speciesBoardNode(id){return SPECIES_BOARD_NODES.find(x=>x.id===id)||null;}
export function speciesBoardCost(nodeOrId,rank=0){const node=typeof nodeOrId==='string'?speciesBoardNode(nodeOrId):nodeOrId;if(!node)return Infinity;return Math.max(1,Math.round(node.baseCost+Math.max(0,rank)*node.costStep));}
export function speciesBoardEffects(ranks={}){const out={hpMult:1,atkMult:1,magMult:1,spdMult:1,recruitChanceBonus:0,talentFloorBonus:0};for(const node of SPECIES_BOARD_NODES){const rank=Math.max(0,Math.min(node.maxRank,Math.floor(ranks[node.id]||0))),e=node.effects||{};out.hpMult*=1+(e.hpMultPerRank||0)*rank;out.atkMult*=1+(e.atkMultPerRank||0)*rank;out.magMult*=1+(e.magMultPerRank||0)*rank;out.spdMult*=1+(e.spdMultPerRank||0)*rank;out.recruitChanceBonus+=(e.recruitChancePerRank||0)*rank;out.talentFloorBonus+=(e.talentFloorPerRank||0)*rank;if(e.allCombatMult&&rank){out.hpMult*=1+e.allCombatMult;out.atkMult*=1+e.allCombatMult;out.magMult*=1+e.allCombatMult;out.spdMult*=1+e.allCombatMult;}}return out;}
