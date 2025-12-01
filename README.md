# Virtual Piano 🎹

A small 2-octave virtual piano implemented using Web Audio and vanilla JavaScript.

This is a client-side project that runs in the browser — no build step required. The UI includes a visual piano keyboard, keyboard/mouse/touch input, recording & playback with loop and speed options, sustain pedal, selectable waveform sounds, and a small lesson mode (Twinkle Twinkle Little Star).

---

## Demo / Quick Start

- Open `index.html` in your browser (double-click the file in your file manager), or start a simple HTTP server and browse to `http://localhost:8000`.

  - For a quick local server (Python 3):
    ```powershell
    cd path\to\piano
    python -m http.server 8000
    ```
  - In VS Code, the "Live Server" extension will also serve the `index.html` from the workspace root.

---

## Features ✅

- 2 octaves (C4–B5) — both white and black keys
- Mouse / touch / keyboard controls
- Web Audio-based synthesizer with plucky envelope
- Selectable waveform types: Plucky (triangle), Sine, Square, Sawtooth
- Record and play back your performance
- Loop playback and adjustable speed (0.5x–1.5x)
- Sustain pedal (Shift key or the "Sustain" button)
- Small lesson that highlights keys and plays the first phrase of "Twinkle Twinkle" 🎵

---

## Controls & Keyboard Mapping 🔧

Buttons & UI:
- Record: Click to start recording, play whatever you like — recorded notes are saved until you record again
- Stop: Stops recording and finalizes the recorded notes
- Play: plays back the last recorded performance
- Sustain: toggles sustain on/off. While sustain is on, released notes ring until sustain is turned off
- Loop checkbox: Play recorded performance in a loop
- Speed: Slider to set playback speed (0.5x–1.5x)
- Sound: Select waveform type
- Lesson: Plays and highlights the Twinkle Twinkle melody

Keyboard to note mapping:

- Octave 1 (C4–B4, white keys) – A S D F G H J
  - A → C4
  - S → D4
  - D → E4
  - F → F4
  - G → G4
  - H → A4
  - J → B4

- Octave 1 black keys – W, E, T, Y, U
  - W → C#4
  - E → D#4
  - T → F#4
  - Y → G#4
  - U → A#4

- Octave 2 (C5–B5, white keys) – Z X C V B N M
  - Z → C5
  - X → D5
  - C → E5
  - V → F5
  - B → G5
  - N → A5
  - M → B5

- Octave 2 black keys – 1 2 3 4 5
  - 1 → C#5
  - 2 → D#5
  - 3 → F#5
  - 4 → G#5
  - 5 → A#5

Sustain Pedal
- Hold the `Shift` key or click the `Sustain` button in the UI to turn on sustain. When sustain is off, notes released while sustain was on will stop immediately.

---

## How Recording Works 📼

- Hit record to start capturing events. Notes you play will be stored with their start time and durations (relative to the recording start).
- Press stop to finalize the recording. Use Play to replay the performance.
- Playback respects the `Speed` slider and `Loop` setting. Sustain is ignored for playback (notes are scheduled programmatically).

---

## Code Overview 🧭

- `index.html` – basic HTML structure and keyboard layout markup
- `style.css` – CSS for layout, color and responsive tweaks
- `script.js` – main app logic
  - WebAudio creation and envelope handling
  - Input handling (mouse, touch, and keyboard)
  - Recording/playback and loop/speed controls
  - Lesson playback

Key points inside `script.js`:
- The audio context is created at the top and resumed on user interaction: `new AudioContext()` and `audioCtx.resume()`.
- Active notes are tracked in `activeNotes` (hold oscillator `osc` and `gain`).
- Recording stores events in `recordedNotes` using `audioCtx.currentTime` to calculate timings.
- The lesson uses a small `lessonMelody` array for demo playback.

---

## Development / Contributing 🤝

- Fork and create a PR with features, bugfixes, or improvements
- To try local changes quickly:
  1. Edit `script.js`, `style.css`, or `index.html`
  2. Serve the project via `Live Server` (VS Code) or `python -m http.server` and test in a browser

Suggested improvements:
- Add a Metronome / tempo control
- Add more lessons and a scoring / practice mode
- Add MIDI input/output support
- Add export/import of recordings

---

## Known Limitations ⚠️

- The UI is built for two octaves and has a fixed keyboard layout for the controls. There’s no persistence (recordings aren't saved by default).
- This project uses a simple bank of waveform types and a basic ADSR-like envelope. Synth improvements may yield more realistic piano sounds.

---

## License

Include a license of your choice (e.g., `MIT`) and optionally add a `LICENSE` file to this repo.

---

## Credits

- Built by you & ChatGPT — a minimal learning project to explore WebAudio, DOM events, and browser input APIs.

If you'd like, I can add a sample `LICENSE` file (MIT), or add a few suggested improvements such as adding MIDI input or exporting recorded audio. Just tell me what you'd like next!
# piano
piano
