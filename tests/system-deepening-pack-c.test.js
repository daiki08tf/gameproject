import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  RUMOR_STATES,PACK_C_SITE_STAGE,TREASURE_CLUES,SECRET_CHAIN,
  rumorStateFor,regionalKnowledgeBenefit,enhancedRumorHint,secretChainProgress,
} from '../js/data/systemDeepeningPackC.js';

test('SD-6 rumor notebook derives unresolved tracking resolved from existing world state',()=>{
  const none=rumorStateFor({targetSiteId:'old_king_tomb',discoveries:{},isStageCleared:()=>false});
  const tracking=rumorStateFor({targetSiteId:'old_king_tomb',discoveries:{'trace:old_king_tomb':{name:'trace'}},isStageCleared:()=>false});
  const resolved=rumorStateFor({targetSiteId:'old_king_tomb',discoveries:{},isStageCleared:id=>id===PACK_C_SITE_STAGE.old_king_tomb});
  assert.equal(none,RUMOR_STATES.unresolved);
  assert.equal(tracking,RUMOR_STATES.tracking);
  assert.equal(resolved,RUMOR_STATES.resolved);
});

test('SD-7 regional mastery improves knowledge without large mandatory power',()=>{
  const base=regionalKnowledgeBenefit({mastered:false});
  const master=regionalKnowledgeBenefit({mastered:true});
  assert.equal(base.rareLeadRelativeMult,1);
  assert.equal(master.rareLeadRelativeMult,1.05);
  assert.ok(master.rareLeadRelativeMult<=1.05);
  assert.equal(master.rumorHintLevel,2);
  const hint=enhancedRumorHint({hint:'白い影を見た。',targetSiteId:'phantom_beast_forest'},{mastered:true});
  assert.match(hint,/Ch22/);
  assert.doesNotMatch(hint,/%|0\.\d/);
});

test('SD-10 treasure clues are textual and create no currency',()=>{
  assert.equal(Object.keys(TREASURE_CLUES).length,5);
  for(const clue of Object.values(TREASURE_CLUES)){
    assert.ok(clue.name.length>0&&clue.text.length>10);
    assert.equal('currency' in clue,false);
    assert.doesNotMatch(clue.text,/%/);
  }
});

test('SD-9 representative multi-region chain is Old King -> Library -> Dragonbone',()=>{
  assert.deepEqual(SECRET_CHAIN.steps.map(x=>x.siteId),['old_king_tomb','inverted_library','dragonbone_canyon']);
  const cleared=new Set(['secret-old-king-tomb','secret-inverted-library']);
  const mid=secretChainProgress({isStageCleared:id=>cleared.has(id)});
  assert.equal(mid.completed,2);assert.equal(mid.resolved,false);assert.equal(mid.next.siteId,'dragonbone_canyon');
  cleared.add('secret-dragonbone-canyon');
  assert.equal(secretChainProgress({isStageCleared:id=>cleared.has(id)}).resolved,true);
});

test('Pack C reuses world2 discoveries, existing Codex surface, and no Home button',()=>{
  const runtime=fs.readFileSync(new URL('../js/patches/systemDeepeningPackC.js',import.meta.url),'utf8');
  const home=fs.readFileSync(new URL('../js/patches/homeNavigation.js',import.meta.url),'utf8');
  assert.match(home,/systemDeepeningPackC\.js/);
  assert.match(runtime,/world2\.discoveries/);
  assert.match(runtime,/monsterCodexContent/);
  assert.match(runtime,/goMonsterCodexBtn/);
  assert.doesNotMatch(runtime,/createElement\(['"]section['"]\).*rumorScreen/s);
  assert.doesNotMatch(home,/goRumor|RumorBtn|噂手帳.*menu-card/);
  assert.doesNotMatch(runtime,/currency|daily|weekly/i);
});

test('Secret chain resolves to a clue, not a premature central-world reveal',()=>{
  assert.match(SECRET_CHAIN.resolution,/場所そのものは特定できない/);
  assert.doesNotMatch(SECRET_CHAIN.resolution,/東京|日本|Tokyo|Japan/);
});
