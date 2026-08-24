/* Exploration 1.0 — discoveries are revealed in stages instead of a flat unlock list. */
import { expandedExplorationSites } from './secretRealmExpansion.js';

const BASE_SITES = [
  {
    id: 'blood_gate',
    hiddenName: '？？？',
    discoveredName: '血塗られた扉',
    realmName: '血王城',
    discoverDepth: 327,
    clueDepth: 420,
    fragmentSources: [500, 650, 800],
    fragmentsRequired: 3,
    inspectText: [
      '巨大な赤黒い扉が、深淵の壁に埋め込まれている。',
      '鍵穴の周囲には乾いた血の跡が残っている。',
      '扉には「王は死なず。三つの血を捧げよ」と刻まれている。',
    ],
    unlockedText: '三つの鍵片が共鳴し、血塗られた扉がゆっくりと開いた。',
    realm: {
      id: 'secret-blood-castle',
      recLevel: 12500,
      itemPowerTarget: 5600,
      rule: '回復効果-50% / 出血・吸血ビルド向け',
      rewardHint: '血王系Set・出血/吸血系の高品質装備を狙える。',
    },
  },
  {
    id: 'seven_seal_gate',
    hiddenName: '？？？？？？',
    discoveredName: '七つの鍵穴を持つ巨大扉',
    discoverDepth: 100,
    clueDepth: 1000,
    fragmentsRequired: 7,
    fragmentSources: [],
    inspectText: [
      '人の手で作られたとは思えない巨大な扉だ。',
      '扉には、形の異なる七つの鍵穴がある。',
      '向こう側から、かすかな鼓動のような音が聞こえる……。',
    ],
    finalGoal: true,
  },
];

export const EXPLORATION_SITES = Object.freeze([...BASE_SITES, ...expandedExplorationSites()]);
export function explorationSite(id){ return EXPLORATION_SITES.find(x=>x.id===id)||null; }
export function explorationProgressFor(site, bestDepth, saved={}){
  const best=Math.max(0,Math.floor(Number(bestDepth)||0));
  if(best<site.discoverDepth) return { state:'hidden', fragments:0, inspected:false, unlocked:false };
  const fragments=site.fragmentSources.filter(d=>best>=d).length;
  const inspected=Boolean(saved.inspected) || best>=site.clueDepth;
  const unlocked=!site.finalGoal && fragments>=site.fragmentsRequired;
  return { state:unlocked?'unlocked':inspected?'clued':'discovered', fragments, inspected, unlocked };
}
