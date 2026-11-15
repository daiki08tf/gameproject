/*
 * 連続巡回（EXPANSION A3）— 巡回を続けて勝つほど次の巡回が旨くなる。
 *
 * 既存の巡回は launchOpts（hunt / huntEliteChance / dropMult）で BattleEngine に渡る。
 * ここでは TextBattleScreen.start に渡る launchOpts へ連勝ぶんの上乗せを掛けるだけで、
 * 巡回そのものの仕組み・ドロップ抽選・報酬経路には触れない。
 * 連勝数はモジュール変数（保存しない）。恒久的な「Hunt Lv」にはしない。
 */
import { TextBattleScreen } from '../screens/textBattle.js';
import { HUNT_LAYER, huntChainBonus } from '../data/balance.js';

let streak = 0;
export function huntChainStreak() { return streak; }

const previousStart = TextBattleScreen.prototype.start;
TextBattleScreen.prototype.start = function huntChainStart(stageId, onEnd, blessingId, launchOpts) {
  const hunt = !!launchOpts?.hunt;
  if (!hunt) { streak = 0; return previousStart.call(this, stageId, onEnd, blessingId, launchOpts); }
  const bonus = huntChainBonus(streak);
  const opts = bonus.streak > 0 ? {
    ...launchOpts,
    dropMult: (launchOpts.dropMult ?? HUNT_LAYER.STORY_DROP_MULT) * bonus.dropMult,
    huntEliteChance: Math.min(0.9, (launchOpts.huntEliteChance ?? HUNT_LAYER.STORY_ELITE_CHANCE) + bonus.eliteAdd),
  } : launchOpts;
  const wrapped = (result) => {
    // 勝てば連勝を伸ばし、負け・撤退で 0 に戻す。手に入れた品はそのまま（失うのは次戦の上乗せだけ）。
    const before = streak;
    streak = result?.cleared ? Math.min(HUNT_LAYER.CHAIN_MAX, streak + 1) : 0;
    if (result) result.huntChain = { before, after: streak, next: huntChainBonus(streak), broken: !result.cleared && before > 0 };
    onEnd?.(result);
  };
  const out = previousStart.call(this, stageId, wrapped, blessingId, opts);
  if (bonus.streak > 0 && this.engine && !this.engine.over) {
    this._pushLines([`<span class="tb-assist-note">連続巡回 ${bonus.streak}連勝：ドロップ率 ×${bonus.dropMult.toFixed(1)} ／ エリート出現 +${Math.round(bonus.eliteAdd * 100)}%</span>`]);
    this._render();
  }
  return out;
};
