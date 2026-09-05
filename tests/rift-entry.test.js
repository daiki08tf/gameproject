import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { state } from '../js/state.js';
import '../js/patches/riftKeyCore.js';
import { findStage, CHAPTERS } from '../js/data/stages.js';
import { buildRiftStage } from '../js/data/riftStages.js';
import { BattleEngine } from '../js/battleEngine.js';
import { TextBattleScreen } from '../js/screens/textBattle.js';
import { renderStageSelect, renderStageConfirm } from '../js/screens/stageSelect.js';

beforeEach(() => state.resetAll());

function screen() {
  // Keep the real start/encounter behavior; DOM painting is outside this unit boundary.
  return Object.assign(Object.create(TextBattleScreen.prototype), {
    engine: null, el: { stageName: { textContent: '' } }, _render() {},
  });
}

test('Rift resolver uses owned keys, preserves canonical build, and never registers a pseudo chapter', () => {
  const key = state.addRiftKey(800), chapterCount = CHAPTERS.length;
  const found = findStage(`rift-${key.id}`, state.riftKeys());
  assert.equal(found.chapter, null);
  assert.deepEqual(found.stage, buildRiftStage(key));
  assert.equal(state.riftKeys().length, 1);
  assert.equal(CHAPTERS.length, chapterCount);
  assert.equal(findStage(`rift-${key.id}`), null);
  assert.equal(findStage('rift-forged', state.riftKeys()), null);
  assert.equal(findStage('1-1').stage.id, '1-1');
});

test('real text battle starts from selected key and persists exactly one consumption, including double start', async t => {
  const selected = state.addRiftKey(10), other = state.addRiftKey(20);
  const saved = [];
  t.mock.method(state, 'save', () => saved.push(structuredClone(state.data)));
  const battle = screen();
  let ended = 0;
  battle.start(`rift-${selected.id}`, () => ended++);
  const engine = battle.engine;
  assert.ok(engine instanceof BattleEngine);
  assert.equal(engine.stage.riftKey.id, selected.id);
  assert.ok(engine.aliveEnemies.length > 0);
  assert.ok(engine.aliveEnemies.every(e => Number.isFinite(e.hp) && e.hp > 0));
  assert.deepEqual(state.riftKeys().map(k => k.id), [other.id]);
  assert.equal(saved.length, 1);
  assert.deepEqual(saved[0].riftKeys.map(k => k.id), [other.id]);
  battle.start(`rift-${selected.id}`, () => ended++);
  await Promise.resolve();
  assert.equal(battle.engine, engine);
  assert.equal(saved.length, 1);
  assert.equal(ended, 0);
  engine.forceRetreat();
  assert.deepEqual(state.riftKeys().map(k => k.id), [other.id]);
  assert.throws(() => new BattleEngine(`rift-${selected.id}`), { code: 'RIFT_KEY_UNAVAILABLE' });
});

test('missing, malformed and previously consumed keys return safely without spending another key', async () => {
  const other = state.addRiftKey(20);
  state.riftKeys().push({ id: 'broken', recLevel: 'invalid' });
  for (const id of ['rift-missing', 'rift-broken']) {
    const battle = screen();
    let result;
    battle.start(id, value => { result = value; });
    await Promise.resolve();
    assert.equal(battle.engine, null);
    assert.equal(result.keyMissing, true);
    assert.equal(result.cleared, false);
    assert.deepEqual(result.rewards, { gold: 0, exp: 0 });
    assert.equal(state.riftKeys()[0].id, other.id);
    assert.equal(state.riftKeys().length, 2);
  }
});

test('unrelated initialization failure is surfaced and leaves the key untouched', t => {
  const key = state.addRiftKey(10);
  const failure = new Error('stats unavailable');
  t.mock.method(state, 'getStats', () => { throw failure; });
  assert.throws(() => screen().start(`rift-${key.id}`, () => {}), error => error === failure);
  assert.equal(state.riftKeys()[0].id, key.id);
});

test('Rift clear uses existing rewards and clear records once; loss does not refund the key', () => {
  const key = state.addRiftKey(10);
  const engine = new BattleEngine(`rift-${key.id}`);
  const gold = state.data.gold;
  // Drive the public encounter/end check after all opponents are defeated.
  engine.encounterQueue = [];
  engine.enemies = [];
  engine.defeated = engine.totalToDefeat;
  assert.equal(engine.checkBattleEnd().over, true);
  assert.equal(engine.finalResult.cleared, true);
  assert.ok(engine.finalResult.goldGained > 0);
  assert.equal(state.data.gold, gold + engine.finalResult.goldGained);
  assert.equal(state.isStageCleared(engine.stage.id), true);
  const after = state.data.gold;
  engine.forceRetreat();
  assert.equal(state.data.gold, after);
  assert.equal(state.riftKeys().length, 0);
  const lossKey = state.addRiftKey(10);
  const loss = new BattleEngine(`rift-${lossKey.id}`);
  loss.player.hp = 0;
  loss.checkBattleEnd();
  assert.equal(loss.finalResult.cleared, false);
  assert.equal(state.riftKeys().length, 0);
});

// Minimal DOM adapter for the real selection/confirmation renderers. No layout assertions.
class Element {
  constructor() { this.children = []; this.dataset = {}; this.style = {}; this.listeners = {}; this.textContent = ''; this.classList = { add() {}, remove() {}, toggle() {} }; }
  set innerHTML(value) { this.children = []; this.html = value; }
  appendChild(el) { this.children.push(el); return el; }
  append(...els) { els.forEach(el => this.appendChild(el)); }
  addEventListener(event, fn) { this.listeners[event] = fn; }
}
function descendants(el) { return [el, ...el.children.flatMap(descendants)]; }

test('owned key selection and confirmation are reachable and cancellation does not consume', t => {
  const elements = new Map();
  const previous = globalThis.document;
  globalThis.document = {
    getElementById(id) { if (!elements.has(id)) elements.set(id, new Element()); return elements.get(id); },
    createElement() { return new Element(); },
  };
  t.after(() => { if (previous === undefined) delete globalThis.document; else globalThis.document = previous; });
  const first = state.addRiftKey(10), second = state.addRiftKey(20);
  let picked;
  renderStageSelect('world3-branches', stage => { picked = stage; });
  const cards = descendants(elements.get('stageList')).filter(el => el.dataset.stageId?.startsWith('rift-'));
  assert.deepEqual(cards.map(card => card.dataset.stageId), [`rift-${first.id}`, `rift-${second.id}`]);
  const button = descendants(cards[1]).find(el => el.textContent === '裂界へ挑む');
  assert.ok(button?.listeners.click);
  button.listeners.click();
  assert.equal(picked.id, `rift-${second.id}`);
  renderStageConfirm(picked);
  assert.equal(elements.get('confirmStageName').textContent, second.name);
  assert.match(elements.get('confirmModifiers').textContent, /出撃時にこの鍵を1本消費/);
  assert.match(elements.get('confirmModifiers').textContent, /撤退・敗北でも戻りません/);
  // The normal Back flow renders the same list without starting battle.
  renderStageSelect('world3-branches', () => {});
  assert.equal(state.riftKeys().length, 2);
  const battle = screen();
  battle.start(picked.id, () => {});
  assert.equal(battle.engine.stage.riftKey.id, second.id);
  renderStageSelect('world3-branches', () => {});
  const remaining = descendants(elements.get('stageList')).filter(el => el.dataset.stageId?.startsWith('rift-'));
  assert.deepEqual(remaining.map(card => card.dataset.stageId), [`rift-${first.id}`]);
});


test('actual result retry binding returns Rift players to key selection and preserves ordinary retry', () => {
  const main = fs.readFileSync(new URL('../js/main.js', import.meta.url), 'utf8');
  const bindings = main.split('\n').find(line => line.startsWith("document.getElementById('resultHomeBtn')"));
  assert.ok(bindings);
  const listeners = new Map(), routes = [], starts = [];
  const ctx = {
    document: { getElementById(id) { return { addEventListener(_, callback) { listeners.set(id, callback); } }; } },
    Audio_: { tap() {} }, pendingStage: { id: 'rift-consumed', isRift: true }, lastStageId: 'rift-consumed',
    goStageSelect: route => routes.push(route), startBattle: stage => starts.push(stage.id),
    getSelectedBlessingId: () => null, ensureNextStageButton() {}, showScreen() {},
  };
  vm.runInNewContext(bindings, ctx);
  listeners.get('resultRetryBtn')();
  assert.deepEqual(routes, ['world3-branches']);
  assert.deepEqual(starts, []);
  ctx.pendingStage = { id: '1-1' }; ctx.lastStageId = '1-1';
  listeners.get('resultRetryBtn')();
  assert.deepEqual(starts, ['1-1']);
});

test('Stage-first Rift detail replaces Story action and removes stale Hunt controls', () => {
  const source = fs.readFileSync(new URL('../js/patches/stageFirstNavigationUi.js', import.meta.url), 'utf8');
  const take = (start, end) => source.slice(source.indexOf(start), source.indexOf(end)).replaceAll('export function ', 'function ');
  const key = state.addRiftKey(10);
  const nodes = {
    stageConfirmScreen: { querySelector: () => ({}) },
    confirmStageName: { dataset: {} }, confirmStartBtn: { dataset: {}, textContent: '物語を進める' },
    stageFirstHuntBtn: { remove() { delete nodes.stageFirstHuntBtn; } },
    stageFirstHuntContext: { remove() { delete nodes.stageFirstHuntContext; } },
  };
  const ctx = {
    CHAPTERS, findStage, state, document: { getElementById: id => nodes[id] },
    stageFirstHuntContext: () => null,
  };
  vm.runInNewContext(
    take('function canonicalStageById(', 'function regionCatalog(') +
    take('function ensureHuntAction(', 'function showExistingStageList('), ctx);
  assert.equal(ctx.enhanceStageFirstDetail(`rift-${key.id}`), true);
  assert.equal(nodes.confirmStartBtn.textContent, '裂界へ出撃');
  assert.equal(nodes.confirmStartBtn.dataset.stageId, `rift-${key.id}`);
  assert.equal(nodes.stageFirstHuntBtn, undefined);
  assert.equal(nodes.stageFirstHuntContext, undefined);
  assert.equal(state.riftKeys().length, 1);
});


test('existing Fusion start decorator does not render an absent engine after missing-key rejection', async () => {
  const source = fs.readFileSync(new URL('../js/patches/fusionBattleUi.js', import.meta.url), 'utf8');
  const binding = source.split('\n').find(line => line.startsWith('TextBattleScreen.prototype.start='));
  const decorated = { prototype: {} };
  let paints = 0;
  vm.runInNewContext(binding, {
    TextBattleScreen: decorated, originalStart: TextBattleScreen.prototype.start,
    ensureBattleViewportStyles() {}, ensureUi() { paints++; },
  });
  const battle = screen();
  battle._render = () => { assert.ok(battle.engine); paints++; };
  let result;
  decorated.prototype.start.call(battle, 'rift-missing', value => { result = value; });
  await Promise.resolve();
  assert.equal(result.keyMissing, true);
  assert.equal(paints, 0);
  const key = state.addRiftKey(10);
  decorated.prototype.start.call(battle, `rift-${key.id}`, () => {});
  assert.ok(battle.engine.aliveEnemies.length);
  assert.ok(paints > 0);
  assert.equal(state.riftKeys().length, 0);
});
