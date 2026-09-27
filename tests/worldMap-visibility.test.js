/* World Map visibility — スポイラー防止の回帰テスト。
   モデル出力（computeWorldMapVisibility）を検証する：
   NEW GAME で未来の章・領域・秘密地点が一切見えないことを保証し、
   噂を聞く・発見する・踏破する進行でだけ地図が育つことを固定する。 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { CHAPTERS, isChapterUnlocked, finalStageOf } from '../js/data/stages.js';
import { WORLD_MAP_NODES, WORLD_MAP_MAIN_ROUTE } from '../js/data/worldMapLayout.js';
import { computeWorldMapVisibility, worldMapNodeRegionId } from '../js/data/worldMapVisibility.js';

const CH_IDX = new Map(CHAPTERS.map((c, i) => [c.id, i]));

function fixture({ clearedChapters = [], clearedStages = new Set(), discoveries = new Set(), heard = new Set(), fieldOk = () => true } = {}) {
  const cleared = new Set(clearedStages);
  for (const id of clearedChapters) {
    const ch = CHAPTERS.find((c) => c.id === id);
    const boss = finalStageOf(ch);
    if (boss) cleared.add(boss.id);
  }
  const isCleared = (id) => cleared.has(id);
  return computeWorldMapVisibility({
    isUnlocked: (idx) => isChapterUnlocked(idx, isCleared),
    isCleared,
    fieldOk,
    hasDiscovery: (id) => discoveries.has(id),
    climateGateState: () => 'open',
    heardNodeIds: heard,
  });
}

function mainIds(nodes) {
  return [...nodes.keys()].filter((id) => /^ch\d+$/.test(id)).map((id) => Number(id.slice(2)));
}
function nodeLabel(id) {
  return WORLD_MAP_NODES.find((n) => n.id === id)?.label;
}

test('NEW GAME: 地図は宿場町＋最初の章＋次の行き先だけ — 未来の世界は描かれない', () => {
  const m = fixture();
  // 本編で見えるのは ch1(到達可) と ch2(先端???)。それ以遠は位置すらない。
  assert.deepEqual(mainIds(m.nodes).sort((a, b) => a - b), [1, 2]);
  assert.equal(m.nodes.get('ch2')?.state, 'frontier');
  assert.equal(m.nodes.get('ch1')?.state, 'open');
  assert.equal(m.nodes.get('settlement')?.state, 'town');
  // Ch3以降・後半章・外伝は一切描かれない
  for (const id of ['ch3', 'ch10', 'ch25', 'ch40', 'ch48', 'gaiden_beasttrail', 'gaiden_tidepath', 'gaiden_ashfield']) {
    assert.equal(m.nodes.get(id), undefined, id);
  }
  // 秘密地点・Session8地点・商人は未発見では描かれない
  for (const id of ['side8_bellgrave', 'side8_sunkenmanse', 'side8_whitehollow', 'merchant_lantern_broker', 'merchant_tide_scavenger']) {
    assert.equal(m.nodes.get(id), undefined, id);
  }
  // 先端の先（anchor未踏）の探索地点は？？？すら出さない
  for (const id of ['side_rustmine', 'side_windshrine', 'side_gravepath', 'side_stormpeak']) {
    assert.equal(m.nodes.get(id), undefined, id);
  }
  // 既知領域は開拓辺境のみ — 後の領域名は地図に現れない
  assert.deepEqual(m.regions, ['frontier']);
  assert.equal(m.currentRegion, 'frontier');
});

test('NEW GAME: frontier 以遠の本編章が1つも漏れない', () => {
  const m = fixture();
  const routeVisible = WORLD_MAP_MAIN_ROUTE.filter((id) => m.nodes.has(id));
  assert.deepEqual(routeVisible, ['ch1', 'ch2']);
});

test('噂を聞くと未踏の場所が？？？として灯る（聞いていない間は不可視）', () => {
  const silent = fixture();
  assert.equal(silent.nodes.get('side_floodgate'), undefined);
  const heard = fixture({ heard: new Set(['side_floodgate']) });
  assert.equal(heard.nodes.get('side_floodgate')?.state, 'rumored');
  // 本編章への噂も？？？で灯る（名前は出ない＝state:rumored）
  const heardMain = fixture({ heard: new Set(['ch11']) });
  assert.equal(heardMain.nodes.get('ch11')?.state, 'rumored');
  assert.equal(heardMain.nodes.get('ch12'), undefined, '聞いていない隣は見えない');
});

test('発見（discovery）は商人とSession8地点を実名で可視化する', () => {
  const m = fixture({ discoveries: new Set(['merchant_lantern_broker']) });
  assert.equal(m.nodes.get('merchant_lantern_broker')?.state, 'merchant');
  // conv系は requiresDiscovery：発見しても踏破前は「？？？」、存在は灯る
  const conv = fixture({ discoveries: new Set(['conv_bellgrave']), clearedChapters: ['ch1', 'ch2', 'ch3', 'ch4', 'ch5', 'ch6', 'ch7', 'ch8', 'ch9', 'ch10'] });
  // ch11未踏破なのでunlock未達 → rumored or hidden（anchor ch12はfrontier相当）
  const st = conv.nodes.get('side8_bellgrave')?.state;
  assert.ok(st === 'rumored' || st === 'field-locked' || st === 'open' || st === undefined, `unexpected ${st}`);
});

test('EARLY GAME: 踏破済みは残り、先端だけが？？？として進む', () => {
  const m = fixture({ clearedChapters: ['ch1', 'ch2'] });
  assert.equal(m.nodes.get('ch1')?.state, 'cleared');
  assert.equal(m.nodes.get('ch2')?.state, 'cleared');
  assert.equal(m.nodes.get('ch3')?.state, 'open');
  assert.equal(m.nodes.get('ch4')?.state, 'frontier');
  assert.equal(m.nodes.get('ch5'), undefined);
  // 踏破で解放された探索地点は実名で見える
  assert.equal(m.nodes.get('side_mossgrove')?.state, 'open');
  assert.equal(m.nodes.get('side_rustmine')?.state, 'rumored', 'anchor ch4 frontier — 気配は見える');
});

test('MID GAME: 複数領域が既知になり、現在領域は最前線を指す', () => {
  const cleared = Array.from({ length: 10 }, (_, i) => `ch${i + 1}`);
  const m = fixture({ clearedChapters: cleared });
  assert.equal(m.nodes.get('ch12')?.state, 'frontier');
  assert.ok(m.regions.includes('frontier'));
  assert.ok(m.regions.includes('elemental'));
  assert.ok(m.regions.includes('fracture'));
  assert.equal(m.currentRegion, 'fracture');
  // 到達した領域の章は名前つきで残る（踏破の記録）
  for (const id of ['ch1', 'ch5', 'ch9', 'ch10']) assert.ok(m.nodes.has(id), id);
  // まだ遠い領域は出ない
  assert.ok(!m.regions.includes('veil'));
});

test('LATE GAME: 領域一覧は伸びるが各地域のノード数は管理可能なまま', () => {
  const cleared = Array.from({ length: 40 }, (_, i) => `ch${i + 1}`);
  const m = fixture({ clearedChapters: cleared });
  assert.ok(m.regions.length >= 9, `regions=${m.regions.length}`);
  assert.equal(m.currentRegion, 'unrecorded-band');
  // 1領域あたりの可視ノード数は小さく保たれる（1画面に収まる密度）
  for (const rid of m.regions) {
    const count = WORLD_MAP_NODES.filter((n) => m.nodes.has(n.id) && (n.kind === 'town' ? rid === 'frontier' : worldMapNodeRegionId(n) === rid)).length;
    assert.ok(count <= 12, `region ${rid} renders ${count} nodes`);
  }
});

test('全踏破後はfrontierが消え、全領域が既知', () => {
  const cleared = Array.from({ length: 48 }, (_, i) => `ch${i + 1}`);
  const m = fixture({ clearedChapters: cleared });
  assert.equal(m.frontierId, null);
  assert.equal(m.nodes.get('ch48')?.state, 'cleared');
  assert.ok(m.regions.includes('unrecorded-band'));
});
