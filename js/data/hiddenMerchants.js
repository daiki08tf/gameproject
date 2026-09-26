/* ============================================================
   Session 8 — Hidden Merchants
   ------------------------------------------------------------
   A hidden merchant is NOT a shop and NOT a new currency: each is
   a named figure discovered through rumors/weather/time/clears,
   surfaced inside the existing Settlement Market pipeline
   (settlementMarketOffers / buySettlementMarketOffer — same
   cost/spend/stock machinery, same gold/materials/goods).

   Inventory law (mission §30): they sell rumors, lures, runes,
   consumables, utility and RANDOM natural gear rolls — never a
   deterministic best-in-slot. `reward.randomDrop` asks the runtime
   to roll the shared drop pipeline (DROP CREATES THE ITEM), so even
   "buying gear" from them is a drop, not a pick.
   ============================================================ */

export const HIDDEN_MERCHANTS = Object.freeze([
  Object.freeze({
    id: 'lantern_broker', name: '角の男・燈売り',
    epithet: '旧道の外れに灯りを点す行商人',
    desc: '角のある男。品物は布で包まれ、値段は声に出さない。「借りでもいい」とだけ言う。',
    discoveryHint: '夕から夜に変わる頃、旧道の外れに灯りが点る。',
    // Discovered when the horned_merchant thread reaches the dusk entry.
    requires: { rumorEntries: { rumorId: 'horned_merchant', min: 3 } },
    availability: { dayparts: ['dusk', 'night'] },
    offers: Object.freeze([
      Object.freeze({ id: 'lb_rumor', name: '「聞きたいことがあるはずだ」', desc: '男が知っている噂を一つ、包みの中から選んでくれる。', cost: { gold: 400 }, reward: { rumorHint: true }, stock: 3 }),
      Object.freeze({ id: 'lb_lure', name: '匂い袋・異種', desc: '変異した個体を引き寄せるという匂い袋。巡回の間だけ効く、らしい。', cost: { gold: 900 }, reward: { items: { lure_variant: 1 } }, stock: 2 }),
      Object.freeze({ id: 'lb_wrapped_blade', name: '布包みの剣', desc: '包みを開けるまで何が入っているか分からない。位階は抽選のまま。', cost: { gold: 2600 }, reward: { randomDrop: { rolls: 1, rankBonus: .05 } }, stock: 1 }),
    ]),
  }),
  Object.freeze({
    id: 'tide_scavenger', name: '潮溜まりの拾い手',
    epithet: '雨の日にだけ現れる拾い手',
    desc: '雨粒の向こう側でしゃがんでいる。拾ったものを、拾った値段で売る。',
    discoveryHint: '雨の日の潮溜まりに、何かを拾う影がある。',
    requires: { rumorEntries: { rumorId: 'tide_scavenger', min: 2 } },
    availability: { weathers: ['rain', 'storm'] },
    offers: Object.freeze([
      Object.freeze({ id: 'ts_tide_glass', name: '潮溜まりの硝子', desc: '水の中で磨かれた魔晶。触媒として使える。', cost: { gold: 700 }, reward: { materials: { veilstone: 2, ore: 8 } }, stock: 2 }),
      Object.freeze({ id: 'ts_drowned_relic', name: '沈んだ遺物', desc: '沈んでいた装備。誰のものかは分からない。', cost: { gold: 1800 }, reward: { randomDrop: { rolls: 1, rankBonus: .04 } }, stock: 1 }),
      Object.freeze({ id: 'ts_map_scrap', name: '濡れた地図の切れ端', desc: '沈んだ場所へ続く、というらしい。', cost: { gold: 500 }, reward: { rumorHint: 'sunken_manse' }, stock: 1 }),
    ]),
  }),
  Object.freeze({
    id: 'rust_remnant', name: '錆の番人',
    epithet: '機械の墓場に座する売り手',
    desc: '錆びた装甲の内側に誰かがいる。取引の言葉は覚えている。あとの言葉は忘れた。',
    discoveryHint: '灰か嵐の空の下、動かなくなった機械が物を売る。',
    requires: { clearedStages: 60 },
    availability: { weathers: ['ash', 'storm'] },
    offers: Object.freeze([
      Object.freeze({ id: 'rr_scrap_runes', name: '錆びた符石の束', desc: '機械の内側から採れた符石。', cost: { gold: 1500 }, reward: { items: { rune_effect_crit_up: 1, rune_effect_haste: 1 } }, stock: 1 }),
      Object.freeze({ id: 'rr_old_core', name: '古い核', desc: '暴走しかけの核。素材として売る。', cost: { gold: 3200 }, reward: { randomDrop: { rolls: 1, rankBonus: .08 } }, stock: 1 }),
    ]),
  }),
]);

export const HIDDEN_MERCHANT_INDEX = Object.freeze(Object.fromEntries(HIDDEN_MERCHANTS.map((m) => [m.id, m])));

// Flat list of merchant offers for the market pipeline.
export function hiddenMerchantOffers() {
  return HIDDEN_MERCHANTS.flatMap((m) => m.offers.map((o) => ({ ...o, merchantId: m.id, merchantName: m.name, hiddenMerchant: true })));
}
