# SPECIFICATION: In-Browser Auto-Caption Studio (Spec-Driven Development)

**Document Version:** 1.0.0  
**Methodology:** AI Spec-Driven Development (SDD)  
**Target Platform:** Modern Web Browsers (Chrome, Edge, Safari, Firefox) via WebAssembly, WebGPU, Web Audio, and WebCodecs.  
**Execution Environment:** 100% Client-Side (Zero Server Ingestion, $0 Cloud Compute Cost).

---

## 1. Product Vision & Architecture Overview

The tool is an in-browser video editor specifically engineered for short-form content creators (TikTok, Instagram Reels, YouTube Shorts). It automatically generates animated, word-by-word synced karaoke captions and burns them into an exported MP4 video entirely inside the user's browser.

### High-Level Data Flow

```
[User Video File (.mp4/.webm/.mov)]
                │
                ├─────────────────────────────────────────────┐
                ▼                                             ▼
       [Video Element]                              [AudioContext Pipeline]
   (Decodes Video Frames)                        (Decodes audio to 16kHz mono)
                │                                             │
                │                                             ▼
                │                                     [Whisper Web Worker]
                │                                (WASM / WebGPU Transformers.js)
                │                                             │
                │                                             ▼
                │                                 [Word-Level Timestamps]
                │                                [{word, start, end, ...}]
                │                                             │
                ▼                                             ▼
        [Real-Time Canvas Compositor & Karaoke Style Engine]
        (Draws video frame + bouncers, outlines, active-word highlights)
                │
                ├─────────────────────────────────────────────┐
                ▼                                             ▼
       [Live Canvas Preview]                         [Hardware Video Exporter]
       (60 FPS user playback)                    (WebCodecs + mp4-muxer / MediaRecorder)
                                                              │
                                                              ▼
                                                     [Final Burned MP4]
```

---

## 2. Core Data Contracts & Schemas

### 2.1. Word Chunk Schema (`WordTimestamp`)
Every word recognized by the speech model conforms to this structure:
```typescript
interface WordTimestamp {
  id: string;            // Unique identifier (UUID or index-based)
  word: string;          // Recognized text (e.g. "EXPLODED")
  start: number;         // Start time in seconds (e.g. 1.24)
  end: number;           // End time in seconds (e.g. 1.62)
  confidence?: number;   // Probability score (0.0 to 1.0)
  emoji?: string;        // Auto-associated emoji (e.g. "💥")
}
```

### 2.2. Subtitle Phrase / Segment Schema (`SubtitleSegment`)
To match the fast, punchy pacing of modern Reels, raw words are chunked into short visual phrases (typically 2 to 4 words per frame):
```typescript
interface SubtitleSegment {
  id: string;
  start: number;         // Start time of the first word in the group
  end: number;           // End time of the last word in the group
  words: WordTimestamp[];// Words contained in this visual screen
}
```

### 2.3. Style Preset Configuration (`SubtitleStyleConfig`)
Defines the visual theme and animation behavior:
```typescript
interface SubtitleStyleConfig {
  presetName: 'hormozi' | 'mrbeast' | 'minimal' | 'terminal';
  fontFamily: string;
  fontSize: number;          // Scaled relative to video height
  fontWeight: string | number;
  textTransform: 'uppercase' | 'none' | 'capitalize';
  textColor: string;         // Default inactive word color
  activeWordColor: string;   // Active highlighted word color
  activeWordBgColor?: string;// Background pill/highlight color
  strokeColor: string;       // Text outline border color
  strokeWidth: number;       // Outline border thickness
  shadowColor: string;       // Drop shadow color
  shadowBlur: number;
  animationType: 'bounce' | 'pop' | 'glow' | 'none';
  positionYPercent: number;  // Vertical placement (0% = top, 100% = bottom, default ~75%)
}
```

---

## 3. Step-by-Step Implementation Phases

---

### Phase 1: Studio Workspace & Video Engine
**Goal**: Build a clean, responsive, dark-mode creator studio with high-performance video rendering and custom playback control.

* **1.1. Workspace Layout**:
  * **Top Bar**: Project title, file metadata, status badge (Ready / Transcribing / Exporting), Export button.
  * **Center Stage (Viewport)**: Aspect-ratio locked canvas container (supporting 9:16 vertical by default, as well as 16:9 and 1:1).
  * **Sidebar (Right)**: Two tabs:
    1. *Style & Presets*: 1-click viral themes, color pickers, font selector, size & position sliders.
    2. *Transcript Editor*: Synchronized word list with click-to-seek, typo correction, and timestamp adjustment.
  * **Bottom Bar**: Custom scrubber timeline with Play/Pause button, current time / total duration counter, and seek slider.
* **1.2. Video Loading Pipeline**:
  * Drag-and-drop zone + file picker accepting `.mp4`, `.mov`, `.webm`.
  * Create `URL.createObjectURL(file)` to load into a hidden `<video>` element.
  * Extract metadata: `duration`, `videoWidth`, `videoHeight`, `aspectRatio`.
  * Bind canvas resolution dynamically to match video dimensions.

---

### Phase 2: Audio Extraction & In-Browser Whisper Pipeline
**Goal**: Extract raw audio, resample to 16kHz mono, and pass to a non-blocking Web Worker running Whisper with word-level timestamps.

* **2.1. Audio Pipeline**:
  * Read file buffer via `file.arrayBuffer()`.
  * Instantiate an offline or online `AudioContext` (`sampleRate: 16000`).
  * Decode audio using `audioContext.decodeAudioData(arrayBuffer)`.
  * Extract channel 0 (mono). If stereo, downmix by averaging left and right channels:
    $$\text{mono}[i] = \frac{\text{left}[i] + \text{right}[i]}{2}$$
  * Verify output is a valid `Float32Array` normalized between $[-1.0, 1.0]$.
* **2.2. Web Worker Isolation (`transcriber.worker.js`)**:
  * Prevents UI stutter during speech processing.
  * Communicates via structured message passing:
    * `IN: { type: 'LOAD_MODEL', model: 'Xenova/whisper-tiny.en' }`
    * `OUT: { type: 'PROGRESS', status: 'downloading', percent: 45 }`
    * `IN: { type: 'TRANSCRIBE', audioData: Float32Array }`
    * `OUT: { type: 'RESULT', chunks: WordTimestamp[] }`
* **2.3. Inference Engine**:
  * Uses `@xenova/transformers` (Transformers.js) backed by `onnxruntime-web` (WebGPU / WASM SIMD).
  * Configuration:
    ```javascript
    const pipeline = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en', {
      device: 'webgpu' // Auto-fallbacks to 'wasm' if WebGPU unsupported
    });
    const output = await pipeline(audioData, {
      return_timestamps: 'word',
      chunk_length_s: 30,
      stride_length_s: 5
    });
    ```
  * Caches model weights permanently in browser `CacheStorage` / `IndexedDB` so subsequent runs require zero downloads.
  * Provide fallback demo sample transcript for instant testing without waiting for download.

---

### Phase 3: Real-Time Subtitle Animation Engine
**Goal**: Render viral, frame-synced, word-by-word animated captions onto the HTML5 Canvas during video playback.

* **3.1. Word Chunking Algorithm**:
  * Group individual words into short phrases (max 3–4 words or ~1.5s per subtitle card) to prevent screen clutter and maximize viewer retention.
* **3.2. Synchronized Drawing Loop**:
  * Hooked into `requestAnimationFrame` and `<video>` `timeupdate`.
  * Determine the current active segment: $\text{segment.start} \le \text{currentTime} \le \text{segment.end}$.
  * Determine the active word index: $\text{word.start} \le \text{currentTime} \le \text{word.end}$.
* **3.3. Canvas Typography & Vector Rendering**:
  * Center-align text at `styleConfig.positionYPercent`.
  * Draw heavy outer stroke: `ctx.strokeText()` with `lineWidth = 8` to `12` (black outline ensures readability over any video background).
  * Draw inner fill: `ctx.fillText()` using inactive color (white).
  * Draw active word: Highlight in bright yellow/green/cyan with scale transform ($1.15\times$) for a physical bounce effect.
* **3.4. Preset Specifications**:
  * **Hormozi**: All-caps, bold sans-serif, active word in `#00FF66` (Lime) or `#FFE600` (Yellow), heavy black border (10px), pop animation.
  * **MrBeast**: Rotated tilt ($-3^\circ$), comic font, bright red/yellow highlight, bounce on entry.
  * **Minimalist**: Clean modern sans-serif (Inter / Helvetica), clean white text, subtle semi-transparent black pill box background.
  * **Terminal/Cyber**: JetBrains Mono, all-caps, neon green glow with subtle scanlines.

---

### Phase 4: Interactive Transcript Editor
**Goal**: Provide creators with instant control to edit typos, tweak timings, and customize styles.

* **4.1. Two-Way Sync**:
  * Clicking any word in the transcript sidebar immediately seeks the video to that exact timestamp:
    $$\text{video.currentTime} = \text{word.start}$$
  * As the video plays, the sidebar auto-scrolls to keep the active word visible with an active highlight indicator.
* **4.2. In-Line Editing**:
  * Editable text inputs for each word. Editing immediately updates the canvas render.
  * Add / delete word triggers.
  * Timestamp fine-tuner: $+/- 0.1\text{s}$ buttons to nudge word start/end times.
* **4.3. Auto-Emoji Injector**:
  * Dictionary matching popular spoken keywords to emojis (e.g. "money" $\to$ 💸, "fire" $\to$ 🔥, "growth" $\to$ 📈, "stop" $\to$ 🛑).
  * Option to toggle emojis on or off.

---

### Phase 5: Client-Side Hardware Video Compositor & Export Engine
**Goal**: Burn canvas subtitles onto video frames and export a pristine MP4 file with the original audio track without a backend server.

* **5.1. Dual-Path Export Strategy**:
  * **Primary (Modern WebCodecs + `mp4-muxer`)**:
    * Reads raw frames via `VideoFrame` API from video.
    * Draws frame to offscreen canvas + draws subtitle layer.
    * Encodes via `VideoEncoder` (hardware accelerated H.264 / AVC).
    * Multiplexes audio and video tracks into standard MP4 via `mp4-muxer`.
    * Advantage: Renders at up to $3\times$–$5\times$ real-time speed!
  * **Fallback (`canvas.captureStream` + `MediaRecorder`)**:
    * Universal compatibility fallback.
    * Plays video at $1\times$ speed, records canvas stream + audio stream, outputs `.webm` or `.mp4`.
* **5.2. Download Manager**:
  * Creates `Blob` from muxed buffer.
  * Generates auto-download anchor: `<a download="captioned_video.mp4">`.
  * Shows export completion modal with file size, duration, and replay option.

---

## 4. Performance & Reliability Guardrails

1. **Non-Blocking UI**: Audio decoding and AI inference MUST occur inside Web Workers or background async promises. The main thread must never drop below 50 FPS.
2. **Memory Safety**: Canvas buffers and video frame objects must be explicitly closed/released (`frame.close()`) to prevent browser tab memory exhaustion on videos up to 60 seconds.
3. **Responsive Scaling**: All font sizes, stroke widths, and text bounds must be calculated relative to `canvas.height` and `canvas.width` (so an exported 1080x1920 video looks visually identical to the 360x640 preview player).
4. **Offline Capability**: Once the initial model is cached, the entire studio must function 100% offline with no internet access.

---

## 5. Verification & Acceptance Criteria

- [ ] **AC-1**: Dragging an `.mp4` loads video metadata and renders the initial frame within 500ms.
- [ ] **AC-2**: Audio is extracted and resampled to 16,000Hz mono `Float32Array`.
- [ ] **AC-3**: Speech transcription generates word-level timestamps with $< 15\%$ Word Error Rate on clear speech.
- [ ] **AC-4**: Subtitles play in frame-accurate sync with video playback across all 4 style presets.
- [ ] **AC-5**: Clicking a word in the transcript sidebar jumps playback to the exact word start time.
- [ ] **AC-6**: Export button burns the composite canvas and original audio into a playable video file downloadable to disk with zero server roundtrips.

