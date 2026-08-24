/* ============================================================
   Abyss 3.0 — Branching Routes
   次の1階へ進む前に、Risk / Rewardの異なる道を選ぶ。
   ルート候補はdepthから決定的に生成し、リロードで厳選できない。
   ============================================================ */

export const ABYSS_ROUTES = Object.freeze([
  {
    id: 'armory', icon: '⚔️', name: '古代武器庫',
    desc: '忘れられた武具が眠る。守りは堅いが、装備を狙いやすい。',
    risk: '敵DEF +30%', reward: '装備Drop +75%',
    enemyDefMult: 1.30, dropMult: 1.75,
    target: 'equipment', targetLabel: '装備',
  },
  {
    id: 'beast_den', icon: '🐲', name: '魔獣の巣',
    desc: '無数の気配が蠢く獣道。数で押される代わりに経験値が多い。',
    risk: '敵数 +35%', reward: 'EXP +40%',
    enemyCountMult: 1.35, expMult: 1.40,
    target: 'monster', targetLabel: '魔物',
  },
  {
    id: 'blood_mist', icon: '🩸', name: '血霧の道',
    desc: '赤い霧の向こうから強烈な殺気を感じる。危険な品が集まりやすい。',
    risk: '敵ATK +35%', reward: 'Drop +45% / Cursed傾向',
    enemyAtkMult: 1.35, dropMult: 1.45,
    target: 'cursed', targetLabel: 'Cursed', cursedBias: 1.5,
  },
  {
    id: 'golden_vault', icon: '💰', name: '黄金迷宮',
    desc: '黄金色の光が漏れる回廊。敵は頑強だが大量のGoldを持つ。',
    risk: '敵HP +30%', reward: 'Gold +100%',
    enemyHpMult: 1.30, goldMult: 2.00,
    target: 'gold', targetLabel: 'Gold',
  },
  {
    id: 'rift_scar', icon: '🌀', name: '歪みの道',
    desc: 'Veilの傷跡が続く不安定な道。敵の動きが速く、亀裂の痕跡が濃い。',
    risk: '敵SPD +30%', reward: 'Drop +30% / Rift Key傾向',
    enemySpeedMult: 1.30, dropMult: 1.30,
    target: 'rift', targetLabel: 'Rift Key', riftKeyBias: 1.75,
  },
  {
    id: 'veil_fracture', icon: '👁️', name: '境界亀裂',
    desc: 'The Veilそのものが裂けている。全てが危険で、全てが濃い。',
    risk: '敵HP/ATK/DEF +20%', reward: 'EXP +50% / Drop +60%',
    enemyHpMult: 1.20, enemyAtkMult: 1.20, enemyDefMult: 1.20,
    expMult: 1.50, dropMult: 1.60,
    target: 'veil', targetLabel: '高品質戦利品', veilOnly: true,
  },
]);

export function abyssRoute(id) {
  return ABYSS_ROUTES.find(r => r.id === id) || null;
}

function seededOrder(depth, salt = 0) {
  let seed = ((Math.max(1, depth) * 1103515245) + 12345 + salt) >>> 0;
  const pool = ABYSS_ROUTES.map((route, index) => ({ route, index }));
  for (let i = pool.length - 1; i > 0; i--) {
    seed = (Math.imul(seed ^ (seed >>> 16), 2246822519) + 3266489917) >>> 0;
    const j = seed % (i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.map(x => x.route);
}

export function abyssRouteChoices(rawDepth, options = {}) {
  const depth = Math.max(1, Math.floor(Number(rawDepth) || 1));
  const veilBreached = !!options.veilBreached;
  const count = veilBreached ? 3 : 2;
  const eligible = seededOrder(depth).filter(route => !route.veilOnly || veilBreached);
  const picks = eligible.slice(0, count);

  // 20-8後は10階に1度、境界亀裂を必ず候補へ混ぜる。
  if (veilBreached && depth % 10 === 0 && !picks.some(r => r.id === 'veil_fracture')) {
    const veil = abyssRoute('veil_fracture');
    if (veil) picks[picks.length - 1] = veil;
  }
  return picks;
}

export function abyssRouteMultiplier(routeOrId, key) {
  const route = typeof routeOrId === 'string' ? abyssRoute(routeOrId) : routeOrId;
  return route?.[key] || 1;
}
