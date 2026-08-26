/* ============================================================
   Story Expansion I — Ch26–29 Story Integration
   ------------------------------------------------------------
   Fourth act: Eighth Key / external observation approach.
   Narrative-only data. No rewards, combat values, save roots or gates.
   ============================================================ */

const ARC_LABEL='第四部：逆観測';

const CHAPTER_STORY=Object.freeze({
  26:Object.freeze({
    title:'零外接続域',
    objective:'境界王座の裏で起動した規格外鍵路を追い、第八鍵の接続元を探る。',
    opening:'王座核から伸びた鍵路は、七鍵のどの規格にも一致しない。門の先ではなく、こちら側の座標だけが欠けている。',
    discovery:'中継記録には第八鍵を「追加鍵」ではなく“例外接続”として扱う記述が残る。誰かが管理系の外から経路を差し込んだらしい。',
    mid:'鍵外執行官ノルムは侵入を止めているのではない。規格外接続が再び応答しないよう、受信側を破壊し続けている。',
    bossIntro:'例外管理者エクシオンは「鍵は内から開かれたのではない」と告げ、接続元から今も弱い照合信号が届いていることを認める。',
    clear:'外信号受信核が復旧し、境界のさらに外側から一定周期の信号が届く。発信者も目的も不明のまま、次の受信帯が開いた。',
  }),
  27:Object.freeze({
    title:'遠信残響帯',
    objective:'外側から届く信号の残響を追い、発信元に生活圏が存在するのか確かめる。',
    opening:'信号は言葉にならない。それでも一定の間隔を持ち、自然現象には見えない反復を続けている。',
    discovery:'断層の向こうに規則正しい光の列と高く細い影が重なる。遠くでは金属が周期的に走るような振動が響く。',
    mid:'遠信解析塔は信号を翻訳していない。音、光、時間らしき並びを、そのまま境界記録へ写し取っていた。',
    bossIntro:'遠信王レゾナードの周囲に薄い発光面が瞬く。そこには日付にも座標にも見える数字列と、読めそうで読めない字形が流れる。',
    clear:'信号の向こうに人工的な生活圏がある可能性は高まった。しかし接続先の名称は一度も記録されていない。機界側の監査記録だけが次の照合先を示す。',
  }),
  28:Object.freeze({
    title:'機界監査層',
    objective:'機界の外部監査記録を開き、MOTHERとARCHITECTが何を管理していたのか確かめる。',
    opening:'機界の最深部に、管理者自身が入れない監査層がある。MOTHERの権限もARCHITECTの設計署名も、ここでは閲覧対象に過ぎない。',
    discovery:'監査記録はMOTHERを運用管理系、ARCHITECTを設計・修復系として分類している。どちらにも世界創造権限は付与されていない。',
    mid:'さらに古い記録には、機界の判断、境界切断、世界層の再構築結果を“外部観測先へ報告”した履歴が残る。管理者もまた見られていた。',
    bossIntro:'上位監査体オーディタは、こちらを異常ではなく「未照合の観測対象」と呼ぶ。照準先にはBlade Valeと同時に、名のない外側座標が重ねられている。',
    clear:'機界は最上位ではなかった。境界網を管理する機構であり、その機構自体を評価する観測経路が外側へ続いている。逆観測門の座標が解放された。',
  }),
  29:Object.freeze({
    title:'逆観測門',
    objective:'内側と外側の観測線が交差する門へ進み、第八鍵が何のために差し込まれたのか突き止める。',
    opening:'門は外を見るためだけのものではない。向こうからこちらを見る線と、こちらから向こうを見る線が同じ焦点へ集まっている。',
    discovery:'第八接続室の記録では、七鍵は世界層を管理するための制御系、第八鍵はその制御系を迂回する“外部接続点”として区別されている。',
    mid:'第八鍵照合官オクタは接続先の名前を知らない。ただ「外側の観測主体が応答した時だけ門を開く」という命令を守っている。',
    bossIntro:'接続監守パラドクスの背後で門が反転する。こちらが覗いているはずの窓の向こうで、何かがこちらへ焦点を合わせ返した。',
    clear:'第八鍵は七鍵の続きではない。外側から境界網へ差し込まれた接続点だった。門の先はまだ閉じているが、接続元から一度だけ明確な応答が返る。',
  }),
});

function stageBeat(chapterNumber,stage,mainIndex,mainCount){
  const story=CHAPTER_STORY[chapterNumber];
  if(!story||!stage||stage.branch||stage.bounty||mainIndex<0)return null;
  const last=mainIndex===mainCount-1;
  const beat={act:ARC_LABEL,objective:story.objective};
  if(mainIndex===0)beat.opening=story.opening;
  if(mainIndex===2)beat.discovery=story.discovery;
  if(stage.midBoss||mainIndex===3)beat.discovery=story.mid;
  if(stage.boss||last){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}

export function reverseObservationStoryBeatForStage(chapterNumber,stage,mainIndex,mainCount){
  return stageBeat(Number(chapterNumber),stage,mainIndex,mainCount);
}

export function reverseObservationChapterStory(chapterNumber){return CHAPTER_STORY[Number(chapterNumber)]||null;}
export const REVERSE_OBSERVATION_STORY=CHAPTER_STORY;
