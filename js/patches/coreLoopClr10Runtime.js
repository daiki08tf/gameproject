/* Core Loop Rework — CLR-10 safe-return runtime.
   Promotes CLR-1 combat milestones into existing world2.eventMemory only when
   Adventure performs an explicit return. Suspend/defeat never reach this bridge. */
import { state } from '../state.js';
import { adventure4Clr10ReturnMemories } from '../data/coreLoopClr10.js';
import './adventureWorld4EventMemoryRuntime.js';
import './adventureWorld4Session.js';

const previousReturnFromAdventure4=state.returnFromAdventure4;

state.returnFromAdventure4=function clr10ReturnFromAdventure4(...args){
  const session=this.adventure4Session?.();
  const memories=adventure4Clr10ReturnMemories(session);
  const recorded=[];
  for(const entry of memories){
    if(this.adventure4EventMemory?.(entry.eventId))continue;
    const result=this.rememberAdventure4Event?.(entry.eventId,entry.patch);
    if(result?.ok)recorded.push(result);
  }
  const returned=previousReturnFromAdventure4.apply(this,args);
  return returned?.ok?{...returned,clr10ReturnReactions:recorded}:returned;
};
