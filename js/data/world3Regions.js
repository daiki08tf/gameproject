/* Blade Vale — World 3.0 regional hierarchy
   Chapter stage data remains authoritative. This layer groups chapters into
   larger travel regions so the world UI does not become a flat chapter list. */

export const WORLD3_REGIONS=Object.freeze([
  Object.freeze({id:'frontier',name:'開拓辺境',subtitle:'はじまりの平原から魔王領前線へ',chapters:[1,2,3,4],tone:'mortal'}),
  Object.freeze({id:'elemental',name:'四境連峰',subtitle:'火・水・風・魔が交差する中域',chapters:[5,6,7,8],tone:'mortal'}),
  Object.freeze({id:'fracture',name:'境界裂域',subtitle:'時空と古戦場が歪み始める地帯',chapters:[9,10,11,12],tone:'mortal'}),
  Object.freeze({id:'last-mortal',name:'人界最奥',subtitle:'蒼晶・腐界・黒鉄の果て',chapters:[13,14,15],tone:'mortal'}),
  Object.freeze({id:'veil',name:'The Veil',subtitle:'世界の外側へ続く第二部',chapters:[16,17,18,19,20],tone:'boundary'}),
  Object.freeze({id:'outer-world',name:'外縁世界',subtitle:'境界網の外側に連なる第三部',chapters:[21,22,23,24,25],tone:'outer'}),
  Object.freeze({id:'reverse-observation',name:'逆観測域',subtitle:'第八鍵の接続元を追う第四部',chapters:[26,27,28,29,30],tone:'observer'}),
  Object.freeze({id:'shared-observation',name:'共観測域',subtitle:'返された応答と第八鍵の対向構造を追う第五部',chapters:[31,32],tone:'handshake'}),
]);

export function world3RegionForChapter(chapterNumber){
  const n=Number(chapterNumber);
  return WORLD3_REGIONS.find(region=>region.chapters.includes(n))||null;
}

export function world3RegionState(region,chapters,isCleared,isUnlocked){
  const indices=region.chapters.map(n=>n-1).filter(i=>chapters[i]);
  const regionChapters=indices.map(i=>chapters[i]);
  const unlocked=indices.some(i=>isUnlocked(i));
  const completed=regionChapters.length>0&&regionChapters.every(ch=>{
    const boss=ch.stages.find(s=>s.boss)||ch.stages[ch.stages.length-1];
    return !!boss&&isCleared(boss.id);
  });
  const clearedCount=regionChapters.filter(ch=>{
    const boss=ch.stages.find(s=>s.boss)||ch.stages[ch.stages.length-1];
    return !!boss&&isCleared(boss.id);
  }).length;
  return {unlocked,completed,clearedCount,total:regionChapters.length};
}
