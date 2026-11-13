/*
 * Battle Report — 戦闘イベントを集計して結果オブジェクトに載せる（EXP-4）。
 * 集計ロジックは js/data/battleReport.js、表示は js/screens/result.js。
 * ここは BattleEngine.advanceTurn / forceRetreat の戻り値を「読む」だけで、
 * コマンド・イベント・戦闘結果そのものは変更しない（result.battleReport を足すのみ）。
 */
import { BattleEngine } from '../battleEngine.js';
import { createBattleReport, recordBattleEvents, summarizeBattleReport } from '../data/battleReport.js';

function attach(engine, result) {
  if (!result || result.battleReport || !engine._battleReport) return;
  result.battleReport = summarizeBattleReport(engine._battleReport, { rounds: engine.round, maxHp: engine.player?.maxHp });
}

const previousAdvanceTurn = BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn = function battleReportAdvanceTurn(command) {
  const out = previousAdvanceTurn.call(this, command);
  this._battleReport ||= createBattleReport();
  recordBattleEvents(this._battleReport, out?.events);
  if (out?.over) attach(this, out.result || this.finalResult);
  return out;
};

const previousForceRetreat = BattleEngine.prototype.forceRetreat;
BattleEngine.prototype.forceRetreat = function battleReportForceRetreat(...args) {
  const result = previousForceRetreat.apply(this, args);
  attach(this, result || this.finalResult);
  return result;
};
