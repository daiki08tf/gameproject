/* ============================================================
   ビルド診断 — 「いまの自分は何型か」を言葉にする純粋関数（EXPANSION A1 / C13 の入口）。
   ------------------------------------------------------------
   材料は 2 つだけ:
     1. 戦闘レポート（js/data/battleReport.js）— 実際に何でダメージを出したか
     2. 装備中の効果（state.getEquippedEffects() の kind）— 何を積んでいるか
   どちらも既存の出力を読むだけで、ラベルは表示専用。ボーナスは一切付けない
   （付けると「UI だけの進行」になり、正規の状態と食い違いうる）。
   保存もしない：直近の戦闘と現在の装備から毎回導出する。
   ============================================================ */

// 装備効果の kind → 型。戦闘エンジンが既に解釈している kind だけを並べる。
const EFFECT_ARCHETYPE = Object.freeze({
  critExtraAttack: 'crit', critSpdBuff: 'crit', critAtkBuff: 'crit', critDamageBoost: 'crit', critAdd: 'crit', mpOnCrit: 'crit', healOnCrit: 'crit', evadeCritBuff: 'crit',
  hitApplyDot: 'dot', dotStackDmg: 'dot', mpOnDot: 'dot',
  counter: 'counter', guardCounter: 'counter', healOnGuard: 'counter', mpOnGuard: 'counter', guardNextAtkBuff: 'counter',
  deathlineBoost: 'brink', lifestealLowHp: 'brink', noRecoveryDmgBonus: 'brink', glassCannon: 'brink',
  spellEcho: 'spell', spellMpRefund: 'spell', spellMagBuff: 'spell', spellDmgAdd: 'spell', mpShield: 'spell',
  lifesteal: 'sustain', healOnKill: 'sustain', regen: 'sustain', guardianHeal: 'sustain',
  everyNHits: 'basic', normalDmgAdd: 'basic', lastHitBonus: 'basic', firstStrikeBonus: 'basic', executioner: 'basic',
  skillDmgAdd: 'skill', cdRefund: 'skill',
});

export const BUILD_ARCHETYPES = Object.freeze({
  crit: { name: '会心型', desc: '会心の一撃を軸に押し切る' },
  dot: { name: '継続ダメージ型', desc: '毒や炎上を重ねて削る' },
  counter: { name: '反撃・防御型', desc: '受けてから返す' },
  brink: { name: '瀕死火力型', desc: '追い込まれるほど強い' },
  spell: { name: '呪文型', desc: 'じゅもんを主力に回す' },
  skill: { name: 'とくぎ型', desc: 'とくぎを主力に回す' },
  sustain: { name: '継戦型', desc: '回復しながら粘る' },
  basic: { name: '通常攻撃型', desc: 'こうげきの手数と一撃で稼ぐ' },
  companion: { name: '仲間主体', desc: '仲間の火力が主役' },
});

const pct = (v) => `${Math.round(v * 100)}%`;

// report: summarizeBattleReport() の戻り値（無くてもよい）。effects: 装備効果の配列（kind を持つ）。
// 戻り値: { primary, secondary, reasons:[...] } または null（材料が無いとき）。
export function classifyBuild(report, effects = []) {
  const score = Object.fromEntries(Object.keys(BUILD_ARCHETYPES).map((k) => [k, 0]));
  const reasons = {};
  const note = (key, text) => { (reasons[key] ||= []).push(text); };

  // 装備が「何を積んでいるか」。同じ型の効果が複数あるほど強く効く。
  const counts = {};
  for (const e of effects || []) {
    const key = EFFECT_ARCHETYPE[e?.kind];
    if (key) counts[key] = (counts[key] || 0) + 1;
  }
  for (const [key, n] of Object.entries(counts)) {
    score[key] += Math.min(3, n) * 1.0;
    note(key, `装備効果 ${n}つ`);
  }

  // 戦闘が「実際に何で稼いだか」。装備より重く見る（積んでいても使っていなければ型ではない）。
  const kinds = report?.kinds;
  const dealt = Number(report?.dealt) || 0;
  if (kinds && dealt > 0) {
    const share = (k) => (Number(kinds[k]) || 0) / dealt;
    if (share('companion') >= 0.4) { score.companion += 3 + share('companion') * 2; note('companion', `与ダメの${pct(share('companion'))}が仲間`); }
    if (share('dot') >= 0.2) { score.dot += 2 + share('dot') * 3; note('dot', `与ダメの${pct(share('dot'))}が継続ダメージ`); }
    if (share('spell') >= 0.35) { score.spell += 2 + share('spell') * 2; note('spell', `与ダメの${pct(share('spell'))}がじゅもん`); }
    if (share('skill') >= 0.35) { score.skill += 2 + share('skill') * 2; note('skill', `与ダメの${pct(share('skill'))}がとくぎ`); }
    if (share('attack') >= 0.5) { score.basic += 1.5 + share('attack'); note('basic', `与ダメの${pct(share('attack'))}がこうげき`); }
    if ((report.critRate || 0) >= 0.3) { score.crit += 2 + report.critRate * 2; note('crit', `会心 ${pct(report.critRate)}`); }
    if ((report.takenVsMaxHp || 0) >= 1.5 && (counts.sustain || counts.counter)) { score[counts.counter ? 'counter' : 'sustain'] += 1.5; note(counts.counter ? 'counter' : 'sustain', `最大HPの${report.takenVsMaxHp.toFixed(1)}倍を受けて勝ち切った`); }
  }

  const ranked = Object.entries(score).filter(([, v]) => v >= 1).sort((a, b) => b[1] - a[1]);
  if (!ranked.length) return null;
  const pick = ([key]) => ({ id: key, ...BUILD_ARCHETYPES[key], reasons: reasons[key] || [] });
  const primary = pick(ranked[0]);
  // 2 番手は、1 番手の 6 割以上あるときだけ「複合」として添える
  const secondary = ranked[1] && ranked[1][1] >= ranked[0][1] * 0.6 ? pick(ranked[1]) : null;
  return { primary, secondary };
}

export function buildLabel(diagnosis) {
  if (!diagnosis) return '';
  return diagnosis.secondary ? `${diagnosis.primary.name}＋${diagnosis.secondary.name}` : diagnosis.primary.name;
}
