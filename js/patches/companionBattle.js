/* ============================================================
   Companion System Phase 2.1 - battle participation / survival AI
   ------------------------------------------------------------
   Keeps the existing BattleEngine turn order intact and layers companion
   participation on top: autonomous attacks, HP/MP, enemy targeting,
   recovery AI, battle-down state, HUD and companion EXP.
   ============================================================ */
import { state } from '../state.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { COMPANION_NATURES } from '../data/companions.js';

function ensureCompanionBattle(engine) {
  if (engine._companionBattleReady) return;
  engine._companionBattleReady = true;
  const c = state.activeCompanion ? state.activeCompanion() : null;
  if (!c) {
    engine.companion = null;
    return;
  }
  engine.companion = {
    id: c.id,
    name: c.instance.nickname || c.species.name,
    speciesId: c.species.id,
    nature: c.instance.nature,
    level: c.instance.level || 1,
    hp: c.stats.hp,
    maxHp: c.stats.hp,
    mp: c.stats.mp,
    maxMp: c.stats.mp,
    atk: c.stats.atk,
    def: c.stats.def,
    mag: c.stats.mag,
    spd: c.stats.spd,
    down: false,
  };
}

function companionDamage(companion, target) {
  const nature = COMPANION_NATURES[companion.nature] || COMPANION_NATURES.balanced;
  let power = companion.atk;
  if (nature.ai === 'support' && companion.mag > companion.atk) power = companion.mag * 0.9;
  const variance = 0.90 + Math.random() * 0.20;
  const raw = Math.max(1, power * variance);
  const mitigation = target.def / (target.def + 55);
  return Math.max(1, Math.round(raw * (1 - mitigation)));
}

function enemyDamageToCompanion(enemy, companion, mult = 1) {
  const variance = 0.92 + Math.random() * 0.16;
  const raw = Math.max(1, enemy.atk * mult * variance);
  const mitigation = companion.def / (companion.def + 55);
  return Math.max(1, Math.round(raw * (1 - mitigation)));
}

function chooseTarget(engine, companion) {
  const alive = engine.aliveEnemies;
  if (!alive.length) return null;
  const nature = COMPANION_NATURES[companion.nature] || COMPANION_NATURES.balanced;
  if (nature.ai === 'aggressive') {
    return [...alive].sort((a, b) => (a.hp / a.maxHp) - (b.hp / b.maxHp))[0];
  }
  if (nature.ai === 'defensive') {
    return [...alive].sort((a, b) => b.atk - a.atk)[0];
  }
  return alive[Math.floor(Math.random() * alive.length)];
}

function canCompanionHeal(companion) {
  if (!companion || companion.down || companion.hp <= 0) return false;
  if (companion.hp / companion.maxHp > 0.5) return false;
  if (companion.speciesId === 'slime' && companion.level >= 8 && companion.mp >= 4) return true;
  const nature = COMPANION_NATURES[companion.nature] || COMPANION_NATURES.balanced;
  return nature.ai === 'support' && companion.mp >= 5;
}

function performCompanionHeal(companion) {
  const slimeHeal = companion.speciesId === 'slime' && companion.level >= 8;
  const cost = slimeHeal ? 4 : 5;
  const pct = slimeHeal ? 0.32 : 0.22;
  companion.mp -= cost;
  const amount = Math.max(1, Math.round(companion.maxHp * pct + companion.mag * 0.6));
  const before = companion.hp;
  companion.hp = Math.min(companion.maxHp, companion.hp + amount);
  const healed = companion.hp - before;
  return {
    action: 'skill',
    companion: true,
    companionId: companion.id,
    companionName: companion.name,
    name: `${companion.name}の${slimeHeal ? 'ぷるぷる回復' : '応急回復'}`,
    techType: 'heal',
    healAmount: healed,
    mpRestored: 0,
    buffed: false,
    targets: [],
  };
}

function performCompanionTurn(engine) {
  ensureCompanionBattle(engine);
  const c = engine.companion;
  if (!c || c.down || c.hp <= 0 || engine.over) return null;
  if (canCompanionHeal(c)) return performCompanionHeal(c);

  const target = chooseTarget(engine, c);
  if (!target) return null;
  const damage = companionDamage(c, target);
  const kill = engine._applyRawDamageAndReward(target, damage);
  return {
    action: 'skill',
    companion: true,
    companionId: c.id,
    companionName: c.name,
    name: `${c.name}のこうげき`,
    techType: 'damage',
    targets: [{
      targetId: target.id,
      targetName: target.name,
      damage,
      critical: false,
      defeated: target.dead,
      effects: [],
      kill,
    }],
  };
}

function companionCanBeTargeted(engine) {
  ensureCompanionBattle(engine);
  return !!(engine.companion && !engine.companion.down && engine.companion.hp > 0);
}

function hitCompanion(engine, enemy) {
  const c = engine.companion;
  const damage = enemyDamageToCompanion(enemy, c);
  c.hp = Math.max(0, c.hp - damage);
  if (c.hp <= 0) c.down = true;
  return {
    enemyId: enemy.id,
    name: enemy.name,
    kind: 'attack',
    damage,
    evaded: false,
    companionTarget: true,
    companionName: c.name,
    companionHp: c.hp,
    companionMaxHp: c.maxHp,
    companionDown: c.down,
  };
}

const originalPerformEnemyTurn = BattleEngine.prototype.performEnemyTurn;
BattleEngine.prototype.performEnemyTurn = function patchedPerformEnemyTurn(enemy) {
  ensureCompanionBattle(this);
  // Status effects must remain authoritative. Frozen enemies are handed to the
  // original resolver first so frozenTurns is consumed and no attack (including
  // a companion-targeted one) can leak through the patch.
  if (enemy && enemy.frozenTurns > 0) return originalPerformEnemyTurn.call(this, enemy);
  if (!enemy.dead && !enemy.boss && companionCanBeTargeted(this)) {
    const c = this.companion;
    const nature = COMPANION_NATURES[c.nature] || COMPANION_NATURES.balanced;
    let targetChance = 0.28;
    if (nature.ai === 'defensive') targetChance += 0.07;
    if (Math.random() < targetChance) return hitCompanion(this, enemy);
  }
  return originalPerformEnemyTurn.call(this, enemy);
};

function convertCompanionHitLog(event) {
  if (!event || event.type !== 'enemyAction' || !event.result || !event.result.companionTarget) return event;
  const r = event.result;
  return {
    type: 'playerAction',
    result: {
      action: 'skill',
      name: `${r.name}の攻撃${r.companionDown ? `（${r.companionName}は力尽きた）` : ''}`,
      techType: 'damage',
      targets: [{
        targetName: r.companionName,
        damage: r.damage,
        critical: false,
        defeated: false,
        effects: [],
        kill: null,
      }],
    },
  };
}

const originalAdvanceTurn = BattleEngine.prototype.advanceTurn;
BattleEngine.prototype.advanceTurn = function patchedAdvanceTurn(command) {
  ensureCompanionBattle(this);
  const out = originalAdvanceTurn.call(this, command);

  if (out.events) out.events = out.events.map(convertCompanionHitLog);

  const blocked = out.events && out.events.some((ev) => ev.type === 'playerAction' && ev.result && ev.result.blocked);
  const fled = out.result && out.result.retreated;
  if (!blocked && !fled && !out.over && this.player.hp > 0 && this.aliveEnemies.length > 0) {
    const result = performCompanionTurn(this);
    if (result) {
      out.events.push({ type: 'playerAction', result });
      // The original engine already ran its round-end victory check before the
      // companion's appended action. Re-check only after an actual companion
      // action so a last-hit kill resolves immediately instead of leaving an
      // empty battlefield waiting for another command.
      if (this.aliveEnemies.length === 0) {
        const end = this.checkBattleEnd();
        if (end.over) {
          out.over = true;
          out.result = this.finalResult;
        }
      }
    }
  }
  return out;
};

const originalGrantKillRewards = BattleEngine.prototype._grantKillRewards;
BattleEngine.prototype._grantKillRewards = function patchedGrantKillRewards(enemy) {
  const result = originalGrantKillRewards.call(this, enemy);
  // Summoned zero-reward enemies must not become an infinite companion EXP
  // source. Real enemies keep the existing 75% companion EXP share.
  if (result && (enemy.xp || 0) > 0 && state.gainCompanionExp && state.activeCompanionId && state.activeCompanionId()) {
    const gained = Math.round(enemy.xp * 0.75);
    if (gained > 0) {
      const exp = state.gainCompanionExp(gained);
      result.companionExp = exp.gained;
      result.companionLeveledUp = exp.leveledUp;
      result.companionLevel = exp.level;
    }
  }
  return result;
};

function ensureCompanionHud(screen) {
  if (!screen || !screen.engine) return null;
  ensureCompanionBattle(screen.engine);
  let el = document.getElementById('tbCompanionHud');
  if (!screen.engine.companion) {
    if (el) el.remove();
    return null;
  }
  if (!el) {
    el = document.createElement('div');
    el.id = 'tbCompanionHud';
    el.className = 'forge-card-sub';
    el.style.padding = '5px 10px';
    el.style.margin = '4px 8px';
    const hud = document.querySelector('#textBattleScreen .tb-hud');
    if (hud) hud.appendChild(el);
  }
  return el;
}

const originalRender = TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render = function patchedCompanionRender() {
  originalRender.call(this);
  const el = ensureCompanionHud(this);
  if (!el || !this.engine.companion) return;
  const c = this.engine.companion;
  const down = c.down || c.hp <= 0;
  el.textContent = `🐾 ${c.name} Lv.${c.level}　HP ${Math.max(0, c.hp)}/${c.maxHp}　MP ${Math.max(0, c.mp)}/${c.maxMp}${down ? '　【戦闘不能】' : ''}`;
  el.style.opacity = down ? '0.55' : '1';
};

export { performCompanionTurn };
