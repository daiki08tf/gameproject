/* ============================================================
   Weapon Affix result visibility
   ------------------------------------------------------------
   BattleEngine creates a unique weapon instance (baseId#seq) with Affixes,
   but legacy runItems stored only the base weapon id. That made the result
   screen look as if no options had dropped. Keep the exact instance id in
   runItems for every weapon-producing drop path while leaving non-weapon
   drops untouched.
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

// _rollDrop() can also select a weapon from a stage dropTable (named weapons,
// Abyss fixed drops, etc.). It needs the same instance-id handoff as the two
// weapon-specific routes below, otherwise the result screen loses Equipment 3.0
// metadata for exactly those drops.
wrapDropMethod('_rollDrop');
wrapDropMethod('_rollWeaponDrop');
wrapDropMethod('_rollBossWeaponDrop');
