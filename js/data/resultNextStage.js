import { CHAPTERS } from './stages.js';
import { buildAbyssStage } from './abyss.js';

function isStoryChapter(chapter) {
  return /^ch\d+$/.test(String(chapter?.id || ''));
}

export function nextStageAfter(currentStage, abyssPacts = []) {
  if (!currentStage || currentStage.secretRealm || currentStage.isRift || currentStage.branch) return null;
  if (currentStage.isAbyss) {
    const depth = Number(currentStage.abyssDepth);
    return Number.isFinite(depth) && depth >= 1 ? buildAbyssStage(depth + 1, abyssPacts) : null;
  }
  for (let ci = 0; ci < CHAPTERS.length; ci++) {
    const chapter = CHAPTERS[ci];
    if (!isStoryChapter(chapter)) continue;
    const mainStages = chapter.stages.filter((s) => !s.branch);
    const si = mainStages.findIndex((s) => s.id === currentStage.id);
    if (si < 0) continue;
    if (si + 1 < mainStages.length) return mainStages[si + 1];
    for (let ni = ci + 1; ni < CHAPTERS.length; ni++) {
      const nextChapter = CHAPTERS[ni];
      if (!isStoryChapter(nextChapter)) continue;
      return nextChapter.stages.find((s) => !s.branch) || null;
    }
    return null;
  }
  return null;
}
