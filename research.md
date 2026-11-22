# AutoCaption Studio • Research & Architecture Notes

**Document Version:** 1.0.0  
**Focus:** Client-Side Video Captions, Model Economics, In-Browser AI Performance & Zero-Cost Architecture.

---

## 1. Product Mission & Philosophy

- **Goal:** A 100% free, unlimited, zero-subscription video caption studio for short-form content creators (TikTok, Instagram Reels, YouTube Shorts).
- **Inspiration:** Following the **OBS Studio / Blender / HandBrake model** — sovereign, private, client-first creator software with $0 cloud infrastructure bills for the maintainer.
- **Key Creator Value:**
  - Fast, punchy kinetic captions with 24 viral templates (Hormozi, MrBeast, Behind Person, Liquid Glass, etc.).
  - Automatic silence / dead-air remover (auto jump-cutter).
  - Natural Devanagari-to-Hinglish transliteration for bilingual creators.
  - 100% video privacy (no video uploads to third-party servers).

---

## 2. Model Economics & Architecture (OpenAI Whisper)

### 2.1. English-Only vs. Multilingual Models
OpenAI trained two families of Whisper models:
1. **English-Only (`.en`)**: `tiny.en` (~39MB), `base.en` (~74MB), `small.en` (~244MB). All non-English languages and tokens were stripped out, producing hyper-compressed, fast models.
2. **Multilingual (99 Languages)**: Every other language (Hindi, Spanish, German, Japanese, Bengali, etc.) shares the exact same multilingual model weights. There is **no official `.hi` or single-language model for Hindi**.

### 2.2. Supported Languages in the Multilingual Model (75MB / 190MB)
A single multilingual checkpoint (`whisper-base` or `whisper-small`) recognizes **99 languages**, including:
- **South Asian:** Hindi, Bengali, Tamil, Telugu, Marathi, Gujarati, Urdu, Malayalam, Kannada, Punjabi, Nepali, Sanskrit.
- **Global:** Spanish, French, German, Portuguese, Italian, Russian, Mandarin Chinese, Japanese, Korean, Arabic, Turkish, Vietnamese, Indonesian, Thai, Dutch, Polish, etc.

### 2.3. Model Comparison Matrix

| Model Identifier | Quantized Disk Size | In-Browser RAM | Parameters | Hindi / Hinglish Accuracy | Latency (60s Audio, CPU) | Recommended Use Case |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **`whisper-tiny.en`** | ~39 MB | ~180 MB | 39 Million | **N/A (English Only)** | ~8 – 15s | English-only videos |
| **`whisper-tiny`** *(multilingual)* | ~39 MB | ~200 MB | 39 Million | **Very Poor (~60%+ WER)** | ~10 – 18s | Not recommended (hallucinates on Hindi/Hinglish) |
| **`whisper-base`** *(multilingual)* | **~75 MB** | **~350 MB** | **74 Million** | **Good (Usable on clear speech)** | **~18 – 35s** | **Default recommended balance for general creators** |
| **`whisper-small`** *(multilingual)* | **~190 MB** | **~1.2 GB** | **244 Million** | **Excellent (Handles slang, noise, heavy accents)** | **~45 – 90s** | **High-precision mode (Requires modern PC / 8GB+ RAM)** |

> [!IMPORTANT]
> Why not use multilingual `whisper-tiny` (~39MB) for Hindi?  
> In official OpenAI benchmarks, `whisper-tiny` has an error rate exceeding 60% on Hindi and completely butchers mixed Hinglish words (e.g. *"video"*, *"subscribe"*, *"reel"*). **`whisper-base` (~75MB) is the absolute minimum viable model size** for usable Hindi/Hinglish speech recognition.

---

## 3. Root Cause Analysis: Why In-Browser AI Freezes / Lags

When testing `whisper-small` (~190MB) in a web browser, users experience significant lag or browser freezes. This is caused by three hardware and runtime bottlenecks:

### 3.1. Memory Explosion (RAM Inflation & GC Pauses)
- A 190MB ONNX quantized model file on disk expands to **800MB – 1.5GB of uncompressed tensor buffers** in system RAM once loaded into ONNX Runtime Web.
- Chromium V8 and WebAssembly memory heaps spike, triggering aggressive **Garbage Collection (GC)** cycles that halt the main execution thread for several hundred milliseconds at a time.

### 3.2. CPU Thread Starvation (100% Core Pegging)
- In CPU WebAssembly mode, ONNX Runtime Web detects hardware concurrency (`navigator.hardwareConcurrency`) and spawns worker threads equal to all available CPU cores.
- All cores are pegged at **100% utilization** during model compilation and token generation.
- Because all cores are saturated, the browser’s **main UI thread, DOM renderer, and mouse/touch event loops are starved of CPU time**, making the browser window appear frozen or unresponsive.

### 3.3. Real-World Hardware Disparity Risk
- High-end developer machines (e.g. Apple Silicon M-series, RTX gaming PCs) run in-browser models relatively well.
- However, creators on **budget laptops ($300, 4GB–8GB RAM, dual-core Intel/AMD CPUs)** or mobile devices face tab crashes (Out-Of-Memory errors) and browser freezes, leading to negative reviews.

---

## 4. Cloud Transcription Economics (Groq vs. Competitors)

For comparison, if transcription is offloaded to modern ultra-fast cloud inference APIs:

### 4.1. Groq Cloud Whisper (`whisper-large-v3`)
- **Official Rate:** **\$0.111 per hour** of audio (\$0.00185 per minute, or ~\$0.0000308 per second).
- **Hardware:** Custom Groq LPU (Language Processing Unit) chips running at ~216× real-time speed.
- **Latency:** A 60-second video transcribes in **~0.8 seconds**.

#### Volume Math for \$1.00 on Groq:
| Video / Reel Length | API Cost per Video | Videos Transcribed for **\$1.00** | Videos Transcribed for **\$5.00** |
| :--- | :--- | :--- | :--- |
| **30-second Reel** | **\$0.0009** (< 0.1¢) | **~1,080 Reels** | **~5,400 Reels** |
| **60-second Reel** | **\$0.00185** (< 0.2¢) | **~540 Reels** | **~2,700 Reels** |
| **90-second Reel** | **\$0.00277** (~0.28¢) | **~360 Reels** | **~1,800 Reels** |

### 4.2. Industry Cost & Speed Comparison (60-second Reel)

| Provider | Model | Cost / 60s Reel | 60s Reels per \$1.00 | Speed | Reliability Across Devices |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Groq Cloud** | `whisper-large-v3` | **\$0.00185** | **~540** | **~0.8s** | 100% (Any device, even \$50 phone) |
| **Deepgram** | Nova-2 Multilingual | **\$0.00430** | **~230** | **~1.2s** | 100% |
| **OpenAI Direct** | `whisper-1` | **\$0.00600** | **~166** | **~3.5s** | 100% |
| **In-Browser (Current)** | `whisper-base` / `small` | **\$0.00000** | **Unlimited** | **20s – 60s** | Variable (Depends on user hardware) |

---

## 5. Technical Blueprint: "Zero-Cost, Zero-Lag" In-Browser Architecture

To preserve the **100% Free Forever ($0 Server Cost)** model while eliminating browser lag and crashes, the following optimizations should be implemented:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AutoCaption Studio Engine                       │
└────────────────────────────────────────────────────────────────────────┘
                                    │
           ┌────────────────────────┴────────────────────────┐
           ▼                                                 ▼
   [In-Browser Local Mode]                           [Turbo Mode (BYOK)]
   - Cost to maintainer: $0.00                       - Cost to maintainer: $0.00
   - Cost to user: $0.00                             - Cost to user: $0.00 (Groq Free Tier)
   - Works offline                                   - Speed: ~0.8s latency
   - WebGPU GPU acceleration                        - whisper-large-v3 model
   - CPU Thread Capping (UI never freezes)           - User pastes their free API key
   - Default: Whisper Base (75MB)
```

### 5.1. Optimization 1: WebGPU Acceleration (`device: 'webgpu'`)
- Modern browsers (Chrome 113+, Edge, Brave, Arc) support **WebGPU**.
- Passing `device: 'webgpu'` to `@huggingface/transformers` moves tensor multiplication from the CPU to the user's integrated or dedicated GPU.
- **Benefit:** CPU utilization drops to **< 5%**, leaving the browser completely fluid, and inference speed increases by **5× to 10×**.

### 5.2. Optimization 2: CPU Thread Throttling & UI Core Reservation
- For devices without WebGPU falling back to CPU WebAssembly:
  ```typescript
  // In transcriber.worker.ts:
  // Never consume 100% of CPU cores. Always leave 1-2 cores free for the browser UI.
  const totalCores = navigator.hardwareConcurrency || 4;
  const safeWorkerThreads = Math.max(1, Math.min(4, totalCores - 2));
  ```
- **Benefit:** Prevents mouse lag, video stuttering, and OS-level window freezes during transcription.

### 5.3. Optimization 3: Model Tiering & Memory Guardrails
- **Default:** Keep **Whisper Base (~75MB)** as the primary recommended model for Hinglish and multilingual videos.
- **Labeling:** Clearly mark Whisper Small (~190MB) as *"High Precision (Recommended for 8GB+ RAM & Dedicated GPU)"*.

### 5.4. Optimization 4: Optional BYOK (Bring Your Own Key) Turbo Mode
- Groq offers a **permanent free tier** with thousands of free audio minutes per month.
- Users can optionally paste their free Groq API key in Studio Settings to get instant 0.8-second transcription with zero download, while maintaining $0 cost for the app creator.

---

## 6. Cross-Platform Native Architecture (Desktop + Android)

The project now supports a unified **"Write Once, Run Everywhere"** architecture:

```
                      [React 19 + Canvas 2D Engine]
                    (24 Presets, Hinglish, Jumpcuts)
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
[Web Application]          [Native Desktop App]         [Native Android App]
- Pure static assets       - Powered by Tauri v2        - Powered by Capacitor
- Vite / Cloudflare / Edge - Windows (.exe), Mac (.dmg) - Android Studio (.apk / .aab)
- Zero install             - Ultra-lightweight (~15MB)  - Native phone touch controls
```

### 6.1. Android Native Project Structure
- Configured in [capacitor.config.ts](file:///home/alok/All%20projects/Personal%20Project/autocaption/capacitor.config.ts) (`appId: 'com.autocaption.app'`).
- Native Android Gradle project located in [android/](file:///home/alok/All%20projects/Personal%20Project/autocaption/android).
- Pre-built with native mobile video-editor UX:
  - Big vertical 9:16 preview.
  - Bottom touch icon dock.
  - Horizontal swipeable trays for Templates, Style, Motion, and Text.
  - Touch-friendly scrubber bar.

### 6.2. Workflow Commands for Android
| Command | Action |
| :--- | :--- |
| `npm run android:sync` | Builds Vite assets and copies them directly into the Android native assets |
| `npm run android:open` | Opens the `android/` directory in Android Studio to build APK or run on connected device |

---

## 7. Summary Checklist for Implementation

- [x] Configure WebGPU delegate & CPU thread throttling in `src/core/transcriber.worker.ts`.
- [x] Initialize Tauri v2 native desktop structure in `src-tauri/`.
- [x] Initialize native Android project structure in `android/`.
- [x] Add automated build and sync scripts in `package.json`.


