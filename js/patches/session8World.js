/* ============================================================
   Session 8 — Living World runtime glue
   ------------------------------------------------------------
   - TREASURE VAULTS: a stage with stage.vault triggers a natural
     drop burst on clear (state.addItem with a vault dropCtx — the
     same rank/affix pipeline as battle drops; DROP CREATES THE
     ITEM, the vault only rolls it more times).
   - HIDDEN MERCHANTS: discovered merchants inject bounded offers
     into the canonical settlementMarket pipeline (same cost,
     spend, stock machinery). reward.randomDrop rolls the natural
     weapon pool — never a deterministic pick.
   ============================================================ */
import './rumorNetwork.js';
import './settlementMarket.js';
import { state } from '../state.js';
import { weaponDropPoolForStage } from '../data/weapons.js';
import { getItem } from '../data/equipment.js';
import { itemRankLabel, effectiveItemRank } from '../data/itemRanks.js';
import { marketCanPay } from '../data/settlementMarket.js';
import { hiddenMerchantOffers, HIDDEN_MERCHANTS } from '../data/hiddenMerchants.js';
import { SESSION8_RUMOR_THREADS } from '../data/rumorNetwork2.js';
import { showToast } from './toastFeedback.js';

function ensureWorld() {
  state.data.world2 ??= {};
  state.data.world2.discoveries ??= {};
  return state.data.world2;
}

/* ------------------------------------------------------------
   Treasure vault burst. Runs inside rollWorld2ClearRewards' wrap
   chain, AFTER the canonical rewards — the stage is cleared, so
   the vault 'opens'. Each roll is an independent natural drop.
   ------------------------------------------------------------ */
function runTreasureVault(stage, w) {
  const vault = stage.vault || {};
  const rolls = Math.max(1, Math.floor(Number(vault.rolls) || 1));
  const cl = state.climateForStage?.(stage) || {};
  const climateBonus = Number(cl.huntMods?.dropRankBonus) || 0;
  const dropCtx = {
    depth: Math.floor((Number(stage.recLevel) || 0) / 100),
    elite: true, boss: false,
    rankBonus: (Number(vault.rankBonus) || 0) + climateBonus,
    locTags: stage.locTags || null,
    weatherId: cl.weatherId || null,
    daypartId: cl.daypartId || null,
  };
  const pool = weaponDropPoolForStage(stage);
  const table = stage.dropTable || [];
  const drops = [];
  for (let i = 0; i < rolls; i++) {
    // Alternate: weapon-codex pool rolls and the stage's own dropTable.
    const useTable = table.length && i % 2 === 1;
    let itemId = null;
    const src = useTable ? table : pool;
    if (!src.length) continue;
    const totalW = src.reduce((s, d) => s + (d.weight || 1), 0);
    let r = Math.random() * totalW;
    for (const d of src) { r -= (d.weight || 1); if (r <= 0) { itemId = d.itemId; break; } }
    if (!itemId) continue;
    state.addItem(itemId, 1, dropCtx);
    const instanceId = state.consumeLastWeaponInstanceId?.() || null;
    const item = getItem(itemId);
    const inst = instanceId ? state.data.weaponInstances?.[instanceId] : null;
    const rank = inst ? effectiveItemRank(item, inst) : (item?.rarity || 'normal');
    drops.push({ itemId, instanceId, name: item?.name || itemId, rank, rankLabel: rank !== item?.rarity ? itemRankLabel(rank) : null });
  }
  return { rolls: drops.length, drops, rankBonus: dropCtx.rankBonus, weatherId: cl.weatherId || null };
}

// Wrap canonical clear rewards: vault loot rides result.world2.vault.
if (state.rollWorld2ClearRewards && !state.rollWorld2ClearRewards.__session8Vault) {
  const previous = state.rollWorld2ClearRewards.bind(state);
  const wrapped = function session8VaultClearRewards(stage, opts = {}) {
    const out = previous(stage, opts);
    if (!stage?.vault) return out;
    const w = ensureWorld();
    const vault = runTreasureVault(stage, w);
    if (vault.drops.length) {
      out.vault = vault;
      const recId = `vault:${stage.id}`;
      const best = vault.drops.find((d) => d.rankLabel) || vault.drops[0];
      w.discoveries[recId] = {
        name: `宝物庫：${stage.name}`,
        hint: `${vault.rolls}本の拾い物があった。${best?.rankLabel ? `中でも「${best.name}」は${best.rankLabel}――置かれていたのではなく、残っていた。` : 'どれも「残っていた」品だ。'}`,
        vault: true,
        items: vault.drops.map((d) => ({ itemId: d.itemId, rank: d.rank })),
        at: Date.now(),
      };
    }
    return out;
  };
  wrapped.__session8Vault = true;
  state.rollWorld2ClearRewards = wrapped;
}

/* ------------------------------------------------------------
   Hidden merchant market injection.
   ------------------------------------------------------------ */
const HIDDEN_OFFERS = hiddenMerchantOffers();
const HIDDEN_OFFER_INDEX = Object.fromEntries(HIDDEN_OFFERS.map((o) => [o.id, o]));

function merchantPurchases() {
  const meta = state.data.settlementBuildings?.__settlement3?.market2;
  return meta?.purchases || {};
}
function hiddenOfferStock(offer) {
  return Math.max(0, (offer.stock || 0) - (merchantPurchases()[offer.id] || 0));
}
function hiddenPayContext() {
  return { gold: Number(state.data.gold) || 0, materials: state.data.settlementMaterials || {}, goods: {} };
}
function spendHidden(cost = {}) {
  if (cost.gold) state.data.gold = Math.max(0, (Number(state.data.gold) || 0) - cost.gold);
  for (const [k, v] of Object.entries(cost.materials || {})) {
    state.data.settlementMaterials[k] = Math.max(0, (Number(state.data.settlementMaterials?.[k]) || 0) - v);
  }
}

const RUMOR_STATE_UNRESOLVED_LABEL = '未解明';

// rumorHint reward: injects a thread's opening entry as a bought rumor.
// The record persists; later unlocks merge on top (mergeCh1RumorEntries).
function grantRumorHint(threadId = null) {
  const w = ensureWorld();
  let thread = threadId ? SESSION8_RUMOR_THREADS.find((t) => t.id === threadId) : null;
  if (!thread) {
    thread = SESSION8_RUMOR_THREADS.find((t) => !w.discoveries[`rumor:s8_${t.id}`]);
  }
  if (!thread) return null;
  const key = `rumor:s8_${thread.id}`;
  const existing = w.discoveries[key];
  const first = thread.entries[0];
  if (existing?.entries?.some((e) => e.id === first.id)) return { thread, already: true };
  const entry = { id: first.id, type: 'bought', source: '角の男', text: first.text, order: first.order, resolves: false, unlockedAt: Date.now() };
  w.discoveries[key] = {
    ...(existing || {}),
    rumor: true, s8Thread: true, rumorId: `s8_${thread.id}`,
    category: thread.category, reliability: thread.reliability,
    name: `噂：${thread.title}`,
    hint: first.text,
    entries: [...(existing?.entries || []), entry].sort((a, b) => a.order - b.order),
    rumorState: 'unresolved', rumorStateLabel: RUMOR_STATE_UNRESOLVED_LABEL,
    at: existing?.at || Date.now(),
  };
  return { thread, already: false };
}

function grantHiddenReward(reward = {}) {
  const got = { items: [], rumor: null };
  if (reward.materials) {
    state.data.settlementMaterials ??= {};
    for (const [k, v] of Object.entries(reward.materials)) {
      if (k in state.data.settlementMaterials) state.data.settlementMaterials[k] = (Number(state.data.settlementMaterials[k]) || 0) + Math.max(0, Math.floor(v));
    }
  }
  if (reward.gold) state.data.gold = (Number(state.data.gold) || 0) + Math.max(0, Math.floor(reward.gold));
  for (const [itemId, qty] of Object.entries(reward.items || {})) {
    for (let i = 0; i < qty; i++) state.addItem(itemId, 1);
    got.items.push(`${itemId}×${qty}`);
  }
  if (reward.rumorHint) got.rumor = grantRumorHint(reward.rumorHint === true ? null : reward.rumorHint);
  if (reward.randomDrop) {
    const recLevel = Math.max(1, Number(state.data.level) || 1);
    const pool = weaponDropPoolForStage({ recLevel: recLevel + 20 });
    for (let i = 0; i < (reward.randomDrop.rolls || 1); i++) {
      if (!pool.length) break;
      const totalW = pool.reduce((s, d) => s + d.weight, 0);
      let r = Math.random() * totalW;
      for (const d of pool) {
        r -= d.weight;
        if (r <= 0) {
          state.addItem(d.itemId, 1, { rankBonus: reward.randomDrop.rankBonus || 0, merchantRoll: true });
          got.items.push(d.itemId);
          break;
        }
      }
    }
  }
  return got;
}

// Offers: hidden merchants append to the canonical offer list when
// discovered; 'unlocked' doubles as "the lantern is lit right now".
if (state.settlementMarketOffers && !state.settlementMarketOffers.__session8Merchants) {
  const previousOffers = state.settlementMarketOffers.bind(state);
  const wrappedOffers = function session8MerchantOffers() {
    const offers = previousOffers();
    for (const m of HIDDEN_MERCHANTS) {
      if (!this.hiddenMerchantDiscovered?.(m.id)) continue;
      const open = !!this.hiddenMerchantOpen?.(m.id);
      for (const offer of m.offers) {
        const bought = Math.max(0, Math.floor(merchantPurchases()[offer.id] || 0));
        const remaining = Math.max(0, offer.stock - bought);
        offers.push({
          ...offer, hiddenMerchant: true,
          desc: `${m.name} — ${offer.desc}`,
          bought, remaining,
          unlocked: open,
          affordable: open && remaining > 0 && marketCanPay(offer.cost, hiddenPayContext()),
        });
      }
    }
    return offers;
  };
  wrappedOffers.__session8Merchants = true;
  state.settlementMarketOffers = wrappedOffers;
}

if (state.buySettlementMarketOffer && !state.buySettlementMarketOffer.__session8Merchants) {
  const previousBuy = state.buySettlementMarketOffer.bind(state);
  const wrappedBuy = function session8MerchantBuy(id) {
    const offer = HIDDEN_OFFER_INDEX[id];
    if (!offer) return previousBuy(id);
    if (!this.hiddenMerchantDiscovered?.(offer.merchantId)) return { ok: false, reason: 'undiscovered' };
    if (!this.hiddenMerchantOpen?.(offer.merchantId)) return { ok: false, reason: 'closed' };
    if (hiddenOfferStock(offer) <= 0) return { ok: false, reason: 'stock' };
    if (!marketCanPay(offer.cost, hiddenPayContext())) return { ok: false, reason: 'cost' };
    spendHidden(offer.cost);
    const got = grantHiddenReward(offer.reward);
    const meta = (state.data.settlementBuildings ??= {}).__settlement3 ??= {};
    (meta.market2 ??= { securedRoutes: [], purchases: {} }).purchases ??= {};
    meta.market2.purchases[offer.id] = (meta.market2.purchases[offer.id] || 0) + 1;
    this.save();
    if (got.rumor && !got.rumor.already) showToast?.(`[噂] 角の男が「${got.rumor.thread.title}」を教えてくれた`);
    return { ok: true, offer, got };
  };
  wrappedBuy.__session8Merchants = true;
  state.buySettlementMarketOffer = wrappedBuy;
}

export { runTreasureVault, grantHiddenReward, grantRumorHint };
