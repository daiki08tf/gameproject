/* Content Pack III A — post-Ch30 observation reflux clusters. */

export const CP3_RUMORS=Object.freeze([
  {id:'moving-burnt-shadow',chapter:21,stageId:'21-8',name:'動き続ける焼影',text:'灰燼の外縁で、持ち主が去った後も数秒遅れて動き続ける焦げ跡が見つかったという。',tracking:'影は太陽ではなく、外部観測核から戻った信号の周期に合わせて姿勢を変えている。'},
  {id:'ash-reply-mark',chapter:21,stageId:'21-8',name:'灰に刻まれた返信印',text:'古い防衛炉の灰面に、誰も刻んでいない細い矩形の光跡が残る夜がある。',tracking:'矩形は文字ではなく、こちらの観測開始と終了にだけ反応して点滅している。'},
  {id:'returning-thunder',chapter:23,stageId:'23-8',name:'戻ってくる落雷',text:'天雷墓標群で地上へ落ちた雷が、同じ経路を逆向きに空へ戻ったという。',tracking:'防衛網は侵入物ではなく、外側へ抜けようとする信号にも照準を合わせ始めた。'},
  {id:'ninth-target-line',chapter:23,stageId:'23-8',name:'第九照準線',text:'七方向でも第八接続でもない照準線が、墓標群の一部だけに一瞬現れる。',tracking:'新しい線は座標を指さず、「観測中の対象」そのものを追尾している。'},
  {id:'foreign-memory-bloom',chapter:24,stageId:'24-8',name:'知らない生活を咲かせる花',text:'虚花の庭園で、誰の記憶にもない足音や扉の音を再生する花が咲いたらしい。',tracking:'花が保持する音には、規則的な金属振動と短い電子音が混ざっている。'},
  {id:'root-reply',chapter:24,stageId:'24-8',name:'根脈からの返答',text:'根脈記憶庫へ問いかけると、保存された記憶ではなく未知の生活圏から音が返ることがある。',tracking:'根は外部世界そのものではなく、Ch30で開いた双方向観測の残響を記憶として蓄え始めている。'},
]);

export const CP3_HIDDEN_ENCOUNTERS=Object.freeze({
  '21-8':{rumorId:'moving-burnt-shadow',enemyId:'cp3_afterimage_warden',sourceEnemyId:'ch21_fast',name:'残照追跡体・AFTERIMAGE',chance:.018,routeId:'cp3-route-ash-reply'},
  '23-8':{rumorId:'returning-thunder',enemyId:'cp3_return_bolt',sourceEnemyId:'ch23_fast',name:'帰還雷標・BACKTRACE',chance:.015,routeId:'cp3-route-ninth-line'},
  '24-8':{rumorId:'foreign-memory-bloom',enemyId:'cp3_memory_bloom',sourceEnemyId:'ch24_fast',name:'外記憶花・OFFWORLD BLOOM',chance:.012,routeId:'cp3-route-root-reply'},
});

export const CP3_HIDDEN_ROUTES=Object.freeze({
  'cp3-route-ash-reply':{name:'返信炉床',chapter:21,clue:'動き続ける焼影は、停止した防衛炉の床下へ戻っていく。灰の下には外部信号を受けた後だけ開く細い保守路がある。',rewardHint:'観測逆流Lore / 防御系Unique手掛かり'},
  'cp3-route-ninth-line':{name:'第九照準廊',chapter:23,clue:'逆流した雷を追うと、墓標の照準線が空ではなく境界層の内側へ折れ曲がる。',rewardHint:'雷・速度系Rare / Secret Chain手掛かり'},
  'cp3-route-root-reply':{name:'異記憶根室',chapter:24,clue:'外記憶花の根は既存の記憶庫を避け、世界樹の空洞よりさらに外側へ細い根を伸ばしている。',rewardHint:'Companion / 外部生活圏Lore手掛かり'},
});

export function cp3RumorState({rumor,discoveries={},storyComplete=false,isStageCleared=()=>false}={}){
  if(!rumor||!storyComplete)return'unresolved';
  if(discoveries[`cp3:encounter:${rumor.id}`])return'resolved';
  if(isStageCleared(rumor.stageId))return'tracking';
  return'unresolved';
}

export function cp3EncounterChance({baseChance=0,rumorState='unresolved',codexKnown=false}={}){
  if(rumorState!=='tracking')return 0;
  return Math.min(.04,baseChance*(codexKnown?1.08:1));
}
