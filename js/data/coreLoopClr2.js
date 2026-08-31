/* Core Loop Rework — CLR-2
   Pure identifiers for the first post-battle aftermath / route-branch slice.
   This module owns no reward, currency, combat stat, or save root. */

export const CLR2_AFTERMATH_TAG='clr2-aftermath';
export const CLR2_STEADY_TAG='clr2-steady';
export const CLR2_PRESSURE_TAG='clr2-pressure';

export const CLR2_BRANCH_NODE_IDS=Object.freeze({
  steady:'clr2-steady-route',
  pressure:'clr2-pressure-route',
});

export function adventure4Clr2AftermathNodeId(battleNodeId){
  return typeof battleNodeId==='string'&&battleNodeId.length?`clr2-aftermath:${battleNodeId}`:null;
}
