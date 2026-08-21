/* ============================================================
   ステージ／章データ定義
   ============================================================ */

export const CHAPTERS = [
  {
    id: 'ch1',
    name: '第1章 はじまりの平原',
    stages: [
      {
        id: '1-1', name: '平原の入口', recLevel: 1,
        waves: [{ type: 'grunt', count: 5, interval: 1.4 }],
        rewards: { gold: 30, exp: 20 },
        firstClear: { itemId: 'wp_sword_n' },
        dropTable: [{ itemId: 'ac_ring_n', weight: 1 }],
      },
      {
        id: '1-2', name: '風吹く丘', recLevel: 2,
        waves: [
          { type: 'grunt', count: 4, interval: 1.2 },
          { type: 'fast', count: 3, interval: 1.0 },
        ],
        rewards: { gold: 45, exp: 32 },
        firstClear: { itemId: 'sh_wood_n' },
        dropTable: [{ itemId: 'hd_cap_n', weight: 1 }],
      },
      {
        id: '1-3', name: '洞窟の入り口', recLevel: 4,
        waves: [
          { type: 'fast', count: 5, interval: 0.9 },
          { type: 'tank', count: 2, interval: 2.0 },
        ],
        rewards: { gold: 60, exp: 46 },
        firstClear: { itemId: 'bd_cloth_n' },
        dropTable: [{ itemId: 'wp_sword_r', weight: 1 }, { itemId: 'ac_amulet_r', weight: 1 }],
      },
      {
        id: '1-4', name: '魔物の巣窟', recLevel: 6,
        waves: [
          { type: 'grunt', count: 5, interval: 1.0 },
          { type: 'fast', count: 5, interval: 0.8 },
          { type: 'tank', count: 3, interval: 1.8 },
        ],
        rewards: { gold: 90, exp: 70 },
        firstClear: { itemId: 'sh_iron_r' },
        dropTable: [{ itemId: 'hd_helm_r', weight: 1 }, { itemId: 'bd_leather_r', weight: 1 }],
      },
      {
        id: '1-5', name: 'オークキングの城', recLevel: 8, boss: true,
        waves: [
          { type: 'grunt', count: 4, interval: 1.2 },
          { type: 'boss_orcking', count: 1, interval: 0 },
        ],
        rewards: { gold: 200, exp: 150 },
        firstClear: { itemId: 'wp_sword_e' },
        dropTable: [{ itemId: 'ac_charm_e', weight: 1 }, { itemId: 'bd_plate_e', weight: 1 }],
      },
    ],
  },
];

export function findStage(stageId) {
  for (const ch of CHAPTERS) {
    const st = ch.stages.find((s) => s.id === stageId);
    if (st) return { chapter: ch, stage: st };
  }
  return null;
}
