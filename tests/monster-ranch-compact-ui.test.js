import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

async function source(path){
  return readFile(new URL(`../${path}`,import.meta.url),'utf8');
}

test('Monster Ranch compact UI exposes seven functional tabs',async()=>{
  const text=await source('js/patches/monsterRanchCompactUi.js');
  for(const id of ['companions','eggs','breeding','training','expeditions','facilities','research']){
    assert.match(text,new RegExp(`'${id}'`));
  }
  assert.match(text,/ranch-compact-search/);
  assert.match(text,/ranch-compact-details/);
  assert.match(text,/ranch-detail-body/);
});

test('Monster Ranch compact UI is loaded after Ranch feature UI',async()=>{
  const text=await source('js/patches/homeNavigation.js');
  const ranch=text.indexOf("./monsterRanch2CompleteUi.js");
  const compact=text.indexOf("./monsterRanchCompactUi.js");
  assert.ok(ranch>=0&&compact>ranch,'compact layer must load after Ranch UI producers');
});

test('Monster Ranch compact styles keep per-tab sections and mobile action density',async()=>{
  const css=await source('css/monsterRanchCompact.css');
  assert.match(css,/data-ranch-tab='companions'/);
  assert.match(css,/data-ranch-tab='eggs'/);
  assert.match(css,/data-ranch-tab='breeding'/);
  assert.match(css,/data-ranch-tab='training'/);
  assert.match(css,/data-ranch-tab='expeditions'/);
  assert.match(css,/data-ranch-tab='facilities'/);
  assert.match(css,/data-ranch-tab='research'/);
  assert.match(css,/ranch-filter-hidden/);
  assert.match(css,/@media\(max-width:390px\)/);
});
