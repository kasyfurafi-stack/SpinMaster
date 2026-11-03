/**
 * AUDIO.JS - Web Audio API Synthesizer
 * 100% self-contained audio effects (no external mp3 files required)
 */

const SoundEngine = (function () {
  let soundEnabled = true;
  let audioCtx = null;

  // Initialize or resume AudioContext safely on user gesture
  function getContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  // Check stored sound preference
  if (localStorage.getItem('spinmaster_sound') === 'muted') {
    soundEnabled = false;
  }

  return {
    isEnabled: function () {
      return soundEnabled;
    },

    toggle: function () {
      soundEnabled = !soundEnabled;
      localStorage.setItem('spinmaster_sound', soundEnabled ? 'active' : 'muted');
      return soundEnabled;
    },

    // Short crisp mechanical click when pointer passes a slice border
    playTick: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getContext();
        if (!ctx) return;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(560, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(140, ctx.currentTime + 0.035);

        gain.gain.setValueAtTime(0.18, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start();
        osc.stop(ctx.currentTime + 0.035);
      } catch (e) {
        // Silently catch audio policy errors
      }
    },

    // Victorious fanfare melody when winner is chosen
    playVictory: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getContext();
        if (!ctx) return;

        // Triad fanfare: C5, E5, G5, C6
        const notes = [
          { freq: 523.25, duration: 0.12, delay: 0 },
          { freq: 659.25, duration: 0.12, delay: 0.12 },
          { freq: 783.99, duration: 0.15, delay: 0.24 },
          { freq: 1046.5, duration: 0.45, delay: 0.40 }
        ];

        notes.forEach(item => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.value = item.freq;

          const startTime = ctx.currentTime + item.delay;
          gain.gain.setValueAtTime(0.22, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + item.duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + item.duration);
        });
      } catch (e) { }
    },

    // Grand celebration sound when all 3 champions are selected
    playGrandFanfare: function () {
      if (!soundEnabled) return;
      try {
        const ctx = getContext();
        if (!ctx) return;

        const chordNotes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
        chordNotes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.value = freq;

          const startTime = ctx.currentTime + idx * 0.08;
          gain.gain.setValueAtTime(0.18, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.6);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.6);
        });
      } catch (e) { }
    }
  };
})();

