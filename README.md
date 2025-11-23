# 🎹 Virtual Piano v2  
A 2-octave playable virtual piano built with **HTML + CSS + JavaScript**, featuring recording, playback, sustain pedal, speed control, loop mode, sound types, and a built-in music lesson.

---

## 🚀 Features

### 🎶 **Play the Piano**
- 2 full octaves (C4–B5)
- Play using **mouse**, **touch**, or **keyboard**
- Smooth animations + plucky sound

### ⌨ **Keyboard Controls**
| Note Range | Keys |
|-----------|------|
| White keys (C4–B4) | `A S D F G H J` |
| Black keys (C#4–A#4) | `W E T Y U` |
| White keys (C5–B5) | `Z X C V B N M` |
| Black keys (C#5–A#5) | `1 2 3 4 5` |
| Sustain Pedal | **Shift** |

---

## 🎛 Extra Controls

### 🔊 Sound Type
Choose between:
- **Plucky** (triangle)
- **Soft** (sine)
- **Chiptune** (square)
- **Bright** (sawtooth)

### 🎤 Recording Tools
- **Record** your melody  
- **Stop** to finish recording  
- **Play** to listen back  
- **Loop Mode** → repeat playback forever  
- **Speed Control** (0.5× to 1.5×)

### 🎹 Sustain Pedal
- Click **Sustain button**, or  
- Hold **Shift key**  
Released notes will keep ringing until sustain is turned off.

### 📚 Lesson Mode
Built-in tutorial song:
- **Twinkle Twinkle Little Star**  
The keys light up and play automatically so you can learn the melody.

---

## 📁 Folder Structure

virtual-piano/
│
├── index.html
├── style.css
├── script.js
└── README.md


---

## ▶ How to Run

### **Option 1 — Double Click**
Just open **index.html** in any browser:
- Chrome  
- Edge  
- Firefox  
- Safari  

### **Option 2 — Live Server (VS Code)**
1. Install the **Live Server** extension  
2. Right-click on `index.html`  
3. Click **“Open with Live Server”**

This gives auto-refresh and faster testing.

---

## 🧠 How It Works (Short Version)

- Uses **Web Audio API** for sound (oscillators + gain envelope)
- On key press:
  - Oscillator starts with a “plucky” envelope  
  - Key visually animates  
- Recording stores:
  - Note  
  - Frequency  
  - Start time  
  - Duration  
- Playback schedules notes using `setTimeout`  
- Sustain pedal delays note stopping
- Lesson mode plays a predefined melody array

---

## 🎯 Future Improvements (if you want to expand)

Some cool next-step ideas:
- Save recording as **WAV** or **MIDI**
- Add **more octaves**
- Add **metronome**
- Add **piano roll** visualization
- Add **animated particles** on key press
- Add **custom ADSR editor** (attack/decay/sustain/release sliders)
- Add **MIDI keyboard support**

---

## 👩‍💻 Credits
Built by **you** with help from ChatGPT.  
Free to modify, remix, and extend as much as you want.

Enjoy making music 🎵
