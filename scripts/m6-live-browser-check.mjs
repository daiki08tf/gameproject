import { chromium } from 'playwright';
import fs from 'node:fs/promises';

const BASE = 'http://127.0.0.1:8000';
const OUT = 'browser-artifacts/m6';
await fs.mkdir(OUT, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
const pageErrors = [];
page.on('pageerror', error => pageErrors.push(String(error)));
// Keep the real app document/CSS, but suppress main.js's full startup graph so this
// smoke can drive the exact CP4 + Stage modules deterministically without racing
// unrelated startup/navigation side effects.
await page.route('**/js/main.js', route => route.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));

await page.goto(BASE, { waitUntil: 'networkidle' });

const discovery = await page.evaluate(async () => {
  const { state } = await import('/js/state.js');
  await import('/js/patches/contentPackIVD.js');
  state.data.world2 ??= {};
  state.data.world2.discoveries ??= {};
  state.data.stageProgress ??= {};
  Object.assign(state.data.world2.discoveries, {
    'cp4:branch-sight:active': { observed: true },
    'cp4:parallax:first-contact': { observed: true },
    'cp4:branch-anchor:tree-sovereign': { observed: true },
  });
  for (const id of [
    'observedbranch-deepgreen-absence-1',
    'observedbranch-deepgreen-absence-2',
    'observedbranch-deepgreen-absence-boss',
  ]) delete state.data.stageProgress[id];
  const before = state.cp4SecondBranchAnchor?.();
  if (!before?.progress?.visible) throw new Error(`second Branch anchor is not visible: ${JSON.stringify(before)}`);
  state.observeCP4SecondBranchAnchor?.();
  return {
    beforeState: before.progress.state,
    discovered: Boolean(state.data.world2.discoveries['cp4:branch-anchor:deep-green-absence']),
  };
});
if (!discovery.discovered) throw new Error('深緑消失域 discovery was not written through CP4 authority');

async function renderCh2() {
  await page.evaluate(async () => {
    const { renderStageSelect } = await import('/js/screens/stageSelect.js');
    window.__m6PickedStage = null;
    document.querySelectorAll('.screen').forEach(node => node.classList.remove('active'));
    document.getElementById('stageSelectScreen').classList.add('active');
    renderStageSelect(1, stage => { window.__m6PickedStage = stage; });
  });
  await page.waitForTimeout(100);
}

await renderCh2();
await page.locator('.section-heading', { hasText: '観測分岐：深緑消失域' }).waitFor();
await page.locator('[data-stage-id="observedbranch-deepgreen-absence-1"]').click();
let picked = await page.evaluate(() => window.__m6PickedStage?.id || null);
if (picked !== 'observedbranch-deepgreen-absence-1') throw new Error(`first Stage selection routed to ${picked}`);

await page.evaluate(async () => {
  const { state } = await import('/js/state.js');
  state.recordStageResult('observedbranch-deepgreen-absence-1', true);
});
await renderCh2();
await page.locator('[data-stage-id="observedbranch-deepgreen-absence-2"]').click();
picked = await page.evaluate(() => window.__m6PickedStage?.id || null);
if (picked !== 'observedbranch-deepgreen-absence-2') throw new Error(`second Stage selection routed to ${picked}`);

await page.evaluate(async () => {
  const { state } = await import('/js/state.js');
  state.recordStageResult('observedbranch-deepgreen-absence-2', true);
});
await renderCh2();
const bossCard = page.locator('[data-stage-id="observedbranch-deepgreen-absence-boss"]');
await bossCard.waitFor();
if (!(await bossCard.textContent()).includes('根無き森核・NULL CANOPY')) throw new Error('NULL CANOPY boss copy missing');
await bossCard.click();
picked = await page.evaluate(() => window.__m6PickedStage?.id || null);
if (picked !== 'observedbranch-deepgreen-absence-boss') throw new Error(`boss selection routed to ${picked}`);

const completion = await page.evaluate(async () => {
  const { state } = await import('/js/state.js');
  const { isObservedBranchCleared } = await import('/js/data/observedBranchStages.js');
  const { getItem } = await import('/js/data/equipment.js');
  const { fixedEquipmentIdentities } = await import('/js/data/equipmentFixedIdentity.js');
  state.recordStageResult('observedbranch-deepgreen-absence-boss', true);
  state.addItem('uq_observed_null_root', 1);
  const item = getItem('uq_observed_null_root');
  const fixed = fixedEquipmentIdentities(item)[0];
  const codex = state.cp4CodexHistoricalInconsistencies?.() || [];
  return {
    cleared: isObservedBranchCleared('deep-green-absence', { isStageCleared: id => state.isStageCleared(id) }),
    itemName: item?.name || null,
    fixedIdentityId: fixed?.identityId || null,
    codexTitles: codex.map(row => row.title),
  };
});
if (!completion.cleared) throw new Error('Branch clear was not derived from canonical stageProgress');
if (completion.itemName !== '無根刃・NULL ROOT') throw new Error(`unexpected reward item ${completion.itemName}`);
if (completion.fixedIdentityId !== 'u2_sword_null_root') throw new Error(`unexpected Fixed/Unique2 identity ${completion.fixedIdentityId}`);
if (!completion.codexTitles.some(title => title.includes('深緑消失域'))) throw new Error(`深緑消失域 Codex row missing: ${completion.codexTitles.join(', ')}`);

await renderCh2();
const heading = page.locator('.section-heading', { hasText: '観測分岐：深緑消失域' });
for (const [name, width, height] of [
  ['390x844', 390, 844],
  ['375x667', 375, 667],
  ['desktop-1365x768', 1365, 768],
]) {
  await page.setViewportSize({ width, height });
  await heading.scrollIntoViewIfNeeded();
  await page.waitForTimeout(50);
  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: false });
}

const report = {
  discovery,
  completion,
  pageErrors,
  screenshots: ['390x844.png', '375x667.png', 'desktop-1365x768.png'],
};
await fs.writeFile(`${OUT}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
if (pageErrors.length) throw new Error(`browser page errors: ${pageErrors.join(' | ')}`);

await browser.close();
