/* ============================================================
   Battle Report — 1 戦闘の「誰が・何で・どれだけ」を集計する純粋関数群。
   ------------------------------------------------------------
   ビルドを変えた効果が数字で見えないと、ハクスラの装備・職業選びが
   手探りになる。BattleEngine が既に出している戦闘イベントを数えるだけで、
   戦闘ルール・報酬・セーブには一切関与しない（その戦闘の結果オブジェクトに
   載せて、リザルト画面が読むだけ）。
   ============================================================ */

export function createBattleReport() {
  // kinds: 与ダメージを「こうげき／とくぎ／じゅもん／仲間／継続」に分けた合計（ビルド診断が読む）
  return { rounds: 0, dealt: 0, taken: 0, crits: 0, hits: 0, bySource: new Map(), byEnemy: new Map(), kinds: { attack: 0, skill: 0, spell: 0, companion: 0, dot: 0 }, biggestHit: null, biggestTaken: null };
}

function plainName(name) { return String(name || '').replace(/^(?:【[^】]*】)+/, '').trim() || '？？？'; }

function addSource(report, label, amount, kind) {
  if (!(amount > 0)) return;
  report.dealt += amount;
  if (kind && report.kinds) report.kinds[kind] = (report.kinds[kind] || 0) + amount;
  report.bySource.set(label, (report.bySource.get(label) || 0) + amount);
}

function recordPlayerAction(report, r) {
  if (!r || r.blocked) return;
  if (r.action === 'attack') {
    const dmg = Number(r.damage) || 0;
    addSource(report, 'こうげき', dmg, 'attack');
    report.hits += Number(r.hitCount) || (dmg > 0 ? 1 : 0);
    report.crits += Number(r.criticalCount) || (r.critical ? 1 : 0);
    if (dmg > 0 && (!report.biggestHit || dmg > report.biggestHit.amount)) report.biggestHit = { amount: dmg, label: 'こうげき' };
    return;
  }
  if (!Array.isArray(r.targets)) return;
  // companionBattle は「敵が仲間を殴った」も playerAction の形でログへ流す。
  // その targets は targetId を持たない（敵ではなく仲間が対象）ので与ダメージに数えない。
  const targets = r.targets.filter((t) => t && t.targetId != null);
  if (!targets.length) return;
  const label = r.companion ? `仲間：${r.companionName || '？？？'}` : (r.name || (r.action === 'spell' ? 'じゅもん' : 'とくぎ'));
  for (const t of targets) {
    const dmg = Number(t.damage) || 0;
    addSource(report, label, dmg, r.companion ? 'companion' : r.action === 'spell' ? 'spell' : 'skill');
    if (dmg > 0) report.hits += 1;
    if (t.critical) report.crits += 1;
    if (dmg > 0 && (!report.biggestHit || dmg > report.biggestHit.amount)) report.biggestHit = { amount: dmg, label };
  }
}

function recordEnemyAction(report, r) {
  if (!r || r.companionTarget) return;
  const dmg = Number(r.damage) || 0;
  if (!(dmg > 0)) return;
  const name = plainName(r.name);
  report.taken += dmg;
  report.byEnemy.set(name, (report.byEnemy.get(name) || 0) + dmg);
  if (!report.biggestTaken || dmg > report.biggestTaken.amount) report.biggestTaken = { amount: dmg, label: name, special: r.kind && r.kind !== 'attack' };
}

export function recordBattleEvents(report, events) {
  if (!report || !Array.isArray(events)) return report;
  for (const ev of events) {
    if (!ev) continue;
    if (ev.type === 'playerAction') recordPlayerAction(report, ev.result);
    else if (ev.type === 'enemyAction') recordEnemyAction(report, ev.result);
    else if (ev.type === 'dotTick') addSource(report, '継続ダメージ', Number(ev.amount) || 0, 'dot');
  }
  return report;
}

function top(map, total, limit) {
  return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([label, amount]) => ({ label, amount: Math.round(amount), share: total > 0 ? amount / total : 0 }));
}

// リザルトが読む形へ。maxHp は「被ダメージが最大 HP の何倍か」を出すために渡す。
export function summarizeBattleReport(report, { rounds = 0, maxHp = 0 } = {}) {
  if (!report) return null;
  const r = Math.max(1, Number(rounds) || report.rounds || 1);
  return {
    rounds: r,
    dealt: Math.round(report.dealt),
    dealtPerRound: Math.round(report.dealt / r),
    sources: top(report.bySource, report.dealt, 4),
    kinds: { ...(report.kinds || {}) },
    critRate: report.hits > 0 ? report.crits / report.hits : 0,
    biggestHit: report.biggestHit ? { ...report.biggestHit, amount: Math.round(report.biggestHit.amount) } : null,
    taken: Math.round(report.taken),
    takenVsMaxHp: maxHp > 0 ? report.taken / maxHp : 0,
    threats: top(report.byEnemy, report.taken, 2),
    biggestTaken: report.biggestTaken ? { ...report.biggestTaken, amount: Math.round(report.biggestTaken.amount) } : null,
  };
}

// 直近の戦闘レポート（このページを開いている間だけ。保存しない）。ビルド診断・ステータス画面が読む。
// 画面側がパッチを import して読み込み順を変えてしまわないよう、置き場はデータ層にする。
let lastReport = null;
export function rememberBattleReport(summary) { lastReport = summary || null; }
export function lastBattleReport() { return lastReport; }
