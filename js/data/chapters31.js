/* Story Expansion II — Ch31 / 返答の文法 */
export const CHAPTER_EXPANSION_31 = Object.freeze([
  Object.freeze({
    num:31,id:'ch31',name:'応答文法層',expanded:true,recLevel:[7600,8200],weaponType:'instrument',
    stageNames:['反復受信路','三拍照合廊','再送境界帯','応答状態機構','欠落間隔庫','確認位相橋','未完了同期核前'],
    enemies:{normal:'応答走査体',fast:'再送跳躍獣',tank:'確認隔壁機',boss:'未完了同期機構グラマ'},
    midboss:{enemyName:'再試行監査官リトライ'},
    items:{
      weapon:'応答律器',shield:'確認位相盾',head:'三拍照合冠',body:'再送観測衣',accessory:'応答状態環',accessoryArchetype:'spd',
      weaponEpic:'再試律器リトライ',named:{name:'同期機構の未完了律',slot:'weapon',effect:'haste'},named2:{name:'欠落間隔の観測衣',slot:'body',effect:'counter'},
    },
    branch:{enemyName:'二度返る受信者',itemName:'送信元なき第二応答'},
    lore:'Ch30で成立した双方向応答を解析する観測層。返答は言葉ではなく、受理・再試行・確認に似た状態遷移を一定間隔で繰り返す。まれに同一応答が二度記録されるが、片方には有効な送信元が存在しない。',
  }),
]);

export const CHAPTER_EXPANSION_REGION_TAGS_31 = Object.freeze({
  ch31:['lightning','wind'],
});