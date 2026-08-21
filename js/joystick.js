/* ============================================================
   仮想スティック（タッチ／マウス両対応、Pointer Events使用）
   ============================================================ */
export class Joystick {
  constructor(baseEl, knobEl) {
    this.baseEl = baseEl;
    this.knobEl = knobEl;
    this.active = false;
    this.pointerId = null;
    this.vx = 0;
    this.vy = 0;
    this.maxR = 46;

    baseEl.addEventListener('pointerdown', this._onDown.bind(this));
    window.addEventListener('pointermove', this._onMove.bind(this));
    window.addEventListener('pointerup', this._onUp.bind(this));
    window.addEventListener('pointercancel', this._onUp.bind(this));
  }

  _onDown(e) {
    if (this.active) return;
    this.active = true;
    this.pointerId = e.pointerId;
    this.baseEl.setPointerCapture && this.baseEl.setPointerCapture(e.pointerId);
    this._update(e);
    e.preventDefault();
  }

  _onMove(e) {
    if (!this.active || e.pointerId !== this.pointerId) return;
    this._update(e);
  }

  _onUp(e) {
    if (!this.active || e.pointerId !== this.pointerId) return;
    this.active = false;
    this.pointerId = null;
    this.vx = 0;
    this.vy = 0;
    this.knobEl.style.transform = 'translate(0px, 0px)';
  }

  _update(e) {
    const rect = this.baseEl.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    let dx = e.clientX - cx;
    let dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > this.maxR) {
      dx = (dx / dist) * this.maxR;
      dy = (dy / dist) * this.maxR;
    }
    this.knobEl.style.transform = `translate(${dx}px, ${dy}px)`;
    this.vx = dx / this.maxR;
    this.vy = dy / this.maxR;
  }

  get vector() { return { x: this.vx, y: this.vy }; }
}
