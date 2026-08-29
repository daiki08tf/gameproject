/* Settlement 3.0 S16 — Arena & Training Grounds definitions. */
export const SETTLEMENT_ARENA_MODES=Object.freeze([
 {id:'spar',name:'模擬戦',icon:'⚔️',description:'基礎Bossを相手に現在ビルドの動きを確認する。',sourceRank:0,kind:'bossReplay'},
 {id:'bossReplay',name:'Boss再現',icon:'👑',description:'中盤Bossを再現し、予兆・Phase移行への対応を確認する。',sourceRank:.5,kind:'bossReplay'},
 {id:'apexReplay',name:'高難度再現',icon:'🔥',description:'到達済み終盤Bossを基準に、本番前のビルド確認を行う。',sourceRank:1,kind:'bossReplay'},
 {id:'gauntlet',name:'連戦訓練',icon:'🏟️',description:'複数Bossを連続で相手にし、継戦力とCompanion AIを確認する。',sourceRank:1,kind:'gauntlet'},
]);

export const SETTLEMENT_ARENA_RULES=Object.freeze([
 {id:'standard',name:'標準',description:'本番と同じ戦闘ルール。報酬だけ無効。'},
 {id:'noFlee',name:'退路封鎖',description:'逃走不可で戦い切る制限戦。',noFlee:true},
 {id:'soloCheck',name:'単独確認',description:'Companionを外して確認するための案内用ルール。編成自体は既存Companion画面で変更する。'},
]);
