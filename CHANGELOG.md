# Changelog

All notable changes to **AutoCaption Studio** are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- **Unified Dark Studio Monitor**: Integrated 9:16 vertical pro player monitor (`.studio-monitor-frame`).
  - Docked top action bar with `[ ↺ Replace ]` video shortcut and real-time resolution badge (`1080×1920`, `720×1280`, etc.).
  - Docked bottom playback bar with play/pause, volume toggle, formatted timecode display, precision scrubber, seamless loop toggle, and fullscreen trigger.
- **Permanent Video & Canvas DOM Mount**: Maintained persistent `<video>` and `<canvas>` element lifecycles inside the studio monitor (hidden via CSS when inactive), preventing video context drops, decoder detachment, or blank screen issues upon loading new videos.

### Removed
- **Safe Zone Overlay & Visual Noise**: Removed platform safe-zone wireframes, green danger shades, and orange subtitle bounding box to maintain a clean, distraction-free video editing workspace.

---

## [1.0.0] - 2026-11-22

### Added
- **Groq Whisper Large v3 Cloud Engine**:
  - Integrated Groq Cloud API for lightning-fast speech-to-text inference (< 1.5s per minute of video).
  - Added support for Groq API keys stored securely in browser `localStorage`.
  - Added live Quota & Usage Monitor tracking Request-Per-Minute (RPM) and Token-Per-Minute (TPM) limits with automatic visual meters.
- **Dedicated Full-Page Settings & AI Quota View**:
  - Replaced modal popup with a dedicated, tabbed Settings page (`#settings`).
  - Added real-time API connection tester, quota consumption gauges, and storage management tools.
- **Smart Hinglish Code-Switching Engine**:
  - Natural Indian phonetic transliteration engine converting Devanagari Whisper tokens into Latin-script Hinglish (e.g., *“aaj hum baat karenge”*).
  - 500+ Indian word dictionary and loanword protection preserving English words (e.g. *“evolution”*, *“subscribe”*, *“video”*).
  - Perso-Arabic / Urdu script normalization filter preventing incorrect Urdu alphabet rendering.
- **Script Switcher**:
  - Dynamic runtime switcher enabling creators to toggle subtitles between **Latin Hinglish**, **Devanagari Hindi**, and **English** on the fly without re-transcribing.
- **Offline / Local AI Transcription**:
  - 39MB quantized Whisper base model running client-side via Transformers.js with WebGPU and WASM hardware acceleration.
- **AI Person Segmentation (Behind-Person Captions)**:
  - Real-time video depth layering using MediaPipe Selfie Multiclass model (`selfie_multiclass_256x256`), rendering captions behind the speaker.
- **Silence & Dead-Air Remover**:
  - Automatic detection of speech pauses ($\Delta t > 0.4\text{s}$) with automated jump-cut playback and export.
- **Cross-Platform Architectures**:
  - Desktop integration with **Tauri v2** (Rust backend + Webview).
  - Mobile Android project structure configured with **Capacitor 8**.
- **Modern Clean UI**:
  - Clean black & white design system with responsive typography, dark timeline editor, and collapsible sidebar panels.

### Changed
- Replaced ambiguous model selection text and emoji clutter with clear, modern language selectors (English vs Hinglish vs Hindi).
- Streamlined video onboarding: language selection prompt appears cleanly right after video drop.

---

## [0.1.0] - 2026-11-20

### Added
- Initial project scaffolding with Vite 6, React 19, and TypeScript 5.
- Real-time 60 FPS HTML5 Canvas rendering loop decoupled from React state updates.
- 24 built-in typography animation presets (Hormozi, MrBeast, Behind Person, Liquid Glass, Editorial Stack, etc.).
- Audio extraction using Web Audio API (`OfflineAudioContext`) downsampling to 16 kHz mono WAV for speech inference.

