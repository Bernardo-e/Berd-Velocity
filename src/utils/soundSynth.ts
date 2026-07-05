let audioCtx: AudioContext | null = null;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate sound for keypresses
export function playKeySound(type: 'linear' | 'tactile' | 'typewriter' | 'none', volume: number, isSpace: boolean = false) {
  if (type === 'none' || volume <= 0) return;

  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;

    // Master volume node
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.4, time);
    gainNode.connect(ctx.destination);

    if (type === 'linear') {
      // Linear switch: Single crisp click
      // Click Component (sine wave)
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1500 + Math.random() * 200, time);
      osc.frequency.exponentialRampToValueAtTime(800, time + 0.01);

      const clickGain = ctx.createGain();
      clickGain.gain.setValueAtTime(1.0, time);
      clickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.012);

      osc.connect(clickGain);
      clickGain.connect(gainNode);
      osc.start(time);
      osc.stop(time + 0.015);

      // Noise component (crisp key impact)
      const bufferSize = ctx.sampleRate * 0.01;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4000;
      filter.Q.value = 5;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.008);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gainNode);
      noise.start(time);
      noise.stop(time + 0.01);

    } else if (type === 'tactile') {
      // Tactile switch: Double bump click (impact + reset bounce)
      const playClick = (clickTime: number, freq: number, duration: number, noiseVol: number) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, clickTime);
        osc.frequency.exponentialRampToValueAtTime(freq / 2, clickTime + duration);

        const clickGain = ctx.createGain();
        clickGain.gain.setValueAtTime(0.8, clickTime);
        clickGain.gain.exponentialRampToValueAtTime(0.01, clickTime + duration);

        osc.connect(clickGain);
        clickGain.connect(gainNode);
        osc.start(clickTime);
        osc.stop(clickTime + duration + 0.005);

        // Noise
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 3000;
        filter.Q.value = 3;

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(noiseVol, clickTime);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, clickTime + duration - 0.002);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(gainNode);
        noise.start(clickTime);
        noise.stop(clickTime + duration);
      };

      // First click (impact)
      playClick(time, 1200 + Math.random() * 100, 0.008, 0.6);
      // Second click (tactile tactile leaf snap, delayed by 6-8ms)
      playClick(time + 0.006, 900 + Math.random() * 100, 0.006, 0.4);

    } else if (type === 'typewriter') {
      // Typewriter: Heavy, metallic impact, optional bell for spacebar/return
      const osc = ctx.createOscillator();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400 + Math.random() * 50, time);
      osc.frequency.exponentialRampToValueAtTime(100, time + 0.025);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(1.0, time);
      oscGain.gain.exponentialRampToValueAtTime(0.01, time + 0.03);

      osc.connect(oscGain);
      oscGain.connect(gainNode);
      osc.start(time);
      osc.stop(time + 0.035);

      // Metallic high ring
      const ringOsc = ctx.createOscillator();
      ringOsc.type = 'sine';
      ringOsc.frequency.setValueAtTime(2200, time);
      const ringGain = ctx.createGain();
      ringGain.gain.setValueAtTime(0.3, time);
      ringGain.gain.exponentialRampToValueAtTime(0.01, time + 0.04);
      ringOsc.connect(ringGain);
      ringGain.connect(gainNode);
      ringOsc.start(time);
      ringOsc.stop(time + 0.05);

      // Impact noise
      const bufferSize = ctx.sampleRate * 0.03;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1500;
      filter.Q.value = 4;

      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.8, time);
      noiseGain.gain.exponentialRampToValueAtTime(0.01, time + 0.02);

      noise.connect(filter);
      filter.connect(noiseGain);
      noiseGain.connect(gainNode);
      noise.start(time);
      noise.stop(time + 0.03);

      // Carriage Return Bell on spacebar or enter (randomly simulated or on actual space)
      if (isSpace && Math.random() < 0.15) {
        const bellOsc = ctx.createOscillator();
        bellOsc.type = 'sine';
        bellOsc.frequency.setValueAtTime(2500, time + 0.01);
        
        const bellGain = ctx.createGain();
        bellGain.gain.setValueAtTime(0.6, time + 0.01);
        bellGain.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
        
        bellOsc.connect(bellGain);
        bellGain.connect(gainNode);
        bellOsc.start(time + 0.01);
        bellOsc.stop(time + 0.35);
      }
    }
  } catch (err) {
    console.error('Failed to play synthesized click:', err);
  }
}

// Generate feedback sound for errors
export function playErrorSound(volume: number) {
  if (volume <= 0) return;

  try {
    const ctx = getAudioContext();
    const time = ctx.currentTime;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(volume * 0.35, time);
    gainNode.connect(ctx.destination);

    // Deep square-wave buzz
    const osc = ctx.createOscillator();
    osc.type = 'square';
    osc.frequency.setValueAtTime(110, time);
    osc.frequency.linearRampToValueAtTime(80, time + 0.12);

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, time);

    const soundGain = ctx.createGain();
    soundGain.gain.setValueAtTime(1.0, time);
    soundGain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);

    osc.connect(filter);
    filter.connect(soundGain);
    soundGain.connect(gainNode);
    osc.start(time);
    osc.stop(time + 0.16);
  } catch (err) {
    console.error('Failed to play synthesized error buzz:', err);
  }
}
