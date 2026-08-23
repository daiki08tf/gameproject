/* ============================================================
   Legacy weapon Rune retirement — runtime data cleanup
   ============================================================ */
import { state } from '../state.js';
import { CHAPTERS } from '../data/stages.js';

function isLegacyRuneId(id) {
  return typeof id === 'string' && id.startsWith('rune_');
}

// 旧ボスDropTableから装備Runeを除去。Rune 2.0は独立抽選なので影響なし。
for (const chapter of CHAPTERS) {
  for (const stage of chapter.stages || []) {
    if (Array.isArray(stage.dropTable)) stage.dropTable = stage.dropTable.filter((entry) => !isLegacyRuneId(entry.itemId));
  }
}

// 他の古い経路から旧Runeが渡ってきてもinventoryへ復活させない。
const originalAddItem = state.addItem.bind(state);
state.addItem = function addItemWithoutLegacyRunes(itemId, qty = 1, dropCtx = null) {
  if (isLegacyRuneId(itemId)) {
    const amount = Math.max(0, Math.floor(Number(qty) || 0));
    if (amount) {
      if (!this.data.legacyRuneArchive || typeof this.data.legacyRuneArchive !== 'object') this.data.legacyRuneArchive = {};
      this.data.legacyRuneArchive[itemId] = (this.data.legacyRuneArchive[itemId] || 0) + amount;
      this.save();
    }
    return false;
  }
  return originalAddItem(itemId, qty, dropCtx);
};

// 極AffixはAwakening 2.0 Rank2以降の上位ビルド要素にする。
if (typeof state.canRollAffix === 'function') {
  const originalCanRollAffix = state.canRollAffix.bind(state);
  state.canRollAffix = function canRollAffixAwakeningV2(itemId) {
    return this.isAwakeningFeatureUnlocked('extremeAffix') && originalCanRollAffix(itemId);
  };
}
if (typeof state.rollAffix === 'function') {
  const originalRollAffix = state.rollAffix.bind(state);
  state.rollAffix = function rollAffixAwakeningV2(itemId) {
    if (!this.isAwakeningFeatureUnlocked('extremeAffix')) return false;
    return originalRollAffix(itemId);
  };
}
