/* ============================================================
   Rune 2.1 — chapter drops, permanent levels and bounded effects
   ============================================================ */

// Each numbered Story chapter owns exactly one Rune. A Rune is still acquired
// only by the existing post-battle drop roll; clearing a chapter never grants it.
// rune2Owned remains the save-compatible level/mark authority. Once the first
// mark drops, later levels are raised at the Blacksmith with Gold + Manastone.
export const RUNE2_DEFS = [
  { id:'force', name:'剛撃', english:'Force', chapter:1, kind:'statMult', stat:'atk', perMark:.01, maxMarks:100, dropRate:.05 },
  { id:'ironclad', name:'鉄壁', english:'Iron-clad', chapter:2, kind:'statMult', stat:'def', perMark:.01, maxMarks:100, dropRate:.05 },
  { id:'wise', name:'賢者', english:'Wise', chapter:3, kind:'statMult', stat:'mag', perMark:.01, maxMarks:100, dropRate:.05 },
  { id:'notfall', name:'不倒', english:'Not fall', chapter:4, kind:'statMult', stat:'hp', perMark:.01, maxMarks:100, dropRate:.05 },
  { id:'spirit', name:'精神', english:'Spirit', chapter:5, kind:'statMult', stat:'mp', perMark:.01, maxMarks:100, dropRate:.03 },
  { id:'hawkeye', name:'鷹目', english:'Hawk eye', chapter:6, kind:'special', effect:'critChance', perMark:.0002, maxMarks:500, starAt:500, dropRate:.03 },
  { id:'illusion', name:'幻影', english:'Illusion', chapter:7, kind:'special', effect:'bossSpecialMitigation', perMark:.0005, maxMarks:500, starAt:500, dropRate:.025 },
  { id:'bless', name:'祝福', english:'Bless', chapter:8, kind:'special', effect:'roundRegen', perMark:.0002, maxMarks:250, starAt:250, dropRate:.025 },
  { id:'swift', name:'俊足', english:'Swift', chapter:9, kind:'special', effect:'initiative', perMark:.001, maxMarks:500, starAt:500, dropRate:.02 },
  { id:'fists', name:'百烈', english:'Fists', chapter:10, kind:'special', effect:'attackInterval', perMark:.001, maxMarks:500, starAt:500, dropRate:.02 },
  { id:'greed', name:'強欲', english:'Greed', chapter:11, kind:'special', effect:'rarityFloor', maxMarks:300, starAt:300, dropRate:.0125 },
  { id:'gold', name:'黄金', english:'Gold', chapter:12, kind:'special', effect:'goldMult', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.02 },
  { id:'challenge', name:'挑戦', english:'Challenge', chapter:13, kind:'special', effect:'challenge', maxMarks:2000, starAt:2000, dropRate:.01 },
  { id:'observe', name:'観察', english:'Observe', chapter:14, kind:'special', effect:'observe', maxMarks:500, starAt:500, dropRate:.03 },
  { id:'bastion', name:'絶壁', english:'Bastion', chapter:15, kind:'special', effect:'guardMitigation', perMark:.0005, maxMarks:500, starAt:500, dropRate:.006 },
  { id:'bond', name:'縁', english:'Bond', chapter:16, kind:'special', effect:'companionBond', maxMarks:1000, starAt:1000, dropRate:.01 },
  { id:'craft', name:'匠', english:'Craft', chapter:17, kind:'special', effect:'manastoneMult', perMark:.001, maxMarks:500, starAt:500, dropRate:.008 },
  { id:'fate', name:'運命', english:'Fate', chapter:18, kind:'special', effect:'dropChance', perMark:.001, maxMarks:500, starAt:500, dropRate:.0025 },
  { id:'godspeed', name:'神速', english:'Godspeed', chapter:19, kind:'statMult', stat:'spd', perMark:.01, maxMarks:100, dropRate:.05 },
  { id:'critical_eye', name:'会心', english:'Critical Eye', chapter:20, kind:'special', effect:'critChance', perMark:.0002, maxMarks:500, starAt:500, dropRate:.045 },
  { id:'fierce_strike', name:'猛撃', english:'Fierce Strike', chapter:21, kind:'special', effect:'damage', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.03 },
  { id:'critical_edge', name:'会心撃', english:'Critical Edge', chapter:22, kind:'special', effect:'critDamage', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.03 },
  { id:'slayer', name:'討伐', english:'Slayer', chapter:23, kind:'special', effect:'bossDamage', perMark:.0008, maxMarks:625, starAt:625, dropRate:.025 },
  { id:'fortune_find', name:'幸運', english:'Fortune Find', chapter:24, kind:'special', effect:'dropChance', perMark:.001, maxMarks:500, starAt:500, dropRate:.025 },
  { id:'windfoot', name:'韋駄天', english:'Windfoot', chapter:25, kind:'special', effect:'evasion', perMark:.0002, maxMarks:500, starAt:500, dropRate:.02 },
  { id:'piercing', name:'穿甲', english:'Piercing', chapter:26, kind:'special', effect:'armorPen', perMark:.0002, maxMarks:500, starAt:500, dropRate:.02 },
  { id:'insight', name:'知識', english:'Insight', chapter:27, kind:'special', effect:'expMult', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.015 },
  { id:'prosperity', name:'富貴', english:'Prosperity', chapter:28, kind:'special', effect:'goldMult', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.015 },
  { id:'gale', name:'疾風', english:'Gale', chapter:29, kind:'special', effect:'enemySpdDown', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.0125 },
  { id:'regeneration', name:'再生', english:'Regeneration', chapter:30, kind:'special', effect:'roundRegen', perMark:.0002, maxMarks:250, starAt:250, dropRate:.0125 },
  { id:'guardian', name:'守護', english:'Guardian', chapter:31, kind:'special', effect:'incomingMitigation', perMark:.0005, maxMarks:600, starAt:600, dropRate:.01 },
  { id:'break_ward', name:'破陣', english:'Break Ward', chapter:32, kind:'special', effect:'debuffPower', perMark:.001, maxMarks:500, starAt:500, dropRate:.01 },
  { id:'collector', name:'収集', english:'Collector', chapter:33, kind:'special', effect:'weaponReroll', perMark:.001, maxMarks:500, starAt:500, dropRate:.008 },
  { id:'alchemy', name:'錬成', english:'Alchemy', chapter:34, kind:'special', effect:'manastoneMult', perMark:.001, maxMarks:500, starAt:500, dropRate:.008 },
  { id:'purge', name:'破邪', english:'Purge', chapter:35, kind:'special', effect:'tripleMult', perMark:.0003, maxMarks:1000, starAt:1000, dropRate:.004 },
  { id:'branch_point', name:'分岐点', english:'Branch Point', chapter:36, kind:'special', effect:'finalComposite', perMark:.0005, maxMarks:1000, starAt:1000, dropRate:.0025 },
];

const MAP = new Map(RUNE2_DEFS.map((r) => [r.id, r]));
export function getRune2(id) { return MAP.get(id); }

export function chapterNumberForRuneStage(stageId) {
  const match = /^(\d+)-/.exec(String(stageId || ''));
  return match ? Number(match[1]) : null;
}

export function runesForStage(stageId) {
  const chapter = chapterNumberForRuneStage(stageId);
  return chapter == null ? [] : RUNE2_DEFS.filter((r) => r.chapter === chapter);
}

export function runeSourceLabel(rune) { return rune?.chapter ? `第${rune.chapter}章` : '不明'; }

export function effectiveRuneMarks(runeOrId, marks) {
  const rune = typeof runeOrId === 'string' ? getRune2(runeOrId) : runeOrId;
  const owned = Math.max(0, Math.floor(Number(marks) || 0));
  return rune ? Math.min(rune.maxMarks, owned) : 0;
}

export function rune2Power(runeOrId, marks) {
  const rune = typeof runeOrId === 'string' ? getRune2(runeOrId) : runeOrId;
  return rune ? (rune.perMark || 0) * effectiveRuneMarks(rune, marks) : 0;
}

export function rune2ForgeCost(runeOrId, currentMarks, amount = 1) {
  const rune = typeof runeOrId === 'string' ? getRune2(runeOrId) : runeOrId;
  if (!rune) return { levels:0, gold:0, manastone:0 };
  const from = Math.max(0, Math.floor(Number(currentMarks) || 0));
  const to = Math.min(rune.maxMarks, from + Math.max(0, Math.floor(Number(amount) || 0)));
  let gold = 0;
  let manastone = 0;
  for (let level = from; level < to; level++) {
    gold += Math.round(60 * rune.chapter * (1 + level / 50));
    manastone += Math.max(1, Math.ceil(rune.chapter / 6) + Math.floor(level / 100));
  }
  return { levels:to - from, gold, manastone };
}

const pct = (value) => `${(value * 100).toFixed(1)}%`;
const pt = (value) => `${(value * 100).toFixed(1)}pt`;

export function rune2EffectText(rune, marks = 1) {
  if (!rune) return '';
  const n = effectiveRuneMarks(rune, marks);
  const power = rune2Power(rune, n);
  if (rune.kind === 'statMult') return `${rune.stat.toUpperCase()} +${Math.round(power * 100)}%`;
  if (rune.id === 'challenge') {
    const lv = Math.min(20, Math.floor(n / 100));
    return `Challenge Lv.${lv}：敵HP +${lv*10}% / ATK +${lv*5}% / EXP +${lv*10}% / Gold +${lv*5}% / Rune抽選率 +${lv*2}%`;
  }
  if (rune.id === 'greed') return `50刻ごとに通常Dropの最低レア帯を1段除外（現在 ${Math.floor(n/50)}段）`;
  if (rune.id === 'observe') return '1/50/100/250/500刻で敵のHP・能力・報酬・分類・解析IDを順次表示';
  if (rune.id === 'bond') return `仲間加入率 +${(n*.015).toFixed(1)}pt / 仲間EXP +${(n*.05).toFixed(1)}% / 加入個体Rare化 ${Math.min(20,n*.02).toFixed(1)}%`;
  const labels = {
    critChance:`会心率 +${pt(power)}`,
    bossSpecialMitigation:`Boss特殊攻撃の被ダメージ -${pct(power)}`,
    roundRegen:`毎ラウンド終了時HP回復 ${pct(power)}（最大HP比）`,
    initiative:`先攻判定速度 +${pct(power)}`,
    attackInterval:`通常攻撃間隔 -${pct(power)}`,
    goldMult:`獲得Gold +${pct(power)}`,
    guardMitigation:`ぼうぎょ中の被ダメージ -${pct(power)}`,
    manastoneMult:`魔石ドロップ量 +${pct(power)}`,
    dropChance:`ボーナスドロップ率 +${pct(power)}`,
    damage:`与ダメージ +${pct(power)}`,
    critDamage:`会心ダメージ倍率 +${pct(power)}`,
    bossDamage:`対Boss・Elite与ダメージ +${pct(power)}`,
    evasion:`回避率 +${pt(power)}`,
    armorPen:`防御貫通 +${pt(power)}`,
    expMult:`獲得EXP +${pct(power)}`,
    enemySpdDown:`敵SPD -${pct(power)}`,
    incomingMitigation:`被ダメージ -${pct(power)}`,
    debuffPower:`弱体効果の効力 +${pct(power)}`,
    weaponReroll:`武器ドロップ失敗時の追加抽選率 ${pct(power)}`,
    tripleMult:`与ダメージ・EXP・Gold 各+${pct(power)}`,
    finalComposite:`与ダメージ・EXP・Gold・ボーナスDrop 各+${pct(power)}`,
  };
  return labels[rune.effect] || '効果なし';
}
