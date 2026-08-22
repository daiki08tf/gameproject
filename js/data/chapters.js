/* ============================================================
   第2章〜第10章 メタデータ
   （第1章 はじまりの平原 は既存データをそのまま使用、変更なし）

   このファイルの内容をもとに、equipment.js / enemies.js / stages.js が
   それぞれ装備・敵・ステージのデータを自動生成する。
   ============================================================ */

// 章倍率：同じ「レア」でも章が進むほど基礎値が底上げされる
export function chapterMult(num) {
  return 1 + (num - 1) * 0.35;
}

export const CHAPTER_SPECS = [
  {
    num: 2, id: 'ch2', name: '深緑の森', recLevel: [8, 14],
    weaponType: 'dagger',
    enemies: { normal: '森狼', fast: '毒胞子の精', tank: '苔むした大猪', boss: '森の大樹霊' },
    items: {
      weapon: '銀狼の牙', shield: '樹皮の盾', head: '森人の帽子', body: '木の葉の胴着',
      accessory: '疾風の羽根飾り', accessoryArchetype: 'spd',
      weaponEpic: '大樹の牙',
      named: { name: '狼王の逆咬み', slot: 'weapon', effect: 'counter' },
    },
    branch: { enemyName: '古狼の頭目', itemName: '深緑の護符' },
  },
  {
    num: 3, id: 'ch3', name: '忘れられた遺跡', recLevel: [14, 20],
    weaponType: 'staff',
    enemies: { normal: '亡者の兵', fast: '朽ちた影', tank: '石像兵', boss: '古代守護者ゴーレム' },
    items: {
      weapon: '亡者の杖', shield: '石棺の盾', head: '古の記憶の冠', body: '遺跡守りの衣',
      accessory: '賢者の残光石', accessoryArchetype: 'mag',
      weaponEpic: '守護者の杖',
      named: { name: 'ゴーレムの核石', slot: 'accessory', effect: 'awaken' },
    },
    branch: { enemyName: '朽ちた騎士長', itemName: '守護の指輪' },
  },
  {
    num: 4, id: 'ch4', name: '凍てつく霊峰', recLevel: [20, 27],
    weaponType: 'bow',
    enemies: { normal: '氷狼', fast: '氷精', tank: 'イエティ', boss: 'フロストドラゴン' },
    items: {
      weapon: '氷結の弓', shield: '氷壁の盾', head: '雪原の頭巾', body: '白銀の毛皮衣',
      accessory: '凍らぬ心臓のお守り', accessoryArchetype: 'def',
      weaponEpic: '竜氷の弓',
      named: { name: 'フロストドラゴンの牙', slot: 'weapon', effect: 'haste' },
    },
    branch: { enemyName: '氷狼の王', itemName: '氷結の護符' },
  },
  {
    num: 5, id: 'ch5', name: '灼熱の火山', recLevel: [27, 34],
    weaponType: 'axe',
    enemies: { normal: '火山トカゲ', fast: '飛び火の精', tank: '溶岩ゴーレム', boss: '炎帝ドレイク' },
    items: {
      weapon: '溶岩断ちの斧', shield: '熔鉄の盾', head: '灼熱の兜', body: '炎耐性の鎧',
      accessory: '業火のブローチ', accessoryArchetype: 'atk',
      weaponEpic: '炎帝の斧',
      named: { name: 'サラマンダーの鱗', slot: 'body', effect: 'burn' },
    },
    branch: { enemyName: '炎トカゲの長', itemName: '灼熱の指輪' },
  },
  {
    num: 6, id: 'ch6', name: '底なし沼地', recLevel: [34, 41],
    weaponType: 'knuckle',
    enemies: { normal: '沼の魔物', fast: '毒霧の妖', tank: '巨大蛙', boss: '沼の女王' },
    items: {
      weapon: '毒沼の拳甲', shield: '泥濘の盾', head: '沼霧のフード', body: '蛙皮の胴着',
      accessory: '跳躍のブーツ飾り', accessoryArchetype: 'spd',
      weaponEpic: '女王の拳甲',
      named: { name: '女王の毒牙', slot: 'weapon', effect: 'lifesteal' },
    },
    branch: { enemyName: '沼の主', itemName: '沼霧の指輪' },
  },
  {
    num: 7, id: 'ch7', name: '天空の遺跡都市', recLevel: [41, 48],
    weaponType: 'instrument',
    enemies: { normal: '風の遊精', fast: '飛竜の子', tank: 'グリフォン', boss: '天空の門番' },
    items: {
      weapon: '風唄の竪琴', shield: '天空の盾', head: '風精の羽冠', body: 'グリフォンの羽衣',
      accessory: '浮遊石のペンダント', accessoryArchetype: 'mag',
      weaponEpic: '天翔ける竪琴',
      named: { name: 'グリフォンの風切羽', slot: 'accessory', effect: 'haste' },
    },
    branch: { enemyName: 'グリフォンの長', itemName: '天翔の護符' },
  },
  {
    num: 8, id: 'ch8', name: '深淵の魔界', recLevel: [48, 56],
    weaponType: 'rod',
    enemies: { normal: '悪魔兵', fast: '影の使い魔', tank: '堕天使', boss: '堕天の大公爵' },
    items: {
      weapon: '堕天の錫杖', shield: '魔界の盾', head: '悪魔の角冠', body: '堕天使の鎧',
      accessory: '呪われた紋章', accessoryArchetype: 'atk',
      weaponEpic: '大公爵の錫杖',
      named: { name: '堕天使の羽根', slot: 'body', effect: 'lifesteal' },
    },
    branch: { enemyName: '悪魔兵長', itemName: '深淵の指輪' },
  },
  {
    num: 9, id: 'ch9', name: '虚無の狭間', recLevel: [56, 65],
    weaponType: 'sword',
    enemies: { normal: '虚無の亡霊', fast: '鏡合わせの影', tank: '時空の怪物', boss: '虚無の番人' },
    items: {
      weapon: '虚無断ちの剣', shield: '鏡界の盾', head: '時空歪みの冠', body: '虚無纏いの衣',
      accessory: '因果律のお守り', accessoryArchetype: 'def',
      weaponEpic: '番人の大剣',
      named: { name: '虚空の瞳', slot: 'accessory', effect: 'awaken' },
    },
    branch: { enemyName: '虚無の影主', itemName: '虚空の護符' },
  },
  {
    num: 10, id: 'ch10', name: '勇者の試練', recLevel: [65, 80], final: true,
    weaponType: 'sword',
    enemies: { normal: '歴戦の魔物', fast: '闇の刺客', tank: '闇の騎士', boss: '真・魔王' },
    items: {
      weapon: '勇者の剣', shield: '勇者の盾', head: '勇者の冠', body: '勇者の鎧',
      accessory: '勇者の紋章', accessoryArchetype: 'atk',
      weaponEpic: '破滅の使者',
      named: { name: '魔王の心臓', slot: 'accessory', effect: 'awaken' },
      named2: { name: '不死鳥の羽', slot: 'body', effect: 'lifesteal' },
    },
    branch: { enemyName: '闇の騎士長', itemName: '勇者候補の証' },
  },
];

// アクセサリー特化タイプ（属性ごとのステータス配分）
export const ACCESSORY_ARCHETYPES = {
  atk: { atk: 1.0, crit: 0.5 },
  mag: { mag: 1.0, mp: 0.5 },
  spd: { spd: 1.0, crit: 0.8 },
  def: { def: 1.0, hp: 1.2 },
};

// 特殊効果の定義（固有ネームド装備用）
export const EFFECTS = {
  burn: { name: '灼熱の一撃', trigger: 'onHit', chance: 0.25, kind: 'burnDamage', power: 0.3,
    desc: '通常攻撃時25%でATKの30%の追加炎ダメージ' },
  lifesteal: { name: '吸血の加護', trigger: 'onHit', chance: 1.0, kind: 'lifesteal', power: 0.08,
    desc: '与えたダメージの8%をHP回復' },
  counter: { name: '反撃の魂', trigger: 'onHurt', chance: 0.3, kind: 'counter', power: 0.5,
    desc: '被弾時30%でATKの50%の反撃ダメージ' },
  haste: { name: '疾風の加速', trigger: 'onHurt', chance: 1.0, kind: 'haste', power: 0.3, duration: 3,
    desc: '被弾時3秒間SPD+30%' },
  awaken: { name: '覚醒の力', trigger: 'passive', threshold: 0.3, kind: 'damageBoost', power: 0.2,
    desc: 'HPが30%以下の間ATK+20%' },
};
