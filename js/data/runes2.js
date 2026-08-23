/* ============================================================
   Progression 2.0 Phase 5 — Rune 2.0 definitions
   ============================================================ */

export const RUNE2_DEFS = [
  { id:'force', name:'剛撃', english:'Force', kind:'statMult', stat:'atk', perMark:0.05, stageIds:['1-1'], dropRate:0.05 },
  { id:'ironclad', name:'鉄壁', english:'Iron-clad', kind:'statMult', stat:'def', perMark:0.05, stageIds:['1-2'], dropRate:0.05 },
  { id:'wise', name:'賢者', english:'Wise', kind:'statMult', stat:'mag', perMark:0.05, stageIds:['1-3'], dropRate:0.05 },
  { id:'notfall', name:'不倒', english:'Not fall', kind:'statMult', stat:'hp', perMark:0.05, stageIds:['1-4'], dropRate:0.05 },
  { id:'spirit', name:'精神', english:'Spirit', kind:'statMult', stat:'mp', perMark:0.05, stageIds:['4-3'], dropRate:0.03 },
  { id:'hawkeye', name:'鷹目', english:'Hawk eye', kind:'special', stageIds:['2-2'], dropRate:0.03 },
  { id:'illusion', name:'幻影', english:'Illusion', kind:'special', stageIds:['3-3'], dropRate:0.025 },
  { id:'bless', name:'祝福', english:'Bless', kind:'special', stageIds:['5-3'], dropRate:0.025 },
  { id:'swift', name:'俊足', english:'Swift', kind:'special', starAt:500, stageIds:['6-3'], dropRate:0.02 },
  { id:'fists', name:'百烈', english:'Fists', kind:'special', starAt:500, stageIds:['7-3'], dropRate:0.02 },
  { id:'greed', name:'強欲', english:'Greed', kind:'special', stageIds:['8-4'], dropRate:0.0125 },
  { id:'gold', name:'黄金', english:'Gold', kind:'special', starAt:2000, stageIds:['6-4'], dropRate:0.02 },
  { id:'challenge', name:'挑戦', english:'Challenge', kind:'special', starAt:2000, stageIds:['9-4'], dropRate:0.01 },
  { id:'observe', name:'観察', english:'Observe', kind:'special', starAt:500, stageIds:['2-1'], dropRate:0.03 },
  { id:'bastion', name:'絶壁', english:'Bastion', kind:'special', stageIds:['10-5'], dropRate:0.006 },
  { id:'bond', name:'縁', english:'Bond', kind:'special', starAt:1000, stageIds:['7-B'], dropRate:0.01 },
  { id:'craft', name:'匠', english:'Craft', kind:'special', starAt:1000, stageIds:['9-5'], dropRate:0.008 },
  { id:'fate', name:'運命', english:'Fate', kind:'special', starAt:1000, stageIds:['10-5'], dropRate:0.0025 },
];

const MAP = new Map(RUNE2_DEFS.map((r) => [r.id, r]));
export function getRune2(id) { return MAP.get(id); }
export function runesForStage(stageId) { return RUNE2_DEFS.filter((r) => r.stageIds.includes(stageId)); }

export function rune2EffectText(rune, marks = 1) {
  if (!rune) return '';
  if (rune.kind === 'statMult') return `${rune.stat.toUpperCase()} +${Math.round(rune.perMark * marks * 100)}%`;
  if (rune.id === 'challenge') return '100刻ごとにChallenge Lv+1（Phase 6で戦闘へ接続）';
  if (rune.id === 'greed') return '50刻ごとにドロップ品質を強化（Phase 6で接続）';
  if (rune.id === 'observe') return '刻数に応じて敵情報を解禁（Phase 6で接続）';
  return '特殊効果（Phase 6で戦闘・周回システムへ接続）';
}
