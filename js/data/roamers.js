/* ============================================================
   Roamers（名もなき強敵）— 巡回中にまれに群れへ紛れ込む徘徊者

   Rare（地域の希少種）は章に根ざした生態だが、Roamerは章をまたいで
   さまよい続ける「どこにも属さない」強敵。各個体は固有の戦利品を
   1つだけ持ち歩き（dropItemId + dropChance）、撃破すればその章の
   目玉装備が直接狙える＝「あの敵に会いたい」という狩りになる。

   ステータスは「その章の通常敵」を基準に statMult で変形するだけ
   （新しいスケーリングauthorityは作らない）。出現はBattleEngine側で
   スロット差し替えとして実装され、rank='rare'として既存のCodex
   生態記録・Rare行動・レベル帯の仕組みにそのまま載る。
   ============================================================ */
import { hpMult, atkMult, defMult } from './enemies.js';
import { chapterMult } from './chapters.js';

// 基準素体（通常敵より一回り強い徘徊者体格）
const ROAMER_BASE = { hp: 60, atk: 14, def: 6, speed: 96, xp: 60, gold: 45 };

export const ROAMERS = Object.freeze({
  gilt_maw: {
    id: 'gilt_maw', name: '宝喰みの大口・GILT MAW',
    desc: '財宝だけを喰らい続けて鈍く育った巨口。鈍重だが、倒せば溜め込んだ富を吐き出す。',
    statMult: { hp: 3.2, atk: 0.7, def: 1.5, spd: 0.6, xp: 2.5, gold: 9 },
    minChapter: 2,
    dropItemId: 'uq_hunt_slayer_sigil', dropChance: 0.35,
  },
  glass_step: {
    id: 'glass_step', name: '鏡歩き・GLASS STEP',
    desc: '視界の端だけを歩く影。捉える前に何度も先を取られる。',
    statMult: { hp: 1.6, atk: 1.1, def: 0.7, spd: 1.8, xp: 3, gold: 3 },
    minChapter: 5,
    dropItemId: 'uq_hunt_stillwater_lens', dropChance: 0.35,
  },
  pale_jailer: {
    id: 'pale_jailer', name: '白き獄卒・PALE JAILER',
    desc: '失われた監獄の戒めだけを背負って歩く白い影。刃がほとんど通らない。',
    statMult: { hp: 2.4, atk: 0.8, def: 2.2, spd: 0.75, xp: 3, gold: 3 },
    minChapter: 8,
    dropItemId: 'uq_hunt_starlit_censer', dropChance: 0.35,
  },
  rust_errant: {
    id: 'rust_errant', name: '錆びた遍歴騎士・RUST ERRANT',
    desc: '仕えた国も主人も忘れた騎士の残骸。それでも剣筋だけは冴えている。',
    statMult: { hp: 2.0, atk: 1.35, def: 1.2, spd: 1.0, xp: 3.5, gold: 3.5 },
    minChapter: 9,
    dropItemId: 'uq_hunt_thousand_edge', dropChance: 0.35,
  },
  null_chant: {
    id: 'null_chant', name: '名を持たぬ詠唱者・NULL CHANT',
    desc: '名前を呪文に喰われた詠唱者。歌の続きを求めて戦場をさまよい歩く。',
    statMult: { hp: 1.3, atk: 1.8, def: 0.9, spd: 1.3, xp: 3.5, gold: 4 },
    minChapter: 12,
    dropItemId: 'uq_hunt_blight_fang', dropChance: 0.35,
  },
});

const ROAMER_IDS = Object.freeze(Object.keys(ROAMERS));

// その章で出現しうるRoamer（minChapter以下なら終盤章でも出る。
// 「章が進むほど会える相手が増える」構造にして、後半の巡回にも
// 前半のRoamerが残る＝取り逃した固有をいつでも追い直せる）。
export function roamersForChapter(chapterNum) {
  const n = Math.max(1, Math.floor(Number(chapterNum) || 1));
  return ROAMER_IDS.filter(id => ROAMERS[id].minChapter <= n);
}

export function pickRoamerForChapter(chapterNum, rng = Math.random) {
  const ids = roamersForChapter(chapterNum);
  if (!ids.length) return null;
  return ids[Math.min(ids.length - 1, Math.floor((rng() || 0) * ids.length))];
}

// 章番号に合わせたRoamer実体のステータス。hpMult/atkMult/defMultは
// 既存の章立て敵スケーリング、xp/goldは経済曲線chapterMultに従う。
export function roamerTemplate(id, chapterNum) {
  const def = ROAMERS[id];
  if (!def) return null;
  const num = Math.max(1, Math.floor(Number(chapterNum) || 1));
  const m = def.statMult;
  return {
    name: def.name,
    hp: Math.round(ROAMER_BASE.hp * hpMult(num) * m.hp),
    atk: Math.round(ROAMER_BASE.atk * atkMult(num) * m.atk),
    def: Math.round(ROAMER_BASE.def * defMult(num) * m.def),
    speed: Math.round(ROAMER_BASE.speed * (m.spd || 1)),
    xp: Math.round(ROAMER_BASE.xp * chapterMult(num) * m.xp),
    gold: Math.round(ROAMER_BASE.gold * chapterMult(num) * m.gold),
  };
}
