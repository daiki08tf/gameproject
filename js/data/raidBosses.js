/* Official Phase 10-E — Raid Boss integration
 * Raid is an endgame-facing integration layer over the existing text battle,
 * Boss Encounter, Break/phase and reward systems. It is intentionally not a
 * second combat engine and does not introduce a new currency.
 */

export const RAID_BOSSES = Object.freeze([
  Object.freeze({
    id: 'raid-archeon',
    enemyType: 'raid_archeon',
    name: 'RAID：境界王アルケオン・零界再臨',
    shortName: '零界再臨アルケオン',
    recLevel: 3000,
    itemPowerTarget: 3000,
    requiredAbyssDepth: 10,
    dangerTags: Object.freeze(['Guard', 'Phase', 'Break', 'Resource']),
    mechanic: '七鍵守護機が王座を守る。位相反転のたびにBreak Gaugeが縮み、短い反撃窓が生まれる。',
    counterHint: '守護機を優先して排除し、位相反転直後のBreak窓へ火力を集中する。終盤は長期戦を避ける。',
    rewardHint: '境界王装・第八鍵系装備の再獲得機会。既存の装備・Gold・EXP経済を使う。',
    rewards: Object.freeze({ gold: 18000, exp: 165000 }),
    firstClear: Object.freeze({ itemId: 'ch25_named2_body' }),
    dropTable: Object.freeze([
      Object.freeze({ itemId: 'ch25_named_accessory', weight: 2 }),
      Object.freeze({ itemId: 'ch25_named2_body', weight: 1 }),
    ]),
  }),
]);

export function raidBossDef(id) {
  return RAID_BOSSES.find(raid => raid.id === id) || null;
}

export function raidBossUnlocked(raid, abyssBestDepth) {
  if (!raid) return false;
  return Math.max(0, Math.floor(Number(abyssBestDepth) || 0)) >= raid.requiredAbyssDepth;
}

export function buildRaidStage(id) {
  const raid = raidBossDef(id);
  if (!raid) return null;
  return {
    id: raid.id,
    name: raid.name,
    raid: true,
    boss: true,
    recLevel: raid.recLevel,
    itemPowerTarget: raid.itemPowerTarget,
    raidDangerTags: [...raid.dangerTags],
    raidMechanic: raid.mechanic,
    raidCounterHint: raid.counterHint,
    raidRewardHint: raid.rewardHint,
    requiredAbyssDepth: raid.requiredAbyssDepth,
    waves: [
      { type: 'ch25_tank', count: 2, interval: 1.1 },
      { type: 'ch25_fast', count: 1, interval: 0.8 },
      { type: raid.enemyType, count: 1, interval: 0 },
    ],
    rewards: { ...raid.rewards },
    firstClear: { ...raid.firstClear },
    dropTable: raid.dropTable.map(drop => ({ ...drop })),
  };
}
