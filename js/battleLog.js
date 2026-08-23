/* ============================================================
   BattleLog（テキスト戦闘：BattleEngineが返すevent[]を日本語の
   バトルログ文章へ変換する。DOM操作・状態変更は一切行わない、
   BattleEngine → 文字列配列 の純粋な変換レイヤー。
   ============================================================ */
import { getItem } from './data/equipment.js';
import { getRune } from './data/runes.js';

function itemDisplayName(itemId) {
  const item = getItem(itemId);
  if (item) return item.name;
  const rune = getRune(itemId);
  if (rune) return rune.name;
  return itemId;
}

const SPECIAL_FLAVOR = {
  slam: '叩きつけ',
  charge: '突進',
  projectile: '遠距離攻撃',
};

const STAT_JP = { atk: '攻撃力', def: '防御力', spd: '素早さ' };

// onHit/onCrit/onHurt/onKill系の既存エフェクト（元指示4・12番：装備・Affix・
// 転生遺物・覚醒の効果はテキストでこそ体感できるようにする）
function describeEffectEvent(ev) {
  switch (ev.kind) {
    case 'lifesteal': return `血を吸う武器が輝いた！HPを${ev.amount}回復した！`;
    case 'burnDamage': return `炎が燃え広がり、追加で${ev.amount}のダメージ！`;
    case 'bloodChalice': return '血神の杯が輝いた！しばらく攻撃力が上がる！';
    case 'weaken': return `相手の${STAT_JP[ev.stat] || ev.stat}を弱体化させた！`;
    case 'burnStack': return `相手を火だるまにした！（${ev.stacks}スタック）`;
    case 'everyNHits': return ev.aoe
      ? `渾身の一撃が周囲に炸裂！${ev.hits.join('、')}に${ev.amount}ずつダメージ！`
      : `渾身の一撃！さらに${ev.amount}の追加ダメージ！`;
    case 'lightning': return `会心の雷撃が走った！追加で${ev.amount}のダメージ！`;
    case 'timeStop': return '時を止めた！相手はしばらく動けない！';
    case 'counter': return `カウンター！${ev.amount}のダメージを返した！`;
    case 'haste': return '体が軽くなった！しばらく素早さが上がる！';
    case 'guardianHeal': return `守護の力が発動し、HPを${ev.amount}回復した！`;
    case 'deathNova': return `断末魔の衝撃波！周囲の敵に${ev.amount}ずつダメージ！`;
    default: return null;
  }
}

function describeKill(kill, targetName) {
  if (!kill) return [];
  const lines = [];
  lines.push(`${targetName}を倒した！ 経験値${kill.xp}・ゴールド${kill.gold}を獲得！`);
  if (kill.leveledUp) lines.push('レベルアップした！');
  for (const ev of kill.onKillEvents || []) {
    const d = describeEffectEvent(ev);
    if (d) lines.push(d);
  }
  for (const d of kill.drops || []) {
    lines.push(`${d.isNew ? '【NEW】' : ''}${d.name}を手に入れた！`);
  }
  if (kill.manastone > 0) lines.push(`魔石を${kill.manastone}個手に入れた！`);
  if (kill.bossSlayerBuff) lines.push('力がみなぎってくる…！');
  return lines;
}

function describeActionDiversityBurst(burst) {
  if (!burst) return [];
  const lines = [`色々な行動を織り交ぜた勢いで追撃！ ${burst.hits.join('、')}に${burst.amount}ずつダメージ！`];
  for (const k of burst.kills || []) lines.push(...describeKill(k.kill, k.name));
  return lines;
}

function describeHitEffects(effects) {
  const lines = [];
  for (const ev of effects || []) {
    const d = describeEffectEvent(ev);
    if (d) lines.push(d);
    // ChatGPTレビュー指摘2番：burnDamage/lightning/counter等の追加ダメージや
    // everyNHits/deathNova/actionDiversityBurstのAoEが撃破に至った場合も、
    // 通常攻撃と同じ撃破ログ（EXP/Gold/Drop等）を出す
    if (ev.kill) lines.push(...describeKill(ev.kill, ev.targetName || ''));
    if (ev.kills) for (const k of ev.kills) lines.push(...describeKill(k.kill, k.name));
  }
  return lines;
}

// プレイヤーの1コマンド分の行動結果を文章化する
function describePlayerAction(result) {
  const lines = [];
  if (result.action === 'attack') {
    if (result.noTarget) { lines.push('しかし、狙う相手がいなかった！'); return lines; }
    const critTag = result.critical ? '会心の一撃！ ' : '';
    lines.push(`あなたの攻撃！ ${critTag}${result.targetName}に${result.damage}のダメージ！${result.berserkerDoubled ? '（狂戦士の心臓が唸る！2連撃！）' : ''}`);
    lines.push(...describeHitEffects(result.effects));
    if (result.defeated) lines.push(...describeKill(result.kill, result.targetName));
    lines.push(...describeActionDiversityBurst(result.actionDiversityBurst));
    return lines;
  }
  if (result.action === 'guard') {
    lines.push('ぼうぎょの構えを取った！ 次に受ける攻撃のダメージが下がる！');
    return lines;
  }
  if (result.action === 'flee') {
    if (result.blocked) lines.push('この戦いからは逃げられない…！');
    else if (result.success) lines.push('うまく逃げ切った！');
    else lines.push('しかし逃げられなかった！');
    return lines;
  }
  if (result.action === 'skill' || result.action === 'spell') {
    if (result.blocked) {
      const label = result.action === 'spell' ? 'そのじゅもん' : 'そのとくぎ';
      if (result.reason === 'noMp') lines.push('MPが足りない！');
      else if (result.reason === 'onCooldown') lines.push(`${label}はまだ使えない（クールタイム中）`);
      else if (result.reason === 'noGold') lines.push('Goldが足りない！');
      else if (result.reason === 'usedThisBattle') lines.push(`${label}はこの戦闘ではもう使えない！`);
      else lines.push(`${label}はまだ使えない`);
      return lines;
    }
    lines.push(`「${result.name}」！`);
    switch (result.techType) {
      case 'damage':
        for (const hit of result.targets || []) {
          if (hit.instaKilled) { lines.push(`即死の一撃！ ${hit.targetName}は一瞬で崩れ落ちた！`); if (hit.defeated) lines.push(...describeKill(hit.kill, hit.targetName)); continue; }
          const critTag = hit.critical ? '会心の一撃！ ' : '';
          lines.push(`${critTag}${hit.targetName}に${hit.damage}のダメージ！`);
          lines.push(...describeHitEffects(hit.effects));
          if (hit.defeated) lines.push(...describeKill(hit.kill, hit.targetName));
        }
        if ((result.targets || []).length === 0) lines.push('しかし、狙う相手がいなかった！');
        break;
      case 'heal':
        lines.push(`HPを${result.healAmount}回復した！`);
        if (result.mpRestored) lines.push(`MPを${result.mpRestored}回復した！`);
        if (result.buffed) lines.push('身体能力が上がった！');
        break;
      case 'buff':
        if (result.healAmount) lines.push(`HPを${result.healAmount}回復した！`);
        lines.push(result.telegraphBonusApplied ? '相手の構えを見切り、身体能力が大きく上がった！' : '身体能力が上がった！');
        break;
      case 'debuff':
        for (const t of result.targets || []) {
          for (const w of t.weakenApplied || (t.weakenStat ? [{ stat: t.weakenStat }] : [])) {
            lines.push(`${t.targetName}の${STAT_JP[w.stat] || w.stat}を弱体化させた！`);
          }
          if (t.dotApplied) lines.push(`${t.targetName}を蝕む毒を送り込んだ！`);
          if (t.stunned) lines.push(`${t.targetName}の動きを封じた！`);
          if (t.marked) lines.push(`${t.targetName}に狩人の印を刻んだ！`);
          if (t.inspected) lines.push(`${t.targetName}：HP ${t.inspected.hp}/${t.inspected.maxHp}　ATK ${t.inspected.atk}　DEF ${t.inspected.def}　SPD ${t.inspected.spd}`);
        }
        if ((result.targets || []).length === 0) lines.push('しかし、狙う相手がいなかった！');
        break;
      case 'steal':
        if (result.alreadyStolen) lines.push('すでに奪えるものは奪った後だった…');
        else if (result.noTarget) lines.push('しかし、狙う相手がいなかった！');
        else {
          lines.push(`ゴールドを${result.stolenGold}奪った！`);
          if (result.stolenItem) lines.push(`${result.stolenItem.name}を奪い取った！`);
        }
        break;
      case 'inspect':
        if (result.inspected) {
          const t = result.inspected;
          lines.push(`${t.name}：HP ${t.hp}/${t.maxHp}　ATK ${t.atk}　DEF ${t.def}　SPD ${t.spd}`);
        } else lines.push('しかし、狙う相手がいなかった！');
        break;
      case 'burst':
        for (const t of result.targets || []) {
          const critTag = t.critical ? '会心の一撃！ ' : '';
          lines.push(`${critTag}${t.targetName}に${t.damage}のダメージ！（${t.consumedStacks}スタック分の毒を起爆！）`);
          if (t.defeated) lines.push(...describeKill(t.kill, t.targetName));
        }
        if ((result.targets || []).length === 0) lines.push('しかし、狙う相手がいなかった！');
        break;
      case 'cleanse':
        lines.push('体を蝕むものが消え去った！');
        break;
      case 'utility':
        if (result.buffed) lines.push('身体能力が上がった！');
        if (result.telegraphBonusApplied) lines.push('相手の構えを見切り、大きく防御を固めた！');
        else lines.push('構えを固めた！');
        if (result.instantDrop) lines.push(`${result.instantDrop.isNew ? '【NEW】' : ''}${result.instantDrop.name}を手に入れた！`);
        break;
      default: break;
    }
    if (result.doubleCast) lines.push('もう一度詠唱が発動した！');
    lines.push(...describeActionDiversityBurst(result.actionDiversityBurst));
    return lines;
  }
  return lines;
}

function describeEnemyAction(result) {
  const lines = [];
  // Phase2移行（HP50%以下、元指示9番）の宣言は、その手番がどの種類の行動で
  // あっても（通常攻撃・特殊攻撃どちらの手番で閾値を割ってもあり得る）先頭に
  // 出す
  if (result.phased) lines.push(`${result.name}の様子が変わった…！ 攻撃が激化する！`);
  if (result.frozen) { lines.push(`${result.name}は時を止められて動けない！`); return lines; }
  if (result.kind === 'telegraph') {
    lines.push(`${result.name}が${SPECIAL_FLAVOR[result.specialKind] || '大技'}の構えを見せた…！ 次のターンに来る！`);
    return lines;
  }
  if (result.kind === 'special') {
    if (result.evaded) { lines.push(`${result.name}の${SPECIAL_FLAVOR[result.specialKind] || '大技'}！ しかし華麗に回避した！`); lines.push(...describeHitEffects(result.evadeEvents)); return lines; }
    lines.push(`${result.name}の${SPECIAL_FLAVOR[result.specialKind] || '大技'}が炸裂！ ${result.damage}のダメージを受けた！`);
    lines.push(...describeHitEffects(result.hurtEvents));
    return lines;
  }
  if (result.kind === 'summon') {
    lines.push(`${result.name}が手下を呼び出した！ ${(result.added || []).join('、')}が加わった！`);
    return lines;
  }
  // kind === 'attack'
  if (result.evaded) { lines.push(`${result.name}の攻撃！ しかし回避した！`); lines.push(...describeHitEffects(result.evadeEvents)); return lines; }
  lines.push(`${result.name}の攻撃！ ${result.damage}のダメージを受けた！`);
  lines.push(...describeHitEffects(result.hurtEvents));
  return lines;
}

// 遭遇グループの出現宣言（「ゴブリンが2体 コウモリが1体 あらわれた！」）
function describeEncounterStart(enemies) {
  const counts = new Map();
  for (const e of enemies) counts.set(e.name, (counts.get(e.name) || 0) + 1);
  const parts = [...counts.entries()].map(([name, n]) => `${name}が${n}体`);
  const anyBoss = enemies.some((e) => e.boss);
  return [`${parts.join(' 、 ')} あらわれた！${anyBoss ? '（ボスの気配…！）' : ''}`];
}

// BattleEngine.advanceTurn()の返り値 { events, over, result } を丸ごと受け取り、
// ログに追加すべき行の配列を返す
export function describeRound(events) {
  const lines = [];
  for (const ev of events) {
    switch (ev.type) {
      case 'encounterStart': lines.push(...describeEncounterStart(ev.enemies)); break;
      case 'playerAction': lines.push(...describePlayerAction(ev.result)); break;
      case 'enemyAction': lines.push(...describeEnemyAction(ev.result)); break;
      case 'enemyWait': break; // 「様子を見ている」は毎ラウンド出ると煩雑なため、ログには出さない（元指示20・21番：テンポ優先）
      case 'dotTick':
        lines.push(`${ev.name}は炎に焼かれている！ ${ev.amount}のダメージ！`);
        if (ev.targetDead && ev.kill) lines.push(...describeKill(ev.kill, ev.name));
        break;
      case 'autoTurret': {
        const critTag = ev.critical ? '会心の一撃！ ' : '';
        lines.push(`自動砲台が着弾！ ${critTag}${ev.targetName}に${ev.damage}のダメージ！`);
        if (ev.targetDead && ev.kill) lines.push(...describeKill(ev.kill, ev.targetName));
        break;
      }
      default: break;
    }
  }
  return lines;
}

// 戦闘終了時（元指示23番のフォーマットに準ずる）
export function describeBattleEnd(result) {
  if (!result) return [];
  if (result.retreated) return ['戦闘から離脱した。'];
  if (result.cleared) {
    const lines = ['戦闘に勝利した！'];
    lines.push(`経験値${result.expGained}・ゴールド${result.goldGained}を獲得！`);
    for (const itemId of result.items || []) lines.push(`${itemDisplayName(itemId)} を手に入れた！`);
    if (result.firstClear) lines.push('初回クリア報酬を獲得した！');
    return lines;
  }
  return ['力尽きた…戦闘に敗北した。'];
}
