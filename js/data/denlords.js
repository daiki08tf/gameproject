/* ============================================================
   DENLORD — 外伝の巣の主。再利用可能な番獣パターンの登録簿。
   ------------------------------------------------------------
   DenlordはBossではない。各外伝の最終Stageを支配する名付きの
   頂点魔物で、倒すと勧誘できる（rareIdentityの撃破→勧誘経路）。
   一度その外伝をクリアした後、同じStageへ挑むと「再臨」個体が
   現れる —— ステータスが強化された再戦で、勧誘に成功すると
   継承特性『再臨』を持つ個体が仲間になる。追加の通貨や専用
   進行は持たず、stageProgressの既存クリア記録から再臨状態を
   導出する（js/patches/denlordLords.js）。
   ============================================================ */
export const DENLORDS = Object.freeze({
  bt_denlord: Object.freeze({
    id: 'bt_denlord', enemyType: 'bt_denlord', speciesId: 'bt_denlord',
    gaidenId: 'gaiden_beasttrail', finaleStageId: 'bt-7',
    name: '獣径の主・DENLORD', title: '獣径の主',
    prestige: Object.freeze({ namePrefix: '【再臨】', hpMult: 1.45, atkMult: 1.30, defMult: 1.30, recruitRarity: 'legendary', trait: '再臨' }),
    super: Object.freeze({ namePrefix: '【超再臨】', hpMult: 1.90, atkMult: 1.55, defMult: 1.60, recruitRarity: 'mythic', trait: '超再臨' }),
  }),
  tp_denlord: Object.freeze({
    id: 'tp_denlord', enemyType: 'tp_denlord', speciesId: 'tp_denlord',
    gaidenId: 'gaiden_tidepath', finaleStageId: 'tp-5',
    name: '潮径の主・TIDELORD', title: '潮径の主',
    prestige: Object.freeze({ namePrefix: '【再臨】', hpMult: 1.50, atkMult: 1.25, defMult: 1.35, recruitRarity: 'legendary', trait: '再臨' }),
    super: Object.freeze({ namePrefix: '【超再臨】', hpMult: 1.95, atkMult: 1.45, defMult: 1.65, recruitRarity: 'mythic', trait: '超再臨' }),
  }),
  af_denlord: Object.freeze({
    id: 'af_denlord', enemyType: 'af_denlord', speciesId: 'af_denlord',
    gaidenId: 'gaiden_ashfield', finaleStageId: 'af-5',
    name: '灰径の主・ASHLORD', title: '灰径の主',
    prestige: Object.freeze({ namePrefix: '【再臨】', hpMult: 1.40, atkMult: 1.40, defMult: 1.25, recruitRarity: 'legendary', trait: '再臨' }),
    super: Object.freeze({ namePrefix: '【超再臨】', hpMult: 1.85, atkMult: 1.70, defMult: 1.50, recruitRarity: 'mythic', trait: '超再臨' }),
  }),
});

export function denlordForEnemyType(enemyType) { return DENLORDS[enemyType] || null; }
export function denlordForSpecies(speciesId) {
  return Object.values(DENLORDS).find(d => d.speciesId === speciesId) || null;
}
export function isDenlordSpecies(speciesId) { return !!denlordForSpecies(speciesId); }
