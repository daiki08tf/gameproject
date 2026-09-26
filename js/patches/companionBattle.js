/* ============================================================
   Companion battle participation / 3-member party AI
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { defMitigationPct } from '../data/combatStats.js';
import { BOSS_AI_LAYER } from '../data/balance.js';
import { COMPANION_NATURES, companionTraitEffect, getCompanionSpecies } from '../data/companions.js';
import { chooseCompanionSkill, unlockedCompanionSkills } from '../data/companionSkills.js';
import { bondSignatureSkillFor } from '../data/companionBondSkills.js';
import { COMPANION_COMBOS } from '../data/companionSynergies.js';
import { showToast } from './toastFeedback.js';
import { Audio_ } from '../audio.js';

export const BOSS_COMPANION_COMBAT = Object.freeze({
  BASIC_CLEAVE_CHANCE: 0.22,
  BASIC_CLEAVE_MULT: 0.38,
  BASIC_HP_FLOOR: 0.045,
  BASIC_HP_CAP: 0.10,
  SPECIAL_SPLASH_MULT: 0.42,
  SPECIAL_HP_FLOOR: 0.14,
  SPECIAL_HP_CAP: 0.32,
  SPECIAL_KIND_MULT: Object.freeze({ slam:1.00, charge:1.15, projectile:0.85 }),
  NATURE_DAMAGE_MULT: Object.freeze({ defensive:0.70, support:0.90, balanced:1.0, aggressive:1.10 }),
});

/* Session 7 — Formation（隊列）。パーティ3枠はそのまま
   前衛・中衛・後衛の位置を意味する。SRPGの盤面ではなく、
   「置き方を考えると少し報われる」軽量な tactical 層。
     前衛 … 敵の仲間攻撃を引き受けやすい。HP/DEF/ATKが少し上がる
     中衛 … バランス。全能力がわずかに上がる
     後衛 … 敵に狙われにくい。MAG/SPDが少し上がる */
export const COMPANION_FORMATION = Object.freeze({
  0: { key:'front',  label:'前衛', hpMult:1.05, atkMult:1.04, defMult:1.10, magMult:1.00, spdMult:1.00, targetWeight:1.6 },
  1: { key:'center', label:'中衛', hpMult:1.04, atkMult:1.02, defMult:1.02, magMult:1.02, spdMult:1.02, targetWeight:1.0 },
  2: { key:'rear',   label:'後衛', hpMult:1.00, atkMult:1.00, defMult:1.00, magMult:1.10, spdMult:1.08, targetWeight:0.55 },
});
export function companionFormationLabel(slot){return COMPANION_FORMATION[slot]?.label||`枠${slot+1}`;}

function battleCompanionFrom(c, slot, synergy = {}, homeMult = 1) {
  const f=COMPANION_FORMATION[slot]||{};
  const mult=(k)=>((synergy[k]||1)*(f[k]||1)*(k==='hpMult'||k==='atkMult'||k==='defMult'?homeMult:1));
  const hp=Math.max(1,Math.round(c.stats.hp*mult('hpMult')));
  const bondLevel=c.instance?state.companionBond?.(c.id)?.level||1:1;
  return {
    id:c.id,slot,name:c.instance.nickname||c.species.name,speciesId:c.instance.baseSpeciesId||c.species.id,
    // 倒した個体が持っていた特性（Elite Affix / Rare行動由来）はinstanceに
    // 保存され、種族特性と並んで戦闘でも効く — 「戦った個体が仲間になる」。
    nature:c.instance.nature,traits:[...(c.species.traits||[]),...(c.instance.inheritedTraits||[])],level:c.instance.level||1,
    bondLevel,signatureId:bondSignatureSkillFor({id:c.id,speciesId:c.species.id,species:c.species})?.id||null,
    hp,maxHp:hp,mp:c.stats.mp,maxMp:c.stats.mp,
    atk:Math.max(1,Math.round(c.stats.atk*mult('atkMult'))),
    def:Math.max(1,Math.round(c.stats.def*mult('defMult'))),
    mag:Math.max(1,Math.round(c.stats.mag*mult('magMult'))),
    spd:Math.max(1,Math.round(c.stats.spd*mult('spdMult'))),down:false,
  };
}
function ensureCompanionBattle(engine) {
  if(engine._companionBattleReady)return;engine._companionBattleReady=true;
  const party=state.activeCompanions?state.activeCompanions():(state.activeCompanion?.()?[state.activeCompanion()]:[]);
  const synergy=state.companionSynergySummary?.()||{active:[],total:{}};
  engine.companionSynergies=synergy.active||[];
  // Session 7 — Denlordの領域。chapter.denlordHome に書かれた巣の主が
  // 縄張りに戻ったとき、少しだけ本領を発揮する（1.1倍、大きくしない）。
  const homeDenlord=engine.chapter?.denlordHome||null;
  engine.companions=party.slice(0,3).map((c,i)=>{
    const spId=c.instance?.baseSpeciesId||c.species?.id;
    const home=homeDenlord&&homeDenlord===spId?1.1:1;
    const bc=battleCompanionFrom(c,i,synergy.total,home);
    if(home>1)bc._homeDenlord=true;
    return bc;
  });
  engine.companion=engine.companions[0]||null;
}
function livingCompanions(engine){ensureCompanionBattle(engine);return(engine.companions||[]).filter(c=>!c.down&&c.hp>0);}
// C6-5: a species' current grade (state.ranchSpeciesGrade) scales the
// POWER of its own already-authored trait rather than adding a new stat
// line -- see data/monsterRanch.js's speciesGradeTraitMult for the full
// rationale. Below Legendary the multiplier is 1 (no-op), so this is a
// pure extension of the existing trait system, not a new one.
function traitEffect(companion,kind){for(const name of companion?.traits||[]){const effect=companionTraitEffect(name);if(effect?.kind===kind){const mult=state.ranchSpeciesGrade?.(companion.speciesId)?.traitMult||1;return mult===1?effect:{...effect,power:effect.power*mult};}}return null;}
function effectiveCompanionSpd(companion){const effect=traitEffect(companion,'initiativeSpd');return companion.spd*(1+(effect?.power||0));}
/* Session 6 — 号令（Companion Orders）。1戦闘に各1回だけ使える
   限定的な指示レイヤ。プレイヤーの行動を消費せず、そのターンの
   仲間行動だけを上書きする（「読み」を報いる tactical 層）。
     focus   狙いを定めろ … そのターン全員が最もHPの低い敵を狙う
     brace   守りを固めろ … そのターン仲間の被ダメージ-38%(絆Lv7で-45%)
     unleash 解放しろ     … そのターン仲間は最高威力の攻撃技を使い
                            威力+25%（絆Lv7で+35%）。MP切れなら通常AI */
export const COMPANION_ORDERS = Object.freeze({
  focus:   { id: 'focus',   name: '狙いを定めろ', desc: 'このターン全員が最も弱った敵を集中攻撃' },
  brace:   { id: 'brace',   name: '守りを固めろ', desc: 'このターン仲間の被ダメージを大きく減らす' },
  unleash: { id: 'unleash', name: '解放しろ',     desc: 'このターン仲間が最高威力の攻撃を繰り出す' },
  /* Session 7 — 絆が深いほど使える戦術号令が増える。
       protect 護衛せよ 絆Lv4  … このターン仲間への攻撃を前衛が引き受ける
       rally   立て直せ  絆Lv7  … 仲間全員のHPを少し回復する
       charge  突貫せよ  絆Lv10 … このターン仲間全員が先手で動き与ダメージ+25% */
  protect: { id: 'protect', name: '護衛せよ', desc: 'このターン仲間への攻撃を前衛が引き受ける', bondReq: 4 },
  rally:   { id: 'rally',   name: '立て直せ', desc: '仲間全員のHPを少し回復する', bondReq: 7 },
  charge:  { id: 'charge',  name: '突貫せよ', desc: 'このターン仲間全員が先手で動き与ダメージ+25%', bondReq: 10 },
});
function maxPartyBond(engine){return Math.max(1,...(engine.companions||[]).map(c=>c.bondLevel||1));}
function companionOrdersAvailable(engine){const maxBond=maxPartyBond(engine);return Object.values(COMPANION_ORDERS).filter(o=>!o.bondReq||maxBond>=o.bondReq);}
BattleEngine.prototype.issueCompanionOrder=function issueCompanionOrder(orderId){
  ensureCompanionBattle(this);
  if(!(this.companions||[]).some(c=>!c.down&&c.hp>0))return false;
  this._ordersUsed ||= {};
  const order=COMPANION_ORDERS[orderId];
  if(this._ordersUsed[orderId]||!order)return false;
  if(order.bondReq&&maxPartyBond(this)<order.bondReq)return false;
  this._ordersUsed[orderId]=true;
  this._activeOrder=orderId;
  if(orderId==='focus'){
    const alive=this.aliveEnemies||[];
    this._focusTargetId=[...alive].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0]?.id||null;
  }
  if(orderId==='brace')for(const c of livingCompanions(this))c._brace=true;
  if(orderId==='protect'){
    const alive=livingCompanions(this);
    const guard=alive.find(c=>c.slot===0)||alive[0];
    if(guard){guard._brace=true;this._protectTargetId=guard.id;}
  }
  if(orderId==='rally')for(const c of livingCompanions(this)){const amt=Math.max(1,Math.round(c.maxHp*.10+(c.mag||0)*.4));c.hp=Math.min(c.maxHp,c.hp+amt);}
  if(orderId==='charge')this._chargeBoost=1.25;
  return true;
};

function chooseTarget(engine,companion,skill=null){const alive=engine.aliveEnemies;if(!alive.length)return null;if(engine._focusTargetId){const marked=alive.find(e=>e.id===engine._focusTargetId);if(marked)return marked;}if(skill?.preferLowHp)return[...alive].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];const nature=COMPANION_NATURES[companion.nature]||COMPANION_NATURES.balanced;if(nature.ai==='aggressive')return[...alive].sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0];if(nature.ai==='defensive')return[...alive].sort((a,b)=>b.atk-a.atk)[0];return alive[Math.floor(Math.random()*alive.length)];}
function companionDamage(companion,target,skill=null,engine=null){const nature=COMPANION_NATURES[companion.nature]||COMPANION_NATURES.balanced;let stat=skill?.stat==='mag'?companion.mag:companion.atk;if(!skill&&nature.ai==='support'&&companion.mag>companion.atk)stat=companion.mag*.9;let power=stat*(skill?.power||1);const lowHp=traitEffect(companion,'lowHpDamage');if(lowHp&&target.hp/Math.max(1,target.maxHp)<=(lowHp.threshold??.5))power*=1+lowHp.power;if(skill?.bonusVsDebuff&&target._companionAtkDebuffTurns>0)power*=skill.bonusVsDebuff;if(skill?.allyDownBonus&&engine&&(engine.companions||[]).some(c=>c!==companion&&(c.down||c.hp<=0)))power*=skill.allyDownBonus;if(companion._comboPending)power*=companion._comboPending.mult;if(engine?._chargeBoost)power*=engine._chargeBoost;const raw=Math.max(1,power*(.90+Math.random()*.20));const mitigation=defMitigationPct(target.def||0);return Math.max(1,Math.round(raw*(1-mitigation)));}
function companionNatureDamageMult(companion){const ai=(COMPANION_NATURES[companion?.nature]||COMPANION_NATURES.balanced).ai||'balanced';return BOSS_COMPANION_COMBAT.NATURE_DAMAGE_MULT[ai]||1;}
function enemyDamageToCompanion(enemy,companion,mult=1){let raw=Math.max(1,enemy.atk*mult*(.92+Math.random()*.16));const physicalMitigation=traitEffect(companion,'physicalMitigation');if(physicalMitigation)raw*=1-physicalMitigation.power;const mitigation=defMitigationPct(companion.def||0);return Math.max(1,Math.round(raw*(1-mitigation)));}
function bossDamageToCompanion(enemy,companion,mult=1,{floorPct=0,capPct=1}={}){
  const base=enemyDamageToCompanion(enemy,companion,mult),nature=companionNatureDamageMult(companion),physicalMitigation=traitEffect(companion,'physicalMitigation')?.power||0;
  const floor=Math.max(1,Math.round(companion.maxHp*floorPct*nature*(1-physicalMitigation)));
  const cap=Math.max(floor,Math.round(companion.maxHp*capPct*nature));
  return Math.max(floor,Math.min(cap,base));
}
function executeHeal(engine,companion,skill){
  companion.mp-=skill.mpCost||0;
  let target=companion;
  if(skill.target==='ally')target=livingCompanions(engine).filter(c=>c.hp<c.maxHp).sort((a,b)=>(a.hp/a.maxHp)-(b.hp/b.maxHp))[0]||companion;
  else if(skill.target==='player'&&engine.player)target=engine.player;
  const amount=Math.max(1,Math.round(target.maxHp*(skill.maxHpPct||0)+companion.mag*(skill.power||0))),before=target.hp;
  target.hp=Math.min(target.maxHp,target.hp+amount);
  const targetName=target===engine.player?'プレイヤー':target.name;
  return{action:'skill',companion:true,companionId:companion.id,companionName:companion.name,name:`${companion.name}の${skill.name}`,techType:'heal',healAmount:target.hp-before,mpRestored:0,buffed:false,targets:[{targetName,healed:target.hp-before}]};
}
function applySkillDebuff(target,skill){const debuff=skill?.debuff;if(!debuff)return null;if(debuff.kind==='weakenAtk'){target._companionAtkDebuffMult=Math.max(.1,1-debuff.power);target._companionAtkDebuffTurns=Math.max(target._companionAtkDebuffTurns||0,debuff.turns||1);return{kind:debuff.kind,power:debuff.power,turns:debuff.turns||1};}return null;}
function executeOffensiveSkill(engine,companion,skill){const target=chooseTarget(engine,companion,skill);if(!target)return null;companion.mp-=skill.mpCost||0;const combo=companion._comboPending||null,damage=companionDamage(companion,target,skill,engine),kill=engine._applyRawDamageAndReward(target,damage),debuff=target.dead?null:applySkillDebuff(target,skill);const lifesteal=traitEffect(companion,'lifesteal');if(lifesteal&&damage>0)companion.hp=Math.min(companion.maxHp,companion.hp+Math.max(1,Math.round(damage*lifesteal.power)));companion._comboPending=null;return{action:'skill',companion:true,companionId:companion.id,companionName:companion.name,name:combo?`${combo.name}：${companion.name}の${skill.name}`:`${companion.name}の${skill.name}`,comboId:combo?.id,techType:skill.type==='debuff'?'damage':skill.type,targets:[{targetId:target.id,targetName:target.name,damage,critical:false,defeated:target.dead,effects:debuff?[debuff]:[],kill}]};}
function performCompanionTurn(engine, companion = null) {ensureCompanionBattle(engine);const c=companion||engine.companion;if(!c||c.down||c.hp<=0||engine.over)return null;const species=getCompanionSpecies(c.speciesId);if(!species)return null;const regen=traitEffect(c,'regen');if(regen&&c.hp<c.maxHp)c.hp=Math.min(c.maxHp,c.hp+Math.max(1,Math.round(c.maxHp*regen.power)));
  // 号令「解放しろ」: 最高威力の攻撃技を選び、威力に号令倍率を乗せる。
  // MPが足りなければ通常AIへフォールバック（号令を無駄にしない）。
  let skill=null,orderTag=null;
  if(engine._activeOrder==='unleash'){
    const pool=unlockedCompanionSkills(species,c.level||1,c).filter(s=>s.type!=='heal'&&(c.mp||0)>=(s.mpCost||0));
    if(pool.length){const top=pool.sort((a,b)=>(b.power||0)-(a.power||0))[0];const mult=c.bondLevel>=7?1.35:1.25;skill={...top,power:(top.power||1)*mult};orderTag='解放';}
  }
  if(!skill)skill=chooseCompanionSkill(species,c,engine.aliveEnemies,{engine,player:engine.player,companions:engine.companions||[]});
  if(!skill)return null;
  // 絆Lv10「魂の契り」: 署名技の威力+15%。個体の到達点として静かに効く。
  if(c.signatureId&&skill.id===c.signatureId&&(c.bondLevel||1)>=10)skill={...skill,power:(skill.power||1)*1.15};
  let result=skill.type==='heal'?executeHeal(engine,c,skill):executeOffensiveSkill(engine,c,skill);
  if(result&&orderTag)result={...result,name:`号令・${orderTag}：${result.name}`};
  return result;}
function companionCanBeTargeted(engine){return livingCompanions(engine).length>0;}
function applyDamageToCompanion(enemy,c,mult=1,opts=null){const taken=Math.max(.25,Number(state.playerTreeCompanionTakenMult?.())||1);let damage=Math.max(1,Math.round((opts?bossDamageToCompanion(enemy,c,mult,opts):enemyDamageToCompanion(enemy,c,mult))*taken));if(c._brace)damage=Math.max(1,Math.round(damage*((c.bondLevel||1)>=7?.55:.62)));c.hp=Math.max(0,c.hp-damage);if(c.hp<=0)c.down=true;return{enemyId:enemy.id,name:enemy.name,kind:'attack',damage,evaded:false,companionTarget:true,companionId:c.id,companionName:c.name,companionHp:c.hp,companionMaxHp:c.maxHp,companionDown:c.down};}
/* Session 7 — Formation ターゲット選択。前衛ほど敵の仲間攻撃を
   引き受けやすく、後衛は狙われにくい。号令「護衛せよ」が立つと
   指定の護衛役へ全て集中する。 */
function pickCompanionTarget(engine){
  const alive=livingCompanions(engine);if(!alive.length)return null;
  if(engine._protectTargetId){const guarded=alive.find(c=>c.id===engine._protectTargetId);if(guarded)return guarded;}
  const weight=c=>COMPANION_FORMATION[c.slot]?.targetWeight??1;
  const total=alive.reduce((a,c)=>a+weight(c),0);
  let roll=Math.random()*total;
  for(const c of alive){roll-=weight(c);if(roll<=0)return c;}
  return alive[alive.length-1];
}
function hitCompanion(engine,enemy,mult=1,opts=null){const c=pickCompanionTarget(engine);if(!c)return null;return applyDamageToCompanion(enemy,c,mult,opts);}
function bossSpecialBaseMult(kind){if(kind==='slam')return BOSS_AI_LAYER.SLAM_DAMAGE_MULT||1;if(kind==='charge')return BOSS_AI_LAYER.CHARGE_DAMAGE_MULT||1;if(kind==='projectile')return BOSS_AI_LAYER.PROJECTILE_DAMAGE_MULT||1;return 1;}
function bossCompanionCollateral(engine,enemy,result){
  if(!enemy?.boss||!result||!companionCanBeTargeted(engine))return [];
  if(result.kind==='special'){
    const kindMult=BOSS_COMPANION_COMBAT.SPECIAL_KIND_MULT[result.specialKind]||1,mult=bossSpecialBaseMult(result.specialKind)*BOSS_COMPANION_COMBAT.SPECIAL_SPLASH_MULT;
    const opts={floorPct:BOSS_COMPANION_COMBAT.SPECIAL_HP_FLOOR*kindMult,capPct:BOSS_COMPANION_COMBAT.SPECIAL_HP_CAP*kindMult};
    return [...livingCompanions(engine)].map(c=>applyDamageToCompanion(enemy,c,mult,opts));
  }
  if(result.kind==='attack'&&Math.random()<BOSS_COMPANION_COMBAT.BASIC_CLEAVE_CHANCE){
    const hit=hitCompanion(engine,enemy,BOSS_COMPANION_COMBAT.BASIC_CLEAVE_MULT,{floorPct:BOSS_COMPANION_COMBAT.BASIC_HP_FLOOR,capPct:BOSS_COMPANION_COMBAT.BASIC_HP_CAP});return hit?[hit]:[];
  }
  return [];
}
function withCompanionEnemyDebuff(enemy,fn){if(!enemy||!enemy._companionAtkDebuffTurns||!enemy._companionAtkDebuffMult)return fn();const originalAtk=enemy.atk;enemy.atk=Math.max(1,Math.round(originalAtk*enemy._companionAtkDebuffMult));try{return fn();}finally{enemy.atk=originalAtk;enemy._companionAtkDebuffTurns-=1;if(enemy._companionAtkDebuffTurns<=0){delete enemy._companionAtkDebuffTurns;delete enemy._companionAtkDebuffMult;}}}
const originalPerformEnemyTurn=BattleEngine.prototype.performEnemyTurn;
BattleEngine.prototype.performEnemyTurn=function patchedPerformEnemyTurn(enemy){ensureCompanionBattle(this);if(enemy&&enemy.frozenTurns>0)return originalPerformEnemyTurn.call(this,enemy);return withCompanionEnemyDebuff(enemy,()=>{if(!enemy.dead&&!enemy.boss&&companionCanBeTargeted(this)){const candidates=livingCompanions(this),defensive=candidates.filter(c=>(COMPANION_NATURES[c.nature]||COMPANION_NATURES.balanced).ai==='defensive'),targetChance=.28+(defensive.length?.07:0);if(Math.random()<targetChance)return hitCompanion(this,enemy);}const result=originalPerformEnemyTurn.call(this,enemy);if(enemy?.boss&&result)result.companionSplash=bossCompanionCollateral(this,enemy,result);return result;});};
function companionHitLog(r,label='攻撃'){return{type:'playerAction',result:{action:'skill',name:`${r.name}の${label}${r.companionDown?`（${r.companionName}は力尽きた）`:''}`,techType:'damage',targets:[{targetName:r.companionName,damage:r.damage,critical:false,defeated:r.companionDown,effects:[],kill:null}]}};}
function convertCompanionCombatEvent(event){if(!event||event.type!=='enemyAction'||!event.result)return[event];const r=event.result;if(r.companionTarget)return[companionHitLog(r)];const splash=Array.isArray(r.companionSplash)?r.companionSplash.filter(Boolean):[];if(!splash.length)return[event];return[event,...splash.map(x=>companionHitLog(x,r.kind==='special'?'特殊攻撃の余波':'攻撃の巻き込み'))];}
function companionActsBeforeEnemyPhase(engine,c=null){ensureCompanionBattle(engine);const companion=c||engine.companion,enemies=engine.aliveEnemies;if(!companion||companion.down||!enemies.length)return false;if(engine._activeOrder==='charge')return true;const fastestEnemy=Math.max(...enemies.map(e=>e.spd||0));return effectiveCompanionSpd(companion)>=fastestEnemy;}
function armCombo(engine,leader){for(const combo of COMPANION_COMBOS){if(!combo.leader(leader))continue;const next=(engine.companions||[]).find(c=>c!==leader&&!c.down&&c.hp>0&&!engine._companionsActedThisRound.has(c.id)&&!c._comboPending&&combo.follower(c));if(next){next._comboPending={id:combo.id,name:`連携・${combo.name}`,mult:combo.dmgMult};return;}}}
function actCompanions(engine,predicate){const events=[];for(const c of livingCompanions(engine)){if(engine._companionsActedThisRound.has(c.id))continue;if(predicate&&!predicate(c))continue;const result=performCompanionTurn(engine,c);if(result){engine._companionsActedThisRound.add(c.id);armCombo(engine,c);events.push({type:'playerAction',result});if(engine.aliveEnemies.length===0)break;}}return events;}
const originalRunEnemyPhase=BattleEngine.prototype._runEnemyPhase;
BattleEngine.prototype._runEnemyPhase=function patchedRunEnemyPhase(){ensureCompanionBattle(this);this._companionsActedThisRound||=new Set();const events=actCompanions(this,c=>companionActsBeforeEnemyPhase(this,c));if(this.aliveEnemies.length>0&&this.player.hp>0)events.push(...originalRunEnemyPhase.call(this));return events;};
const originalAdvanceTurn=BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn=function patchedAdvanceTurn(command){ensureCompanionBattle(this);this._companionsActedThisRound=new Set();for(const c of this.companions||[])delete c._comboPending;const out=originalAdvanceTurn.call(this,command);if(out.events)out.events=out.events.flatMap(convertCompanionCombatEvent);const blocked=out.events&&out.events.some(ev=>ev.type==='playerAction'&&ev.result&&ev.result.blocked),fled=out.result&&out.result.retreated;if(!blocked&&!fled&&!out.over&&this.player.hp>0&&this.aliveEnemies.length>0)out.events.push(...actCompanions(this));if(!out.over&&this.aliveEnemies.length===0){const end=this.checkBattleEnd();if(end.over){out.over=true;out.result=this.finalResult;}}// 号令はそのターン限り：消費した指示を掃除する（used履歴は残る）。
this._activeOrder=null;this._focusTargetId=null;this._protectTargetId=null;this._chargeBoost=null;for(const c of this.companions||[])delete c._brace;return out;};
const originalGrantKillRewards=BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards=function patchedGrantKillRewards(enemy){const result=originalGrantKillRewards.call(this,enemy);if(result&&(enemy.xp||0)>0&&state.gainPartyCompanionExp){const gained=Math.round(enemy.xp*.75);if(gained>0){const awards=state.gainPartyCompanionExp(gained);result.companionExpAwards=awards;result.companionExp=awards[0]?.gained||0;result.companionLeveledUp=awards.some(x=>x.leveledUp);}}return result;};
function ensureCompanionHud(screen){if(!screen||!screen.engine)return null;ensureCompanionBattle(screen.engine);let el=document.getElementById('tbCompanionHud');if(!screen.engine.companions?.length){if(el)el.remove();return null;}if(!el){el=document.createElement('div');el.id='tbCompanionHud';el.className='forge-card-sub';el.style.padding='5px 10px';el.style.margin='4px 8px';document.querySelector('#textBattleScreen .tb-hud')?.appendChild(el);}return el;}
const originalRender=TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render=function patchedCompanionRender(){originalRender.call(this);const el=ensureCompanionHud(this);if(!el)return;const synergy=this.engine.companionSynergies?.length?`<div>シナジー: ${this.engine.companionSynergies.map(s=>s.name).join(' / ')}</div>`:'';el.innerHTML=synergy+this.engine.companions.map((c)=>{const down=c.down||c.hp<=0;return `<div style="opacity:${down?.55:1}">【${companionFormationLabel(c.slot)}】${c.name} Lv.${c.level}　HP ${Math.max(0,c.hp)}/${c.maxHp}　MP ${Math.max(0,c.mp)}/${c.maxMp}${c._homeDenlord?'　【領域】':''}${down?'　【戦闘不能】':''}</div>`;}).join('');
  // 号令ボタン: 1戦闘に各1回。使用済みは無効化し、発行したら即再描画。
  // Session 7 — 絆Lv不足の号令は鍵付きで表示し、解放条件を教える。
  const engine=this.engine,used=engine._ordersUsed||{},maxBond=maxPartyBond(engine);
  const row=document.createElement('div');row.style.cssText='display:flex;gap:6px;margin-top:4px;flex-wrap:wrap';
  for(const order of Object.values(COMPANION_ORDERS)){
    const locked=order.bondReq&&maxBond<order.bondReq;
    const btn=document.createElement('button');btn.type='button';btn.className='btn-sub';btn.style.cssText='padding:3px 8px;font-size:11px';
    const active=engine._activeOrder===order.id,isUsed=!!used[order.id];
    btn.textContent=locked?`号令:？？？（絆Lv${order.bondReq}）`:`号令:${order.name}`;
    btn.title=locked?`絆Lv${order.bondReq}以上の仲間がいると使える：${order.desc}`:order.desc;
    btn.disabled=locked||isUsed||engine.over;
    if(active)btn.classList.add('active');
    if(isUsed||locked)btn.style.opacity='.45';
    btn.addEventListener('click',()=>{if(engine.issueCompanionOrder(order.id)){Audio_.tap();showToast(`[号令] ${order.name}`,1400);this._render();}});
    row.appendChild(btn);
  }
  el.appendChild(row);};
export { performCompanionTurn,effectiveCompanionSpd,companionDamage,enemyDamageToCompanion,bossDamageToCompanion,applySkillDebuff,livingCompanions,bossCompanionCollateral,companionNatureDamageMult };
