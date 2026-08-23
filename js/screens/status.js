/* ============================================================
   詳細ステータス画面（Part B）
   ------------------------------------------------------------
   表示専用。計算はすべてstate.getStats()/state.getCombatStats()/
   state.getStatBreakdown()（＝js/data/combatStats.jsのderiveCombatStats
   経由でBattleEngineと共通の式）を呼ぶだけで、ここに戦闘計算式を
   一切コピーしない（元指示：計算責務の共通化）。
   戦闘中の一時buffは対象外（恒常ステータスのみ表示）。
   ============================================================ */
import { state } from '../state.js';
import { getItem, RARITY } from '../data/equipment.js';
import { describeAffix, AFFIX_RARITY_COLOR, AFFIX_RARITY_LABEL } from '../data/affixes.js';
import { Audio_ } from '../audio.js';

const TIER_LABEL_JA = { basic: '基本職', advanced: '上級職', special: '特級職', hero: '勇者' };

const pct = (v, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const sign = (v) => (v >= 0 ? '+' : '');

// タップで内訳を開閉できる行（ATK/DEF/MAG/SPD/Crit）
const BREAKDOWN_STATS = { atk: 'ATK', def: 'DEF', mag: 'MAG', spd: 'SPD' };
let openBreakdown = null;

function statRow(label, value, { cap, tapKey, extraClass = '' } = {}) {
  const capText = cap != null ? `<span class="status-cap${cap.maxed ? ' maxed' : ''}">${cap.text}</span>` : '';
  return `<div class="status-row${tapKey ? ' tappable' : ''} ${extraClass}" ${tapKey ? `data-tap="${tapKey}"` : ''}>
    <span class="status-label">${label}</span>
    <span><span class="status-value">${value}</span>${capText}</span>
  </div>`;
}

function breakdownBlock(key) {
  if (openBreakdown !== key) return '';
  const b = state.getStatBreakdown(key);
  return `<div class="status-breakdown open">
    <div class="bd-line"><span>Base</span><span>${b.base}</span></div>
    <div class="bd-line"><span>Equipment</span><span>${sign(b.equipment)}${b.equipment}</span></div>
    <div class="bd-line"><span>Job/覚醒/転生</span><span>${sign(b.permanent)}${b.permanent}</span></div>
    <div class="bd-line"><span>Affix</span><span>${sign(b.affix)}${b.affix}</span></div>
  </div>`;
}

export function renderStatus() {
  const content = document.getElementById('statusContent');
  const job = state.currentJob;
  const stats = state.getStats();
  const c = state.getCombatStats();

  const tierLabel = TIER_LABEL_JA[job.tier] || job.tier;
  const masterText = state.isMastered(state.currentJobId) ? 'MASTER済み' : '未MASTER';

  const charSection = `
    <div class="status-section">
      <h3>1. キャラクター</h3>
      <div class="status-grid">
        <div class="status-row"><span class="status-label">職業</span><span class="status-value">${job.name}</span></div>
        <div class="status-row"><span class="status-label">Tier</span><span class="status-value">${tierLabel}</span></div>
        <div class="status-row"><span class="status-label">Lv</span><span class="status-value">${state.currentLevel}</span></div>
        <div class="status-row"><span class="status-label">MASTER</span><span class="status-value">${masterText}</span></div>
      </div>
      <div class="status-grid">
        ${statRow('HP', stats.hp)}
        ${statRow('MP', stats.mp)}
        ${statRow('ATK', stats.atk, { tapKey: 'atk' })}${breakdownBlock('atk')}
        ${statRow('DEF', stats.def, { tapKey: 'def' })}${breakdownBlock('def')}
        ${statRow('MAG', stats.mag, { tapKey: 'mag' })}${breakdownBlock('mag')}
        ${statRow('SPD', stats.spd, { tapKey: 'spd' })}${breakdownBlock('spd')}
      </div>
    </div>`;

  const battleSection = `
    <div class="status-section">
      <h3>2. 戦闘ステータス</h3>
      <div class="status-grid">
        ${statRow('Crit率', pct(c.critPct / 100), { cap: capInfo(c.critPct / 100, c.critPctMax / 100) })}
        ${statRow('Crit Damage', `×${c.critDamageMult.toFixed(2)}`)}
        ${statRow('Evasion', pct(c.evasion), { cap: capInfo(c.evasion, c.evasionMax) })}
        ${statRow('Armor Pen', pct(c.armorPen), { cap: capInfo(c.armorPen, c.armorPenMax) })}
        ${statRow('DEF軽減率', pct(c.defMitigationPct), { cap: capInfo(c.defMitigationPct, c.defMitigationMax) })}
        ${statRow('通常攻撃hit数/ラウンド', `${c.hitsPerRound}`)}
        ${statRow('Attack Interval', `${c.attackIntervalSec.toFixed(2)}s`, { cap: capInfo(c.attackIntervalMin / c.attackIntervalSec, 1, `下限${c.attackIntervalMin}s`) })}
        ${statRow('CDR', pct(c.cdrPct), { cap: capInfo(c.cdrPct, c.cdrMax) })}
      </div>
    </div>`;

  const dmgSection = `
    <div class="status-section">
      <h3>3. 攻撃補正</h3>
      <div class="status-grid">
        ${statRow('Total Damage', sign(c.generalDmgBonus) + pct(c.generalDmgBonus))}
        ${statRow('通常攻撃Damage', sign(c.normalDmgBonus) + pct(c.normalDmgBonus))}
        ${statRow('とくぎDamage', sign(c.skillDmgBonus) + pct(c.skillDmgBonus))}
        ${statRow('じゅもんDamage', sign(c.spellDmgBonus) + pct(c.spellDmgBonus))}
        ${statRow('Boss Damage', sign(c.bossDmgBonus) + pct(c.bossDmgBonus))}
        ${statRow('Elite Damage', sign(c.eliteDmgBonus) + pct(c.eliteDmgBonus))}
        ${statRow('Execution Damage', sign(c.executionBonus) + pct(c.executionBonus))}
        ${statRow('DoT Damage', sign(c.dotDmgBonus) + pct(c.dotDmgBonus))}
      </div>
    </div>`;

  const defSection = `
    <div class="status-section">
      <h3>4. 防御・回復</h3>
      <div class="status-grid">
        ${statRow('ぼうぎょ軽減', pct(c.guardDamageReductionPct))}
        ${statRow('Boss特殊攻撃軽減', pct(c.bossSpecialMitigation))}
        ${statRow('Lifesteal', pct(c.lifestealPct), { cap: capInfo(c.lifestealPct, c.lifestealMax) })}
        ${statRow('Regen', `${pct(c.regenPctPerSec)}/秒`, { cap: capInfo(c.regenPctPerSec, c.regenMaxPerSec, null, true) })}
      </div>
    </div>`;

  const econSection = `
    <div class="status-section">
      <h3>5. 経済</h3>
      <div class="status-grid">
        ${statRow('EXP倍率', `×${c.expMult.toFixed(2)}`)}
        ${statRow('Gold倍率', `×${c.goldMult.toFixed(2)}`)}
        ${statRow('Drop倍率', `×${c.dropMult.toFixed(2)}`)}
      </div>
    </div>`;

  const weaponId = state.data.equipped.weapon;
  const weaponItem = getItem(weaponId);
  const affixes = weaponId ? state.weaponInstanceAffixes(weaponId) : [];
  const equipSection = `
    <div class="status-section">
      <h3>6. 装備 / Affix</h3>
      ${weaponItem ? `
        <div class="status-equip-card">
          <div>
            <div style="color:${RARITY[weaponItem.rarity].color};font-weight:bold;">${weaponItem.name}</div>
            <div style="font-size:11px;opacity:0.7;">基礎ATK${weaponItem.stats.atk || 0} ${weaponItem.stats.mag ? ' / 基礎MAG' + weaponItem.stats.mag : ''}</div>
          </div>
        </div>
        ${affixes.length > 0 ? `<div class="affix-block">${affixes.map((a) => {
          const d = describeAffix(a);
          return `<div class="affix-line" style="border-left:3px solid ${AFFIX_RARITY_COLOR[a.rarity]}">`
            + `<span class="affix-rarity" style="color:${AFFIX_RARITY_COLOR[a.rarity]}">[${AFFIX_RARITY_LABEL[a.rarity]}]</span> `
            + `<span class="affix-name">${d.name}</span><br><span class="affix-desc">${d.desc}</span></div>`;
        }).join('')}</div>` : '<p class="hint">Affixなし</p>'}
      ` : '<p class="hint">武器未装備</p>'}
    </div>`;

  const capSection = `
    <div class="status-section">
      <h3>7. CAP</h3>
      <div class="status-grid">
        ${statRow('Crit', capLine(c.critPct / 100, c.critPctMax / 100))}
        ${statRow('Evasion', capLine(c.evasion, c.evasionMax))}
        ${statRow('Armor Pen', capLine(c.armorPen, c.armorPenMax))}
        ${statRow('CDR', capLine(c.cdrPct, c.cdrMax))}
        ${statRow('Lifesteal', capLine(c.lifestealPct, c.lifestealMax))}
        ${statRow('Regen', `${pct(c.regenPctPerSec)} / ${pct(c.regenMaxPerSec)} per sec`)}
        ${statRow('Attack Interval', `${c.attackIntervalSec.toFixed(2)}s / 下限${c.attackIntervalMin}s`)}
      </div>
    </div>`;

  content.innerHTML = charSection + battleSection + dmgSection + defSection + econSection + equipSection + capSection;

  content.querySelectorAll('[data-tap]').forEach((el) => {
    el.addEventListener('click', () => {
      const key = el.dataset.tap;
      Audio_.tap();
      openBreakdown = openBreakdown === key ? null : key;
      renderStatus();
    });
  });
}

function capLine(value, max) {
  const reached = value >= max - 1e-9;
  return `${pct(value)} / ${pct(max)}${reached ? '（MAX）' : ''}`;
}
function capInfo(value, max, note, isRegen = false) {
  const reached = max > 0 && value >= max - 1e-9;
  const text = note ? note : `/ ${isRegen ? pct(max) : pct(max)}${reached ? ' MAX' : ''}`;
  return { text, maxed: reached };
}
