/* Phase 11.4 — World Mystery Integration
 * One compact vocabulary for existing systems. This file is narrative-only:
 * no rewards, progression gates, combat values or save fields are changed.
 */
import { ENDGAME_STORY_MEANINGS } from './storyCanon.js';
import { modernWorldTeaseForStage } from './storyModernWorldTease.js';

export const WORLD_MYSTERY_SYSTEMS=Object.freeze({
  abyss:Object.freeze({label:'深淵',meaning:ENDGAME_STORY_MEANINGS.abyss,clue:'ここは地下ではない。壊れたThe Veilに、複数世界の残滓が折り重なっている。'}),
  worldTier:Object.freeze({label:'境界圧',meaning:ENDGAME_STORY_MEANINGS.worldTier,clue:'同じ土地の危険度が変わるのは、The Veil越しの干渉が強まり別位相の法則が重なるためらしい。'}),
  keyDungeon:Object.freeze({label:'鍵穴',meaning:ENDGAME_STORY_MEANINGS.keyDungeon,clue:'鍵穴は扉そのものではなく、The Veilの保守路へ接続する端末だった。'}),
  secretRealm:Object.freeze({label:'異界',meaning:ENDGAME_STORY_MEANINGS.secretRealm,clue:'地図にない異界は、境界網から切り離された小さな世界片として座標を保っている。'}),
  nemesis:Object.freeze({label:'宿敵',meaning:ENDGAME_STORY_MEANINGS.nemesis,clue:'宿敵は敗北の瞬間を境界残響として読み取り、こちらの戦い方そのものを学習している。'}),
  uniqueTrial:Object.freeze({label:'Unique試練',meaning:ENDGAME_STORY_MEANINGS.uniqueTrial,clue:'装備に刻まれた試練は、前所有者や製作者の条件記録をThe Veil越しに再生している。'}),
  raid:Object.freeze({label:'RAID',meaning:ENDGAME_STORY_MEANINGS.raid,clue:'これは同じ敵の再戦ではない。境界網が別位相の存在状態を再観測している。'}),
  machineWorld:Object.freeze({label:'機界',meaning:ENDGAME_STORY_MEANINGS.machineWorld,clue:'機界は世界の創造主ではない。The Veilを記録・選別する管理層の一つに過ぎない。'}),
  artifact:Object.freeze({label:'秘宝',meaning:'古い戦いや地域に残された効果記録が物質へ定着したもの。',clue:'秘宝の力には、失われた時代の戦闘条件が記録のように残っている。'}),
  relic:Object.freeze({label:'Relic',meaning:'深淵や隣接世界から残った世界法則の断片。装備ではなく、戦いの規則そのものへ干渉する。',clue:'Relicの力は魔力だけではない。別世界で成立していた法則の断片が、この世界へ定着している。'}),
  anomaly:Object.freeze({label:'境界異常',meaning:'通常の七鍵体系で分類できない外部信号・接続痕跡。',clue:'規則的な光と機械音は自然現象ではない。七鍵の登録先に存在しない座標から届いている。'}),
});

export const ABYSS_MYSTERY_MILESTONES=Object.freeze([1,100,500,1000,2000,3000]);

export function worldMysterySystem(id){return WORLD_MYSTERY_SYSTEMS[id]||null;}
export function worldMysteryClue(id){return worldMysterySystem(id)?.clue||null;}

export function abyssMysteryClue(depth=1){
  const d=Math.max(1,Math.floor(Number(depth)||1));
  if(d>=2000)return '深部では天・冥・機界とも異なる法則が同時に残る。The Veilの破損は一世界だけの事故ではない。';
  if(d>=1000)return '時間の流れが一方向ではない。深淵は世界の残滓だけでなく、異なる時点まで重ねている。';
  if(d>=500)return '壁面の残響に、異なる空・海・都市の像が同時に映る。複数世界の残滓が混線している。';
  if(d>=100)return '深淵の地形は地下へ続いていない。降りるほど空間の接続先そのものが変化している。';
  return WORLD_MYSTERY_SYSTEMS.abyss.clue;
}

function machineWorldMysteryClue(stage){
  const teaser=modernWorldTeaseForStage(stage);
  if(teaser){
    if(stage?.machineWorldSecretBoss)return `外部観測層は機界にも観測番号を付けていた。管理者もまた観測される側だった。${teaser.clue}`;
    return teaser.clue;
  }
  const district=Math.max(1,Math.floor(Number(stage?.machineWorldDistrict)||1));
  if(stage?.machineWorldSecretBoss||district>=3)return '外部観測層の記録は、機界そのものにも観測番号を付けている。管理者もまた、誰かに観測される側だった。';
  if(district>=2)return '管理記録に「実験層」という語が現れる。人界だけでなく複数世界が比較対象として並んでいる。';
  return WORLD_MYSTERY_SYSTEMS.machineWorld.clue;
}

export function worldMysteryClueForStage(stage){
  if(!stage)return null;
  if(stage.raid)return WORLD_MYSTERY_SYSTEMS.raid.clue;
  if(stage.machineWorld)return machineWorldMysteryClue(stage);
  if(stage.phase9EighthKey)return '第八鍵は七鍵の延長ではない。既知のThe Veil管理系から外れた座標へ接続している。';
  if(stage.keyDungeon){
    if(stage.world2KeyType==='anomaly'){
      const teaser=modernWorldTeaseForStage(stage);
      return teaser?`${WORLD_MYSTERY_SYSTEMS.anomaly.clue}${teaser.clue}`:WORLD_MYSTERY_SYSTEMS.anomaly.clue;
    }
    return WORLD_MYSTERY_SYSTEMS.keyDungeon.clue;
  }
  if(stage.secretRealm)return WORLD_MYSTERY_SYSTEMS.secretRealm.clue;
  if(stage.isAbyss){
    const depth=Math.max(1,Math.floor(Number(stage.abyssDepth)||1));
    return ABYSS_MYSTERY_MILESTONES.includes(depth)?abyssMysteryClue(depth):null;
  }
  return null;
}

export function worldMysterySummary(){
  return Object.entries(WORLD_MYSTERY_SYSTEMS).map(([id,x])=>({id,label:x.label,clue:x.clue}));
}
