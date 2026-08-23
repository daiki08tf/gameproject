import { state } from '../state.js';
import { getItem, RARITY } from '../data/equipment.js';
import { describeAffix, AFFIX_RARITY_COLOR, AFFIX_RARITY_LABEL } from '../data/affixes.js';
import { Audio_ } from '../audio.js';

const TIER_LABEL_JA = { basic: '基本職', advanced: '上級職', special: '特級職', hero: '勇者' };
const SLOT_LABELS = { weapon: '武器', shield: '盾', head: '頭', body: '体', accessory1: 'アクセ1', accessory2: 'アクセ2' };
const pct = (v, digits = 1) => `${(v * 100).toFixed(digits)}%`;
const signPct = (v) => `${v >= 0 ? '+' : ''}${pct(v)}`;
let activeTab = 'basic';
let openBreakdown = null;

function statRow(label, value, tapKey = null, note = '') {
  return `<div class="status-row${tapKey ? ' tappable' : ''}" ${tapKey ? `data-tap="${tapKey}"` : ''}><span class="status-label">${label}</span><span><span class="status-value">${value}</span>${note ? `<span class="status-cap">${note}</span>` : ''}</span></div>`;
}

function breakdownBlock(key) {
  if (openBreakdown !== key) return '';
  const b = state.getStatBreakdown(key);
  const signed = (v) => `${v >= 0 ? '+' : ''}${v}`;
  return `<div class="status-breakdown open"><div class="bd-line"><span>基礎</span><span>${b.base}</span></div><div class="bd-line"><span>装備</span><span>${signed(b.equipment)}</span></div><div class="bd-line"><span>職業 / 覚醒 / 転生</span><span>${signed(b.permanent)}</span></div><div class="bd-line"><span>Affix</span><span>${signed(b.affix)}</span></div></div>`;
}

function tabBar() {
  return `<div class="character-tabs">${[['basic','基本'],['equipment','装備'],['detail','詳細']].map(([id,label]) => `<button class="character-tab${activeTab === id ? ' active' : ''}" data-character-tab="${id}">${label}</button>`).join('')}</div>`;
}

function basicView(job, stats, c) {
  const tier = TIER_LABEL_JA[job.tier] || job.tier;
  const mastered = state.isMastered(state.currentJobId);
  const power = Math.round(stats.hp * 0.18 + stats.mp * 0.12 + stats.atk * 2.1 + stats.def * 1.7 + stats.mag * 1.8 + stats.spd * 1.3);
  return `<div class="character-hero-card"><div class="character-avatar">⚔️</div><div class="character-identity"><div class="character-job">${job.name}</div><div class="character-meta">Lv.${state.currentLevel} ・ ${tier} ・ ${mastered ? 'MASTER' : '未MASTER'}</div></div><div class="character-power"><small>総合戦力</small><strong>${power.toLocaleString()}</strong></div></div>
  <div class="status-section"><h3>基本ステータス <span class="character-hint">ATK / DEF / MAG / SPD はタップで内訳</span></h3><div class="status-grid">${statRow('HP',stats.hp)}${statRow('MP',stats.mp)}${statRow('ATK',stats.atk,'atk')}${breakdownBlock('atk')}${statRow('DEF',stats.def,'def')}${breakdownBlock('def')}${statRow('MAG',stats.mag,'mag')}${breakdownBlock('mag')}${statRow('SPD',stats.spd,'spd')}${breakdownBlock('spd')}</div></div>
  <div class="status-section"><h3>戦闘ハイライト</h3><div class="character-metric-grid"><div class="character-metric"><span>会心率</span><strong>${pct(c.critPct/100)}</strong></div><div class="character-metric"><span>会心Damage</span><strong>×${c.critDamageMult.toFixed(2)}</strong></div><div class="character-metric"><span>Armor Pen</span><strong>${pct(c.armorPen)}</strong></div><div class="character-metric"><span>回避率</span><strong>${pct(c.evasion)}</strong></div><div class="character-metric"><span>Boss Damage</span><strong>${signPct(c.bossDmgBonus)}</strong></div><div class="character-metric"><span>Drop倍率</span><strong>×${c.dropMult.toFixed(2)}</strong></div></div></div>`;
}

function affixHtml(itemId) {
  if (!itemId || !state.weaponInstanceAffixes) return '';
  const affixes = state.weaponInstanceAffixes(itemId) || [];
  if (!affixes.length) return '';
  return `<div class="affix-block">${affixes.map((a) => { const d = describeAffix(a); const color = AFFIX_RARITY_COLOR[a.rarity] || '#aaa'; return `<div class="affix-line" style="border-left:3px solid ${color}"><span class="affix-rarity" style="color:${color}">[${AFFIX_RARITY_LABEL[a.rarity] || a.rarity}]</span> <span class="affix-name">${d.name}</span><br><span class="affix-desc">${d.desc}</span></div>`; }).join('')}</div>`;
}

function equipmentView() {
  const equipped = state.data.equipped || {};
  const cards = Object.entries(SLOT_LABELS).map(([slot,label]) => {
    const id = equipped[slot]; const item = id ? getItem(id) : null;
    if (!item) return `<div class="character-equip-card empty"><div class="equip-slot-label">${label}</div><div class="equip-name">未装備</div></div>`;
    const rarity = RARITY[item.rarity] || { color:'#ddd' };
    const enhance = slot === 'weapon' && state.weaponEnhanceLevel ? state.weaponEnhanceLevel(id) : 0;
    const itemPower = slot === 'weapon' && state.weaponItemPower ? state.weaponItemPower(id) : null;
    const stats = Object.entries(item.stats || {}).filter(([,v]) => v).map(([k,v]) => `${k.toUpperCase()} ${v >= 0 ? '+' : ''}${v}`).join(' / ');
    return `<div class="character-equip-card"><div class="equip-slot-label">${label}</div><div class="equip-name" style="color:${rarity.color}">${item.name}${enhance ? ` +${enhance}` : ''}</div><div class="equip-sub">${stats || 'ステータス補正なし'}${itemPower != null ? `　・ Item Power ${itemPower}` : ''}</div>${slot === 'weapon' ? affixHtml(id) : ''}</div>`;
  }).join('');
  return `<div class="status-section"><h3>現在の装備</h3><div class="character-equip-list">${cards}</div></div>`;
}

function detailView(c) {
  return `<div class="status-section"><h3>攻撃</h3><div class="status-grid">${statRow('Total Damage',signPct(c.generalDmgBonus))}${statRow('通常攻撃Damage',signPct(c.normalDmgBonus))}${statRow('とくぎDamage',signPct(c.skillDmgBonus))}${statRow('じゅもんDamage',signPct(c.spellDmgBonus))}${statRow('Boss Damage',signPct(c.bossDmgBonus))}${statRow('Elite Damage',signPct(c.eliteDmgBonus))}${statRow('Execution Damage',signPct(c.executionBonus))}${statRow('DoT Damage',signPct(c.dotDmgBonus))}${statRow('会心率',pct(c.critPct/100),null,`/ ${pct(c.critPctMax/100)}`)}${statRow('会心Damage',`×${c.critDamageMult.toFixed(2)}`)}${statRow('Armor Pen',pct(c.armorPen),null,`/ ${pct(c.armorPenMax)}`)}${statRow('通常攻撃hit数',c.hitsPerRound)}</div></div>
  <div class="status-section"><h3>防御・回復</h3><div class="status-grid">${statRow('DEF軽減率',pct(c.defMitigationPct),null,`/ ${pct(c.defMitigationMax)}`)}${statRow('回避率',pct(c.evasion),null,`/ ${pct(c.evasionMax)}`)}${statRow('ぼうぎょ軽減',pct(c.guardDamageReductionPct))}${statRow('Boss特殊軽減',pct(c.bossSpecialMitigation))}${statRow('Lifesteal',pct(c.lifestealPct),null,`/ ${pct(c.lifestealMax)}`)}${statRow('Regen',`${pct(c.regenPctPerSec)}/秒`,null,`/ ${pct(c.regenMaxPerSec)}`)}</div></div>
  <div class="status-section"><h3>速度・リソース</h3><div class="status-grid">${statRow('Attack Interval',`${c.attackIntervalSec.toFixed(2)}s`,null,`下限 ${c.attackIntervalMin}s`)}${statRow('CDR',pct(c.cdrPct),null,`/ ${pct(c.cdrMax)}`)}${statRow('EXP倍率',`×${c.expMult.toFixed(2)}`)}${statRow('Gold倍率',`×${c.goldMult.toFixed(2)}`)}${statRow('Drop倍率',`×${c.dropMult.toFixed(2)}`)}</div></div>`;
}

function ensureCharacterStyles() {
  if (document.getElementById('characterDashboardCss')) return;
  const link = document.createElement('link');
  link.id = 'characterDashboardCss'; link.rel = 'stylesheet'; link.href = 'css/character.css';
  document.head.appendChild(link);
}

function ensureCharacterChrome() {
  ensureCharacterStyles();
  const title = document.querySelector('#statusScreen .subbar h2');
  if (title) title.textContent = 'キャラクター';
  const btn = document.getElementById('goStatusBtn');
  if (btn) { const icon = btn.querySelector('.menu-icon'); const label = btn.querySelector('span:last-child'); if (icon) icon.textContent = '👤'; if (label) label.textContent = 'キャラクター'; btn.classList.add('character-entry'); }
}

export function renderStatus() {
  ensureCharacterChrome();
  const content = document.getElementById('statusContent'); if (!content) return;
  const job = state.currentJob; const stats = state.getStats(); const c = state.getCombatStats();
  let view = basicView(job,stats,c); if (activeTab === 'equipment') view = equipmentView(); if (activeTab === 'detail') view = detailView(c);
  content.innerHTML = tabBar() + view;
  content.querySelectorAll('[data-character-tab]').forEach((btn) => btn.addEventListener('click', () => { Audio_.tap(); activeTab = btn.dataset.characterTab; openBreakdown = null; renderStatus(); }));
  content.querySelectorAll('[data-tap]').forEach((el) => el.addEventListener('click', () => { Audio_.tap(); const key = el.dataset.tap; openBreakdown = openBreakdown === key ? null : key; renderStatus(); }));
}

ensureCharacterChrome();
