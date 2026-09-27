/*
 * Pacing Materials — 撃破ベースの拠点素材ドロップ。
 *
 * 実機プレイテスト指摘：「牧舎の素材が手に入らなすぎる」。従来の拠点素材は
 * ステージクリア時の settlementMaterialYield と深淵のみで、veilstoneは
 * 深淵専用・hideはrecLevel80以降しか出ず、牧舎（ranch Lv1にhide12+
 * veilstone1が必要）以下の施設系が序盤に全く着手できなかった。
 *
 * このパッチは敵撃破ごとに素材をロールし、モンスター狩りが牧舎進行に
 * 直結するようにする。敗北・リタイア時も撃破分は持ち帰れる（周回が
 * 無駄にならない）。素材の加算は既存の state.addSettlementMaterials
 * （集会所materialMultボーナス含む）に一本化して行う。
 */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { ENEMY_TYPES } from '../data/enemies.js';
import { PACING_MATERIAL_LAYER } from '../data/balance.js';

// 素材ごとの「主な入手先」ヒント。施設・建物のコスト表示で
// 「不足している素材をどこで集めるか」を説明するために使う。
// （秘密ロケーション名は出さず、入手行動だけを示す。）
export const MATERIAL_SOURCE_HINTS = Object.freeze({
  wood:      '魔物の撃破・拠点素材（どの狩場でも少量）',
  ore:       '重装系の魔物やボスの撃破・深淵の探索',
  hide:      '魔物の撃破（獣系・素早い魔物やボスで多め）',
  veilstone: '章ボスの撃破・深淵の探索',
});
export function materialSourceHint(materialId) { return MATERIAL_SOURCE_HINTS[materialId] || '魔物の撃破・拠点素材'; }

const MAT_NAMES = { wood: '古木', ore: '鉱石', hide: '魔獣皮', veilstone: '境界石' };
// コストに対して不足している素材を「名前：主な入手先」で返す。
// 施設・建物カードの素材不足表示に使う（隠し要素名は出さない）。
export function materialShortfallHint(cost) {
  const have = state.data?.settlementMaterials || {};
  return Object.entries(cost || {})
    .filter(([k, v]) => v > 0 && (have[k] || 0) < v)
    .map(([k]) => `${MAT_NAMES[k] || k}：${materialSourceHint(k)}`)
    .join('　');
}

function roleOf(enemy) {
  const role = ENEMY_TYPES[enemy.type]?.role;
  if (role === 'tank' || role === 'fast' || role === 'normal') return role;
  if (/tank/.test(enemy.type)) return 'tank';
  if (/fast/.test(enemy.type)) return 'fast';
  return 'normal';
}

function isSpecial(enemy) {
  return !!(enemy.elite || enemy.rareIdentity || enemy.rank === 'rare'
    || enemy.mutationId || enemy.roamerId || enemy.denlordPrestige || enemy.superPrestige);
}

// 撃破1体ぶんの素材ロール。{wood,ore,hide,veilstone} の部分集合を返す。
export function rollKillMaterials(enemy, stage, rng = Math.random) {
  const L = PACING_MATERIAL_LAYER;
  const tier = Math.max(1, Math.ceil((Number(stage?.recLevel) || Number(stage?.abyssDepth) || 1) / L.TIER_STEP_LEVEL));
  const qty = 1 + Math.floor((tier - 1) * L.TIER_QUANTITY_BONUS);
  const out = {};
  const isBoss = !!(enemy.boss || ENEMY_TYPES[enemy.type]?.boss);
  if (isBoss) {
    for (const [mat, n] of Object.entries(L.BOSS_BONUS)) out[mat] = n * qty;
    if (rng() < L.BOSS_VEILSTONE_CHANCE) out.veilstone = (out.veilstone || 0) + 1;
    return out;
  }
  const role = roleOf(enemy);
  const mult = isSpecial(enemy) ? L.SPECIAL_MULT : 1;
  for (const [mat, table] of Object.entries(L.KILL_CHANCE)) {
    const chance = (table[role] || 0) * mult;
    if (chance > 0 && rng() < chance) out[mat] = (out[mat] || 0) + qty;
  }
  return out;
}

function mergeInto(dst, src) {
  for (const [k, v] of Object.entries(src || {})) dst[k] = (dst[k] || 0) + v;
  return dst;
}

const originalGrant = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function (enemy) {
  const result = originalGrant.call(this, enemy);
  try {
    const mats = rollKillMaterials(enemy, this.stage);
    if (Object.keys(mats).length) {
      // 素材の獲得はキルログにも流す（エンジン側の返り値形式に合わせる）。
      this._pacingKillMaterials = mergeInto(this._pacingKillMaterials || {}, mats);
      if (result) result.materials = mats;
    }
  } catch (err) { console.error('pacingMaterials kill roll error (recovered):', err); }
  return result;
};

const originalFinish = BattleEngine.prototype._finishBattle;
BattleEngine.prototype._finishBattle = function (cleared, retreated) {
  originalFinish.call(this, cleared, retreated);
  try {
    const killMats = this._pacingKillMaterials;
    if (killMats && Object.keys(killMats).length && this.finalResult) {
      state.addSettlementMaterials?.(killMats);
      this.finalResult.killMaterials = { ...killMats };
      // クリア時の拠点素材行と統合して表示できるようマージする。
      this.finalResult.settlementMaterials = mergeInto(
        { ...(this.finalResult.settlementMaterials || {}) }, killMats);
    }
    // 章ボスの初クリアでは境界石を1つ確定で渡す。撃破ロール（確率）
    // だけでは運次第で牧舎Lv.1が永久に開かない可能性があるため、
    // 「章の攻略」が境界石の下限供給になる（無限増殖はしない）。
    if (cleared && !retreated && this.finalResult?.firstClear
        && (this.stage?.boss || this.stage?.midBoss) && !this.stage?.isAbyss
        && /^ch\d+$/.test(this.chapter?.id || '')) {
      state.addSettlementMaterials?.({ veilstone: 1 });
      this.finalResult.settlementMaterials = mergeInto(
        { ...(this.finalResult.settlementMaterials || {}) }, { veilstone: 1 });
    }
    // 敗北ガイド用にステージ情報を結果へ載せる（追加のみ・後方互換）。
    if (this.finalResult && this.stage) {
      this.finalResult.stageId = this.stage.id;
      this.finalResult.recLevel = this.stage.recLevel;
      this.finalResult.stageBoss = !!(this.stage.boss || this.stage.midBoss);
    }
  } catch (err) { console.error('pacingMaterials finish error (recovered):', err); }
};
