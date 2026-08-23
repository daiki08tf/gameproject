/* ============================================================
   共通ダメージ/防御派生値ヘルパー（Part A・Part B共通）
   ------------------------------------------------------------
   battleEngine.js（実戦闘）と state.js/screens/status.js（ステータス
   画面）の両方から呼ばれる。「ステータス画面専用に戦闘計算式を
   コピーしない」という元指示のとおり、effects[]（trigger/kind）を
   読んでpower合計を出すだけの純粋関数群をここへ集約する。
   PR#2のDamage Bucket・比率型DEF軽減・CAPS_LAYERの数式そのものは
   一切変更せず、そのまま踏襲する。
   ============================================================ */
import { CAPS_LAYER, DAMAGE_BUCKET, TEXT_BATTLE_LAYER } from './balance.js';

// passive-kind effectのpower合計（critDamageBoost/regen/bossDmg/eliteDmg/
// dmgBonusAdd/normalDmgAdd/skillDmgAdd/spellDmgAdd/dotDmg/dotDuration/
// dotStackCap/debuffPowerAdd/mpCostReduce/cdrAdd/atkSpeedAdd/
// guardMitigation/bossSpecialMitigation/goldMultAdd/expMultAdd/
// dropRateMultAdd 等、全て同じ「trigger:'passive'のkindごとにpowerを
// 合算する」形なのでこの1関数で共通化できる）
export function sumPassivePower(effects, kind) {
  let s = 0;
  for (const e of effects || []) if (e.trigger === 'passive' && e.kind === kind) s += (e.power || 0);
  return s;
}
// trigger別（onHit/onCrit/onKill/onGuard/onEvade/onDot等）のpower合計。
// procChance（eff.chance）が付いている場合は「期待値」ではなく「発動時の
// 効果量」をそのまま返す（ステータス画面は確率込みの期待値までは出さない
// ＝元指示「戦闘中一時buffは反映しなくてもよい」と同じ簡略化方針）。
export function sumTriggerPower(effects, trigger, kind) {
  let s = 0;
  for (const e of effects || []) if (e.trigger === trigger && e.kind === kind) s += (e.power || 0);
  return s;
}

export function defMitigationPct(def) {
  return Math.min(CAPS_LAYER.DEF_MITIGATION_MAX, def / (def + DAMAGE_BUCKET.MITIGATION_K));
}

// 通常攻撃1回あたりの間隔（秒）とラウンドあたりhit数（js/battleEngine.js
// _playerAttackCooldown/_playerHitsPerRoundと同一式。atkSpeedAdd Affix分だけ
// 追加で短縮する）
export function attackIntervalSec(spd, atkSpeedAddPct) {
  const base = Math.max(CAPS_LAYER.ATTACK_INTERVAL_MIN, Math.min(1.1, 1.0 - spd * 0.012));
  const reduced = base * (1 - Math.min(0.5, atkSpeedAddPct || 0));
  return Math.max(CAPS_LAYER.ATTACK_INTERVAL_MIN, reduced);
}
export function hitsPerRound(intervalSec) {
  return Math.max(1, Math.round(TEXT_BATTLE_LAYER.SECONDS_PER_ROUND / intervalSec));
}

// ---------------------------------------------------------
// ステータス画面用の派生値まとめ（Part B）。baseStats=state.getStats()、
// effects=state.getEquippedEffects()、extraはjob MASTER/覚醒ツリー等
// state.js側の永続倍率（既存関数をそのまま呼び出した結果を渡すだけ）。
// ---------------------------------------------------------
export function deriveCombatStats(baseStats, effects, extra = {}) {
  const critDamageMult = 1 + DAMAGE_BUCKET.CRIT_MULTIPLIER - 1 + sumPassivePower(effects, 'critDamageBoost');
  const lifestealPct = Math.min(CAPS_LAYER.LIFESTEAL_PCT_MAX, sumTriggerPower(effects, 'onHit', 'lifesteal'));
  const regenPctPerSec = Math.min(CAPS_LAYER.REGEN_PCT_PER_SEC_MAX, sumPassivePower(effects, 'regen'));
  const cdrFromItems = sumPassivePower(effects, 'cdrAdd');
  const cdrMult = Math.max(CAPS_LAYER.CDR_MULT_MIN, (extra.jobMasterCooldownMult != null ? extra.jobMasterCooldownMult : 1) - cdrFromItems);
  const mpCostReduceMult = Math.min(0.7, sumPassivePower(effects, 'mpCostReduce'));
  const bossDmgBonus = sumPassivePower(effects, 'bossDmg') + (extra.awakeningBossDmgMult != null ? extra.awakeningBossDmgMult - 1 : 0);
  const eliteDmgBonus = sumPassivePower(effects, 'eliteDmg');
  const executionBonus = sumPassivePower(effects, 'executioner');
  const generalDmgBonus = sumPassivePower(effects, 'dmgBonusAdd');
  const normalDmgBonus = sumPassivePower(effects, 'normalDmgAdd');
  const skillDmgBonus = sumPassivePower(effects, 'skillDmgAdd');
  const spellDmgBonus = sumPassivePower(effects, 'spellDmgAdd');
  const dotDmgBonus = sumPassivePower(effects, 'dotDmg');
  const atkSpeedAddPct = sumPassivePower(effects, 'atkSpeedAdd');
  const intervalSec = attackIntervalSec(baseStats.spd, atkSpeedAddPct);
  const guardMitigationBonus = sumPassivePower(effects, 'guardMitigation');
  const guardMult = Math.max(0.05, TEXT_BATTLE_LAYER.GUARD_DAMAGE_MULT * (1 - guardMitigationBonus));
  const bossSpecialMitigation = Math.min(0.7, sumPassivePower(effects, 'bossSpecialMitigation'));

  return {
    hp: baseStats.hp, mp: baseStats.mp, atk: baseStats.atk, def: baseStats.def,
    mag: baseStats.mag, spd: baseStats.spd,
    critPct: baseStats.critPct, critPctMax: CAPS_LAYER.CRIT_PCT_MAX,
    evasion: baseStats.evasion, evasionMax: CAPS_LAYER.EVASION_MAX,
    armorPen: baseStats.armorPen, armorPenMax: CAPS_LAYER.ARMOR_PEN_MAX,
    critDamageMult,
    defMitigationPct: defMitigationPct(baseStats.def), defMitigationMax: CAPS_LAYER.DEF_MITIGATION_MAX,
    guardMult, guardDamageReductionPct: 1 - guardMult,
    bossSpecialMitigation,
    hitsPerRound: hitsPerRound(intervalSec), attackIntervalSec: intervalSec, attackIntervalMin: CAPS_LAYER.ATTACK_INTERVAL_MIN,
    cdrMult, cdrPct: 1 - cdrMult, cdrMax: 1 - CAPS_LAYER.CDR_MULT_MIN,
    lifestealPct, lifestealMax: CAPS_LAYER.LIFESTEAL_PCT_MAX,
    regenPctPerSec, regenMaxPerSec: CAPS_LAYER.REGEN_PCT_PER_SEC_MAX,
    mpCostReduceMult,
    generalDmgBonus, normalDmgBonus, skillDmgBonus, spellDmgBonus,
    bossDmgBonus, eliteDmgBonus, executionBonus, dotDmgBonus,
    goldMult: extra.goldMult != null ? extra.goldMult : 1,
    expMult: extra.expMult != null ? extra.expMult : 1,
    dropMult: extra.dropMult != null ? extra.dropMult : 1,
  };
}
