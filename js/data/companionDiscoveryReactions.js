/* ============================================================
   Living World & Discovery C6-8 — Discovery integration
   ------------------------------------------------------------
   Pure data + pure helpers (no state.js/DOM dependency), matching
   the convention already used by js/data/archaeology.js and
   js/data/treasureHunt.js.

   Per LIVING_WORLD_DISCOVERY_ROADMAP.md C6-8: "Companions should
   interact with Living World & Discovery through identity-driven
   hints and reactions rather than mandatory flat bonuses... These
   are reasons to care about collection breadth, not hard gates
   requiring one exact companion." So this is FLAVOR ONLY: a short
   reaction line attached to a discovery result when a matching
   companion happens to be in the active party, never a reward/odds
   modifier. No new battle/loot authority, no UI-only progression
   that could disagree with canonical state -- companionDiscoveryReaction()
   reads the real active party and the real species family, nothing
   invented.

   First slice covers the two reactions with a clean, honest match to
   data that already exists (species `family`, from data/companions.js/
   monsterRanchSpecies.js -- no new categorization data invented for
   this):
   - 'undead' family ("ancient/ghost species") reacts to Archaeology
     evidence -- the roadmap's own example.
   - 'spirit' family (the fast-route species, already flavored with
     tracking/pathfinding traits like 狩猟眼/先駆け/急襲) reacts to
     Treasure Hunt traces -- matches the roadmap's "scent/tracker
     species reacts to Treasure Hunt traces" example.
   The roadmap's other three examples (aquatic/amphibious->Fishing,
   territorial->Region ecology, social/intelligent->Settlement/Rumor
   flavor) have no equally clean existing family/trait tag to hang off
   of without inventing new companion categorization data -- deliberately
   left as a later continuation rather than forced to fit here.
   ============================================================ */

export const COMPANION_DISCOVERY_REACTIONS = Object.freeze({
  archaeology: {
    family: 'undead',
    text: (name) => `${name}が、掘り出したものに聞き覚えのある気配を感じ取っている。`,
  },
  treasureHunt: {
    family: 'spirit',
    text: (name) => `${name}が、手がかりの残り香を辿るように鼻先を上げた。`,
  },
  // 残り 3 種（2026-11）。当初は「掛けるタグが無い」として保留していたが、
  // その後 family:'aquatic' の種族（潮径の外伝）と、種族の role（phase12CompanionPack の
  // guardian / support など）が増えたので、既存タグだけで素直に書けるようになった。
  // 役割で照合するものは `role` を使う（family と同じく種族データを読むだけ）。
  fishing: {
    family: 'aquatic',
    text: (name) => `${name}が、水面の下の気配を先に見つけて、じっと目で追っている。`,
  },
  // 縄張り型（guardian）→ 地域の生態：地域の記録を開いたときの一言
  region: {
    role: 'guardian',
    text: (name) => `${name}が、この土地の縄張りの境目を確かめるように、周りを見回している。`,
  },
  // 社会型（support）→ 拠点・噂：拠点の出来事が片付いたときの一言
  settlement: {
    role: 'support',
    text: (name) => `${name}が、住民たちの輪の中で、何があったのかを聞いて回っている。`,
  },
});

// `activeCompanions` is the plain array state.activeCompanions() already
// returns ({id, species, instance, ...} per entry) -- this stays a pure
// function of that array so it's trivially testable without state.js.
export function companionDiscoveryReaction(kind, activeCompanions = []) {
  const rule = COMPANION_DISCOVERY_REACTIONS[kind];
  if (!rule) return null;
  const match = activeCompanions.find((c) => (rule.family ? c?.species?.family === rule.family : rule.role ? c?.species?.role === rule.role : false));
  if (!match) return null;
  const name = match.instance?.nickname || match.species?.name || '仲間';
  return { companionId: match.id, companionName: name, text: rule.text(name) };
}
