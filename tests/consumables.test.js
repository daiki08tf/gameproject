import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { BattleEngine } from '../js/battleEngine.js';
import { CONSUMABLES, getConsumable, pickConsumableDrop, CONSUMABLE_DROP_TABLE } from '../js/data/consumables.js';

beforeEach(() => state.resetAll());

test('new saves start with a small herb stock in the existing inventory field', () => {
  assert.equal(state.consumableCount('item_herb'), 2);
  assert.deepEqual(state.ownedConsumables().map((o) => o.id), ['item_herb']);
});

test('old saves without consumables simply have none (no migration needed)', () => {
  state.data.inventory = {};
  assert.equal(state.consumableCount('item_herb'), 0);
  assert.deepEqual(state.ownedConsumables(), []);
});

test('buying consumables spends gold and stocks the inventory', () => {
  state.data.gold = 100;
  assert.equal(state.buyConsumable('item_ether'), true);
  assert.equal(state.data.gold, 100 - CONSUMABLES.item_ether.price);
  assert.equal(state.consumableCount('item_ether'), 1);
  state.data.gold = 0;
  assert.equal(state.buyConsumable('item_ether'), false);
  assert.equal(state.consumableCount('item_ether'), 1);
});

test('heal item restores HP, consumes stock, and is logged as an item action', () => {
  const engine = new BattleEngine('1-1');
  engine.player.hp = Math.floor(engine.player.maxHp / 2);
  const hpBefore = engine.player.hp;
  const { events } = engine.advanceTurn({ type: 'item', itemId: 'item_herb' });
  const action = events.find((e) => e.type === 'playerAction').result;
  assert.equal(action.action, 'item');
  assert.ok(action.healAmount > 0);
  assert.equal(engine.player.hp, hpBefore + action.healAmount);
  assert.equal(state.consumableCount('item_herb'), 1);
});

test('using an item with no stock is blocked without the enemy phase running', () => {
  const engine = new BattleEngine('1-1');
  // 1ラウンド目（出現直後の猶予）は敵が動かないため、2ラウンド目以降の
  // 呼び出しで「敵フェーズが走らない」ことを確かめる
  engine.advanceTurn({ type: 'guard' });
  engine._setBuff('atk', 0.3, 5); // ラウンド経過があればturnsLeftが減る目印
  const { events } = engine.advanceTurn({ type: 'item', itemId: 'item_ether' });
  const action = events.find((e) => e.type === 'playerAction').result;
  assert.equal(action.blocked, true);
  assert.ok(events.every((e) => e.type !== 'enemyAction'));
  assert.equal(engine.player.buffs.atk.turnsLeft, 5);
});

test('buff item applies an atk buff via the existing _setBuff path', () => {
  const engine = new BattleEngine('1-1');
  state.data.inventory.item_warcry = 1;
  const { events } = engine.advanceTurn({ type: 'item', itemId: 'item_warcry' });
  const action = events.find((e) => e.type === 'playerAction').result;
  assert.equal(action.buffed.stat, 'atk');
  assert.ok(engine.player.buffs.atk.mult > 1);
  assert.ok(engine.player.buffs.atk.turnsLeft > 0);
});

test('cleanse item removes negative buffs applied by enemy skills', () => {
  const engine = new BattleEngine('1-1');
  state.data.inventory.item_bell = 1;
  engine._setBuff('atk', -0.25, 3); // 敵のweakenAtkが乗せる形と同じ負のバフ
  engine._setBuff('spd', 0.20, 3); // 自分の強化は残るべき
  const { events } = engine.advanceTurn({ type: 'item', itemId: 'item_bell' });
  const action = events.find((e) => e.type === 'playerAction').result;
  assert.equal(action.cleansed, 1);
  assert.equal(engine.player.buffs.atk.mult, 1);
  assert.ok(engine.player.buffs.spd.mult > 1);
});

test('consumable drop table only emits registered ids', () => {
  for (let i = 0; i < 200; i++) assert.ok(getConsumable(pickConsumableDrop()));
  assert.ok(CONSUMABLE_DROP_TABLE.every((d) => CONSUMABLES[d.itemId]));
});
