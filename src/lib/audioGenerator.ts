/**
 * Web Audio API Sound Effects Synthesizer
 * Generates realistic real-time sound effects for the 24 SFX library items
 */

let activeAudioContext: AudioContext | null = null;
let activeSources: { stop: () => void }[] = [];

function getAudioContext(): AudioContext {
  if (!activeAudioContext) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    activeAudioContext = new AudioContextClass();
  }
  if (activeAudioContext.state === 'suspended') {
    activeAudioContext.resume();
  }
  return activeAudioContext;
}

export function stopAllSynthesizedSFX() {
  activeSources.forEach(source => {
    try {
      source.stop();
    } catch (e) {
      // Already stopped
    }
  });
  activeSources = [];
}

export function playSynthesizedSFX(id: string): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      stopAllSynthesizedSFX();

      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0.3, ctx.currentTime); // Limit global volume to 30% for safety
      mainGain.connect(ctx.destination);

      const trackingSource = {
        stop: () => {
          mainGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
        }
      };
      activeSources.push(trackingSource);

      const now = ctx.currentTime;

      // 1. Whoosh Transition
      if (id === 'sfx-whoosh-fast') {
        const bufferSize = ctx.sampleRate * 1.0; // 1 second
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.Q.setValueAtTime(3.0, now);
        filter.frequency.setValueAtTime(100, now);
        filter.frequency.exponentialRampToValueAtTime(1800, now + 0.4);
        filter.frequency.exponentialRampToValueAtTime(150, now + 0.9);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(1.0, now + 0.35);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.9);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        noise.start(now);
        noise.stop(now + 1.0);
      }

      // 2. Cinematic Bass Drop
      else if (id === 'sfx-bass-drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 1.8);

        gain.gain.setValueAtTime(0.8, now);
        gain.gain.linearRampToValueAtTime(1.0, now + 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.0);

        // Low pass filter to make it warmer
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(160, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 1.5);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        osc.stop(now + 2.1);
      }

      // 3. Digital Glitch Crackle
      else if (id === 'sfx-glitch-crack') {
        const duration = 0.8;
        const interval = 0.05;
        let playTime = now;

        while (playTime < now + duration) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = Math.random() > 0.5 ? 'square' : 'sawtooth';
          osc.frequency.setValueAtTime(Math.random() * 4000 + 400, playTime);
          osc.frequency.setValueAtTime(Math.random() * 8000 + 1000, playTime + 0.02);

          gain.gain.setValueAtTime(0.3, playTime);
          gain.gain.setValueAtTime(0.001, playTime + 0.035);

          const filter = ctx.createBiquadFilter();
          filter.type = 'highpass';
          filter.frequency.setValueAtTime(2000, playTime);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(mainGain);

          osc.start(playTime);
          osc.stop(playTime + 0.04);

          playTime += interval + Math.random() * 0.05;
        }
      }

      // 4. Camera Shutter Click
      else if (id === 'sfx-camera-shutter') {
        // Shutter click has two parts: first mechanical click, and second shutter leaf noise
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

        oscGain.gain.setValueAtTime(0.5, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

        osc.connect(oscGain);
        oscGain.connect(mainGain);
        osc.start(now);
        osc.stop(now + 0.07);

        // Noise shutter leaf part
        const bufferSize = ctx.sampleRate * 0.15;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1500, now);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0, now);
        noiseGain.gain.linearRampToValueAtTime(0.4, now + 0.01);
        noiseGain.gain.setValueAtTime(0.4, now + 0.04);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(mainGain);

        noise.start(now);
        noise.stop(now + 0.16);
      }

      // 5. Vinyl Record Scratch
      else if (id === 'sfx-vinyl-scratch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.15);
        osc.frequency.linearRampToValueAtTime(600, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.5);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.6, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(800, now);
        filter.Q.setValueAtTime(2, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        osc.stop(now + 0.55);
      }

      // 6. Sword Slash Swoosh
      else if (id === 'sfx-sword-slash') {
        const bufferSize = ctx.sampleRate * 0.4;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.exponentialRampToValueAtTime(600, now + 0.25);
        filter.Q.setValueAtTime(4.0, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.8, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        noise.start(now);
        noise.stop(now + 0.4);
      }

      // 7. Tension Riser Build-Up
      else if (id === 'sfx-riser-build') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(80, now);
        osc1.frequency.exponentialRampToValueAtTime(880, now + 2.8);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(80.5, now);
        osc2.frequency.exponentialRampToValueAtTime(885, now + 2.8);

        gain.gain.setValueAtTime(0.01, now);
        gain.gain.linearRampToValueAtTime(0.5, now + 2.5);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(200, now);
        filter.frequency.exponentialRampToValueAtTime(2000, now + 2.5);

        osc1.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 3.0);
        osc2.stop(now + 3.0);
      }

      // 8. Deep Sub Impact
      else if (id === 'sfx-impact-sub') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(25, now + 1.2);

        gain.gain.setValueAtTime(1.0, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, now);

        // Add a bit of punch noise at start
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        const noiseFilter = ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(200, now);

        noise.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(mainGain);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        noise.start(now);
        osc.stop(now + 1.6);
        noise.stop(now + 0.05);
      }

      // 9. Glass Shatter Break
      else if (id === 'sfx-glass-shatter') {
        const shardCount = 12;
        for (let i = 0; i < shardCount; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const timeOffset = Math.random() * 0.15;
          const playTime = now + timeOffset;

          osc.type = 'sine';
          const baseFreq = Math.random() * 3000 + 1500;
          osc.frequency.setValueAtTime(baseFreq, playTime);
          osc.frequency.linearRampToValueAtTime(baseFreq - Math.random() * 400, playTime + 0.3);

          gain.gain.setValueAtTime(0, playTime);
          gain.gain.linearRampToValueAtTime(0.2, playTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.001, playTime + Math.random() * 0.3 + 0.1);

          osc.connect(gain);
          gain.connect(mainGain);

          osc.start(playTime);
          osc.stop(playTime + 0.5);
        }
      }

      // 10. Retro Telephone Bell Ring
      else if (id === 'sfx-bell-ring') {
        const ringDuration = 1.2;
        const pulseRate = 18; // Hz
        const pulseCount = ringDuration * pulseRate;

        for (let i = 0; i < pulseCount; i++) {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();
          const playTime = now + (i / pulseRate);

          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(850, playTime);

          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(950, playTime);

          gain.gain.setValueAtTime(0.25, playTime);
          gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.035);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(mainGain);

          osc1.start(playTime);
          osc2.start(playTime);
          osc1.stop(playTime + 0.04);
          osc2.stop(playTime + 0.04);
        }
      }

      // 11. Retro Laser Pew
      else if (id === 'sfx-laser-pew') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.35);

        gain.gain.setValueAtTime(0.6, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1500, now);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        osc.stop(now + 0.4);
      }

      // 12. Ticking Wall Clock
      else if (id === 'sfx-clock-tick') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.exponentialRampToValueAtTime(400, now + 0.015);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

        osc.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        osc.stop(now + 0.03);
      }

      // 13. Mechanical Keyboard Typing
      else if (id === 'sfx-keyboard-type') {
        const clickCount = 6;
        let playTime = now;

        for (let i = 0; i < clickCount; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(1800, playTime);
          osc.frequency.exponentialRampToValueAtTime(1200, playTime + 0.01);

          gain.gain.setValueAtTime(0.3, playTime);
          gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.015);

          osc.connect(gain);
          gain.connect(mainGain);

          osc.start(playTime);
          osc.stop(playTime + 0.02);

          playTime += 0.12 + Math.random() * 0.1;
        }
      }

      // 14. Desert Eagle Gunshot with Echo
      else if (id === 'sfx-gunshot-echo') {
        // Main explosion blast (white noise)
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        filter.frequency.exponentialRampToValueAtTime(50, now + 1.2);

        const noiseGain = ctx.createGain();
        noiseGain.gain.setValueAtTime(1.0, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(mainGain);

        // High frequency gun crack
        const osc = ctx.createOscillator();
        const oscGain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.08);

        oscGain.gain.setValueAtTime(0.8, now);
        oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

        osc.connect(oscGain);
        oscGain.connect(mainGain);

        noise.start(now);
        osc.start(now);
        noise.stop(now + 1.6);
        osc.stop(now + 0.1);
      }

      // 15. Deep Human Heartbeat
      else if (id === 'sfx-heartbeat-slow') {
        const beat = (time: number) => {
          // Lub
          const osc1 = ctx.createOscillator();
          const gain1 = ctx.createGain();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(65, time);
          osc1.frequency.exponentialRampToValueAtTime(30, time + 0.15);
          gain1.gain.setValueAtTime(0.7, time);
          gain1.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
          osc1.connect(gain1);
          gain1.connect(mainGain);
          osc1.start(time);
          osc1.stop(time + 0.2);

          // Dub
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          const dubTime = time + 0.18;
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(60, dubTime);
          osc2.frequency.exponentialRampToValueAtTime(28, dubTime + 0.18);
          gain2.gain.setValueAtTime(0.6, dubTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, dubTime + 0.22);
          osc2.connect(gain2);
          gain2.connect(mainGain);
          osc2.start(dubTime);
          osc2.stop(dubTime + 0.25);
        };

        beat(now);
        beat(now + 0.8);
      }

      // 16. Water Bubble Pop
      else if (id === 'sfx-bubble-pop') {
        const pop = (time: number, freq: number) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, time);
          osc.frequency.exponentialRampToValueAtTime(freq * 2.2, time + 0.06);

          gain.gain.setValueAtTime(0, time);
          gain.gain.linearRampToValueAtTime(0.3, time + 0.005);
          gain.gain.exponentialRampToValueAtTime(0.001, time + 0.07);

          osc.connect(gain);
          gain.connect(mainGain);

          osc.start(time);
          osc.stop(time + 0.08);
        };

        pop(now, 450);
        pop(now + 0.08, 600);
        pop(now + 0.15, 520);
      }

      // 17. Heavy Industrial Metal Clang
      else if (id === 'sfx-metal-clang') {
        const frequencies = [120, 290, 410, 485, 780, 1100];
        frequencies.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.2, now);
          const decay = 1.2 / (idx + 1) * 0.8; // higher frequencies decay faster
          gain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.1, decay));

          osc.connect(gain);
          gain.connect(mainGain);

          osc.start(now);
          osc.stop(now + 1.3);
        });
      }

      // 18. Paper Sheet Rustle
      else if (id === 'sfx-paper-rustle') {
        const rustleCount = 4;
        let playTime = now;

        for (let i = 0; i < rustleCount; i++) {
          const bufferSize = ctx.sampleRate * 0.12;
          const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
          const data = buffer.getChannelData(0);
          for (let k = 0; k < bufferSize; k++) {
            data[k] = Math.random() * 2 - 1;
          }
          const noise = ctx.createBufferSource();
          noise.buffer = buffer;

          const filter = ctx.createBiquadFilter();
          filter.type = 'bandpass';
          filter.frequency.setValueAtTime(3500 + Math.random() * 1000, playTime);
          filter.Q.setValueAtTime(2.0, playTime);

          const gain = ctx.createGain();
          gain.gain.setValueAtTime(0.15, playTime);
          gain.gain.exponentialRampToValueAtTime(0.001, playTime + 0.1);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(mainGain);

          noise.start(playTime);
          noise.stop(playTime + 0.11);

          playTime += 0.15;
        }
      }

      // 19. Cozy Rain on Window
      else if (id === 'sfx-rain-loop') {
        const bufferSize = ctx.sampleRate * 2.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2500, now);

        const filter2 = ctx.createBiquadFilter();
        filter2.type = 'lowpass';
        filter2.frequency.setValueAtTime(4000, now);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.4);
        gain.gain.setValueAtTime(0.12, now + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        noise.connect(filter);
        filter.connect(filter2);
        filter2.connect(gain);
        gain.connect(mainGain);

        noise.start(now);
        noise.stop(now + 2.5);

        // Add little micro-drops
        for (let d = 0; d < 8; d++) {
          const dropTime = now + 0.1 + Math.random() * 2.0;
          const dOsc = ctx.createOscillator();
          const dGain = ctx.createGain();
          dOsc.type = 'sine';
          dOsc.frequency.setValueAtTime(800 + Math.random() * 400, dropTime);
          dOsc.frequency.exponentialRampToValueAtTime(1400, dropTime + 0.03);
          dGain.gain.setValueAtTime(0.02, dropTime);
          dGain.gain.exponentialRampToValueAtTime(0.001, dropTime + 0.04);
          dOsc.connect(dGain);
          dGain.connect(mainGain);
          dOsc.start(dropTime);
          dOsc.stop(dropTime + 0.05);
        }
      }

      // 20. Distant Thunder Strike
      else if (id === 'sfx-thunder-strike') {
        const bufferSize = ctx.sampleRate * 3.0;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(70, now);
        filter.frequency.exponentialRampToValueAtTime(40, now + 2.0);

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        // initial strike
        gain.gain.linearRampToValueAtTime(0.8, now + 0.1);
        gain.gain.linearRampToValueAtTime(0.3, now + 0.5);
        // rumble
        gain.gain.linearRampToValueAtTime(0.4, now + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        noise.start(now);
        noise.stop(now + 3.0);
      }

      // 21. Sci-Fi Hologram Interface Beep
      else if (id === 'sfx-cyber-beep') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(2200, now);
        osc.frequency.setValueAtTime(2800, now + 0.05);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.setValueAtTime(0.25, now + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

        osc.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        osc.stop(now + 0.22);
      }

      // 22. Sitcom TV Laughter Crowd
      else if (id === 'sfx-laughter-crowd') {
        // Multi-voice filter-sweep noise
        const voices = 4;
        for (let i = 0; i < voices; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const timeOffset = Math.random() * 0.15;
          const playTime = now + timeOffset;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(140 + Math.random() * 60, playTime);
          // Modulate pitch up and down like giggles
          osc.frequency.linearRampToValueAtTime(220 + Math.random() * 40, playTime + 0.3);
          osc.frequency.linearRampToValueAtTime(180 + Math.random() * 30, playTime + 0.6);
          osc.frequency.linearRampToValueAtTime(120, playTime + 1.2);

          const lfo = ctx.createOscillator();
          const lfoGain = ctx.createGain();
          lfo.type = 'sine';
          lfo.frequency.setValueAtTime(8 + Math.random() * 4, playTime);
          lfoGain.gain.setValueAtTime(15, playTime);

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);

          gain.gain.setValueAtTime(0, playTime);
          gain.gain.linearRampToValueAtTime(0.15, playTime + 0.25);
          gain.gain.linearRampToValueAtTime(0.1, playTime + 0.7);
          gain.gain.exponentialRampToValueAtTime(0.001, playTime + 1.5);

          lfo.start(playTime);
          osc.connect(gain);
          gain.connect(mainGain);

          lfo.start(playTime);
          osc.start(playTime);
          lfo.stop(playTime + 1.5);
          osc.stop(playTime + 1.5);
        }
      }

      // 23. Mysterious Alien UFO Hover Hum
      else if (id === 'sfx-ufo-hum') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(55, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(180, now);

        const lfo = ctx.createOscillator();
        const lfoGain = ctx.createGain();
        lfo.frequency.setValueAtTime(5, now); // 5Hz oscillation
        lfoGain.gain.setValueAtTime(50, now);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.6, now + 0.4);
        gain.gain.setValueAtTime(0.6, now + 1.8);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 2.5);

        lfo.start(now);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(mainGain);

        osc.start(now);
        lfo.stop(now + 2.5);
        osc.stop(now + 2.5);
      }

      // 25. Theme Toggle Dark (Sunset Chime)
      else if (id === 'theme-toggle-dark') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(261.63, now); // C4
        osc1.frequency.exponentialRampToValueAtTime(130.81, now + 0.35); // C3

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(329.63, now); // E4
        osc2.frequency.exponentialRampToValueAtTime(164.81, now + 0.35); // E3

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(mainGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.45);
        osc2.stop(now + 0.45);
      }

      // 26. Theme Toggle Light (Sunrise Chime)
      else if (id === 'theme-toggle-light') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(523.25, now); // C5
        osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(659.25, now); // E5
        osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.3); // E6

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(mainGain);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.4);
        osc2.stop(now + 0.4);
      }

      // 24. Analog TV Static White Noise
      else {
        const bufferSize = ctx.sampleRate * 1.5;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.08, now + 0.1);
        gain.gain.setValueAtTime(0.08, now + 1.3);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        noise.connect(gain);
        gain.connect(mainGain);

        noise.start(now);
        noise.stop(now + 1.5);
      }

      // Resolve successfully
      setTimeout(() => resolve(true), 100);
    } catch (e) {
      console.error('Audio synthesis failed', e);
      resolve(false);
    }
  });
}
