/* ==========================================================
   VIRTUAL PIANO v2
   Features:
   - 2 octaves (C4–B5)
   - Mouse, touch, keyboard control
   - Plucky sound (Web Audio) + waveform selector
   - Record + playback
   - Loop playback
   - Playback speed control
   - Sustain pedal (button + Shift key)
   - Simple lesson: "Twinkle Twinkle"
========================================================== */

/* -----------------------------------------
   AUDIO ENGINE SETUP
------------------------------------------ */

// Main audio context (sound engine)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

// Store currently playing notes: { noteName: { osc, gain } }
const activeNotes = {};

/* -----------------------------------------
   RECORDING STATE
------------------------------------------ */

let isRecording = false;
let recordStartTime = 0;

// List of recorded events: { note, frequency, start, duration }
let recordedNotes = [];

// Tracks note start times during recording: { noteName: startTime }
let noteOnTimes = {};

// Playback state
let isPlayingBack = false;

// Playback speed (1.0 = normal)
let playbackSpeed = 1;

// Loop playback flag
let loopEnabled = false;

/* -----------------------------------------
   SUSTAIN PEDAL STATE
------------------------------------------ */

// Sustain on/off
let sustainOn = false;

// Notes that have been released while sustain is ON
const sustainedNotes = new Set();

/* -----------------------------------------
   SOUND / WAVEFORM TYPE
------------------------------------------ */

// Waveform for the oscillator: "sine", "square", "sawtooth", "triangle"
let currentWaveType = "triangle"; // plucky-ish by default

/* -----------------------------------------
   KEYBOARD → NOTE MAPPING
------------------------------------------ */

const keyboardToNote = {
  // Octave 1 white keys
  a: "C4",
  s: "D4",
  d: "E4",
  f: "F4",
  g: "G4",
  h: "A4",
  j: "B4",

  // Octave 1 black keys
  w: "C#4",
  e: "D#4",
  t: "F#4",
  y: "G#4",
  u: "A#4",

  // Octave 2 white keys
  z: "C5",
  x: "D5",
  c: "E5",
  v: "F5",
  b: "G5",
  n: "A5",
  m: "B5",

  // Octave 2 black keys
  1: "C#5",
  2: "D#5",
  3: "F#5",
  4: "G#5",
  5: "A#5"
};

/* -----------------------------------------
   LESSON MELODY (Twinkle Twinkle, first phrase)
   durations are in seconds
------------------------------------------ */

const lessonMelody = [
  { note: "C4", duration: 0.5 },
  { note: "C4", duration: 0.5 },
  { note: "G4", duration: 0.5 },
  { note: "G4", duration: 0.5 },
  { note: "A4", duration: 0.5 },
  { note: "A4", duration: 0.5 },
  { note: "G4", duration: 1.0 },

  { note: "F4", duration: 0.5 },
  { note: "F4", duration: 0.5 },
  { note: "E4", duration: 0.5 },
  { note: "E4", duration: 0.5 },
  { note: "D4", duration: 0.5 },
  { note: "D4", duration: 0.5 },
  { note: "C4", duration: 1.0 }
];

/* -----------------------------------------
   DOM ELEMENTS
------------------------------------------ */

const statusEl = document.getElementById("status");
const recordBtn = document.getElementById("recordBtn");
const stopRecordBtn = document.getElementById("stopRecordBtn");
const playBtn = document.getElementById("playBtn");
const sustainBtn = document.getElementById("sustainBtn");
const loopToggle = document.getElementById("loopToggle");
const speedSlider = document.getElementById("speedSlider");
const speedLabel = document.getElementById("speedLabel");
const soundTypeSelect = document.getElementById("soundType");
const lessonBtn = document.getElementById("lessonBtn");

/* -----------------------------------------
   SMALL HELPERS
------------------------------------------ */

// Update status text
function setStatus(text) {
  if (statusEl) statusEl.textContent = text;
}

// Get key element by note (e.g., "C4")
function getKeyElementByNote(note) {
  return document.querySelector(`.key[data-note="${note}"]`);
}

/* -----------------------------------------
   SUSTAIN HANDLING
------------------------------------------ */

// Apply sustain on/off and update button UI
function setSustain(on) {
  sustainOn = on;

  // If turning sustain OFF: release all sustained notes now
  if (!sustainOn) {
    sustainedNotes.forEach((note) => {
      stopNote(note); // actually stop audio + recording
    });
    sustainedNotes.clear();
  }

  sustainBtn.textContent = sustainOn ? "Sustain: On" : "Sustain: Off";
  sustainBtn.classList.toggle("active-btn", sustainOn);
}

// Called when user releases a note (mouse up, key up, etc.)
function handleNoteOff(note) {
  if (sustainOn) {
    // Don't stop yet, just remember this note as "sustained"
    sustainedNotes.add(note);
  } else {
    stopNote(note);
  }
}

/* -----------------------------------------
   PLAY NOTE
------------------------------------------ */

function playNote(note, frequency) {
  // If this note is already playing, ignore duplicate start
  if (activeNotes[note]) return;

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  // Set waveform and pitch
  osc.type = currentWaveType;
  osc.frequency.value = frequency;

  const now = audioCtx.currentTime;

  // Basic plucky envelope:
  // - start very quiet
  // - fast attack to a high volume
  // - decay to a lower volume
  gain.gain.setValueAtTime(0.0001, now);
  gain.gain.exponentialRampToValueAtTime(0.6, now + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.15, now + 0.25);

  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start(now);

  activeNotes[note] = { osc, gain };

  // If we are recording, remember when this note started
  if (isRecording && noteOnTimes[note] == null) {
    noteOnTimes[note] = audioCtx.currentTime - recordStartTime;
  }

  // Add visual "pressed" state
  const keyEl = getKeyElementByNote(note);
  if (keyEl) keyEl.classList.add("active");
}

/* -----------------------------------------
   STOP NOTE
------------------------------------------ */

function stopNote(note) {
  const playing = activeNotes[note];
  if (!playing) return;

  const { osc, gain } = playing;
  const now = audioCtx.currentTime;

  // Release envelope (fade out)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.1);
  osc.stop(now + 0.11);

  delete activeNotes[note];

  // If recording, compute this note's duration and save to recordedNotes
  if (isRecording && noteOnTimes[note] != null) {
    const start = noteOnTimes[note];
    const end = audioCtx.currentTime - recordStartTime;
    const duration = Math.max(0.05, end - start);

    const keyEl = getKeyElementByNote(note);
    const frequency = keyEl ? parseFloat(keyEl.dataset.frequency) : null;

    if (frequency) {
      recordedNotes.push({ note, frequency, start, duration });
    }

    delete noteOnTimes[note];
  }

  // Remove visual "pressed" state
  const keyEl = getKeyElementByNote(note);
  if (keyEl) keyEl.classList.remove("active");
}

/* -----------------------------------------
   MOUSE + TOUCH CONTROLS
------------------------------------------ */

function setupMouseAndTouchControls() {
  const keys = document.querySelectorAll(".key");

  keys.forEach((key) => {
    const note = key.dataset.note;
    const frequency = parseFloat(key.dataset.frequency);
    if (!note || isNaN(frequency)) return;

    // Mouse down -> start note
    key.addEventListener("mousedown", () => {
      if (audioCtx.state === "suspended") audioCtx.resume();
      playNote(note, frequency);
    });

    // Mouse up / leave -> stop or sustain note
    key.addEventListener("mouseup", () => handleNoteOff(note));
    key.addEventListener("mouseleave", () => handleNoteOff(note));

    // Touch events (for phones/tablets)
    key.addEventListener("touchstart", (event) => {
      event.preventDefault();
      if (audioCtx.state === "suspended") audioCtx.resume();
      playNote(note, frequency);
    });

    key.addEventListener("touchend", (event) => {
      event.preventDefault();
      handleNoteOff(note);
    });
  });
}

/* -----------------------------------------
   KEYBOARD CONTROLS
------------------------------------------ */

function setupKeyboardControls() {
  const pressedKeys = new Set();

  window.addEventListener("keydown", (event) => {
    const key = event.key;

    // Sustain pedal via Shift key
    if (key === "Shift") {
      setSustain(true);
      return;
    }

    const lower = key.toLowerCase();
    const note = keyboardToNote[lower];
    if (!note) return;

    // Prevent repeat if key is held down
    if (pressedKeys.has(lower)) return;
    pressedKeys.add(lower);

    const keyEl = getKeyElementByNote(note);
    if (!keyEl) return;

    const frequency = parseFloat(keyEl.dataset.frequency);
    if (isNaN(frequency)) return;

    if (audioCtx.state === "suspended") audioCtx.resume();
    playNote(note, frequency);
  });

  window.addEventListener("keyup", (event) => {
    const key = event.key;

    // Release sustain when Shift is released
    if (key === "Shift") {
      setSustain(false);
      return;
    }

    const lower = key.toLowerCase();
    const note = keyboardToNote[lower];
    if (!note) return;

    pressedKeys.delete(lower);
    handleNoteOff(note);
  });
}

/* -----------------------------------------
   RECORDING CONTROLS
------------------------------------------ */

function setupRecordingControls() {
  // Start recording
  recordBtn.addEventListener("click", () => {
    if (isPlayingBack) return;

    isRecording = true;
    recordedNotes = [];
    noteOnTimes = {};
    recordStartTime = audioCtx.currentTime;

    recordBtn.classList.add("active-btn");
    setStatus("Recording... Play your melody.");
  });

  // Stop recording
  stopRecordBtn.addEventListener("click", () => {
    if (!isRecording) return;

    // Finalize any notes that are still "on"
    const nowRel = audioCtx.currentTime - recordStartTime;

    for (const note in noteOnTimes) {
      const start = noteOnTimes[note];
      const duration = Math.max(0.05, nowRel - start);

      const keyEl = getKeyElementByNote(note);
      const frequency = keyEl ? parseFloat(keyEl.dataset.frequency) : null;
      if (frequency) {
        recordedNotes.push({ note, frequency, start, duration });
      }
    }

    noteOnTimes = {};
    isRecording = false;
    recordBtn.classList.remove("active-btn");

    if (recordedNotes.length === 0) {
      setStatus("Stopped. No notes recorded.");
    } else {
      setStatus(`Stopped. Recorded ${recordedNotes.length} notes.`);
    }
  });

  // Playback (with speed + loop support)
  playBtn.addEventListener("click", () => {
    if (isRecording) return;

    if (recordedNotes.length === 0) {
      setStatus("Nothing to play. Record something first.");
      return;
    }

    playRecordingOnce();
  });
}

/* -----------------------------------------
   PLAYBACK LOGIC (ONE CYCLE)
------------------------------------------ */

function playRecordingOnce() {
  if (recordedNotes.length === 0) return;

  if (audioCtx.state === "suspended") audioCtx.resume();

  isPlayingBack = true;
  playBtn.disabled = true;

  const speed = playbackSpeed;
  setStatus(loopEnabled ? `Playing (looping) at ${speed.toFixed(1)}x...` : `Playing at ${speed.toFixed(1)}x...`);

  // Schedule every note according to its start & duration
  recordedNotes.forEach((evt) => {
    const startDelayMs = (evt.start / speed) * 1000;
    const durationMs = (evt.duration / speed) * 1000;

    // Start note
    setTimeout(() => {
      playNote(evt.note, evt.frequency);
    }, startDelayMs);

    // Stop note (direct stopNote so sustain doesn't affect recording playback)
    setTimeout(() => {
      stopNote(evt.note);
    }, startDelayMs + durationMs);
  });

  // Figure out how long the whole recording lasts at this speed
  const maxEndTime = Math.max(...recordedNotes.map((evt) => evt.start + evt.duration));
  const totalMs = (maxEndTime / speed) * 1000 + 200;

  // When finished
  setTimeout(() => {
    isPlayingBack = false;
    playBtn.disabled = false;

    if (loopEnabled) {
      // If looping, immediately start again
      playRecordingOnce();
    } else {
      setStatus("Playback finished.");
    }
  }, totalMs);
}

/* -----------------------------------------
   SPEED + LOOP CONTROLS
------------------------------------------ */

function setupPlaybackOptions() {
  // Speed slider (0.5x – 1.5x)
  speedSlider.addEventListener("input", () => {
    playbackSpeed = parseFloat(speedSlider.value);
    if (isNaN(playbackSpeed)) playbackSpeed = 1;
    speedLabel.textContent = playbackSpeed.toFixed(1) + "x";
  });

  // Loop checkbox
  loopToggle.addEventListener("change", () => {
    loopEnabled = loopToggle.checked;
    setStatus(loopEnabled ? "Loop mode: ON" : "Loop mode: OFF");
  });
}

/* -----------------------------------------
   SOUND TYPE SELECTOR
------------------------------------------ */

function setupSoundSelector() {
  soundTypeSelect.addEventListener("change", () => {
    currentWaveType = soundTypeSelect.value;
    setStatus(`Sound type: ${currentWaveType}`);
  });
}

/* -----------------------------------------
   LESSON: Twinkle Twinkle
------------------------------------------ */

function setupLesson() {
  lessonBtn.addEventListener("click", () => {
    if (isRecording || isPlayingBack) return;

    if (audioCtx.state === "suspended") audioCtx.resume();

    setStatus("Lesson: Twinkle Twinkle Little Star (watch the keys!)");

    let currentTime = 0; // in seconds

    lessonMelody.forEach((step) => {
      const note = step.note;
      const duration = step.duration;
      const keyEl = getKeyElementByNote(note);
      const frequency = keyEl ? parseFloat(keyEl.dataset.frequency) : null;
      if (!frequency) return;

      const startDelayMs = currentTime * 1000;
      const endDelayMs = (currentTime + duration) * 1000;

      // Start the note
      setTimeout(() => {
        playNote(note, frequency);
      }, startDelayMs);

      // Stop the note
      setTimeout(() => {
        stopNote(note);
      }, endDelayMs);

      currentTime += duration;
    });

    // After lesson finishes
    setTimeout(() => {
      setStatus("Lesson finished. Try playing it yourself!");
    }, currentTime * 1000 + 200);
  });
}

/* -----------------------------------------
   INITIALIZE EVERYTHING
------------------------------------------ */

window.addEventListener("DOMContentLoaded", () => {
  setupMouseAndTouchControls();
  setupKeyboardControls();
  setupRecordingControls();
  setupPlaybackOptions();
  setupSoundSelector();
  setupLesson();

  setSustain(false); // ensure sustain starts OFF
  setStatus("Ready. Play notes or start recording.");
});
