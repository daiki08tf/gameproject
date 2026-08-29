import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

test('pixel icon atlas and UI integration exist',()=>{
  assert.equal(fs.existsSync('assets/ui/pixel-icons.png'),true);
  const css=fs.readFileSync('css/pixelIcons.css','utf8');
  const ui=fs.readFileSync('js/ui/pixelIcons.js','utf8');
  const nav=fs.readFileSync('js/patches/homeNavigation.js','utf8');
  const settlement=fs.readFileSync('js/patches/settlementUi.js','utf8');
  assert.match(css,/image-rendering:pixelated/);
  assert.match(css,/pixel-icons\.png/);
  for(const key of ['wood','ore','hide','veilstone','adventure','abyss','settlement','ranch','blacksmith','legendary','cursed'])assert.match(ui,new RegExp(`${key}:\\[`));
  assert.match(nav,/applyHomePixelIcons/);
  assert.match(settlement,/BUILDING_ICON=\{[^}]*hall:'settlement'/);
  assert.match(settlement,/pixelIconHtml\(BUILDING_ICON\[b\.id\]\|\|'settlement'\)/);
  assert.match(settlement,/pixelIconHtml\(m\.id,'sm'\)/);
});
