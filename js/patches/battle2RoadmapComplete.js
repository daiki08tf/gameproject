/* Battle 2.0 roadmap: companion tactics.
   Break/stagger gauge and elemental combos (wildfire/shock/necrosis/shatter)
   were removed here (user decision 2026-09-08) — see js/data/battle2Tactics.js
   for what stayed (COMPANION_TACTICS only). */
import './enemy2LevelFoundation.js';
import './enemy2LevelScaling.js';
import './enemy2EncounterPilot.js';
import './enemy2EncounterTemplates.js';
import './enemy2RankVariants.js';
import './enemy2StoryMigration.js';
import './enemy3RoleAi.js';
import './enemy3Targeting.js';
import { BattleEngine } from '../battleEngine.js';
import { TextBattleScreen } from '../screens/textBattle.js';
import { COMPANION_TACTICS } from '../data/battle2Tactics.js';
const proto=BattleEngine.prototype;
proto.setCompanionTactic=function(id){if(!COMPANION_TACTICS[id])return false;this.companionTactic=id;for(const c of this.companions||[]){c._battle2OriginalNature ||= c.nature;const override=COMPANION_TACTICS[id].nature;c.nature=override||c._battle2OriginalNature;}return true;};
const originalAdvance=proto.advanceTurn;
proto.advanceTurn=function(command){if(!this.companionTactic)this.companionTactic='balanced';this.setCompanionTactic(this.companionTactic);return originalAdvance.call(this,command);};
const originalRender=TextBattleScreen.prototype._render;
TextBattleScreen.prototype._render=function(){originalRender.call(this);if(!this.engine)return;let hud=document.getElementById('tbBattle2Tactics');const parent=document.getElementById('tbCompanionHud');if(parent&&this.engine.companions?.length){if(!hud){hud=document.createElement('div');hud.id='tbBattle2Tactics';hud.style.cssText='margin-top:5px;display:flex;gap:4px;flex-wrap:wrap';parent.appendChild(hud);}hud.innerHTML=Object.values(COMPANION_TACTICS).map(t=>`<button class="btn-sub" data-tactic="${t.id}" style="padding:3px 6px;font-size:11px" ${this.engine.companionTactic===t.id?'disabled':''}>${t.name}</button>`).join('');hud.querySelectorAll('[data-tactic]').forEach(b=>b.addEventListener('click',()=>{this.engine.setCompanionTactic(b.dataset.tactic);this._render();}));}};
export { COMPANION_TACTICS };
