/* Phase 8 — non-invasive Fusion UI injection for TextBattleScreen. */
import { TextBattleScreen } from '../screens/textBattle.js';
import { state } from '../state.js';

const originalStart=TextBattleScreen.prototype.start;
const originalRender=TextBattleScreen.prototype._render;

/*
 * Battle mobile viewport safety
 *
 * The global app shell intentionally uses a fixed screen with body overflow:hidden.
 * That is fine until an encounter contains enough enemy cards to make the enemy list
 * taller than the available viewport: the command grid is then pushed below the
 * visible area and the player cannot attack or progress.
 *
 * Keep the HUD / Fusion panel / command controls in the layout and make the enemy
 * roster itself the bounded scroll region. This is deliberately injected from the
 * already-loaded battle UI patch so it also protects non-Fusion jobs without adding
 * another stylesheet dependency.
 */
function ensureBattleViewportStyles(){
 if(document.getElementById('battle-mobile-viewport-style')) return;
 const style=document.createElement('style');
 style.id='battle-mobile-viewport-style';
 style.textContent=`
#textBattleScreen{overflow:hidden;min-height:0;}
#textBattleScreen .tb-hud{flex-shrink:0;}
#textBattleScreen .tb-enemy-list{
  flex:0 1 auto;
  min-height:0;
  max-height:min(34vh,260px);
  overflow-y:auto;
  overflow-x:hidden;
  overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
  scrollbar-gutter:stable;
  padding-right:2px;
}
#textBattleScreen .tb-log{
  flex:1 1 72px;
  min-height:40px;
  overflow-y:auto;
}
#textBattleScreen .tb-fusion-panel,
#textBattleScreen .tb-command-grid,
#textBattleScreen .tb-tech-menu{
  flex-shrink:0;
}
#textBattleScreen .tb-tech-list{
  max-height:min(38vh,300px);
  overflow-y:auto;
  overscroll-behavior:contain;
  -webkit-overflow-scrolling:touch;
}
@media (max-height:700px){
  #textBattleScreen .tb-enemy-list{max-height:28vh;}
  #textBattleScreen .tb-enemy-card{padding:6px 8px;gap:2px;}
  #textBattleScreen .tb-log{flex-basis:48px;min-height:32px;}
}
@media (max-height:560px){
  #textBattleScreen .tb-enemy-list{max-height:22vh;}
  #textBattleScreen .tb-log{flex-basis:34px;min-height:28px;}
  #textBattleScreen .tb-command-grid{gap:6px;margin-top:6px;}
}
`;
 document.head.appendChild(style);
}

function ensureUi(screen){
 if(screen._fusionUi) return screen._fusionUi;
 const grid=screen.el?.commandGrid; if(!grid) return null;
 const wrap=document.createElement('div'); wrap.className='tb-fusion-panel';
 const label=document.createElement('div'); label.className='tb-fusion-label';
 const bar=document.createElement('div'); bar.className='bar tb-fusion-bar'; const fill=document.createElement('div'); fill.className='fill'; bar.appendChild(fill);
 const btn=document.createElement('button'); btn.className='btn-main tb-fusion-command'; btn.addEventListener('click',()=>screen._onCommand({type:'fusion',targetId:screen.selectedTargetId}));
 wrap.append(label,bar,btn); grid.parentElement?.insertBefore(wrap,grid); screen._fusionUi={wrap,label,fill,btn}; return screen._fusionUi;
}
TextBattleScreen.prototype.start=function(...args){ensureBattleViewportStyles();const out=originalStart.apply(this,args);ensureUi(this);this._render();return out;};
TextBattleScreen.prototype._render=function(){originalRender.call(this);const ui=ensureUi(this),summary=this.engine?.fusionCombatSummary?.();if(!ui)return;ui.wrap.classList.toggle('hidden',!summary);if(!summary)return;const gauge=state.fusionGauge?.()||0;ui.label.textContent=`${summary.gauge.name} ${Math.round(gauge)}/100${gauge>=50?'  ◆TRAIT':''}`;ui.fill.style.width=`${Math.max(0,Math.min(100,gauge))}%`;ui.btn.textContent=`FUSION：${summary.command.name}`;ui.btn.disabled=!this.engine.canUseFusionCommand?.()||this.engine.over||this.locked;};
