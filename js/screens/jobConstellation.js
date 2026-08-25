import { jobsByTier, getJob } from '../data/jobs.js';
import { FUSION_JOBS, getFusionJobByParents } from '../data/jobFusionRegistry.js';
import { state } from '../state.js';
import { Audio_ } from '../audio.js';

let selectedBasicId = 'warrior';

const CENTER = 500;
const RADIUS = 360;

function posFor(index, total) {
  const angle = (-Math.PI / 2) + (Math.PI * 2 * index / total);
  return {
    x: CENTER + Math.cos(angle) * RADIUS,
    y: CENTER + Math.sin(angle) * RADIUS,
  };
}

function basicJobs() {
  return jobsByTier('basic');
}

function discoveryState(fusion, masteredSet) {
  const masteredCount = fusion.parents.filter((id) => masteredSet.has(id)).length;
  if (masteredCount === 2) return 'discovered';
  if (masteredCount === 1) return 'hinted';
  return 'hidden';
}

function fusionSummary(selectedId, masteredSet) {
  return FUSION_JOBS
    .filter((fusion) => fusion.parents.includes(selectedId))
    .map((fusion) => ({ ...fusion, discovery: discoveryState(fusion, masteredSet) }))
    .sort((a, b) => {
      const rank = { discovered: 0, hinted: 1, hidden: 2 };
      return rank[a.discovery] - rank[b.discovery] || a.name.localeCompare(b.name, 'ja');
    });
}

function buildLines(jobs, selectedId, masteredSet) {
  const selectedIndex = jobs.findIndex((j) => j.id === selectedId);
  if (selectedIndex < 0) return '';
  const from = posFor(selectedIndex, jobs.length);
  return jobs.map((job, index) => {
    if (job.id === selectedId) return '';
    const fusion = getFusionJobByParents(selectedId, job.id);
    if (!fusion) return '';
    const to = posFor(index, jobs.length);
    const bothMastered = masteredSet.has(selectedId) && masteredSet.has(job.id);
    const oneMastered = masteredSet.has(selectedId) || masteredSet.has(job.id);
    const cls = bothMastered ? 'active' : oneMastered ? 'hinted' : 'locked';
    return `<line class="constellation-link ${cls}" x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}"></line>`;
  }).join('');
}

function starButtons(jobs, masteredSet) {
  return jobs.map((job, index) => {
    const p = posFor(index, jobs.length);
    const mastered = masteredSet.has(job.id);
    const selected = job.id === selectedBasicId;
    const progress = state.jobProgress(job.id);
    return `<button class="constellation-star ${mastered ? 'mastered' : ''} ${selected ? 'selected' : ''}" data-basic-job="${job.id}" style="left:${(p.x / 10)}%;top:${(p.y / 10)}%;" aria-label="${job.name}">
      <span class="constellation-star-core">${mastered ? '★' : '◇'}</span>
      <span class="constellation-star-label">${job.name}</span>
      <span class="constellation-star-level">Lv.${progress.level}</span>
    </button>`;
  }).join('');
}

function fusionList(selectedJob, masteredSet) {
  const rows = fusionSummary(selectedJob.id, masteredSet);
  return rows.map((fusion) => {
    const partnerId = fusion.parents.find((id) => id !== selectedJob.id);
    const partner = getJob(partnerId);
    if (fusion.discovery === 'discovered') {
      return `<button class="constellation-fusion-row discovered" data-partner-job="${partnerId}">
        <span class="fusion-status">✦</span>
        <span class="fusion-main"><strong>${fusion.name}</strong><small>${selectedJob.name} × ${partner.name}</small></span>
        <span class="fusion-state">発見</span>
      </button>`;
    }
    if (fusion.discovery === 'hinted') {
      return `<button class="constellation-fusion-row hinted" data-partner-job="${partnerId}">
        <span class="fusion-status">◇</span>
        <span class="fusion-main"><strong>？？？？？</strong><small>${partner.name}をMASTERすると共鳴</small></span>
        <span class="fusion-state">未完成</span>
      </button>`;
    }
    return `<div class="constellation-fusion-row locked">
      <span class="fusion-status">·</span>
      <span class="fusion-main"><strong>？？？？？</strong><small>星はまだ眠っている</small></span>
      <span class="fusion-state">未発見</span>
    </div>`;
  }).join('');
}

export function renderJobConstellation(container) {
  const jobs = basicJobs();
  if (!jobs.some((j) => j.id === selectedBasicId)) selectedBasicId = jobs[0]?.id || 'warrior';
  const masteredSet = state.masteredSet();
  const selectedJob = getJob(selectedBasicId) || jobs[0];
  const selectedMastered = masteredSet.has(selectedJob.id);
  const discoveredCount = FUSION_JOBS.filter((fusion) => fusion.parents.every((id) => masteredSet.has(id))).length;
  const masteredBasics = jobs.filter((job) => masteredSet.has(job.id)).length;

  container.innerHTML = `
    <div class="constellation-shell">
      <div class="constellation-summary">
        <div><span class="constellation-kicker">SKILL CONSTELLATION</span><strong>職業星盤</strong></div>
        <div class="constellation-count">基本星 ${masteredBasics}/15<br><span>共鳴 ${discoveredCount}/105</span></div>
      </div>
      <p class="constellation-hint">基本職をMASTERすると星が点灯。MASTERした2つの星を選ぶと、その間に新しい上級職が生まれます。</p>
      <div class="constellation-board-wrap">
        <div class="constellation-board">
          <svg class="constellation-svg" viewBox="0 0 1000 1000" aria-hidden="true">
            <circle class="constellation-orbit" cx="500" cy="500" r="360"></circle>
            ${buildLines(jobs, selectedJob.id, masteredSet)}
          </svg>
          ${starButtons(jobs, masteredSet)}
          <div class="constellation-center ${selectedMastered ? 'mastered' : ''}">
            <span>${selectedMastered ? 'MASTER STAR' : 'JOB STAR'}</span>
            <strong>${selectedJob.name}</strong>
            <small>${selectedMastered ? '共鳴可能' : `MASTERで外周星が点灯`}</small>
          </div>
        </div>
      </div>
      <div class="constellation-panel">
        <div class="constellation-panel-head"><strong>${selectedJob.name}から伸びる星路</strong><span>${selectedMastered ? '★ MASTER' : '未MASTER'}</span></div>
        <div class="constellation-fusion-list">${fusionList(selectedJob, masteredSet)}</div>
      </div>
      <div class="constellation-note">※ Phase 8基盤段階では、新規75職は「発見」まで。転職・固有Fusion Trait・Keystone・Ultimateは星盤エンジンの次段階で接続します。</div>
    </div>`;

  for (const btn of container.querySelectorAll('[data-basic-job]')) {
    btn.addEventListener('click', () => {
      Audio_.tap();
      selectedBasicId = btn.dataset.basicJob;
      renderJobConstellation(container);
    });
  }
  for (const btn of container.querySelectorAll('[data-partner-job]')) {
    btn.addEventListener('click', () => {
      Audio_.tap();
      selectedBasicId = btn.dataset.partnerJob;
      renderJobConstellation(container);
    });
  }
}
