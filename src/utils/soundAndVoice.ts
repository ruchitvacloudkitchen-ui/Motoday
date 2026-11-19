// Synthesized Web Audio API sounds + SpeechSynthesis voice reader + Haptic vibration

let audioCtx: AudioContext | null = null;
let ambientOsc1: OscillatorNode | null = null;
let ambientOsc2: OscillatorNode | null = null;
let ambientGain: GainNode | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const Ctx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    if (Ctx) {
      audioCtx = new Ctx();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

// 1. Coin-drop / celebration chime when completing a task (+10 points)
export function playCoinSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(987.77, now);
  osc.frequency.setValueAtTime(1318.51, now + 0.08);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.46);
}

// Soft gentle "pop" sound when tapping the Manifestation Banner
export function playSoftPopSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(360, now);
  osc.frequency.exponentialRampToValueAtTime(680, now + 0.085);

  gain.gain.setValueAtTime(0.18, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.11);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.12);
}

// 2. Loud happy celebration fanfare when reaching 100 POINTS!
export function playHappyCakeFanfare(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([150, 80, 150, 80, 300]);
    } catch {}
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  // Joyful arpeggio fanfare: C5 - E5 - G5 - C6 - G5 - C6
  const notes = [
    { freq: 523.25, start: 0, dur: 0.14 },
    { freq: 659.25, start: 0.14, dur: 0.14 },
    { freq: 783.99, start: 0.28, dur: 0.14 },
    { freq: 1046.5, start: 0.42, dur: 0.26 },
    { freq: 783.99, start: 0.7, dur: 0.14 },
    { freq: 1046.5, start: 0.86, dur: 0.55 },
  ];

  notes.forEach((n) => {
    const now = ctx.currentTime + n.start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(n.freq, now);

    gain.gain.setValueAtTime(0.32, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + n.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + n.dur + 0.02);
  });
}

// 3. Gentle sound + small vibration when a new task time starts
export function playGentleTaskAlert(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([120, 60, 120]);
    } catch {}
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(528, now);
  osc.frequency.exponentialRampToValueAtTime(660, now + 0.35);

  gain.gain.setValueAtTime(0.16, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.66);
}

// 4. Rising pitch tap sound for 10x Affirmation tapper
export function playStepChime(step: number = 1): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'triangle';
  const baseFreq = 330 + step * 55;
  osc.frequency.setValueAtTime(baseFreq, now);

  gain.gain.setValueAtTime(0.2, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.24);
}

// 5. Loan mountain shrink sound
export function playMountainShrinkSound(): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(523.25, now);
  osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.25);

  gain.gain.setValueAtTime(0.25, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.42);
}

// 6. Soft calm ambient harmonic pad for Focus Mode & 1-Minute Visualise
export function setCalmMusicPlaying(play: boolean): void {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (!play) {
    if (ambientGain && ctx) {
      try {
        ambientGain.gain.exponentialRampToValueAtTime(
          0.0001,
          ctx.currentTime + 0.3
        );
      } catch {}
    }
    setTimeout(() => {
      try {
        ambientOsc1?.stop();
        ambientOsc2?.stop();
      } catch {}
      ambientOsc1 = null;
      ambientOsc2 = null;
      ambientGain = null;
    }, 320);
    return;
  }

  if (ambientOsc1) return;

  const now = ctx.currentTime;
  ambientOsc1 = ctx.createOscillator();
  ambientOsc2 = ctx.createOscillator();
  ambientGain = ctx.createGain();

  ambientOsc1.type = 'sine';
  ambientOsc2.type = 'sine';
  ambientOsc1.frequency.setValueAtTime(216, now);
  ambientOsc2.frequency.setValueAtTime(324, now);

  ambientGain.gain.setValueAtTime(0.001, now);
  ambientGain.gain.linearRampToValueAtTime(0.06, now + 1.0);

  ambientOsc1.connect(ambientGain);
  ambientOsc2.connect(ambientGain);
  ambientGain.connect(ctx.destination);

  ambientOsc1.start(now);
  ambientOsc2.start(now);
}

// 7. Voice TTS: "Read to me" button
export function speakTextAloud(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.94;
    utterance.pitch = 1.04;
    window.speechSynthesis.speak(utterance);
  } catch {}
}

// 8. Loud Reminder Alarm Sound + Vibration for Must-Do Boxes
export function playLoudAlarmSound(): void {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate([400, 150, 400, 150, 600]);
    } catch {}
  }

  const ctx = getAudioContext();
  if (!ctx) return;

  // 4-pulse urgent melodic alarm bell
  const pulses = [
    { freq: 880, start: 0, dur: 0.18 },
    { freq: 1174.66, start: 0.2, dur: 0.18 },
    { freq: 880, start: 0.45, dur: 0.18 },
    { freq: 1174.66, start: 0.65, dur: 0.25 },
    { freq: 880, start: 1.0, dur: 0.18 },
    { freq: 1318.51, start: 1.2, dur: 0.35 },
  ];

  pulses.forEach((p) => {
    const now = ctx.currentTime + p.start;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(p.freq, now);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + p.dur);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + p.dur + 0.02);
  });
}

// 9. Download .ics Calendar Alarm file so phone alarm rings even when app is closed
export function downloadAlarmIcsFile(
  taskTitle: string,
  targetTimeMs: number
): void {
  const formatIcsDate = (ms: number) => {
    const d = new Date(ms);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startStr = formatIcsDate(targetTimeMs);
  const endStr = formatIcsDate(targetTimeMs + 15 * 60 * 1000);
  const cleanTitle = (taskTitle || 'Ruchitva Must-Do').replace(/\r?\n/g, ' ');

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Ruchitva Rising//Must-Do Alarm//EN',
    'BEGIN:VEVENT',
    `UID:mustdo-${Date.now()}@ruchitvarising.app`,
    `DTSTAMP:${formatIcsDate(Date.now())}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:⏰ Must-Do: ${cleanTitle}`,
    `DESCRIPTION:Ruchitva Rising Must-Do Reminder: ${cleanTitle}`,
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:DISPLAY',
    `DESCRIPTION:⏰ ${cleanTitle}`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT0M',
    'ACTION:AUDIO',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute(
    'download',
    `ruchitva-alarm-${cleanTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.ics`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

