// World / Journey presentation layer.
// Internal chapter ids remain progression keys, but the player experiences them as places on one continuous journey.

export function journeyName(chapter) {
  if (!chapter) return '';
  if (chapter.displayName) return chapter.displayName;
  return String(chapter.name || '').replace(/^第\d+章\s*/, '');
}

export const VEIL_FRAGMENTS = Object.freeze([
  {
    id: 'uneasy_world',
    unlockStageId: '10-5',
    title: '旅の記録：小さな違和感',
    text: '遠く離れた土地で、同じ形の古い紋様が見つかっている。偶然にしては出来すぎている。',
  },
  {
    id: 'broken_boundary',
    unlockStageId: '15-5',
    title: '旅の記録：世界の綻び',
    text: '黒鉄機城の停止後、各地で空間の揺らぎが観測され始めた。何かを動かしていたのではなく、何かを押さえていたのかもしれない。',
  },
  {
    id: 'seven_hollows',
    unlockStageId: '16-8',
    title: '旅の記録：七つの窪み',
    text: '沈都で見つかった石版には七つの窪みがある。海より古い時代から、世界の境目を封じる仕組みが存在したらしい。',
  },
  {
    id: 'watchers_from_above',
    unlockStageId: '17-8',
    title: '旅の記録：天より来る者',
    text: '白夜の聖典は、人の神話とは異なる存在を記していた。彼らはこの世界の住人ではなく、境界の外から世界を見ていたという。',
  },
  {
    id: 'outside_world',
    unlockStageId: '18-8',
    title: '旅の記録：世界の外側',
    text: '墜星研究所の記録は、星骸が空からではなく「世界の外側」から侵入した可能性を示している。世界には端がある。',
  },
  {
    id: 'the_veil_named',
    unlockStageId: '19-8',
    title: '旅の記録：The Veil',
    text: '古い観測記録が、世界と外側を隔てる境界を The Veil と呼んでいる。境界はいま、明らかに薄くなっている。',
  },
  {
    id: 'guardian_truth',
    unlockStageId: '20-8',
    title: '旅の記録：門番の真実',
    text: '始原の深淵で倒した存在は、侵略者ではなかった。The Veilの裂け目を内側から塞ぎ続けていた、最後の門番だった。',
    worldState: 'veil_breached',
  },
]);

export function discoveredVeilFragments(isStageCleared) {
  if (typeof isStageCleared !== 'function') return [];
  return VEIL_FRAGMENTS.filter(fragment => isStageCleared(fragment.unlockStageId));
}

export function latestVeilFragment(isStageCleared) {
  return discoveredVeilFragments(isStageCleared).at(-1) || null;
}

export function veilWorldState(isStageCleared) {
  const latest = latestVeilFragment(isStageCleared);
  return latest?.worldState || (latest ? 'unstable' : 'quiet');
}
