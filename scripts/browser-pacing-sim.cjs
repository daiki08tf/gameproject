/* ============================================================
   Blade Vale — pacing measurement on the REAL game (browser)
   ------------------------------------------------------------
   Loads index.html in headless Chromium — the complete module graph, every
   patch — and drives BattleEngine through the same playthrough loop as
   scripts/progression-pacing-sim.mjs. Prefer this one for balance decisions:
   the Node sim imports a hand-maintained patch list and silently lacks
   ~20 modules (e.g. progression3OuterStory, which re-levels chapters 21-30),
   so its numbers drift from the shipped game, badly so past chapter 20.

   Needs Playwright + Chromium on the machine (not a repo dependency) and a
   static server on the repo root:
     python3 -m http.server 8765 &
     node scripts/browser-pacing-sim.cjs --to 15 --seed 42
     node scripts/browser-pacing-sim.cjs --to 20 --abyss 40 --policy casual

   Flags: --from/--to chapter range, --seed, --policy smart|casual,
          --farmStep N (farm runs between retries, default 2), --tries N,
          --abyss N (then climb Abyss floors 1..N), --port,
          --tempo "KEY=V,..." (override BATTLE_TEMPO_LAYER for a tuning run)
   Output (TSV): stage, recLevel, lvBefore, lvAfter, firstTry, attempts,
          farmRuns, result, rounds, damageTaken/maxHp, minHp%, kind
   Nothing is saved: state.save is stubbed inside the page.
   ============================================================ */
const { chromium } = require('playwright');
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1];};
(async()=>{const b=await chromium.launch();const p=await (await b.newContext()).newPage();
 p.on('pageerror',e=>console.error('PE',String(e).slice(0,200)));
 await p.goto(`http://127.0.0.1:${arg('port',8765)}/index.html`);await p.waitForLoadState('networkidle');
 const out=await p.evaluate(async(o)=>{
  const {state}=await import('/js/state.js');const {BattleEngine}=await import('/js/battleEngine.js');const {CHAPTERS}=await import('/js/data/stages.js');const {getItem}=await import('/js/data/equipment.js');
  const bal=await import('/js/data/balance.js');
  if(o.tempo&&bal.BATTLE_TEMPO_LAYER)for(const pair of o.tempo.split(',')){const [k,v]=pair.split('=');if(k in bal.BATTLE_TEMPO_LAYER)bal.BATTLE_TEMPO_LAYER[k]=Number(v);}
  let rs=(o.seed>>>0)||42;Math.random=()=>{rs=(rs*1664525+1013904223)>>>0;return rs/4294967296;};
  state.save=()=>{};
  const pick=(eng)=>{const hr=eng.player.hp/eng.player.maxHp;const own=eng.availableConsumables(),has=id=>own.find(x=>x.id===id);
   if(o.policy==='casual'){if(hr<0.35&&has('item_hiherb'))return{type:'item',itemId:'item_hiherb'};if(hr<0.35&&has('item_herb'))return{type:'item',itemId:'item_herb'};const t0=eng.aliveEnemies[0];return{type:'attack',targetId:t0&&t0.id};}
   const skills=eng.availableSkills().filter(t=>eng._probeTechnique('skill',t.id).ok),spells=eng.availableSpells().filter(t=>eng._probeTechnique('spell',t.id).ok);
   const heal=spells.find(t=>t.type==='heal'),boss=eng.aliveEnemies.some(e=>e.boss);
   if(boss&&!eng._wc&&has('item_warcry')){eng._wc=1;return{type:'item',itemId:'item_warcry'};}
   if(heal&&hr<0.5)return{type:'spell',techId:heal.id};if(hr<0.35&&has('item_hiherb'))return{type:'item',itemId:'item_hiherb'};if(hr<0.30&&has('item_herb'))return{type:'item',itemId:'item_herb'};
   const dmg=[...skills,...spells].filter(t=>t.type==='damage'||t.type==='burst');if(eng.aliveEnemies.some(e=>e.pendingSpecial))return{type:'guard'};
   const target=eng.aliveEnemies.find(e=>e.boss)||eng.aliveEnemies[0];if(dmg.length&&target){const t=dmg[dmg.length-1];return{type:skills.includes(t)?'skill':'spell',techId:t.id,targetId:target.id};}
   if(hr<0.15)return{type:'guard'};return{type:'attack',targetId:target&&target.id};};
  const play=(id)=>{let eng;try{eng=new BattleEngine(id);}catch(e){return{cleared:false,rounds:0,err:e.message};}let r,taken=0,last=eng.player.hp,minHp=1;
   do{r=eng.advanceTurn(pick(eng));const d=eng.player.hp-last;if(d<0)taken-=d;last=eng.player.hp;minHp=Math.min(minHp,eng.player.hp/eng.player.maxHp);}while(!r.over&&eng.round<800);
   return{cleared:!!eng.finalResult?.cleared,rounds:eng.round,taken:taken/eng.player.maxHp,minHp};};
  const maintain=()=>{state.autoEquipBest();for(const [id,q] of Object.entries({...state.data.inventory})){const it=getItem(id);if(!it||state.isItemLocked?.(id))continue;state.dismantleItem(id,q);}
   const w=state.data.equipped.weapon;if(w){for(let i=0;i<10&&state.canEnhanceWeapon(w,false);i++)state.enhanceWeapon(w,false);for(let i=0;i<10&&state.canEnhanceWeapon(w,true);i++)state.enhanceWeapon(w,true);}
   while(state.consumableCount('item_herb')<4&&state.canBuyConsumable('item_herb'))state.buyConsumable('item_herb');
   if(state.data.gold>400&&state.consumableCount('item_hiherb')<3)state.buyConsumable('item_hiherb');if(state.data.gold>600&&state.consumableCount('item_warcry')<2)state.buyConsumable('item_warcry');};
  const rows=[],done=[];const find=id=>{for(const c of CHAPTERS){const s=(c.stages||[]).find(x=>x.id===id);if(s)return s;}};
  outer:for(const ch of CHAPTERS){if(!/^ch\d+$/.test(ch.id)||ch.num<o.from||ch.num>o.to)continue;
   for(const st of ch.stages){if(st.branch||st.bounty||st.sideLocation)continue;const lv0=state.characterLevel;let tries=0,farm=0,r,first=true;
    while(tries<o.tries){tries++;maintain();r=play(st.id);if(r.cleared)break;first=false;const ft=done.map(find).sort((a,b)=>b.recLevel-a.recLevel)[0];for(let g=0;g<o.farmStep&&ft;g++){maintain();play(ft.id);farm++;}}
    rows.push([st.id,st.recLevel,lv0,state.characterLevel,first?'yes':'no',tries,farm,r.cleared?'win':'LOSS',r.rounds,(r.taken||0).toFixed(2),Math.round((r.minHp||0)*100),st.boss?'boss':(st.checkpoint||st.midBoss)?'gate':'norm'].join('\t'));
    if(!r.cleared){rows.push('STUCK '+st.id);break outer;}state.recordStageResult(st.id,true);done.push(st.id);}}
  if(o.abyss){for(let d=1;d<=o.abyss;d++){const lv0=state.characterLevel;let tries=0,farm=0,r,first=true;while(tries<o.tries){tries++;maintain();r=play('abyss-'+d);if(r.cleared)break;first=false;if(d>1)for(let g=0;g<o.farmStep;g++){maintain();play('abyss-'+(d-1));farm++;}}
    let rec=0;try{rec=new BattleEngine('abyss-'+d).stage.recLevel;}catch(e){}
    rows.push(['A-'+d,rec,lv0,state.characterLevel,first?'yes':'no',tries,farm,r.cleared?'win':'LOSS',r.rounds,(r.taken||0).toFixed(2),Math.round((r.minHp||0)*100),d%10===0?'boss':'norm'].join('\t'));
    if(!r.cleared){rows.push('STUCK A-'+d);break;}state.recordAbyssClear?.(d);}}
  return rows.join('\n');},{seed:+arg('seed',42),policy:arg('policy','smart'),from:+arg('from',1),to:+arg('to',15),tries:+arg('tries',14),farmStep:+arg('farmStep',2),abyss:+arg('abyss',0),tempo:arg('tempo','')});
 console.log(out);await b.close();})();
