/* ============================================================
   Combat 2.0 — Skill Modifier battle UI
   ============================================================ */
import { TextBattleScreen } from '../screens/textBattle.js';
import { state } from '../state.js';
import { compatibleModifierIds, SKILL_MODIFIERS } from '../data/combat2SkillModifiers.js';
import { Audio_ } from '../audio.js';

const previousRenderTechMenu = TextBattleScreen.prototype._renderTechMenu;
TextBattleScreen.prototype._renderTechMenu = function combat2ModifierTechMenu() {
  previousRenderTechMenu.call(this);
  if (!this.techMenuKind || !this.engine || !this.el?.techList) return;

  const list = this.techMenuKind === 'spell' ? this.engine.availableSpells() : this.engine.availableSkills();
  const rows = [...this.el.techList.querySelectorAll('.tb-tech-item')];
  rows.forEach((row, index) => {
    const tech = list[index];
    if (!tech || compatibleModifierIds(tech).length <= 1) return;
    const current = state.skillModifierFor(tech.id);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'inline-btn combat2-modifier-btn';
    btn.textContent = `改造:${SKILL_MODIFIERS[current]?.name || '標準'}`;
    btn.title = SKILL_MODIFIERS[current]?.desc || '';
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      Audio_.tap();
      state.cycleSkillModifier(tech);
      this._renderTechMenu();
    });
    row.appendChild(btn);
  });
};
