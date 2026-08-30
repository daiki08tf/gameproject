/* Enemy 2.0 E4 — Ch1–35 regional enemy expansion.
   Adds four ordinary roles + one Rare identity per story region.
   Existing normal/fast/tank remain authoritative and fixed waves are untouched. */

export const REGIONAL_ENEMY_ROLES = Object.freeze(['attacker','caster','trickster','support','rare']);

const entry=(attacker,caster,trickster,support,rare)=>Object.freeze({
  attacker:Object.freeze({name:attacker,role:'attacker',behaviorTags:['pressure','burst']}),
  caster:Object.freeze({name:caster,role:'caster',behaviorTags:['ranged','magic']}),
  trickster:Object.freeze({name:trickster,role:'trickster',behaviorTags:['disrupt','tempo']}),
  support:Object.freeze({name:support,role:'support',behaviorTags:['support','formation']}),
  rare:Object.freeze({name:rare,role:'rare',behaviorTags:['rare','threat'],rare:true}),
});

export const REGIONAL_ENEMY_EXPANSION = Object.freeze({
  ch1:entry('荒野の牙兵','草原の呪術師','跳ね回る悪童','ゴブリン鼓舞兵','黄金スライム'),
  ch2:entry('裂牙の森狼','深緑の樹術師','幻惑キノコ','森護りの祭司','白角の古狼'),
  ch3:entry('遺跡の処刑兵','墓碑術師','罠守りの影','古代修復機','王墓のミミック'),
  ch4:entry('雪崩れ牙獣','氷晶術師','白霧の妖狐','雪峰の祈祷師','銀冠イエティ'),
  ch5:entry('灼牙サラマンダー','火口の炎術師','爆ぜ火の小鬼','溶岩の鍛冶司祭','金炎スライム'),
  ch6:entry('泥喰い大蜥蜴','瘴気の沼術師','眠り蛙','湿地の祈祷婆','虹毒ヒュドラ幼体'),
  ch7:entry('裂空グリフォン','天空の風術師','幻風インプ','浮島の楽士','虹翼ペガサス'),
  ch8:entry('魔界の断罪兵','奈落の黒術師','呪影インプ','堕界の司祭','紅角デーモン'),
  ch9:entry('虚空裂き','因果の魔導影','転位する悪戯影','時空の観測僧','境界ミミック'),
  ch10:entry('魔王軍破城兵','終焉の魔導師','闇渡りの道化','魔王軍軍師','黒金キングスライム'),
  ch11:entry('葬火の狂戦士','灰燼呪術師','煤影の密偵','灰冠従軍司祭','灰王墓の亡将'),
  ch12:entry('雷爪の猛獣','天雷術師','瞬光の小妖','雲上の奏祈師','金雷鳥'),
  ch13:entry('晶砕きの獣','蒼晶魔導師','反射晶の幻獣','共鳴晶の司祭','七色晶スライム'),
  ch14:entry('腐牙の大獣','毒樹術師','胞子道化','根脈の養生師','千年毒花'),
  ch15:entry('破城機兵','演算砲台','妨害ドローン','修復支援機','試作殲滅機Σ'),
  ch16:entry('深潮の獣兵','海淵術師','泡沫の幻妖','潮祈りの司祭','真珠殻クラーケン幼体'),
  ch17:entry('白耀執行騎士','禁典詠唱者','聖光の偽証者','白夜の聖歌隊','無冠の聖獣'),
  ch18:entry('星骸捕食獣','墜星術士','重力歪み体','星間共鳴体','虹核メテオスライム'),
  ch19:entry('境界断裂獣','時界術師','逆行する影','鏡界調律者','月蝕の無名獣'),
  ch20:entry('始原の破壊眷属','原初術師','深淵の囁き手','封印維持者','名持たぬ原初獣'),
  ch21:entry('灰原の虐殺兵','煤煙呪術師','燐火の盗火鬼','灰葬の従軍僧','白炎の灰獣'),
  ch22:entry('凍玻璃の砕兵','零晶術師','鏡氷の幻獣','永久凍結技師','透明竜の幼体'),
  ch23:entry('雷墓突撃兵','天雷導師','雷光ジャマー','墓標整備僧','紫電の雷獣王'),
  ch24:entry('虚花の狩猟獣','毒蜜術師','夢惑いの花精','根脈培養師','七彩虚花蝶'),
  ch25:entry('境界破砕体','零界演算術師','位相撹乱体','七鍵補助機','零号境界獣'),
  ch26:entry('例外破砕体','零外演算師','座標逸脱体','接続補助端末','未登録個体EX'),
  ch27:entry('残響捕食獣','遠信共鳴師','走査ノイズ体','信号増幅端末','白色雑音獣'),
  ch28:entry('監査強襲機','査定演算砲','権限撹乱端末','監査補助機','未承認監査体X'),
  ch29:entry('逆焦点狩猟体','外挿術師','視差撹乱獣','二重観測補助体','逆位相ミミック'),
  ch30:entry('外部応答破砕体','同期演算師','未知文字撹乱体','双方向補助端末','返信を持つ観測獣'),
  ch31:entry('三拍破砕体','照合演算師','再送撹乱体','確認補助端末','送信元なき応答獣'),
  ch32:entry('例外鍵破砕体','対向演算師','裏面撹乱体','第二署名補助端末','鏡写しの鍵獣'),
  ch33:entry('空白破砕体','残響読取師','一拍撹乱体','生体記憶補助端末','記録外の残響獣'),
  ch34:entry('参照線破砕体','外部配列術師','座標ずらし体','共通枠補助端末','地図外の標識獣'),
  ch35:entry('共観測破砕体','同期照合術師','焦点分離体','二域安定補助端末','二重輪郭残響獣'),
});

export function regionalEnemySet(chapterId){return REGIONAL_ENEMY_EXPANSION[chapterId]||null;}
