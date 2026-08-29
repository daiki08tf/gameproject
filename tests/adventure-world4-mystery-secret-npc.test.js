import test from 'node:test';
import assert from 'node:assert/strict';
import { state } from '../js/state.js';
import { defaultAdventure4Session } from '../js/patches/adventureWorld4Session.js';
import { ADVENTURE4_MYSTERIES,adventure4MysteryStage,adventure4MysterySecretVisible } from '../js/data/adventureWorld4Mysteries.js';
import { adventure4MysterySceneForStage } from '../js/data/adventureWorld4MysteryScenes.js';
import { resolveAdventure4SceneChoice,validateAdventure4Scene } from '../js/data/adventureWorld4Scenes.js';
import '../js/patches/adventureWorld4MysteryRuntime.js';
import '../js/patches/adventureWorld4SceneRuntime.js';
import '../js/patches/adventureWorld4MysterySceneRuntime.js';

function reset(){state.data.adventure4=defaultAdventure4Session();state.data.world2={discoveries:{},investigation:{traces:{},clues:{}},mysteries:{rumors:{},research:{},shortcuts:{}},npcNetwork:{people:{},tradeRoutes:{}},eventMemory:{},eventsSeen:{},eventChains:{},adventureEventMeta:{adventureIndex:0,lastSeenAdventure:{},recentEventIds:[]},flags:{}};state.data.stageProgress={};}

test('W11 mystery progresses Rumor -> Trace -> Discovery -> Research -> resolved',()=>{const m=ADVENTURE4_MYSTERIES[0];const ctx={rumors:{},traces:{},discoveries:{},research:{}};assert.equal(adventure4MysteryStage(m,ctx),'unknown');ctx.rumors[m.rumor.id]={};assert.equal(adventure4MysteryStage(m,ctx),'rumor');ctx.traces[m.traceId]={};assert.equal(adventure4MysteryStage(m,ctx),'trace');ctx.discoveries[m.discoveryId]={};assert.equal(adventure4MysteryStage(m,ctx),'discovery');ctx.research[m.researchKey]={resolved:false};assert.equal(adventure4MysteryStage(m,ctx),'research');ctx.research[m.researchKey].resolved=true;assert.equal(adventure4MysteryStage(m,ctx),'resolved');});

test('W11 authored mystery scenes are valid and optional to Story',()=>{for(const stage of ['unknown','rumor','trace','research'])assert.deepEqual(validateAdventure4Scene(adventure4MysterySceneForStage(stage)),{ok:true,errors:[]});assert.equal(ADVENTURE4_MYSTERIES[0].storyOptional,true);});

test('W12 keeps secret hidden until research or alternate composite solution',()=>{const m=ADVENTURE4_MYSTERIES[0];const base={rumors:{[m.rumor.id]:{}},traces:{[m.traceId]:{}},discoveries:{[m.discoveryId]:{}},research:{},eventMemory:{}};assert.equal(adventure4MysterySecretVisible(m,base),false);assert.equal(adventure4MysterySecretVisible(m,{...base,research:{[m.researchKey]:{resolved:false}}}),true);assert.equal(adventure4MysterySecretVisible(m,{...base,eventMemory:{'frontier-old-sluice':{status:'resolved'}}}),true);});

test('W13 recurring scholar moves Region -> Settlement while granting rumor',()=>{reset();state.startAdventure4({regionId:'frontier'});const scene=adventure4MysterySceneForStage('unknown');const res=resolveAdventure4SceneChoice(scene,'rumor','finish',{});const applied=state.applyAdventure4SceneResolution(res);assert.equal(applied.mystery.length,2);assert.ok(state.data.world2.mysteries.rumors['frontier-bell-rumor']);const sera=state.adventure4NpcNetwork().find(x=>x.id==='sera-wanderer');assert.equal(sera.meetings,1);assert.equal(sera.location,'settlement');});

test('W11 evidence can be researched at Settlement and then unlock secret scene',()=>{reset();state.recordAdventure4Rumor('frontier-bell-rumor');state.applyAdventure4MysteryEffect({type:'mysteryTrace',key:'frontier-bell-metal-dust'});state.applyAdventure4MysteryEffect({type:'mysteryDiscovery',key:'frontier-bell-stone-ring'});assert.equal(state.adventure4MysteryView('frontier-buried-bell').stage,'discovery');const research=state.researchAdventure4Mystery('frontier-buried-bell');assert.equal(research.ok,true);assert.equal(state.adventure4MysteryView('frontier-buried-bell').secretVisible,true);});

test('W12 resolving authored secret creates permanent shortcut and NPC trade connection',()=>{reset();state.recordAdventure4Rumor('frontier-bell-rumor');state.applyAdventure4MysteryEffect({type:'mysteryTrace',key:'frontier-bell-metal-dust'});state.applyAdventure4MysteryEffect({type:'mysteryDiscovery',key:'frontier-bell-stone-ring'});state.researchAdventure4Mystery('frontier-buried-bell');const secret=adventure4MysterySceneForStage('research');const res=resolveAdventure4SceneChoice(secret,'vault','finish',{});state.startAdventure4({regionId:'frontier'});const applied=state.applyAdventure4SceneResolution(res);assert.equal(applied.mystery[0].ok,true);const shortcuts=state.adventure4VisibleShortcuts('frontier');assert.equal(shortcuts.length,1);assert.equal(shortcuts[0].name,'沈鐘の地下室');assert.ok(state.data.world2.npcNetwork.tradeRoutes['frontier-scholar-path']);});

test('W12 shortcut cannot be entered before unlock and is permanent after unlock',()=>{reset();state.startAdventure4({regionId:'frontier'});assert.equal(state.enterAdventure4MysteryShortcut('frontier-bell-shortcut').ok,false);state.data.world2.mysteries.shortcuts['frontier-bell-shortcut']={regionId:'frontier',secretId:'frontier-bell-vault'};assert.equal(state.enterAdventure4MysteryShortcut('frontier-bell-shortcut').ok,true);assert.equal(state.adventure4Session().temporaryFlags['mystery:shortcutId'],'frontier-bell-shortcut');});

test('W11 waits behind an unfinished W10 cross-Adventure chain',()=>{reset();state.startAdventure4({regionId:'frontier'});const scene=state.adventure4ContentPackIScene();assert.equal(scene.id,'frontier-sluice-first');assert.equal(state.data.world2.mysteries.rumors['frontier-bell-rumor'],undefined);});
