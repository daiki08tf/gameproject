/* Phase 8 — non-invasive Fusion UI injection for TextBattleScreen. */
import { TextBattleScreen } from '../screens/textBattle.js';
import { state } from '../state.js';

const originalStart=TextBattleScreen.prototype.start;
const originalRender=TextBattleScreen.prototype._render;

function ensureUi(screen){
 if(screen._fusionUi) return screen._fusionUi;
 const grid=screen.el?.commandGrid; if(!grid) return null;
 const wrap=document.createElement('div'); wrap.className='tb-fusion-panel';
 const label=document.createElement('div'); label.className='tb-fusion-label';
 const bar=document.createElement('div'); bar.className='bar tb-fusion-bar'; const fill=document.createElement('div'); fill.className='fill'; bar.appendChild(fill);
 const btn=document.createElement('button'); btn.className='btn-main tb-fusion-command'; btn.addEventListener('click',()=>screen._onCommand({type:'fusion',targetId:screen.selectedTargetId}));
 wrap.append(label,bar,btn); grid.parentElement?.insertBefore(wrap,grid); screen._fusionUi={wrap,label,fill,btn}; return screen._fusionUi;
}
TextBattleScreen.prototype.start=function(...args){const out=originalStart.apply(this,args);ensureUi(this);this._render();return out;};
TextBattleScreen.prototype._render=function(){originalRender.call(this);const ui=ensureUi(this),summary=this.engine?.fusionCombatSummary?.();if(!ui)return;ui.wrap.classList.toggle('hidden',!summary);if(!summary)return;const gauge=state.fusionGauge?.()||0;ui.label.textContent=`${summary.gauge.name} ${Math.round(gauge)}/100${gauge>=50?'  ◆TRAIT':''}`;ui.fill.style.width=`${Math.max(0,Math.min(100,gauge))}%`;ui.btn.textContent=`FUSION：${summary.command.name}`;ui.btn.disabled=!this.engine.canUseFusionCommand?.()||this.engine.over||this.locked;};
