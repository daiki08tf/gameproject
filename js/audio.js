/* ============================================================
   効果音（Web Audio APIでその場生成、外部素材なし）
   ============================================================ */
let actx = null;
function ctxReady() {
  if (!actx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    actx = new AC();
  }
  if (actx.state === 'suspended') actx.resume();
  return actx;
}
function beep({ freq = 440, dur = 0.08, type = 'square', gain = 0.08, slideTo = null }) {
  try {
    const ac = ctxReady();
    const osc = ac.createOscillator();
    const g = ac.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, ac.currentTime + dur);
    g.gain.setValueAtTime(gain, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + dur);
    osc.connect(g).connect(ac.destination);
    osc.start();
    osc.stop(ac.currentTime + dur + 0.02);
  } catch (e) { /* audio not available */ }
}

export const Audio_ = {
  swing: () => beep({ freq: 260, dur: 0.09, type: 'triangle', gain: 0.06, slideTo: 140 }),
  hit: () => beep({ freq: 180, dur: 0.07, type: 'square', gain: 0.09, slideTo: 60 }),
  enemyDeath: () => beep({ freq: 320, dur: 0.15, type: 'sawtooth', gain: 0.07, slideTo: 80 }),
  playerHurt: () => beep({ freq: 140, dur: 0.18, type: 'sawtooth', gain: 0.12, slideTo: 50 }),
  pickup: () => beep({ freq: 620, dur: 0.08, type: 'sine', gain: 0.06, slideTo: 900 }),
  skill: () => beep({ freq: 500, dur: 0.14, type: 'sine', gain: 0.08, slideTo: 780 }),
  heal: () => beep({ freq: 700, dur: 0.16, type: 'sine', gain: 0.07, slideTo: 500 }),
  ultimate: () => {
    beep({ freq: 300, dur: 0.2, type: 'sawtooth', gain: 0.1, slideTo: 900 });
    setTimeout(() => beep({ freq: 900, dur: 0.25, type: 'square', gain: 0.08, slideTo: 1400 }), 100);
  },
  levelUp: () => {
    beep({ freq: 440, dur: 0.12, type: 'sine', gain: 0.08, slideTo: 660 });
    setTimeout(() => beep({ freq: 660, dur: 0.16, type: 'sine', gain: 0.08, slideTo: 880 }), 90);
  },
  jobMastered: () => {
    beep({ freq: 400, dur: 0.15, type: 'sine', gain: 0.09, slideTo: 600 });
    setTimeout(() => beep({ freq: 600, dur: 0.15, type: 'sine', gain: 0.09, slideTo: 900 }), 100);
    setTimeout(() => beep({ freq: 900, dur: 0.25, type: 'sine', gain: 0.09, slideTo: 1200 }), 200);
  },
  stageClear: () => {
    beep({ freq: 523, dur: 0.14, type: 'sine', gain: 0.09, slideTo: 660 });
    setTimeout(() => beep({ freq: 660, dur: 0.18, type: 'sine', gain: 0.09, slideTo: 880 }), 130);
  },
  stageFail: () => beep({ freq: 200, dur: 0.6, type: 'sawtooth', gain: 0.1, slideTo: 40 }),
  tap: () => beep({ freq: 380, dur: 0.05, type: 'sine', gain: 0.04, slideTo: 420 }),
};
