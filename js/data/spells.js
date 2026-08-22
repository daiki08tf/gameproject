/* ============================================================
   じゅもん（呪文）― 拡張ポイントのみ（元指示1・14番）
   ------------------------------------------------------------
   今回のテキスト戦闘移行では、じゅもんの実装（多数の呪文を作り込む・
   MP消費の魔法体系を新設する等）はスコープ外。将来ここへ実際の呪文を
   追加していけるよう、データ形状の例だけを示しておく。

   現状は誰からも参照されない（テキスト戦闘UIの「じゅもん」ボタンは
   disabledのまま）。実装する際は、job.skill（js/data/jobs.js）や
   BattleEngine._playerSkill()と同じ要領で、
     BattleEngine に _playerSpell(spellId) を追加
       → mp消費・cooldown（roundsFromSecondsでターン換算）・
         type: 'damage'|'heal'|'buff'|'debuff' 等で分岐
     performPlayerAction() に action.type === 'spell' の分岐を追加
     BattleLog に呪文名を使った専用の文面を追加
   という形で、既存のとくぎ（job.skill）の実装パターンをそのまま
   踏襲すればよい。
   ============================================================ */
export const SPELLS = {
  // 例：ダメージ系呪文
  fireball: {
    id: 'fireball', name: 'ファイア', type: 'damage', element: 'fire',
    power: 30, mpCost: 8, cooldown: 3.0, // cooldownは秒。roundsFromSeconds()でターン数へ換算する
  },
  // 例：回復系呪文
  heal: {
    id: 'heal', name: 'ホイミ', type: 'heal',
    power: 40, mpCost: 6, cooldown: 1.5,
  },
  // 例：デバフ系呪文（今のweaken効果と同じ形＝BattleEngine.applyEffectの
  // weaken分岐を流用できる想定）
  slow: {
    id: 'slow', name: 'スロウ', type: 'debuff', stat: 'spd', power: 0.3, duration: 6,
    mpCost: 5, cooldown: 4.0,
  },
};

export function getSpell(id) { return SPELLS[id] || null; }
