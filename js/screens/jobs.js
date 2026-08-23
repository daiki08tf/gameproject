import { jobsByTier, isUnlocked, unlockRequirementText, TIERS } from '../data/jobs.js';
import { WEAPON_TYPES } from '../data/equipment.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

const TIER_LABELS = { basic: '基本職', advanced: '上級職', special: '特級職', hero: '勇者' };

export function renderJobs() {
  const container = document.getElementById('jobTiers');
  container.innerHTML = '';
  const masteredSet = state.masteredSet();

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
        <button class="job-card-btn" ${isCurrent || !unlocked || blockedByCurrent ? 'disabled' : ''}>${btnLabel}</button>
      `;
      const btn = card.querySelector('button');
      if (!isCurrent && unlocked && !blockedByCurrent) {
        btn.addEventListener('click', () => {
          const res = state.changeJob(job.id);
          if (res.ok) { Audio_.jobMastered(); renderJobs(); }
        });
      }
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
      card.innerHTML=`<div class="job-card-top"><div class="job-card-name">${discovered?job.name:'？？？？？'}${mastered?'<span class="mastered-badge">★マスター</span>':''}</div><div class="job-card-lv">${discovered?`Lv.${prog.level}`:'???'}</div></div><div class="job-card-req">${discovered?job.desc:'未知の職業。その存在はまだ明らかになっていない。'}</div><div class="job-card-req">${conditionHtml}</div>${discovered?`<div class="job-card-req">MASTER Lv.${job.masteryLv} / Phase 1では既存戦闘スタイルを継承</div>`:''}<button class="job-card-btn" ${!discovered||active?'disabled':''}>${active?'使用中':discovered?'転職する':'未発見'}</button>`;
      if(discovered&&!active) card.querySelector('button').addEventListener('click',()=>{ const r=state.changeToSecretJob(job.id); if(r.ok){Audio_.jobMastered();renderJobs();} });
      container.appendChild(card);
    }
  }
}