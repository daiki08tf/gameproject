/* ============================================================
   武器種の基礎プロファイル（equipment.js から分離）
   元は equipment.js 内に直接定義されていたが、Blade Vale 2.1 の
   weapons.js（約200本の武器データ）が equipment.js の ITEMS へ
   統合される都合上、
     weapons.js → equipment.js（RARITY/WEAPON_TYPESを使うため）
     equipment.js → weapons.js（WEAPON_CODEX_ITEMSをITEMSへ統合するため）
   という循環importが発生してしまう。WEAPON_TYPESには他モジュールへの
   依存が一切ないため、ここへ独立させることで循環を断ち切る
   （equipment.js は従来通りここから re-export するので、既存の
   `import { WEAPON_TYPES } from '../data/equipment.js'` は変更不要）。
   ============================================================ */

// 武器種：メインステータスへの配分比率。affinityStat と職業の得意武器が
// 一致すると装備適性ボーナス(+8%)が付く
export const WEAPON_TYPES = {
  sword:      { name: '剣',   atk: 1.4, mag: 0.2, spd: 0.6, crit: 1.0, affinityStat: 'atk' },
  axe:        { name: '斧',   atk: 1.8, mag: 0.1, spd: 0.3, crit: 0.6, affinityStat: 'atk' },
  staff:      { name: '杖',   atk: 0.2, mag: 1.8, spd: 0.4, crit: 0.6, affinityStat: 'mag' },
  bow:        { name: '弓',   atk: 1.2, mag: 0.2, spd: 1.0, crit: 1.2, affinityStat: 'atk' },
  dagger:     { name: '短剣', atk: 0.9, mag: 0.2, spd: 1.3, crit: 1.6, affinityStat: 'atk' },
  knuckle:    { name: '拳具', atk: 1.3, mag: 0.2, spd: 1.2, crit: 1.1, affinityStat: 'atk' },
  instrument: { name: '楽器', atk: 0.3, mag: 1.3, spd: 0.8, crit: 0.6, affinityStat: 'mag' },
  rod:        { name: '錫杖', atk: 0.3, mag: 1.4, spd: 0.4, crit: 0.5, affinityStat: 'mag' },
};
