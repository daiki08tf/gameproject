import { CHAPTERS } from './stages.js';
import { buildAbyssStage } from './abyss.js';

export function nextStageAfter(currentStage, abyssPacts = []) {
  if (!currentStage || currentStage.secretRealm || currentStage.isRift || currentStage.branch) return null;
  if (currentStage.isAbyss) {
    const depth = Number(currentStage.abyssDepth);
    return Number.isFinite(depth) && depth >= 1 ? buildAbyssStage(depth + 1, abyssPacts) : null;
  }
  for (let ci = 0; ci < CHAPTERS.length; ci++) {
    const mainStages = CHAPTERS[ci].stages.filter((s) => !s.branch);
    const si = mainStages.findIndex((s) => s.id === currentStage.id);
    if (si < 0) continue;
    if (si + 1 < mainStages.length) return mainStages[si + 1];
    const nextChapter = CHAPTERS[ci + 1];
    return nextChapter ? nextChapter.stages.find((s) => !s.branch) || null : null;
  }
  return null;
}
