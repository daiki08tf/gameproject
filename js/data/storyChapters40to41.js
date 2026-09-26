/* Story Expansion IV — Ch40–41 / Arc VII 重層帯
   Ch39の単一化機構を越えた先で、真が二つに留まらない層と
   分岐の芽が管理される圃を辿る。分岐の起源は明かさない。 */
export const STORY_EXPANSION_IV_40_41 = Object.freeze({
  40:Object.freeze({
    chapter:40,
    act:'第七部・重層帯 進入節',
    objective:'単一化中枢ユニタスを畳み込みから解放した先で、保持される記録が二つに留まらない「重層帯」の実態を確認する。',
    opening:'分岐核の先、壁の向こうから届く音が一つではない。三つ、四つ——数えきれない履歴が、同じ厚みの中で同時に鳴っている。',
    discovery:'ここの記録は「どちらか片方」ではなく「重ねたまま」保持されている。同じ人物が三度違う選択をして、三つともここでは真として残っている。',
    mid:'三系統調停官トライアドは、重なり合う記録のうち一つだけを手前へ引き出そうとする。選別ではなく「参照の偏り」を仕掛けてくる。',
    stabilization:'帯の壁は薄く、隣の履歴の残響が時折こちらへ漏れる。漏れた記録は消えず、こちらの層へ積もってゆく。',
    contradiction:'重層帯の記録は畳み込まれない。誰かが「重ねたまま運ぶ」ことを目的として、この帯を設えている。',
    bossIntro:'多重畳み込み機構プルーラルは、層に踏み込んだ者を「新しい重なり」として畳み込もうとする。排除ではなく、収容としての迎撃だ。',
    clear:'プルーラルを退けても帯は止まらない。分岐は数えられ、運ばれ、どこかへ蓄えられている。蓄える先——分岐の芽が集められる場所の気配が、帯の底に見えた。',
  }),
  41:Object.freeze({
    chapter:41,
    act:'第七部・分流圃 踏破節',
    objective:'重層帯の底に開いた「分流圃」——分岐の芽が植えられ、剪定される庭の管理系を確認する。',
    opening:'帯の底に庭があった。整然と並ぶ植え付け床、規則的に摘まれた芽。この分岐は、誰かの手で育てられ、間引かれている。',
    discovery:'芽一つ一つが「起こりえた分岐」だ。摘まれた床には切り口だけが残り、摘まれなかった芽は、こちらの世界の外へ続いている。',
    mid:'圃の巡回者ロウワーは、踏み込んだ者を「圃への侵入」として記録する。敵意ではなく、手順としての対処を始める。',
    stabilization:'圃の記録には植えた者の名がない。あるのは管理の手順だけ——誰が蒔いたかではなく、どう手入れされるかだけが残されている。',
    contradiction:'剪定者セヴァランスは芽を摘む者であって、蒔いた者ではない。この圃は誰かの農場であり、管理者もまた雇われた手入れ役に過ぎない。',
    bossIntro:'分流の剪定者セヴァランスは、芽の切り口を一つずつ検めながら、侵入者を「摘みそこなった芽」として処理にかかる。',
    clear:'セヴァランスを退けると、中央亭の奥に、まだ誰の記録にも載っていない座標へ続く畦が残った。分岐を始めた者がそこに居るのか、それとも更に先の扉なのか——答えは、まだどの記録にもない。',
  }),
});

export function storyExpansionIVBeatForStage(chapterNumber,stage,index,total){
  const story=STORY_EXPANSION_IV_40_41[Number(chapterNumber)];
  if(!story||!stage||stage.branch||stage.bounty)return null;
  const beat={act:story.act,objective:story.objective};
  if(index===0)beat.opening=story.opening;
  if(index===2)beat.discovery=story.discovery;
  if(stage.midBoss||index===3)beat.discovery=story.mid;
  if(index===5)beat.discovery=story.stabilization;
  if(index===6)beat.discovery=story.contradiction;
  if(stage.boss||index===total-1){beat.bossIntro=story.bossIntro;beat.clear=story.clear;}
  return beat;
}
