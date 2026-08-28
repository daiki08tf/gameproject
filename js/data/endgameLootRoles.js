/* ============================================================
   Gear Overhaul Phase 9B — Endgame loot activity roles
   ------------------------------------------------------------
   Presentation / guidance contract for EXISTING activities only.
   This data does not grant rewards or create progression systems.
   ============================================================ */

export const ENDGAME_LOOT_ROLES = Object.freeze([
  Object.freeze({
    id:'abyss',
    label:'深淵',
    short:'Option / 生装備',
    primary:'深度で伸びるItem Powerと繰り返し装備掘り',
    secondary:'Armoryで武器・Set・Named Uniqueを狙う',
    avoid:'特定1個だけを短時間で確定入手する場所ではない',
  }),
  Object.freeze({
    id:'rift',
    label:'Rift',
    short:'Greater / Ancient',
    primary:'鍵の報酬特性によるGreater・Ancient・高品質バースト',
    secondary:'属性鍵でアステリオン / ミアズマを狙い分ける',
    avoid:'長時間の安定した同一テーブル周回より鍵ごとの爆発力を優先',
  }),
  Object.freeze({
    id:'nemesis',
    label:'Nemesis / EX',
    short:'宿敵 / 敵テーマ',
    primary:'成長した宿敵とEX賞金首の高報酬・敵テーマ装備',
    secondary:'弱点情報と狩り方を使って高Risk報酬を効率化',
    avoid:'全武器種の汎用ランダム掘り場所にはしない',
  }),
  Object.freeze({
    id:'secret_realm',
    label:'Secret Realm',
    short:'Named / Build Identity',
    primary:'発見ルートに紐づくNamed・Set・固定Identity装備',
    secondary:'反転図書館 / 第八鍵など明示された目的地を掘る',
    avoid:'深淵と同じ無限深度・汎用Option農場にはしない',
  }),
]);

export function endgameLootRole(id){
  return ENDGAME_LOOT_ROLES.find(role => role.id === id) || null;
}

export function endgameLootRolesForLevel(level=1){
  const lv=Math.max(1,Math.min(99999,Math.floor(Number(level)||1)));
  if(lv<3000)return [];
  if(lv<10000)return ENDGAME_LOOT_ROLES.filter(role => ['abyss','rift','nemesis'].includes(role.id));
  return [...ENDGAME_LOOT_ROLES];
}

export function compactEndgameLootRoleSummary(level=1){
  return endgameLootRolesForLevel(level).map(role => `${role.label}:${role.short}`).join(' / ');
}
