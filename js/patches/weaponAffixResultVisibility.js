/* ============================================================
   Weapon Affix result visibility
   ------------------------------------------------------------
   BattleEngine creates a unique weapon instance (baseId#seq) with Affixes,
   but legacy runItems stored only the base weapon id. That made the result
   screen look as if no options had dropped. Keep the exact instance id in
   runItems for weapon drops while leaving non-weapon drops untouched.
   ============================================================ */
import { BattleEngine } from '../battleEngine.js';

function wrapDropMethod(name) {
  const original = BattleEngine.prototype[name];
  if (typeof original !== 'function') return;
  BattleEngine.prototype[name] = function weaponInstanceResultDrop(...args) {
    const info = original.apply(this, args);
    if (info?.instanceId && Array.isArray(this.runItems) && this.runItems.length > 0) {
      const last = this.runItems.length - 1;
      // Only replace the base id added by the original method. This avoids
      // touching unrelated ordinary-item/rune entries.
      if (this.runItems[last] === info.itemId) this.runItems[last] = info.instanceId;
    }
    return info;
  };
}

wrapDropMethod('_rollWeaponDrop');
wrapDropMethod('_rollBossWeaponDrop');
