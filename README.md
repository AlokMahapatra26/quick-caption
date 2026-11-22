# AutoCaption Studio 🎬

> **100% Free, Unlimited, Client-Side Kinetic Video Captions & Editor**  
> Run directly in modern web browsers, on native desktop (macOS, Windows, Linux via Tauri), and mobile (Android via Capacitor) with **$0 cloud compute costs**.

---

## ✨ Features

- **24 Viral Creator Presets**: Inspired by Hormozi, MrBeast, Behind Person (depth layering), Liquid Glass, Ali Pill, Editorial Stack, Chrome, Scribble, Kinetic Blur, and more.
- **Smart Silence & Dead-Air Remover**: Automatically detects pauses ($\Delta t > 0.4\text{s}$) from speech timestamps and jump-cuts them during playback and export.
- **Natural Hinglish Transliteration**: Built-in 500+ word dictionary and phonetic parser converting Whisper Devanagari output into natural spoken Latin-script Hinglish.
- **AI Person Segmentation (Depth Layering)**: Powered by MediaPipe Vision (`selfie_multiclass_256x256`), allowing animated subtitles to be layered *behind* the speaker in real-time.
- **Kinetic Animations & Transitions**: Full control over In (bounce, pop, slide, slam), Hold (pulse, float, wobble, jello), and Out transition phases.
- **Hardware-Accelerated 60 FPS Engine**: Decoupled Canvas 2D engine running outside of React renders to eliminate frame drops and garbage collection pauses.
- **Zero Cloud / 100% Privacy**: Video files never leave your device. All AI inference (Whisper STT, MediaPipe segmentation) executes 100% locally.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Modern web browser (Chrome, Edge, Brave, or Arc recommended for WebGPU / MediaRecorder acceleration)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
Open **[http://localhost:5173](http://localhost:5173)** in your browser.

> **Tip:** You don't need a video file right away. Click **"Load Demo Video"** in the stage to generate an in-browser synthetic video with synced audio and test immediately!

---

## 📱 Cross-Platform Support

This single repository targets **Web**, **Desktop**, and **Mobile Android**:

| Platform | Technology | How to Run / Build |
| :--- | :--- | :--- |
| **Web Browser** | React 19 + Vite 6 | `npm run dev` (dev) or `npm run build` (prod) |
| **Desktop (Win/Mac/Linux)** | [Tauri v2](https://v2.tauri.app/) (Rust + OS Webview) | `npm run tauri dev` |
| **Mobile Android** | [Capacitor](https://capacitorjs.com/) | `npm run android:sync` (build & sync to [android/](file:///home/alok/All%20projects/Personal%20Project/autocaption/android)) |

---

## 🛠️ Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts the Vite local development server |
| `npm run build` | Runs TypeScript checks (`tsc -b`) and produces production bundle in `dist/` |
| `npm run preview` | Locally serves the production `dist/` bundle |
| `npm run typecheck` | Validates TypeScript types across the entire project without emitting files |
| `npm run tauri dev` | Launches the native desktop window via Tauri v2 |
| `npm run android:sync` | Builds the frontend and syncs all assets into the native Android project |
| `npm run android:open` | Opens the `android/` directory in Android Studio |

---

## 📂 Project Structure

```
autocaption/
├── android/                 # Native Android Studio project (Capacitor)
├── src-tauri/               # Native desktop app configurations & Rust backend (Tauri v2)
├── src/
│   ├── components/          # Modular UI components (Topbar, VideoStage, Sidebar, Panels)
│   ├── core/                # Pure TypeScript engines (zero-React 60fps canvas, Whisper worker, MediaPipe)
│   │   ├── subtitleEngine.ts    # 60fps Canvas 2D subtitle compositor & 24 presets
│   │   ├── transcriber.worker.ts# Local Whisper worker with WebGPU & thread capping
│   │   ├── hinglish.ts          # Devanagari-to-Hinglish dictionary & phonetic transliterator
│   │   ├── silenceDetector.ts   # Smart dead-air jump-cutter
│   │   ├── personSegmenter.ts   # MediaPipe selfie depth segmentation
│   │   ├── transitions.ts       # Kinetic animation math & easing
│   │   └── exporter.ts          # Client-side video + audio stream recorder
│   ├── hooks/               # useStudioController orchestration hook
│   ├── styles/              # studio.css with responsive mobile dock
│   └── types/               # TypeScript interfaces & data contracts
├── research.md              # In-depth research on models, WebGPU, and cloud economics
├── SPEC.md                  # Spec-Driven Development architectural specifications
└── DESIGN.md                # Design language and typography guidelines
```

---

## 🔒 Privacy Guarantee

AutoCaption Studio does not transmit your video, audio, or metadata to any remote server. Everything is decoded, transcribed, composited, and exported completely inside your local hardware environment.

---

## 📄 License

MIT
