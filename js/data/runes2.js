/* ============================================================
   Progression 2.0 Phase 5/6 — Rune 2.0 definitions
   ============================================================ */

export const RUNE2_DEFS = [
  { id:'force', name:'剛撃', english:'Force', kind:'statMult', stat:'atk', perMark:0.05, stageIds:['1-1'], dropRate:0.05 },
  { id:'ironclad', name:'鉄壁', english:'Iron-clad', kind:'statMult', stat:'def', perMark:0.05, stageIds:['1-2'], dropRate:0.05 },
  { id:'wise', name:'賢者', english:'Wise', kind:'statMult', stat:'mag', perMark:0.05, stageIds:['1-3'], dropRate:0.05 },
  { id:'notfall', name:'不倒', english:'Not fall', kind:'statMult', stat:'hp', perMark:0.05, stageIds:['1-4'], dropRate:0.05 },
  { id:'spirit', name:'精神', english:'Spirit', kind:'statMult', stat:'mp', perMark:0.05, stageIds:['4-3','13-3'], dropRate:0.03 },
  { id:'hawkeye', name:'鷹目', english:'Hawk eye', kind:'special', stageIds:['2-2'], dropRate:0.03 },
  { id:'illusion', name:'幻影', english:'Illusion', kind:'special', stageIds:['3-3','11-3'], dropRate:0.025 },
  { id:'bless', name:'祝福', english:'Bless', kind:'special', stageIds:['5-3','14-3'], dropRate:0.025 },
  { id:'swift', name:'俊足', english:'Swift', kind:'special', starAt:500, stageIds:['6-3'], dropRate:0.02 },
  { id:'fists', name:'百烈', english:'Fists', kind:'special', starAt:500, stageIds:['7-3','12-3'], dropRate:0.02 },
  { id:'greed', name:'強欲', english:'Greed', kind:'special', stageIds:['8-4','14-B'], dropRate:0.0125 },
  { id:'gold', name:'黄金', english:'Gold', kind:'special', starAt:2000, stageIds:['6-4'], dropRate:0.02 },
  { id:'challenge', name:'挑戦', english:'Challenge', kind:'special', starAt:2000, stageIds:['9-4'], dropRate:0.01 },
  { id:'observe', name:'観察', english:'Observe', kind:'special', starAt:500, stageIds:['2-1'], dropRate:0.03 },
  { id:'bastion', name:'絶壁', english:'Bastion', kind:'special', stageIds:['10-5','15-5'], dropRate:0.006 },
  { id:'bond', name:'縁', english:'Bond', kind:'special', starAt:1000, stageIds:['7-B','12-B'], dropRate:0.01 },
  { id:'craft', name:'匠', english:'Craft', kind:'special', starAt:1000, stageIds:['9-5','15-B'], dropRate:0.008 },
  { id:'fate', name:'運命', english:'Fate', kind:'special', starAt:1000, stageIds:['10-5','15-5'], dropRate:0.0025 },
];
const MAP=new Map(RUNE2_DEFS.map(r=>[r.id,r]));
export function getRune2(id){return MAP.get(id);}
export function runesForStage(stageId){return RUNE2_DEFS.filter(r=>r.stageIds.includes(stageId));}
export function rune2EffectText(rune,marks=1){
  if(!rune)return'';const n=Math.max(0,Math.floor(Number(marks)||0));
  if(rune.kind==='statMult')return`${rune.stat.toUpperCase()} +${Math.round(rune.perMark*n*100)}%`;
  if(rune.id==='challenge'){const lv=Math.min(20,Math.floor(n/100));return`Challenge Lv.${lv}：敵HP +${lv*10}% / ATK +${lv*5}% / EXP +${lv*10}% / Gold +${lv*5}% / Rune抽選率 +${lv*2}%`;}
  if(rune.id==='greed')return`50刻ごとに通常Dropの最低レア帯を1段除外（現在 ${Math.floor(n/50)}段）`;
  if(rune.id==='observe')return'1/50/100/250/500刻で敵のHP・能力・報酬・分類・解析IDを順次表示';
  if(rune.id==='swift')return`先攻判定速度 +${Math.min(50,n*.1).toFixed(1)}%（効果上限500刻 / ★500）`;
  if(rune.id==='fists')return`通常攻撃間隔 -${Math.min(50,n*.1).toFixed(1)}%（効果上限500刻 / ★500）`;
  if(rune.id==='bond'){const e=Math.min(1000,n);return`仲間加入率 +${(e*.015).toFixed(1)}pt / 仲間EXP +${(e*.05).toFixed(1)}% / 加入個体Rare化 ${Math.min(20,e*.02).toFixed(1)}%（効果上限1000刻 / ★1000）`;}
  if(rune.id==='gold')return'Gold系特殊効果（後続Phaseで拡張）';
  if(rune.id==='hawkeye'||rune.id==='illusion'||rune.id==='bless'||rune.id==='bastion')return'戦闘系特殊効果（後続Phaseで接続）';
  return'特殊効果（仲間・装備・エンドゲーム拡張Phaseで接続）';
}
