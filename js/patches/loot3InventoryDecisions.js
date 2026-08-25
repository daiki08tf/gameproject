/* ============================================================
   Loot 3.0 — Inventory decisions
   ------------------------------------------------------------
   Raw power remains visible, but is no longer the only signal used by sorting
   and auto-equip. Build-defining rolls, Unique/Set identity and target-farm
   hits receive a bounded strategic bonus so a tiny flat-stat upgrade cannot
   silently erase a meaningful build piece.
   ============================================================ */
import { state } from '../state.js';
import { getItem, powerScore, SLOTS } from '../data/equipment.js';
import { equipment3Presentation } from '../data/equipment3Presentation.js';

function instanceFor(target, id) {
  return target.equipmentInstance?.(id)
    || target.data.weaponInstances?.[id]
    || target.data.gearInstances?.[id]
    || null;
}

function rawScore(target, id) {
  const item = getItem(id);
  if (!item) return -Infinity;
  return target.equipmentPowerScore?.(id) ?? powerScore(item);
}

export function decisionProfile(target, id) {
  const item = getItem(id);
  if (!item) return null;
  const inst = instanceFor(target, id);
  const p = equipment3Presentation(item, inst);
  const raw = rawScore(target, id);
  let strategicPct = 0;
  const reasons = [];

  if (item.unique) { strategicPct += 0.14; reasons.push('UNIQUE'); }
  if (item.setId || item.setName) { strategicPct += 0.10; reasons.push('SET'); }
  if (p?.buildCount) { strategicPct += Math.min(0.16, p.buildCount * 0.08); reasons.push(`BUILD${p.buildCount > 1 ? `×${p.buildCount}` : ''}`); }
  if (inst?.targetFarmHit) { strategicPct += 0.05; reasons.push('TARGET'); }
  if (p?.highestAffixRarity === 'ancient') { strategicPct += 0.08; reasons.push('ANCIENT'); }
  else if (p?.highestAffixRarity === 'mythic') { strategicPct += 0.04; reasons.push('MYTHIC'); }
  if ((p?.greaterCount || 0) >= 2) { strategicPct += 0.06; reasons.push(`GREATER×${p.greaterCount}`); }
  else if ((p?.greaterCount || 0) === 1) { strategicPct += 0.03; reasons.push('GREATER'); }
  if (p?.legendary) { strategicPct += 0.08; reasons.push('LEGENDARY POWER'); }

  // Keep this bounded. Build awareness should protect meaningful pieces from
  // marginal stat gains, not make an obsolete low-IP item beat a huge upgrade.
  strategicPct = Math.min(0.35, strategicPct);
  const strategic = Number.isFinite(raw) ? raw * (1 + strategicPct) : raw;
  return { raw, strategic, strategicPct, reasons, presentation: p };
}

state.equipmentDecisionProfile = function equipmentDecisionProfile(id) {
  return decisionProfile(this, id);
};
state.equipmentDecisionScore = function equipmentDecisionScore(id) {
  return decisionProfile(this, id)?.strategic ?? -Infinity;
};
state.compareEquipmentDecision = function compareEquipmentDecision(candidateId, currentId) {
  const candidate = decisionProfile(this, candidateId);
  const current = currentId ? decisionProfile(this, currentId) : null;
  if (!candidate) return null;
  if (!current) return { kind:'upgrade', label:'UPGRADE', detail:'空きスロットを埋める', candidate, current:null };
  const rawDelta = candidate.raw - current.raw;
  const strategicDelta = candidate.strategic - current.strategic;
  const rawBase = Math.max(1, Math.abs(current.raw));
  const strategicBase = Math.max(1, Math.abs(current.strategic));
  const rawPct = rawDelta / rawBase;
  const strategicPct = strategicDelta / strategicBase;
  let kind='sidegrade', label='SIDEGRADE', detail='性能差は小さい。Affix構成で選択';
  if (strategicPct >= 0.04) { kind='upgrade'; label='UPGRADE'; detail='総合的に更新候補'; }
  else if (strategicPct <= -0.12 && candidate.reasons.length === 0) { kind='salvage'; label='SALVAGE?', detail='現装備より大きく劣り、特殊価値も少ない'; }
  else if (rawPct < 0 && strategicPct >= -0.04 && candidate.reasons.length) { kind='build'; label='BUILD KEEP'; detail=`基礎戦力は下がるが ${candidate.reasons.slice(0,3).join(' / ')} を保持`; }
  else if (candidate.reasons.length && candidate.strategicPct > current.strategicPct + 0.05) { kind='build'; label='BUILD OPTION'; detail=`${candidate.reasons.slice(0,3).join(' / ')} のビルド候補`; }
  return { kind, label, detail, rawDelta, strategicDelta, candidate, current };
};

// Equipment 3.0 already owns canonical inventory persistence. Rebuild only the
// picker decision using strategic score; no new inventory path is introduced.
state.autoEquipBest = function loot3AutoEquipBest() {
  const pool = { ...this.data.inventory };
  for (const slot of SLOTS) {
    const id = this.data.equipped?.[slot];
    if (id) pool[id] = (pool[id] || 0) + 1;
  }
  const used = {}, next = {};
  const takeBest = (slotType) => {
    let best=null, bestScore=-Infinity;
    for (const [id, qty] of Object.entries(pool)) {
      if (qty - (used[id] || 0) <= 0) continue;
      const item=getItem(id);
      if (!item || item.slot !== slotType || !this.canEquipItem(item)) continue;
      const score=this.equipmentDecisionScore(id);
      if (score > bestScore) { best=id; bestScore=score; }
    }
    return best;
  };
  for (const slot of ['weapon','shield','head','body']) {
    const id=takeBest(slot); next[slot]=id; if(id) used[id]=(used[id]||0)+1;
  }
  for (const slot of ['accessory1','accessory2']) {
    const id=takeBest('accessory'); next[slot]=id; if(id) used[id]=(used[id]||0)+1;
  }
  const bag={};
  for (const [id,qty] of Object.entries(pool)) { const left=qty-(used[id]||0); if(left>0) bag[id]=left; }
  this.data.inventory=bag; this.data.equipped=next; this.save();
};
