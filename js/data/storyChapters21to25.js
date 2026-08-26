/* ============================================================
   Phase 11.5 — Ch21–25 Story Integration
   ------------------------------------------------------------
   Third act: after the Veil breach, the player crosses the outer regions
   and follows the boundary network toward the Eighth Key / Machine World.
   Narrative-only data: no rewards, enemy stats, unlocks or save fields.
   ============================================================ */

const ARC_LABEL='第三部：外縁世界';

const CHAPTER_STORY=Object.freeze({
  21:Object.freeze({
    title:'灰燼の外縁',
    objective:'The Veilの裂け目を越え、最初の外縁世界に残る古い境界路を追う。',
    opening:'裂け目の向こうは虚無ではなかった。灰に覆われた国境と、こちらの世界より古い道路が続いている。',
    discovery:'灰の下の道路標には、七鍵と同じ配置規則が刻まれている。外縁世界も同じ境界網に属していた。',
    mid:'灰鎧将グレイヴは、街を守るのではなく境界路そのものを封鎖している。',
    bossIntro:'灰燼侯ヴァルカンは「内側の世界は再び開いた」と告げ、こちらを侵入者ではなく“帰還者”と呼ぶ。',
    clear:'灰都の炉心から、次の外縁座標へ続く観測路が復旧した。The Veilの外側にも文明圏が連なっている。',
  }),
  22:Object.freeze({
    title:'玻璃凍原',
    objective:'凍結した観測記録を解凍し、境界網が何度再構築されたのかを調べる。',
    opening:'玻璃の大地には、景色だけでなく時間の断片まで凍りついている。',
    discovery:'氷中記録には同じ世界座標の生成・崩壊・再接続が複数回記録されている。Blade Valeは一度だけ作られた世界ではない。',
    mid:'氷鏡騎士セレスの装甲には、失敗した世界層の番号が削り消されている。',
    bossIntro:'零王クリスタリアは「記録を解けば、次は空の墓標が応答する」と静かに告げる。',
    clear:'零度王宮の記録晶から、外縁世界が“保存”ではなく“選別”の対象だった可能性が浮かぶ。',
  }),
  23:Object.freeze({
    title:'天雷墓標群',
    objective:'古代防衛網の照準先を追い、外界から何が侵入していたのか確かめる。',
    opening:'空に並ぶ墓標へ、一定周期で雷が走る。落雷ではない。巨大な迎撃網だ。',
    discovery:'雷撃座標は地上ではなく境界の外側を指している。かつて何かが世界間を移動し、ここで撃墜されていた。',
    mid:'雷墓将ヴォルトは、敵を見ずに古い照準命令だけを守り続けている。',
    bossIntro:'天葬王インドラグの背後で、七本の雷路とは別に一つだけ未登録の導線が点灯する。',
    clear:'落雷座標片を重ねると、既知の七鍵から外れた“第八の接続”が初めて輪郭を持つ。',
  }),
  24:Object.freeze({
    title:'虚花の庭園',
    objective:'世界の傷口を覆う人工庭園から、失われた接続記憶を回収する。',
    opening:'花は傷を隠すために咲いている。根は土ではなく、境界の裂け目へ伸びていた。',
    discovery:'根脈には住人の記憶だけでなく、閉鎖された世界への接続履歴が蓄積されている。誰かが意図的に経路を忘れさせた。',
    mid:'園守ベラドンナは記憶を守るためではなく、外へ漏らさないために刈り取りを続けている。',
    bossIntro:'虚花妃エルシアは「王座へ行けば、忘れさせた者の記録がある」と告げ、最後の根路を開く。',
    clear:'禁花の種子に残った座標が境界王座と一致する。第八鍵は王座中枢で意図的に記録から外されたらしい。',
  }),
  25:Object.freeze({
    title:'境界王座',
    objective:'外縁世界を束ねる観測中枢へ到達し、第八鍵が隠された理由を突き止める。',
    opening:'王座は城ではない。七鍵の接続状況を監視し、世界層を切り離すための観測中枢だった。',
    discovery:'記録上、Blade Valeは“閉じた世界”ではなく境界網に接続された一ノードとして扱われている。',
    mid:'第零観測者は王を守っているのではない。王座から外部へ送られる観測記録を守っている。',
    bossIntro:'境界王アルケオンは「第八鍵は門ではない。管理系の外へ出るための例外だ」と明かす。',
    clear:'王座核の奥で七鍵とは異なる規格の鍵路が起動した。行き先の記録名は欠落している。ただ一語、“機界”だけが残る。',
  }),
});

function stageBeat(chapterNumber,stage,mainIndex,mainCount){
  const story=CHAPTER_STORY[chapterNumber];
  if(!story||!stage)return null;
  const last=mainIndex===mainCount-1;
  const beat={act:ARC_LABEL,objective:story.objective};
  if(mainIndex===0)beat.opening=story.opening;
  if(mainIndex===2)beat.discovery=story.discovery;
  if(stage.midBoss||mainIndex===3)beat.discovery=story.mid;
  if(stage.boss||last){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}

export function outerWorldStoryBeatForStage(chapterNumber,stage,mainIndex,mainCount){
  return stageBeat(Number(chapterNumber),stage,mainIndex,mainCount);
}

export function outerWorldChapterStory(chapterNumber){return CHAPTER_STORY[Number(chapterNumber)]||null;}
export const OUTER_WORLD_STORY=CHAPTER_STORY;
