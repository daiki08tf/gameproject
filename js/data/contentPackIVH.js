/* Content Pack IV H — M7 comparative Branch record (Prime / 王樹領 / 深緑消失域).
   A compact "what changed?" derivation over the three already-authored Ch2
   histories. Introduces no new Branch, technology axis, profile level, or
   Codex/Chronicle authority — it only projects the existing OBSERVED_BRANCHES
   technologyProfile data (plus contentPackIVA.js's own authored Prime-history
   line) into one comparison. Never exposes an undiscovered Branch: both
   Branch anchors must already be observed before this returns anything. */
import { observedBranchById, OBSERVED_BRANCH_TECHNOLOGY_AXES, OBSERVED_BRANCH_PROFILE_LEVELS } from './observedBranches.js';
import { CP4_DEEP_GREEN_CHAIN } from './contentPackIVA.js';

export const CP4_COMPARATIVE_RECORD=Object.freeze({
  id:'cp4-deep-green-comparative-record',
  requiredDiscoveryIds:Object.freeze(['cp4:branch-anchor:tree-sovereign','cp4:branch-anchor:deep-green-absence']),
  title:'比較記録：深緑の森 三系統',
  primeLabel:'Prime',
  // Reuses contentPackIVA.js's own authored 'prime-record' step text
  // verbatim rather than inventing a second description of Prime Ch2.
  primeText:CP4_DEEP_GREEN_CHAIN.steps[0].text,
});

export function cp4ComparativeRecordReady({discoveries={}}={}){
  return CP4_COMPARATIVE_RECORD.requiredDiscoveryIds.every(id=>Boolean(discoveries[id]));
}

function levelText(branch,axis){
  return branch.technologyPresentation?.[axis]||OBSERVED_BRANCH_PROFILE_LEVELS[branch.technologyProfile[axis]]||branch.technologyProfile[axis];
}

const LEVEL_ORDER=['regressedMajor','regressed','baseline','advanced','advancedMajor','dominant'];
function levelIndex(level){return LEVEL_ORDER.indexOf(level);}

// Only the axes where 王樹領 and 深緑消失域 actually diverge from each other
// (both move away from Prime's shared '→' baseline in different ways) —
// the compact "what changed?" the roadmap asks for, not a six-axis dump.
export function cp4ComparativeRecordAxisDiffs(){
  const tree=observedBranchById('tree-sovereign-deep-green');
  const absence=observedBranchById('deep-green-absence');
  if(!tree||!absence)return[];
  return OBSERVED_BRANCH_TECHNOLOGY_AXES
    .map(axis=>({
      axis,
      treeLevel:tree.technologyProfile[axis],
      absenceLevel:absence.technologyProfile[axis],
      treeText:levelText(tree,axis),
      absenceText:levelText(absence,axis),
    }))
    .filter(row=>row.treeLevel!==row.absenceLevel)
    .sort((a,b)=>Math.abs(levelIndex(b.treeLevel)-levelIndex(b.absenceLevel))-Math.abs(levelIndex(a.treeLevel)-levelIndex(a.absenceLevel)));
}

export function cp4ComparativeRecordSummary(){
  const def=CP4_COMPARATIVE_RECORD;
  const diffs=cp4ComparativeRecordAxisDiffs();
  const lines=diffs.map(row=>`${row.axis}：王樹領 ${row.treeText} ⇔ 深緑消失域 ${row.absenceText}`);
  return `${def.primeLabel}：${def.primeText}\n${lines.join('\n')}`;
}
