import { jobsByTier, isUnlocked, unlockRequirementText, TIERS } from '../data/jobs.js';
import { WEAPON_TYPES } from '../data/equipment.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

const TIER_LABELS = { basic: '基本職', advanced: '上級職', special: '特級職', hero: '勇者' };

function specializationHtml(job) {
  const routes = state.job3SpecializationStatus ? state.job3SpecializationStatus(job.id) : [];
  if (!routes.length) return '';
  return `<div class="job3-tree" style="margin:8px 0;padding:8px;border:1px solid rgba(255,255,255,.12);border-radius:8px;">
    <div class="job-card-req" style="margin-bottom:6px;"><strong>専門化</strong> — Job Lv5 / 10 / MASTERで段階解放</div>
    ${routes.map((route) => `<div class="job3-route${route.selected ? ' selected' : ''}" style="margin:5px 0;padding:6px;border-radius:6px;${route.selected ? 'background:rgba(242,201,76,.10);' : ''}">
      <div style="display:flex;justify-content:space-between;gap:8px;align-items:center;">
        <span><strong>${route.selected ? '◆ ' : ''}${route.name}</strong> <span class="hint">${route.desc}</span></span>
        <button class="inline-btn job3-route-btn" data-job="${job.id}" data-route="${route.id}" ${route.selected ? 'disabled' : ''}>${route.selected ? '選択中' : '選ぶ'}</button>
      </div>
      <div class="job-card-req" style="margin-top:4px;">${route.nodes.map((node) => `${node.active ? '✓' : '□'} ${node.level === 'master' ? 'MASTER' : `Lv.${node.level}`} ${node.name}: ${node.desc}`).join('<br>')}</div>
    </div>`).join('')}
  </div>`;
}

function legacySummaryHtml() {
  if (!state.job3LegacySlots || !state.job3LegacyStatus) return '';
  const slots = state.job3LegacySlots();
  const status = state.job3LegacyStatus().filter((row) => row.equipped);
  return `<div class="job-card" style="margin-bottom:12px;border-color:rgba(242,201,76,.45);">
    <div class="job-card-top"><div class="job-card-name">🧬 継承パッシブ</div><div class="job-card-lv">${slots.length}/3</div></div>
    <div class="job-card-req">MASTERした職の専門化MASTERノードを50%の強さで最大3つ継承。現在使用中の職自身の継承効果は一時停止します。</div>
    <div class="job-card-req" style="margin-top:5px;">${status.length ? status.map((row) => `${row.suppressed ? '⏸' : '✓'} ${row.jobName}［${row.routeName}］${row.nodeName}: ${row.nodeDesc}`).join('<br>') : '継承中の職業はありません。★マスター済み職の「継承」から選択できます。'}</div>
  </div>`;
}

function legacyControlHtml(jobId, mastered) {
  if (!mastered || !state.job3LegacyStatus) return '';
  const row = state.job3LegacyStatus().find((entry) => entry.jobId === jobId);
  if (!row || !row.nodeName) return '';
  const full = !row.equipped && state.job3LegacySlots().length >= 3;
  return `<div style="display:flex;justify-content:space-between;gap:8px;align-items:center;margin:6px 0;">
    <span class="job-card-req">🧬 継承候補: ${row.routeName}「${row.nodeName}」${row.suppressed ? '（現在職のため効果停止中）' : ''}</span>
    <button class="inline-btn job3-legacy-btn" data-job="${jobId}" ${full ? 'disabled' : ''}>${row.equipped ? '継承解除' : full ? '3枠使用中' : '継承する'}</button>
  </div>`;
}

function bindJob3Buttons(card) {
  for (const btn of card.querySelectorAll('.job3-route-btn:not([disabled])')) {
    btn.addEventListener('click', () => {
      Audio_.tap();
      if (state.setJob3Specialization(btn.dataset.job, btn.dataset.route)) renderJobs();
    });
  }
  for (const btn of card.querySelectorAll('.job3-legacy-btn:not([disabled])')) {
    btn.addEventListener('click', () => {
      Audio_.tap();
      if (state.toggleJob3Legacy(btn.dataset.job)) renderJobs();
    });
  }
}

export function renderJobs() {
  const container = document.getElementById('jobTiers');
  container.innerHTML = '';
  const masteredSet = state.masteredSet();
  const summary = legacySummaryHtml();
  if (summary) container.insertAdjacentHTML('beforeend', summary);

  for (const tier of ['basic', 'advanced', 'special', 'hero']) {
    const heading = document.createElement('div');
    heading.className = 'tier-heading';
    heading.textContent = TIER_LABELS[tier];
    container.appendChild(heading);

    const canLeaveCurrent = state.canChangeAwayFromCurrent();

    for (const job of jobsByTier(tier)) {
      const unlocked = isUnlocked(job.id, masteredSet);
      const isCurrent = !state.data.activeSecretJobId && job.id === state.currentJobId;
      const mastered = state.isMastered(job.id);
      const prog = state.jobProgress(job.id);
      const tierInfo = TIERS[job.tier];
      const expNeed = state.expToNext(prog.level);
      const pct = unlocked ? Math.min(100, (prog.exp / expNeed) * 100) : 0;
      const blockedByCurrent = !isCurrent && unlocked && !canLeaveCurrent;

      let btnLabel = '転職する';
      if (isCurrent) btnLabel = '使用中';
      else if (!unlocked) btnLabel = 'ロック中';
      else if (blockedByCurrent) btnLabel = `${state.currentJob.name}がLv.${TIERS[state.currentJob.tier].changeableLv}必要`;

      const card = document.createElement('div');
      card.className = 'job-card' + (isCurrent ? ' current' : '') + (!unlocked ? ' locked' : '');
      card.innerHTML = `
        <div class="job-card-top">
          <div class="job-card-name">${job.name}${mastered ? '<span class="mastered-badge">★マスター</span>' : ''}</div>
          <div class="job-card-lv">${unlocked ? `Lv.${prog.level}` : '???'}</div>
        </div>
        <div class="job-card-req">${job.desc || ''}${job.weapon ? `（得意武器：${WEAPON_TYPES[job.weapon].name}）` : ''}</div>
        ${unlocked ? `<div class="bar xp-bar small"><div class="fill" style="width:${pct}%"></div></div>` : ''}
        ${!unlocked ? `<div class="job-card-req">解放条件: ${unlockRequirementText(job.id)}</div>` : ''}
        ${tierInfo.masteryLv ? `<div class="job-card-req">マスター基準 Lv.${tierInfo.masteryLv}</div>` : ''}
        ${unlocked ? specializationHtml(job) : ''}
        ${legacyControlHtml(job.id, mastered)}
        <button class="job-card-btn" ${isCurrent || !unlocked || blockedByCurrent ? 'disabled' : ''}>${btnLabel}</button>
      `;
      const btn = card.querySelector('.job-card-btn');
      if (!isCurrent && unlocked && !blockedByCurrent) {
        btn.addEventListener('click', () => {
          const res = state.changeJob(job.id);
          if (res.ok) { Audio_.jobMastered(); renderJobs(); }
        });
      }
      bindJob3Buttons(card);
      container.appendChild(card);
    }
  }

  const secrets = state.getSecretJobs ? state.getSecretJobs() : [];
  if (secrets.length) {
    const heading=document.createElement('div'); heading.className='tier-heading'; heading.textContent='秘密職'; container.appendChild(heading);
    for(const job of secrets){
      const discovered=state.isSecretJobDiscovered(job.id), active=state.data.activeSecretJobId===job.id;
      const prog=state.jobProgress(job.id), mastered=state.isMastered(job.id), cond=state.secretJobConditions(job.id);
      const card=document.createElement('div'); card.className='job-card'+(active?' current':'')+(!discovered?' locked':'');
      const conditionHtml=discovered ? cond.map(c=>`${c.done?'✓':'□'} ${c.label}`).join('<br>') : `<span class="hint">${job.hint}</span>`;
      card.innerHTML=`<div class="job-card-top"><div class="job-card-name">${discovered?job.name:'？？？？？'}${mastered?'<span class="mastered-badge">★マスター</span>':''}</div><div class="job-card-lv">${discovered?`Lv.${prog.level}`:'???'}</div></div><div class="job-card-req">${discovered?job.desc:'未知の職業。その存在はまだ明らかになっていない。'}</div><div class="job-card-req">${conditionHtml}</div>${discovered?`<div class="job-card-req">MASTER Lv.${job.masteryLv} / 秘密職固有の成長ルート</div>`:''}<button class="job-card-btn" ${!discovered||active?'disabled':''}>${active?'使用中':discovered?'転職する':'未発見'}</button>`;
      if(discovered&&!active) card.querySelector('button').addEventListener('click',()=>{ const r=state.changeToSecretJob(job.id); if(r.ok){Audio_.jobMastered();renderJobs();} });
      container.appendChild(card);
    }
  }
}
