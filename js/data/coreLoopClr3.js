/* Core Loop Rework — CLR-3
   Read-only run summary derived from existing Adventure session state.
   No new save root, reward history, or battle result authority. */
import { CLR1_COMBAT_CHAIN_TAG,adventure4Clr1BattleClearFlag } from './coreLoopClr1.js';
import { CLR2_BRANCH_NODE_IDS } from './coreLoopClr2.js';

export function adventure4Clr3RunSummary(session={},route=null){
  const battles=(route?.nodes||[]).filter(node=>node.tags?.includes(CLR1_COMBAT_CHAIN_TAG));
  const flags=session?.temporaryFlags||{};
  const cleared=battles.filter(node=>!!flags[adventure4Clr1BattleClearFlag(node.id)]).length;
  const visited=new Set(session?.visitedNodeIds||[]);
  const routeChoice=visited.has(CLR2_BRANCH_NODE_IDS.pressure)
    ?'pressure'
    :visited.has(CLR2_BRANCH_NODE_IDS.steady)?'steady':'undecided';
  const fullCount=battles.length;
  const steadyCount=Math.max(0,fullCount-1);
  const targetCount=routeChoice==='steady'?steadyCount:fullCount;
  const remainingMin=Math.max(0,(routeChoice==='undecided'?steadyCount:targetCount)-cleared);
  const remainingMax=Math.max(0,targetCount-cleared);
  const routeLabel=routeChoice==='steady'
    ?'安全路を選択'
    :routeChoice==='pressure'?'圧力路を選択':'ルート未選択';
  const remainingLabel=remainingMin===remainingMax
    ?`残り${remainingMax}戦`
    :`残り${remainingMin}〜${remainingMax}戦`;
  return Object.freeze({
    cleared,
    fullCount,
    steadyCount,
    routeChoice,
    progressLabel:`${cleared}戦突破`,
    routeLabel,
    remainingMin,
    remainingMax,
    remainingLabel,
  });
}
