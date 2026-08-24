import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { buildSecretRealmStage } from '../js/data/secretRealms.js';
import { world2KeyStageDescriptor,world2KeyStageDescriptors } from '../js/data/world2Stages.js';

test('World 2.0 exposes four playable key dungeon descriptors',()=>{const rows=world2KeyStageDescriptors();assert.equal(rows.length,4);assert.ok(rows.every(x=>x.keyDungeon&&x.id.startsWith('secret-worldkey-')));});
test('key dungeon ids round-trip through existing secret-stage resolver',()=>{for(const d of world2KeyStageDescriptors()){const stage=buildSecretRealmStage(d.id);assert.ok(stage);assert.equal(stage.id,d.id);assert.equal(stage.keyDungeon,true);assert.ok(stage.waves?.length>0);assert.ok(stage.recLevel>0);}});
test('anomaly dungeon keeps the modern-world reveal mysterious',()=>{const d=world2KeyStageDescriptor('anomaly');assert.match(d.name,/境界異常点/);assert.ok(d.modifiers.some(x=>x.desc.includes('機械')));});
test('journey and stage UIs expose the boundary-key route without changing CHAPTERS',()=>{const journey=fs.readFileSync(new URL('../js/screens/chapterSelect.js',import.meta.url),'utf8');const stage=fs.readFileSync(new URL('../js/screens/stageSelect.js',import.meta.url),'utf8');assert.match(journey,/境界鍵路/);assert.match(stage,/world2ForgeKey/);assert.match(stage,/鍵は出撃時に1本消費|出撃時に鍵を1本消費/);});
test('World 2 core consumes a key at battle start and tracks dungeon clears',()=>{const src=fs.readFileSync(new URL('../js/patches/world2Core.js',import.meta.url),'utf8');assert.match(src,/secret-worldkey-/);assert.match(src,/world2UseKey/);assert.match(src,/keyDungeonClears/);assert.match(src,/modernSignal/);});
