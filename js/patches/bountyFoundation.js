/* ============================================================
   Bounty Foundation
   - 既存CHAPTERSへ賞金首ステージを後付け
   - 既存stageProgressをそのまま討伐記録として利用
   ============================================================ */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';
import { BOUNTIES, buildBountyStage, bountyById } from '../data/bounties.js';

for (const bounty of BOUNTIES) {
  const chapter = CHAPTERS.find((ch) => ch.id === bounty.chapterId);
  if (!chapter) continue;
  if (chapter.stages.some((stage) => stage.id === bounty.id)) continue;
  chapter.stages.push(buildBountyStage(bounty));
}

state.isBountyDefeated = function isBountyDefeated(id) {
  return !!bountyById(id) && this.isStageCleared(id);
};
state.bountyDefeatCount = function bountyDefeatCount() {
  return BOUNTIES.filter((b) => this.isStageCleared(b.id)).length;
};
state.discoveredBounties = function discoveredBounties() {
  return BOUNTIES.filter((b) => this.isStageCleared(b.requires));
};
