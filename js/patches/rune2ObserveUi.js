/* ============================================================
   Progression 2.0 Phase 6 — Observe Rune UI
   ============================================================ */

import { state } from '../state.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { observeTier } from '../data/rune2SpecialRules.js';

const legacyRenderEnemies = TextBattleScreen.prototype._renderEnemies;
TextBattleScreen.prototype._renderEnemies = function rune2ObserveRenderEnemies() {
  legacyRenderEnemies.call(this);
  const marks = state.rune2ObserveMarks ? state.rune2ObserveMarks() : 0;
  const tier = observeTier(marks);
  if (tier <= 0 || !this.engine) return;

  const cards = [...this.el.enemyList.querySelectorAll('.tb-enemy-card')];
  this.engine.enemies.forEach((enemy, index) => {
    const card = cards[index];
    if (!card) return;
    const lines = [];
    if (tier >= 1) lines.push(`HP ${Math.max(0, Math.round(enemy.hp)).toLocaleString()} / ${Math.round(enemy.maxHp).toLocaleString()}`);
    if (tier >= 2) lines.push(`ATK ${Math.round(enemy.atk).toLocaleString()}　DEF ${Math.round(enemy.def).toLocaleString()}　SPD ${Math.round(enemy.spd).toLocaleString()}`);
    if (tier >= 3) lines.push(`EXP ${Math.round(enemy.xp).toLocaleString()}　Gold ${Math.round(enemy.gold).toLocaleString()}`);
    if (tier >= 4) lines.push(`分類 ${enemy.boss ? 'BOSS' : enemy.elite ? 'ELITE' : 'NORMAL'}${enemy.challengeLevel ? `　Challenge Lv.${enemy.challengeLevel}` : ''}`);
    if (tier >= 5) lines.push(`解析ID ${enemy.type}`);
    const info = document.createElement('div');
    info.className = 'tb-observe-info';
    info.style.cssText = 'font-size:11px;opacity:.78;margin-top:4px;line-height:1.45;';
    info.innerHTML = lines.map((line) => `<div>${line}</div>`).join('');
    card.appendChild(info);
  });
};
